import * as Phaser from "phaser";
import { getDroppablePiles } from "@phasor/game/domain/FreecellRules";
import { getPileChildren } from "@phasor/deck/domain/DeckLogic";

import { PileId } from "@phasor/constants/table";
import { PileView } from "@phasor/pile/PileView";
import { DeckController } from "@phasor/deck/DeckController";
import { CardController } from "@phasor/card/CardController";
import { PileController } from "@phasor/pile/PileController";

/**
 * Registers event handling for hover highlighting.
 */
export function setupHoverHighlight(
  deckController: DeckController,
  PileControllers: PileController[],
): void {
  deckController.cardControllers.forEach((controller) => {
    const view = controller.view;

    view.on(
      "dragenter",
      (
        _pointer: Phaser.Input.Pointer,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (target instanceof PileView) {
          onDragEnter(controller, target, deckController);
        }
      },
    );

    view.on(
      "dragleave",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        target: Phaser.GameObjects.GameObject,
      ) => {
        if (target instanceof PileView) {
          resetHighlights(deckController, PileControllers);
        }
      },
    );

    view.on("pointerup", () => {
      resetHighlights(deckController, PileControllers);
    });
  });
}

function onDragEnter(
  card: CardController,
  pileView: PileView,
  deckController: DeckController,
): void {
  const pileId = pileView.name as PileId;
  const model = card.model;
  const deckModel = deckController.model;

  const valid = getDroppablePiles(deckModel, model, [pileId]);
  if (!valid.includes(pileId)) return;

  const pileCards = getPileChildren(deckModel, pileId);

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

function resetHighlights(
  deckController: DeckController,
  PileControllers: PileController[],
): void {
  deckController.cardControllers.forEach((controller) => {
    controller.view.clearTint();
  });

  PileControllers.forEach((controller) => {
    controller.clearTint();
  });
}
