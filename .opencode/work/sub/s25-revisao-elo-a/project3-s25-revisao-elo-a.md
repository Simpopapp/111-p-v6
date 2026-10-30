# project3-s25-revisao-elo-a — Revisão feedback/transfer das lições 'a' dos elos 12, 13, 15, 16, 20

## Missão
Fila final do roadmap central: revisar as lições 'a' dos elos frágeis 12
(Retries), 13 (Exponential Backoff) — src/lib/lessons/resilience.ts — e 15
(Message Queues), 16 (Pub/Sub), 20 (Dead Letter Queues) —
src/lib/lessons/async.ts. O critério: o critério decisivo da lição tem
feedback verificável (§12.1 item 5) e transferência independente (item 7),
com honestidade técnica (§12.3: timeout não confirma falha; entrega repetida
não equivale a nova operação de negócio).

## Escopo
- Seu: APENAS o relatório de revisão com propostas de edição (read-only).
- Fora do seu escopo: aplicar edições (agente principal), lições novas
  (s18–s24), pilares centrais.

## Por quê
A auditoria s17 marcou esses elos como 'a' mas sinalizou "revisar feedback,
variante e limites na aula": lição existente não é critério aprovado. Revisar
evita que percursos vendidos como profundos tenham feedback permissivo no
ponto decisivo.

## Fronteiras
- Recebe: os 3 arquivos-fonte das lições + seus tasks em
  `src/lib/exercises-data/resilience.ts` e `async.ts` + critérios §12.1/12.3.
- Entrega: relatório com veredito POR lição e diffs propostos exatos.

## Dono exclusivo de
`.opencode/work/sub/s25-revisao-elo-a/**` (nada mais).
