# Meu Corpo — App de Treino

App pessoal single-user PWA para registrar treinos (Full Body A/B/C), visualizar progressão, consultar exames de sangue como baseline, e exportar snapshot.

## Stack

- **Framework:** Next.js 16 App Router + TypeScript
- **Styling:** Tailwind CSS (dark theme, mobile-first, max-w-md)
- **DB:** Prisma + PostgreSQL
- **Auth:** Middleware via cookie — senha em `AUTH_PASSWORD` env var
- **PWA:** next-pwa com manifest.json e service worker

## Setup local

```bash
cp .env.local.example .env.local   # edite DATABASE_URL e AUTH_PASSWORD
npm install
npm run db:push        # aplica schema (dev rápido)
npm run db:seed        # popula exames + exercícios + templates A/B/C
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server em localhost:3000 |
| `npm run db:push` | Sincroniza schema sem migration |
| `npm run db:migrate` | Cria migration e aplica |
| `npm run db:seed` | Popula dados reais (idempotente) |
| `npm run db:studio` | Prisma Studio |
| `npm run build` | Build de produção |

## Variáveis de ambiente

| Var | Descrição |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/meucorpo` |
| `AUTH_PASSWORD` | Senha de acesso ao app |

## Modelos Prisma

- `Exam` — exames de sangue (coleta 24/07/2026, 23 itens)
- `Exercise` — exercícios com grupo muscular
- `WorkoutTemplate` — templates A, B, C
- `WorkoutTemplateExercise` — séries/reps alvo por exercício
- `WorkoutSession` — sessões realizadas
- `SetLog` — séries individuais registradas
- `BodyMetric` — peso e composição corporal

## Estrutura de pastas

```
src/
  app/
    layout.tsx          # root layout, PWA metadata
    page.tsx            # redirect para /treino
    login/page.tsx      # tela de login (senha)
    treino/page.tsx     # seleção e registro de treino (Fase 2)
    api/auth/route.ts   # POST /login, DELETE /logout
  lib/
    prisma.ts           # PrismaClient singleton
middleware.ts           # auth guard
prisma/
  schema.prisma
  seed.ts
public/
  manifest.json         # PWA manifest
  icons/                # icon-72..512.png
```

## Fases do projeto

1. **Fundação** (CTO 2) — scaffold, schema, auth, seed, PWA ✓
2. **Registro de Treino** (Dev Frontend) — seleção A/B/C, séries, salvamento
3. **Progressão e Baseline** (Dev Frontend) — gráficos, exames, exportar snapshot
4. **Deploy** (CTO 2) — Coolify, Postgres persistente, HTTPS, PWA em prod
5. **QA Final** (Revisor) — checklist da definição de pronto
