# prd-project3-s44-performance-41 — o COMO do pacote s44

## Decisões que você segue (recortes dos pilares centrais)
- Objeto `Lesson` (contrato `src/lib/lessons/types.ts`), todos os campos
  preenchidos. Conteúdo em INGLÊS; provenance.notes honesta
  (`reviewed: false`); motivos de pré-req e notes de relation em PT-BR.
- Contexto recorrente §12.3: a Academy shop pode abrir o cenário; variante/
  transfer muda domínio E restrição.
- Honestidade de mecanismo: leak é crescimento retenido (referências não
  liberadas), não pico momentâneo; GC não recupera o que ainda é referenciado;
  restart restaura a sintoma, não a causa; diagnóstico exige série temporal,
  não leitura única. Sem laboratório de memória: não referencie /labs.

## Método de trabalho
1. Leia os pilares centrais e os contratos: `src/lib/lessons/types.ts`,
   `src/lib/exercises.ts`, `src/test/instruments-shapes.test.ts`,
   `src/test/f9-expansion3.test.ts`.
2. Extraia por bun (nunca leia arquivos minificados inteiros):
   ```
   mkdir -p /tmp/s44 && cd /dev-server
   bun -e 'import {CONCEPTS} from "./src/lib/concepts.ts";
       console.log(JSON.stringify(CONCEPTS.filter(c => c.id===41 || [42,43,50,89,92].includes(c.id)), null, 2))' > /tmp/s44/concepts.json
   bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
       console.log(JSON.stringify(getLesson(92), null, 2))' > /tmp/s44/lesson-92.json
   bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
       console.log(JSON.stringify(TASKS.filter(t => t.conceptId===92), null, 2))' > /tmp/s44/tasks-92.json
   ```
   (a lição 92 é o exemplar da categoria; leia por inteiro.)
3. Instrumento: timeline (heap/latência ao longo de eventos de carga — séries
   temporais tornam o crescimento visível) ou table — valide contra o shapes
   test; `textEquivalent` completo (a11y D13).
4. Tarefas: 2 (tipos diferentes, ex. compare + variant). Rubrica: criteria
   com key/label/cause e check em prose exata ("exato: picked = ['b']");
   expected com raciocínio; nextStep específico; helpLevels 3 níveis que NÃO
   entregam a resposta no nível 1.
5. Pré-requisitos: só conceitos COM aula. `prereqIds: []` honesto é aceitável.
   Cada pré-req exige motivo pt-BR específico.
6. Relations: ≥2 proposals (ex. context com 92/94, contrast com 42 GC)
   com note pt-BR; sem duplicar existente (extraia relations de
   41/42/43/50/89/92/94).

## Critérios de aceite (verificáveis)
- Lesson JSON completo e válido (rev "1.0"; id 41; objective observável).
- 8 critérios §12.1 cobertos campo a campo.
- 2 tarefas com rubrica diagnóstica e 3 helpLevels graduados.
- provenance.notes honesta, sem alegação de revisão.

## Formato do relatório final (obrigatório)
1. `LESSON_41:` JSON íntegro. 2. `TASKS_41:` array com as 2 Tasks.
3. `PREREQ_MOTIVES_41:` pares `"41:<prereq>"` → motivo pt-BR (ou justificativa
   de vazio). 4. `RELATIONS_41:` array from/kind/to/note (pt-BR).
5. `GATES:` checklist com evidência. 6. `DECISIONS:` decisões e pendências.

## Proibições
- Não escreva em nenhum arquivo do projeto além de `/tmp/s44/` (e `out/` se
  permitido). Sem dependências novas. Sem perguntar ao usuário. Não use
  oc/monitor. Não trate "alto uso de memória" como leak — a distinção é o
  discriminant central das misconceptions.
