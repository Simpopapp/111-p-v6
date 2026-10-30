// Relações com significado entre conceitos (PRD project2 D4). "Relacionado"
// solto não existe: cada relação declara o tipo e, quando útil, a nota de
// alcance. Seed obrigatório do contrato; expandível pelas lições.

export type RelationKind = "prereq" | "contrast" | "composition" | "context" | "practice";

export interface Relation {
  from: number;
  kind: RelationKind;
  to: number;
  /** Nota curta de alcance/motivo exibida no bloco "para continuar". */
  note?: string;
}

export const RELATIONS: Relation[] = [
  { from: 78, kind: "contrast", to: 79, note: "SQL injection altera a interpretação no banco; XSS altera a interpretação no navegador. Parametrização SQL não substitui renderização contextual." },
  { from: 79, kind: "contrast", to: 78, note: "A fronteira código/dado reaparece em outro interpretador: encoding de HTML não parametriza SQL, e parâmetros SQL não tornam HTML seguro." },
  { from: 6, kind: "composition", to: 58, note: "Gates automatizados verificam invariantes declaradas; monitoramento acrescenta sinais de execução que fixtures não cobrem, sem provar correção universal." },
  { from: 6, kind: "context", to: 81, note: "Promover o mesmo artefato não torna uma migração reversível: a compatibilidade dos estados intermediários condiciona deploy e rollback." },
  { from: 22, kind: "prereq", to: 3, note: "O balanceador escolhe o destino da nova conexão; um socket aberto continua vinculado à réplica que o aceitou." },
  { from: 22, kind: "contrast", to: 24, note: "SSE atende fluxo servidor-cliente; WebSocket acrescenta canal bidirecional quando a frequência de comandos justifica seu ciclo de vida." },
  { from: 22, kind: "composition", to: 13, note: "Backoff com jitter distribui tentativas de reconexão; não recupera por si só assinatura, histórico ou mensagens." },
  { from: 34, kind: "contrast", to: 35, note: "CAP limita as garantias durante a partição; consistência eventual trata da convergência após a comunicação voltar, sem reparar retroativamente o histórico." },
  { from: 34, kind: "context", to: 33, note: "Eleição de líder ajuda a organizar autoridade, mas o rótulo de líder não basta: o protocolo precisa impedir confirmações concorrentes por autoridades isoladas." },
  { from: 45, kind: "prereq", to: 3, note: "O balanceamento distribui trabalho apenas entre réplicas elegíveis; criar uma réplica não a torna pronta para receber tráfego." },
  { from: 45, kind: "prereq", to: 44, note: "Controle de admissão protege a capacidade existente durante o atraso de escala; não cria capacidade adicional." },
  { from: 45, kind: "composition", to: 15, note: "Workers podem escalar a partir de backlog e idade da fila, respeitando a capacidade do consumidor e das dependências; fila não remove sobrecarga sustentada." },
  { from: 45, kind: "context", to: 61, note: "Janela e agregação das métricas alteram o atraso da decisão; CPU baixa não exclui espera em dependência." },
  { from: 56, kind: "contrast", to: 10, note: "Health check orienta elegibilidade por réplica; circuit breaker limita chamadas a uma dependência segundo seus resultados. Os escopos não se substituem." },
  { from: 56, kind: "context", to: 57, note: "Aprofundamento sobre liveness e readiness; o conceito 57 permanece referência, não pré-requisito estruturado desta lição." },
  { from: 2, kind: "prereq", to: 97, note: "A validade por TTL do cache sustenta o cálculo das respostas DNS ainda reutilizáveis." },
  { from: 97, kind: "contrast", to: 2, note: "DNS reaproveita respostas de nomes em camadas distribuídas; editar o autoritativo não equivale a invalidar um cache de aplicação sob controle do produto." },
  { from: 97, kind: "composition", to: 11, note: "Na recuperação regional, expiração DNS e timeout de conexão são relógios distintos; mudar um não encerra o outro." },
  { from: 1, kind: "contrast", to: 13, note: "Rate limiting segura o lado que recebe; backoff segura o lado que insiste." },
  { from: 10, kind: "composition", to: 12, note: "O breaker decide repetir ou não usando a política de retry." },
  { from: 11, kind: "composition", to: 13, note: "Backoff espaça as tentativas que o timeout permite fazer." },
  { from: 2, kind: "contrast", to: 27, note: "Cache evita a ida; lote agrupa as idas — problemas diferentes." },
  { from: 25, kind: "prereq", to: 27, note: "JOIN é a resposta canônica ao padrão N+1." },
  { from: 15, kind: "contrast", to: 16, note: "Fila distribui trabalho; pub/sub distribui eventos — não são o mesmo desenho." },
  { from: 16, kind: "composition", to: 17, note: "A DLQ recebe o que o consumidor esgotou; recomeça por ela." },
  { from: 93, kind: "composition", to: 92, note: "Percentis só significam com a distribuição de latência explícita." },
  { from: 7, kind: "composition", to: 6, note: "CI/CD pode construir, testar e promover o digest da imagem; promover o mesmo artefato evita reconstruções divergentes, mas não valida por si só a configuração de cada ambiente." },
  { from: 7, kind: "composition", to: 56, note: "A imagem fixa o pacote de execução; health checks acrescentam observações sobre a instância em funcionamento. Iniciar o processo não prova que o serviço consegue atender corretamente." },
  { from: 7, kind: "context", to: 58, note: "O ambiente empacotado não garante capacidade nem resultado correto: monitoramento deve observar falhas, duração e uso de recursos da execução, além da identidade do artefato." },
  { from: 23, kind: "prereq", to: 11, note: "O timeout encerra uma espera, mas não confirma ausência de evento nem cancela automaticamente todo trabalho; a recepção contínua exige outra requisição." },
  { from: 23, kind: "prereq", to: 22, note: "O canal persistente de WebSocket é a base do contraste: long polling renova requisições HTTP, enquanto WebSocket mantém um canal bidirecional entre mensagens." },
  { from: 23, kind: "contrast", to: 22, note: "Long polling pode atender atualizações esparsas quando o caminho aceita HTTP comum e recusa o handshake WebSocket; tráfego bidirecional frequente muda o custo da escolha. Nenhum dos dois fornece replay durável por si só." },
  { from: 23, kind: "contrast", to: 24, note: "SSE mantém um fluxo servidor-cliente entre eventos; long polling encerra a resposta e renova a requisição. Buffering e limites do intermediário devem ser testados separadamente do bloqueio de Upgrade." },
  { from: 23, kind: "composition", to: 13, note: "Backoff com jitter distribui reconexões após erros, ao custo de ampliar o intervalo sem requisição pendente; respostas normais pedem renovação pronta, não atraso de recuperação indiscriminado." },
  { from: 35, kind: "prereq", to: 34, note: "CAP fundamenta a decisão de servir dado antigo ou não confirmar uma leitura durante a partição; consistência eventual descreve a convergência condicionada à entrega e à resolução compatível de atualizações." },
  { from: 35, kind: "composition", to: 3, note: "O balanceador escolhe a réplica da leitura; afinidade de sessão só preserva leitura da própria escrita se o destino retiver a atualização e o failover respeitar a revisão exigida." },
  { from: 35, kind: "contrast", to: 2, note: "Cache e réplica podem devolver dados antigos, mas TTL de cache não estabelece prazo de convergência da replicação. Camadas adicionais de cache também precisam respeitar a garantia da leitura." },
  { from: 46, kind: "prereq", to: 3, note: "O encaminhamento para réplicas diferentes torna observável a dependência de estado local; balancear tráfego não copia sessões nem uploads." },
  { from: 46, kind: "composition", to: 45, note: "Autoscaling altera a quantidade de réplicas; esta lição explicita a condição de intercambiabilidade que permite contar novas réplicas como capacidade útil, ainda limitada por dependências compartilhadas." },
  { from: 46, kind: "composition", to: 15, note: "Uma frota de workers precisa separar entrega durável, progresso e resultado do processo que executa o job; fila persistente não protege trabalho já confirmado nem elimina repetição." },
  { from: 57, kind: "prereq", to: 56, note: "Health Checks fornece a base de observação limitada e atraso de retirada; esta lição separa a decisão de reinício da decisão de admissão." },
  { from: 57, kind: "composition", to: 3, note: "Readiness delimita quais réplicas podem receber novas requisições pelo balanceador; não cancela trabalho admitido nem elimina o tempo de propagação." },
  { from: 57, kind: "composition", to: 58, note: "Monitoramento permite confrontar mudanças de readiness, reinícios e latência da dependência; um probe isolado não explica a causa de uma indisponibilidade." },
  { from: 98, kind: "prereq", to: 97, note: "A resolução de nomes identifica o destino; retome essa etapa antes de analisar o contrato de entrega. DNS não é exclusivamente UDP: também utiliza TCP." },
  { from: 97, kind: "context", to: 98, note: "Depois de descobrir o endereço, compare as garantias do transporte. Resolução correta não implica entrega confiável dos dados da aplicação." },
  { from: 98, kind: "composition", to: 14, note: "Confiabilidade do transporte não resolve resultado de negócio desconhecido: identidade de operação e deduplicação são necessárias para retries de pagamentos ou comandos." },
  { from: 92, kind: "prereq", to: 91, note: "Latência descreve tempos por operação; throughput conta conclusões por janela. Fixar fronteiras e observar distribuições evita deduzir capacidade apenas da média." },
  { from: 92, kind: "prereq", to: 44, note: "Controle de admissão protege a capacidade do gargalo e limita acúmulo; não aumenta o número de operações que o recurso serializado consegue concluir." },
  { from: 94, kind: "prereq", to: 91, note: "A leitura nearest-rank separa percentil, máximo e média antes de calcular a exposição de uma página à cauda das dependências." },
  { from: 94, kind: "prereq", to: 11, note: "Deadlines limitam a espera por dependência, mas exigem resultado parcial ou falha explícita; timeout não transforma trabalho incompleto em sucesso." },
  { from: 94, kind: "contrast", to: 93, note: "P99 resume uma distribuição observada em fronteira definida; Tail Latency explica como esperar por várias dependências amplia a exposição a respostas lentas, sem deduzir a distribuição conjunta de um único percentil." },
  { from: 94, kind: "composition", to: 92, note: "Hedging acrescenta tentativas e consome capacidade; diante de gargalo compartilhado saturado, pode reduzir throughput útil e piorar a própria cauda que pretendia combater." },
{ from: 52, kind: "contrast", to: 54, note: "Blue-green troca o destino entre ambientes completos; rolling substitui instâncias por etapas e economiza capacidade temporária. Ambos exigem compatibilidade durante coexistência." },
  { from: 52, kind: "contrast", to: 53, note: "O flip completo concentra a primeira exposição; canário limita inicialmente o público. Nenhum dos dois desfaz escritas incompatíveis." },
  { from: 52, kind: "composition", to: 55, note: "Manter o ambiente anterior facilita rollback de tráfego, mas não restaura schema nem reverte escritas no banco compartilhado." },
  { from: 52, kind: "composition", to: 56, note: "Verificar elegibilidade antes do flip ajuda a evitar enviar carga ao ambiente não preparado; health check superficial não comprova capacidade nem compatibilidade de estado." },
  { from: 67, kind: "contrast", to: 72, note: "Criptografia em repouso protege outra fronteira: não impede o uso de uma credencial ainda aceita para ler dados pela aplicação." },
  { from: 67, kind: "composition", to: 6, note: "O pipeline entrega autoridade ao job; emissão por execução e expiração validada no destino limitam a duração sem depender de troca manual." },
  { from: 67, kind: "context", to: 68, note: "Políticas de identidade delimitam quem pode buscar ou emitir credenciais; armazenar num gerenciador não substitui essa autorização." },
  { from: 39, kind: "contrast", to: 14, note: "Idempotência trata repetições da mesma operação; o interleaving aqui envolve duas compras distintas. Deduplicar retries não impede duas decisões concorrentes sobre o último item." },
  { from: 39, kind: "contrast", to: 35, note: "Propagação assíncrona explica leituras divergentes entre réplicas; esta corrida acontece mesmo com um banco autoritativo e um servidor. Convergência posterior não desfaz duas alocações confirmadas." },
  { from: 39, kind: "context", to: 40, note: "Serializar decisões com locks pode introduzir espera circular quando várias linhas são bloqueadas em ordens diferentes. Deadlocks são limite da alternativa, não o mecanismo desta corrida." },
  { from: 28, kind: "prereq", to: 11, note: "O prazo de aquisição limita a espera por uma sessão, mas não comprova cancelamento de uma transação já iniciada." },
  { from: 28, kind: "composition", to: 44, note: "O pool limita sessões emprestadas; backpressure também precisa limitar trabalho pendente e definir rejeição quando a espera não cabe no orçamento." },
  { from: 28, kind: "contrast", to: 27, note: "Reutilizar conexões reduz criação de sessões; corrigir N+1 reduz consultas. Um pool não elimina as consultas extras nem garante menor tempo de execução." },
  { from: 28, kind: "context", to: 1, note: "No cliente HTTP de cobrança, limitar sockets não impõe a taxa de requisições da conta; controle de taxa exige orçamento próprio, inclusive entre workers." },
  { from: 65, kind: "prereq", to: 63, note: "O SLO define objetivo, população e janela; o orçamento transforma a fração tolerada de falhas em saldo para uma política de decisão." },
  { from: 65, kind: "composition", to: 61, note: "Contagens e taxas com denominadores comparáveis alimentam saldo e burn rate; agregação inadequada ou cobertura incompleta corrompem a decisão." },
  { from: 65, kind: "context", to: 109, note: "O saldo orienta risco de releases, mas a urgência de resposta depende de impacto atual; um orçamento positivo não dispensa mitigação de dano ativo." },
  { from: 6, kind: "composition", to: 53, note: "O pipeline de CI/CD pode orquestrar exposição gradual e gates por versão; automatizar build e deploy, por si só, não estabelece coortes nem critérios de promoção." },
  { from: 53, kind: "contrast", to: 54, note: "Canário controla exposição e decisão por evidência; rolling substitui instâncias por etapas. Readiness de um lote não comprova ausência de regressão de negócio; os mecanismos podem ser combinados." },
  { from: 71, kind: "contrast", to: 72, note: "TLS protege dados entre seus endpoints em trânsito; criptografia em repouso protege outra fronteira, como mídia armazenada. Nenhuma substitui a outra nem impede leitura pelo endpoint autorizado." },
  { from: 71, kind: "composition", to: 73, note: "TLS é um mecanismo de proteção em trânsito; o alcance depende de cada conexão e de onde termina. mTLS acrescenta autenticação do par cliente, mas não fornece autorização de negócio por si só; 73 permanece referência." },
  { from: 71, kind: "contrast", to: 79, note: "TLS impede leitura e alteração silenciosa no canal protegido; XSS ocorre na interpretação do conteúdo pelo navegador. Um script vulnerável pode chegar por HTTPS válido, portanto os controles não se substituem." },
  { from: 38, kind: "contrast", to: 39, note: "Race Conditions apresenta o interleaving que viola uma regra; Distributed Locks coordena processos, mas uma lease expirada não impede escrita tardia sem validação no recurso." },
  { from: 38, kind: "contrast", to: 36, note: "Optimistic Locking rejeita uma versão desatualizada na mutação; fencing rejeita uma época de posse antiga. Ambos exigem validação atômica no recurso, mas versão de dados e token de posse não são equivalentes." },
  { from: 38, kind: "context", to: 96, note: "Leases dependem de hipóteses de tempo e deriva de relógio; sincronizar relógios de parede não cancela pausas nem mensagens atrasadas. O eixo ilustrativo não pressupõe relógios de clientes sincronizados." },
  { from: 41, kind: "contrast", to: 42, note: "GC recupera objetos inalcançáveis; referências vivas a dados obsoletos impedem essa recuperação. Picos de alocação não equivalem a retenção indevida." },
  { from: 41, kind: "context", to: 92, note: "Compare memória retida por volume de trabalho concluído sob carga equivalente; crescimento pode pressionar capacidade, mas throughput não demonstra sozinho a causa da retenção." },
  { from: 41, kind: "context", to: 94, note: "Pressão de memória e pausas de coleta podem afetar a cauda, mas latência alta não prova leak; correlacione séries temporais e investigue caminhos de retenção." },
  { from: 29, kind: "contrast", to: 2, note: "Cache reaproveita resultados; réplica executa consultas sobre dados replicados. TTL e invalidação não comprovam que uma réplica aplicou a escrita, e as duas fontes de defasagem podem se acumular." },
  { from: 29, kind: "context", to: 46, note: "Read replicas aplicam escala horizontal ao trabalho de leitura elegível; não tornam o líder de escrita intercambiável nem multiplicam sua capacidade de confirmar escritas." }
];

const RELATION_KINDS: RelationKind[] = [
  "prereq",
  "contrast",
  "composition",
  "context",
  "practice",
  ];

export function isRelationKind(k: string): k is RelationKind {
  return (RELATION_KINDS as string[]).includes(k);
}

/** Relações saindo de um conceito, para o bloco "para continuar". */
export function relationsFrom(conceptId: number): Relation[] {
  return RELATIONS.filter((r) => r.from === conceptId);
}
