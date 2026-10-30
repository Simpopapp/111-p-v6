# project3-s34-security-67 — planejamento do pacote

## Missão
Dar à categoria Security sua terceira lição estruturada: o conceito 67
(Secrets Management) como objeto `Lesson` íntegro + 2 tarefas de prática,
servindo ao F9 do Project 3 (expansão contínua: honestidade de cobertura,
profundidade pelos 8 critérios §12.1).

## Escopo
- Redigir: `Lesson` id 67 rev nova + 2 `Task` (ids `t-67-*`) + motivos de
  pré-requisito (pt-BR) + propostas de `Relation`.
- Read-only: entrega o conteúdo em `out/`; quem persiste em `src/` é o agente
  principal.

## Fora do escopo
- Integração em `src/lib/**` (agente principal).
- Pacotes irmãos desta rodada: s33 (DevOps 52), s35 (Distributed 39),
  s36 (Database 28), s37 (Observability 65), s38 (revisão técnica) — não
  comente os arquivos deles nem proponha edições em seus arquivos.

## Por quê
- Security tem 12 conceitos sem aula; 78/79 cobrem injeção e XSS no browser,
  mas nada cobre o ciclo de vida da credencial — a superfície que antecede
  todos os outros controles. Secrets Management ancora o bloco 67–73.

## Fronteiras
- Entra: contrato `Lesson`/`Task`, `concepts.ts` 67 como entrada canônica,
  exemplares de tom/profundidade, shapes de instrumento.
- Sai: `out/lesson-67.ts`, `out/tasks-67.ts`, `out/prereq-motives-67.md`,
  `out/relations-67.md` (ou conteúdo íntegro no relatório final, se o
  ambiente recusar a escrita).

## Dono exclusivo de
- `.opencode/work/sub/s34-security-67/` (pilares + out/). Nada fora daqui.
