import { cn } from "@/lib/utils";

export type Genre = "pop" | "rock" | "rap_hiphop" | "eletronico" | "sertanejo" | "trap";

const GENRE_CONFIG: Record<Genre, { label: string; emoji: string; color: string; bg: string }> = {
  pop: { label: "Pop", emoji: "🎤", color: "oklch(0.72 0.18 340)", bg: "oklch(0.72 0.18 340 / 0.12)" },
  rock: { label: "Rock", emoji: "🎸", color: "oklch(0.65 0.2 25)", bg: "oklch(0.65 0.2 25 / 0.12)" },
  rap_hiphop: { label: "Rap / Hip-Hop", emoji: "🎧", color: "oklch(0.7 0.15 200)", bg: "oklch(0.7 0.15 200 / 0.12)" },
  eletronico: { label: "Eletrônico", emoji: "🎛️", color: "oklch(0.72 0.2 220)", bg: "oklch(0.72 0.2 220 / 0.12)" },
  sertanejo: { label: "Sertanejo", emoji: "🤠", color: "oklch(0.72 0.16 60)", bg: "oklch(0.72 0.16 60 / 0.12)" },
  trap: { label: "Trap", emoji: "🔊", color: "oklch(0.65 0.18 270)", bg: "oklch(0.65 0.18 270 / 0.12)" },
};

interface GenreBadgeProps {
  genre: Genre;
  size?: "sm" | "md";
  className?: string;
}

export function GenreBadge({ genre, size = "md", className }: GenreBadgeProps) {
  const config = GENRE_CONFIG[genre];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        color: config.color,
        background: config.bg,
        borderColor: `${config.color}40`,
      }}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}

export { GENRE_CONFIG };
