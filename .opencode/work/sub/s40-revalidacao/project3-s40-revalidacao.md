# project3-s40-revalidacao — o QUÊ e o POR QUÊ do pacote

## Missão
Revalidação independente das correções aplicadas na rodada anterior
(t-7-variant image-pkg→package, t-35-variant award→final-result,
t-46-variant external-progress→checkpoint, t-57-variant revoke→lease-control,
lição 92 misconception) e análise dos ajustes canônicos recomendados para
`concepts.ts` (46, 57, 78, 79, 92). Você decide se cada lição corrigida já
satisfaz os critérios de revisão efetiva (veredito por lição) e se o texto
canônico (eli/risk/fix) contém erro factual que exija regeneração, ou se a
lição que o supersede na UI basta. Serve ao F9 contínuo (D17/D18).

## Escopo
- Revisar, uma a uma, as lições 7, 35, 46, 57, 92 + suas tarefas, focando as
  correções aplicadas (citar o campo corrigido e confirmar que a correção é
  tecnicamente correta e internamente consistente).
- Para 46, 57, 78, 79, 92: confrontar o texto canônico de `concepts.ts`
  (eli/risk/fix, extraído por id) com o conteúdo da lição; veredito por
  conceito: (a) canônico correto; (b) canônico com erro factual — propor
  texto canônico exato de substituição; (c) canônico impreciso mas
  superseded pela lição coberta — registrar.
- Propor provenance.notes em pt-BR para as lições revalidadas, com a frase
  "revisão efetiva registrada" APENAS onde os critérios 1–3 confirmarem.

## Fora do escopo
- Escrever em `src/lib/**` (integração é do agente principal).
- Revisar 94, 97, 98 — pacote s39. Criar lições — s41–s45.

## Por quê
`reviewed: true` sem revalidação seria alegar revisão sobre correção nunca
independente verificada. E o roadmap central tem uma decisão pendente sobre
regeneração de `concepts.ts` (arquivo gerado, nunca editado à mão) que precisa
de fundamento factual por conceito para ser decidida (D18).

## Fronteiras
- Recebe: os 3 pilares centrais (leitura obrigatória), contratos
  `types.ts`/`exercises.ts`/`f9-audit.test.ts`, arquivos via extração bun.
- Entrega: `out/revisao-s40.md` (ou conteúdo íntegro no relatório final) com
  um bloco por lição + seção "Canônico" por conceito.

## Dono exclusivo de
- `/tmp/s40/` e `out/revisao-s40.md` na sua pasta
  `.opencode/work/sub/s40-revalidacao/` (se escrita for permitida).
