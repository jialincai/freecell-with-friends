import * as Phaser from "phaser";

import {
  getHexColorString,
  PubSubStack,
  AsyncQueue,
  dateToSeed,
} from "@utils/Function";
import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "@phaser/constants/table";
import { setupCardInteraction } from "@phaser/game/input/CardInteraction";
import { setupHoverHighlight } from "@phaser/game/input/HoverHighlight";
import { DeckController } from "@phaser/deck/DeckController";
import { createDeck } from "@phaser/deck/state/Deck";
import { PileController } from "@phaser/pile/PileController";
import { createPile } from "@phaser/pile/state/Pile";
import {
  CardMoveSequence,
  createCardMoveSequence,
} from "@phaser/move/CardMoveSequence";
import {
  invertCardMoveSequence,
  createAutocompleteCardMoveSequence,
  withTween,
} from "@phaser/move/domain/CardMoveSequenceLogic";
import { areAllTableausOrdered } from "@phaser/game/domain/FreecellRules";
import {
  BORDER_PAD_DIMENSIONS,
  BUTTON_DIMENSIONS,
  BUTTON_MARGIN,
  RECT_CORNER_RADIUS,
} from "@phaser/constants/dimensions";
import {
  BUTTON_COLOR,
  BUTTON_TEXT_COLOR,
  HIGHLIGHT_COLOR,
  RED,
} from "@phaser/constants/colors";
import { FONT_FAMILY, FONT_SIZE } from "@phaser/constants/fonts";
import { getSingleCardMoves } from "@phaser/move/domain/CardMoveLogic";
import { SessionController } from "@phaser/session/SessionController";
import { createSession, Session } from "@phaser/session/Session";
import SaveController from "@utils/save/SaveController";
import { createSave, SAVE_VERSION } from "@utils/save/Save";
import MoveSavable from "@phaser/move/MoveSaveable";
import SessionSaveable from "@phaser/session/SessionSaveable";
import { createMeta, Meta } from "@phaser/meta/Meta";
import MetaSaveable from "@phaser/meta/MetaSaveable";
import { withComplete } from "@phaser/meta/domain/MetaLogic";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private save!: SaveController;

  private deck!: DeckController;
  private piles!: PileController[];

  private moveHistory!: PubSubStack<CardMoveSequence>;
  private animationQueue!: AsyncQueue;

  private meta!: Meta;
  private session!: SessionController;

  private timerEvents!: Phaser.Time.TimerEvent[];

  public constructor() {
    super(sceneConfig);
  }

  // TODO: This function is getting to long.
  // Consider breaking into smaller function that implement State pattern for different solitaire games.
  public create(): void {
    // Setup UI
    this.createButtons();

    // Setup save system
    this.save = new SaveController({}, createSave());

    // Create and load metadata
    const currentSeed = dateToSeed(new Date()); // TODO: remove
    this.meta = createMeta(SAVE_VERSION, currentSeed, false);
    this.save.registerSaveable(
      new MetaSaveable(
        () => this.meta,
        (data: Meta) => {
          this.meta = data;
        },
      ),
    );
    this.save.loadFromStorage();

    // Reset storage and metadata if daily seed changed
    if (this.meta.data.seed !== currentSeed) {
      this.save.resetStorage();
      this.meta = createMeta(SAVE_VERSION, currentSeed, false);
    }

    // Register session
    this.session = new SessionController(this, createSession());
    this.save.registerSaveable(
      new SessionSaveable(
        () => this.session.model,
        (data: Session) => {
          this.session.model = data;
        },
      ),
    );

    // Shuffle and deal deck
    const deckModel = createDeck();
    this.deck = new DeckController(this, deckModel);
    this.deck.shuffleCards(this.meta.data.seed);
    this.deck.dealCards();

    // Setup piles
    this.piles = Object.values(PileId).map((pileId) => {
      const pileModel = createPile(pileId);
      const pile = new PileController(this, pileModel);
      if (pile.model.data.id === PileId.None) pile.view.setAlpha(0);
      return pile;
    });

    // Setup animation queue
    this.animationQueue = new AsyncQueue();

    // Setup move history
    this.moveHistory = new PubSubStack<CardMoveSequence>();
    this.save.registerSaveable(
      new MoveSavable(
        () => this.moveHistory.toArray(),
        (data: CardMoveSequence[]) => {
          this.moveHistory.clear();
          data.forEach((moveSequence) => {
            this.moveHistory.push(createCardMoveSequence(moveSequence.steps));
          });
        },
      ),
    );

    // Setup event listeners
    this.createCommandListeners();
    setupCardInteraction(this.deck, this.moveHistory);
    setupHoverHighlight(this.deck, this.piles);

    // Final persistant data to registered saveables
    this.save.loadFromStorage();

    // Start timed events or load complete state
    if (this.meta.state.complete) {
      this.input.enabled = false;
      this.session.incrementTimer(0);
    } else {
      this.startTimerEvents();
    }
  }

  private createCommandListeners(): void {
    this.moveHistory.subscribe("push", (move: CardMoveSequence) => {
      this.animationQueue.enqueue(async () => {
        await this.deck.executeCardMoveSequence(move, this);
      });
    });

    this.moveHistory.subscribe("pop", (move) => {
      const undo = invertCardMoveSequence(move);
      this.animationQueue.enqueue(async () => {
        this.deck.executeCardMoveSequence(undo, this);
      });
    });

    this.moveHistory.subscribe("clear", () => {
      this.animationQueue.enqueue(async () => {
        this.deck.dealCards();
      });
    });
  }

  // TODO: Refactor to generalize and DRY up.
  private createButtons(): void {
    const buttonConfigs = [
      {
        label: "Redeal",
        onClick: () => {
          this.moveHistory.clear();
        },
      },
      {
        label: "Undo",
        onClick: () => {
          this.moveHistory.pop();
        },
      },
      {
        label: "Nudge",
        onClick: (text: Phaser.GameObjects.Text) => {
          const sourcePiles = [...TABLEAU_PILES, ...CELL_PILES];
          // NOTE: Target groups are ordered by priority —
          // the most likely useful hint (FOUNDATION) is checked first,
          // followed by TABLEAU and then CELL piles.
          const targetGroups = [FOUNDATION_PILES, TABLEAU_PILES, CELL_PILES];

          for (const targetPiles of targetGroups) {
            const [move] = getSingleCardMoves(
              this.deck.model,
              sourcePiles,
              targetPiles,
            );
            if (!move) continue;

            const source = this.deck.getCardsInPile(move.fromPile).at(-1);
            const target =
              this.deck.getCardsInPile(move.toPile).at(-1) ??
              this.piles.find((p) => p.model.data.id === move.toPile);

            source?.view.setTint(HIGHLIGHT_COLOR);
            target?.view.setTint(HIGHLIGHT_COLOR);
            return;
          }

          // Warning if no moves are available
          text.setColor(getHexColorString(RED));
          text.setStyle({ fontStyle: "bold" });
          this.time.delayedCall(800, () => {
            text.setColor(getHexColorString(BUTTON_TEXT_COLOR));
            text.setStyle({ fontStyle: "normal" });
          });
        },
      },
    ];

    buttonConfigs.forEach(({ label, onClick }, index) => {
      const x =
        BORDER_PAD_DIMENSIONS.width +
        index * (BUTTON_DIMENSIONS.width + BUTTON_MARGIN);

      // Draw button background
      this.add
        .graphics()
        .fillStyle(BUTTON_COLOR, 1)
        .fillRoundedRect(
          x,
          BORDER_PAD_DIMENSIONS.height,
          BUTTON_DIMENSIONS.width,
          BUTTON_DIMENSIONS.height,
          RECT_CORNER_RADIUS,
        );

      // Add centered text
      const text = this.add.text(0, 0, label, {
        color: getHexColorString(BUTTON_TEXT_COLOR),
        fontSize: FONT_SIZE,
        fontFamily: FONT_FAMILY,
      });

      // Center the text inside the button
      text.setX(x + BUTTON_DIMENSIONS.width / 2 - text.width / 2);
      text.setY(
        BORDER_PAD_DIMENSIONS.height +
          BUTTON_DIMENSIONS.height / 2 -
          text.height / 2,
      );

      text.setInteractive().on("pointerdown", () => onClick(text));
    });
  }

  private startTimerEvents(): void {
    this.timerEvents = [];
    this.timerEvents.push(
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          this.session.incrementTimer(1000);
          this.save.saveToStorage();
        },
      }),
    );
  }

  private stopTimerEvents(): void {
    this.timerEvents.forEach((event) => event.remove(false));
    this.timerEvents = [];
  }

  public update(): void {
    if (this.meta.state.complete) return;

    if (areAllTableausOrdered(this.deck.model)) {
      const sequence = withTween(
        createAutocompleteCardMoveSequence(this.deck.model),
      );
      this.moveHistory.push(sequence);

      this.meta = withComplete(this.meta);
      this.input.enabled = false;
      this.save.saveToStorage();
      this.stopTimerEvents();
    }
  }
}
