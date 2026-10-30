# prd-project3-s35-distributed-39 — o COMO do pacote s35-distributed-39

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Race Conditions é o **interleaving de
  read-modify-write não atômico**: a correção do código depende da ordem em
  que as operações de dois request handlers se intercalam, não da lógica de
  cada um isolada. A janela é check-then-act (ler estoque → decidir → escrever)
  e ela existe MESMO num único servidor com request handlers concorrentes —
  não é problema só de "sistemas distribuídos".
- Representação: `timeline` mostrando DOIS requests sobre a mesma linha de
  estoque/assento, passo a passo (R leu 1 · S leu 1 · R escreveu 0 · S escreveu
  0) — a janela visível entre leitura e escrita é o que o aluno deve apontar.
  O shape `timeline` já tem render dedicado validado — verifique o shape.
- Contraste: UPDATE atômico de uma sentença (`SET stock = stock - 1 WHERE
  stock > 0`) vs optimistic locking (retry em conflito) vs pessimistic locking
  (serializa) — tradeoff sob contenção e latência, e quando NÃO usar cada um
  (conceitos 36–38 existem na fila, NÃO crie lição para eles; nomeie como
  alternativas com tradeoff).
- Misconception central: "o código roda rápido demais para dar conflito" —
  a janela é de agendamento, não de duração percebida; counterexample com
  intercalação sob carga real (duas vendas simultâneas do último item).
  Segunda: "validação no cliente/frontend resolve" — a janela existe entre as
  operações no SERVIDOR; counterexample com dois clientes legítimos.
- Transfer: emissão de cupons de desconto numa campanha de fidelidade
  (contagem limitada) — domínio (promoção/marketing) e restrição (escrita por
  evento de mass-mail, sem fila) diferentes do shop.

## Exemplares obrigatórios
- `src/lib/lessons/resilience.ts`, `src/lib/lessons/distributed.ts` (34/35) e o
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
- `src/lib/concepts.ts` — entrada canônica do conceito 39 (eli/risk/fix são
  INPUT, não redação final; a analogia do ELI10 é ponto de partida a revisar).
- `src/lib/lessons/prereq-motives.ts` — formato dos motivos (pt-BR), pares
  `"lição:prereq"`. CADA par do seu prereqIds precisa de motivo; motivo órfão
  é recusado pelo teste.
- `src/lib/relations.ts` — formato `Relation` (from/kind/to/note); "relacionado
  solto" não existe: cada proposta declara kind e nota de alcance.
- Shapes de instrumento: `src/components/instruments/index.ts` +
  `src/test/instruments-shapes.test.ts` (kinds: request-flow,
  latency-histogram, state-machine, event-track, query-explainer, timeline,
  table). O `data` do representation deve validar no shape do kind escolhido —
  para `timeline`, veja também o render dedicado (`components/instruments/
  timeline.tsx`) e o teste de shapes como referência do formato aceito.
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
  (UPDATE atômico não resolve toda a janela — leitura + decisão fora do banco
  ainda pode intercalar; isolamento tem níveis); fragmento de código é
  ilustrativo, nunca "pronto para produção".
- 2 tarefas de prática, ids `t-39-*` (tipos distintos); ids únicos no TASKS
  global; rubricas diagnósticas com `cause` provável e 3 níveis de ajuda.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (ids com aula: 1–7, 10–17, 20, 22, 23, 25–27, 34, 35, 44–46, 56–58, 60, 61,
  63, 78, 79, 81, 82, 91–94, 97, 98, 102, 103, 109, 111 — confira em
  `src/lib/lessons/index.ts`) e apenas com motivo real; se nenhum pré-req for
  genuíno, `prereqIds` vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s35-distributed-39/out/`:
- `lesson-39.ts` — objeto `Lesson` completo (export const LESSON_39: Lesson).
- `tasks-39.ts` — tarefas (export const TASKS_39: Task[]).
- `prereq-motives-39.md` — entradas `"39:prereq": "motivo pt-BR"` (se houver).
- `relations-39.md` — propostas de `Relation` para o conceito 39.
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preencha aqui, numerado, cada decisão editorial que tomar)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
