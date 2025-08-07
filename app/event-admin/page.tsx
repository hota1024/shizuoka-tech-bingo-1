"use client";

import { Settings } from "@/features/admin/components/settings";
import { useLocalStorage } from "usehooks-ts";
import { languages } from "@/cells.json";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/features/bingo-card/lib";
import {
  $getBingoCards,
  $getReachedCards,
} from "@/features/bingo-card/actions";

export default function EventAdminPage() {
  const [token, setToken] = useLocalStorage<string>(
    "shizuoka-tech-bingo-admin-token",
    ""
  );
  const [markedCells, setMarkedCells] = useLocalStorage<number[]>(
    "shizuoka-tech-bingo-marked-cells",
    []
  );
  const [cellToMark, setCellToMark] = useState<number | null>(null);
  const [bingoCards, setBingoCards] = useState<Card[]>([]);
  const [newBingoCards, setNewBingoCards] = useState<Card[]>([]);
  const unmarkedCells = useMemo(() => {
    return languages
      .map((_, index) => index)
      .filter((index) => !markedCells.includes(index));
  }, [markedCells]);

  async function updateBingoCards() {
    if (!token) return;
    const cards = await $getBingoCards(token, markedCells);
    const newBingoCards = cards.filter(
      (card) => !bingoCards.find((c) => c.number === card.number)
    );
    setNewBingoCards(newBingoCards);
    setBingoCards((prev) => [...prev, ...newBingoCards]);
  }

  function markRandomCell() {
    if (unmarkedCells.length === 0) return;

    let cancelled = false;
    const duration = 2000; // 2秒
    const minInterval = 20;
    const maxInterval = 200;
    const startTime = Date.now();

    // 最終的に選ばれるセル
    const targetIndex = Math.floor(Math.random() * unmarkedCells.length);
    const targetCell = unmarkedCells[targetIndex];

    function animate() {
      if (cancelled) return;

      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        // アニメーション終了、確定
        setCellToMark(targetCell);
        setMarkedCells((prev) => {
          if (!prev.includes(targetCell)) {
            return [...prev, targetCell];
          }
          return prev;
        });
        updateBingoCards();
        return;
      }

      // イージングで間隔を計算
      const progress = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentInterval =
        minInterval + (maxInterval - minInterval) * easeOut;

      // ランダムなセルを一時的に表示
      const randomIndex = Math.floor(Math.random() * unmarkedCells.length);
      setCellToMark(unmarkedCells[randomIndex]);

      setTimeout(animate, currentInterval);
    }

    animate();

    // クリーンアップ
    return () => {
      cancelled = true;
    };
  }

  return (
    <div className="min-h-dvh relative grid place-items-center">
      <div className="absolute left-4 top-4">
        <Settings
          className="opacity-0 hover:opacity-100 transition-opacity duration-300"
          adminToken={token}
          setAdminToken={setToken}
          markedCells={markedCells}
          setMarkedCells={setMarkedCells}
        />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="text-center">
          {cellToMark !== null ? (
            <div className="flex flex-col gap-2">
              <div className="text-[10rem] font-bold">
                {cellToMark + 1}
                {". "}
                {languages[cellToMark].name}
              </div>
              <div className="text-[5rem] text-gray-500">
                {languages[cellToMark].description}
              </div>
            </div>
          ) : (
            <div className="text-[10rem] font-bold">...</div>
          )}
        </div>
        <div className="flex justify-center mb-8">
          <Button onClick={markRandomCell}>スタート</Button>
        </div>
        <div className="w-full px-32 flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-center">マークしたセル</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {languages.map((lang, index) => (
              <div
                key={lang.name}
                className={cn(
                  "text-2xl font-bold bg-gray-100 p-4 rounded-lg transition-all duration-300",
                  markedCells.includes(index) && "bg-blue-500 text-white",
                  markedCells[markedCells.length - 1] === index &&
                    "bg-green-500 text-white"
                )}
              >
                {index + 1}. {lang.name}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full px-32 flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-center">ビンゴしたカード</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {bingoCards.map((card) => (
              <div
                key={card.number}
                className={cn(
                  "text-2xl font-bold bg-gray-100 p-4 rounded-lg",
                  newBingoCards.includes(card) && "bg-green-500 text-white"
                )}
              >
                No. {card.number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
