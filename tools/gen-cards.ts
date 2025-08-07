import fs from "fs/promises";
import { languages } from "@/cells.json";
import { CARD_CENTER, CARD_HEIGHT, CARD_WIDTH } from "@/constants/card";
import { Card } from "@/features/bingo-card/lib";

const CARDS_JSON_PATH = "./cards.json";
const CARDS_COUNT = 36;

const cards: Card[] = [];
for (let i = 0; i < CARDS_COUNT; i++) {
  const cells: (number | null)[] = [];

  for (let j = 0; j < CARD_WIDTH * CARD_HEIGHT; j++) {
    let candidate: number;
    do {
      candidate = Math.floor(Math.random() * languages.length);
    } while (cells.includes(candidate));
    cells.push(candidate);
  }

  const center = CARD_CENTER;
  cells[center] = null;

  cards.push({
    number: i + 1,
    key: genKey(),
    cells,
  });
}

await fs.writeFile(CARDS_JSON_PATH, JSON.stringify(cards));
console.log(`Generated ${CARDS_COUNT} cards`);

for (const card of cards) {
  console.log(card.key, card.number);
}

function genKey(): string {
  const crypto = require("crypto");
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = 12;
  return Array.from(crypto.randomFillSync(new Uint8Array(N)))
    .map((n) => S[(n as number) % S.length])
    .join("");
}
