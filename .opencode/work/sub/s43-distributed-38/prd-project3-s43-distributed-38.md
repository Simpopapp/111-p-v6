# prd-project3-s43-distributed-38 — o COMO do pacote s43

## Decisões que você segue (recortes dos pilares centrais)
- Objeto `Lesson` (contrato `src/lib/lessons/types.ts`), todos os campos
  preenchidos com conteúdo real. Conteúdo em INGLÊS; provenance.notes honesta
  (`reviewed: false`); motivos de pré-req e notes de relation em PT-BR.
- Contexto recorrente §12.3: a Academy shop pode abrir o cenário; variante/
  transfer muda domínio E restrição.
- Honestidade de mecanismo: lock com lease/expiração depende de relógio;
  fencing token impede que detentor expirado escreva, mas exige que o store
  valide; sem isso, exclusão é "majoritária", não absoluta. Sem laboratório
  para locks: não referencie /labs.

## Método de trabalho
1. Leia os pilares centrais e os contratos: `src/lib/lessons/types.ts`,
   `src/lib/exercises.ts`, `src/test/instruments-shapes.test.ts`,
   `src/test/f9-expansion3.test.ts`.
2. Extraia por bun (nunca leia arquivos minificados inteiros):
   ```
   mkdir -p /tmp/s43 && cd /dev-server
   bun -e 'import {CONCEPTS} from "./src/lib/concepts.ts";
       console.log(JSON.stringify(CONCEPTS.filter(c => c.id===38 || [36,37,39,40,96].includes(c.id)), null, 2))' > /tmp/s43/concepts.json
   bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
       console.log(JSON.stringify(getLesson(39), null, 2))' > /tmp/s43/lesson-39.json
   bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
       console.log(JSON.stringify(TASKS.filter(t => t.conceptId===39), null, 2))' > /tmp/s43/tasks-39.json
   ```
   (a lição 39 é o exemplar da categoria e o contraste natural; leia por
   inteiro.)
3. Instrumento: event-track (duas lanes de nós disputando o lock com eventos
   acquire/expiry/retry) ou timeline — valide contra o shapes test;
   `textEquivalent` completo (a11y D13).
4. Tarefas: 2 (tipos diferentes, ex. predict + variant). Rubrica: criteria
   com key/label/cause e check em prose exata ("exato: picked = ['b']");
   expected com raciocínio; nextStep específico; helpLevels 3 níveis que NÃO
   entregam a resposta no nível 1.
5. Pré-requisitos: só conceitos COM aula. Candidato natural: 39 (Race
   Conditions) — se usado como prereq, motive pt-BR obrigatório; `[]`
   honesto também é aceitável.
6. Relations: ≥2 proposals (ex. contrast com 39/36, context com 96 clock
   skew) com note pt-BR; sem duplicar existente (extraia relations de
   38/39/36/37/96).

## Critérios de aceite (verificáveis)
- Lesson JSON completo e válido (rev "1.0"; id 38; objective observável).
- 8 critérios §12.1 cobertos campo a campo.
- 2 tarefas com rubrica diagnóstica e 3 helpLevels graduados.
- provenance.notes honesta, sem alegação de revisão.

## Formato do relatório final (obrigatório)
1. `LESSON_38:` JSON íntegro. 2. `TASKS_38:` array com as 2 Tasks.
3. `PREREQ_MOTIVES_38:` pares `"38:<prereq>"` → motivo pt-BR (ou justificativa
   de vazio). 4. `RELATIONS_38:` array from/kind/to/note (pt-BR).
5. `GATES:` checklist com evidência. 6. `DECISIONS:` decisões e pendências.

## Proibições
- Não escreva em nenhum arquivo do projeto além de `/tmp/s43/` (e `out/` se
  permitido). Sem dependências novas. Sem perguntar ao usuário. Não use
  oc/monitor. Não prometa exclusão mútua absoluta; o limite é parte da aula.
