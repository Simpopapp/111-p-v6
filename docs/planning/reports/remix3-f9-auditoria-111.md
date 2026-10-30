# Auditoria dos 111 conceitos — F9

## Sumário

- Inventário conferido: 111 conceitos (IDs 1–111), 15 categorias; classificação: **a=26, b=85, c=0**.
- Interpretação conservadora: classe a = presença de lição estruturada (não certificação de completude); classe b = conceito com referência canônica `eli/risk/fix`, sem aula (b); classe c = sem tratamento editorial identificado. A leitura do catálogo fonte mostra eli/risk/fix nos 111; por isso c=0. Os fechamentos 14, 25, 26 e 93 ficam em b, conforme instrução; não reauditados.
- Nota de confiança: classe b/c expressa inventário editorial e ligações explícitas em código, não validação em execução de cada percurso. “Pontos em uso” também advêm de pré-requisitos de missões e sintomas; não inferi cobertura de conteúdo pela mera menção.

### Por categoria

| Categoria | Total | a | b | c |
|---|---:|---:|---:|---:|
| Traffic | 4 | 4 | 0 | 0 |
| Performance | 12 | 3 | 9 | 0 |
| DevOps | 15 | 0 | 15 | 0 |
| Resilience | 5 | 4 | 1 | 0 |
| Async | 8 | 4 | 4 | 0 |
| Streaming | 3 | 0 | 3 | 0 |
| Database | 11 | 3 | 8 | 0 |
| Distributed | 9 | 0 | 9 | 0 |
| Scaling | 5 | 0 | 5 | 0 |
| Reliability | 7 | 0 | 7 | 0 |
| Observability | 9 | 4 | 5 | 0 |
| Security | 14 | 0 | 14 | 0 |
| Networking | 4 | 0 | 4 | 0 |
| Protocols | 2 | 2 | 0 | 0 |
| SRE | 3 | 2 | 1 | 0 |

### Dez elos frágeis prioritários

| # | Conceito | Uso decisivo | Por que é frágil | Próximo passo |
|---:|---|---|---|---|
| 14 | Idempotency | percurso request-lost; missão charged-but-lost (pré-requisito) | Em fechamento nesta rodada, ainda não auditar qualidade. | Integrar resultado da rodada s14/s15/s16 e confirmar fechamento. |
| 25 | Database Indexing | percurso page-slow; missão page-slow; sintoma página lenta | Em fechamento nesta rodada, ainda não auditar qualidade. | Integrar resultado da rodada s14/s15/s16 e confirmar fechamento. |
| 26 | Query Optimization | percurso page-slow; missão page-slow; sintoma página lenta | Em fechamento nesta rodada, ainda não auditar qualidade. | Integrar resultado da rodada s14/s15/s16 e confirmar fechamento. |
| 93 | P99 Latency | percurso page-slow; sintoma lenta/tail; lab tail | Em fechamento nesta rodada, ainda não auditar qualidade. | Integrar resultado da rodada s14/s15/s16 e confirmar fechamento. |
| 12 | Retries | percurso request-lost; missão charged-but-lost; sintoma timeout/circuit | Lição existe; confirmar que o critério decisivo tem feedback verificável e transferência independente. | Revisar feedback, variante e limites na aula. |
| 13 | Exponential Backoff | percurso request-lost; sintoma limite de requisições | Lição existe; confirmar que o critério decisivo tem feedback verificável e transferência independente. | Revisar feedback, variante e limites na aula. |
| 91 | Latency | Performance | a | Calcula nearest-rank P50/P99 numa amostra definida; separa evidência de cauda da média. |
| 15 | Message Queues | percurso work-accumulating; missão fila; sintoma work-accumulating; lab pubsub | Lição existe; confirmar que o critério decisivo tem feedback verificável e transferência independente. | Revisar feedback, variante e limites na aula. |
| 16 | Pub/Sub | percurso work-accumulating; missão fila; sintoma fila; lab pubsub | Lição existe; confirmar que o critério decisivo tem feedback verificável e transferência independente. | Revisar feedback, variante e limites na aula. |
| 20 | Dead Letter Queues | percurso work-accumulating; missão fila; sintoma fila; lab pubsub | Lição existe; confirmar que o critério decisivo tem feedback verificável e transferência independente. | Revisar feedback, variante e limites na aula. |

