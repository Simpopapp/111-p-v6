# prd-project3-s29-scaling-46 — o COMO do pacote s29-scaling-46

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Horizontal Scaling é a capacidade que vem de N
  instâncias idênticas atrás de um balanceador, o que exige que NENHUMA
  instância carregue estado de que outra precise. A decisão real é classificar
  cada estado do produto (sessão de usuário, upload em progresso, cache,
  trabalho agendado) e escolher onde ele vive: fora (Redis, armazenamento
  compartilhado, fila) ou preso à instância (com a consequência de afinidade
  e perda). Representação: table de estados × local × consequência quando a
  instância morre ou quando outra recebe a próxima requisição. Contraste:
  "escalar é adicionar instâncias" vs. "escalar é mover o estado para fora
  primeiro" (o que muda: o que acontece no failover e no autoscaling). 
  Misconception: "adicionar instâncias aumenta capacidade automaticamente" com
  counterexample (sessão em memória local: usuário cai na réplica sem a
  sessão e é deslogado; autoscaling do 45 provisiona réplicas inúteis).
  Transfer: frota de workers de processamento de imagens — o que é estado
  (fila de trabalho, resultado temporário) e onde deve viver; a variante
  muda domínio e a restrição (jobs longos, não requisições).
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
- 2 tarefas de prática por conceito, ids `t-46-*` (substitua ids pelos
  números do(s) seu(s) conceito(s)); ids únicos no TASKS global.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (use `src/lib/lessons/index.ts`: ids 1-5, 10-17, 20, 22, 25-27, 34, 44, 45, 56, 58, 60, 61, 63, 78, 79, 81, 82, 91, 93, 97, 102, 103, 109, 111, 6 — confira na fonte) e apenas com motivo real; se nenhum pré-req for genuíno,
  prereqIds vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s29-scaling-46/out/`:
- `lesson-46.ts` — objeto(s) `Lesson` completo(s) (export const
  LESSONS_SCALING: Lesson[]).
- `tasks-46.ts` — tarefas (export const TASKS_SCALING: Task[]).
- `prereq-motives-46.md` — entradas `"lição:prereq": "motivo pt-BR"`.
- `relations-46.md` — propostas de `Relation` para o(s) conceito(s).
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preenchido pelo agente principal após verificação — subagente read-only)

1. Entrega read-only (íntegra no relatório, persistida em out/).
2. Pré-requisito único 3; lição 45 como composition, não dependência.
3. Estado autoritativo vs. cache descartável; afinidade é mitigação condicionada.
4. Transfer: workers de imagem com ack após resultado durável e repetição tolerada.

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
