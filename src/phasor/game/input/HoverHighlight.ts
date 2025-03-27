import * as Phaser from "phaser";

import { PileId } from "@phasor/constants/table";
import { filterValidDropPiles } from "@phasor/game/domain/FreecellRules";
import { getCardsInPile } from "@phasor/deck/domain/DeckLogic";
import { CardController } from "@phasor/card/CardController";
import { DeckController } from "@phasor/deck/DeckController";
import { PileController } from "@phasor/pile/PileController";
import { PileView } from "@phasor/pile/PileView";

export function setupHoverHighlight(
  deckController: DeckController,
  PileControllers: PileController[],
): void {
  deckController.cardControllers.forEach((cardController) => {
    cardController.view.on(
      "dragenter",
      (
        _pointer: Phaser.Input.Pointer,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (target instanceof PileView) {
          setHighlight(deckController, cardController, target);
        }
      },
    );

    cardController.view.on(
      "dragleave",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (target instanceof PileView) {
          removeHighlight(deckController, PileControllers);
        }
      },
    );

    cardController.view.on("pointerup", () => {
      removeHighlight(deckController, PileControllers);
    });
  });
}

function setHighlight(
  deckController: DeckController,
  card: CardController,
  pileView: PileView,
): void {
  const pileId = pileView.name as PileId;
  const model = card.model;
  const deckModel = deckController.model;

  const valid = filterValidDropPiles(deckModel, model, [pileId]);
  if (!valid.includes(pileId)) return;

  const pileCards = getCardsInPile(deckModel, pileId);

  const bottom = pileCards.at(-1);
  if (bottom) {
    const view = deckController.cardControllers.find(
      (c) => c.model === bottom,
    )?.view;
    view?.setTint(0x4a90e2);
  } else {
    pileView.setTint(0x4a90e2);
  }
}

function removeHighlight(
  deckController: DeckController,
  PileControllers: PileController[],
): void {
  deckController.cardControllers.forEach((cardController) => {
    cardController.view.clearTint();
  });

  PileControllers.forEach((cardController) => {
    cardController.clearTint();
  });
}
