# project3-s37-observability-65 — planejamento do pacote

## Missão
Dar à categoria Observability sua terceira lição estruturada: o conceito 65
(Error Budgets) como objeto `Lesson` íntegro + 2 tarefas de prática, servindo
ao F9 do Project 3 (expansão contínua: honestidade de cobertura, profundidade
pelos 8 critérios §12.1).

## Escopo
- Redigir: `Lesson` id 65 rev nova + 2 `Task` (ids `t-65-*`) + motivos de
  pré-requisito (pt-BR) + propostas de `Relation`.
- Read-only: entrega o conteúdo em `out/`; quem persiste em `src/` é o agente
  principal.

## Fora do escopo
- Integração em `src/lib/**` (agente principal).
- Pacotes irmãos desta rodada: s33 (DevOps 52), s34 (Security 67),
  s35 (Distributed 39), s36 (Database 28), s38 (revisão técnica) — não
  comente os arquivos deles nem proponha edições em seus arquivos.

## Por quê
- Observability tem 5 conceitos sem aula; Error Budgets é o mecanismo que
  transforma medição em DECISÃO (o que o orçamento de erro compra ou trava) e
  dependia de 63 (SLO) — que já tem aula e pode ser pré-requisito honesto.

## Fronteiras
- Entra: contrato `Lesson`/`Task`, `concepts.ts` 65 como entrada canônica,
  exemplares de tom/profundidade, shapes de instrumento.
- Sai: `out/lesson-65.ts`, `out/tasks-65.ts`, `out/prereq-motives-65.md`,
  `out/relations-65.md` (ou conteúdo íntegro no relatório final, se o
  ambiente recusar a escrita).

## Dono exclusivo de
- `.opencode/work/sub/s37-observability-65/` (pilares + out/). Nada fora daqui.
