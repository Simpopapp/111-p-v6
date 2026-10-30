# roadmap-proj3-s38a-revisao-a

Gates do pacote: as 8 lições revisadas uma a uma do começo ao fim (extração
JSON bonito, sem truncamento) com veredito e achados com evidência · correções
propostas como texto exato de substituição · notes propostas em pt-BR com a
frase "revisão efetiva registrada" só onde os critérios 1–3 confirmam ·
nenhuma escrita fora de `out/` (e /tmp para extrações).

## Fase S38A.1 — Contratos e escopo
- [ ] Ler `types.ts`, `exercises.ts`, `f9-audit.test.ts`; preparar `/tmp/s38a`
      e o roteiro de extração; extrair a lição 6 como piloto do método.
- Gates S38A.1: método validado na lição 6 (JSON completo, sem truncamento).

## Fase S38A.2 — Verificação técnica (uma a uma)
- [ ] Revisar 6, 7, 22, 23, 34, 35, 45, 46 + tarefas pelos critérios de aceite,
      com fonte consultada quando houver dúvida genuína.
- Gates S38A.2: veredito por lição, achados com evidência e severidade;
  nenhuma lição sem veredito.

## Fase S38A.3 — Propostas e auto-verificação
- [ ] `provenance.notes` propostas em pt-BR (com/sem a frase do guard,
      conforme critérios); correções como texto exato de substituição.
- [ ] Revisar o próprio relatório: cada achado tem evidência verificável;
      cada proposta de `reviewed: true` tem os critérios 1–3 confirmados.
- Gates S38A.3: `out/revisao-a.md` íntegro e auto-verificado.
