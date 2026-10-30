# prd-project3-s28-distributed-35 — o COMO do pacote s28-distributed-35

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Eventual Consistency é a réplica que aplica
  atualizações de forma assíncrona: leituras diferentes podem ver valores
  diferentes até a convergência, e a ordem/taxa de convergência NÃO é
  prometida. A decisão real é classificar cada leitura do produto: tolera
  dado desatualizado (feed, contagem) ou exige read-your-writes (o usuário
  precisa ver a própria edição)? E onde essa garantia vem (mesma réplica por
  sessão, quorum de leitura/escrita, confirmação explícita). Representação:
  timeline ou table mostrando o valor em 2–3 réplicas ao longo do tempo após
  uma escrita, com a leitura do usuário marcada em cada instante. Contraste:
  "consistência eventual como fraqueza inevitável" vs. "escolha por leitura"
  (a maioria dos usos tolera desatualização; alguns não). Misconception:
  "eventual significa igual rápido e em toda parte" com counterexample (o
  usuário troca a foto de perfil e o refresh cai noutra réplica: vê a foto
  velha; e em partição, a convergência espera). Transfer: ranking de
  pontuações num jogo multijogador — qual leitura pode ver ranking velho e
  qual não pode, e o que a variante muda nas restrições.
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
- 2 tarefas de prática por conceito, ids `t-35-*` (substitua ids pelos
  números do(s) seu(s) conceito(s)); ids únicos no TASKS global.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (use `src/lib/lessons/index.ts`: ids 1-5, 10-17, 20, 22, 25-27, 34, 44, 45, 56, 58, 60, 61, 63, 78, 79, 81, 82, 91, 93, 97, 102, 103, 109, 111, 6 — confira na fonte) e apenas com motivo real; se nenhum pré-req for genuíno,
  prereqIds vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s28-distributed-35/out/`:
- `lesson-35.ts` — objeto(s) `Lesson` completo(s) (export const
  LESSONS_DISTRIBUTED: Lesson[]).
- `tasks-35.ts` — tarefas (export const TASKS_DISTRIBUTED: Task[]).
- `prereq-motives-35.md` — entradas `"lição:prereq": "motivo pt-BR"`.
- `relations-35.md` — propostas de `Relation` para o(s) conceito(s).
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preenchido pelo agente principal após verificação — subagente read-only)

1. Entrega read-only (íntegra no relatório, persistida em out/).
2. Pré-requisito único 34; tabela com três réplicas; um escritor no exemplo.
3. Garantia por leitura: feed tolera atraso; confirmação própria exige revisão observada.
4. Quorum R+W>N discutido com condições, não como prova de linearizabilidade.
5. Transfer: ranking de jogo com premiação autoritativa.

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
