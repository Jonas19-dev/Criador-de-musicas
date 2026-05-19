import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getCompositionById,
  getCompositionsByUser,
  getVersionsByComposition,
  saveComposition,
  saveCompositionVersion,
  updateCompositionLyrics,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

// ─── Genre Prompt Strategies ─────────────────────────────────────────────────

const GENRE_PERSONAS: Record<string, string> = {
  pop: `Você é um compositor pop profissional de nível mundial, especialista em criar hits comerciais memoráveis. 
Seu estilo prioriza: refrões extremamente cativantes e fáceis de memorizar, melodias que grudam na cabeça, 
letras acessíveis com profundidade emocional, estrutura clara e repetição estratégica. 
Pense em artistas como Taylor Swift, Dua Lipa e The Weeknd.`,

  rock: `Você é um compositor de rock com décadas de experiência, criando músicas de impacto emocional intenso. 
Seu estilo prioriza: letras poderosas com imagens fortes e metáforas viscerais, energia e intensidade crescente, 
narrativas que constroem tensão e catarse, instrumentação imaginada como pesada e expressiva. 
Pense em Foo Fighters, Linkin Park e Paramore.`,

  rap_hiphop: `Você é um MC e compositor de rap/hip-hop de elite, mestre em flow, rimas e storytelling urbano. 
Seu estilo prioriza: esquemas de rimas complexos e multissilábicos, flow marcante com ritmo interno, 
linguagem impactante e direta, imagens do cotidiano urbano, punch lines memoráveis. 
Pense em Kendrick Lamar, Eminem e Drake.`,

  eletronico: `Você é um produtor e compositor de música eletrônica, criando letras que complementam paisagens sonoras. 
Seu estilo prioriza: texto atmosférico e sensorial, repetição hipnótica estratégica, imagens abstratas e sensoriais, 
letras que evocam movimento, energia e estados alterados de consciência. 
Pense em Daft Punk, The Chemical Brothers e Disclosure.`,

  sertanejo: `Você é um compositor sertanejo renomado, especialista em tocar fundo no coração do ouvinte. 
Seu estilo prioriza: letras que falam de amor, saudade e sentimentos profundos, linguagem popular e acessível, 
rimas naturais e fluentes, narrativas de relacionamentos e emoções do cotidiano, 
melodias que remetem ao campo e ao interior. 
Pense em Gusttavo Lima, Jorge & Mateus e Marília Mendonça.`,

  trap: `Você é um compositor de trap contemporâneo, com estética urbana e atitude. 
Seu estilo prioriza: flow cadenciado com pausas dramáticas, letras que transmitem atitude e confiança, 
referências à cultura urbana atual, uso criativo de repetição e variação, 
imagens de luxo, superação e identidade. 
Pense em Travis Scott, Future e Roddy Ricch.`,
};

const GENRE_LABELS: Record<string, string> = {
  pop: "Pop",
  rock: "Rock",
  rap_hiphop: "Rap/Hip-Hop",
  eletronico: "Eletrônico",
  sertanejo: "Sertanejo",
  trap: "Trap",
};

function buildGenerationPrompt(
  theme: string,
  genre: string,
  mood: string,
  keywords: string
): string {
  const keywordSection = keywords.trim()
    ? `\n\nPalavras-chave OBRIGATÓRIAS (incorpore naturalmente na letra): ${keywords}`
    : "";

  return `Crie uma letra musical completa e original com as seguintes especificações:

**Tema:** ${theme}
**Gênero:** ${GENRE_LABELS[genre] || genre}
**Humor/Emoção:** ${mood}${keywordSection}

**ESTRUTURA OBRIGATÓRIA** (use exatamente esses marcadores):

[Verso 1]
(4-6 linhas desenvolvendo o tema e introduzindo a narrativa)

[Pré-Refrão]
(2-4 linhas construindo tensão e preparando o refrão)

[Refrão]
(4-6 linhas — deve ser marcante, memorável e transmitir a emoção central)

[Verso 2]
(4-6 linhas aprofundando a narrativa, diferente do Verso 1)

[Ponte]
(4-6 linhas — momento de virada emocional ou novo ângulo da história)

[Refrão Final]
(Refrão com pequena variação ou intensificação emocional)

**DIRETRIZES DE QUALIDADE:**
- Evite clichês óbvios e repetições desnecessárias
- Use metáforas, figuras de linguagem e imagens poéticas compatíveis com o gênero
- Incorpore as palavras-chave de forma natural e orgânica
- A letra deve ter coesão narrativa e emocional do início ao fim
- Respeite as características estilísticas do gênero ${GENRE_LABELS[genre] || genre}

Retorne APENAS a letra formatada com os marcadores de seção, sem explicações adicionais.`;
}