Prioridade adicional: conceitos 78/79 (Security) aparecem no sintoma SQL injection e lab sqli, sem lição estruturada identificada; cobrir distinção código/dado, parametrização e limites do modelo.

## Tabela completa 111

| ID | Conceito | Categoria | Classe | Nota curta baseada na fonte | Próximo passo |
|---:|---|---|:---:|---|---|
| 1 | Rate Limiting | Traffic | a | Bucket numérico e escopo entre réplicas; exemplo explicita 429 e limite de modelo. | revisar elo e feedback |
| 2 | Caching | Performance | a | Escolhe chave e frescor em workload de leitura; prevê hit, miss e resposta obsoleta. | revisar elo e feedback |
| 3 | Load Balancing | Traffic | a | Least-active contra round-robin; nota reconhece estado compartilhado e custo variável. | revisar elo e feedback |
| 4 | Reverse Proxies | Traffic | a | Rastreia fronteiras de confiança e controles de rede/cabeçalhos para evitar bypass. | revisar elo e feedback |
| 5 | API Gateways | Traffic | a | Separa políticas de edge de autorização por recurso e localiza onde negar a requisição. | revisar elo e feedback |
| 6 | CI/CD | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 7 | Docker | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 8 | Kubernetes | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 9 | Service Discovery | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 10 | Circuit Breakers | Resilience | a | State machine mostra closed/open/half-open e probe; um exercício previsto como único practiceId. | revisar elo e feedback |
| 11 | Timeouts | Resilience | a | Timeline contrasta cliente que parou de esperar e servidor que segue; feedback condicionado a resultado desconhecido. | revisar elo e feedback |
| 12 | Retries | Resilience | a | Máquina distingue chave de operação e reconciliação após orçamento; síntese deve realçar escopo da idempotência. | revisar elo e feedback |
| 13 | Exponential Backoff | Resilience | a | Timeline de timeout/retry evidencia resultado incerto; evitar sugerir timeout como cancelamento. | revisar elo e feedback |
| 14 | Idempotency | Resilience | b | Fechamento por s14/s15/s16 nesta rodada; auditoria individual não repetida. | criar lição antes de percurso decisivo |
| 15 | Message Queues | Async | a | Representação de fila e consumo aborda backlog; checar limite entre queue e pub/sub. | revisar elo e feedback |
| 16 | Pub/Sub | Async | a | Fan-out/consumidores distinguem entrega; retry e garantia não equivalem a exactly-once. | revisar elo e feedback |
| 17 | Event-Driven Architecture | Async | a | Compara fato de negócio comprometido com reações posteriores e consistência exigida. | revisar elo e feedback |
| 18 | Distributed Transactions | Async | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 19 | Saga Pattern | Async | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 20 | Dead Letter Queues | Async | a | Distingue tentativas esgotadas de prova de poison message; discute recuperação/perda. | revisar elo e feedback |
| 21 | Cron Jobs | Async | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 22 | WebSockets | Streaming | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 23 | Long Polling | Streaming | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 24 | Server-Sent Events | Streaming | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 25 | Database Indexing | Database | b | Fechamento por s14/s15/s16 nesta rodada; auditoria individual não repetida. | criar lição antes de percurso decisivo |
| 26 | Query Optimization | Database | b | Fechamento por s14/s15/s16 nesta rodada; auditoria individual não repetida. | criar lição antes de percurso decisivo |
| 27 | N+1 Queries | Database | a | Plano de consulta relaciona N+1 a consultas repetidas; custo depende do acesso real e índices. | revisar elo e feedback |
| 28 | Connection Pooling | Database | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 29 | Read Replicas | Database | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 30 | Sharding | Database | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 31 | Partitioning | Database | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 32 | Replication | Database | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 33 | Leader Election | Database | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 34 | CAP Theorem | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 35 | Eventual Consistency | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 36 | Optimistic Locking | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 37 | Pessimistic Locking | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 38 | Distributed Locks | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 39 | Race Conditions | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 40 | Deadlocks | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 41 | Memory Leaks | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 42 | Garbage Collection | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 43 | Thread Safety | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 44 | Backpressure | Async | a | Usa crescimento do backlog e saturação downstream para decidir controle de admissão, sem presumir que mais workers aumentem throughput útil. | reforçar vínculo: missão fila o lista como pré-requisito, mas sua lição não integra a missão. |
| 45 | Autoscaling | Scaling | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 46 | Horizontal Scaling | Scaling | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 47 | Vertical Scaling | Scaling | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 48 | CDN (Content Delivery Network) | Scaling | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 49 | Edge Caching | Scaling | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 50 | Cache Invalidation | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 51 | Feature Flags | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 52 | Blue-Green Deployments | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 53 | Canary Releases | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 54 | Rolling Deployments | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 55 | Rollbacks | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 56 | Health Checks | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 57 | Liveness & Readiness Probes | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 58 | Monitoring | Observability | a | Event track relaciona sinais de edge e sintético; sinais divergentes não identificam causa sozinhos. | revisar elo e feedback |
| 59 | Logging | Observability | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 60 | Distributed Tracing | Observability | a | Trace com spans relaciona chamadas; amostragem e contexto ausente limitam inferência. | revisar elo e feedback |
| 61 | Metrics | Observability | a | Contador e taxa derivados; taxa não representa latência nem sucesso por si só. | revisar elo e feedback |
| 62 | Alerting | Observability | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 63 | SLOs (Service Level Objectives) | Observability | a | Define SLI/SLO contextual e calcula error budget de requisições numa janela declarada. |
| 64 | SLIs (Service Level Indicators) | Observability | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 65 | Error Budgets | Observability | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 66 | Observability | Observability | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 67 | Secrets Management | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 68 | IAM (Identity & Access Management) | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 69 | OAuth | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 70 | JWT Rotation | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 71 | TLS | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 72 | Encryption at Rest | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 73 | Encryption in Transit | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 74 | WAF (Web Application Firewall) | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 75 | DDoS Protection | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 76 | CORS (Cross-Origin Resource Sharing) | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 77 | CSRF (Cross-Site Request Forgery) | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 78 | SQL Injection | Security | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar lição antes de percurso decisivo |
| 79 | XSS (Cross-Site Scripting) | Security | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar lição antes de percurso decisivo |
| 80 | SSRF (Server-Side Request Forgery) | Security | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 81 | Database Migrations | Database | a | Query explainer evidencia plano/custo; estimativa não é latência medida. | revisar elo e feedback |
| 82 | Schema Versioning | Database | a | Tabela de índices; trade-off de escrita/armazenamento precisa contexto. | revisar elo e feedback |
| 83 | Disaster Recovery | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 84 | Backups | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 85 | Failover | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 86 | Multi-Region Deployments | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 87 | Chaos Engineering | Reliability | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 88 | Cost Optimization | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 89 | Cold Starts | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 90 | Serverless Limits | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 91 | Latency | Performance | a | Calcula nearest-rank P50/P99 numa amostra definida; separa evidência de cauda da média. |
| 92 | Throughput | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar lição antes de percurso decisivo |
| 93 | P99 Latency | Performance | b | Fechamento por s14/s15/s16 nesta rodada; auditoria individual não repetida. | criar lição antes de percurso decisivo |
| 94 | Tail Latency | Performance | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar lição antes de percurso decisivo |
| 95 | Network Partitions | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 96 | Clock Skew | Distributed | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 97 | DNS | Networking | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 98 | TCP vs UDP | Networking | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 99 | HTTP/2 & HTTP/3 | Networking | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 100 | gRPC | Networking | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 101 | Webhooks | Async | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 102 | API Versioning | Protocols | a | Compara versões de contrato e sobrevivência dos pares cliente/servidor. |
| 103 | Semantic Versioning | Protocols | a | Contrasta promessa de versão semântica com compatibilidade real do contrato. |
| 104 | Infrastructure as Code | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 105 | Terraform | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 106 | Helm Charts | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 107 | Build Caching | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 108 | Dependency Hell | DevOps | b | Sem lição estruturada; fix canônico precisa de revisão técnica antes de servir como orientação. | criar primeira lição editorial da categoria |
| 109 | Production Incidents | SRE | a | Event track de incidente distribui ações e sinais; não substitui coordenação/contexto real. | revisar elo e feedback |
| 110 | On-call | SRE | b | Referência canônica eli/risk/fix; não oferece experiência completa de decisão e feedback. | criar primeira lição editorial da categoria |
| 111 | Postmortems | SRE | a | Tabela de postmortem destaca ações; causalidade e ausência de culpa não são prova automática. | revisar elo e feedback |

