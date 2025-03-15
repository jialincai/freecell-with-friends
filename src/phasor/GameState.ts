import * as Phaser from "phaser";

import Card from "./Card";
import Deck from "./Deck";
import { Pile } from "./Pile";
import { getUpdatedCardPlacements, getValidDropPiles } from "./Rules";
import { STACK_DRAG_OFFSET } from "./constants/deck";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants/screen";
import { CELL_PILES, FOUNDATION_PILES, PileId, TABLEAU_PILES } from "./constants/table";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private score: number = 0;

  private dragChildren: Card[] = [];

  private foundationPiles: Pile[] = [];

  private cellPiles: Pile[] = [];

  private deck!: Deck;

  private scoreText!: Phaser.GameObjects.Text;

  private winText!: Phaser.GameObjects.Text;

  public constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Game state variables
    this.score = 0;
    this.dragChildren = [];

    // Add background
    this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "img_background");

    // Add deck
    this.deck = new Deck(this);

    this.createZones();
    this.createInputListeners();
    this.createButtons();
    this.createText();
  }

  public createZones(): void {
    Object.values(PileId).forEach((pileId) => {
      const pile = new Pile(this, pileId);
      this.add.existing(pile);

      if (FOUNDATION_PILES.includes(pile.pileId)) {
        this.foundationPiles.push(pile);
      }

      else if (CELL_PILES.includes(pile.pileId)) {
        this.cellPiles.push(pile);
      }

    });
  }

  public createInputListeners(): void {
    // Start drag card
    this.input.on(
      "dragstart",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.dragChildren = [];

        if (gameObject instanceof Card && this.deck.validDraggableCard(gameObject, this.determineMaxCardsForMove())) {
          this.dragCardStart(gameObject);
        }
      },
      this
    );

    // End drag card
    this.input.on(
      "dragend",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (gameObject instanceof Card) {
          this.dragCardEnd();
        }
      },
      this
    );

    // Drop on pile
    this.input.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dropZone: Phaser.GameObjects.GameObject
      ) => {
        if (gameObject instanceof Card && dropZone instanceof Pile) {
          this.dropCard(gameObject, dropZone);
        }
      },
      this
    );

    // Drag card
    this.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        if (gameObject instanceof Card) {
          this.dragCard(gameObject, dragX, dragY);
        }
      },
      this
    );

    this.input.on("gameobjectdown",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (gameObject instanceof Card) {
          this.snapCardToFoundation(gameObject);
        }
      }, this
    );
  }

  public createButtons(): void {
    // Redeal button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(10, 10, 80, 18);

    this.add
      .text(12, 12, "Redeal", { color: "#000" })
      .setInteractive()
      .on(
        "pointerdown",
        () => {
          this.deck.deal(this);
          this.winText.setVisible(false);
          this.score = 0;
        },
        this
      );

    // New deal button
    this.add.graphics().fillStyle(0xffffff, 1).fillRect(100, 10, 80, 18);

    this.add
      .text(102, 12, "New Deal", { color: "#000" })
      .setInteractive()
      .on(
        "pointerdown",
        () => {
          this.deck.shuffle(this.deck.cards, 476);
          this.deck.deal(this);
          this.winText.setVisible(false);
          this.score = 0;
        },
        this
      );
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

  public dragCardStart(card: Card): void {
    // Populate drag children
    this.dragChildren = [];
    if (TABLEAU_PILES.includes(card.pile)) {
      this.dragChildren = this.deck.cardChildren(card);
    } else {
      this.dragChildren.push(card);
    }

    // Set depths
    for (let i = 0; i < this.dragChildren.length; i += 1) {
      this.dragChildren[i].setDepth(100 + i);
    }
  }

  public dragCardEnd(): void {
    // Drop all other cards on top
    this.dragChildren.forEach((child: Card) => {
      child.reposition(child.pile, child.position);
    });
  }

  public dragCard(_card: Card, dragX: number, dragY: number): void {
    // Set positions
    for (let i = 0; i < this.dragChildren.length; i += 1) {
      this.dragChildren[i].x = dragX;
      this.dragChildren[i].y = dragY + i * STACK_DRAG_OFFSET;
    }
  }

  public dropCard(card: Card, dropZone: Phaser.GameObjects.GameObject): void {
    // Get pile id of drop zone
    const pileId = dropZone.name as PileId;

    // If the card can be dropped on the pile, reposition it
    if (getValidDropPiles(this.deck, card, [pileId]).some(Boolean)) {
      const dragChildren = this.deck.cardChildren(card);

      const updatedPlacements = getUpdatedCardPlacements(this.deck, dragChildren, pileId);
      dragChildren.forEach((child, index) => {
        child.reposition(updatedPlacements[index].pileId, updatedPlacements[index].position);
      });
    }
  }

  public snapCardToFoundation(card: Card): void {
    // Get valid foundation pile
    const validPiles = getValidDropPiles(this.deck, card, FOUNDATION_PILES);
    const targetPile = validPiles[0]; // Returns undefined if no valid pile

    // Reposition card
    if (targetPile) {
      const [updatedPlacement] = getUpdatedCardPlacements(this.deck, [card], targetPile);
      card.reposition(updatedPlacement.pileId, updatedPlacement.position);
    }
  }

  public determineMaxCardsForMove(): number {
    let maxCards: number = 1;
    for (const cell of this.cellPiles) {
      if (!this.deck.topCard(cell.pileId)) {
        maxCards += 1;
      }
    }

    return maxCards;
  }

  public update(): void {
    // Ensure score is within range
    if (this.score < 0) {
      this.score = 0;
    }

    // Win
    const cardsOnFoundation = FOUNDATION_PILES.reduce(
      (acc, pile) => acc + this.deck.countCards(pile),
      0
    );
    if (cardsOnFoundation === 52) {
      this.winText.setVisible(true);
    }

    // Display lives
    this.scoreText.setText(`SCORE: ${this.score}`);
  }
}
