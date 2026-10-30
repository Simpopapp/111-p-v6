# project3-s17 — Auditoria dos 111 conceitos pelos 8 critérios (F9)

## Missão
Executar a auditoria do roadmap F9, item 1: os 111 conceitos auditados contra
os 8 critérios de profundidade (planejamento §12.1), com elos frágeis primeiro.
O produto não é uma tabela por amor ao formulário: é a fila priorizada que
dirige as próximas rodadas de conteúdo e prova a honestidade da cobertura.

## Escopo
- Seu: `out/auditoria-111.md` em `.opencode/work/sub/s17-auditoria/out/`.
- Fora do seu escopo: qualquer arquivo de `src/**`, pilares centrais, os
  subagentes s14/s15/s16 (que fecham 14, 25, 26, 93 — marque esses conceitos
  como "em fechamento nesta rodada", sem reauditá-los como pendentes).

## Por quê
"Cobertura nominal não é meta" (PRD §3/F9): 26/111 sem prática e integração
continua insuficiente. A auditoria separa três classes honestas: (a) lição
estruturada completa, (b) referência rápida (deve permanecer rotulada como tal
na UI — nunca vestida de aula), (c) sem tratamento editorial.

## Fronteiras
- Recebe: CONCEPTS, LESSONS, percursos (`src/lib/recommend.ts` ROUTES), missões
  (`src/lib/missions.ts`), relações (`src/lib/relations.ts`), laboratórios
  (`src/lib/labs.ts`), sintomas (`src/lib/symptoms.ts`).
- Entrega: o relatório de auditoria; o agente principal persiste e usa.

## Dono exclusivo de
`.opencode/work/sub/s17-auditoria/out/**` (nada mais).