## Categorias sem lição estruturada: primeiro conceito editorial

| Categoria | Primeiro conceito recomendado | Justificativa |
|---|---|---|
| DevOps | CI/CD (#6) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |
| Streaming | WebSockets (#22) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |
| Distributed | CAP Theorem (#34) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |
| Scaling | Autoscaling (#45) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |
| Reliability | Health Checks (#56) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |
| Security | Secrets Management (#67) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |
| Networking | DNS (#97) | Abre a categoria pelo primeiro conceito canônico disponível; validar dependências antes de escrever. |

## Proveniência

- Foram encontrados 26 IDs estruturados, exatamente: 1, 2, 3, 4, 5, 10, 11, 12, 13, 15, 16, 17, 20, 27, 44, 58, 60, 61, 63, 81, 82, 91, 102, 103, 109, 111.
- Os 26 objetos agregados têm `provenance.reviewed: false` e nota de proveniência pendente de revisão técnica; nenhum caso foi identificado como formalmente revisado. Não elevar `reviewed` com base nesta auditoria.
- A leitura integral dos oito arquivos revelou conteúdo aplicado, representações específicas, práticas e variantes, mas não prova por si só que a experiência renderizada satisfaz todos os oito critérios. Portanto, “a” indica material de aula a auditar, não aprovação final independente.

## Riscos e achados técnicos

- `concepts.ts` conserva fixes legados muito prescritivos (p.ex. “Redis or Cloudflare” no Rate Limiting); não tratá-los como recomendação universal sem restrições, consistência e modelo de falha.
- `recommend.ts` ROUTES usa IDs 14, 25, 26, 93 sem lição estruturada na agregação examinada; são elos prioritários, ainda que os demais conceitos do percurso tenham aula.
- Missões também requerem 14, 25, 26, 93 e conceitos de Security (#78/#79); prerequisito nominal não equivale a ensino substantivo. O catálogo de sintomas aponta esses caminhos a alunos.
- Conteúdos de percentil devem manter a convenção explicitada: nearest-rank com 99 respostas de 100 ms e uma de 10.000 ms resulta P99=100 ms, máximo=10.000 ms e média=199 ms; revisar lição #91 e material de tail antes de integrar.
- A fronteira entre “sem tratamento” e referência legada é inferencial: não existe inventário explícito de cobertura editorial além de lessons. Categoria e uso determinam prioridade, não qualidade de fix.

## Decisões tomadas

1. Mantive classe a para os 26 IDs que o agregador reconhece como lições, mas distingui “lição existente” de “critérios aprovados”; só a experiência comprova completude.
2. Classifiquei 14, 25, 26 e 93 como b e sinalizei “em fechamento nesta rodada”, por determinação do escopo; não os incluí como pendências de auditoria individual.
3. Tratei IDs usados em rota, missão, laboratório e sintoma como elos prioritários mesmo sem aula estruturada.
4. Atribuí primeiro conceito editorial por ordem canônica da categoria, sem inventar sequência pedagógica; o agente de conteúdo deve validar pré-requisitos.
5. Não alterei conteúdo, revisão, cobertura, nem estado `reviewed`; este relatório é diagnóstico somente.

## Limitações de evidência

- Leitura de arquivos fonte feita; não executei renderização de todas as aulas ou testes/gates globais, pois escopo autoriza apenas relatório e roadmap de subagente lista apenas gates do entregável.
- As observações curtas das 26 lições foram lidas nos arquivos, porém várias recomendações dependem da validação do comportamento de feedback/renderização em aula.
- Revisão automatizada de literal de fonte contou também um objeto duplicado/inacessível no arquivo resilience.ts: o agregador expõe 26 aulas e cada uma tem `reviewed: false`; o literal extra não integra a lista de lições indexada.
- `relations.ts` não foi tratado como uso decisivo no relatório: revisar relações explícitas no fechamento editorial.