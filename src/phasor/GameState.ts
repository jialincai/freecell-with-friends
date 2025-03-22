import * as Phaser from "phaser";

import { PubSubStack, CompositeCommand } from "@utils/Function";

import { registerCardEvents } from "./CardEvent";
import { registerGlobalEvents } from "./GlobalEvent";
import Deck from "./Deck";
import Pile from "./Pile";
import { addButton } from "./UI";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants/screen";
import { FOUNDATION_PILES, PileId, TABLEAU_PILES } from "./constants/table";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private commands = new PubSubStack<CompositeCommand>();

  private score: number = 0;

  private deck!: Deck;

  private scoreText!: Phaser.GameObjects.Text;

  private winText!: Phaser.GameObjects.Text;

  public constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add background
    this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "img_background");

    // Add deck
    this.deck = new Deck(this);

    this.createZones();
    this.createCommandListeners();
    this.createButtons();
    this.createText();

    registerGlobalEvents(this, this.deck);
    registerCardEvents(this.deck, this.commands);
  }

  public createZones(): void {
    Object.values(PileId).forEach((pileId) => {
      const pile = new Pile(this, pileId);
      this.add.existing(pile);

      // Default none Pile is invisible
      if (pile.pileId === PileId.None) pile.setAlpha(0);
    });
  }

  public createCommandListeners(): void {
    // Do commands
    this.commands.subscribe("push", (command) => {
    });

    // Undo commands
    this.commands.subscribe("pop", (command) => {
      command.undo();
    });
  }

  public createButtons(): void {
    addButton(this, 10, 10, "Redeal", () => {
      this.deck.deal(this);
      this.winText.setVisible(false);
      this.score = 0;
    });

    addButton(this, 100, 10, "New Deal", () => {
      this.deck.shuffle(this.deck.cards, 476);
      this.deck.deal(this);
      this.winText.setVisible(false);
      this.score = 0;
    });

    addButton(this, 190, 10, "Undo", () => {
      this.commands.pop();
    });
  }

  public createText(): void {
    this.scoreText = this.add.text(700, 12, "", {
      color: "#FFF",
      fontSize: "16px",
    });

    this.winText = this.add
      .text(20, this.cameras.main.height - 40, "You Win!", {
        color: "#FFF",
        fontSize: "24px",
      })
      .setVisible(false);
  }

  public flipScore(cardStack: PileId): void {
    if (TABLEAU_PILES.includes(cardStack)) {
      this.score += 5;
    }
  }

  public dropScore(zoneStack: PileId, cardStack: PileId): void {
    // Tableau to foundation
    if (
      TABLEAU_PILES.includes(cardStack) &&
      FOUNDATION_PILES.includes(zoneStack)
    ) {
      this.score += 10;
    }

    // Foundation to tableau
    else if (
      FOUNDATION_PILES.includes(cardStack) &&
      TABLEAU_PILES.includes(zoneStack)
    ) {
      this.score -= 15;
    }
  }

  public update(): void {
    // Ensure score is within range
    if (this.score < 0) {
      this.score = 0;
    }

    // Win
    const cardsOnFoundation = FOUNDATION_PILES.reduce(
      (acc, pile) => acc + this.deck.getPileChildren(pile).length,
      0,
    );
    if (cardsOnFoundation === 52) {
      this.winText.setVisible(true);
    }

    // Display lives
    this.scoreText.setText(`SCORE: ${this.score}`);
  }
}
