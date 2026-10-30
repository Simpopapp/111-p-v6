# prd-project3-s41-devops-53 — o COMO do pacote s41

## Decisões que você segue (recortes dos pilares centrais)
- A lição é um objeto `Lesson` (contrato `src/lib/lessons/types.ts`) — todos
  os campos obrigatórios preenchidos com conteúdo real, sem caixa vazia.
- Conteúdo da lição em INGLÊS (padrão das lições publicadas); provenance.notes
  honesta (o que foi verificado, fontes quando consultadas), `reviewed: false`
  — nunca alegar revisão independente.
- Motivos de pré-req e notes de relation em PT-BR (padrão das camadas
  `prereq-motives.ts` e `relations.ts`).
- Contexto recorrente §12.3: a Academy shop pode abrir o cenário, mas a
  variante/transfer precisa mudar domínio E restrição (não decorar a loja).
- Honestidade de mecanismo: não prometer o que a bancada/simuladores não
  fazem; a nova lição NÃO tem laboratório — não referencie /labs que não
  exercem o mecanismo de canary.

## Método de trabalho
1. Leia os pilares centrais (`/dev-server/.opencode/project3.md`,
   `prd-project3.md`, `roadmap-proj3`) e os contratos:
   `src/lib/lessons/types.ts`, `src/lib/exercises.ts`,
   `src/test/instruments-shapes.test.ts`, `src/test/f9-expansion3.test.ts`.
2. Extraia por bun (nunca leia arquivos minificados inteiros):
   ```
   mkdir -p /tmp/s41 && cd /dev-server
   bun -e 'import {CONCEPTS} from "./src/lib/concepts.ts";
       console.log(JSON.stringify(CONCEPTS.filter(c => c.id===53 || [52,54,55,7,6].includes(c.id)), null, 2))' > /tmp/s41/concepts.json
   bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
       console.log(JSON.stringify(getLesson(52), null, 2))' > /tmp/s41/lesson-52.json
   bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
       console.log(JSON.stringify(TASKS.filter(t => t.conceptId===52), null, 2))' > /tmp/s41/tasks-52.json
   bun -e 'import {RELATIONS} from "@/lib/relations";
       console.log(JSON.stringify(RELATIONS.filter(r => r.from===53 || r.to===53), null, 2))' > /tmp/s41/relations.json
   ```
   (ajuste o import de relations se o caminho differs — `src/lib/relations.ts`).
3. A lição 52 é o EXEMPLAR de qualidade: leia `lesson-52.json` por inteiro e
   iguale o nível (definition com limites reais, analogyLimits obrigatório,
   correspondência [técnico, metáfora], scenario com constraints, worked com
   raciocínio intermediário, contrast com condições explícitas, misconceptions
   com discriminant + counterexample real).
4. Instrumento: escolha o kind cujo shape você consegue preencher 100% (table,
   timeline ou event-track são os mais seguros para canary — exposição por
   coorte ao longo do tempo). Valide mentalmente contra o shapes test; inclua
   `textEquivalent` completo (a11y D13).
5. Tarefas: 2 por lição (tipos diferentes, ex. compare + variant). Rubrica:
   criteria com key/label/cause (causa provável do equívoco) e check descrito
   em prose exata (ex.: "exato: picked = ['b']") — o agente principal
   implementa o check; expected com raciocínio; nextStep específico;
   helpLevels 3 níveis que NÃO entregam a resposta no nível 1.
6. Pré-requisitos: só conceitos COM aula (use o conjunto coberto — extraia
   `LESSONS.map(l=>l.id)`). Se nenhum pré-req for honestamente necessário,
   `prereqIds: []` é aceitável (precedente 39/52/67). Cada pré-req exige
   motivo pt-BR específico (padrão `prereq-motives.ts`).
7. Relations: ≥2 proposals (prereq | contrast | composition | context |
   practice) com note pt-BR que declare o alcance; sem duplicar relation
   existente (confira o filtro extraído).

## Critérios de aceite (verificáveis)
- Lesson JSON completo e válido contra o contrato (todos os campos; rev "1.0";
  id 53; objective com ação observável em contexto definido).
- 8 critérios §12.1 cobertos: problema reconhecível; como funciona + onde a
  analogia quebra; instrumento mostra o mecanismo; contraste sob condições
  explícitas; decisão com feedback verificável; quando NÃO usar; transfer
  muda domínio E restrição; síntese/limites consultáveis.
- 2 tarefas com rubrica diagnóstica (cause plausível) e 3 helpLevels
  graduados.
- provenance.notes honesta: diz o que foi verificado, cita fontes consultadas
  (com URL), não aleg "reviewed".

## Formato do relatório final (obrigatório)
1. `LESSON_53:` objeto JSON íntegro do Lesson.
2. `TASKS_53:` array JSON íntegro com as 2 Tasks.
3. `PREREQ_MOTIVES_53:` pares `"53:<prereq>"` → motivo pt-BR (ou justificativa
   de prereqIds vazio).
4. `RELATIONS_53:` array com from/kind/to/note (pt-BR).
5. `GATES:` checklist do aceite com evidência por item.
6. `DECISIONS:` decisões tomadas (numeradas) e pendências.

## Proibições
- Não escreva em nenhum arquivo do projeto além de `/tmp/s41/` (e, se
  permitido, `out/` na sua pasta). Sem dependências novas. Sem perguntar ao
  usuário. Não use oc/monitor. Não copie frases da lição 52; canary tem
  mecanismo próprio (cohort parcial, métrica de guarda, rampa de exposição).
