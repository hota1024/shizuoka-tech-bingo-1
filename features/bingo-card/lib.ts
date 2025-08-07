import { CARD_CENTER, CARD_HEIGHT, CARD_WIDTH } from "@/constants/card";

export type Cell = number | null;

export interface Card {
  number: number;
  key: string;
  cells: Cell[];
}

/**
 * ビンゴしたライン上にあるセルのインデックスを返す。
 */
export function getCellsOnBingoLines(
  cells: Cell[],
  markedCells: Cell[]
): number[] {
  // markedCells: セルのインデックス（languagesのindex or null）で与えられる
  // cells: 盤面上の各マスのlanguagesインデックス or null

  // 盤面上の各マスのインデックス(0~24)を、markedCellsの値（languagesのindex or null）で判定する
  // まず、markedCellsの値をSetにして高速判定
  const markedSet = new Set(markedCells);

  // FREEセル（中央）は常にマークされているものとする
  // cells[CARD_CENTER] === null であることが保証されている

  // ビンゴしたライン上のセルインデックスを返す
  const bingoLines: number[][] = [];

  // ラインのパターンを定義
  const linePatterns: number[][] = [
    // 横ライン
    ...Array.from({ length: CARD_HEIGHT }, (_, row) =>
      Array.from({ length: CARD_WIDTH }, (_, col) => row * CARD_WIDTH + col)
    ),
    // 縦ライン
    ...Array.from({ length: CARD_WIDTH }, (_, col) =>
      Array.from({ length: CARD_HEIGHT }, (_, row) => row * CARD_WIDTH + col)
    ),
    // 斜め（左上→右下）
    Array.from({ length: CARD_WIDTH }, (_, i) => i * CARD_WIDTH + i),
    // 斜め（右上→左下）
    Array.from(
      { length: CARD_WIDTH },
      (_, i) => i * CARD_WIDTH + (CARD_WIDTH - 1 - i)
    ),
  ];

  // 各ラインをチェック
  for (const line of linePatterns) {
    const indices = [];
    let bingo = true;

    for (const idx of line) {
      if (idx === CARD_CENTER) continue; // FREE
      if (!markedSet.has(cells[idx])) {
        bingo = false;
        break;
      }
      indices.push(idx);
    }

    if (bingo) {
      // FREEセルも含める（中央のラインの場合）
      if (!indices.includes(CARD_CENTER) && line.includes(CARD_CENTER)) {
        const centerIndex = Math.floor(line.length / 2);
        indices.splice(centerIndex, 0, CARD_CENTER);
      }
      bingoLines.push(indices);
    }
  }

  // 複数ラインがビンゴしている場合は全て返す
  // 返り値はインデックスの配列（重複なし）で返す
  return Array.from(new Set(bingoLines.flat()));
}

/**
 * マークされていないセルの中で、マークすればビンゴするセルのインデックス一覧を返す。
 */
export function getUnmarkedCellsOnBingoLines(
  cells: Cell[],
  markedCells: Cell[]
): number[] {
  // markedCells: セルのインデックス（languagesのindex or null）で与えられる
  // cells: 盤面上の各マスのlanguagesインデックス or null

  // 盤面上の各マスのインデックス(0~24)を、markedCellsの値（languagesのindex or null）で判定する
  // まず、markedCellsの値をSetにして高速判定
  const markedSet = new Set(markedCells);

  // ラインのパターンを定義（getCellsOnBingoLineと同じ）
  const linePatterns: number[][] = [
    // 横ライン
    ...Array.from({ length: CARD_HEIGHT }, (_, row) =>
      Array.from({ length: CARD_WIDTH }, (_, col) => row * CARD_WIDTH + col)
    ),
    // 縦ライン
    ...Array.from({ length: CARD_WIDTH }, (_, col) =>
      Array.from({ length: CARD_HEIGHT }, (_, row) => row * CARD_WIDTH + col)
    ),
    // 斜め（左上→右下）
    Array.from({ length: CARD_WIDTH }, (_, i) => i * CARD_WIDTH + i),
    // 斜め（右上→左下）
    Array.from(
      { length: CARD_WIDTH },
      (_, i) => i * CARD_WIDTH + (CARD_WIDTH - 1 - i)
    ),
  ];

  // 各ラインをチェックして、1つだけマークされていないセルがあるラインを見つける
  const potentialBingoCells = new Set<number>();

  for (const line of linePatterns) {
    const unmarkedIndices: number[] = [];
    let markedCount = 0;

    for (const idx of line) {
      if (idx === CARD_CENTER) {
        // FREEセルは常にマークされているものとする
        markedCount++;
        continue;
      }

      if (markedSet.has(cells[idx])) {
        markedCount++;
      } else {
        unmarkedIndices.push(idx);
      }
    }

    // ライン上で1つだけマークされていないセルがある場合（4つマーク済み）
    if (markedCount === CARD_WIDTH - 1 && unmarkedIndices.length === 1) {
      potentialBingoCells.add(unmarkedIndices[0]);
    }
  }

  return Array.from(potentialBingoCells);
}
