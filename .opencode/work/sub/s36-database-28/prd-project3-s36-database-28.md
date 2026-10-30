# prd-project3-s36-database-28 — o COMO do pacote s36-database-28

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Connection Pooling é o **pool como fila limitada de
  sessões reutilizáveis**: uma conexão é estado caro (TCP + TLS + autenticação
  + estado de sessão no backend do banco) e o pool a empresta por request sob
  um semáforo de tamanho fixo. A decisão real não é "usar pool": é o TAMANHO
  versus o limite de conexões do banco (N app instances × pool size ≤ backend
  limit) e o comportamento sob exaustão (esperar com timeout vs erro imediato
  vs abrir fora do pool).
- Representação: `latency-histogram` decompondo a latência de um request sob
  pool saturado — a maior fatia é fila de espera pelo slot, não execução da
  query; compare com o histograma do pool dimensionado. (Verifique o shape
  aceito em `instruments-shapes.test.ts` antes de redigir o `data`.)
- Contraste: pool por processo vs pooler externo (PgBouncer/pooler gerenciado)
  como alternativa com tradeoff (quantas instâncias, transações vs sessões) e
  quando NÃO usar; vs "sem pool, conexão por request" com o custo real.
- Misconception central: "mais conexões = mais rápido" — o backend do banco
  satura (context switch, locks em memória), latência piora com pool grande
  demais; counterexample numérico. Segunda: "pool deve abrir uma conexão nova
  quando todas estão ocupadas" — isso destrói o limite que protege o banco;
  counterexample com o backend recusando conexões.
- Transfer: pool de conexões HTTP para uma API externa de cobrança — domínio
  (cliente de API, não banco) e restrição (limite de rate da API externa, não
  de conexões do servidor) diferentes do shop.

## Exemplares obrigatórios
- `src/lib/lessons/database.ts` (existentes na categoria) e
  `src/lib/lessons/resilience.ts` + `exercises-data` correspondente — tom,
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
- `src/lib/concepts.ts` — entrada canônica do conceito 28 (eli/risk/fix são
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
  (pool não conserta query lenta nem deadlock; conexão devolvida com estado
  sujo pode vazar transação); fragmento de código é ilustrativo, nunca "pronto
  para produção".
- 2 tarefas de prática, ids `t-28-*` (tipos distintos); ids únicos no TASKS
  global; rubricas diagnósticas com `cause` provável e 3 níveis de ajuda.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (ids com aula: 1–7, 10–17, 20, 22, 23, 25–27, 34, 35, 44–46, 56–58, 60, 61,
  63, 78, 79, 81, 82, 91–94, 97, 98, 102, 103, 109, 111 — confira em
  `src/lib/lessons/index.ts`) e apenas com motivo real; se nenhum pré-req for
  genuíno, `prereqIds` vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s36-database-28/out/`:
- `lesson-28.ts` — objeto `Lesson` completo (export const LESSON_28: Lesson).
- `tasks-28.ts` — tarefas (export const TASKS_28: Task[]).
- `prereq-motives-28.md` — entradas `"28:prereq": "motivo pt-BR"` (se houver).
- `relations-28.md` — propostas de `Relation` para o conceito 28.
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preencha aqui, numerado, cada decisão editorial que tomar)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
