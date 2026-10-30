# project3-s38b-revisao-b — planejamento do pacote

## Missão
Metade B da revisão técnica independente do F9: verificar, uma a uma, as 8
lições de expansão ids 56, 57, 78, 79, 92, 94, 97, 98 (com suas tarefas em
`src/lib/exercises-data/`) e produzir veredito + achados + proposta de
proveniência para cada uma. Só com verificação REAL a proposta pode pedir
`reviewed: true` — a guarda `f9-audit.test.ts` exige "revisão efetiva
registrada" nas notes.

## Escopo
- Verificar acurácia técnica, consistência interna e pedagogia (8 critérios
  §12.1) de lição e tarefas; entregar `out/revisao-b.md`.
- Read-only no projeto: quem aplica mudanças em `src/` é o agente principal.

## Fora do escopo
- Lições fora da lista (a metade A — 6, 7, 22, 23, 34, 35, 45, 46 — é do
  pacote irmão s38a).
- Pacotes irmãos: s38a (revisão A), s33 (DevOps 52), s34 (Security 67),
  s35 (Distributed 39), s36 (Database 28), s37 (Observability 65).

## Por quê
- A tentativa s38 (rodada atual) falhou por truncamento ao ler arquivos
  minificados de lição e não concluiu nenhuma revisão integral. Este pacote
  usa extração por script (JSON bonito, uma lição por vez) para revisar sem
  truncamento e só entrega veredito sustentado.

## Fronteiras
- Entra: as 8 lições + tarefas; `concepts.ts`; refs técnicas; simulators/bench
  quando citados (78 usa o lab sqli; 92/94 usam a convenção nearest-rank do
  bench com P99=100ms, máx=10.000ms, média=199ms).
- Sai: `out/revisao-b.md` (por lição: veredito, achados com evidência,
  correções propostas como texto exato, notes proposta em pt-BR).

## Dono exclusivo de
- `.opencode/work/sub/s38b-revisao-b/` (pilares + out/). Nada fora daqui.
