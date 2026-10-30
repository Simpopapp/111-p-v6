# prd-project3-s23-reliability — o COMO do pacote 23-reliability

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo: um health check é uma AFIRMAÇÃO sobre capacidade de
  servir; liveness ("devo reiniciar?") e readiness ("devo rotear?") respondem
  perguntas diferentes — confundi-las causa ou reinício inútil ou tráfego em
  réplica quebrada. O check só pode afirmar o que ele de fato testa
  (dependência checada vs. presumida). Decisão real: dado um cenário
  (dep externa lenta, disco cheio, cache vazio), classificar o que cada check
  deve reportar e prever o roteamento (predict). Representação: state-machine
  ou event-track de probe → roteador (incluindo a janela de atraso da
  detecção). Misconception: "check verde = serviço saudável" com counterexample
  (check que não testa a dependência decisiva). Contraste com 10 Circuit
  Breakers (breaker reage por chamada; probe decide rota por réplica).
  Transfer: domínio distinto (ex. job batch vs. endpoint HTTP).

## Exemplares obrigatórios
- `src/lib/lessons/resilience.ts` e o `exercises-data` da mesma categoria — tom, profundidade, formato.


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
- 2 tarefas de prática por conceito, ids `t-{ids}-*` (substitua ids pelos
  números do(s) seu(s) conceito(s)); ids únicos no TASKS global.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (use `src/lib/lessons/index.ts`: ids 1-5,10-17,20,25-28*,27,44,58,60,61,63,
  81,82,91,92,93,102,103,109,111,14 — confira na fonte) e apenas com motivo
  real; se nenhum pré-req for genuíno, prereqIds vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/{K}/out/`:
- `lesson-{ids}.ts` — objeto(s) `Lesson` completo(s) (export const
  LESSONS_{CAT}: Lesson[]).
- `tasks-{ids}.ts` — tarefas (export const TASKS_{CAT}: Task[]).
- `prereq-motives-{ids}.md` — entradas `"lição:prereq": "motivo pt-BR"`.
- `relations-{ids}.md` — propostas de `Relation` para o(s) conceito(s).
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(vazio — você preenche, numerado, e lista no relatório final)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
