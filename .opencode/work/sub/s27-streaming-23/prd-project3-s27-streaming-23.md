# prd-project3-s27-streaming-23 — o COMO do pacote s27-streaming-23

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Long Polling é a requisição HTTP que o servidor
  SEGURA aberta até haver dado ou timeout; a entrega "empurrada" nasce de um
  ciclo de requisição-reconexão, não de um canal. A decisão real é escolher
  entre polling curto, long polling, SSE e WebSocket dado: direção do fluxo,
  limite do intermediário (proxy/firewall que fecha conexão ociosa ou recusa
  upgrade), e custo de reconexão. Representação: event-track ou timeline de um
  ciclo completo (requisição aberta → dado chega → resposta → nova requisição;
  e o caso timeout ocioso → fechada → reconexão com atraso de entrega).
  Contraste: "long polling como push" vs. "long polling como pull disfarçado"
  (o que muda: garantia, custo por mensagem, comportamento sob proxy).
  Misconception: "long polling entrega em tempo real como WebSocket" com
  counterexample (proxy encerra conexão ociosa; o evento só chega na
  reconexão). Transfer: painel de status de equipamentos numa fábrica atrás
  de proxy corporativo que bloqueia upgrade para WebSocket — a variante muda
  domínio E a restrição de rede.
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
- 2 tarefas de prática por conceito, ids `t-23-*` (substitua ids pelos
  números do(s) seu(s) conceito(s)); ids únicos no TASKS global.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (use `src/lib/lessons/index.ts`: ids 1-5, 10-17, 20, 22, 25-27, 34, 44, 45, 56, 58, 60, 61, 63, 78, 79, 81, 82, 91, 93, 97, 102, 103, 109, 111, 6 — confira na fonte) e apenas com motivo real; se nenhum pré-req for genuíno,
  prereqIds vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s27-streaming-23/out/`:
- `lesson-23.ts` — objeto(s) `Lesson` completo(s) (export const
  LESSONS_STREAMING: Lesson[]).
- `tasks-23.ts` — tarefas (export const TASKS_STREAMING: Task[]).
- `prereq-motives-23.md` — entradas `"lição:prereq": "motivo pt-BR"`.
- `relations-23.md` — propostas de `Relation` para o(s) conceito(s).
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preenchido pelo agente principal após verificação — subagente read-only)

1. Entrega read-only (íntegra no relatório, persistida em out/).
2. Pré-requisitos [11, 22]: timeout ≠ confirmação de falha; canal WebSocket como contraste.
3. event-track com entrega normal, timeout, encerramento pelo proxy e entrega atrasada após reconexão.
4. Retenção por cursor é hipótese da aplicação, nunca garantia do long polling.
5. Bloqueio de Upgrade não implica bloqueio de SSE; teste separado de buffering.

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
