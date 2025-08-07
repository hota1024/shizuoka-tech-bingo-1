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
  $getHitCards,
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
  const [hitCards, setHitCards] = useState<Card[]>([]);
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

  async function updateHitCards(cellToMark: number) {
    if (!token) return;
    console.log("updateHitCards", cellToMark);
    const cards = await $getHitCards(token, cellToMark);
    setHitCards(cards);
  }

  function markRandomCell() {
    if (unmarkedCells.length === 0) return;
    setHitCards([]);

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
        updateHitCards(targetCell);
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
    <div className="min-h-dvh relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      {/* 設定ボタン */}
      <div className="absolute left-6 top-6 z-10">
        <Settings
          className="opacity-0 hover:opacity-100 transition-all duration-300 bg-white/10 backdrop-blur-sm rounded-lg p-2"
          adminToken={token}
          setAdminToken={setToken}
          markedCells={markedCells}
          setMarkedCells={setMarkedCells}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* メインコンテンツ */}
        <div className="flex flex-col items-center gap-8 max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4">
              プログラミング言語ビンゴ
            </h1>
            <p className="text-gray-300 text-lg md:text-xl">ShizuokaTECH#1</p>
          </div>

          {/* 抽選結果表示エリア */}
          <div className="w-full max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center">
                {cellToMark !== null ? (
                  <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                      <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                        {cellToMark + 1}
                      </div>
                      <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                        {languages[cellToMark].name}
                      </div>
                      <div className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                        {languages[cellToMark].description}
                      </div>
                    </div>

                    {/* ヒットしたカード */}
                    {hitCards.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">
                          🎉 ヒットしたカード
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {hitCards.map((card) => (
                            <div
                              key={card.number}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all duration-200 animate-bounce"
                            >
                              No. {card.number}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-6xl md:text-8xl font-bold text-gray-400 animate-pulse">
                    ...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* スタートボタン */}
          <div className="flex justify-center mb-12">
            <Button
              onClick={markRandomCell}
              disabled={unmarkedCells.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {unmarkedCells.length === 0 ? "全て完了！" : "🎲 スタート"}
            </Button>
          </div>

          {/* マークしたセル */}
          <div className="w-full max-w-6xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
              <h2 className="text-3xl font-bold text-center text-white mb-6">
                📍 マークしたセル ({markedCells.length}/{languages.length})
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {languages.map((lang, index) => (
                  <div
                    key={lang.name}
                    className={cn(
                      "text-lg font-bold px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer",
                      markedCells.includes(index)
                        ? markedCells[markedCells.length - 1] === index
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg animate-pulse"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-white/20 text-gray-300 hover:bg-white/30"
                    )}
                  >
                    {index + 1}. {lang.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ビンゴしたカード */}
          <div className="w-full max-w-6xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-center text-white mb-6">
                🏆 ビンゴしたカード ({bingoCards.length})
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {bingoCards.length > 0 ? (
                  bingoCards.map((card) => (
                    <div
                      key={card.number}
                      className={cn(
                        "text-xl font-bold px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105",
                        newBingoCards.includes(card)
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg animate-bounce"
                          : "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      )}
                    >
                      No. {card.number}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-xl italic">
                    まだビンゴしたカードはありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
