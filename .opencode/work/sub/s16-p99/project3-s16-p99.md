# project3-s16 — Lição P99 Latency (93) + tarefas

## Missão
Fechar o último elo frágil do percurso "The page got slow" (§8.3): o conceito
93 (P99 Latency) é o ponto onde "média esconde o pior caso" — a leitura que
muda a decisão de otimização. Sem aula lá, o percurso termina em referência
superficial exatamente na etapa de diagnóstico honesto.

## Escopo
- Seu: `out/lesson-93.ts` (contrato Lesson D1), `out/tasks-93.ts` (2 tarefas) e
  `out/prereq-motives-93.md`, em `.opencode/work/sub/s16-p99/out/`.
- Fora do seu escopo: `src/lib/**` (integração do agente principal), lessons de
  outros conceitos (91 Latency já tem aula — leia para tom e não duplicar),
  subagentes s14/s15/s17.

## Por quê
§12.2 + §12.1: a lição deve tornar observável o que a média esconde
(percentis com distribuição explícita) e cobrar a decisão com feedback
verificável — não é uma caixa a mais.

## Fronteiras
- Recebe: contratos Lesson/Task, conceito 93 canônico, lição 91 como exemplar.
- Entrega: os 3 arquivos; integração em `src/lib/lessons/performance.ts` e
  `src/lib/exercises-data/performance.ts` é do agente principal.

## Dono exclusivo de
`.opencode/work/sub/s16-p99/out/**` (nada mais).
