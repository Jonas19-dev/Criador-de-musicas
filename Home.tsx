import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Music, Sparkles, Wand2, Layers, RefreshCw, History, ArrowRight, Star } from "lucide-react";

const GENRES = [
  { id: "pop", label: "Pop", emoji: "🎤", color: "oklch(0.72 0.18 340)" },
  { id: "rock", label: "Rock", emoji: "🎸", color: "oklch(0.65 0.2 25)" },
  { id: "rap_hiphop", label: "Rap / Hip-Hop", emoji: "🎧", color: "oklch(0.7 0.15 200)" },
  { id: "eletronico", label: "Eletrônico", emoji: "🎛️", color: "oklch(0.72 0.2 220)" },
  { id: "sertanejo", label: "Sertanejo", emoji: "🤠", color: "oklch(0.72 0.16 60)" },
  { id: "trap", label: "Trap", emoji: "🔊", color: "oklch(0.65 0.18 270)" },
];

const FEATURES = [
  {
    icon: Wand2,
    title: "Geração Inteligente",
    description: "Prompts especializados por gênero musical garantem letras autênticas e estilizadas.",
  },
  {
    icon: Layers,
    title: "Estrutura Profissional",
    description: "Verso, pré-refrão, refrão, ponte — cada seção criada com intenção artística.",
  },
  {
    icon: RefreshCw,
    title: "Refinamento Iterativo",
    description: "Reescreva versos, crie novas pontes ou adapte para outro gênero com um clique.",
  },
  {
    icon: History,
    title: "Histórico de Versões",
    description: "Cada iteração é salva. Volte a qualquer versão anterior da sua composição.",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/composer");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight">
              Compositor <span className="text-gradient">IA</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Button
                  size="sm"
                  onClick={() => navigate("/composer")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  Abrir Studio <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStart}
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  Entrar
                </Button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/8 blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(oklch(0.96 0.008 80) 1px, transparent 1px), linear-gradient(90deg, oklch(0.96 0.008 80) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative z-10 flex flex-col items-center text-center gap-8 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            Composição Musical com Inteligência Artificial
          </div>

          {/* Headline */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight max-w-4xl">
              Crie letras{" "}
              <span className="text-gradient italic">extraordinárias</span>
              <br />
              com o poder da IA
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-muted-foreground text-lg sm:text-xl max-w-2xl leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Do rap ao sertanejo, do pop ao trap — o Compositor IA gera letras musicais
            estruturadas, emocionalmente envolventes e estilizadas para cada gênero.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              size="lg"
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold gap-2.5 glow-purple transition-all duration-300 hover:scale-[1.02]"
            >
              <Wand2 className="w-5 h-5" />
              Começar a Compor
            </Button>
            <p className="text-muted-foreground text-sm">
              Gratuito · Sem cartão de crédito
            </p>
          </div>

          {/* Genre pills */}
          <div
            className="flex flex-wrap justify-center gap-2.5 mt-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {GENRES.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 hover:scale-105 cursor-default"
                style={{
                  borderColor: `${g.color}40`,
                  background: `${g.color}12`,
                  color: g.color,
                }}
              >
                <span>{g.emoji}</span>
                {g.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="container">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Funcionalidades</p>
            <h2 className="font-serif text-4xl font-bold">
              Tudo que você precisa para{" "}
              <span className="text-gradient-purple">compor</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card-elevated p-6 flex flex-col gap-4 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="container">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Como funciona</p>
            <h2 className="font-serif text-4xl font-bold">
              Três passos para sua{" "}
              <span className="text-gradient italic">obra-prima</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Defina os parâmetros",
                desc: "Informe o tema, gênero musical, humor desejado e palavras-chave que devem aparecer na letra.",
              },
              {
                step: "02",
                title: "A IA compõe",
                desc: "Nossos prompts especializados por gênero geram uma letra estruturada, coesa e emocionalmente envolvente.",
              },
              {
                step: "03",
                title: "Refine e perfeicione",
                desc: "Reescreva versos, crie novas pontes, adapte para outro gênero ou continue a música iterativamente.",
              },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="font-mono text-5xl font-bold text-gradient opacity-60">{item.step}</div>
                <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
        </div>
        <div className="container flex flex-col items-center text-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center animate-float">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold max-w-2xl">
            Sua próxima música começa{" "}
            <span className="text-gradient italic">agora</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            Junte-se a compositores que usam IA para expandir sua criatividade musical.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-base font-semibold gap-2.5 glow-purple transition-all duration-300 hover:scale-[1.02]"
          >
            <Wand2 className="w-5 h-5" />
            Criar Minha Primeira Letra
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span className="font-serif font-medium">Compositor IA</span>
          </div>
          <p>Criatividade musical potencializada por Inteligência Artificial</p>
        </div>
      </footer>
    </div>
  );
}
