# project3-s29-scaling-46 — Segunda lição Scaling: 46 (Horizontal Scaling)

## Missão
Dar à categoria Scaling a segunda lição editorial: conceito 46 (Horizontal Scaling), ancorada na lição 45 (Autoscaling) aberta na rodada anterior. O mecanismo do 45 (contar réplicas como capacidade) pressupõe o que o 46 ensina: instâncias idênticas e stateless.

## Escopo
- Seu: lição 46 + 2 tarefas + motivos de pré-req + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), conceitos vizinhos da
  categoria, outras categorias (irmãos desta rodada), pilares centrais.

## Por quê
A auditoria marca toda a Scaling sem aula além de 45. Horizontal Scaling é onde a promessa "adicionar instâncias escala" quebra silenciosamente quando o estado vive na memória do processo — a lição precisa tornar essa dependência observável.

## Fronteiras
- Recebe: contratos (abaixo), entrada canônica do(s) conceito(s), exemplares.
- Entrega: arquivos em out/; o agente principal integra em
  `src/lib/lessons/scaling.ts` e `src/lib/exercises-data/scaling.ts`.

## Dono exclusivo de
`.opencode/work/sub/s29-scaling-46/**` (nada mais).
