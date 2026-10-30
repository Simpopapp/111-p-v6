# project3-s41-devops-53 — o QUÊ e o POR QUÊ do pacote

## Missão
Criar a QUARTA lição editorial estruturada de DevOps: conceito 53 (Canary
Releases), com 2 tarefas próprias no motor de prática, motivo de pré-req
quando houver pré-req, proposals de relations e proveniência honesta. Serve
ao F9 contínuo (PRD §12.2/D17): cobertura substantiva por categoria, não
nominal — DevOps é a categoria com mais conceitos sem aula (12).

## Escopo
- Produzir, como conteúdo no relatório final (sandbox read-only), o objeto
  `Lesson` completo para o conceito 53 + 2 objetos `Task` (t-53-<tipo>) +
  motivos de pré-req em pt-BR (se houver prereqIds) + ≥2 proposals de
  relation (pt-BR) + evidência dos critérios de aceite.

## Fora do escopo
- Escrever em `src/lib/**` ou qualquer arquivo do projeto (integração é do
  agente principal). Revisar outras lições (s39/s40). Outras lições novas.

## Por quê
Canary Releases é o contraste direto da lição 52 (Blue-Green) já publicada e
aparece em percurso de DevOps; sem aula, o percurso apontaria referência
superficial no ponto decisivo. A rodada s33 já fixou o padrão de qualidade
(mentalModel + analogyLimits, scenario específico, instrumento no shape
válido, rubricas diagnósticas, transfer com domínio E restrição novos).

## Fronteiras
- Recebe: os 3 pilares centrais (leitura obrigatória), contratos
  `types.ts`/`exercises.ts`/shapes de instrumentos, o conceito canônico 53 e
  as relations existentes que o tocam.
- Entrega: conteúdo íntegro no relatório final no formato exigido pelo PRD
  do pacote.

## Dono exclusivo de
- `/tmp/s41/` (extrações). Nenhum arquivo do projeto é seu.
