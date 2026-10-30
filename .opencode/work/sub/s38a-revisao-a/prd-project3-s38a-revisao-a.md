# prd-project3-s38a-revisao-a — o COMO do pacote s38a-revisao-a

## Decisões que você segue
- Você é REVISOR: não implementa, não reescreve lições por gosto. Verifica
  técnica e pedagogicamente; propõe correção apenas onde houver erro factual,
  promessa de garantia que o mecanismo não dá, ou counterexample que não
  contradiz de fato a misconception.
- Integração em `src/lib/**` é do agente principal — você NÃO escreve lá.

## MÉTODO OBRIGATÓRIO (corrige a falha da tentativa s38)
- NUNCA leia `src/lib/lessons/*.ts` nem `src/lib/exercises-data/*.ts` inteiros
  no stdout: os objetos são minificados em linhas longas e o truncamento
  invalida a leitura.
- Extraia CADA lição para JSON bonito com bun, um alvo por vez, e leia o
  arquivo pequeno:
  ```
  mkdir -p /tmp/s38a
  cd /dev-server
  bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
    console.log(JSON.stringify(getLesson(ID), null, 2))' > /tmp/s38a/lesson-ID.json
  bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
    console.log(JSON.stringify(TASKS.filter(t => t.conceptId === ID), null, 2))' > /tmp/s38a/tasks-ID.json
  ```
  (substitua ID por 6, 7, 22, 23, 34, 35, 45, 46; rode um comando por vez.)
- Também extraia o conceito canônico de `src/lib/concepts.ts` da mesma forma
  (filter por id) para confrontar eli/risk/fix com a lição.
- Revise uma lição por vez, do começo ao fim (mentalModel, scenario,
  representation, worked, contrast, misconceptions, transfer, provenance + as
  2 tarefas: rubricas com `cause` plausível, `expected` correto, helpLevels
  que não entregam a resposta no nível 1), e DEPOIS passe à seguinte.
- Pesquise na web (com fonte registrada) quando tiver dúvida técnica genuína.

## O que "revisão efetiva" exige (critério de aceite)
1. **Acurácia técnica** — cada afirmação factual da lição (definição do
   mentalModel, limites da analogia, tradeoffs de contrast, counterexamples)
   confere com conhecimento técnico autoritativo; fonte registrada quando
   consultada.
2. **Consistência interna** — o counterexample CONTRADIZ a afirmação errada;
   o scenario não promete o que o produto não faz; números dos exemplares
   conferem (ex.: aritmética dos replays 45/22/23/92).
3. **Pedagogia dos 8 critérios §12.1** — problema reconhecível, limite da
   analogia presente, instrumento mostra o mecanismo, contraste sob condições
   explícitas, transfer muda domínio E restrição.
4. **Honestidade de proveniência** — notes proposta em pt-BR diz O QUE foi
   verificado (campos/fatos), cita fontes, e inclui a frase literal "revisão
   efetiva registrada" APENAS com os itens 1–3 confirmados. Achado não
   corrigido = veredito "ajustes obrigatórios" e notes SEM a frase.

## Formato do `out/revisao-a.md`
```
## Lição <id> — <nome do conceito>
**Veredito:** aprovada | aprovada com ajustes | ajustes obrigatórios
**Achados:** (lista; cada item: campo, problema, evidência, severidade)
**Correções propostas:** (texto atual → texto proposto exato, entre crases)
**provenance.notes proposta:** (pt-BR; com/sem a frase do guard, conforme critérios)
```
Se o ambiente recusar a escrita em `out/`, entregue o `revisao-a.md` INTEGRO
no relatório final (mesmo formato).

## Alvos da revisão (8 lições, uma a uma)
- DevOps 6, 7 · Streaming 22, 23 · Distributed 34, 35 · Scaling 45, 46.
- Arquivos: `src/lib/lessons/{devops,streaming,distributed,scaling}.ts` e
  `src/lib/exercises-data/{devops,streaming,distributed,scaling}.ts`.

## Contratos e referências (leia ANTES de revisar)
- `src/lib/lessons/types.ts` (contrato `Lesson`, campo a campo).
- `src/lib/exercises.ts` (contrato de tarefa/rubrica/answer).
- `src/lib/simulators.ts` e `src/lib/bench.ts` quando a lição cita um
  simulador/limite — verifique contra a fonte (extraia por trecho, não inteiro).
- `src/test/f9-audit.test.ts` — a guarda que valida a frase nas notes.
- Notas de proveniência existentes: o que elas já admitem.

## Registro de decisões
(preencha no seu arquivo `prd-project3-s38a-revisao-a.md`, numerado)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem perguntar ao usuário. Não use
  oc/monitor. Nunca proponha `reviewed: true` sem as verificações 1–3
  confirmadas e registradas. Nunca marque veredito sem lição revisada do
  começo ao fim.
