# project3-s15 — Lições Database: Indexing (25) e Query Optimization (26) + tarefas

## Missão
Fechar os elos frágeis do percurso "The page got slow" (§8.3): os conceitos
25 e 26 estão no coração do percurso (N+1 → JOIN → índice → plano de consulta)
e hoje só existem como referência rápida. Duas lições completas tornam o
percurso honesto de ponta a ponta.

## Escopo
- Seu: `out/lesson-25.ts`, `out/lesson-26.ts` (contrato Lesson D1) e
  `out/tasks-25-26.ts` (4 tarefas: 2 por conceito) em
  `.opencode/work/sub/s15-database-elo/out/`; entradas de PREREQ_MOTIVES em
  `prereq-motives-25-26.md`.
- Fora do seu escopo: `src/lib/**` (integração do agente principal), lessons de
  outros conceitos (27/81/82 já têm aula em database.ts — leia-as como tom e
  para não duplicar), subagentes s14/s16/s17.

## Por quê
§12.2: percurso vendido como profundo não pode achar referência superficial no
ponto decisivo. 25 (Database Indexing) e 26 (Query Optimization) são os pontos
decisivos entre sintoma "página lenta" e causa "plano de consulta".

## Fronteiras
- Recebe: contratos Lesson/Task, conceitos 25/26 canônicos, aula 27 existente
  como exemplar da mesma categoria.
- Entrega: os 4 arquivos; integração em `src/lib/lessons/database.ts` e
  `src/lib/exercises-data/database.ts` é do agente principal.

## Dono exclusivo de
`.opencode/work/sub/s15-database-elo/out/**` (nada mais).
