# prd-project3-s14 — o COMO da lição 14

## Decisões que você segue
- Contrato `Lesson` integral (`src/lib/lessons/types.ts`): `analogyLimits` e
  todo `counterexample` não vazios; `provenance.reviewed: false` com notes
  honestas ("redigida nesta rodada, sem revisão independente efetiva").
- practiceIds só apontam para as tarefas que VOCÊ produz (`t-14-*`); 2 tarefas,
  tipos do motor (predict/order/compare/find-flaw/variant/choose-info).
- `provenance.reviewed` nunca true (F9: revisão efetiva exige registro que só
  o agente principal assina).
- Instrumento: escolha o `kind` cujo shape você domina lendo
  `src/components/instruments/index.ts` (event-track/table/request-flow são
  candidatos naturais). O `data` deve validar no formato do instrumento
  (teste: `src/test/instruments-shapes.test.ts`). Nenhum campo vazio.
- `representation.caption` diz O QUE observar para entender a causa (§D1).

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/lessons/resilience.ts` — tom, profundidade, formato completo.
- `src/lib/exercises-data/resilience.ts` — formato Task/Rubric/check.
- `src/lib/concepts.ts` — entrada canônica do 14 (eli/risk/fix são INPUT, não
  a redação final; a analogia do ELI10 é ponto de partida a revisar).
- `src/lib/lessons/prereq-motives.ts` — entradas "12:14" e "13:x" para consistência.

## Requisitos editoriais
- Idioma: inglês (como os exemplares de lições e tarefas).
- Scenario com system/data/symptom/constraints/baseline específico (pagamento
  duplicado é o contexto canônico; variante de domínio no `transfer`).
- contrast[] deve incluir a alternativa real (chave natural vs key explícita)
  com trade-off e whenNotToUse.
- Pré-requisitos: escolha entre conceitos canônicos (ex.: 11 Timeouts, 12
  Retries, 15 Message Queues) — CADA par `14:<id>` precisa de entrada em
  `prereq-motives-14.md` no formato `"14:11": "motivo editorial em pt-BR"`; o
  teste denuncia motivo ausente ou órfão.
- Rubric: criteria com `cause` diagnóstica, `check` sobre `a.picked`, `expected`
  com raciocínio comentado, `helpLevels` graduados em 3 níveis sem entregar a
  resposta no nível 1.

## Casos de borda a provar nas tarefas
- Key reusada com payload diferente (deve ser rejeitada, não abafada).
- Key expirada antes da resposta confirmada (janela de retenção).
- Non-idempotent read + idempotent mutation no mesmo fluxo de checkout.

## Registro de decisões
(vazio — você preenche, numerado, e lista no relatório final)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem `reviewed: true`.
