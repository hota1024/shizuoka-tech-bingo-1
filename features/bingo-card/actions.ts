"use server";

import {
  Card,
  getCellsOnBingoLines,
  getUnmarkedCellsOnBingoLines,
} from "./lib";

export async function $fetchCards(token: string): Promise<Card[] | null> {
  if (token !== process.env.ADMIN_TOKEN) {
    return null;
  }
  const res = await fetch(process.env.CARDS_JSON_URL!);
  return await res.json();
}

export async function $getCardByKey(
  key: string,
  token: string
): Promise<Card | null> {
  const cards = await $fetchCards(token);
  return cards?.find((card) => card.key === key) ?? null;
}

export async function $getReachedCards(token: string, markedCells: number[]) {
  const cards = await $fetchCards(token);

  const reachedCards =
    cards?.filter((card) => {
      const unmarkedCellsOnBingoLines = getUnmarkedCellsOnBingoLines(
        card.cells,
        markedCells
      );
      return unmarkedCellsOnBingoLines.length > 0;
    }) ?? [];
  return reachedCards;
}

export async function $getBingoCards(token: string, markedCells: number[]) {
  const cards = await $fetchCards(token);
  const bingoCards =
    cards?.filter((card) => {
      const cellsOnBingoLines = getCellsOnBingoLines(card.cells, markedCells);
      return cellsOnBingoLines.length > 0;
    }) ?? [];
  return bingoCards;
}

export async function $getHitCards(token: string, cellToMark: number) {
  const cards = await $fetchCards(token);
  const hitCards =
    cards?.filter((card) => card.cells.includes(cellToMark)) ?? [];
  return hitCards;
}
