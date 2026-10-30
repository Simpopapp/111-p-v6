# prd-project3-s32-performance-92-94 — o COMO do pacote s32-performance-92-94

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- Throughput (92): mecanismo decisivo é trabalho CONCLUÍDO por unidade de
  tempo sob concorrência; o gargalo é a seção serializada ou I/O bloqueante,
  não a latência média. A decisão real é identificar o gargalo ANTES de
  adicionar workers: mais workers não aumentam throughput útil se o recurso
  compartilhado serializa. Representação: latency-histogram ou request-flow
  mostrando concorrência × conclusões por segundo, com o gargalo visível.
  Misconception: "latência menor implica throughput maior" com counterexample
  (lote grande e rápido demais satura o banco e o throughput cai). Pré-req
  natural: 91 (P50/P99 nearest-rank) e 44 (backpressure/admissão).
- Tail Latency (94): mecanismo decisivo é a AMPLIFICAÇÃO por fan-out: uma
  página que faz 50 sub-requisições tem a cauda de TODAS multiplicada
  (P(página rápida) ≈ produto das probabilidades individuais); hedging e
  timeouts por serviço atacam isso com custo. A decisão real é escolher onde
  intervir: reduzir fan-out, limitar latência de dependência, hedging
  (custo: carga extra) ou aceitar a cauda para o caso de uso. Representação:
  latency-histogram ou table do efeito fan-out num exemplo numérico HONESTO
  (não inventar percentis; usar os valores do exemplo e nomear a conta).
  Misconception: "melhorar a média melhora a página" com counterexample (o
  sub-requisito pior decide a página; média não o captura). Transfer:
  geração de relatório em lote que agrega vários serviços — onde a cauda
  mora e qual intervenção se justifica; a variante muda domínio e a
  restrição (lote offline pode aceitar cauda; relatório interativo não).
- HONESTIDADE OBRIGATÓRIA (auditoria §Riscos): manter a convenção
  nearest-rank explícita — 99 respostas de 100 ms e 1 de 10.000 ms dão
  P99 = 100 ms, máximo = 10.000 ms, média = 199 ms. Qualquer número usado
  numa representação deve ser derivável dessa conta ou declarado como
  exemplo do instrumento, não como medida real.
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
- 2 tarefas de prática por conceito, ids `t-92,94-*` (substitua ids pelos
  números do(s) seu(s) conceito(s)); ids únicos no TASKS global.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (use `src/lib/lessons/index.ts`: ids 1-5, 10-17, 20, 22, 25-27, 34, 44, 45, 56, 58, 60, 61, 63, 78, 79, 81, 82, 91, 93, 97, 102, 103, 109, 111, 6 — confira na fonte) e apenas com motivo real; se nenhum pré-req for genuíno,
  prereqIds vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s32-performance-92-94/out/`:
- `lesson-92,94.ts` — objeto(s) `Lesson` completo(s) (export const
  LESSONS_PERFORMANCE: Lesson[]).
- `tasks-92,94.ts` — tarefas (export const TASKS_PERFORMANCE: Task[]).
- `prereq-motives-92,94.md` — entradas `"lição:prereq": "motivo pt-BR"`.
- `relations-92,94.md` — propostas de `Relation` para o(s) conceito(s).
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preenchido pelo agente principal após verificação — subagente read-only)

1. Entrega read-only (íntegra no relatório, persistida em out/).
2. 92 usa request-flow com admissões nos campos próprios; conclusões/s nos rótulos.
3. 94 usa conta 0.99^n com independência declarada como hipótese explícita.
4. Pré-requisitos 92:[91,44], 94:[91,11]; 93 não é pré-req (evita ciclo com lição existente).
5. Convenção nearest-rank explícita: P99=100ms, máx=10.000ms, média=199ms.

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
