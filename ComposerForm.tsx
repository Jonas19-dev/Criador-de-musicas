import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Genre } from "./GenreBadge";

const GENRES: { id: Genre; label: string; emoji: string; desc: string; color: string }[] = [
  { id: "pop",       label: "Pop",          emoji: "🎤", desc: "Refrões cativantes",    color: "oklch(0.72 0.18 340)" },
  { id: "rock",      label: "Rock",         emoji: "🎸", desc: "Intensidade e energia", color: "oklch(0.65 0.2 25)"  },
  { id: "rap_hiphop",label: "Rap / Hip-Hop",emoji: "🎧", desc: "Rimas e flow",          color: "oklch(0.7 0.15 200)" },
  { id: "eletronico",label: "Eletrônico",   emoji: "🎛️", desc: "Atmosfera e textura",  color: "oklch(0.72 0.2 220)" },
  { id: "sertanejo", label: "Sertanejo",    emoji: "🤠", desc: "Emoção e sentimento",   color: "oklch(0.72 0.16 60)" },
  { id: "trap",      label: "Trap",         emoji: "🔊", desc: "Estética urbana",       color: "oklch(0.65 0.18 270)"},
];

const MOODS = [
  "Melancólico", "Eufórico", "Romântico", "Nostálgico", "Raivoso",
  "Esperançoso", "Saudoso", "Angustiado", "Celebrativo", "Reflexivo",
];

export interface ComposerFormValues {
  theme: string;
  genre: Genre;
  mood: string;
  keywords: string;
}

interface ComposerFormProps {
  onSubmit: (values: ComposerFormValues) => void;
  isLoading: boolean;
}

export function ComposerForm({ onSubmit, isLoading }: ComposerFormProps) {
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState<Genre>("pop");
  const [mood, setMood] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [keywords, setKeywords] = useState("");

  const selectedMood = mood === "__custom__" ? customMood : mood;
  const canSubmit = theme.trim() && genre && selectedMood.trim() && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ theme: theme.trim(), genre, mood: selectedMood.trim(), keywords: keywords.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {/* Tema */}
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-medium text-foreground/90">
          Tema da música <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={theme}
          onChange={e => setTheme(e.target.value)}
          placeholder="Ex: Uma história de amor que terminou mas deixou saudades eternas..."
          className="resize-none bg-input border-border focus:border-primary/60 focus:ring-primary/20 text-sm leading-relaxed min-h-[80px] placeholder:text-muted-foreground/50"
          maxLength={500}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground text-right">{theme.length}/500</p>
      </div>

      {/* Gênero */}
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-medium text-foreground/90">
          Gênero musical <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {GENRES.map((g) => {
            const isSelected = genre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGenre(g.id)}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-200",
                  isSelected
                    ? "scale-[1.02]"
                    : "border-border bg-surface-1 hover:border-border/80 hover:bg-surface-2"
                )}
                style={
                  isSelected
                    ? {
                        borderColor: `${g.color}60`,
                        background: `${g.color}12`,
                        boxShadow: `0 0 16px ${g.color}20`,
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{g.emoji}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? g.color : undefined }}
                  >
                    {g.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{g.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Humor */}
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-medium text-foreground/90">
          Humor / Emoção desejada <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const isSelected = mood === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => { setMood(m); setCustomMood(""); }}
                disabled={isLoading}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all duration-200",
                  isSelected
                    ? "bg-primary/15 border-primary/50 text-primary font-medium"
                    : "border-border bg-surface-1 text-muted-foreground hover:border-border/80 hover:text-foreground"
                )}
              >
                {m}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMood("__custom__")}
            disabled={isLoading}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-all duration-200",
              mood === "__custom__"
                ? "bg-primary/15 border-primary/50 text-primary font-medium"
                : "border-border bg-surface-1 text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
          >
            + Outro
          </button>
        </div>
        {mood === "__custom__" && (
          <Input
            value={customMood}
            onChange={e => setCustomMood(e.target.value)}
            placeholder="Descreva o humor desejado..."
            className="bg-input border-border focus:border-primary/60 text-sm"
            disabled={isLoading}
            autoFocus
          />
        )}
      </div>

      {/* Palavras-chave */}
      <div className="flex flex-col gap-2.5">
        <Label className="text-sm font-medium text-foreground/90">
          Palavras-chave obrigatórias{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="Ex: chuva, distância, promessa, madrugada..."
          className="bg-input border-border focus:border-primary/60 text-sm"
          disabled={isLoading}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          Separe por vírgulas. Essas palavras serão incorporadas naturalmente na letra.
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "w-full py-6 text-base font-semibold gap-3 transition-all duration-300",
          canSubmit
            ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-purple hover:scale-[1.01]"
            : "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Compondo sua letra...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Gerar Letra Musical
          </>
        )}
      </Button>
    </form>
  );
}
