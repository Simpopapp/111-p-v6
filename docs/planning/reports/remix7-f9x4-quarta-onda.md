# Remix 7 — Quarta onda da expansão F9 + revisão 94/97/98 + revalidação

**Data:** 2026-10-30
**Veredito:** concluída
**Confiança:** alta (gates reproduzidos pelo agente principal)

## Resumo executivo

A rodada cumpriu a linha "Próximo remix" do roadmap: revisão independente de
94, 97 e 98 pelo método s38b validado; revalidação das correções s38a (7, 35,
46, 57, 92) antes de `reviewed`; e quinta lição estruturada nas categorias com
mais conceitos sem aula — DevOps 53 (Canary Releases), Security 71 (TLS),
Distributed 38 (Distributed Locks, pré-req 39), Performance 41 (Memory Leaks),
Database 29 (Read Replicas). Sete subagentes (s39–s45) produziram conteúdo e
revisão; o agente principal persistiu, integrou e rodou os gates.

## Cobertura de requisitos

- Atendido: 5 lições novas com mentalModel + analogyLimits, scenario
  específico, representação no shape válido, contrastes, misconceptions com
  counterexample, 2 tarefas cada com rubrica diagnóstica e 3 níveis de ajuda,
  transfer com domínio e restrição novos, proveniência honesta
  (`reviewed: false`). Checks em prosa dos pacotes convertidos em funções
  exatas (pick único / conjuntos exatos) contra as opções reais.
- Pré-req 38→39 declarado com motivo pt-BR; prereqIds vazio onde honesto
  (53, 71, 41, 29).
- 11 relations novas (2+3+3+3 de s41–s44, mais s45) sem duplicatas.
- Revisão s39: 94/97/98 aprovadas com revisão efetiva registrada;
  `bench.ts` corrigido (competência de tail-latency: nearest-rank P99 = 100
  ms, máximo = 10.000 ms, média = 249 ms).
- Revalidação s40: 7/35/46/57/92 aprovadas. Fontes bloqueadas (403)
  re-verificadas pelo agente principal: RabbitMQ oficial
  (https://www.rabbitmq.com/docs/confirms) e OWASP (Developer Guide; DOM-based
  XSS Prevention Cheat Sheet).
- Cobertura nominal: 56/111 conceitos com aula estruturada (era 51).

## Qualidade e correções de integração

- Contrato novo por recomendação s38a: `src/test/rubric-integrity.test.ts` —
  satisfatibilidade de rubricas contra as opções reais (subconjuntos até 3
  picks e permutações em tarefas de ordenação). Pegou na hora um requisito
  real de t-35-variant (3 escolhas exatas) e levou à correção da sonda.
- Conversão dos checks em prosa dos pacotes para funções executáveis; chaves
  de causa e `exact`/`exactSet` materializadas na integração.
- Ajuste canônico recomendado por s39/s40: `concepts.ts` é gerado
  determinísticamente de `.opencode/project1.md` e não pode ser editado à mão.
  Decisão registrada em D18: regeneração fica para uma fase dedicada, com as
  propostas exatas preservadas nos relatórios (46, 57, 78, 79, 92 e
  canônicos de 94/97/98).

## Discrepanâncias

- Subagentes não gravam no projeto (sandbox read-only): conteúdo entregue no
  relatório e persistido pelo agente principal em `.opencode/work/sub/{K}/out/`.
- A sonda inicial de satisfatibilidade só cobria subconjuntos até tamanho 2;
  t-35-variant exige 3 escolhas — sonda corrigida para tamanho 3 antes do gate.

## Riscos para as próximas etapas

- `concepts.ts` desatualizado em relação às lições revisadas até a fase de
  regeneração (metadados canônicos ainda exibem texto antigo em rotas sem
  lição).
- Lições novas 29/38/41/53/71 sem revisão técnica independente — fila do
  próximo remix.
