# project3-s45-database-29 — o QUÊ e o POR QUÊ do pacote

## Missão
Criar a QUARTA lição editorial estruturada de Database: conceito 29 (Read
Replicas), com 2 tarefas próprias, motivo de pré-req quando houver, proposals
de relations e proveniência honesta. Serve ao F9 contínuo (PRD §12.2/D17):
Database tem 5 conceitos sem aula (29–33).

## Escopo
- Produzir, como conteúdo no relatório final (sandbox read-only), o objeto
  `Lesson` completo para o conceito 29 + 2 objetos `Task` (t-29-<tipo>) +
  motivos de pré-req em pt-BR (se houver prereqIds) + ≥2 proposals de
  relation (pt-BR) + evidência dos critérios de aceite.

## Fora do escopo
- Escrever em `src/lib/**` (integração é do agente principal). Revisar
  outras lições (s39/s40). Outras lições novas.

## Por quê
Read replicas é a resposta canônica de leitura-escala, e o mecanismo exige
honestidade: réplicas escalam LEITURAS, não escritas; lag de replicação
produz leitura defasada; cache e réplica resolvem problemas distintos.
Sem aula, o aluno decoraria "adicione réplicas" sem saber quando NÃO usar.

## Fronteiras
- Recebe: os 3 pilares centrais (leitura obrigatória), contratos
  `types.ts`/`exercises.ts`/shapes de instrumentos, o conceito canônico 29 e
  as relations existentes que o tocam.
- Entrega: conteúdo íntegro no relatório final no formato exigido.

## Dono exclusivo de
- `/tmp/s45/` (extrações). Nenhum arquivo do projeto é seu.
