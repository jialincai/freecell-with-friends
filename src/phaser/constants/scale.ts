/**
 * Scales the base (1650x3250) design resolution down to reduce canvas
 * framebuffer / GPU memory footprint. 0.71 is sized to the physical pixel
 * width actually needed to fill an iPhone 14 viewport under Scale.FIT
 * (~1170px) -- the binding constraint across our supported devices, since
 * the tall canvas aspect ratio ends up letterboxed by height (not width)
 * on landscape desktop monitors, even at 4K.
 */
export const GAME_SCALE = 0.71;
