# prd-project3-s33-devops-52 — o COMO do pacote s33-devops-52

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Blue-Green é o **switch de tráfego como inversão
  atômica entre dois ambientes idênticos**, com o ambiente anterior intacto
  como rollback instantâneo. A decisão real NÃO é "dois servidores": é o que
  precisa ser compatível para o flip ser seguro — schema/migrações de dados
  compartilhados, formato de cache e mensagem, sessões — porque o banco (e o
  estado) é único enquanto as duas versões podem coexistir por segundos ou
  dias. Segunda decisão: aquecimento (warm-up) do ambiente ocioso — o flip é
  atômico, mas a primeira onda de tráfego pode encontrar caches frios/JIT frio.
- Representação: `table` comparando o MOMENTO do flip sob (a) migração de
  schema compatível com a versão anterior e (b) migração incompatível
  implantada junto — colunas: versão no blue, versão no green, escrita do
  usuário, resultado. O ponto que a tabela deve expor: o flip volta em
  instantes nos dois casos, mas a incompatibilidade de dados NÃO volta.
- Contraste: blue-green vs rolling deploy (como alternativa, com tradeoff e
  quando NÃO usar — rolamento é conceito 54, NÃO crie lição para ele); vs
  "deploy canário" citado como variações de exposição gradual, sem aprofundar
  (conceito 53).
- Misconception central: "blue-green torna o deploy sem risco" — o flip é
  reversível, migração de dados incompatível não é; counterexample concreto.
  Segunda: "o ambiente antigo é backup dos meus dados" — estado vive no banco
  compartilhado, não no ambiente; escritas feitas durante a janela green
  permanecem.
- Transfer: publicar um site de documentação com duas compilações completas
  prontas e trocar o apontamento do CDN — domínio (site estático/CDN) e
  restrição (sem banco, mas com cache de longa duração) diferentes do shop.

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
- `src/lib/concepts.ts` — entrada canônica do conceito 52 (eli/risk/fix são
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
  lição que NÃO podem quebrar (f9-expansion2 mostra o formato do contrato novo
  da rodada).

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
  (o flip não protege de incompatibilidade de dados nem de bugs já presentes
  na versão nova); fragmento de código é ilustrativo, nunca "pronto para
  produção".
- 2 tarefas de prática, ids `t-52-*` (tipos distintos); ids únicos no TASKS
  global; rubricas diagnósticas com `cause` provável e 3 níveis de ajuda.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (ids com aula: 1–7, 10–17, 20, 22, 23, 25–27, 34, 35, 44–46, 56–58, 60, 61,
  63, 78, 79, 81, 82, 91–94, 97, 98, 102, 103, 109, 111 — confira em
  `src/lib/lessons/index.ts`) e apenas com motivo real; se nenhum pré-req for
  genuíno, `prereqIds` vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s33-devops-52/out/`:
- `lesson-52.ts` — objeto `Lesson` completo (export const LESSON_52: Lesson).
- `tasks-52.ts` — tarefas (export const TASKS_52: Task[]).
- `prereq-motives-52.md` — entradas `"52:prereq": "motivo pt-BR"` (se houver).
- `relations-52.md` — propostas de `Relation` para o conceito 52.
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preencha aqui, numerado, cada decisão editorial que tomar)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
