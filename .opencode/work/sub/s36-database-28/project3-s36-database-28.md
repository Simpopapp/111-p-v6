# project3-s36-database-28 — planejamento do pacote

## Missão
Dar à categoria Database sua terceira lição estruturada: o conceito 28
(Connection Pooling) como objeto `Lesson` íntegro + 2 tarefas de prática,
servindo ao F9 do Project 3 (expansão contínua: honestidade de cobertura,
profundidade pelos 8 critérios §12.1).

## Escopo
- Redigir: `Lesson` id 28 rev nova + 2 `Task` (ids `t-28-*`) + motivos de
  pré-requisito (pt-BR) + propostas de `Relation`.
- Read-only: entrega o conteúdo em `out/`; quem persiste em `src/` é o agente
  principal.

## Fora do escopo
- Integração em `src/lib/**` (agente principal).
- Pacotes irmãos desta rodada: s33 (DevOps 52), s34 (Security 67),
  s35 (Distributed 39), s37 (Observability 65), s38 (revisão técnica) — não
  comente os arquivos deles nem proponha edições em seus arquivos.

## Por quê
- Database tem 6 conceitos sem aula; Connection Pooling é o gargalo número um
  de apps "vibe coded" em produção (cada request abrindo conexão própria) e é
  pré-requisito natural de 29–33 (replicas, sharding), que ficam na fila.

## Fronteiras
- Entra: contrato `Lesson`/`Task`, `concepts.ts` 28 como entrada canônica,
  exemplares de tom/profundidade, shapes de instrumento.
- Sai: `out/lesson-28.ts`, `out/tasks-28.ts`, `out/prereq-motives-28.md`,
  `out/relations-28.md` (ou conteúdo íntegro no relatório final, se o
  ambiente recusar a escrita).

## Dono exclusivo de
- `.opencode/work/sub/s36-database-28/` (pilares + out/). Nada fora daqui.
