import * as Phaser from "phaser";

import { getHexColorString, PubSubStack } from "@utils/Function";
import { FOUNDATION_PILES, PileId } from "@phaser/constants/table";
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
import { BORDER_PAD } from "@phaser/constants/dimensions";
import { BUTTON_COLOR, BUTTON_TEXT_COLOR, TEXT_COLOR } from "@phaser/constants/colors";

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
    this.deck.shuffleCards(476);
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

  private updateTimer(): void {
    const elapsedMs = Date.now() - this.effectiveStartTime;
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    this.timerText.setText(`Time: ${minutes}:${seconds}`);
  }

  private createButtons(): void {
    const BUTTON_WIDTH = 120;
    const BUTTON_HEIGHT = 24;
    const BUTTON_MARGIN = 10;
    const BUTTON_Y = 10;
    const START_X = BORDER_PAD;

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
        label: "New Deal",
        onClick: () => {
          this.deck.shuffleCards(476);
          this.deck.dealCards();
          this.winText.setVisible(false);
        },
      },
      {
        label: "Undo",
        onClick: () => {
          this.moveHistory.pop();
        },
      },
    ];

    buttonConfigs.forEach(({ label, onClick }, index) => {
      const x = START_X + index * (BUTTON_WIDTH + BUTTON_MARGIN);

      // Draw button background
      this.add
        .graphics()
        .fillStyle(BUTTON_COLOR, 1)
        .fillRect(x, BUTTON_Y, BUTTON_WIDTH, BUTTON_HEIGHT);

      // Add centered text
      const text = this.add.text(0, 0, label, {
        color: getHexColorString(BUTTON_TEXT_COLOR),
        fontSize: "24px",
      });

      // Center the text inside the button
      text.setX(x + BUTTON_WIDTH / 2 - text.width / 2);
      text.setY(BUTTON_Y + BUTTON_HEIGHT / 2 - text.height / 2);

      text.setInteractive().on("pointerdown", onClick);
    });
  }

  private createText(): void {
    this.timerText = this.add
      .text(this.cameras.main.width - BORDER_PAD, 12, "Time: 0:00", {
        color: getHexColorString(TEXT_COLOR),
        fontSize: "24px",
      })
      .setOrigin(1, 0);

    this.winText = this.add
      .text(BORDER_PAD, this.cameras.main.height - 40, "You Win!", {
        color: getHexColorString(TEXT_COLOR),
        fontSize: "24px",
      })
      .setVisible(false);
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

    this.updateTimer();
  }
}