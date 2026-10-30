# project3-s43-distributed-38 — o QUÊ e o POR QUÊ do pacote

## Missão
Criar a QUARTA lição editorial estruturada de Distributed: conceito 38
(Distributed Locks), com 2 tarefas próprias, motivo de pré-req quando houver,
proposals de relations e proveniência honesta. Serve ao F9 contínuo (PRD
§12.2/D17): Distributed já tem 3 lições (34 CAP, 35 Eventual Consistency,
39 Race Conditions) e segue com 6 conceitos sem aula.

## Escopo
- Produzir, como conteúdo no relatório final (sandbox read-only), o objeto
  `Lesson` completo para o conceito 38 + 2 objetos `Task` (t-38-<tipo>) +
  motivos de pré-req em pt-BR (se houver prereqIds) + ≥2 proposals de
  relation (pt-BR) + evidência dos critérios de aceite.

## Fora do escopo
- Escrever em `src/lib/**` (integração é do agente principal). Revisar
  outras lições (s39/s40). Outras lições novas.

## Por quê
Distributed Locks é o contraste direto da lição 39 (Race Conditions): sem a
aula, o aluno vê o problema (corrida) sem a ferramenta e seus limites reais
(lease vs lock, expiração, fencing token, relógios não sincronizados).
A honestidade do mecanismo é crítica: locks distribuídos NÃO garantem
exclusão mútua perfeita sem fencing/consenso — prometer isso é erro factual.

## Fronteiras
- Recebe: os 3 pilares centrais (leitura obrigatória), contratos
  `types.ts`/`exercises.ts`/shapes de instrumentos, o conceito canônico 38 e
  as relations existentes que o tocam.
- Entrega: conteúdo íntegro no relatório final no formato exigido.

## Dono exclusivo de
- `/tmp/s43/` (extrações). Nenhum arquivo do projeto é seu.