function buildRefinementPrompt(
  currentLyrics: string,
  action: string,
  targetSection: string | undefined,
  newGenre: string | undefined,
  customInstruction: string | undefined,
  genre: string
): string {
  const baseContext = `Letra atual:\n\n${currentLyrics}\n\n`;

  switch (action) {
    case "rewrite_section":
      return `${baseContext}Reescreva apenas a seção [${targetSection}] desta letra, mantendo todas as outras seções exatamente iguais. 
A nova versão deve ser mais criativa, impactante e coerente com o estilo ${GENRE_LABELS[genre] || genre}.
Retorne a letra COMPLETA com a seção reescrita, mantendo todos os marcadores de seção.`;

    case "new_chorus":
      return `${baseContext}Crie um novo refrão completamente diferente para esta música, mais marcante e memorável.
Substitua APENAS a seção [Refrão] e [Refrão Final] pelo novo refrão (com pequena variação no final).
Retorne a letra COMPLETA com os novos refrões, mantendo todos os outros marcadores de seção.`;

    case "new_bridge":
      return `${baseContext}Crie uma nova ponte para esta música, com um ângulo emocional ou narrativo diferente.
Substitua APENAS a seção [Ponte] pela nova ponte.
Retorne a letra COMPLETA com a nova ponte, mantendo todos os outros marcadores de seção.`;

    case "continue":
      return `${baseContext}Continue esta música adicionando um [Verso 3] após o [Verso 2] e antes da [Ponte].
O novo verso deve aprofundar a narrativa e preparar para a resolução emocional da ponte.
Retorne a letra COMPLETA com o novo verso inserido, mantendo todos os marcadores de seção existentes.`;

    case "adapt_genre":
      return `${baseContext}Adapte esta letra para o gênero musical ${GENRE_LABELS[newGenre || "pop"] || newGenre}.
Mantenha o tema central e a estrutura de seções, mas reescreva o estilo, vocabulário, rimas e imagens 
para que sejam autênticos ao gênero ${GENRE_LABELS[newGenre || "pop"] || newGenre}.
Retorne a letra COMPLETA adaptada, mantendo todos os marcadores de seção.`;

    case "custom":
      return `${baseContext}Aplique a seguinte modificação na letra: ${customInstruction}
Retorne a letra COMPLETA após a modificação, mantendo todos os marcadores de seção.`;

    default:
      return `${baseContext}Melhore a qualidade geral desta letra, tornando-a mais criativa e impactante.
Retorne a letra COMPLETA melhorada, mantendo todos os marcadores de seção.`;
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const composerRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        theme: z.string().min(1).max(500),
        genre: z.enum(["pop", "rock", "rap_hiphop", "eletronico", "sertanejo", "trap"]),
        mood: z.string().min(1).max(255),
        keywords: z.string().max(500).optional().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const persona = GENRE_PERSONAS[input.genre];
      const userPrompt = buildGenerationPrompt(
        input.theme,
        input.genre,
        input.mood,
        input.keywords
      );

      const response = await invokeLLM({
        messages: [
          { role: "system", content: persona },
          { role: "user", content: userPrompt },
        ],
      });

      const lyrics = (response.choices[0]?.message?.content as string) ?? "";
      if (!lyrics) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao gerar letra" });

      // Gerar título automático baseado no tema
      const titleResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você cria títulos criativos e curtos para músicas. Responda APENAS com o título, sem aspas ou explicações.",
          },
          {
            role: "user",
            content: `Crie um título criativo e marcante para uma música de ${GENRE_LABELS[input.genre]} com o tema: "${input.theme}". Máximo 5 palavras.`,
          },
        ],
      });
      const title = ((titleResponse.choices[0]?.message?.content as string) ?? "").trim() || input.theme;

      const compositionId = await saveComposition({
        userId: ctx.user.id,
        title,
        theme: input.theme,
        genre: input.genre,
        mood: input.mood,
        keywords: input.keywords || null,
        lyrics,
      });

      return { compositionId, title, lyrics, genre: input.genre };
    }),

  refine: protectedProcedure
    .input(
      z.object({
        compositionId: z.number(),
        action: z.enum(["rewrite_section", "new_chorus", "new_bridge", "continue", "adapt_genre", "custom"]),
        targetSection: z.string().optional(),
        newGenre: z.enum(["pop", "rock", "rap_hiphop", "eletronico", "sertanejo", "trap"]).optional(),
        customInstruction: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const composition = await getCompositionById(input.compositionId);
      if (!composition) throw new TRPCError({ code: "NOT_FOUND", message: "Composição não encontrada" });
      if (composition.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });

      const effectiveGenre = input.action === "adapt_genre" ? (input.newGenre ?? composition.genre) : composition.genre;
      const persona = GENRE_PERSONAS[effectiveGenre];

      const userPrompt = buildRefinementPrompt(
        composition.lyrics,
        input.action,
        input.targetSection,
        input.newGenre,
        input.customInstruction,
        composition.genre
      );

      const response = await invokeLLM({
        messages: [
          { role: "system", content: persona },
          { role: "user", content: userPrompt },
        ],
      });

      const newLyrics = (response.choices[0]?.message?.content as string) ?? "";
      if (!newLyrics) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao refinar letra" });

      // Salvar versão anterior antes de atualizar
      await saveCompositionVersion({
        compositionId: input.compositionId,
        lyrics: composition.lyrics,
        action: input.action,
      });

      await updateCompositionLyrics(input.compositionId, newLyrics);

      return { compositionId: input.compositionId, lyrics: newLyrics };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return getCompositionsByUser(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const composition = await getCompositionById(input.id);
      if (!composition) throw new TRPCError({ code: "NOT_FOUND" });
      if (composition.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return composition;
    }),

  getVersions: protectedProcedure
    .input(z.object({ compositionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const composition = await getCompositionById(input.compositionId);
      if (!composition) throw new TRPCError({ code: "NOT_FOUND" });
      if (composition.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      return getVersionsByComposition(input.compositionId);
    }),
});
