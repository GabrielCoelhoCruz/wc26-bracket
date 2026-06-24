# WC26 Bracket + Draft Game — Plano Completo de Redesign & Funcionalidades

> **Data:** 23/06/2026  
> **Stack:** Next.js 16 + TypeScript + TailwindCSS v4 + lucide-react  
> **Projeto:** `~/Desktop/wc26-bracket/`

---

## Sumário

1. [Fase 1 — Fundação Visual (Design System)](#fase-1--fundação-visual-design-system)
2. [Fase 2 — Bracket (Refinamento)](#fase-2--bracket-refinamento)
3. [Fase 3 — Draft Game (Campo Visual)](#fase-3--draft-game-campo-visual)
4. [Fase 4 — Sharing & Ranking](#fase-4--sharing--ranking)
5. [Fase 5 — Deploy & Polimento](#fase-5--deploy--polimento)
6. [Roadmap Visual & Dependências](#roadmap-visual--dependências)

---

## Fase 1 — Fundação Visual (Design System)

### 1.1 Paleta de Cores — Variáveis CSS

Substituir as cores soltas no Tailwind por variáveis semânticas no `globals.css`.

```css
:root {
  /* Estádio (background) */
  --bg-stadium: #0a0a0a;

  /* Gramado */
  --grass-dark: #1a5c2a;
  --grass-mid: #22c55e;
  --grass-light: #4ade80;

  /* Gol (ouro) */
  --gold: #fbbf24;
  --gold-dark: #f59e0b;

  /* Cartões */
  --red-card: #dc2626;
  --yellow-card: #eab308;

  /* Telão LED */
  --led: #22c55e;

  /* Neutros estádio */
  --concrete: #fafafa;
  --concrete-dark: #a1a1aa;
  --tunnel: #27272a;
  --tunnel-dark: #18181b;

  /* Tipografia */
  --font-scoreboard: 'JetBrains Mono', monospace;
}
```

**Arquivos afetados:**
- `src/app/globals.css` — Adicionar variáveis + utilitários
- `tailwind.config.ts` — Mapear variáveis para Tailwind (se aplicável no v4)

### 1.2 Tipografia

- **Headings:** JetBrains Mono (mono-espaçada, tracking largo — estilo letreiro)
- **Body:** Inter (padrão do projeto)
- **Números/placares:** Tabular figures forçadas via CSS (`font-variant-numeric: tabular-nums`)
- **Elemento decorativo:** Número "26" em destaque em páginas-chave

### 1.3 Componentes Base (Design System)

Criar em `src/components/ui/`:

| Componente | Descrição | Status |
|---|---|---|
| `StadiumButton` | Botão com textura de escudo, borda verde, hover dourado | 🔜 |
| `ScoreboardHeader` | Placar tipo telão LED: `🇧🇷 BRASIL 3 - 1 ARGENTINA 🇦🇷` | 🔜 |
| `FlagBadge` | Bandeira + código + badge de grupo opcional | 🔜 |
| `PitchCard` | Card com borda verde-grama, bg quase-pitch | 🔜 |
| `LiveIndicator` | Indicador "🔴 AO VIVO" pulsante | 🔜 |
| `StadiumSection` | Section com bordas laterais tipo "linha do campo" | 🔜 |

---

## Fase 2 — Bracket (Refinamento)

### 2.1 Conectar Vencedores Automáticos ⭐ Prioridade

**O que:** Quando o usuário palpitou o vencedor de um jogo R32, o time avança automaticamente pro slot correspondente na R16.

**Como:**
- No `bracket-resolver.ts`, depois de resolver R32, propagar winners via `nextSlotId`
- No `BracketTree.tsx`, mostrar vencedores da rodada anterior como pré-preenchidos
- Destacar com glow dourado quando o palpite do usuário coincide com o avanço automático

**Arquivos:**
- `src/lib/bracket-resolver.ts` — Adicionar `propagateWinners()`
- `src/components/bracket/BracketTree.tsx` — Mostrar times pré-preenchidos

### 2.2 Visual do Bracket Tree — Upgrade

| Item | O que muda |
|---|---|
| **Linhas conectoras** | SVG verde `#22c55e` entre rodadas — estilo "linha do campo" |
| **Match cards** | PitchCard com placar, bandeiras, indicador de vencedor |
| **Input de placar** | Inputs estilo telão LED (fonte mono, fundo escuro, led verde) |
| **Mobile** | Collapsible por rodada em vez de horizontal scroll infinito |
| **Round headers** | Badges com ícone de bola + nome da rodada |
| **Equipe classificada** | Badge verde "CLASSIFICADO" no time que avança |
| **Campeão** | Animação de troféu + confete no final |

### 2.3 Grupo vs Classificação — Upgrade Visual

- Usar cores dos times/grupos nas tabelas
- Linhas verdes para classificados, vermelhas para eliminados
- Indicador de "1º" e "2º" com medalha

---

## Fase 3 — Draft Game (Campo Visual)

### 3.1 Campo 4-3-3 Interativo ⭐ Prioridade

**O que:** Substituir a lista de posições por um **campo de futebol visual** com as 11 posições numeradas, onde o usuário clica numa posição vaga e vê as opções de jogador.

**Layout do campo:**
```
┌──────────────────────────────────┐
│           🧤 GK                  │
│                                  │
│  🛡️ CB   🛡️ CB                 │
│ 🛡️ LB           🛡️ RB          │
│                                  │
│      🧠 DM                       │
│   🧠 CM     🧠 CM                │
│                                  │
│ ⚡ LW           ⚡ RW            │
│           🎯 ST                  │
│                                  │
│       [4-3-3]   ⭐ 89            │
└──────────────────────────────────┘
```

**Componentes novos:**
| Componente | Descrição |
|---|---|
| `DraftPitch` | Campo SVG/CSS com linhas do campo, 11 posições |
| `PlayerSlot` | Slot de posição vago/preenchido com bandeira + nome + rating |
| `PlayerCard` | Card do jogador com foto (fallback pra iniciais), time, posição, rating |
| `DraftBench` | Jogadores já selecionados (fora do campo) |
| `DraftTimer` | Timer de rodada (estilo placar LED) |

### 3.2 Mecânica de Draft

**Já existe:** `src/lib/draft.ts` com `startDraft()`, `makePick()`, `simulateDraft()`
**Já existe:** `src/components/draft/DraftResultCard.tsx`

**Falta:**
- UI do campo visual (DraftPitch + PlayerSlot)
- Preview do time completo quando termina
- Botão "Compartilhar time" (gera imagem/hash)
- Simulação animada do jogo (gols aparecendo no placar LED)
- Scoreboard com resultado comparativo lado a lado

---

## Fase 4 — Sharing & Ranking

### 4.1 Ranking Entre Amigos

**O que:** Substituir o skeleton atual por um leaderboard real.

**Dados:**
- Armazenar brackets via `/api/bracket` (já existe)
- Buscar brackets de amigos e comparar acertos
- Pontuação: 1pt vencedor certo, 3pt placar exato (já existe em `bracket-score.ts`)

**UI:**
- Leaderboard com medalhas 🥇🥈🥉
- Card de cada participante: nome, pontos, badges de rodadas acertadas
- Botão "Convidar amigo" — gera link de compartilhamento
- Aba "Meu Bracket" vs "Ranking"

### 4.2 Compartilhar no WhatsApp

**O que:** Quando o usuário clica "Compartilhar", gerar:
1. Link único (`/b/<hash>`) — já existe
2. Prévia OG image — já existe (`/api/og`)
3. Texto formatado pro WhatsApp

**Melhorias:**
- Preview do bracket na página compartilhada (já existe `SharedBracketView.tsx`)
- Comparar bracket compartilhado vs resultados reais
- Botão "Fazer meu bracket" no final da página compartilhada

### 4.3 Bolão

**O que:** Amigos criam grupos, cada um faz seu bracket, ranking dentro do grupo.

**Requer:**
- Modelo de "grupo" (nome, código de convite)
- Comparação de brackets dentro do grupo
- Leaderboard do grupo

**Diferimento:** Fase 4.3 depende de 4.1 e 4.2 estarem sólidos.

---

## Fase 5 — Deploy & Polimento

### 5.1 Deploy na Vercel

- Conectar repo GitHub → Vercel
- Configurar domínio (ex: `wc26bracket.com`)
- CI via GitHub Actions (já existe vitest config?)
- Variáveis de ambiente no Vercel

### 5.2 PWA

- Manifest (`manifest.json`)
- Service worker para cache
- Ícones em 192x192 e 512x512
- `theme-color: #0a0a0a`

### 5.3 Performance

- Lazy loading do bracket (render só a rodada visível)
- Imagens dos jogadores otimizadas
- Bracket tree virtualizado (se muitas rodadas)

### 5.4 Testes

- Vitest para `group-standings.ts`, `bracket-resolver.ts`, `bracket-score.ts`
- Teste de build (`pnpm build`) no CI

---

## Roadmap Visual & Dependências

```
FASE 1 ──────────────▶  Design System (globals.css + UI base)
                           │
                           ▼
FASE 2 ──────────────▶  Bracket Refinado (conexão + visual)
                      │       │
                      │       ▼
                      │   [Depende de Fase 1]
                      │
FASE 3 ──────────────▶  Draft Campo Visual
                      │       │
                      │       ▼
                      │   [Pode rodar paralelo à Fase 2]
                      │
FASE 4 ──────────────▶  Sharing + Ranking
                      │       │
                      │       ▼
                      │   [Depende de Fase 2]
                      │
FASE 5 ──────────────▶  Deploy + Polimento
                              │
                              ▼
                          [Depende de Fase 2 + 3 + 4]
```

### Ordem Recomendada

| Ordem | Fase | Por que |
|---|---|---|
| **1** | **Fase 1 — Design System** | Base pra tudo. Sem paleta/componentes consistentes, o resto fica "AI slop". |
| **2** | **Fase 2 — Bracket** | Já temos 80% do código. É o que entrega valor mais rápido. |
| **3** | **Fase 3 — Draft** | Paralelizável com Fase 2. Diferencial competitivo do app. |
| **4** | **Fase 4 — Sharing** | Depende do bracket estar redondo. Essencial pra viralizar. |
| **5** | **Fase 5 — Deploy** | Só depois do app estar completo. |

---

## Marcos de Entrega

| Marco | O que está pronto | Estimativa |
|---|---|---|
| **M1** | Design System aplicado em todas as páginas (cores, tipografia, componentes base) | 1 sessão |
| **M2** | Bracket com vencedores conectados, linhas verdes, mobile responsivo | 1-2 sessões |
| **M3** | Campo visual do Draft 4-3-3 com draft funcional + simulação | 1-2 sessões |
| **M4** | Ranking entre amigos + compartilhamento polishado | 1 sessão |
| **M5** | Deploy na Vercel + PWA + domínio | 1 sessão |

---

## Checklist por Arquivo

### Fase 1 — Design System
- [ ] `src/app/globals.css` — Variáveis CSS + utilitários estádio
- [ ] `src/components/ui/StadiumButton.tsx`
- [ ] `src/components/ui/ScoreboardHeader.tsx`
- [ ] `src/components/ui/FlagBadge.tsx`
- [ ] `src/components/ui/PitchCard.tsx`
- [ ] `src/components/ui/LiveIndicator.tsx`
- [ ] `src/components/ui/StadiumSection.tsx`

### Fase 2 — Bracket
- [ ] `src/lib/bracket-resolver.ts` — Adicionar `propagateWinners()`
- [ ] `src/components/bracket/BracketTree.tsx` — Upgrade visual + linhas conectoras SVG
- [ ] `src/app/bracket/page.tsx` — Atualizar com novos componentes UI
- [ ] `src/lib/group-standings.ts` — CSS classes para classificados/eliminados

### Fase 3 — Draft
- [ ] `src/components/draft/DraftPitch.tsx` — Campo visual 4-3-3 SVG
- [ ] `src/components/draft/PlayerSlot.tsx` — Slot de posição
- [ ] `src/components/draft/PlayerCard.tsx` — Card de jogador
- [ ] `src/components/draft/DraftTimer.tsx` — Timer estilo placar
- [ ] `src/app/draft/page.tsx` — Refatorar com campo visual

### Fase 4 — Sharing & Ranking
- [ ] `src/app/ranking/page.tsx` — Leaderboard real (remover skeleton)
- [ ] `src/app/api/ranking/route.ts` — API de ranking
- [ ] `src/components/ranking/RankingRow.tsx` — Linha do leaderboard
- [ ] `src/app/b/[hash]/page.tsx` — Adicionar CTA "Fazer meu bracket"
- [ ] `src/lib/score-calculation.ts` — (se necessário separar)

### Fase 5 — Deploy
- [ ] `public/manifest.json`
- [ ] `public/icons/` — Ícones PWA
- [ ] `next.config.ts` — Adicionar PWA headers
- [ ] `vercel.json` — Config deploy
