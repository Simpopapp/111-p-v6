# project3-s28-distributed-35 — Segunda lição Distributed: 35 (Eventual Consistency)

## Missão
Dar à categoria Distributed a segunda lição editorial: conceito 35 (Eventual Consistency), ancorada na lição 34 (CAP Theorem) aberta na rodada anterior. Distributed tem 9 conceitos; 35 é o mecanismo do lado das réplicas que o 34 só nomeia.

## Escopo
- Seu: lição 35 + 2 tarefas + motivos de pré-req + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), conceitos vizinhos da
  categoria, outras categorias (irmãos desta rodada), pilares centrais.

## Por quê
A auditoria marca toda a Distributed sem aula além de 34. Eventual Consistency é onde o trade-off teórico do CAP vira decisão de produto: quais leituras toleram dado velho e quais exigem read-your-writes.

## Fronteiras
- Recebe: contratos (abaixo), entrada canônica do(s) conceito(s), exemplares.
- Entrega: arquivos em out/; o agente principal integra em
  `src/lib/lessons/distributed.ts` e `src/lib/exercises-data/distributed.ts`.

## Dono exclusivo de
`.opencode/work/sub/s28-distributed-35/**` (nada mais).
