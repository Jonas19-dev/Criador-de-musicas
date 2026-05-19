import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Music2,
  Layers,
  ArrowRight,
  Shuffle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Genre } from "./GenreBadge";

type RefinementAction = "rewrite_section" | "new_chorus" | "new_bridge" | "continue" | "adapt_genre" | "custom";

const SECTIONS = ["Verso 1", "Pré-Refrão", "Refrão", "Verso 2", "Verso 3", "Ponte", "Refrão Final"];

const GENRE_OPTIONS: { value: Genre; label: string; emoji: string }[] = [
  { value: "pop",        label: "Pop",          emoji: "🎤" },
  { value: "rock",       label: "Rock",         emoji: "🎸" },
  { value: "rap_hiphop", label: "Rap / Hip-Hop",emoji: "🎧" },
  { value: "eletronico", label: "Eletrônico",   emoji: "🎛️" },
  { value: "sertanejo",  label: "Sertanejo",    emoji: "🤠" },
  { value: "trap",       label: "Trap",         emoji: "🔊" },
];

const ACTIONS: {
  id: RefinementAction;
  label: string;
  icon: React.ElementType;
  desc: string;
  color: string;
}[] = [
  { id: "rewrite_section", label: "Reescrever Seção",    icon: RefreshCw,  desc: "Reescreva um verso ou seção específica",   color: "oklch(0.62 0.22 295)" },
  { id: "new_chorus",      label: "Novo Refrão",         icon: Music2,     desc: "Crie um refrão mais marcante e memorável", color: "oklch(0.72 0.18 340)" },
  { id: "new_bridge",      label: "Nova Ponte",          icon: Layers,     desc: "Adicione uma virada emocional à música",   color: "oklch(0.7 0.2 220)"   },
  { id: "continue",        label: "Continuar Música",    icon: ArrowRight, desc: "Adicione um novo verso à composição",      color: "oklch(0.72 0.16 78)"  },
  { id: "adapt_genre",     label: "Adaptar Gênero",      icon: Shuffle,    desc: "Reescreva a letra em outro estilo musical",color: "oklch(0.72 0.16 60)"  },
  { id: "custom",          label: "Instrução Livre",     icon: Sparkles,   desc: "Descreva qualquer modificação desejada",   color: "oklch(0.7 0.15 200)"  },
];

interface RefinementPanelProps {
  onRefine: (params: {
    action: RefinementAction;
    targetSection?: string;
    newGenre?: Genre;
    customInstruction?: string;
  }) => void;
  isLoading: boolean;
  initialSection?: string;
}

export function RefinementPanel({ onRefine, isLoading, initialSection }: RefinementPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedAction, setSelectedAction] = useState<RefinementAction | null>(
    initialSection ? "rewrite_section" : null
  );
  const [targetSection, setTargetSection] = useState(initialSection ?? "");
  const [newGenre, setNewGenre] = useState<Genre>("pop");
  const [customInstruction, setCustomInstruction] = useState("");

  const canSubmit =
    selectedAction &&
    !isLoading &&
    (selectedAction !== "rewrite_section" || targetSection) &&
    (selectedAction !== "adapt_genre" || newGenre) &&
    (selectedAction !== "custom" || customInstruction.trim());

  const handleSubmit = () => {
    if (!selectedAction || !canSubmit) return;
    onRefine({
      action: selectedAction,
      targetSection: selectedAction === "rewrite_section" ? targetSection : undefined,
      newGenre: selectedAction === "adapt_genre" ? newGenre : undefined,
      customInstruction: selectedAction === "custom" ? customInstruction.trim() : undefined,
    });
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Refinamento</p>
            <p className="text-xs text-muted-foreground">Itere e melhore sua composição</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 flex flex-col gap-5 border-t border-border/50">
          {/* Action grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
            {ACTIONS.map((action) => {
              const isSelected = selectedAction === action.id;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setSelectedAction(action.id)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200",
                    isSelected
                      ? "scale-[1.01]"
                      : "border-border bg-surface-1/50 hover:border-border/80 hover:bg-surface-2/50"
                  )}
                  style={
                    isSelected
                      ? {
                          borderColor: `${action.color}50`,
                          background: `${action.color}10`,
                        }
                      : {}
                  }
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: `${action.color}15`,
                      border: `1px solid ${action.color}30`,
                    }}
                  >
                    <action.icon
                      className="w-3.5 h-3.5"
                      style={{ color: isSelected ? action.color : undefined }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium leading-tight"
                      style={{ color: isSelected ? action.color : undefined }}
                    >
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional inputs */}
          {selectedAction === "rewrite_section" && (
            <div className="flex flex-col gap-2 animate-fade-in-up">
              <Label className="text-sm font-medium">Seção a reescrever</Label>
              <Select value={targetSection} onValueChange={setTargetSection} disabled={isLoading}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione a seção..." />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedAction === "adapt_genre" && (
            <div className="flex flex-col gap-2 animate-fade-in-up">
              <Label className="text-sm font-medium">Adaptar para o gênero</Label>
              <Select value={newGenre} onValueChange={(v) => setNewGenre(v as Genre)} disabled={isLoading}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRE_OPTIONS.map(g => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.emoji} {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedAction === "custom" && (
            <div className="flex flex-col gap-2 animate-fade-in-up">
              <Label className="text-sm font-medium">Instrução personalizada</Label>
              <Input
                value={customInstruction}
                onChange={e => setCustomInstruction(e.target.value)}
                placeholder="Ex: Torne o refrão mais intenso e adicione mais metáforas..."
                className="bg-input border-border focus:border-primary/60 text-sm"
                disabled={isLoading}
                maxLength={500}
              />
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "w-full gap-2 transition-all duration-300",
              canSubmit
                ? "bg-primary/90 hover:bg-primary text-primary-foreground hover:scale-[1.01]"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Refinando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Aplicar Refinamento</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
