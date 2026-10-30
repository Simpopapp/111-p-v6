# project3-s39-revisao-94-97-98 — o QUÊ e o POR QUÊ do pacote

## Missão
Revisão técnica independente (método s38b validado) das três lições de
expansão que ficaram sem veredito na rodada anterior: Performance 94 (Tail
Latency), Networking 97 (DNS) e 98 (TCP vs UDP). Você fecha a fila de revisão
aberta pelo s38b (F9 contínuo, PRD D17), produzindo veredito, achados com
evidência, correções propostas como texto exato e provenance.notes proposta
por lição. Isso serve ao objetivo central: percursos vendidos como profundos
não podem conter erro técnico no ponto decisivo, e `reviewed: true` só existe
com revisão efetiva registrada.

## Escopo
- Revisar as lições 94, 97 e 98 (objeto Lesson por inteiro) + as 2 tarefas de
  cada (rubricas: cause plausível, expected correto, helpLevels que não
  entregam a resposta no nível 1) pelos critérios de aceite do seu PRD.
- Propor correções como texto exato de substituição (atual → proposto).
- Propor provenance.notes em pt-BR com/sem a frase "revisão efetiva registrada"
  conforme os critérios 1–3 confirmarem.

## Fora do escopo
- Integrar qualquer coisa em `src/lib/**` — isso é do agente principal.
- Revalidar 7, 35, 46, 57, 92 — pacote s40.
- Criar lições novas — pacotes s41–s45.

## Por quê
O s38b encerrou por limite de duração com estes 3 alvos pendentes. Sem
veredito, as lições permanecem `reviewed: false` e a honestidade de
proveniência do F9 fica incompleta. O método s38b (extração JSON bonito por
lição, nunca ler arquivos minificados inteiros) já falhou uma vez por
truncamento — segui-lo é obrigatório.

## Fronteiras
- Recebe: os 3 pilares centrais (por leitura obrigatória), os contratos
  `types.ts`/`exercises.ts`/`f9-audit.test.ts`, e os arquivos de lições/tarefas
  via extração bun.
- Entrega: `out/revisao-s39.md` (ou o conteúdo íntegro no relatório final, se
  a sandbox recusar escrita) com um bloco por lição no formato exigido.

## Dono exclusivo de
- `/tmp/s39/` (extrações) e `out/revisao-s39.md` dentro da sua pasta
  `.opencode/work/sub/s39-revisao-94-97-98/` (se escrita for permitida).
Nenhum outro arquivo.
