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

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private moveHistory = new PubSubStack<CardMoveSequence>();

  private deck!: DeckController;
  private piles!: PileController[];

  private effectiveStartTime!: number;
  private pausedStartTime!: number;

  private timerText!: Phaser.GameObjects.Text;
  private winText!: Phaser.GameObjects.Text;

  public constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Create deck
    const deckModel = createDeck();
    this.deck = new DeckController(this, deckModel);
    this.deck.shuffleCards(this.dateToSeed(new Date()));
    this.deck.dealCards();

    // Create piles
    this.piles = Object.values(PileId).map((pileId) => {
      const pileModel = createPile(pileId);
      const pile = new PileController(this, pileModel);

      if (pile.model.data.id === PileId.None) pile.view.setAlpha(0);

      return pile;
    });

    // Setup game timer
    this.createTimer();

    // Create UI
    this.createButtons();
    this.createText();

    // Setup interactions
    setupCardInteraction(this.deck, this.moveHistory);
    setupHoverHighlight(this.deck, this.piles);

    // Setup player move history tracking
    this.createCommandListeners();
  }

  private createCommandListeners(): void {
    this.moveHistory.subscribe("push", (move) => {
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
    });

    this.moveHistory.subscribe("pop", (move) => {
      const undo = invertCardMoveSequence(move);
      this.deck.executeCardMoveSequence(undo);
    });
  }

  private createTimer(): void {
    this.pausedStartTime = 0;
    this.effectiveStartTime = Date.now();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pausedStartTime = Date.now();
      } else {
        const pausedDuration = Date.now() - this.pausedStartTime;
        this.effectiveStartTime += pausedDuration;
      }
    });
  }

  private createButtons(): void {
    const buttonConfigs = [
      {
        label: "Redeal",
        onClick: () => {
          this.deck.dealCards();
          this.moveHistory.clear();
          this.winText.setVisible(false);
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
    this.timerText = this.add
      .text(
        this.cameras.main.width - BORDER_PAD_DIMENSIONS.width,
        BORDER_PAD_DIMENSIONS.height,
        "Time: 0:00",
        {
          color: getHexColorString(TEXT_COLOR),
          fontSize: FONT_SIZE,
          fontFamily: FONT_FAMILY,
        },
      )
      .setOrigin(1, 0);

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
  private formatElapsedTime(elapsedMs: number): string {
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `Time: ${minutes}:${seconds}`;
  }

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

    const elapsedMs = Date.now() - this.effectiveStartTime;
    this.timerText.setText(this.formatElapsedTime(elapsedMs));
  }
}
