# Próximo remix — plano aprovado de correção do catálogo

**Aprovação:** 2026-10-30, 00:25 UTC.
**Estado:** aprovado e liberado para execução na próxima ativação de remix, sem nova solicitação de aprovação.
**Rodada atual:** somente registro; nenhuma implementação autorizada nesta rodada.

## Instrução do usuário

> plano aprovado, mas não faça agora, mas deixe pronto pra fazer no proximo remix (sem dizer pra esperar, a instrução de registro é pra agira, a instrução minha pra você agora é não fazer mas registrar como liberado pra execução)

## Marco autorizado

Corrigir os resumos canônicos desatualizados antes de expandir a cobertura de aulas, retomando a fase dedicada de regeneração prevista no fim de `.opencode/roadmap-proj3`.

- [ ] Recuperar e conferir as recomendações de revisão para os conceitos 46, 57, 78, 79, 92, 94, 97 e 98; confirmar os nomes contra a fonte.
- [ ] Aplicar somente correções factuais verificadas à fonte `.opencode/project1.md` e regenerar `src/lib/concepts.ts` deterministicamente, sem edição manual do arquivo gerado.
- [ ] Preservar os 111 IDs, nomes, categorias, links de aulas e registros de aprendizagem.
- [ ] Recuperar o gerador existente ou, se ausente, criar um extrator reproduzível com validação de IDs, categorias e campos obrigatórios.
- [ ] Adicionar testes de integridade fonte/catálogo e determinismo, preservando os registros não envolvidos.
- [ ] Executar os testes existentes e verificar os resumos pela biblioteca e pelas aulas; consultar os diagnósticos de tipos/build produzidos pelo ambiente, sem rodar builds ou typechecks manualmente.
- [ ] Registrar os resultados reais no roadmap e no status da etapa; solicitar avaliação independente ao project-monitor e registrar qualquer indisponibilidade sem alegar avaliação realizada.

## Limites

Preservar o visual e os fluxos atuais. Não adicionar contas, infraestrutura, pagamentos nem novas aulas neste marco. Expansão F9 e revisão independente das últimas aulas permanecem trabalho posterior do roadmap.

## Observações para a retomada

A investigação somente de leitura desta rodada não encontrou os relatórios `out/` das revisões s39/s40 nas respectivas pastas. Os relatórios centrais registram recomendações, mas as substituições exatas precisam ser recuperadas ou novamente verificadas antes da integração. A localização do gerador também não foi confirmada. Esses pontos integram a primeira tarefa do próximo remix; não justificam inventar correções ou editar manualmente o catálogo gerado.

Nenhuma alteração no aplicativo, correção de conteúdo, regeneração ou gate de implementação foi executado nesta rodada de registro.