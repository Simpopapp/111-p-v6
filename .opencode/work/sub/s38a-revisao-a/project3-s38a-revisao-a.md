# project3-s38a-revisao-a — planejamento do pacote

## Missão
Metade A da revisão técnica independente do F9: verificar, uma a uma, as 8
lições de expansão ids 6, 7, 22, 23, 34, 35, 45, 46 (com suas tarefas em
`src/lib/exercises-data/`) e produzir veredito + achados + proposta de
proveniência para cada uma. Só com verificação REAL a proposta pode pedir
`reviewed: true` — a guarda `f9-audit.test.ts` exige "revisão efetiva
registrada" nas notes.

## Escopo
- Verificar acurácia técnica, consistência interna e pedagogia (8 critérios
  §12.1) de lição e tarefas; entregar `out/revisao-a.md`.
- Read-only no projeto: quem aplica mudanças em `src/` é o agente principal.

## Fora do escopo
- Lições fora da lista (a metade B — 56, 57, 78, 79, 92, 94, 97, 98 — é do
  pacote irmão s38b).
- Pacotes irmãos: s38b (revisão B), s33 (DevOps 52), s34 (Security 67),
  s35 (Distributed 39), s36 (Database 28), s37 (Observability 65).

## Por quê
- A tentativa s38 (rodada atual) falhou por truncamento ao ler arquivos
  minificados de lição e não concluiu nenhuma revisão integral. Este pacote
  usa extração por script (JSON bonito, uma lição por vez) para revisar sem
  truncamento e só entrega veredito sustentado.

## Fronteiras
- Entra: as 8 lições + tarefas; `concepts.ts`; refs técnicas; simulators/bench
  quando citados.
- Sai: `out/revisao-a.md` (por lição: veredito, achados com evidência,
  correções propostas como texto exato, notes proposta em pt-BR).

## Dono exclusivo de
- `.opencode/work/sub/s38a-revisao-a/` (pilares + out/). Nada fora daqui.
