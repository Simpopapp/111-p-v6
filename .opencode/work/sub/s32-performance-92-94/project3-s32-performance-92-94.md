# project3-s32-performance-92-94 — Fila da auditoria: 92 (Throughput) + 94 (Tail Latency)

## Missão
Fechar os dois últimos conceitos da fila da auditoria marcados "criar lição antes de percurso decisivo": 92 (Throughput) e 94 (Tail Latency), ambos Performance, ambos no mesmo arquivo (dono único). Complementam as lições 91 (Latency) e 93 (P99) já existentes.

## Escopo
- Seu: lições 92 e 94 + 2 tarefas cada + motivos de pré-req + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), conceitos vizinhos da
  categoria, outras categorias (irmãos desta rodada), pilares centrais.

## Por quê
A fila da auditoria (remix3-f9-auditoria-111.md) deixa 92 e 94 como os únicos "criar lição antes de percurso decisivo" ainda abertos. Os dois são o par causa/efeito da cauda: throughput limitado força concorrência; fan-out multiplica a cauda.

## Fronteiras
- Recebe: contratos (abaixo), entrada canônica do(s) conceito(s), exemplares.
- Entrega: arquivos em out/; o agente principal integra em
  `src/lib/lessons/performance.ts` e `src/lib/exercises-data/performance.ts`.

## Dono exclusivo de
`.opencode/work/sub/s32-performance-92-94/**` (nada mais).
