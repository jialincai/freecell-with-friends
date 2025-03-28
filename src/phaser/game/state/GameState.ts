import * as Phaser from "phaser";

import { PubSubStack } from "@utils/Function";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@phaser/constants/screen";
import { FOUNDATION_PILES, PileId } from "@phaser/constants/table";
import { setupCardInteraction } from "@phaser/game/input/CardInteraction";
import { setupHoverHighlight } from "@phaser/game/input/HoverHighlight";
import { DeckController } from "@phaser/deck/DeckController";
import { createDeck } from "@phaser/deck/state/Deck";
import { CardController } from "@phaser/card/CardController";
import { CardView } from "@phaser/card/CardView";
import { undo } from "@phaser/command/domain/CommandLogic";
import { PileController } from "@phaser/pile/PileController";
import { createPile } from "@phaser/pile/state/Pile";
import { PileView } from "@phaser/pile/PileView";
import { deal, shuffle } from "@phaser/deck/domain/DeckLogic";
import { CardMoveCommand } from "@phaser/command/state/Command";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private moveHistory = new PubSubStack<CardMoveCommand[]>();

  private deck!: DeckController;
  private piles!: PileController[];

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
    this.deck.shuffle(476);
    this.deck.deal();

    // Create piles
    this.piles = Object.values(PileId).map((pileId) => {
      const pileModel = createPile(pileId);
      const pile = new PileController(this, pileModel);

      if (pile.model.data.id === PileId.None) pile.view.setAlpha(0);

      return pile;
    });

    // Create UI
    this.createButtons();
    this.createText();

    // Setup player move history tracking
    this.createCommandListeners();

    // Setup interactions
    setupCardInteraction(this.deck, this.moveHistory);
    setupHoverHighlight(this.deck, this.piles);
  }

  public createCommandListeners(): void {
    // Undo commands
    this.moveHistory.subscribe("pop", (move) => {
      undo(move);
    });
  }

  public createButtons(): void {
    // Redeal Button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(10, 10, 80, 18);
    this.add
      .text(12, 12, "Redeal", { color: "#000" })
      .setInteractive()
      .on("pointerdown", () => {
        this.deck.deal();
        this.winText.setVisible(false);
      });

    // New Deal Button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(100, 10, 80, 18);
    this.add
      .text(102, 12, "New Deal", { color: "#000" })
      .setInteractive()
      .on("pointerdown", () => {
        this.deck.shuffle(476);
        this.deck.deal();
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
    this.winText = this.add
      .text(20, this.cameras.main.height - 40, "You Win!", {
        color: "#FFF",
        fontSize: "24px",
      })
      .setVisible(false);
  }

  public update(): void {
    // Win condition
    const cardsOnFoundation = FOUNDATION_PILES.reduce(
      (acc: number, pile: PileId) =>
        acc + this.deck.getCardsInPile(pile).length,
      0,
    );
    if (cardsOnFoundation === 52) {
      this.winText.setVisible(true);
    }
  }
}
