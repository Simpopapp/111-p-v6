# project3-s27-streaming-23 — Segunda lição Streaming: 23 (Long Polling)

## Missão
Dar à categoria Streaming a segunda lição editorial: conceito 23 (Long Polling), contrastando com a lição 22 (WebSockets) já existente. Streaming tem só 3 conceitos; 23 fecha o meio do espectro push/pull.

## Escopo
- Seu: lição 23 + 2 tarefas + motivos de pré-req + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), conceitos vizinhos da
  categoria, outras categorias (irmãos desta rodada), pilares centrais.

## Por quê
A auditoria marca toda a Streaming como "fix canônico precisa de revisão técnica". Long Polling é o caso onde o mecanismo (requisição segurada aberta até dados ou timeout) é confundido com "tempo real garantido" — a lição precisa expor o ciclo de reconexão e os limites de intermediários.

## Fronteiras
- Recebe: contratos (abaixo), entrada canônica do(s) conceito(s), exemplares.
- Entrega: arquivos em out/; o agente principal integra em
  `src/lib/lessons/streaming.ts` e `src/lib/exercises-data/streaming.ts`.

## Dono exclusivo de
`.opencode/work/sub/s27-streaming-23/**` (nada mais).
