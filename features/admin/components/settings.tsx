import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { languages } from "@/cells.json";
import { Dispatch, SetStateAction } from "react";

export interface SettingsProps {
  className?: string;
  adminToken: string;
  setAdminToken: Dispatch<SetStateAction<string>>;
  markedCells: number[];
  setMarkedCells: Dispatch<SetStateAction<number[]>>;
}

export function Settings({
  className,
  adminToken,
  setAdminToken,
  markedCells,
  setMarkedCells,
}: SettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon />
            <span>設定</span>
          </DialogTitle>
          <DialogDescription>設定を変更します。</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Label htmlFor="admin-token">管理者トークン</Label>
            <Input
              id="admin-token"
              value={adminToken}
              autoFocus
              type="password"
              onChange={(e) => setAdminToken(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label>マークされたセル</Label>
            <Button
              variant="destructive"
              onClick={() => setMarkedCells([])}
              className="w-fit"
            >
              <TrashIcon /> <span>全て削除</span>
            </Button>
            <ScrollArea className="h-[200px]">
              <div className="flex flex-col gap-2">
                {markedCells.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    マークされたセルがありません
                  </div>
                )}
                {markedCells.map((cell) => (
                  <div key={cell} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setMarkedCells((prev) =>
                          prev.filter((c) => c !== cell)
                        );
                      }}
                    >
                      <TrashIcon />
                    </Button>
                    <span>{languages[cell].name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit">閉じる</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
