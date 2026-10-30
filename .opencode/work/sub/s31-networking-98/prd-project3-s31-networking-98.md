# prd-project3-s31-networking-98 — o COMO do pacote s31-networking-98

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo do 98 é a diferença de CONTRATO do transporte: TCP
  entrega um fluxo de bytes ordenado e confiável (retransmissão e ordenação
  custam atraso sob perda; um pacote faltante bloqueia os seguintes);
  UDP entrega datagramas sem garantia (o aplicativo decide o que fazer com
  perda e desordem). A decisão real é classificar cada tráfego do produto:
  tolera perda/atraso variável (mídia ao vivo, telemetria, jogo) ou exige
  chegada completa e ordenada (APIs, páginas, ordens)? Representação: table
  ou event-track comparando o MESMO padrão de perda sob TCP (retransmissão,
  cabeça-de-fila bloqueia) e sob UDP (pacote perdido vira falha que o app
  escolhe como tratar). Contraste: "UDP é sempre mais rápido" vs. "UDP move
  o custo para o aplicativo" (sem retry/ordenação no app, perda é
  irreversível). Misconception: "escolher UDP melhora qualquer latência" com
  counterexample (para uma API de pagamentos, UDP exige recriar confiabilidade
  no app e o resultado é pior). Transfer: telemetria de sensores vs. envio
  de comandos de atuação numa planta industrial — qual fluxo usa qual
  transporte e por quê; a variante muda domínio e a restrição (custo de
  perder um comando vs. um dado de leitura).
## Exemplares obrigatórios
- `src/lib/lessons/resilience.ts`, `src/lib/lessons/performance.ts` e o
  `exercises-data` correspondente — tom, profundidade, formato.

## Contratos e exemplares (leia ANTES de redigir)
- `src/lib/lessons/types.ts` — contrato `Lesson` INTEIRO: nenhum campo vazio;
  `analogyLimits` obrigatório; `provenance.reviewed: false` com notes honestas
  ("redigida nesta rodada, sem revisão independente efetiva").
- `src/lib/exercises.ts` — contrato `Task`/`Rubric`/`Answer` (tipos predict/
  order/compare/find-flaw/variant/choose-info; `RubricCriterion.cause`
  diagnóstica; `check` sobre `a.picked|a.order|a.text`; `expected` com
  raciocínio comentado; `helpLevels` com 3 níveis graduados que NÃO entregam a
  resposta no nível 1).
- `src/lib/concepts.ts` — entrada canônica do(s) seu(s) conceito(s) (eli/risk/
  fix são INPUT, não redação final; a analogia do ELI10 é ponto de partida a
  revisar, não explicação principal).
- `src/lib/lessons/prereq-motives.ts` — formato dos motivos (pt-BR), pares
  `"lição:prereq"`. CADA par do seu prereqIds precisa de motivo; motivo órfão
  é recusado pelo teste.
- `src/lib/relations.ts` — formato `Relation` (from/kind/to/note); "relacionado
  solto" não existe: cada proposta declara kind e nota de alcance.
- Exemplares de tom/profundidade: `src/lib/lessons/resilience.ts`,
  `src/lib/lessons/database.ts`, `src/lib/lessons/performance.ts` + o
  exercises-data correspondente.
- Shapes de instrumento: `src/components/instruments/index.ts` +
  `src/test/instruments-shapes.test.ts` (kinds: request-flow,
  latency-histogram, state-machine, event-track, query-explainer, timeline,
  table). O `data` do representation deve validar no shape do kind escolhido.
- `src/test/lessons.test.ts` — contrato de lição que NÃO pode quebrar.

## Requisitos editoriais (§12.1–12.3 do project3)
- Idioma: inglês nas lições/tarefas (como os exemplares); motivos de pré-req e
  notas de relation em pt-BR.
- A lição deve RESPONDER aos 8 critérios §12.1 pela experiência, não por
  caixas: reconhecer o problema, explicar com limite da analogia, observar o
  mecanismo no instrumento, comparar alternativas sob condições explícitas,
  decidir com feedback verificável, reconhecer quando NÃO usar, transferir
  para variante de domínio diferente, consultar síntese/limites.
- Scenario com system/data/symptom/constraints/baseline ESPECÍFICOS; contexto
  recorrente do produto; a variante do `transfer` muda domínio E restrições.
- Honestidade técnica (§12.3): não prometer garantia que o mecanismo não dá;
  fragmento de código é ilustrativo, nunca "pronto para produção".
- 2 tarefas de prática por conceito, ids `t-98-*` (substitua ids pelos
  números do(s) seu(s) conceito(s)); ids únicos no TASKS global.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (use `src/lib/lessons/index.ts`: ids 1-5, 10-17, 20, 22, 25-27, 34, 44, 45, 56, 58, 60, 61, 63, 78, 79, 81, 82, 91, 93, 97, 102, 103, 109, 111, 6 — confira na fonte) e apenas com motivo real; se nenhum pré-req for genuíno,
  prereqIds vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s31-networking-98/out/`:
- `lesson-98.ts` — objeto(s) `Lesson` completo(s) (export const
  LESSONS_NETWORKING: Lesson[]).
- `tasks-98.ts` — tarefas (export const TASKS_NETWORKING: Task[]).
- `prereq-motives-98.md` — entradas `"lição:prereq": "motivo pt-BR"`.
- `relations-98.md` — propostas de `Relation` para o(s) conceito(s).
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preenchido pelo agente principal após verificação — subagente read-only)

1. Entrega read-only (íntegra no relatório, persistida em out/).
2. Pré-requisito único 97; tabela estática do mesmo padrão de perda.
3. Escopo técnico: TCP vs UDP bruto; QUIC implementa confiabilidade sobre UDP.
4. Transfer industrial: leituras substituíveis vs. comandos com resultado desconhecido.

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
