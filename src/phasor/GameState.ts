import * as Phaser from "phaser";

import Card from "./Card";
import Deck from "./Deck";
import Pile from "./Pile";
import { CardMoveCommand, CommandManager, CompositeCommand } from "./Command";
import {
  canMoveCard,
  getUpdatedCardPlacements,
  getValidDropPiles,
} from "./Rules";
import { addButton } from "./UI";
import { STACK_DRAG_OFFSET } from "./constants/deck";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants/screen";
import {
  CELL_PILES,
  FOUNDATION_PILES,
  PileId,
  TABLEAU_PILES,
} from "./constants/table";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "GameState",
  visible: false,
};

export default class GameState extends Phaser.Scene {
  private commands = new CommandManager();

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
      } else if (CELL_PILES.includes(pile.pileId)) {
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
        gameObject: Phaser.GameObjects.GameObject,
      ) => {
        this.dragChildren = [];

        if (gameObject instanceof Card && canMoveCard(this.deck, gameObject)) {
          this.dragCardStart(gameObject);
        }
      },
      this,
    );

    // End drag card
    this.input.on(
      "dragend",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
      ) => {
        if (gameObject instanceof Card) {
          this.dragCardEnd();
        }
      },
      this,
    );

    // Drop on pile
    this.input.on(
      "drop",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dropZone: Phaser.GameObjects.GameObject,
      ) => {
        if (gameObject instanceof Card && dropZone instanceof Pile) {
          this.dropCard(gameObject, dropZone);
        }
      },
      this,
    );

    // Drag card
    this.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number,
      ) => {
        if (gameObject instanceof Card) {
          this.dragCard(gameObject, dragX, dragY);
        }
      },
      this,
    );

    this.input.on(
      "gameobjectdown",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
      ) => {
        if (gameObject instanceof Card) {
          this.snapCardToFoundation(gameObject);
        }
      },
      this,
    );
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

  // Resets dragged cards back to their original pile positions after dragging.
  // This is purely a visual correction, not a user action.
  // Therefore, it is NOT added to the command stack and cannot be undone.
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

    // No valid drops
    if (!getValidDropPiles(this.deck, card, [pileId]).some(Boolean)) return;

    // Update card placement
    const dragChildren = this.deck.cardChildren(card);
    const updatedPlacements = getUpdatedCardPlacements(
      this.deck,
      dragChildren,
      pileId,
    );

    const dropAllCommand = new CompositeCommand(
      ...dragChildren.map(
        (child, index) =>
          new CardMoveCommand(
            child,
            child.pile,
            child.position,
            updatedPlacements[index].pileId,
            updatedPlacements[index].position,
          ),
      ),
    );
    this.commands.push(dropAllCommand);
  }

  public snapCardToFoundation(card: Card): void {
    // Don't snap foundation cards
    if (FOUNDATION_PILES.includes(card.pile)) return;

    // Only snap if card is at bottom of pile
    if (this.deck.cardChildren(card).length > 1) return;

    // Get the first valid foundation pile to drop into
    const targetPile = getValidDropPiles(this.deck, card, FOUNDATION_PILES)[0];
    if (!targetPile) return; // Exit early if no valid pile

    // Get updated placement
    const updatedPlacement = getUpdatedCardPlacements(
      this.deck,
      [card],
      targetPile,
    )[0];

    // Create and execute card move command
    const command = new CardMoveCommand(
      card,
      card.pile,
      card.position,
      updatedPlacement.pileId,
      updatedPlacement.position,
    );
    this.commands.push(command);
  }

  public update(): void {
    // Ensure score is within range
    if (this.score < 0) {
      this.score = 0;
    }

    // Win
    const cardsOnFoundation = FOUNDATION_PILES.reduce(
      (acc, pile) => acc + this.deck.pileChildren(pile).length,
      0,
    );
    if (cardsOnFoundation === 52) {
      this.winText.setVisible(true);
    }

    // Display lives
    this.scoreText.setText(`SCORE: ${this.score}`);
  }
}
