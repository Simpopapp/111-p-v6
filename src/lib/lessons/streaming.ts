import type { Lesson } from "./types";
export const LESSONS_STREAMING: Lesson[] = [{
  id: 22, rev: "3.1",
  objective: "Trace connection ownership through a replica failure and choose WebSockets only when frequent bidirectional messages justify connection lifecycle work.",
  prereqIds: [3],
  mentalModel: {
    definition: "WebSocket provides a persistent full-duplex message channel. In the HTTP/1.1 case shown here, an HTTP Upgrade handshake establishes WebSocket framing over a TCP connection (TLS for wss). The accepting replica owns live socket state; balancing a new connection does not move an existing one. Other HTTP versions can bootstrap WebSockets differently.",
    analogy: "An open two-way telephone call reaches one operator at one desk.",
    analogyLimits: "Unlike a human conversation, reconnecting does not restore subscriptions or confirm delivery. The call analogy hides proxy timeouts, buffering, and application acknowledgements.",
    correspondence: [["Live connection", "Open call"], ["Owning replica", "Operator desk"], ["New connection after failure", "Dialing again, possibly reaching another desk"]],
  },
  scenario: {
    system: "A support-chat product with two replicas A and B behind a WebSocket-capable proxy.",
    data: "2,000 open tabs; each polls every 500 ms today. Active conversations exchange messages and typing events in both directions. Durable messages have conversation sequence numbers; typing events are disposable.",
    symptom: "The baseline generates about 4,000 poll requests per second even during quiet periods. A proposed rolling restart also assumes B can inherit A's open connections.",
    constraints: ["Active chat needs sub-second updates in both directions.", "The proxy closes connections after 60 seconds without traffic; test heartbeat behavior through this proxy.", "Messages are stored durably before acknowledgement; reconnection must resume from the last confirmed sequence.", "Replicas share durable history but not socket objects; a broker routes live events to the owning replica."],
    baseline: "2,000 / 0.5 = 4,000 poll requests per second, excluding sends. This is request volume, not a measured CPU saving. A crash still loses its live sockets even if durable history survives.",
  },
  representation: {
    kind: "state-machine",
    caption: "Static teaching trace: follow the owner change, not just the connected label. A lost socket is not migrated to B.",
    data: {
      states: [{ id: "handshake", label: "Handshake: no chat subscription", tone: "warn" }, { id: "a", label: "Open on A: local subscription active", tone: "ok" }, { id: "lost", label: "Disconnected: A socket gone", tone: "down" }, { id: "resume", label: "New socket on B: authenticate and resume", tone: "warn" }, { id: "b", label: "Open on B: subscription restored", tone: "ok" }],
      transitions: [{ from: "handshake", to: "a", trigger: "Upgrade accepted; authenticate and subscribe" }, { from: "a", to: "a", trigger: "Exchange messages and heartbeat traffic" }, { from: "a", to: "lost", trigger: "A fails; client detects transport loss or heartbeat timeout" }, { from: "lost", to: "resume", trigger: "Backoff with jitter; new handshake routed to B" }, { from: "resume", to: "b", trigger: "Validate access; restore subscription; replay after confirmed sequence" }, { from: "b", to: "lost", trigger: "B connection fails" }],
      now: "b",
      history: [{ ts: 0, event: "Handshake starts", from: "handshake" }, { ts: 10, event: "A owns socket; subscription installed", from: "handshake", to: "a" }, { ts: 1000, event: "Sequence 41 confirmed", from: "a", to: "a" }, { ts: 2000, event: "A crashes after storing 42; client has not confirmed 42", from: "a", to: "lost" }, { ts: 4000, event: "Illustrative detection and backoff complete; B accepts NEW socket", from: "lost", to: "resume" }, { ts: 4100, event: "Replay after 41; deduplicate by sequence; restore live feed", from: "resume", to: "b" }],
    },
    textEquivalent: "At 0 ms the handshake starts. At 10 ms A owns the socket and subscription. Sequence 41 is confirmed at 1,000 ms. At 2,000 ms A fails after storing 42. The old socket is lost. At 4,000 ms a new connection reaches B; this delay is illustrative, not a guarantee. B validates access, replays after 41, deduplicates and restores the live subscription by 4,100 ms. Stored history survives; A's socket does not.",
  },
  worked: {
    decision: "Use WebSockets for active support chat, with explicit resume semantics; drain connections on shutdown rather than expecting load balancing to migrate them.",
    reasoning: ["Frequent bidirectional typing and message traffic make a full-duplex channel useful. Polling volume alone does not prove a CPU bottleneck.", "A healthy B does not rescue A's socket: new-connection routing and live-connection ownership are separate mechanisms. Sticky routing may influence reconnect placement but cannot resurrect A.", "For a planned restart stop accepting new connections, allow bounded draining, then close remaining connections so clients reconnect with jitter. A crash skips the drain; heartbeat detection and reconnection still apply.", "The trace resumes after confirmed sequence 41. Durable 42 can be replayed; client deduplication handles possible repeats. Replay-to-live handoff must avoid gaps using the same ordered cursor contract; WebSocket itself supplies no durable replay or exactly-once processing.", "Measure open connections per replica, buffers and reconnect rate. Bound slow-client queues and define disconnect/resync behavior. Use application heartbeat messages where browser APIs do not expose protocol ping control."],
  },
  contrast: [
    { alternative: "24 — Server-Sent Events", tradeoff: "SSE carries server-to-browser events over HTTP; ordinary requests can carry occasional client commands. Event IDs can support application replay if the server retains history.", whenNotToUse: "Do not prefer WebSockets just for one-way updates: a read-only quotation feed can use SSE without a bidirectional channel." },
    { alternative: "Short polling", tradeoff: "Simple independent requests fit sparse updates and permissive freshness targets, at the cost of repeated checks and polling delay.", whenNotToUse: "Do not maintain thousands of sockets for a report that changes once per hour and tolerates a minute of delay." },
    { alternative: "3 — Load Balancing: sticky versus stateless", tradeoff: "Balance new connections; an established connection stays with its owner. Externalizing durable session data helps any replica resume but does not make the socket stateless.", whenNotToUse: "Do not treat affinity as failover or assume adding replicas redistributes existing sockets." },
  ],
  misconceptions: [
    { wrong: "WebSocket is just HTTP with push, so the usual request path needs no changes.", discriminant: "Inspect handshake support and idle behavior across the complete proxy path.", counterexample: "Ordinary GET requests work through a proxy that rejects HTTP/1.1 Upgrade; no WebSocket channel opens. Even an accepted channel can close after 60 seconds of idle time." },
    { wrong: "A healthy replica and sticky sessions preserve the connection after a crash.", discriminant: "Separate socket ownership from durable application state and new-connection routing.", counterexample: "A dies holding the socket and local subscription. B has history but no socket to the client until a new handshake and subscription restore occur." },
    { wrong: "TCP ordering means chat messages are delivered exactly once across reconnects.", discriminant: "Ask whether the last message was durably stored, acknowledged and replayed.", counterexample: "A stores 42 then fails before acknowledgement. Resending can duplicate it unless the application deduplicates by a stable identifier." },
  ],
  practiceIds: ["t-22-predict", "t-22-variant"],
  evidenceCriteria: ["Predict that failure destroys the old socket even when another replica is healthy.", "Identify authentication, subscription restore and cursor replay as application recovery work.", "Choose SSE for a one-way variant and justify the freshness and direction constraints rather than assuming all real-time traffic needs WebSockets."],
  transfer: { domain: "Read-only financial quotation dashboard", variant: "500 browsers view server-generated quotes once per second. Users change watchlists twice per day via POST. Two-second freshness is acceptable, and the proxy supports streaming HTTP. Compare SSE plus POST with WebSockets; explain how cursor retention and reconnect replay would still need an application contract." },
  provenance: { reviewed: true, notes: "Revisão independente: revisão efetiva registrada. Verificados integralmente os campos editoriais e as duas tarefas, com funções de avaliação e pistas. Conferidos handshake HTTP/1.1, canal bidirecional e enquadramento sobre TCP com RFC 6455, https://www.rfc-editor.org/rfc/rfc6455.html. Confirmados propriedade local do socket, perda na falha, nova conexão, restauração de assinatura, replay após 41 e deduplicação de 42; WebSocket não fornece histórico durável nem exatamente uma vez. Conferidos 4.000 polls/s e os oito critérios editoriais, incluindo a transferência SSE mais POST. Tempos e capacidade são ilustrativos; nenhum proxy ou serviço real foi executado." },
},
{
  id: 23,
  rev: "3.1",
  objective:
    "Trace held HTTP requests, response boundaries and reconnect gaps, then choose long polling only when network constraints and freshness needs justify its request lifecycle.",
  prereqIds: [11, 22],
  mentalModel: {
    definition:
      "Long polling is a repeated HTTP request-response pattern. When no matching update is available, the server holds the request pending until data arrives or a bounded wait expires. A response ends that request; the client must issue another to keep receiving updates. HTTP connections may be reused, but this does not create a persistent application message channel. Prompt delivery while a request is pending feels like push; the continuing mechanism is client-initiated pull.",
    analogy:
      "A customer leaves one question with a service desk: reply when my order changes, or tell me when the waiting period ends. After each reply, the customer must leave another question.",
    analogyLimits:
      "A service desk does not model proxy buffering, lost responses, concurrent requests, resource limits or cursor retention. Leaving a question does not reserve future delivery: an update during the gap can be recovered only if the application retains it or provides a current-state resynchronization.",
    correspondence: [
      ["Pending HTTP request", "Question left at the desk"],
      ["Data response or empty timeout response", "Reply that ends this question"],
      ["Next request with an application cursor", "New question stating the last update received"],
      ["Reconnect gap", "Interval with no question waiting"],
    ],
  },
  scenario: {
    system:
      "The support-chat product's read-only supervisor dashboard, using the same conversation history as its interactive agent chat.",
    data:
      "1,000 dashboard tabs currently check every two seconds. Each tab sees a conversation status change about once per minute. Updates carry monotonically increasing per-feed sequence numbers and remain available for five minutes.",
    symptom:
      "The dashboard sends roughly 500 checks per second during quiet periods. A proposed replacement calls long polling a push channel and assumes status changes remain immediately visible during reconnects.",
    constraints: [
      "The dashboard only receives updates; occasional filter changes use ordinary requests. Interactive agent chat still has a separate bidirectional requirement.",
      "The normal tested proxy path permits ordinary held HTTP requests but closes requests after 30 idle seconds. Start with a 25-second server hold and verify margins across the full path.",
      "The dashboard aims for two-second freshness during healthy operation, not a hard real-time guarantee during outages.",
      "Only one receive request per tab should be outstanding. After a normal response, reopen promptly; after errors, use bounded backoff with jitter and expose stale status.",
      "Resume after the last applied sequence. If five-minute retention expires, fetch a current snapshot and a consistent cursor rather than pretending all transitions were replayed.",
    ],
    baseline:
      "1,000 / 2 = 500 polling requests per second, excluding commands. With 25-second holds, quiet long polling is roughly 40 requests per second and about 1,000 pending requests, ignoring overhead and scheduling gaps. Event responses end holds early, so actual request volume is workload-dependent; these counts do not establish CPU savings.",
  },
  representation: {
    kind: "event-track",
    caption:
      "A response ends each receive request. Follow both immediate delivery while a request is open and the interval where an event has no pending request to answer.",
    data: {
      unit: "s",
      lanes: [
        { id: "client", label: "Dashboard client", kind: "actor" },
        { id: "server", label: "History and held-request handler", kind: "actor" },
        { id: "proxy", label: "Intermediary", kind: "actor" },
      ],
      events: [
        { ts: 0, lane: "client", label: "Open request A after sequence 40", kind: "info" },
        { ts: 0, lane: "server", label: "No later event: hold A", kind: "info" },
        { ts: 3, lane: "server", label: "Store 41; respond to A with 41; A ends", kind: "success" },
        { ts: 3.1, lane: "client", label: "Apply 41; open request B after 41", kind: "info" },
        { ts: 28.1, lane: "server", label: "B reaches 25-second hold limit; send empty response; B ends", kind: "warn" },
        { ts: 28.2, lane: "client", label: "Open request C after 41", kind: "info" },
        { ts: 38.2, lane: "proxy", label: "Fault case: changed intermediary limit closes C after 10 idle seconds", kind: "fail" },
        { ts: 39, lane: "server", label: "Store 42 while no receive request is pending", kind: "warn" },
        { ts: 41.2, lane: "client", label: "Illustrative detection/backoff ends; open D after 41", kind: "info" },
        { ts: 41.2, lane: "server", label: "Return retained 42 in D; D ends", kind: "success" },
        { ts: 41.3, lane: "client", label: "Apply 42; open next receive request after 42", kind: "info" },
      ],
      window: { from: 0, to: 42 },
      note:
        "Static illustrative times; response transit is omitted. The 10-second proxy fault is deliberately shorter than the configured hold. The 3-second recovery interval is an example, not a latency bound. Sequence replay is an application feature.",
    },
    textEquivalent:
      "A opens at 0 seconds and ends with event 41 at 3. B opens at 3.1 and ends empty at 28.1 after its 25-second hold. C opens at 28.2, but a changed intermediary closes it at 38.2. Event 42 is stored at 39 with no pending request. D opens after sequence 41 at 41.2 and returns retained 42: delivery is 2.2 seconds late, excluding transit. The client applies 42 and opens another request at 41.3.",
  },
  worked: {
    decision:
      "Trial long polling for this sparse read-only dashboard when streaming HTTP cannot be relied on, while retaining WebSockets for active two-way chat. Treat compatibility and freshness as measured conditions, not protocol promises.",
    reasoning: [
      "Begin with direction and frequency: a read-only dashboard does not need the full-duplex channel justified by interactive chat. Sparse updates make empty short polls a meaningful source of request overhead.",
      "Long polling reduces empty checks by holding one request, not by eliminating request processing. Budget pending connections, authentication, per-client state and cancellation cleanup; avoid tying up a blocking worker for every tab.",
      "Under the stated normal path, a 25-second server hold ends before the measured 30-second idle limit. Validate the complete route, response flushing and timeout margins rather than assuming ordinary HTTP bypasses every intermediary policy.",
      "The trace contains both kinds of completion: data closes A, and an empty timeout closes B. Neither leaves a subscription channel behind. Reopen after either response.",
      "When the intermediary instead closes C after ten seconds, the configuration is no longer compatible. Event 42 waits for D and misses the two-second freshness aim. Re-test the path, reduce the hold if appropriate, and investigate recurring closures instead of retrying at full speed indefinitely.",
      "Retain ordered events, request after the last applied cursor and deduplicate repeated sequences. Make history lookup and waiting registration race-safe so an event between those operations is not missed. If replay history expires, resynchronize from a snapshot.",
      "Compare measured event-to-display latency, pending requests, empty responses, error reconnects and resource use against short polling and SSE. A smaller request count alone does not establish better user-visible behavior.",
    ],
  },
  contrast: [
    {
      alternative: "Short polling",
      tradeoff:
        "Independent requests are operationally simple and leave no long-held receive request. Freshness depends on polling interval plus network and service delay; empty checks consume request overhead.",
      whenNotToUse:
        "Do not add held-request lifecycle work for an hourly report that tolerates a minute of staleness. Do not choose slow polling for a strict freshness requirement without evaluating its waiting delay.",
    },
    {
      alternative: "24 — Server-Sent Events",
      tradeoff:
        "SSE keeps a server-to-client HTTP event stream open across multiple events, avoiding a new receive request after each response. Browser reconnection and event IDs can support recovery, but retention remains server-side application work.",
      whenNotToUse:
        "Do not prefer long polling for frequent one-way events when the tested route reliably flushes SSE. Conversely, SSE may not meet latency needs if an intermediary buffers streaming responses; blocking WebSocket Upgrade alone does not establish this.",
    },
    {
      alternative: "22 — WebSockets",
      tradeoff:
        "WebSockets provide a persistent full-duplex message channel useful for frequent two-way exchanges. They require compatible connection establishment and lifecycle management; reconnects still need application recovery.",
      whenNotToUse:
        "Do not replace frequent bidirectional chat with repeated receive requests merely because the dashboard can use them. Do not require WebSockets for sparse one-way status behind a proxy that rejects their handshake.",
    },
  ],
  misconceptions: [
    {
      wrong: "Long polling delivers in real time just like an uninterrupted WebSocket channel.",
      discriminant:
        "Check whether a receive request exists when the event arrives, then account for intermediary closure, detection, backoff and transit.",
      counterexample:
        "C is closed at 38.2 seconds. Event 42 arrives at 39 but reaches D only at 41.2, even though history retains it. A healthy continuous channel would not have this per-response request gap, although WebSockets can also disconnect.",
    },
    {
      wrong: "Long polling is push, so the server can send later events after completing the response.",
      discriminant:
        "Distinguish an HTTP connection that may be reused from a receive request that is still pending.",
      counterexample:
        "A ends after returning 41. Without B, there is no outstanding long-poll response through which to deliver the next update.",
    },
    {
      wrong: "Reconnecting prevents missed events automatically.",
      discriminant:
        "Ask what is retained, which cursor is supplied and what happens after retention expires.",
      counterexample:
        "A six-minute disconnection exceeds this application's five-minute history. A new request alone cannot replay the missing transitions; the dashboard must fetch a consistent current snapshot.",
    },
  ],
  practiceIds: ["t-23-predict", "t-23-variant"],
  evidenceCriteria: [
    "Identify data arrival and hold timeout as distinct reasons a receive request ends, both requiring another request.",
    "Calculate the trace's 2.2-second event delay and explain the pending-request gap rather than claiming a persistent push channel.",
    "Require retained cursor recovery or explicit snapshot resynchronization rather than attributing delivery guarantees to HTTP.",
    "Choose among short polling, long polling, SSE and WebSockets using direction, freshness, intermediary behavior and request lifecycle cost.",
  ],
  transfer: {
    domain: "Factory equipment monitoring",
    variant:
      "A factory dashboard shows 200 machines, each changing status about once per minute. Ordinary HTTPS requests work, WebSocket Upgrade is rejected, and a separate route test shows SSE events buffered for 20 seconds. Held requests are permitted for 20 seconds, completed JSON responses flush promptly, and the healthy-operation freshness aim is two seconds. Compare 15-second long-poll holds with 30-second short polling. Explain one outstanding request per dashboard feed, cursor recovery, stale-state display and jittered recovery after errors; describe why neither Upgrade rejection nor long polling proves a hard delivery deadline.",
  },
  provenance: { reviewed: true, notes: "Revisão independente: revisão efetiva registrada. Lidos integralmente todos os campos da lição e as duas tarefas, incluindo rubricas executáveis e ajuda graduada. Conferido o ciclo de requisição pendente, resposta, renovação e limitações de intermediários com RFC 6202, https://www.rfc-editor.org/rfc/rfc6202.html. Recalculados 500 checks/s, aproximadamente 40 requisições/s em silêncio, hold de 25 segundos, fechamento após 10 segundos e atraso de 2,2 segundos. Confirmadas recuperação por cursor, expiração da retenção e distinção entre Upgrade rejeitado e SSE com buffering. Oito critérios editoriais atendidos. Modelo estático; não houve medição de rede, CPU ou capacidade." },
}
];