# Stage 16 — Remix 5: segunda onda da expansão contínua do F9

**Data:** 2026-10-29
**Status:** concluída

## O que foi feito

Pacotes s26–s32 (enxame de 3 pilares, uma onda paralela de 7 subagentes
read-only) produziram 8 lições editoriais completas com 2 tarefas cada:

- DevOps 7 (Docker) — imagem vs. configuração de execução; digest ≠ commit ≠ tag.
- Streaming 23 (Long Polling) — ciclo requisição-segurada/reconexão; limites de intermediário.
- Distributed 35 (Eventual Consistency) — convergência sem prazo; read-your-writes por leitura.
- Scaling 46 (Horizontal Scaling) — classificação de estado e localização; teto de dependência.
- Reliability 57 (Liveness & Readiness Probes) — reinício vs. admissão; restart storm.
- Networking 98 (TCP vs UDP) — mesmo padrão de perda sob os dois contratos.
- Performance 92 (Throughput) e 94 (Tail Latency) — fila da auditoria fechada;
  nearest-rank explícito (99×100ms + 1×10.000ms ⇒ P99=100ms, máx=10.000ms, média=199ms).

## Integração (agente principal)

- Lições anexadas aos arrays existentes em `src/lib/lessons/{devops,streaming,
  distributed,scaling,reliability,networking,performance}.ts`, preservando as lições anteriores.
- 14 tarefas anexadas em `src/lib/exercises-data/*.ts`.
- 10 motivos de pré-req (pt-BR) em `prereq-motives.ts`; 26 relations novas sem duplicatas.
- Correções de contrato na integração: ids para o padrão `t-<id>-<tipo>`
  (t-7-compare, t-7-variant, t-46-predict, t-46-variant, t-57-predict,
  t-57-variant) e chaves de rubrica renomeadas quando o rótulo da opção
  vazava a resposta (image-pkg, run-storage, locate-delivery, renewal,
  final-result, lease-control, external-progress, confirmed-action).
- Conteúdo íntegro dos subagentes preservado em `.opencode/work/sub/{K}/out/`.

## Gates (reproduzidos pelo agente principal)

- tsgo limpo · vitest 208/208 (+f9-expansion2.test.ts: 6 contratos; nenhum
  teste contratado enfraquecido) · build OK.
- E2E Playwright: as 8 lições renderizam em modo guiado com situação/previsão/
  pré-requisitos nomeados; biblioteca exibe 46/111 com aula estruturada e
  lista Docker e Horizontal Scaling; 0 pageerrors.

## Pendências

- Revisão técnica independente (`reviewed: true`) segue pendente para todas
  as lições — só com revisão efetiva registrada.
- Fila restante das categorias (DevOps 15, Security 14, Distributed 9,
  Database 8, Observability 5 sem aula) registrada como "Próximo remix".
