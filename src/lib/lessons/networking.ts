import type { Lesson } from "./types";

export const LESSONS_NETWORKING: Lesson[] = [{
  id: 97,
  rev: "3.0",
  objective: "Predict which DNS answer each cache can still return, then plan a provider migration without treating a record edit as immediate traffic movement.",
  prereqIds: [2],
  mentalModel: {
    definition: "DNS is a distributed naming system. Authoritative servers publish record sets; recursive resolvers obtain and cache answers, and applications may cache them too. Positive answers have TTLs; negative answers can also be cached. Editing an authoritative record does not push invalidations to existing caches. A conforming cache normally returns the remaining TTL, not a fresh full TTL, to downstream clients.",
    analogy: "Several reception desks copy a contact directory and date each copy for replacement.",
    analogyLimits: "There is no single directory copy or global refresh clock. DNS caches are keyed by names and record types; aliases and delegations have their own records and lifetimes. Applications can impose different cache policies, and existing network connections do not re-resolve merely because a TTL expires.",
    correspondence: [["Authoritative record set", "Directory maintained by its owner"], ["Recursive resolver cache", "Reception desk's dated copy"], ["Remaining TTL", "Time left before this copy needs refreshing"]],
  },
  scenario: {
    system: "A product catalog is moving catalog.example from provider A to provider B.",
    data: "At t=0 the authoritative A record changes from 192.0.2.10 to 198.51.100.20, still with TTL 300 s. Resolver R cached A at t=-60 with TTL 300 s, so it expires at t=240. Application C asks R at t=30 and honors the returned remaining TTL of 210 s. Resolver S has no cached answer. Addresses are documentation-only examples.",
    symptom: "After the edit, S reaches B while C still connects to A; the team mistakes this split for a failed deployment.",
    constraints: ["Both providers must serve the correct catalog during overlap.", "In this teaching trace caches honor TTL, clocks align, queries complete instantly, and serve-stale and prefetch are disabled.", "Only one A record is modeled: no aliases, delegation changes, or connection reuse in the trace.", "Production applications, resolver policies, IPv6 records, and persistent connections must be checked separately."],
    baseline: "Without advance preparation, R and C can use A until t=240 even though an uncached lookup through S returns B immediately after t=0.",
  },
  representation: {
    kind: "timeline",
    caption: "Compare application → recursive resolver → authoritative server: old answers expire locally, not when the owner edits the record.",
    data: {
      unit: "seconds relative to authoritative edit",
      events: [
        { label: "Authoritative: B published at t=0; new answer TTL 300 s (publication is a point, not a cache interval)", start: 0, end: 0 },
        { label: "Resolver R: old A remains usable at t=0, remaining TTL 240 s; expires t=240", start: 0, end: 240 },
        { label: "Application C: asks R at t=30, receives A with remaining TTL 210 s; expires t=240", start: 30, end: 240 },
        { label: "Resolver S: cold lookup at t=30 obtains B, TTL 300 s; expires t=330", start: 30, end: 330 },
        { label: "R and C: next lookup at t=240 refreshes to B, assuming successful authoritative lookup", start: 240, end: 240 },
      ],
      note: "Static worked trace, not live execution. R originally cached A at t=-60. At t=100, R and C each have 140 s left. TTL expiry triggers refresh on demand, not a broadcast. Times exclude lookup duration. Real resolvers may serve stale data under explicit policies.",
    },
    textEquivalent: "At t=0 authoritative=B; R=A with 240 s left. At t=30 C asks R and stores A for the remaining 210 s, not another 300 s; cold S gets B for 300 s. At t=100 R and C each have 140 s left. At t=240 the old entries expire; their next successful lookup gets B. Thus the TTLs on this forwarding path are not added together.",
  },
  worked: {
    decision: "For a planned migration, lower the published TTL from 300 s to a tested 60 s at least one previous TTL before cutover, keep A healthy through observed convergence, and validate B before changing the address.",
    reasoning: [
      "The unprepared trace gives R expiry -60 + 300 = 240; C inherits that expiry. A successful cold lookup is not evidence that all clients switched.",
      "Publishing TTL 60 does not shorten an already cached 300-second answer. If the lower TTL is published at t=-300 and all authoritative instances agree then, the earlier answers expire by t=0 under this model; subsequent old answers have at most 60 s left at cutover.",
      "Check B's capacity, TLS certificate, routing, and catalog correctness before publishing B. Keep A available for residual traffic, connection lifetimes, and measured client behavior rather than promising a universal 60-second bound.",
      "Compare authoritative answers with answers and remaining TTLs from multiple recursive resolvers and affected applications. Check A and AAAA separately. A health-checked destination pool can avoid routing new traffic to an unhealthy backend, but it does not invalidate DNS caches.",
      "If a new hostname returned NXDOMAIN earlier, creating its record does not clear the cached negative answer. RFC 2308 derives the negative cache TTL from the minimum of the SOA TTL and SOA MINIMUM, subject to resolver policies; prepublish and test names before depending on them.",
      "A rollback address edit also waits for cached B answers to expire. Retain a recovery path at B; changing DNS back is not an immediate rollback.",
    ],
  },
  contrast: [
    { alternative: "Keep a longer TTL for a stable hostname", tradeoff: "Fewer cache misses and less lookup dependency under repeated traffic, but slower reaction to address changes.", whenNotToUse: "Do not keep a long TTL for a planned near-term move unless the old destination can tolerate the overlap." },
    { alternative: "Lower TTL before the move", tradeoff: "Reduces future cache residency after older entries drain, but increases recursive-to-authoritative lookup demand and may encounter application TTL floors.", whenNotToUse: "Do not rely on a last-second TTL edit for an urgent failover or assume a very low TTL is free." },
    { alternative: "Use a stable endpoint with a health-checked backend pool", tradeoff: "Can move new requests between healthy backends without changing the public DNS answer, but adds a traffic-management dependency and requires appropriate health checks and capacity.", whenNotToUse: "Do not infer end-to-end correctness from a shallow health check or expect existing connections to migrate automatically." },
  ],
  misconceptions: [
    { wrong: "Updating DNS immediately moves every user.", discriminant: "Which layer answered, and when does its retained record expire?", counterexample: "At t=30 S returns B but R returns A with 210 s remaining; both match this trace." },
    { wrong: "A lower TTL is always better.", discriminant: "Compare the required change window with lookup load, resolver policy, and destination availability.", counterexample: "A stable service gets no migration benefit from changing TTL 3600 to 1 s, while repeated cache misses increase authoritative query load and exposure to lookup failures." },
    { wrong: "Creating a missing name immediately fixes all NXDOMAIN responses.", discriminant: "Inspect the cached negative answer and its SOA-derived lifetime.", counterexample: "A resolver cached NXDOMAIN for 120 s at t=-10; creating the name at t=0 can leave that resolver returning NXDOMAIN until t=110 in the stated no-serve-stale model." },
  ],
  practiceIds: ["t-97-predict", "t-97-variant"],
  evidenceCriteria: ["Compute inherited remaining TTL instead of adding fresh TTLs across caches.", "Explain why uncached and cached clients disagree after a record edit.", "Prepare a migration before old TTLs drain and preserve healthy destinations during overlap.", "Reject DNS-only sub-TTL failover guarantees and account for negative caching."],
  transfer: { domain: "Regional emergency-alert delivery", variant: "An alert service must recover from regional failure within 10 s. Its DNS record has TTL 60 s; mobile clients may retain addresses for 5 minutes and keep connections open. Choose a recovery design and explain why changing the address alone cannot meet the deadline. Compare a preprovisioned stable traffic endpoint with application reconnect/failover behavior and identify what must be tested." },
  provenance: { reviewed: true, notes: "Revisão técnica independente s39 concluída: revisão efetiva registrada. Verificados todos os campos da lição e as tarefas t-97-predict e t-97-variant, incluindo funções de rubrica, causas prováveis, respostas esperadas e pistas graduadas. Conferidos os tempos de expiração de R e C em t=240, o TTL restante de 210 s em t=30 e de 140 s em t=100, sem reiniciar TTL entre caches. Confirmados preparação antecipada, sobreposição de destinos, limites do rollback por DNS, cache negativo e distinção entre TTL, políticas de aplicação e conexões persistentes. Fontes consultadas: RFC 1035, https://www.rfc-editor.org/info/rfc1035/; RFC 2308, especialmente seção 5, https://www.rfc-editor.org/info/rfc2308/. Referências adicionais declaradas na lição: RFC 1034 e RFC 8767. Os oito critérios de profundidade foram conferidos, incluindo transferência para alertas regionais com objetivo de recuperação de 10 s. O traço é estático e condicionado às hipóteses descritas; não é garantia operacional. Ressalvas externas registradas para o conceito canônico 97." },
},
{
  id: 98,
  rev: "3.0",
  objective: "Predict application-visible delivery under the same packet loss, then choose a transport contract for live updates and complete business requests.",
  prereqIds: [97],
  mentalModel: {
    definition: "TCP provides a reliable, ordered byte stream: while a connection remains viable, missing bytes are retransmitted and later bytes cannot be delivered past a gap in that stream. Recovery can add delay, and connection failure can still prevent completion. TCP does not preserve application message boundaries or prove that a business operation executed. UDP carries separate datagrams without transport-level delivery, ordering, or duplicate-suppression guarantees. The application or a protocol above UDP must decide whether to discard, recover, reorder, or acknowledge data.",
    analogy: "TCP resembles receiving numbered pages that a reader may only read in sequence; UDP resembles receiving separate status cards that the reader may use independently.",
    analogyLimits: "TCP transports bytes, not numbered application pages, so applications still need framing. UDP cards are not guaranteed to arrive, arrive once, or arrive in order. Neither metaphor models congestion control, encryption, or business acknowledgments. A reliable stream is not a deadline or exactly-once execution guarantee.",
    correspondence: [
      ["TCP byte sequence", "Pages with a required reading order"],
      ["A missing byte range", "A missing page that prevents continuing"],
      ["UDP datagram", "An independently received status card"],
      ["Application freshness policy", "Choosing whether a newer status card replaces an older one"]
    ]
  },
  scenario: {
    system: "The product catalog from the DNS lesson now includes a live product demonstration and a checkout API.",
    data: "The demonstration sends independent state snapshots A, B, and C at t=0, 20, and 40 ms. Without loss they arrive at t=10, 30, and 50 ms. B is lost on its first transmission in both traces. In the established TCP trace, recovered B arrives at t=110 ms. UDP has no application retry in this trace. A snapshot expires 60 ms after generation.",
    symptom: "The live display freezes behind a missing update even though a newer update has reached the receiver. A proposal to move checkout to raw UDP confuses earlier arrival with complete delivery.",
    constraints: [
      "Snapshots are independently decodable; a newer snapshot may replace an older one.",
      "The live application discards snapshots older than 60 ms and ignores sequence numbers older than the newest accepted snapshot.",
      "Checkout requests require complete request framing and an explicit business response; payment retries need operation identity and outcome reconciliation.",
      "Both traces use the same initial loss and arrival schedule. Connection establishment, encryption, congestion dynamics, and CPU costs are excluded.",
      "The 110 ms recovery arrival is stipulated for this example, not a TCP retransmission default or a measured performance claim."
    ],
    baseline: "TCP delivers A at 10 ms, then withholds C behind missing B until 110 ms, when B and C are both stale. UDP delivers A at 10 ms and C at 50 ms; B remains missing without an application recovery mechanism."
  },
  representation: {
    kind: "table",
    caption: "Separate arrival at the receiver from delivery to the application: the same lost B blocks later TCP bytes but does not create an ordering barrier for UDP datagrams.",
    data: {
      columns: [
        { key: "time", label: "Time" },
        { key: "network", label: "Shared initial network event" },
        { key: "tcp", label: "TCP application observation", emphasis: true },
        { key: "udp", label: "UDP application observation", emphasis: true }
      ],
      rows: [
        {
          cells: {
            time: "10 ms",
            network: "A arrives",
            tcp: "A delivered; age 10 ms",
            udp: "A delivered; age 10 ms"
          },
          tone: "ok"
        },
        {
          cells: {
            time: "30 ms expected arrival",
            network: "B was lost",
            tcp: "Missing byte range; recovery is required",
            udp: "No B; UDP does not recover it"
          },
          tone: "warn"
        },
        {
          cells: {
            time: "50 ms",
            network: "C arrives",
            tcp: "C buffered behind B; not yet delivered to the application",
            udp: "C delivered; age 10 ms; application accepts newer snapshot"
          },
          tone: "warn"
        },
        {
          cells: {
            time: "110 ms",
            network: "Stipulated TCP recovery of B; UDP has no retry",
            tcp: "B then C become deliverable; ages 90 and 70 ms; application discards both",
            udp: "B remains absent; C was already accepted at 50 ms"
          },
          tone: "warn"
        }
      ],
      note: "Static illustrative trace, not a live simulation or benchmark. TCP rows assume sufficient receive buffering and eventual recovery. UDP application sequence and expiry checks are explicit application behavior, not UDP guarantees."
    },
    textEquivalent: "Both transports lose the initial B transmission. At 10 ms A is delivered. At 50 ms C reaches both receivers: TCP buffers it behind the missing B byte range, while UDP exposes C independently and the application accepts its 10 ms age. At the stipulated 110 ms TCP recovery, B and C become deliverable but are 90 and 70 ms old, beyond the 60 ms lifetime. UDP never recovers B in this trace."
  },
  worked: {
    decision: "Use a datagram-based protocol with explicit freshness, sequencing, and congestion behavior for replaceable live snapshots; retain a reliable application protocol for checkout rather than replacing it with raw UDP.",
    reasoning: [
      "After DNS identifies the destination, the transport contract still determines what the application can observe. Name resolution and transport reliability are different decisions.",
      "Classify semantics before choosing a transport: a later independent snapshot can replace B, but a checkout request cannot silently omit arbitrary bytes.",
      "At 50 ms C is only 10 ms old. TCP has received its bytes but cannot expose them past the gap in the same stream. UDP permits independent receipt, not guaranteed timeliness.",
      "At 110 ms TCP recovery restores byte order, but B is 90 ms old and C is 70 ms old. Reliable delivery is too late for this particular snapshot lifetime.",
      "UDP does not make B arrive sooner: B is absent. The application must tolerate that absence, reject stale or reordered updates, and define feedback and congestion behavior.",
      "Checkout needs framing, authentication, complete responses, and business-level handling of retries. Rebuilding these over raw UDP adds protocol work without establishing a latency benefit.",
      "TCP acknowledgment does not prove a payment committed. If a response is lost, reconcile the operation outcome using application-level identity rather than assuming the charge failed.",
      "Measure usable-update age and loss for the live flow, and completed-operation correctness and latency for checkout. A packet-arrival metric alone cannot validate either decision."
    ]
  },
  contrast: [
    {
      alternative: "Use a TCP-based application protocol",
      tradeoff: "Provides ordered reliable bytes and congestion control, but loss recovery can delay later bytes in the same stream; applications still need framing and business acknowledgments.",
      whenNotToUse: "Do not impose delivery of obsolete updates when independent fresh snapshots matter more than recovering every older snapshot."
    },
    {
      alternative: "Use UDP with an explicit application protocol",
      tradeoff: "Datagrams can be processed independently, but loss, duplication, reordering, expiry, congestion behavior, and recovery policy must be addressed above UDP.",
      whenNotToUse: "Do not substitute raw UDP for a complete payment API merely to remove retransmission; missing business requests or responses cannot be silently discarded."
    },
    {
      alternative: "Use QUIC-based application protocols",
      tradeoff: "QUIC runs over UDP and supplies security, congestion control, and reliable streams. Loss in one stream need not impose TCP-style cross-stream byte ordering, but missing bytes still block ordered delivery within that stream and congestion can affect the connection.",
      whenNotToUse: "Do not assume that choosing QUIC makes every message unreliable, removes all loss-related delay, or supplies application-level exactly-once execution."
    }
  ],
  misconceptions: [
    {
      wrong: "Choosing UDP improves every application's latency.",
      discriminant: "Does success mean receiving any fresh update, or completing a particular operation and learning its outcome?",
      counterexample: "A payment request lost over raw UDP never completes without higher-level recovery. Adding retries, duplicate handling, security, and response tracking recreates protocol work; removing TCP alone establishes no latency improvement."
    },
    {
      wrong: "TCP means every application operation eventually succeeds.",
      discriminant: "Distinguish ordered byte delivery on a viable connection from remote business execution and a known outcome.",
      counterexample: "A server commits a charge and the connection fails before its response arrives. The client has an unknown outcome, not proof of failure or permission to create another charge."
    },
    {
      wrong: "UDP applications can accept every arriving packet immediately.",
      discriminant: "Check whether a datagram is fresh, correctly sequenced, independently usable, and permitted by the application protocol.",
      counterexample: "If snapshot B arrives after C, displaying B would move the live view backward unless the application rejects its older sequence number."
    }
  ],
  practiceIds: ["t-98-predict", "t-98-variant"],
  evidenceCriteria: [
    "Separate network arrival from ordered application delivery in the shared-loss trace.",
    "Explain why C is usable at 50 ms over the stated UDP application but stale when TCP releases it at 110 ms.",
    "Identify the application responsibilities moved above UDP rather than claiming that loss disappears.",
    "Choose transport behavior from message semantics and distinguish reliable bytes from confirmed business execution.",
    "Transfer the decision to replaceable sensor readings and non-replaceable actuator commands."
  ],
  transfer: {
    domain: "Industrial monitoring and actuation",
    variant: "A plant publishes independent temperature readings every 100 ms; one missing reading is acceptable, and readings older than 250 ms are discarded. A separate valve command must not be silently lost, duplicated as a new action, or executed after its validity window. Choose transport and application behavior for each flow. Explain why a reliable connection alone cannot prove valve movement, and specify acknowledgment, command identity, expiry, and unknown-outcome handling."
  },
  provenance: {
    reviewed: true,
    notes: "Revisão técnica independente s39 concluída: revisão efetiva registrada. Verificados todos os campos da lição e as tarefas t-98-predict e t-98-variant, incluindo rubricas executáveis, causas prováveis, respostas esperadas e pistas graduadas. Conferidos fluxo ordenado de bytes e framing em TCP; ausência de garantias de entrega, ordenação e supressão de duplicatas em UDP; responsabilidades da aplicação; e distinção entre streams QUIC e datagramas sem confiabilidade. Recalculadas as idades de C aos 50 ms e de B e C aos 110 ms: 10, 90 e 70 ms. Confirmados o caráter estipulado da recuperação, os contraexemplos e a separação entre confirmação de transporte e execução de negócio. Referências técnicas declaradas na lição e usadas como enquadramento: RFC 9293, https://www.rfc-editor.org/rfc/rfc9293; RFC 768, https://www.rfc-editor.org/rfc/rfc768; RFC 8085, https://www.rfc-editor.org/rfc/rfc8085; RFC 9000, https://www.rfc-editor.org/rfc/rfc9000. Os oito critérios de profundidade foram conferidos, incluindo transferência para sensores e comandos com identidade, validade e resultado desconhecido. O traço não é benchmark, receita de produção ou certificação de segurança industrial. Ressalvas externas registradas para o conceito canônico 98."
  }
}
];