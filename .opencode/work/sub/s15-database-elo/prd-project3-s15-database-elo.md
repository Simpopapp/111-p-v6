# prd-project3-s15 — o COMO das lições 25 e 26

## Decisões que você segue
- Contrato `Lesson` integral (`src/lib/lessons/types.ts`); `analogyLimits` e
  `counterexample` nunca vazios; `provenance.reviewed: false`, notes honestas.
- 2 tarefas por lição no `out/tasks-25-26.ts` (ids `t-25-*`, `t-26-*`), tipos
  do motor; practiceIds de cada lição apontam só para as tarefas dela.
- Instrumento: `query-explainer` é o candidato natural para ambas (leia o shape
  em `src/components/instruments/index.ts`; o data deve validar como no teste
  `src/test/instruments-shapes.test.ts`); `table` é alternativa se você souber
  produzi-lo corretamente. Nenhum campo vazio.
- Distinção entre as duas lições: 25 = estrutura de acesso (índice como custo
  de escrita + ganho de leitura); 26 = plano de execução (EXPLAIN, projeção de
  colunas, subqueries). Elas se contrastam — declare a relação com nota.

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/lessons/database.ts` — as lições 27 (N+1), 81 e 82: tom, formato,
  e o que JÁ é coberto para você não repetir.
- `src/lib/exercises-data/database.ts` — formato Task/Rubric.
- `src/lib/concepts.ts` — entradas canônicas 25/26 (input, não redação final).
- `src/lib/lessons/prereq-motives.ts` — entradas "25:27" e "27:25"? Não existem
  ainda: avalie se a relação merece entrada no seu bloco de motives.

## Requisitos editoriais
- Idioma inglês; scenario com baseline e constraints concretos (catálogo/
  pedidos); `transfer` com variante de domínio (ex.: log search, billing).
- Pré-requisitos canônicos (ex.: 27 N+1, 30 Connections? confirme ids em
  concepts.ts); TODO par `25:<id>` e `26:<id>` precisa de entrada em
  `prereq-motives-25-26.md` no formato `"25:27": "motivo editorial em pt-BR"`.
- Rubric com `cause` diagnóstica, `expected` comentado, `helpLevels` 3 níveis.

## Casos de borda a provar nas tarefas
- Índice que o planner ignora (seletividade baixa) — não é "adicionou índice, sumiu o problema".
- EXPLAIN mostra seq scan por causa de `SELECT *` sobre coluna grande.
- Índice que degrada escrita em tabela de alta gravação.

## Registro de decisões
(vazio — você preenche, numerado, e lista no relatório final)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`.
