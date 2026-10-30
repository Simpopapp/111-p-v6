# project3-s18-security — Lições Security 78 (SQL Injection) + 79 (XSS)

## Missão
Fechar o elo Security apontado pelo roadmap central e pela auditoria (remix3-
f9-auditoria-111.md): os conceitos 78 e 79 aparecem no sintoma "SQL injection"
(src/lib/symptoms.ts, conceptIds [78,79]) e no lab `sqli` (src/lib/labs.ts),
sem aula estruturada. Primeira lição da categoria Security (§12.2).

## Escopo
- Seu: lições 78 E 79 + tarefas + motivos + relations, íntegros em out/.
- Fora do seu escopo: integração (agente principal), outras categorias
  (s19–s24), revisão de lições 'a' (s25), pilares centrais.

## Por quê
Sem aula no ponto decisivo, o sintoma e o lab apontam para uma referência
superficial exatamente na lição de segurança — falha §12.2. Critérios da
auditoria para 78: distinção código/dado, parametrização e limites do modelo.

## Fronteiras
- Recebe: contratos (seção abaixo), entrada canônica de 78 e 79, sintoma
  `SQL injection` (symptoms.ts) e spec do lab `sqli` (labs.ts ~linha 174 e o
  simulador de `src/lib/simulators.ts` que o lab usa).
- Entrega: 4 arquivos em out/ (abaixo); o agente principal integra em
  `src/lib/lessons/security.ts` e `src/lib/exercises-data/security.ts`.

## Dono exclusivo de
`.opencode/work/sub/s18-security/**` (nada mais).
