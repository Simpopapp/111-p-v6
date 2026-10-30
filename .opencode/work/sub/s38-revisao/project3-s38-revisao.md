# project3-s38-revisao — planejamento do pacote

## Missão
Executar a revisão técnica independente que o F9 exige: verificar, uma a uma,
as 16 lições criadas nas rodadas de expansão (ids 6, 7, 22, 23, 34, 35, 45, 46,
56, 57, 78, 79, 92, 94, 97, 98) e produzir veredito + achados + proposta de
proveniência para cada uma. Só com verificação REAL a proposta pode pedir
`reviewed: true` — a guarda `f9-audit.test.ts` exige "revisão efetiva
registrada" nas notes.

## Escopo
- Ler cada lição em `src/lib/lessons/*.ts` e o exercício correspondente em
  `src/lib/exercises-data/*.ts`; verificar acurácia técnica (definição,
  analogia e seus limites, tradeoffs de contraste, counterexamples de
  misconceptions, honestidade do scenario) e consistência interna.
- Entregar relatório de revisão em `out/`; quem aplica mudanças em `src/` é o
  agente principal.

## Fora do escopo
- Qualquer escrita em `src/lib/**` (agente principal integra).
- Lições FORA da lista de 16 (as demais 30 não são desta rodada).
- Pacotes irmãos desta rodada: s33 (DevOps 52), s34 (Security 67),
  s35 (Distributed 39), s36 (Database 28), s37 (Observability 65) — as lições
  NOVAS deles ainda não existem e não fazem parte da sua revisão.

## Por quê
- `reviewed` está pendente para TODAS as lições; o roadmap desta rodada pede a
  primeira leva efetiva. Revisão sem verificação real seria desonestidade de
  proveniência — exatamente o que o F9 proíbe.

## Fronteiras
- Entra: as 16 lições + seus exercícios; conceitos canônicos em
  `src/lib/concepts.ts`; refs técnicas citadas nas notes de proveniência.
- Sai: `out/revisao.md` — por lição: veredito (aprovada / aprovada com
  ajustes / ajustes obrigatórios), achados com evidência, texto proposto de
  `provenance.notes` (pt-BR), correções propostas como texto exato de
  substituição por campo.

## Dono exclusivo de
- `.opencode/work/sub/s38-revisao/` (pilares + out/). Nada fora daqui.
