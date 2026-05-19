import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Music, ArrowLeft, Loader2, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComposerForm, type ComposerFormValues } from "@/components/ComposerForm";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { RefinementPanel } from "@/components/RefinementPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { VersionsPanel } from "@/components/VersionsPanel";
import { GenreBadge, type Genre } from "@/components/GenreBadge";
import { cn } from "@/lib/utils";

type RefinementAction = "rewrite_section" | "new_chorus" | "new_bridge" | "continue" | "adapt_genre" | "custom";

interface ActiveComposition {
  id: number;
  title: string;
  lyrics: string;
  genre: Genre;
  theme: string;
  mood: string;
}

export default function Composer() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeComposition, setActiveComposition] = useState<ActiveComposition | null>(null);
  const [refineSectionTarget, setRefineSectionTarget] = useState<string | undefined>();
  const utils = trpc.useUtils();

  const generateMutation = trpc.composer.generate.useMutation({
    onSuccess: (data) => {
      setActiveComposition({
        id: data.compositionId,
        title: data.title,
        lyrics: data.lyrics,
        genre: data.genre as Genre,
        theme: "",
        mood: "",
      });
      utils.composer.list.invalidate();
      toast.success("Letra gerada com sucesso!", {
        description: `"${data.title}" está pronta para você explorar.`,
      });
    },
    onError: (err) => {
      toast.error("Erro ao gerar letra", { description: err.message });
    },
  });

  const refineMutation = trpc.composer.refine.useMutation({
    onSuccess: (data) => {
      setActiveComposition((prev) =>
        prev ? { ...prev, lyrics: data.lyrics } : prev
      );
      setRefineSectionTarget(undefined);
      utils.composer.list.invalidate();
      toast.success("Letra refinada com sucesso!");
    },
    onError: (err) => {
      toast.error("Erro ao refinar letra", { description: err.message });
    },
  });

  const { data: compositionData } = trpc.composer.getById.useQuery(
    { id: activeComposition?.id ?? 0 },
    { enabled: false }
  );

  const handleGenerate = (values: ComposerFormValues) => {
    generateMutation.mutate(values);
  };

  const handleRefine = (params: {
    action: RefinementAction;
    targetSection?: string;
    newGenre?: Genre;
    customInstruction?: string;
  }) => {
    if (!activeComposition) return;
    refineMutation.mutate({
      compositionId: activeComposition.id,
      ...params,
    });
  };

  const handleSelectFromHistory = async (id: number) => {
    const compositions = await utils.composer.list.fetch();
    const comp = compositions?.find((c) => c.id === id);
    if (comp) {
      setActiveComposition({
        id: comp.id,
        title: comp.title ?? comp.theme,
        lyrics: comp.lyrics,
        genre: comp.genre as Genre,
        theme: comp.theme,
        mood: comp.mood,
      });
    }
  };

  const isGenerating = generateMutation.isPending;
  const isRefining = refineMutation.isPending;
  const isLoading = isGenerating || isRefining;

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-10 h-10 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2">Acesso necessário</h2>
            <p className="text-muted-foreground text-sm">
              Faça login para começar a criar suas letras musicais com IA.
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full"
          >
            <Wand2 className="w-4 h-4" />
            Entrar e Compor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Início</span>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Music className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-serif font-semibold text-sm">
                Compositor <span className="text-gradient">IA</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeComposition && (
              <div className="hidden sm:flex items-center gap-2">
                <GenreBadge genre={activeComposition.genre} size="sm" />
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {activeComposition.title}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="hidden sm:inline text-xs">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Layout ── */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">

          {/* ── Left Column: Form + Refinement + History ── */}
          <div className="flex flex-col gap-5">

            {/* Form Card */}
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Wand2 className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold">Nova Composição</h2>
                  <p className="text-xs text-muted-foreground">Defina os parâmetros da sua música</p>
                </div>
              </div>
              <ComposerForm onSubmit={handleGenerate} isLoading={isGenerating} />
            </div>

            {/* Refinement Panel — only when there's an active composition */}
            {activeComposition && (
              <div className="animate-fade-in-up">
                <RefinementPanel
                  onRefine={handleRefine}
                  isLoading={isRefining}
                  initialSection={refineSectionTarget}
                />
              </div>
            )}

            {/* Versions Panel — only when there's an active composition */}
            {activeComposition && (
              <div className="animate-fade-in-up">
                <VersionsPanel
                  compositionId={activeComposition.id}
                  genre={activeComposition.genre}
                  onRestoreVersion={(lyrics) => {
                    setActiveComposition((prev) => prev ? { ...prev, lyrics } : prev);
                    toast.success("Versão anterior restaurada!");
                  }}
                />
              </div>
            )}

            {/* History Panel */}
            <HistoryPanel
              currentCompositionId={activeComposition?.id}
              onSelectComposition={handleSelectFromHistory}
            />
          </div>

          {/* ── Right Column: Lyrics Display ── */}
          <div className="lg:sticky lg:top-[72px]">
            {isGenerating ? (
              /* Loading state */
              <div className="card-elevated p-8 flex flex-col items-center justify-center min-h-[500px] gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center animate-pulse-glow">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-primary-foreground animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl font-semibold mb-2">Compondo sua letra...</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    A IA está criando uma composição única e personalizada para você.
                  </p>
                </div>
                {/* Animated bars */}
                <div className="flex items-end gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-primary/40"
                      style={{
                        height: `${20 + Math.sin(i * 0.8) * 12}px`,
                        animation: `pulse 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : isRefining ? (
              /* Refining state */
              <div className="card-elevated p-8 flex flex-col items-center justify-center min-h-[300px] gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-lg font-semibold mb-1">Refinando...</h3>
                  <p className="text-muted-foreground text-sm">Aplicando as modificações solicitadas.</p>
                </div>
              </div>
            ) : activeComposition ? (
              /* Lyrics display */
              <div
                className={cn(
                  "card-elevated p-6 animate-fade-in-up",
                  "max-h-[calc(100vh-120px)] overflow-y-auto"
                )}
              >
                <LyricsDisplay
                  lyrics={activeComposition.lyrics}
                  title={activeComposition.title}
                  genre={activeComposition.genre}
                  onRefineSection={(section) => {
                    setRefineSectionTarget(section);
                    // Scroll to refinement panel on mobile
                    document.querySelector("[data-refinement]")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              </div>
            ) : (
              /* Empty state */
              <div className="card-elevated p-12 flex flex-col items-center justify-center min-h-[500px] gap-6 text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-float">
                    <Music className="w-10 h-10 text-primary/60" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-3">
                    Sua composição aparecerá aqui
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    Preencha o formulário ao lado com o tema, gênero e humor da sua música
                    e deixe a IA criar algo extraordinário.
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground/60">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    Estrutura profissional com verso, refrão e ponte
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    Prompts especializados por gênero musical
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    Refinamento iterativo ilimitado
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
