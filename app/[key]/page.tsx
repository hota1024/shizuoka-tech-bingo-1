import { $getCardByKey } from "@/features/bingo-card/actions";
import { BingCard } from "@/features/bingo-card/components/bingo-card";
import { notFound } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const card = await $getCardByKey(key, process.env.ADMIN_TOKEN!);

  if (card === null) {
    notFound();
  }

  return (
    <div className="min-h-dvh grid place-items-center p-2">
      <BingCard card={card} className="w-full max-w-[600px]" />
    </div>
  );
}
