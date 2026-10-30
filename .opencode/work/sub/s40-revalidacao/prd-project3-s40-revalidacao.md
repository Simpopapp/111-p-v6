# prd-project3-s40-revalidacao — o COMO do pacote s40

## Decisões que você segue
- Você é REVISOR read-only: não implementa, não reescreve por gosto; corrige
  apenas erro factual, garantia que o mecanismo não dá, counterexample que não
  contradiz, ou canônico impreciso — sempre como proposta de texto exato.
- Integração e decisão final sobre regeneração de `concepts.ts` são do agente
  principal; você entrega o fundamento factual.

## MÉTODO OBRIGATÓRIO (método s38b, validado)
- NUNCA leia `src/lib/lessons/*.ts` nem `src/lib/exercises-data/*.ts` inteiros
  no stdout (minificados; truncamento invalida a leitura).
- Extraia cada lição/conceito para JSON bonito com bun, um alvo por vez:
  ```
  mkdir -p /tmp/s40
  cd /dev-server
  bun -e 'import {getLesson} from "./src/lib/lessons/index.ts";
      console.log(JSON.stringify(getLesson(ID), null, 2))' > /tmp/s40/lesson-ID.json
  bun -e 'import {TASKS} from "./src/lib/exercises-data/index.ts";
      console.log(JSON.stringify(TASKS.filter(t => t.conceptId === ID), null, 2))' > /tmp/s40/tasks-ID.json
  bun -e 'import {CONCEPTS} from "./src/lib/concepts.ts";
      console.log(JSON.stringify(CONCEPTS.filter(c => [46,57,78,79,92].includes(c.id)), null, 2))' > /tmp/s40/concepts-canonicos.json
  ```
- Revise uma lição por vez, do começo ao fim, e DEPOIS passe à seguinte.
- Pesquise na web (com fonte registrada) quando tiver dúvida técnica genuína.

## Alvos e o que verificar
1. **Revalidação das correções (7, 35, 46, 57, 92):** a correção aplicada
   (campo citado no provenance.notes de cada lição) resolve o achado original
   sem introduzir erro novo? A rubrica referenciada casa com as opções reais?
   helpLevels não entregam a resposta no nível 1? counterexample contradiz a
   misconception?
2. **Critérios de revisão efetiva por lição:** (1) acurácia técnica com fonte
   registrada; (2) consistência interna (counterexample, scenario sem promessa
   que o produto não cumpre — 92 usa nearest-rank com P99=100ms, máx=10.000ms,
   média=199ms contra `src/lib/simulators.ts`/`bench.ts` por trecho);
   (3) pedagogia §12.1 (problema reconhecível, limite da analogia, instrumento
   mostra o mecanismo, contraste com condições explícitas, transfer muda
   domínio E restrição). Confirmados 1–3 → notes com a frase literal
   "revisão efetiva registrada"; senão → veredito "ajustes obrigatórios" e
   notes SEM a frase, listando o que falta.
3. **Canônico (46, 57, 78, 79, 92):** eli/risk/fix de `concepts.ts` contém
   erro factual ou analogia imprecisa como explicação principal? Registre o
   veredito por conceito com evidência e, quando houver erro, o texto exato
   proposto. A lição coberta substitui o canônico na UI de `/concepts/$id`
   (verifique isso no roteamento — `hasLesson` decide o render).

## Formato do `out/revisao-s40.md`
```
## Lição <id> — revalidação
**Veredito:** aprovada (revisão efetiva) | ajustes obrigatórios | corrigida parcialmente
**Achados:** (campo, problema, evidência, severidade)
**Correções propostas:** (texto atual → proposto, entre crases)
**provenance.notes proposta:** (pt-BR; com/sem a frase do guard)

## Canônico <id> — <nome>
**Veredito:** correto | erro factual (regenerar) | impreciso superseded
**Evidência:** …
**Texto canônico proposto:** (quando houver erro; exato)
```

## Contratos e referências (leia ANTES)
- `src/lib/lessons/types.ts`, `src/lib/exercises.ts`, `src/test/f9-audit.test.ts`.
- `src/lib/simulators.ts` e `src/lib/bench.ts` por trecho quando a lição cita
  simulador/limite.

## Registro de decisões
(preencha no seu `prd-project3-s40-revalidacao.md`, numerado)

## Proibições
- Não escreva em `src/lib/**`, pilares centrais ou pastas de outros
  subagentes. Sem dependências novas. Sem perguntar ao usuário. Não use
  oc/monitor. Nunca proponha `reviewed: true` sem critérios 1–3 confirmados.
