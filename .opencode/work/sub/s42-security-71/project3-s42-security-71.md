# project3-s42-security-71 — o QUÊ e o POR QUÊ do pacote

## Missão
Criar a QUARTA lição editorial estruturada de Security: conceito 71 (TLS),
com 2 tarefas próprias, motivo de pré-req quando houver, proposals de
relations e proveniência honesta. Serve ao F9 contínuo (PRD §12.2/D17):
Security é a segunda categoria com mais conceitos sem aula (11).

## Escopo
- Produzir, como conteúdo no relatório final (sandbox read-only), o objeto
  `Lesson` completo para o conceito 71 + 2 objetos `Task` (t-71-<tipo>) +
  motivos de pré-req em pt-BR (se houver prereqIds) + ≥2 proposals de
  relation (pt-BR) + evidência dos critérios de aceite.

## Fora do escopo
- Escrever em `src/lib/**` ou qualquer arquivo do projeto (integração é do
  agente principal). Revisar outras lições (s39/s40). Outras lições novas.

## Por quê
TLS é o mecanismo de confidencialidade/integridade em trânsito mais citado
pelo acervo (72/73 Encryption são vizinhos sem aula); sem aula estruturada, a
Security vende profundidade que não existe. Erros comuns (TLS resolve
autenticação de aplicação, TLS impede XSS) são misconceptions de alto valor
diagnóstico.

## Fronteiras
- Recebe: os 3 pilares centrais (leitura obrigatória), contratos
  `types.ts`/`exercises.ts`/shapes de instrumentos, o conceito canônico 71 e
  as relations existentes que o tocam.
- Entrega: conteúdo íntegro no relatório final no formato exigido pelo PRD
  do pacote.

## Dono exclusivo de
- `/tmp/s42/` (extrações). Nenhum arquivo do projeto é seu.
