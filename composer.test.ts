import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock LLM ────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: `[Verso 1]
Nas sombras da cidade que dorme
Carrego o peso de um amor que some
Cada rua guarda uma memória
De quando éramos parte da mesma história

[Pré-Refrão]
Mas o tempo não para por ninguém
E o que foi nosso agora não tem

[Refrão]
Saudade é o nome do que sinto
É o eco do amor que eu extinto
Saudade me consome devagar
É o preço de quem aprendeu a amar

[Verso 2]
Nas fotos antigas você ainda sorri
Como se soubesse que um dia eu ia sentir
A ausência que pesa mais que presença
O silêncio que grita com toda a veemência

[Ponte]
E se o tempo é um rio que não volta
Deixa eu nadar nessa corrente solta
Carregando o que foi e o que não é
Mas guardando você no fundo de mim

[Refrão Final]
Saudade é o nome do que sinto
É o eco do amor que eu extinto
Saudade me consome devagar
É o preço eterno de quem soube amar`,
        },
      },
    ],
  }),
}));

// ─── Mock DB ─────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  saveComposition: vi.fn().mockResolvedValue(42),
  updateCompositionLyrics: vi.fn().mockResolvedValue(undefined),
  getCompositionsByUser: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      title: "Saudade Eterna",
      theme: "amor perdido",
      genre: "pop",
      mood: "Melancólico",
      keywords: "saudade",
      lyrics: "[Verso 1]\nTeste",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getCompositionById: vi.fn().mockResolvedValue({
    id: 42,
    userId: 1,
    title: "Saudade Eterna",
    theme: "amor perdido",
    genre: "pop",
    mood: "Melancólico",
    keywords: "saudade",
    lyrics: "[Verso 1]\nTeste",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  saveCompositionVersion: vi.fn().mockResolvedValue(undefined),
  getVersionsByComposition: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// ─── Context factory ──────────────────────────────────────────────────────────
function makeCtx(overrides?: Partial<TrpcContext>): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("composer.generate", () => {
  it("returns compositionId, title and lyrics on success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.composer.generate({
      theme: "amor perdido",
      genre: "pop",
      mood: "Melancólico",
      keywords: "saudade, distância",
    });

    expect(result).toHaveProperty("compositionId");
    expect(result).toHaveProperty("lyrics");
    expect(result).toHaveProperty("title");
    expect(typeof result.lyrics).toBe("string");
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("includes [Verso 1] section in generated lyrics", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.composer.generate({
      theme: "liberdade",
      genre: "rock",
      mood: "Eufórico",
      keywords: "",
    });
    expect(result.lyrics).toContain("[Verso 1]");
    expect(result.lyrics).toContain("[Refrão]");
  });
});

describe("composer.list", () => {
  it("returns list of compositions for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.composer.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("genre");
  });
});

describe("composer.refine", () => {
  it("returns updated lyrics after refinement", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.composer.refine({
      compositionId: 42,
      action: "new_chorus",
    });
    expect(result).toHaveProperty("compositionId", 42);
    expect(result).toHaveProperty("lyrics");
    expect(typeof result.lyrics).toBe("string");
  });

  it("throws FORBIDDEN when user does not own composition", async () => {
    const { getCompositionById } = await import("./db");
    vi.mocked(getCompositionById).mockResolvedValueOnce({
      id: 42,
      userId: 999, // different user
      title: "Other",
      theme: "test",
      genre: "pop",
      mood: "test",
      keywords: null,
      lyrics: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.composer.refine({ compositionId: 42, action: "new_chorus" })
    ).rejects.toThrow();
  });
});

describe("composer.getVersions", () => {
  it("returns empty array when no versions exist", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.composer.getVersions({ compositionId: 42 });
    expect(Array.isArray(result)).toBe(true);
  });
});
