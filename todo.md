# Compositor IA — TODO

## Backend / Banco de Dados
- [x] Criar tabela `compositions` no schema Drizzle (id, userId, title, theme, genre, mood, keywords, lyrics, createdAt)
- [x] Criar tabela `composition_versions` para histórico de versões (id, compositionId, lyrics, action, createdAt)
- [x] Executar migration SQL no banco
- [x] Criar helpers de DB em server/db.ts (saveComposition, getCompositions, saveVersion, getVersions)
- [x] Criar router `composer` em server/routers/composer.ts com procedures: generate, refine, list, getVersions
- [x] Implementar lógica de prompts especializados por gênero (rap, pop, rock, eletrônico, sertanejo, trap)
- [x] Integrar invokeLLM com prompts de geração e refinamento
- [x] Registrar router no appRouter

## Front-end — Páginas e Componentes
- [x] Atualizar index.css com tema escuro sofisticado (paleta roxa/dourada, fontes refinadas)
- [x] Atualizar client/index.html com fontes Google (Playfair Display + Inter)
- [x] Criar página Home.tsx com landing page elegante (hero, CTA, features)
- [x] Criar página Composer.tsx — página principal de composição
- [x] Criar componente ComposerForm.tsx — formulário de entrada (tema, gênero, humor, palavras-chave)
- [x] Criar componente LyricsDisplay.tsx — exibição da letra com seções destacadas
- [x] Criar componente RefinementPanel.tsx — painel de refinamento iterativo
- [x] Criar componente HistoryPanel.tsx — histórico de composições da sessão
- [x] Criar componente GenreBadge.tsx — badge visual por gênero musical
- [x] Adicionar rota /composer em App.tsx
- [x] Botão copiar letra para clipboard com feedback visual
- [x] Estados de loading com animações elegantes
- [x] Interface responsiva (mobile-first)

## Qualidade e Entrega
- [x] Escrever testes Vitest para procedures do composer router
- [x] Revisar todo.md e marcar itens concluídos
- [x] Criar checkpoint final

## Melhorias Identificadas
- [x] Adicionar UI para visualizar versões anteriores da composição (VersionsPanel)
