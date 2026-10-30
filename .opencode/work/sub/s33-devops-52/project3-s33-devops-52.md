# project3-s33-devops-52 — planejamento do pacote

## Missão
Dar à categoria DevOps sua terceira lição estruturada: o conceito 52 (Blue-Green
Deployments) como objeto `Lesson` íntegro + 2 tarefas de prática, servindo ao
F9 do Project 3 (expansão contínua: honestidade de cobertura, profundidade pelos
8 critérios §12.1, percursos fechados).

## Escopo
- Redigir: `Lesson` id 52 rev nova + 2 `Task` (ids `t-52-*`) + motivos de
  pré-requisito (pt-BR) + propostas de `Relation`.
- Read-only: entrega o conteúdo em `out/`; quem persiste em `src/` é o agente
  principal.

## Fora do escopo
- Integração em `src/lib/**` (agente principal).
- Pacotes irmãos desta rodada: s34 (Security 67), s35 (Distributed 39),
  s36 (Database 28), s37 (Observability 65), s38 (revisão técnica) — não
  comente os arquivos deles nem proponha edições em seus arquivos.

## Por quê
- DevOps é a categoria com mais conceitos sem aula (13); a fila do roadmap
  pede a terceira lição por categoria. Blue-Green é o mecanismo de deploy cuja
  decisão (o que precisa ser compatível para o switch ser seguro) aparece nos
  conceitos 51–55 e 55 Rollbacks — esta lição ancorará aquele bloco.

## Fronteiras
- Entra: contrato `Lesson`/`Task`, `concepts.ts` 52 como entrada canônica,
  exemplares de tom/profundidade, shapes de instrumento.
- Sai: `out/lesson-52.ts`, `out/tasks-52.ts`, `out/prereq-motives-52.md`,
  `out/relations-52.md` (ou conteúdo íntegro no relatório final, se o
  ambiente recusar a escrita).

## Dono exclusivo de
- `.opencode/work/sub/s33-devops-52/` (pilares + out/). Nada fora daqui.
