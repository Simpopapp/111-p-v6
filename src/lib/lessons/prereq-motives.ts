// Motivos editoriais dos pré-requisitos (F3 / PRD §14.4: ficha com nome,
// motivo e retomada curta). O contrato Lesson traz apenas prereqIds; o motivo
// por par (lição, pré-requisito) vive aqui na camada editorial de lições.
// Par sem motivo aqui é lacuna editorial: denunciada pelo teste de cobertura
// em lesson-modes.test.ts, nunca fingida na UI (fallback honesto).

import type { Lesson } from "./types";
import { getConcept } from "@/lib/concepts";

export const PREREQ_MOTIVES: Record<string, string> = {
  "22:3": "Entender como o balanceador escolhe uma réplica permite distinguir o roteamento de uma nova conexão da posse de um socket já aberto; afinidade não transfere a conexão após falha.",
  "45:3": "Antes de contar novas réplicas como capacidade útil, é preciso distinguir backend elegível e roteamento: só réplicas prontas devem receber trabalho.",
  "45:44": "A espera durante o provisionamento exige separar admissão de capacidade: backpressure limita trabalho aceito agora, enquanto autoscaling altera capacidade com atraso.",
  "97:2": "Caching estabelece reutilização e expiração por TTL; DNS aplica esse mecanismo a respostas distribuídas, e a lição exige calcular a validade restante sem supor invalidação global.",

  "5:1": "A política de borda que nega por volume é o contraste central: esta lição separa limite de taxa de autorização e rastreia onde a negativa para.",
  "5:4": "Localizar onde o pedido foi negado exige saber quem está na frente do serviço antes de abrir a política.",
  "10:11": "O breaker conta chamadas pendentes; sem tempo-limite uma chamada nunca termina e o estado não transita.",
  "12:11": "Repetir só é decidível com o tempo restante conhecido — o orçamento que limita cada tentativa vem dos timeouts.",
  "12:14": "Repetir só é seguro quando repetir não muda o resultado; idempotência é o que separa retry seguro de duplicação.",
  "13:11": "O atraso calculado precisa caber no tempo-limite que resta; sem deadline a espera pode consumir a tentativa.",
  "13:12": "A classificação da falha decide se há repetição a agendar — sem ela o cálculo de atraso não tem entrada.",
  "15:11": "Trabalho que nunca termina é exatamente o que a fila acumula; a predição de trabalho não concluído parte daí.",
  "16:15": "Pub/sub é contrastado com a fila: obrigações de entrega por assinante contra tentativas de entrega.",
  "17:15": "Separar o fato de negócio commitado das reações posteriores usa o desacoplamento que a fila fornece.",
  "17:16": "As reações posteriores alcançam vários interessados; o mecanismo dessa entrega é o pub/sub.",
  "38:39": "Retome o interleaving entre leitura e escrita da lição Race Conditions: ele permite reconhecer por que um processo pausado ainda pode agir depois que outro recebe a lease.",
  "20:15": "A contagem de tentativas pertence ao pipeline de entrega da fila; é nele que o esgotamento aparece.",
  "20:12": "Tentativas esgotadas são a política de retry levada ao limite — distinguir esgotamento de veneno exige a política.",
  "44:15": "Backlog é a medida da fila; admitir ou rejeitar depende de ler o trabalho não concluído antes de prometer mais capacidade.",
  "60:58": "trace_id só orienta sobre uma base de monitoramento que já diz o que observar e onde.",
  "61:58": "O vocabulário do que medir vem da prática anterior de monitorar sinais e reagir a eles.",
  "63:58": "O SLI é escolhido entre sinais que o monitoramento já coleta; sem eles a escolha é arbitrária.",
  "63:61": "Counter, rate, gauge e histograma são os tipos entre os quais o SLI é definido e agregado.",
  "109:58": "A linha do tempo do incidente é montada com os sinais de monitoramento captados durante a resposta.",
  "109:60": "Causas concorrentes são separadas com evidência de tracing: quem chamou quem, quando e com quê.",
  "109:61": "O impacto e a recuperação do incidente são quantificados com métricas, não com impressões.",
  "109:63": "A verificação da mitigação consulta o orçamento de erro: sem SLO não há critério de término.",
  "111:109": "O postmortem herda a linha do tempo e a verificação construídas na resposta ao incidente.",
  "14:11": "O timeout explica por que o cliente pode perder a resposta sem saber se a mutação remota foi commitada; sem essa distinção, a necessidade de identidade estável na repetição fica invisível.",
  "14:12": "A política de retry decide quando a tentativa ambígua pode ser repetida; idempotência e retenção determinam se repetir a mutação preserva o efeito pretendido.",
  "93:91": "A lição 91 estabelece latência como intervalo medido e pratica percentis por nearest-rank; essa base permite interpretar P99 sem confundir métrica, fronteira de medição e distribuição.",
  "93:60": "Distributed Tracing dá meios de correlacionar requisições lentas a spans e dependências; P99 identifica um sintoma de cauda, mas não determina sua causa.",
  "93:92": "Composition explica como o trabalho por requisição se combina entre operações e dependências; é necessário para investigar por que a cauda ponta a ponta pode refletir componentes e caminhos diferentes, sem supor que percentis se somam.",
  "23:11": "Distinguir tempo-limite de confirmação de falha permite separar o fim normal da espera HTTP, o encerramento pelo intermediário e a necessidade de uma nova requisição; nenhum desses eventos prova que não houve atualização no servidor.",
  "23:22": "O modelo de canal persistente bidirecional permite contrastar WebSocket com respostas HTTP que encerram cada requisição; essa distinção explica o intervalo de reconexão e evita atribuir garantias de canal ao long polling.",
  "35:34": "A lição de CAP permite reconhecer por que uma réplica isolada pode servir um valor antigo ou recusar uma leitura que exige uma garantia mais forte. A lição 35 retoma esse limite para distinguir propagação assíncrona, convergência e leitura da própria escrita; convergir depois não corrige retroativamente uma confirmação incorreta.",
  "46:3": "É preciso entender que o balanceador pode encaminhar requisições sucessivas a réplicas diferentes para perceber por que uma sessão guardada apenas na memória de A não permite continuação em B; distribuir tráfego não replica o estado.",
  "57:56": "A lição 56 estabelece que um health check é uma observação limitada e que a retirada do roteamento ocorre após detecção e propagação, sem cancelar trabalho admitido. A lição 57 usa essa base para decidir quando reiniciar um processo e quando apenas suspender a admissão de trabalho.",
  "98:97": "Retome a separação entre nome e destino: DNS descobre o endereço, mas não define como os dados seguintes serão entregues. A lição 98 parte desse destino já resolvido para comparar os contratos de transporte; não presume que DNS use exclusivamente UDP.",
  "92:91": "Distinguir latência por requisição de conclusões por unidade de tempo exige fixar a fronteira de medição; a leitura de distribuições e percentis evita tratar uma latência média menor como prova de maior throughput.",
  "92:44": "Backpressure e controle de admissão permitem proteger o recurso compartilhado quando a entrada supera as conclusões; limitar trabalho aceito não deve ser confundido com criar capacidade.",
  "94:91": "A conta de amplificação precisa separar o percentil nearest-rank de uma amostra, seu máximo e sua média da probabilidade de uma página encontrar uma dependência lenta.",
  "94:11": "Escolher deadlines por dependência exige entender que timeout limita a espera do chamador, mas não confirma falha remota, cancelamento efetivo ou conclusão bem-sucedida.",
  "28:11": "Distinguir prazo de espera e término efetivo do trabalho permite limitar a aquisição de uma conexão sem supor que o timeout do cliente cancela a transação no banco.",
  "65:63": "O orçamento deriva do objetivo e da janela do SLO: reconhecer a população elegível e a fração de eventos bons é necessário para calcular a tolerância e interpretar o saldo sem misturar unidades.",
};

export interface PrereqCard {
  id: number;
  /** Nome canônico do conceito — nunca o número sozinho (§14.4). */
  name: string;
  /** Por que esta lição o pressupõe; undefined = lacuna editorial honesta. */
  motive?: string | undefined;
  /** Retomada curta derivada da primeira frase do ELI10 do conceito. */
  retake: string;
}

function shortRetake(prereqId: number): string {
  const concept = getConcept(prereqId);
  if (!concept) return "";
  const firstSentence = concept.eli.split(/(?<=[.!?])\s+/)[0];
  return (firstSentence ?? concept.eli).trim();
}

/** Fichas de pré-requisito da lição, na ordem declarada. */
export function getPrereqCards(lesson: Lesson): PrereqCard[] {
  return lesson.prereqIds.map((id) => {
    const concept = getConcept(id);
    if (!concept) {
      throw new Error(`lesson ${lesson.id}: prereq ${id} não é um conceito canônico`);
    }
    return {
      id,
      name: concept.name,
      motive: PREREQ_MOTIVES[`${lesson.id}:${id}`],
      retake: shortRetake(id),
};
  });
}
