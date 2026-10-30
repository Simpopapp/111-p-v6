# prd-project3-s42-security-71 — o COMO do pacote s42

## Decisões que você segue (recortes dos pilares centrais)
- A lição é um objeto `Lesson` (contrato `src/lib/lessons/types.ts`) — todos
  os campos obrigatórios preenchidos com conteúdo real, sem caixa vazia.
- Conteúdo da lição em INGLÊS; provenance.notes honesta (o que foi verificado,
  fontes com URL quando consultadas), `reviewed: false` — nunca alegar
  revisão independente.
- Motivos de pré-req e notes de relation em PT-BR.
- Contexto recorrente §12.3: a Academy shop pode abrir o cenário; a
  variante/transfer precisa mudar domínio E restrição.
- Honestidade de mecanismo: TLS provê confidencialidade/integridade/
  identidade do servidor em trânsito — NÃO autorização, NÃO proteção contra
  XSS/CSRF em si, NÃO garantia sobre o que o servidor faz com os dados. Sem
  laboratório para TLS: não referencie /labs que não exercem o mecanismo.

## Método de trabalho
1. Leia os pilares centrais (`/dev-server/.opencode/project3.md`,
   `prd-project3.md`, `roadmap-proj3`) e os contratos:
   `src/lib/lessons/types.ts`, `src/lib/exercises.ts`,
   `src/test/instruments-shapes.test.ts`, `src/test/f9-expansion3.test.ts`.
2. Extraia por bun (nunca leia arquivos minificados inteiros):
   ```
   mkdir -p /tmp/s42 && cd /dev-server
   bun -e 'import {CONCEPTS} from "./src/lib/concepts.ts";
       console.log(JSON.stringify(CONCEPTS.filter(c => c.id===71 || [72,73,69,70,79].includes(c.id)), null, 2))' > /tmp/s42/concepts.json
   bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
       console.log(JSON.stringify(getLesson(78), null, 2))' > /tmp/s42/lesson-78.json
   bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
       console.log(JSON.stringify(TASKS.filter(t => t.conceptId===78), null, 2))' > /tmp/s42/tasks-78.json
   ```
   (a lição 78 é o exemplar de qualidade da categoria; leia por inteiro.)
3. Instrumento: timeline (fases do handshake como eventos sequenciais) ou
   table (o que cada camada/camada-troca garante vs não garante). Valide
   contra o shapes test; inclua `textEquivalent` completo (a11y D13).
4. Tarefas: 2 por lição (tipos diferentes, ex. find-flaw + variant). Rubrica:
   criteria com key/label/cause (causa provável do equívoco) e check descrito
   em prose exata (ex.: "exato: picked = ['b']"); expected com raciocínio;
   nextStep específico; helpLevels 3 níveis que NÃO entregam a resposta no
   nível 1.
5. Pré-requisitos: só conceitos COM aula (extraia `LESSONS.map(l=>l.id)`).
   `prereqIds: []` honesto é aceitável. Cada pré-req exige motivo pt-BR.
6. Relations: ≥2 proposals com note pt-BR que declare o alcance; sem
   duplicar relation existente (extraia as relations de 71/72/73/79/69).

## Critérios de aceite (verificáveis)
- Lesson JSON completo e válido contra o contrato (rev "1.0"; id 71;
  objective com ação observável em contexto definido).
- 8 critérios §12.1 cobertos (problema reconhecível; mecanismo + limite da
  analogia; instrumento mostra o mecanismo; contraste sob condições
  explícitas; decisão com feedback verificável; quando NÃO usar; transfer
  domínio+restrição; síntese/limites consultáveis).
- 2 tarefas com rubrica diagnóstica e 3 helpLevels graduados.
- provenance.notes honesta e sem alegação de revisão.

## Formato do relatório final (obrigatório)
1. `LESSON_71:` objeto JSON íntegro. 2. `TASKS_71:` array JSON com as 2 Tasks.
3. `PREREQ_MOTIVES_71:` pares `"71:<prereq>"` → motivo pt-BR (ou justificativa
   de prereqIds vazio). 4. `RELATIONS_71:` array from/kind/to/note (pt-BR).
5. `GATES:` checklist do aceite com evidência por item.
6. `DECISIONS:` decisões (numeradas) e pendências.

## Proibições
- Não escreva em nenhum arquivo do projeto além de `/tmp/s42/` (e, se
  permitido, `out/` na sua pasta). Sem dependências novas. Sem perguntar ao
  usuário. Não use oc/monitor. Não confunda TLS com criptografia em repouso
  (72) nem com JWT rotation (70); o contraste deve explicitar condições.
