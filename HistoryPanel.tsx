import { useState } from "react";
import { History, ChevronDown, ChevronUp, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenreBadge } from "./GenreBadge";
import type { Genre } from "./GenreBadge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LyricsDisplay } from "./LyricsDisplay";

interface HistoryPanelProps {
  currentCompositionId?: number;
  onSelectComposition: (id: number) => void;
}

export function HistoryPanel({ currentCompositionId, onSelectComposition }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [previewLyrics, setPreviewLyrics] = useState<{ title: string; lyrics: string; genre: Genre } | null>(null);

  const { data: compositions, isLoading } = trpc.composer.list.useQuery();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="card-elevated overflow-hidden">
        {/* Header */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center">
              <History className="w-4 h-4 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Histórico</p>
              <p className="text-xs text-muted-foreground">
                {compositions?.length ?? 0} composição{(compositions?.length ?? 0) !== 1 ? "ões" : ""}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {isOpen && (
          <div className="border-t border-border/50">
            {isLoading ? (
              <div className="px-5 py-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-xs">Carregando...</span>
                </div>
              </div>
            ) : !compositions || compositions.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
                <History className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma composição ainda</p>
                <p className="text-xs text-muted-foreground/60">Suas músicas aparecerão aqui</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {compositions.map((comp) => {
                  const isCurrent = comp.id === currentCompositionId;
                  return (
                    <div
                      key={comp.id}
                      className={cn(
                        "flex items-start gap-3 px-5 py-3.5 border-b border-border/30 last:border-b-0 transition-colors duration-200",
                        isCurrent ? "bg-primary/8" : "hover:bg-surface-2/50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <p className="text-sm font-medium text-foreground truncate">
                            {comp.title ?? comp.theme}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <GenreBadge genre={comp.genre as Genre} size="sm" />
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(comp.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                          onClick={() =>
                            setPreviewLyrics({
                              title: comp.title ?? comp.theme,
                              lyrics: comp.lyrics,
                              genre: comp.genre as Genre,
                            })
                          }
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {!isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                            onClick={() => onSelectComposition(comp.id)}
                          >
                            Abrir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewLyrics} onOpenChange={() => setPreviewLyrics(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{previewLyrics?.title}</DialogTitle>
          </DialogHeader>
          {previewLyrics && (
            <LyricsDisplay
              lyrics={previewLyrics.lyrics}
              genre={previewLyrics.genre}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
