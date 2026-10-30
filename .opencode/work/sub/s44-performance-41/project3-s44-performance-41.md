# project3-s44-performance-41 — o QUÊ e o POR QUÊ do pacote

## Missão
Criar a QUARTA lição editorial estruturada de Performance: conceito 41
(Memory Leaks), com 2 tarefas próprias, motivo de pré-req quando houver,
proposals de relations e proveniência honesta. Serve ao F9 contínuo (PRD
§12.2/D17): Performance tem 6 conceitos sem aula (41, 42, 43, 50, 89, 90).

## Escopo
- Produzir, como conteúdo no relatório final (sandbox read-only), o objeto
  `Lesson` completo para o conceito 41 + 2 objetos `Task` (t-41-<tipo>) +
  motivos de pré-req em pt-BR (se houver prereqIds) + ≥2 proposals de
  relation (pt-BR) + evidência dos critérios de aceite.

## Fora do escopo
- Escrever em `src/lib/**` (integração é do agente principal). Revisar
  outras lições (s39/s40). Outras lições novas.

## Por quê
Memory leak é o problema reconhecível de Performance com sinais observáveis
(heap monotônico, GC frequency, OOM após janela) e misconceptions de alto
valor (leak ≠ alto uso momentâneo; GC "resolve"; restart é remédio, não
causa). A categoria já tem 92 (Throughput) e 94 (Tail Latency) publicadas;
41 abre o bloco de memória.

## Fronteiras
- Recebe: os 3 pilares centrais (leitura obrigatória), contratos
  `types.ts`/`exercises.ts`/shapes de instrumentos, o conceito canônico 41 e
  as relations existentes que o tocam.
- Entrega: conteúdo íntegro no relatório final no formato exigido.

## Dono exclusivo de
- `/tmp/s44/` (extrações). Nenhum arquivo do projeto é seu.
