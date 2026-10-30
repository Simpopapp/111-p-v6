# prd-project3-s37-observability-65 — o COMO do pacote s37-observability-65

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Error Budgets é o **orçamento como contrato
  quantitativo para imperfeição**: do objetivo de disponibilidade (SLO) deriva
  a quantidade de falha TOLERÁVEL num janela (1 − SLO × janela); o saldo
  restante é o que decide — ou financia — velocidade de feature, política de
  alerta e prioridade de confiabilidade. A decisão real: o que fazer quando o
  burn acelera (reduzir deploy? acordar de madrugada? adiar feature?) e
  quem/what o orçamento NÃO autoriza (erro como "custo aceitável" sem
  decidir nada é desperdício de orçamento).
- Representação: `table` de uma janela de 4 semanas — colunas: semana, SLO
  acordado, erro observado, orçamento restante, decisão tomada (deploy
  continuou/travado, alerta ajustado). O ponto que a tabela deve expor: o
  mesmo "0,2% de erro" é aceitável na semana 1 com orçamento cheio e intolerável
  na semana 4 com orçamento esgotado — o número só vira decisão com o saldo.
- Contraste: orçamento por janela fixa (mensal) vs burn-rate com janela
  deslizante como alternativa com tradeoff (reação rápida vs volatilidade) e
  quando NÃO usar; vs "meta de 100% de disponibilidade" como anti-padrão.
- Misconception central: "a meta é 100% disponível" — 100% é inatingível e
  mata a iteração; counterexample numérico (as 9:99 disponibilidade = parar
  tudo). Segunda: "orçamento de erro serve para punir o time" — ele é um
  contrato de produto, não nota de desempenho; counterexample.
- Transfer: orçamento de latência de um pipeline de processamento de
  fotos (SLO de p95, não de disponibilidade) — domínio (job batch) e
  restrição (janela de processamento noturna) diferentes do shop.

## Exemplares obrigatórios
- `src/lib/lessons/observability.ts` (existentes na categoria, 58/60/61/63) e
  `src/lib/lessons/sre.ts` + `exercises-data` correspondente — tom,
  profundidade, formato.

## Contratos e exemplares (leia ANTES de redigir)
- `src/lib/lessons/types.ts` — contrato `Lesson` INTEIRO: nenhum campo vazio;
  `analogyLimits` obrigatório; `provenance.reviewed: false` com notes honestas
  ("redigida nesta rodada, sem revisão independente efetiva").
- `src/lib/exercises.ts` — contrato `Task`/`Rubric`/`Answer` (tipos predict/
  order/compare/find-flaw/variant/choose-info; `RubricCriterion.cause`
  diagnóstica; `check` sobre `a.picked|a.order|a.text`; `expected` com
  raciocínio comentado; `helpLevels` com 3 níveis graduados que NÃO entregam a
  resposta no nível 1).
- `src/lib/concepts.ts` — entrada canônica do conceito 65 (eli/risk/fix são
  INPUT, não redação final; a analogia do ELI10 é ponto de partida a revisar).
- `src/lib/lessons/prereq-motives.ts` — formato dos motivos (pt-BR), pares
  `"lição:prereq"`. CADA par do seu prereqIds precisa de motivo; motivo órfão
  é recusado pelo teste.
- `src/lib/relations.ts` — formato `Relation` (from/kind/to/note); "relacionado
  solto" não existe: cada proposta declara kind e nota de alcance.
- Shapes de instrumento: `src/components/instruments/index.ts` +
  `src/test/instruments-shapes.test.ts` (kinds: request-flow,
  latency-histogram, state-machine, event-track, query-explainer, timeline,
  table). O `data` do representation deve validar no shape do kind escolhido.
- `src/test/lessons.test.ts` e `src/test/f9-expansion2.test.ts` — contratos de
  lição que NÃO podem quebrar.

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
- Honestidade técnica (§12.3): não prometer garantia que o mecanismo não dá
  (orçamento não mede a EXPERIÊNCIA de cada usuário nem substitui decisão
  humana; SLI mal escolhido corrompe o orçamento); fragmento de código é
  ilustrativo, nunca "pronto para produção".
- 2 tarefas de prática, ids `t-65-*` (tipos distintos); ids únicos no TASKS
  global; rubricas diagnósticas com `cause` provável e 3 níveis de ajuda.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (ids com aula: 1–7, 10–17, 20, 22, 23, 25–27, 34, 35, 44–46, 56–58, 60, 61,
  63, 78, 79, 81, 82, 91–94, 97, 98, 102, 103, 109, 111 — confira em
  `src/lib/lessons/index.ts`) e apenas com motivo real; se nenhum pré-req for
  genuíno, `prereqIds` vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s37-observability-65/out/`:
- `lesson-65.ts` — objeto `Lesson` completo (export const LESSON_65: Lesson).
- `tasks-65.ts` — tarefas (export const TASKS_65: Task[]).
- `prereq-motives-65.md` — entradas `"65:prereq": "motivo pt-BR"` (se houver).
- `relations-65.md` — propostas de `Relation` para o conceito 65.
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preencha aqui, numerado, cada decisão editorial que tomar)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
