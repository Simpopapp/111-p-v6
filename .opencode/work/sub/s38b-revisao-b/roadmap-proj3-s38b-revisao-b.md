# roadmap-proj3-s38b-revisao-b

Gates do pacote: as 8 lições revisadas uma a uma do começo ao fim (extração
JSON bonito, sem truncamento) com veredito e achados com evidência · correções
propostas como texto exato de substituição · notes propostas em pt-BR com a
frase "revisão efetiva registrada" só onde os critérios 1–3 confirmam ·
nenhuma escrita fora de `out/` (e /tmp para extrações).

## Fase S38B.1 — Contratos e escopo
- [ ] Ler `types.ts`, `exercises.ts`, `f9-audit.test.ts`; preparar `/tmp/s38b`
      e o roteiro de extração; extrair a lição 56 como piloto do método.
- Gates S38B.1: método validado na lição 56 (JSON completo, sem truncamento).

## Fase S38B.2 — Verificação técnica (uma a uma)
- [ ] Revisar 56, 57, 78, 79, 92, 94, 97, 98 + tarefas pelos critérios de
      aceite, com fonte consultada quando houver dúvida genuína.
- Gates S38B.2: veredito por lição, achados com evidência e severidade;
  nenhuma lição sem veredito.

## Fase S38B.3 — Propostas e auto-verificação
- [ ] `provenance.notes` propostas em pt-BR (com/sem a frase do guard,
      conforme critérios); correções como texto exato de substituição.
- [ ] Revisar o próprio relatório: cada achado tem evidência verificável;
      cada proposta de `reviewed: true` tem os critérios 1–3 confirmados.
- Gates S38B.3: `out/revisao-b.md` íntegro e auto-verificado.
