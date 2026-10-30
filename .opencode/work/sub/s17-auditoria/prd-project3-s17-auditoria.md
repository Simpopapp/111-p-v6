# prd-project3-s17 — o COMO da auditoria

## Método
1. Leia `src/lib/concepts.ts` (111 conceitos: id, nome, categoria, eli/risk/fix)
   e `src/lib/lessons/index.ts` + arquivos de categoria para saber exatamente
   quais ids têm lição estruturada (26 hoje: 1,2,3,4,5,10,11,12,13,15,16,17,
   20,27,44,58,60,61,63,81,82,91,102,103,109,111).
2. Leia os percursos ROUTES (`src/lib/recommend.ts`), missões, labs, sintomas:
   conceptIds que aparecem ali são "pontos em uso" — referência superficial
   neles é elo frágil (prioridade máxima).
3. Para CADA conceito, classifique pelos 8 critérios §12.1 (reconhecer o
   problema / explicar + onde a analogia quebra / observar na representação /
   comparar alternativas / decidir com feedback / quando não usar / variante de
   transfer / consultar síntese e limites):
   - classe (a) lição completa: verifique se a lição realmente responde os 8
     critérios na EXPERIÊNCIA (não conte caixas) — leia o arquivo da categoria;
   - classe (b) referência: conceito com eli/risk/fix canônicos, sem aula;
   - classe (c) sem tratamento: avalie também se o `fix` canônico está
     desatualizado ou raso.
4. Priorize: (1) pontos em uso de percursos/missões/labs/sintomas sem aula;
   (2) categorias inteiras sem nenhuma lição estruturada (DevOps, Streaming,
   Distributed, Scaling, Reliability, Security, Networking); (3) lacunas de
   profundidade dentro das lições existentes.

## Formato de `out/auditoria-111.md`
- **Sumário**: contagens por classe e por categoria; os 10 piores elos frágeis.
- **Elos frágeis prioritários**: tabela id · nome · onde é usado (percurso/
  missão/lab/sintoma) · por que é decisivo · recomendação (nova lição / reforço
  da existente / renomear alcance como referência).
- **Tabela completa 111**: id · nome · categoria · classe (a/b/c) · nota curta
  (1 linha) · sugestão de próximo passo.
- **Proveniência**: conferir que toda lição tem `reviewed: false` e notes
  honestas; apontar qualquer lição que pareça já ter passado por revisão real
  (para o agente principal decidir registro formal).
- **Riscos**: analogias imprecisas ou `fix` desatualizados encontrados nas
  lições existentes (seção §12.1 do planejamento).

## Qualidade
- Não visite as 26 lições superficialmente: leia-as. A nota curta de cada uma
  deve citar algo REAL da lição (um insight, uma lacuna).
- Categorias sem lição: para cada uma, diga qual conceito único abriria a
  categoria com mais valor (o "primeiro conceito editoriais").

## Registro de decisões
(vazio — você preenche, numerado)

## Proibições
- Não escreva fora de `.opencode/work/sub/s17-auditoria/out/**`. Sem patches em
  `src/**`. A auditoria descreve; quem integra é o agente principal.
