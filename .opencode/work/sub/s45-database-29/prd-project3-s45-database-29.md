# prd-project3-s45-database-29 — o COMO do pacote s45

## Decisões que você segue (recortes dos pilares centrais)
- Objeto `Lesson` (contrato `src/lib/lessons/types.ts`), todos os campos
  preenchidos. Conteúdo em INGLÊS; provenance.notes honesta
  (`reviewed: false`); motivos de pré-req e notes de relation em PT-BR.
- Contexto recorrente §12.3: a Academy shop pode abrir o cenário; variante/
  transfer muda domínio E restrição.
- Honestidade de mecanismo: réplicas escalam leituras, não escritas; lag é
  inerente (async) — leitura pode ver estado antigo; "ler da própria escrita"
  exige leitura do líder ou sessão pinada; cache e réplica não se substituem
  (2 é caching, com aula). Sem laboratório de replicação: não referencie
  /labs.

## Método de trabalho
1. Leia os pilares centrais e os contratos: `src/lib/lessons/types.ts`,
   `src/lib/exercises.ts`, `src/test/instruments-shapes.test.ts`,
   `src/test/f9-expansion3.test.ts`.
2. Extraia por bun (nunca leia arquivos minificados inteiros):
   ```
   mkdir -p /tmp/s45 && cd /dev-server
   bun -e 'import {CONCEPTS} from "./src/lib/concepts.ts";
       console.log(JSON.stringify(CONCEPTS.filter(c => c.id===29 || [30,32,33,25,2,45].includes(c.id)), null, 2))' > /tmp/s45/concepts.json
   bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
       console.log(JSON.stringify(getLesson(28), null, 2))' > /tmp/s45/lesson-28.json
   bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
       console.log(JSON.stringify(TASKS.filter(t => t.conceptId===28), null, 2))' > /tmp/s45/tasks-28.json
   ```
   (a lição 28 é o exemplar da categoria; leia por inteiro.)
3. Instrumento: timeline (write no líder, aplicação nas réplicas com lag
   visível) ou table (consulta → destino → estado lido) — valide contra o
   shapes test; `textEquivalent` completo (a11y D13).
4. Tarefas: 2 (tipos diferentes, ex. compare + variant). Rubrica: criteria
   com key/label/cause e check em prose exata ("exato: picked = ['b']");
   expected com raciocínio; nextStep específico; helpLevels 3 níveis que NÃO
   entregam a resposta no nível 1.
5. Pré-requisitos: só conceitos COM aula (ex. 25 JOIN, 2 caching, 45
   Horizontal Scaling). `prereqIds: []` honesto é aceitável. Cada pré-req
   exige motivo pt-BR específico.
6. Relations: ≥2 proposals (ex. contrast com 2 caching, context com 45)
   com note pt-BR; sem duplicar existente (extraia relations de
   29/30/32/33/2/45/25).

## Critérios de aceite (verificáveis)
- Lesson JSON completo e válido (rev "1.0"; id 29; objective observável).
- 8 critérios §12.1 cobertos campo a campo.
- 2 tarefas com rubrica diagnóstica e 3 helpLevels graduados.
- provenance.notes honesta, sem alegação de revisão.

## Formato do relatório final (obrigatório)
1. `LESSON_29:` JSON íntegro. 2. `TASKS_29:` array com as 2 Tasks.
3. `PREREQ_MOTIVES_29:` pares `"29:<prereq>"` → motivo pt-BR (ou justificativa
   de vazio). 4. `RELATIONS_29:` array from/kind/to/note (pt-BR).
5. `GATES:` checklist com evidência. 6. `DECISIONS:` decisões e pendências.

## Proibições
- Não escreva em nenhum arquivo do projeto além de `/tmp/s45/` (e `out/` se
  permitido). Sem dependências novas. Sem perguntar ao usuário. Não use
  oc/monitor. "Réplicas escalam escritas" é erro factual — o contraste deve
  explicitar o que escala e o que não.
