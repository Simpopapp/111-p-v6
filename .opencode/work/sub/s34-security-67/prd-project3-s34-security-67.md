# prd-project3-s34-security-67 — o COMO do pacote s34-security-67

## Decisões que você segue
- Contrato `Lesson`/`Task` integral; integração em `src/lib/lessons/*.ts` e
  `src/lib/exercises-data/*.ts` é do agente principal — você NÃO escreve lá.

## Recorte editorial específico
- O mecanismo decisivo de Secrets Management é o **ciclo de vida da
  credencial**: criação (entropia), fronteira de armazenamento (quem/what pode
  ler em repouso), distribuição (como chega ao código que executa), rotação
  (raio de explosão limitado no tempo) e revogação. A decisão real não é "usar
  variável de ambiente": é onde a credencial vive em CADA estágio e qual é o
  custo de rotação quando aquele estágio vaza. Segredo tratado como
  "configuração" é a falha recorrente.
- Representação: `table` comparando a MESMA chave de API em quatro lugares —
  arquivo commitado no repositório, `.env` só na máquina, gerenciador de
  segredos referenciado no runtime, credencial efêmera injetada no deploy —
  colunas: local, quem consegue ler, consequência do vazamento, custo da
  rotação. O ponto que a tabela deve expor: rotação barata é o que torna o
  vazamento administrável; commit é o único lugar onde o vazamento é
  permanente (histórico do git).
- Contraste: gerenciador de segredos vs variável de ambiente (tradeoff: aura
  de "lugar seguro" sem rotação não é gestão de segredos); vs criptografia em
  repouso do banco (conceito 72 — NÃO crie lição para ele) como controle de
  OUTRA fronteira: cifra dados, não impede quem com credencial válida de ler.
- Misconception central: "variável de ambiente é o lugar seguro" — env vaza
  por processo filho, dump de logs, relatório de erro, /proc; counterexample
  concreto. Segunda: "rotação é para quando o segredo vaza" — rotação é
  controle de raio de explosão contínuo, não resposta de emergência.
- Transfer: token de pipeline de CI que publica relatórios de telemetria de um
  jogo — domínio (CI, não app web) e restrição (credencial de curta duração
  por job, sem humano no loop) diferentes do shop.

## Exemplares obrigatórios
- `src/lib/lessons/resilience.ts`, `src/lib/lessons/security.ts` (78/79) e o
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
- `src/lib/concepts.ts` — entrada canônica do conceito 67 (eli/risk/fix são
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
  (nenhum lugar de armazenamento impede vazamento; reduz e delimita);
  fragmento de código é ilustrativo, nunca "pronto para produção".
- 2 tarefas de prática, ids `t-67-*` (tipos distintos); ids únicos no TASKS
  global; rubricas diagnósticas com `cause` provável e 3 níveis de ajuda.
- `provenance.reviewed` nunca true (revisão efetiva é assinada só pelo agente
  principal, guarda f9-audit.test.ts).
- Pré-requisitos: escolha SOMENTE conceitos com lição estruturada já existente
  (ids com aula: 1–7, 10–17, 20, 22, 23, 25–27, 34, 35, 44–46, 56–58, 60, 61,
  63, 78, 79, 81, 82, 91–94, 97, 98, 102, 103, 109, 111 — confira em
  `src/lib/lessons/index.ts`) e apenas com motivo real; se nenhum pré-req for
  genuíno, `prereqIds` vazio é honesto.

## Entregáveis
Escreva em `.opencode/work/sub/s34-security-67/out/`:
- `lesson-67.ts` — objeto `Lesson` completo (export const LESSON_67: Lesson).
- `tasks-67.ts` — tarefas (export const TASKS_67: Task[]).
- `prereq-motives-67.md` — entradas `"67:prereq": "motivo pt-BR"` (se houver).
- `relations-67.md` — propostas de `Relation` para o conceito 67.
Se o ambiente recusar a escrita, entregue TODO o conteúdo íntegro no relatório
final (mesmo formato dos arquivos).

## Registro de decisões
(preencha aqui, numerado, cada decisão editorial que tomar)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`. Sem perguntar ao
  usuário. Não use oc/monitor.
