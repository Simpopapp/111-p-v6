# project3-s31-networking-98 — Segunda lição Networking: 98 (TCP vs UDP)

## Missão
Dar à categoria Networking a segunda lição editorial: conceito 98 (TCP vs UDP), ancorada na lição 97 (DNS, que roda sobre UDP) aberta na rodada anterior. A decisão TCP/UDP é a base de toda escolha de transporte do produto.

## Escopo
- Seu: lição 98 + 2 tarefas + motivos de pré-req + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), conceitos vizinhos da
  categoria, outras categorias (irmãos desta rodada), pilares centrais.

## Por quê
A auditoria marca toda a Networking sem aula além de 97. O risco canônico do 98 (TCP atrasando mídia ao retransmitir pacote perdido) precisa virar decisão observável, não slogan; e "UDP é mais rápido" é generalização que a lição deve derrubar com counterexample.

## Fronteiras
- Recebe: contratos (abaixo), entrada canônica do(s) conceito(s), exemplares.
- Entrega: arquivos em out/; o agente principal integra em
  `src/lib/lessons/networking.ts` e `src/lib/exercises-data/networking.ts`.

## Dono exclusivo de
`.opencode/work/sub/s31-networking-98/**` (nada mais).
