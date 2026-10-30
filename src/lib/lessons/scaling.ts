import type { Lesson } from "./types";

export const LESSONS_SCALING: Lesson[] = [{
  id: 45,
  rev: "3.0",
  objective: "Predict when new capacity becomes useful and choose signals, bounds and protective admission for predictable and unexpected demand.",
  prereqIds: [3, 44],
  mentalModel: {
    definition: "Autoscaling is a feedback policy that changes provisioned capacity from observed or anticipated demand within configured bounds. Desired replicas are not ready replicas: measurement, scheduling, startup, readiness and routing delay useful service. End-to-end throughput remains bounded by the slowest shared resource.",
    analogy: "A shop manager calls extra cashiers after seeing a growing line, but they must travel, open a register and receive customers before the line can shrink.",
    analogyLimits: "Replicas may need quota, images, warm caches and external state. More registers do not increase a shared payment terminal's capacity. Scaling down also requires draining work rather than simply sending a cashier home.",
    correspondence: [["Observed demand", "Manager's delayed view of the line"], ["Provisioning and readiness", "Travel and register setup"], ["Ready replica", "Cashier able to serve"], ["Shared dependency", "Payment terminal used by every cashier"]],
  },
  scenario: {
    system: "A product-search API for the recurring shop scenario, behind a balancer with external session state.",
    data: "Illustrative fluid model: two ready replicas each sustain 100 requests/s. Demand steps from 160 to 360 requests/s at t=0 and stays there through t=120 s. Database capacity is initially 500 requests/s. A trailing 30 s demand window triggers at t=30; one action requests two replicas. Provisioning takes 45 s, readiness 15 s; first new-replica response is at t=90.",
    symptom: "Desired replicas become four while ready replicas remain two; waiting work grows despite the scale-out decision.",
    constraints: ["Ignore request service time, failures and abandonment only for backlog arithmetic; this is not a latency simulator.", "Search is stateless; load is evenly routed only to ready replicas. No second action occurs during this replay.", "Teaching policy: min 2, max 4, step +2. Quota must permit four; validate target demand per ready replica against load tests, not a universal CPU percentage.", "A scheduled launch is known at least 90 s ahead; an unexpected burst is not. Real startup times need a measured safety margin.", "For overload beyond the replay, bound waiting work and reject or degrade requests; scaling does not extend client deadlines."],
    baseline: "Until t=90, useful capacity is 200 requests/s and backlog grows by 160 requests/s: 14,400 requests. Four ready replicas then provide 400 requests/s; spare capacity is 40 requests/s, requiring 360 more seconds to drain if demand remains 360 and no work expires.",
  },
  representation: {
    kind: "event-track",
    caption: "Before reading the solution, predict whether the alarm or readiness stops backlog growth. Compare demand, desired capacity and first useful service on the same seconds axis.",
    data: {
      unit: "s",
      lanes: [{ id: "demand", label: "Demand and waiting work", kind: "signal" }, { id: "control", label: "Scaling controller", kind: "actor" }, { id: "service", label: "Ready capacity and useful service", kind: "actor" }],
      events: [
        { ts: 0, lane: "demand", label: "Demand 160 → 360/s; capacity 200/s; backlog +160/s", kind: "warn" },
        { ts: 30, lane: "control", label: "Trailing-window alarm: desired 2 → 4; ready stays 2", kind: "warn" },
        { ts: 75, lane: "service", label: "Provisioning completes; new replicas not ready", kind: "info" },
        { ts: 90, lane: "service", label: "Readiness passes; first response; capacity 400/s", kind: "success" },
        { ts: 90, lane: "demand", label: "Backlog 14,400; now draining at 40/s", kind: "warn" },
        { ts: 120, lane: "demand", label: "Replay ends: backlog 13,200, not zero", kind: "info" },
      ],
      window: { from: 0, to: 120 },
      note: "Fixed teaching replay, not a live controller. The timestamps expose control delay; backlog uses the stated fluid assumptions. Actual systems can reject, expire or shed waiting work.",
    },
    textEquivalent: "At 0 s demand exceeds 200/s by 160/s. At 30 s an alarm requests two replicas, but useful capacity stays 200/s. At 75 s provisioning finishes; readiness still blocks routing. At 90 s new replicas first respond, capacity reaches 400/s and backlog is 14,400. At 120 s backlog is 13,200. An alarm is not useful capacity and readiness does not instantly clear accumulated work.",
  },
  worked: {
    decision: "For the known launch, schedule four ready replicas before t=0 using measured lead time plus margin. For an unexpected burst, retain a tested warm minimum, react to demand and waiting work, cap at four in this model and protect admission while capacity catches up.",
    reasoning: ["The replay needs 30 + 45 + 15 = 90 s before useful service. Reactive scaling cannot retroactively serve the first 90 s.", "The 14,400 backlog follows 160 × 90. After readiness, 400 - 360 = 40/s spare capacity drains rather than instantly eliminates it.", "A scheduled action at t=-90 would be only just sufficient under these deterministic delays; real schedules need margin. Extra warm replica-seconds buy lower launch risk, not guaranteed availability.", "Use incoming demand per ready replica and oldest waiting age with measured resource saturation. CPU alone can stay low while requests wait on a dependency. Calibrate signals, observation window and target from load tests.", "Min 2 bounds idle spend; max 4 bounds this exercise's replica count, not every cost or failure. Step +2 is enough for 360/s only when the database sustains 500/s and quota exists. Recheck at each step; do not treat these values as production defaults.", "If database capacity falls to 220/s, doubling replicas from two to four raises useful throughput only from 200 to at most 220/s. Replica spend roughly doubles at equal unit price, while extra connections may worsen contention. Limit downstream concurrency and admission; investigate the database.", "Scale down after sustained lower demand with stabilization and draining; otherwise delayed metrics and startup can create repeated removal and re-creation."],
  },
  contrast: [
    { alternative: "Scheduled or warm capacity", tradeoff: "Pays for idle time and requires a reliable forecast, but can make capacity useful before a known peak.", whenNotToUse: "Do not rely on the schedule alone for unannounced spikes or uncertain startup times." },
    { alternative: "Reactive scaling on CPU alone", tradeoff: "Convenient for measured CPU-bound work, but a trailing signal can arrive after overload and miss I/O waiting.", whenNotToUse: "Do not use CPU as the only demand signal when the bottleneck is a shared database or a waiting queue." },
    { alternative: "Backpressure and bounded admission", tradeoff: "Bounds accepted work and protects dependencies now, at the cost of rejection, deferral or degraded service; it does not create capacity.", whenNotToUse: "Do not mistake rejection for added throughput or substitute it for justified capacity growth." },
  ],
  misconceptions: [
    { wrong: "Autoscaling replaces capacity planning.", discriminant: "Check useful-capacity lead time, quota, state placement and dependency limits before trusting the maximum replica count.", counterexample: "A 20 s spike ends before a 60 s cold start finishes; a quota of two blocks a desired four, and local session state can prevent safe redistribution even if instances start." },
    { wrong: "Doubling replicas doubles successful throughput.", discriminant: "Compute min(application capacity, downstream capacity) and check whether the bottleneck moves.", counterexample: "Two 100/s replicas with a 220/s database serve at most 200/s. Four serve at most 220/s, not 400/s, while replica spend roughly doubles." },
  ],
  practiceIds: ["t-45-predict", "t-45-variant"],
  evidenceCriteria: ["Locate first useful service at 90 s rather than the 30 s alarm and derive backlog 14,400.", "Choose scheduled readiness for a known peak and bounded reactive capacity plus overload protection for surprise demand.", "Explain why four replicas cannot exceed a shared 220/s dependency and distinguish capacity from admission.", "Transfer the policy to queue workers using waiting age, dependency concurrency and warm-start delay rather than HTTP CPU alone."],
  transfer: { domain: "Background document processing", variant: "A document queue has unpredictable arrivals, low worker CPU and an OCR provider capped at eight concurrent calls. New workers take 60 s to warm. Choose the variant task's policy using waiting age and global provider concurrency; explain why HTTP replica targets cannot simply be copied." },
  provenance: { reviewed: true, notes: "Revisão independente: revisão efetiva registrada. Verificados integralmente os campos editoriais e as duas tarefas com funções de rubrica e pistas. Conferido o mecanismo de controle periódico e capacidade desejada com Kubernetes HPA, https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/. Recalculados 90 segundos, backlog 14.400, drenagem de 40/s, backlog 13.200 ao fim do replay e 360 segundos adicionais sob demanda constante. Confirmados o teto de 220/s da dependência alternativa, o limite global OCR e os oito critérios editoriais. Hipóteses fluidas e tempos são didáticos; nenhuma política real de autoscaling foi executada ou calibrada." },
},
{
  id: 46,
  rev: "3.0",
  objective: "Classify product state and choose its location so a different ready replica can continue service after routing changes or instance loss.",
  prereqIds: [3],
  mentalModel: {
    definition: "Horizontal scaling adds service instances and distributes independent work among them. For interchangeable application replicas, no instance may hold the only copy of state another instance needs to continue that work. Replicas use compatible code, configuration and shared state contracts; they need not have identical memory contents. Local disposable caches are compatible with this model. Useful capacity still depends on routing, readiness, workload distribution and shared-resource limits.",
    analogy: "Several shop assistants can serve the same customer if the order ledger is accessible to all of them, rather than written only in one assistant's private notebook.",
    analogyLimits: "A shared ledger is itself a service with latency, availability and concurrency rules. Moving a notebook does not prevent two assistants from changing the same order incorrectly. In-flight requests and connections also do not migrate automatically when an assistant disappears.",
    correspondence: [
      ["Ready application replica", "Assistant able to serve customers"],
      ["Load balancer", "Reception desk assigning the next customer"],
      ["External authoritative state", "Order ledger accessible to every assistant"],
      ["Instance-local authoritative state", "Private notebook unavailable to other assistants"],
      ["Disposable local cache", "A copied price list that can be fetched again"],
    ],
  },
  scenario: {
    system: "The recurring shop's account and product-image upload API, running replicas A and B behind a load balancer.",
    data: "A accepts login and stores session S in its own memory. Upload U stores its first 8 MiB and its offset on A's local disk. Both replicas maintain disposable product-thumbnail caches. Each process also starts the same nightly cleanup timer. Illustrative load tests give 100 requests/s per replica for independent work, while the shared database sustains only 150 requests/s for this workload.",
    symptom: "A later request routed to B is treated as logged out; continuing U on B cannot find its earlier bytes. Adding replicas increases cleanup executions instead of creating one coordinated cleanup.",
    constraints: [
      "The next request may reach any ready replica; a scale-in may remove A.",
      "A confirmed login must remain usable after A is lost, within the declared durability and availability guarantees of the session store.",
      "An acknowledged upload chunk must be recoverable outside A; a partial unacknowledged chunk may be retried.",
      "Thumbnail cache misses are acceptable; rebuilding the authoritative product data is not.",
      "Cleanup effects must tolerate duplicate delivery or execution; one local timer per process is not coordination.",
      "All rates are illustrative load-test inputs, not a claim of linear production scaling.",
    ],
    baseline: "With A as the only destination, local sessions and uploads appear to work but are lost with A. With two evenly used replicas and independent uniform routing, a next request for a session held only on A has a 1/2 chance of reaching B. Theoretical application capacity becomes 200 requests/s, but database-bound useful throughput cannot exceed the stated 150 requests/s ceiling.",
  },
  representation: {
    kind: "table",
    caption: "Before reading the worked decision, follow each state item across A → B and then remove A. Which losses are correctness failures, and which are only extra work?",
    data: {
      columns: [
        { key: "state", label: "State" },
        { key: "local", label: "Instance-local baseline" },
        { key: "switch", label: "Next request reaches B" },
        { key: "loss", label: "A disappears" },
        { key: "placement", label: "Chosen placement and remaining limit", emphasis: true },
      ],
      rows: [
        {
          cells: {
            state: "User session S",
            local: "Authoritative session in A memory",
            switch: "B cannot resolve S; user is treated as logged out",
            loss: "Only session copy disappears",
            placement: "Shared session store, e.g. Redis with an explicit persistence/HA policy; B reads S. Store failure or data loss still matters.",
          },
          tone: "warn",
        },
        {
          cells: {
            state: "Upload U: acknowledged chunks and offset",
            local: "Bytes and progress on A disk",
            switch: "B cannot resume the upload",
            loss: "Progress is unavailable; retry may require starting again",
            placement: "Shared object storage plus durable upload metadata; confirm a chunk only after its bytes and progress are recoverably recorded. Reconcile partial failures.",
          },
          tone: "warn",
        },
        {
          cells: {
            state: "Product-thumbnail cache",
            local: "Disposable copies on A and B",
            switch: "B may miss and fetch or rebuild",
            loss: "Cache warms again; authoritative data remains",
            placement: "Keep local if misses and freshness rules are acceptable; bound rebuild load and do not store the only result here.",
          },
          tone: "ok",
        },
        {
          cells: {
            state: "Nightly cleanup work",
            local: "One timer in every process",
            switch: "Routing does not coordinate timers",
            loss: "A's unfinished run may stop; other timers may duplicate effects",
            placement: "Coordinated scheduler enqueues durable work; workers acknowledge after durable effects and make retries safe. Duplicate delivery remains possible.",
          },
          tone: "warn",
        },
      ],
      note: "Externalize state required for continuation, not every byte in memory. A shared store needs its own failure and consistency policy. Neither external state nor extra replicas removes the database ceiling.",
    },
    textEquivalent: "Session: local A memory means B cannot authenticate S and A loss removes the only copy; use a shared session store with explicit durability. Upload: local bytes and offset cannot be resumed on B and disappear with A; use shared bytes and durable progress with a partial-failure protocol. Cache: B misses or A loss cause rebuild work, so local disposable copies may remain. Scheduled work: per-process timers duplicate work and A loss can interrupt it; use coordinated enqueueing, durable jobs and retry-safe effects.",
  },
  worked: {
    decision: "Make sessions and acknowledged upload progress independent of the serving replica, keep only disposable caches local, and coordinate cleanup through durable work before treating added replicas as interchangeable capacity.",
    reasoning: [
      "Trace login on A followed by an authenticated request on B. B has the cookie but not the authoritative session record. A second process is running, yet it cannot correctly continue this user's workflow.",
      "Under the stated independent uniform routing, one of two destinations lacks S. With four destinations and S still only on A, three of four lack it. Autoscaling in lesson 45 can therefore provision ready processes that are unusable for this session, rather than solving its state dependency.",
      "Store S outside the application replica and define what an acknowledged session write survives. Redis is one implementation choice, not an automatic durability guarantee. If the session service is unavailable, the application must follow an explicit failure policy.",
      "Give U an upload identifier accessible on B. Persist acknowledged chunks and durable progress outside A, with reconciliation for a crash between byte storage and metadata update. Existing TCP connections still break on A loss; the client resumes using the identifier.",
      "Keep a thumbnail cache local only because a miss can be rebuilt from an authoritative source. Measure cold-cache amplification so simultaneous new replicas do not overload that source.",
      "Replace per-replica cleanup timers with coordinated scheduling and durable job delivery. Persist effects before acknowledging, and make repeated effects safe; a crash can cause redelivery.",
      "Test continuation on B and abrupt loss of A, not just process count. Even after correctness is repaired, two nominal 100 requests/s replicas cannot push this database-bound workload beyond its 150 requests/s dependency ceiling.",
    ],
  },
  contrast: [
    {
      alternative: "Add replicas while retaining local sessions and enable sticky routing.",
      tradeoff: "Affinity can preserve continuity while A is healthy, but ties the session to A, can skew load and does not recover its state after loss. It may be a temporary migration choice when those losses are explicitly acceptable.",
      whenNotToUse: "Do not use affinity as the recovery mechanism when login or acknowledged upload progress must survive A's disappearance.",
    },
    {
      alternative: "Move authoritative workflow state outside interchangeable replicas before scaling their count.",
      tradeoff: "Failover and scale-in no longer depend on one replica's private state, but shared storage adds network cost, contention and operational failure modes. Concurrent writes still need application-level rules.",
      whenNotToUse: "Do not externalize every disposable cache merely to satisfy the word stateless; avoid this added architecture when one adequately provisioned instance meets demand and its recovery limits are acceptable.",
    },
    {
      alternative: "Keep intentionally stateful owners with partitioning and replication.",
      tradeoff: "Some databases and long-lived workloads deliberately own state. Scaling them requires explicit ownership, replication and recovery protocols rather than pretending each process can replace any other immediately.",
      whenNotToUse: "Do not apply a random interchangeable-replica model to a workload whose correctness depends on exclusive local ownership without designing handoff and recovery.",
    },
  ],
  misconceptions: [
    {
      wrong: "Adding instances automatically adds usable capacity.",
      discriminant: "Can a request move from A to B and continue correctly, and is a shared dependency already saturated?",
      counterexample: "S exists only in A memory. B rejects S even though it is ready and idle; more replicas increase the number of destinations that lack S. Externalizing S repairs this failure but still does not increase the database's 150 requests/s ceiling.",
    },
    {
      wrong: "Stateless replicas cannot hold anything in memory.",
      discriminant: "Is local data the only authoritative copy needed for continuation, or can it be discarded and rebuilt within the service's constraints?",
      counterexample: "Losing A's thumbnail cache causes misses, not lost orders. Losing A's only acknowledged upload chunks destroys progress. Both occupy local resources, but only one is safely disposable here.",
    },
    {
      wrong: "Sticky sessions or a shared store guarantee transparent failover.",
      discriminant: "What survives process loss, connection loss and failure of the store itself?",
      counterexample: "Affinity still points at a dead A and cannot reconstruct S. A shared store allows B to read S only if the store is available and retained the write; an in-flight request still needs a retry or resume protocol.",
    },
  ],
  practiceIds: ["t-46-predict", "t-46-variant"],
  evidenceCriteria: [
    "Predict the result of login on A followed by a request on B, distinguishing missing session state from insufficient CPU.",
    "Classify sessions, acknowledged upload chunks, disposable cache and scheduled work by authority, continuation requirements and acceptable loss.",
    "Choose state placement and explain both the A → B routing consequence and the consequence of losing A.",
    "Explain why affinity is conditional continuity rather than recovery, and why the shared database can cap useful throughput.",
    "Transfer the decision to long-running image jobs, placing durable inputs, progress and results appropriately and explaining acknowledgement and duplicate-effect risks.",
  ],
  transfer: {
    domain: "Long-running image processing workers",
    variant: "A photo service runs twenty-minute transformations. The queue survives worker loss, inputs are in shared object storage, but a worker acknowledges immediately after dequeue and writes its only output to local disk. Workers may be removed after five minutes of scale-in notice. Decide what must survive outside the worker, when acknowledgement becomes safe, and whether intermediate progress must be checkpointed. If restarting twenty minutes is acceptable, scratch data may remain disposable; if the restart budget is two minutes, recoverable checkpoints are required. Explain why durable output followed by acknowledgement still needs retry-safe publication when a crash occurs between those steps.",
  },
  provenance: {
    reviewed: true,
    notes: "Revalidação independente s40: revisão efetiva registrada. Confirmada a correção de t-46-variant: restart-budget verifica checkpoint, opção existente; a única solução aceita combina checkpoint e commit-ack. Revisados continuidade entre réplicas, perda de estado autoritativo, cache descartável, gargalo compartilhado e janela de redelivery após publicação durável e antes do acknowledgement. Referências: Twelve-Factor App, VI Processes, e RabbitMQ, Consumer Acknowledgements and Publisher Confirms (https://www.rabbitmq.com/docs/confirms, confirmada nesta rodada). A variante muda para workers longos com orçamento de dois minutos de trabalho perdido. Taxas e probabilidades permanecem hipóteses didáticas, não medições de produção.",
  },
}
];