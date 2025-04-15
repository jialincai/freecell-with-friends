import * as Phaser from "phaser";

import { PileId } from "@phaser/constants/table";
import { filterValidDropPiles } from "@phaser/game/domain/FreecellRules";
import { getCardsInPile } from "@phaser/deck/domain/DeckLogic";
import { CardController } from "@phaser/card/CardController";
import { DeckController } from "@phaser/deck/DeckController";
import { PileController } from "@phaser/pile/PileController";
import { PileView } from "@phaser/pile/PileView";
import { HIGHLIGHT_COLOR } from "@phaser/constants/colors";

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

    cardController.view.on("dragleave", () => {
      removeHighlight(deckController, PileControllers);
    });

    cardController.view.on("pointerdown", () => {
      removeHighlight(deckController, PileControllers);
    });

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
    view?.setTint(HIGHLIGHT_COLOR);
  } else {
    pileView.setTint(HIGHLIGHT_COLOR);
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
