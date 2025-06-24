import * as Phaser from "phaser";

import { getHexColorString, PubSubStack } from "@utils/Function";
import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "@phaser/constants/table";
import { TWEEN_DURATION } from "@phaser/constants/tweens";
import { setupCardInteraction } from "@phaser/game/input/CardInteraction";
import { setupHoverHighlight } from "@phaser/game/input/HoverHighlight";
import { DeckController } from "@phaser/deck/DeckController";
import { createDeck } from "@phaser/deck/state/Deck";
import { PileController } from "@phaser/pile/PileController";
import { createPile } from "@phaser/pile/state/Pile";
import { CardMoveSequence } from "@phaser/move/CardMoveSequence";
import {
  invertCardMoveSequence,
  expand,
  createAutocompleteCardMoveSequence,
} from "@phaser/move/domain/CardMoveSequenceLogic";
import {
  areFoundationsFull,
  areAllTableausOrdered,
} from "@phaser/game/domain/FreecellRules";
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
  TEXT_COLOR,
} from "@phaser/constants/colors";
import { FONT_FAMILY, FONT_SIZE } from "@phaser/constants/fonts";
import { getSingleCardMoves } from "@phaser/move/domain/CardMoveLogic";
import { StatController } from "@phaser/stat/StatController";
import { createStat } from "@phaser/stat/Stat";
import SaveController from "@utils/save/SaveController";
import { createSave } from "@utils/save/Save";
import MoveSavable from "@phaser/move/MoveSaveable";
import { StatSaveable } from "@phaser/stat/StatSaveable";

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
  private stat!: StatController;
  private winText!: Phaser.GameObjects.Text;

  public constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Create UI elements
    this.createButtons();
    this.createText();

    // Setup save system
    this.save = new SaveController({}, createSave());

    // Setup stats and register with save system
    this.stat = new StatController(
      this,
      createStat(this.dateToSeed(new Date()), Date.now(), 0),
    );
    this.save.registerSaveable(new StatSaveable(this.stat.model));

    // Create deck and piles
    const deckModel = createDeck();
    this.deck = new DeckController(this, deckModel);
    this.deck.shuffleCards(this.stat.model.data.seed);
    this.deck.dealCards();

    this.piles = Object.values(PileId).map((pileId) => {
      const pileModel = createPile(pileId);
      const pile = new PileController(this, pileModel);
      if (pile.model.data.id === PileId.None) pile.view.setAlpha(0);
      return pile;
    });

    // Setup move history and register with save system
    this.moveHistory = new PubSubStack<CardMoveSequence>();
    this.save.registerSaveable(new MoveSavable(this.moveHistory));
    
    // Setup animations
    this.createCommandListeners();

    // Rehydrate state from save system
    this.save.loadFromStorage();

    // Setup interactions and animations
    setupCardInteraction(this.deck, this.moveHistory);
    setupHoverHighlight(this.deck, this.piles);
  }

  private createCommandListeners(): void {
    this.moveHistory.subscribe("push", (move: CardMoveSequence) => {
      const isSimpleDirectMove =
        move.steps.length === 1 &&
        !FOUNDATION_PILES.includes(move.steps[0].toPile);

      if (isSimpleDirectMove) {
        this.deck.executeCardMoveSequence(move);
        return;
      }
      const expandedSequence = expand(this.deck.model, move);
      this.deck.executeCardMoveSequenceWithTweens(
        expandedSequence,
        this,
        TWEEN_DURATION,
      );

      console.log("Move history size:", this.moveHistory.toArray().length);
    });

    this.moveHistory.subscribe("pop", (move) => {
      const undo = invertCardMoveSequence(move);
      this.deck.executeCardMoveSequence(undo);
    });

    this.moveHistory.subscribe("clear", () => {
      this.deck.dealCards();
      this.winText.setVisible(false);
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

  private createText(): void {
    this.winText = this.add
      .text(
        BORDER_PAD_DIMENSIONS.width,
        this.cameras.main.height - FONT_SIZE + BORDER_PAD_DIMENSIONS.height,
        "You Win!",
        {
          color: getHexColorString(TEXT_COLOR), // TODO: Keep font DRY.
          fontSize: FONT_SIZE,
          fontFamily: FONT_FAMILY,
        },
      )
      .setVisible(false);
  }

  // TODO: Pure funcitons we may want to rehome someday.
  // Game state should only contain stateful logic.
  private dateToSeed(date: Date): number {
    const [year, month, day] = date
      .toISOString()
      .split("T")[0]
      .split("-")
      .map(Number);
    return year * 10000 + month * 100 + day;
  }

  public update(): void {
    if (areAllTableausOrdered(this.deck.model)) {
      const sequence = createAutocompleteCardMoveSequence(this.deck.model);
      this.deck.executeCardMoveSequenceWithTweens(
        sequence,
        this,
        TWEEN_DURATION,
      );
      return;
    }

    if (areFoundationsFull(this.deck.model)) {
      this.winText.setVisible(true);
      return;
    }

    this.stat.updateTimeDisplay();
    // this.save.saveToStorage();
  }
}
