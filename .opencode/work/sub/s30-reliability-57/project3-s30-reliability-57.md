# project3-s30-reliability-57 — Segunda lição Reliability: 57 (Liveness & Readiness Probes)

## Missão
Dar à categoria Reliability a segunda lição editorial: conceito 57 (Liveness & Readiness Probes), ancorada na lição 56 (Health Checks) aberta na rodada anterior. A lição 57 transforma "verificação de saúde" em DUAS decisões com consequências distintas.

## Escopo
- Seu: lição 57 + 2 tarefas + motivos de pré-req + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), conceitos vizinhos da
  categoria, outras categorias (irmãos desta rodada), pilares centrais.

## Por quê
A auditoria marca toda a Reliability sem aula além de 56. O erro caro do 57 é usar o probe errado: falha de liveness reinicia (bom para processo travado, catastrófico para dependência externa lenta — restart storm); falha de readiness só tira da rotação.

## Fronteiras
- Recebe: contratos (abaixo), entrada canônica do(s) conceito(s), exemplares.
- Entrega: arquivos em out/; o agente principal integra em
  `src/lib/lessons/reliability.ts` e `src/lib/exercises-data/reliability.ts`.

## Dono exclusivo de
`.opencode/work/sub/s30-reliability-57/**` (nada mais).
