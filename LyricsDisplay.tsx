import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Genre } from "./GenreBadge";
import { GENRE_CONFIG } from "./GenreBadge";

interface LyricsSection {
  label: string;
  content: string;
}

const SECTION_COLORS: Record<string, { border: string; label: string; bg: string }> = {
  "Verso 1":      { border: "oklch(0.62 0.22 295 / 0.5)", label: "oklch(0.72 0.18 295)", bg: "oklch(0.62 0.22 295 / 0.06)" },
  "Pré-Refrão":   { border: "oklch(0.72 0.16 78 / 0.5)",  label: "oklch(0.78 0.16 78)",  bg: "oklch(0.72 0.16 78 / 0.06)"  },
  "Refrão":       { border: "oklch(0.72 0.18 340 / 0.6)", label: "oklch(0.78 0.18 340)", bg: "oklch(0.72 0.18 340 / 0.08)" },
  "Verso 2":      { border: "oklch(0.62 0.22 295 / 0.5)", label: "oklch(0.72 0.18 295)", bg: "oklch(0.62 0.22 295 / 0.06)" },
  "Ponte":        { border: "oklch(0.7 0.2 220 / 0.5)",   label: "oklch(0.72 0.2 220)",  bg: "oklch(0.7 0.2 220 / 0.06)"  },
  "Verso 3":      { border: "oklch(0.62 0.22 295 / 0.5)", label: "oklch(0.72 0.18 295)", bg: "oklch(0.62 0.22 295 / 0.06)" },
  "Refrão Final": { border: "oklch(0.72 0.18 340 / 0.7)", label: "oklch(0.78 0.18 340)", bg: "oklch(0.72 0.18 340 / 0.1)"  },
};

function parseLyrics(lyrics: string): LyricsSection[] {
  const sections: LyricsSection[] = [];
  const lines = lyrics.split("\n");
  let currentLabel = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^\[(.+?)\]/);
    if (sectionMatch) {
      if (currentLabel && currentLines.some(l => l.trim())) {
        sections.push({ label: currentLabel, content: currentLines.join("\n").trim() });
      }
      currentLabel = sectionMatch[1];
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLabel && currentLines.some(l => l.trim())) {
    sections.push({ label: currentLabel, content: currentLines.join("\n").trim() });
  }

  // Fallback: if no sections found, show as plain text
  if (sections.length === 0 && lyrics.trim()) {
    sections.push({ label: "Letra", content: lyrics.trim() });
  }

  return sections;
}

interface LyricsDisplayProps {
  lyrics: string;
  title?: string;
  genre?: Genre;
  onRefineSection?: (section: string) => void;
}

export function LyricsDisplay({ lyrics, title, genre, onRefineSection }: LyricsDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const sections = parseLyrics(lyrics);
  const genreConfig = genre ? GENRE_CONFIG[genre] : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lyrics);
      setCopied(true);
      toast.success("Letra copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Tente manualmente.");
    }
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {title && (
            <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">{title}</h2>
          )}
          {genreConfig && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: genreConfig.color }}>
              <span>{genreConfig.emoji}</span>
              <span className="font-medium">{genreConfig.label}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "shrink-0 gap-2 transition-all duration-200",
            copied
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-border hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          )}
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> Copiado</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copiar</>
          )}
        </Button>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {sections.map((section, index) => {
          const colors = SECTION_COLORS[section.label] ?? {
            border: "oklch(0.62 0.22 295 / 0.4)",
            label: "oklch(0.72 0.18 295)",
            bg: "oklch(0.62 0.22 295 / 0.05)",
          };
          const isExpanded = expandedSections[section.label] !== false; // default expanded

          return (
            <div
              key={`${section.label}-${index}`}
              className="rounded-xl border overflow-hidden transition-all duration-300 animate-fade-in-up"
              style={{
                borderColor: colors.border,
                background: colors.bg,
                animationDelay: `${index * 0.06}s`,
              }}
            >
              {/* Section header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer group"
                onClick={() => toggleSection(section.label)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="section-label"
                    style={{ color: colors.label }}
                  >
                    {section.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onRefineSection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefineSection(section.label);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-md border transition-all duration-200 hover:bg-primary/10"
                      style={{ borderColor: colors.border, color: colors.label }}
                    >
                      Reescrever
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Section content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-gradient-to-r from-transparent mb-3" style={{ backgroundImage: `linear-gradient(to right, ${colors.border}, transparent)` }} />
                  <pre
                    className="font-sans text-sm leading-7 text-foreground/90 whitespace-pre-wrap"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
