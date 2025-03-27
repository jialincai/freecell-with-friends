import * as Phaser from "phaser";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@phasor/constants/screen";
import { FOUNDATION_PILES, PileId } from "@phasor/constants/table";

import { PubSubStack, CompositeCommand } from "@utils/Function";

import { setupCardInteraction } from "@phasor/game/input/CardInteraction";
import { setupHoverHighlight } from "@phasor/game/input/HoverHighlight";

import { addButton } from "@phasor/UI";

import { DeckController } from "@phasor/deck/DeckController";
import { createDeck } from "@phasor/deck/state/Deck";

import { CardController } from "@phasor/card/CardController";
import { CardView } from "@phasor/card/CardView";

import { PileController } from "@phasor/pile/PileController";
import { createPile } from "@phasor/pile/state/Pile";
import { PileView } from "@phasor/pile/PileView";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private moveHistory = new PubSubStack<CompositeCommand>();

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
    const cardControllers = createDeck().cards.map((c) => {
      return new CardController(c, new CardView(this, c));
    });
    this.deck = new DeckController(deckModel, cardControllers);

    // Create piles
    this.piles = Object.values(PileId).map((pileId) => {
      const pileModel = createPile(pileId);
      const pileView = new PileView(this, pileModel);
      const pile = new PileController(pileModel, pileView);

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
    // Do commands
    this.moveHistory.subscribe("push", (move) => {
      move.do();
    });

    // Undo commands
    this.moveHistory.subscribe("pop", (move) => {
      move.undo();
    });
  }

  public createButtons(): void {
    addButton(this, 10, 10, "Redeal", () => {
      this.deck.deal();
      this.winText.setVisible(false);
    });

    addButton(this, 100, 10, "New Deal", () => {
      this.deck.shuffle(476);
      this.deck.deal();
      this.winText.setVisible(false);
    });

    addButton(this, 190, 10, "Undo", () => {
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
    // Win
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
