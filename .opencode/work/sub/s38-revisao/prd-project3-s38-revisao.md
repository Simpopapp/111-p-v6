# prd-project3-s38-revisao — o COMO do pacote s38-revisao

## Decisões que você segue
- Você é REVISOR: não implementa, não reescreve lições por gosto. Verifica
  técnica e pedagogicamente; propõe correção apenas onde houver erro factual,
  promessa de garantia que o mecanismo não dá, ou counterexample que não
  contradiz de fato a misconception.
- Integração em `src/lib/**` é do agente principal — você NÃO escreve lá.

## Alvos da revisão (16 lições, uma a uma)
- DevOps: 6, 7 · Streaming: 22, 23 · Distributed: 34, 35 · Scaling: 45, 46 ·
  Reliability: 56, 57 · Security: 78, 79 · Performance: 92, 94 ·
  Networking: 97, 98.
- Para cada lição, revise TAMBÉM as 2 tarefas `t-<id>-*` em
  `src/lib/exercises-data/`: rubricas diagnósticas com `cause` plausível,
  `expected` tecnicamente correto, helpLevels que não entregam a resposta no
  nível 1.

## O que "revisão efetiva" exige (critério de aceite)
1. **Acurácia técnica** — cada afirmação factual da lição (definição do
   mentalModel, limites da analogia, tradeoffs de contrast, counterexamples)
   confere com conhecimento técnico autoritativo. Quando tiver dúvida
   genuína, pesquise (web) e registre a fonte consultada no relatório.
2. **Consistência interna** — o counterexample da misconception CONTRADIZ a
   afirmação errada (não apenas muda de assunto); o scenario não promete o
   que o produto não faz (ex.: o lab sqli reconhece padrões, não é parser de
   SQL; 92/94 usam a convenção nearest-rank com P99=100ms, máx=10.000ms,
   média=199ms).
3. **Pedagogia dos 8 critérios §12.1** — a lição responde pela experiência:
   problema reconhecível, limite da analogia presente, instrumento mostra o
   mecanismo, contraste sob condições explícitas, transfer muda domínio E
   restrição.
4. **Honestidade de proveniência** — a notes proposta em pt-BR deve dizer
   O QUE foi verificado (campos/fatos), citar fontes quando consultadas, e
   incluir a frase literal "revisão efetiva registrada" APENAS nos itens 1–3
   confirmados. Achado não corrigido = veredito "ajustes obrigatórios" e
   notes proposta NÃO inclui a frase (o agente principal decide).

## Formato do `out/revisao.md`
```
## Lição <id> — <nome do conceito>
**Veredito:** aprovada | aprovada com ajustes | ajustes obrigatórios
**Achados:** (lista; cada item: campo, problema, evidência, severidade)
**Correções propostas:** (para cada campo: texto atual → texto proposto
exato, entre crases)
**provenance.notes proposta:** (pt-BR; com ou sem a frase do guard,
conforme os critérios)
```

## Contratos e referências (leia ANTES de revisar)
- `src/lib/lessons/types.ts` — contrato `Lesson` (campo a campo).
- `src/lib/concepts.ts` — entradas canônicas dos 16 conceitos.
- `src/lib/exercises.ts` + `src/lib/exercises-data/` — contrato de tarefa.
- `src/lib/simulators.ts` e `src/lib/bench.ts` — quando a lição cita um
  simulador/limite, verifique contra a fonte.
- `src/test/f9-audit.test.ts` — a guarda que valida a frase nas notes.
- Notas de proveniência existentes de cada lição: o que elas já admitem
  (ex.: "reference named for follow-up, not independently revalidated").

## Registro de decisões
(preencha aqui, numerado — ex.: critério adotado quando a fonte primária era
disputada; severidade aplicada)

## Proibições
- Não escreva em `src/lib/**`, nos pilares centrais, nem em pastas de outros
  subagentes. Sem dependências novas. Sem perguntar ao usuário. Não use
  oc/monitor. Nunca proponha `reviewed: true` sem as verificações 1–3
  confirmadas e registradas.
