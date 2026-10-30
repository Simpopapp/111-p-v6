# prd-project3-s16 — o COMO da lição 93

## Decisões que você segue
- Contrato `Lesson` integral (`src/lib/lessons/types.ts`); `analogyLimits` e
  `counterexample` nunca vazios; `provenance.reviewed: false`, notes honestas.
- 2 tarefas (ids `t-93-*`), tipos do motor; practiceIds só delas.
- Instrumento: `latency-histogram` é o candidato natural (leia o shape em
  `src/components/instruments/index.ts`; data deve validar como no teste
  `src/test/instruments-shapes.test.ts`). Nenhum campo vazio.
- Cuidado §12.1: percentis só significam com a distribuição explícita — a
  lição deve mostrar bucketing/agregação, não números soltos (a relação
  "93 composition→92" já existe em relations.ts; não contradiga).

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/lessons/performance.ts` — lições 2, 27, 44, 91: tom e formato.
- `src/lib/exercises-data/performance.ts` — formato Task/Rubric.
- `src/lib/concepts.ts` — entrada canônica 93.
- `src/lib/lessons/prereq-motives.ts` — entrada "93:92"? não existe; avalie.

## Requisitos editoriais
- Idioma inglês; scenario com baseline/constraints concretos (ex.: checkout
  com fila de pagamentos); `transfer` com variante de domínio.
- Pré-requisitos canônicos (ex.: 91 Latency, 60 Distributed Tracing, 92);
  TODO par `93:<id>` precisa de entrada em `prereq-motives-93.md` no formato
  `"93:91": "motivo editorial em pt-BR"`.
- Rubric com `cause` diagnóstica, `expected` comentado, `helpLevels` 3 níveis.

## Casos de borda a provar nas tarefas
- Média piora pouco enquanto P99 dobra — decisão de otimização muda.
- Percentil calculado sobre amostra viciada (só requests bem-sucedidos).
- Agregação entre janelas que apaga a cauda.

## Registro de decisões
(vazio — você preenche, numerado, e lista no relatório final)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`.
