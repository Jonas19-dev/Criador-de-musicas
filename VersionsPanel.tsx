import { useState } from "react";
import { GitBranch, ChevronDown, ChevronUp, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LyricsDisplay } from "./LyricsDisplay";
import type { Genre } from "./GenreBadge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  rewrite_section: "Seção reescrita",
  new_chorus: "Novo refrão",
  new_bridge: "Nova ponte",
  continue: "Música continuada",
  adapt_genre: "Gênero adaptado",
  custom: "Modificação livre",
};

interface VersionsPanelProps {
  compositionId: number;
  genre?: Genre;
  onRestoreVersion?: (lyrics: string) => void;
}

export function VersionsPanel({ compositionId, genre, onRestoreVersion }: VersionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<{ lyrics: string; action: string } | null>(null);

  const { data: versions, isLoading } = trpc.composer.getVersions.useQuery(
    { compositionId },
    { enabled: isOpen }
  );

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="card-elevated overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/30 border border-border flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Versões Anteriores</p>
              <p className="text-xs text-muted-foreground">Histórico de refinamentos</p>
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
                <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : !versions || versions.length === 0 ? (
              <div className="px-5 py-6 flex flex-col items-center gap-2 text-center">
                <GitBranch className="w-7 h-7 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma versão anterior</p>
                <p className="text-xs text-muted-foreground/60">
                  Use o refinamento para criar versões
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-border/30 last:border-b-0 hover:bg-surface-2/50 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {ACTION_LABELS[version.action] ?? version.action}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(version.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                        onClick={() => setPreviewVersion({ lyrics: version.lyrics, action: ACTION_LABELS[version.action] ?? version.action })}
                      >
                        Ver
                      </Button>
                      {onRestoreVersion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-amber-500/10 hover:text-amber-400"
                          title="Restaurar esta versão"
                          onClick={() => onRestoreVersion(version.lyrics)}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Versão anterior — {previewVersion?.action}
            </DialogTitle>
          </DialogHeader>
          {previewVersion && (
            <LyricsDisplay lyrics={previewVersion.lyrics} genre={genre} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
