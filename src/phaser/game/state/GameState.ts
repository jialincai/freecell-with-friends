import * as Phaser from "phaser";

import { PubSubStack } from "@utils/Function";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@phaser/constants/screen";
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
    // Add background
    this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "img_background");

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

  public createCommandListeners(): void {
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

  public createTimer(): void {
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

  public createButtons(): void {
    // Redeal Button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(10, 10, 80, 18);
    this.add
      .text(12, 12, "Redeal", { color: "#000" })
      .setInteractive()
      .on("pointerdown", () => {
        this.deck.dealCards();
        this.winText.setVisible(false);
      });

    // New Deal Button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(100, 10, 80, 18);
    this.add
      .text(102, 12, "New Deal", { color: "#000" })
      .setInteractive()
      .on("pointerdown", () => {
        this.deck.shuffleCards(476);
        this.deck.dealCards();
        this.winText.setVisible(false);
      });

    // Undo Button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(190, 10, 80, 18);
    this.add
      .text(192, 12, "Undo", { color: "#000" })
      .setInteractive()
      .on("pointerdown", () => {
        this.moveHistory.pop();
      });
  }

  public createText(): void {
    this.timerText = this.add.text(
      this.cameras.main.width - 150,
      12,
      "Time: 0:00",
      {
        color: "#FFF",
        fontSize: "24px",
      },
    );

    this.winText = this.add
      .text(20, this.cameras.main.height - 40, "You Win!", {
        color: "#FFF",
        fontSize: "24px",
      })
      .setVisible(false);
  }

  public update(): void {
    const elapsed = Date.now() - this.effectiveStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    this.timerText.setText(`Time: ${minutes}:${seconds}`);

    if (areAllTableausOrdered(this.deck.model)) {
      const autoCompleteSequence = createAutocompleteCardMoveSequence(
        this.deck.model,
      );
      this.deck.executeCardMoveSequenceWithTweens(
        autoCompleteSequence,
        this,
        TWEEN_DURATION,
      );
    }

    if (areFoundationsFull(this.deck.model)) {
      this.winText.setVisible(true);
    }
  }
}
