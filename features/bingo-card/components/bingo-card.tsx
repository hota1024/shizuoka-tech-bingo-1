"use client";

import { cn } from "@/lib/utils";
import { languages } from "@/cells.json";
import {
  Card,
  getCellsOnBingoLines,
  getUnmarkedCellsOnBingoLines,
} from "../lib";
import { useState } from "react";

export interface BingoCardProps {
  card: Card;
  className?: string;
}

const cells = Array.from({ length: 25 }, (_, i) => ({ id: i, value: `C${i}` }));

export function BingCard(props: BingoCardProps) {
  const { card, className } = props;
  const [markedCells, setMarkedCells] = useState<number[]>([]);

  function toggleMarkedCell(cellIndex: number) {
    setMarkedCells((prev) => {
      if (prev.includes(cellIndex)) {
        return prev.filter((i) => i !== cellIndex);
      }
      return [...prev, cellIndex];
    });
  }

  const cellsOnBingoLines = getCellsOnBingoLines(card.cells, markedCells);
  const unmarkedCellsOnBingoLines = getUnmarkedCellsOnBingoLines(
    card.cells,
    markedCells
  );

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="w-full p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">BINGO CARD</h2>
          <div className="text-2xl font-semibold text-blue-600 bg-white px-4 py-2 rounded-full inline-block shadow-sm">
            No. {card.number}
          </div>
        </div>

        {/* Bingo Grid */}
        <div className="grid grid-cols-5 gap-1 bg-gray-300 p-2 rounded-xl shadow-inner">
          {card.cells.map((languageIndex, cellIndex) => {
            if (languageIndex === null) {
              return (
                <div
                  key="FREE"
                  className={cn(
                    "w-full aspect-square grid place-items-center relative",
                    "bg-gradient-to-br from-blue-600 to-blue-700 text-white",
                    "rounded-lg shadow-md border-2 border-blue-500",
                    "transform transition-all duration-200 hover:scale-105"
                  )}
                >
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="text-sm font-bold mb-1">FREE</div>
                  </div>
                </div>
              );
            }

            const cell = languages[languageIndex];
            const isMarked = markedCells.includes(languageIndex);
            const isOnBingoLine = cellsOnBingoLines.includes(cellIndex);
            const isPotentialBingo =
              unmarkedCellsOnBingoLines.includes(cellIndex);

            return (
              <div
                key={cell.name}
                className={cn(
                  "w-full aspect-square grid place-items-center cursor-pointer",
                  "rounded-lg border-2 transition-all duration-200 hover:scale-105",
                  "transform shadow-md hover:shadow-lg",
                  isOnBingoLine
                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 shadow-green-200"
                    : isPotentialBingo
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-800 border-yellow-300 shadow-yellow-200 animate-pulse"
                    : isMarked
                    ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white border-blue-300 shadow-blue-200"
                    : "bg-gradient-to-br from-white to-gray-50 text-gray-800 border-gray-200 hover:border-blue-300 hover:from-blue-50 hover:to-blue-100"
                )}
                onClick={() => toggleMarkedCell(languageIndex)}
              >
                <div className="flex flex-col items-center justify-center text-center p-2 w-full h-full">
                  <div className="text-xs font-medium opacity-70 mb-1">
                    #{languageIndex + 1}
                  </div>
                  <div
                    className={cn(
                      "font-bold leading-tight",
                      cell.name.length > 8
                        ? "text-[8px]"
                        : cell.name.length > 4
                        ? "text-[10px]"
                        : "text-sm"
                    )}
                  >
                    {cell.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Click cells to mark them as completed</p>
          <p className="mt-1">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Bingo line •
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mx-1"></span>
            Potential bingo
          </p>
        </div>
      </div>
    </div>
  );
}
