import * as Phaser from "phaser";

/**
 * Creates a button with a text label and adds it to the given Phaser scene.
 *
 * @param {Phaser.Scene} scene - The Phaser scene where the button should be added.
 * @param {number} x - The x-coordinate of the button's top-left corner.
 * @param {number} y - The y-coordinate of the button's top-left corner.
 * @param {string} label - The text displayed on the button.
 * @param {() => void} onClick - The callback function to execute when the button is clicked.
 * @returns {void} This function does not return a value; it directly modifies the scene.
 */
export function addButton(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    label: string, 
    onClick: () => void
): void {
    // Create button background
    scene.add.graphics()
        .fillStyle(0xffffff, 1)
        .fillRect(x, y, 80, 18);

    // Create text and make it interactive
    scene.add.text(x + 2, y + 2, label, { color: "#000" })
        .setInteractive()
        .on("pointerdown", onClick);
}