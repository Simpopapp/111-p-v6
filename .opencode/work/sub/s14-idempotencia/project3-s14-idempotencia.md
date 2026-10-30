# project3-s14 — Lição Idempotency (14) + tarefas

## Missão
Fechar o elo frágil mais grave do percurso "The request didn't finish" (§8.3):
o conceito 14 (Idempotency) é o ponto decisivo em que "repetir só é seguro
quando repetir não muda o resultado" — hoje só existe referência rápida lá.
Sua lição transforma o percurso em experiência completa de ponta a ponta.

## Escopo
- Seu: conteúdo íntegro de `lesson-14.ts` (contrato Lesson D1) e `tasks-14.ts`
  (2 tarefas do motor), ambos em `.opencode/work/sub/s14-idempotencia/out/`;
  entradas de PREREQ_MOTIVES em `prereq-motives-14.md`.
- Fora do seu escopo: `src/lib/**` (integração do agente principal),
  lessons/tarefas de outros conceitos, pilares centrais, subagentes s15/s16/s17.

## Por quê
Sem a lição 14, o percurso vendido como profundo termina em referência
superficial exatamente na decisão de cobrança duplicada — falha §12.2. A
auditoria pelos 8 critérios (§12.1) é o padrão de qualidade, não as 8 caixas.

## Fronteiras
- Recebe: contrato Lesson (`src/lib/lessons/types.ts`), contrato Task/Rubric
  (`src/lib/exercises.ts`), conceito 14 e a entrada existente "12:14" de
  PREREQ_MOTIVES.
- Entrega: os 4 arquivos acima; o agente principal integra em
  `src/lib/lessons/resilience.ts` e `src/lib/exercises-data/resilience.ts`.

## Dono exclusivo de
`.opencode/work/sub/s14-idempotencia/out/**` (nada mais).
