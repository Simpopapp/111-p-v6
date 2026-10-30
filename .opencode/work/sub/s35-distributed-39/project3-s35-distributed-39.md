# project3-s35-distributed-39 — planejamento do pacote

## Missão
Dar à categoria Distributed sua terceira lição estruturada: o conceito 39
(Race Conditions) como objeto `Lesson` íntegro + 2 tarefas de prática, servindo
ao F9 do Project 3 (expansão contínua: honestidade de cobertura, profundidade
pelos 8 critérios §12.1).

## Escopo
- Redigir: `Lesson` id 39 rev nova + 2 `Task` (ids `t-39-*`) + motivos de
  pré-requisito (pt-BR) + propostas de `Relation`.
- Read-only: entrega o conteúdo em `out/`; quem persiste em `src/` é o agente
  principal.

## Fora do escopo
- Integração em `src/lib/**` (agente principal).
- Pacotes irmãos desta rodada: s33 (DevOps 52), s34 (Security 67),
  s36 (Database 28), s37 (Observability 65), s38 (revisão técnica) — não
  comente os arquivos deles nem proponha edições em seus arquivos.

## Por quê
- Distributed tem 7 conceitos sem aula; 34/35 cobrem consistência eventual e
  hashing, mas a falha de interleaving (check-then-act) é a que o dev de app
  "vibe coded" encontra primeiro — e é pré-requisito natural dos conceitos
  36–40 (locks), que ficam na fila.

## Fronteiras
- Entra: contrato `Lesson`/`Task`, `concepts.ts` 39 como entrada canônica,
  exemplares de tom/profundidade, shapes de instrumento.
- Sai: `out/lesson-39.ts`, `out/tasks-39.ts`, `out/prereq-motives-39.md`,
  `out/relations-39.md` (ou conteúdo íntegro no relatório final, se o
  ambiente recusar a escrita).

## Dono exclusivo de
- `.opencode/work/sub/s35-distributed-39/` (pilares + out/). Nada fora daqui.
