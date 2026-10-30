# Status — Stage 15 (remix 4: expansão contínua do F9)

**Data:** 2026-10-29
**Responsável:** agente principal (integração) + enxame s18–s25 (conteúdo/revisão)

## O que foi entregue

- Lições estruturadas novas (8): 78 SQL Injection, 79 XSS, 6 CI/CD, 22
  WebSockets, 34 CAP Theorem, 45 Autoscaling, 56 Health Checks, 97 DNS —
  `src/lib/lessons/{security,devops,streaming,distributed,scaling,reliability,networking}.ts`,
  registradas em `lessons/index.ts`; cobertura da biblioteca passa de 30/111
  para 38/111.
- Tarefas de prática novas (16 + 5 de revisão), registradas em
  `exercises-data/index.ts`; ids renomeados para o contrato
  `t-<id>-<tipo>` (t-78-compare, t-79-find-flaw, t-22-predict, t-22-variant,
  t-34-predict, t-34-variant, t-45-predict, t-45-variant).
- Revisão s25 aplicada (D1–D5): variantes t-12-variant e t-13-variant em
  `exercises-data/resilience.ts`; t-15/16/20-variant em `exercises-data/async.ts`;
  causa do critério "attempt-sequence" completada (ACK local ≠ conclusão global);
  `transfer.variant` das 5 lições realinhados às decisões avaliáveis.
- Motivos de pré-requisito novos: "22:3", "45:3", "45:44", "97:2".
- Relações novas (17) em `src/lib/relations.ts`, todas tipadas e sem órfãos.
- Teste de contrato novo: `src/test/f9-expansion.test.ts` (4 contratos).

## Gates executados (números reais)

- `bunx tsgo --noEmit` — limpo (exit 0).
- `bunx vitest run` — 22 arquivos, 202/202 aprovados (era 198; +4 do
  f9-expansion; nenhum teste contratado enfraquecido).
- Build — "build OK" no build-errors.log (20:43:46Z e 20:44:27Z).
- E2E Playwright (`/tmp/browser/vibecoder/e2e_f9x_expansion.py`): as 8 lições
  novas renderizam no modo guiado com situação/previsão/síntese;
  biblioteca em `?cat=Security` lista SQL Injection; 0 pageerrors em 1280×1800.

## Estado do roadmap central

`roadmap-proj3` §Encerramento atualizado com remix 4 concluído, gates reais e
linha "Próximo remix".

## Pendências / riscos

- `provenance.reviewed` permanece `false` nas 8 lições (sem revisão efetiva
  registrada) — guarda f9-audit intacta.
- Fila contínua do F9: segunda lição por categoria e demais conceitos da
  auditoria (remix3-f9-auditoria-111.md).
- Idioma: conteúdo novo em inglês (padrão dos exemplares); motivo de pré-req e
  notas de relation em pt-BR — consistente com as rodadas anteriores.
