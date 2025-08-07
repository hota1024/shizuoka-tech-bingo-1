export const CARD_WIDTH = 5;
export const CARD_HEIGHT = 5;

export const CARD_CENTER = Math.floor((CARD_WIDTH * CARD_HEIGHT) / 2);

if (CARD_WIDTH % 2 === 0 || CARD_HEIGHT % 2 === 0) {
  throw new Error("CARD_WIDTH and CARD_HEIGHT must be odd");
}
