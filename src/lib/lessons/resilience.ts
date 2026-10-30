// Lições âncora autorizadas (PRD project2 D2 / pacote s1-licoes).
// Conteúdo gerado pelo enxame, integrado pelo agente principal (practiceIds
// sincronizados com src/lib/exercises-data).

import type { Lesson } from "./types";

export const LESSONS_RESILIENCE: Lesson[] = [
  {
    id: 10,
    rev: "2.1",
    objective:
      "Trace closed, open, and half-open breaker transitions and distinguish rejected calls from dependency probes.",
    prereqIds: [11],
    mentalModel: {
      definition:
        "A circuit breaker tracks selected dependency outcomes and temporarily rejects calls when a failure policy trips. After a delay, limited probes test whether calls may resume.",
      analogy:
        "An electrical safety switch interrupts a dangerous circuit instead of repeatedly feeding it.",
      analogyLimits:
        "A software breaker infers trouble from configured observations rather than measuring electrical danger. It may allow recovery probes, can misclassify failures, and does not replace per-call timeouts.",
      correspondence: [
        ["Closed state", "Switch conducting normally"],
        ["Open state", "Switch interrupting the circuit"],
        ["Half-open probe", "Controlled test before restoring normal operation"],
      ],
    },
    scenario: {
      system: "A checkout service calls an optional recommendation provider.",
      data: "A teaching breaker opens after three consecutive qualifying failures, waits ten seconds, then permits one probe. A successful probe closes it.",
      symptom:
        "Repeated provider timeouts occupy workers even though recommendations can be omitted.",
      constraints: [
        "Each permitted call still has an explicit timeout.",
        "Validation errors do not count as provider-health failures.",
        "The fallback omits recommendations rather than inventing successful provider results.",
      ],
      baseline:
        "Without a breaker, every checkout attempts the unhealthy provider and can wait until its individual timeout.",
    },
    representation: {
      kind: "state-machine",
      caption: "Open means reject locally; half-open means test with bounded traffic.",
      data: {
        states: [
          { id: "closed", label: "Closed: calls permitted" },
          { id: "open", label: "Open: calls rejected locally" },
          { id: "half-open", label: "Half-open: one probe permitted" },
        ],
        transitions: [
          { from: "closed", to: "open", label: "3 consecutive qualifying failures" },
          { from: "open", to: "half-open", label: "10-second wait expires" },
          { from: "half-open", to: "closed", label: "Probe succeeds" },
          { from: "half-open", to: "open", label: "Probe fails" },
        ],
        now: "open",
        history: ["closed", "open"],
        budget: { consecutiveFailureThreshold: 3, openDurationMs: 10000, concurrentProbes: 1 },
      },
      textEquivalent:
        "Three qualifying failures move closed to open. Calls made while open do not contact the provider. After ten seconds, one probe is permitted. Success closes the breaker; failure reopens it.",
    },
    worked: {
      decision:
        "Apply the stated breaker to the optional provider and serve checkout without recommendations while calls are rejected.",
      reasoning: [
        "Classify outcomes first: network failures and provider timeouts qualify; a caller's invalid input does not.",
        "After the third consecutive qualifying failure, transition to open and reject subsequent calls locally.",
        "Do not record locally rejected calls as fresh provider failures: no provider call occurred.",
        "After ten seconds, admit one probe rather than releasing all accumulated traffic.",
        "Close on the successful probe under this teaching policy; real thresholds and recovery sampling require workload evidence.",
      ],
    },
    contrast: [
      {
        alternative: "Use only per-call timeouts",
        tradeoff:
          "Bounds each wait but still attempts the unhealthy dependency for every incoming request.",
        whenNotToUse:
          "Do not add a breaker merely to cap one call's duration; use a timeout for that requirement.",
      },
    ],
    misconceptions: [
      {
        wrong: "Open means the breaker allows traffic through.",
        discriminant:
          "Ask whether an incoming call actually reaches the dependency in that state.",
        counterexample:
          "The fourth call after the threshold is rejected locally while the breaker is open; it never reaches the provider.",
      },
    ],
    practiceIds: ["t-10-predict"],
    evidenceCriteria: [
      "Trace closed to open to half-open to closed using the stated policy.",
      "Separate local rejection, dependency failure, and recovery probe.",
      "Explain why permitted calls still require timeouts.",
    ],
    transfer: {
      variant:
        "Protect an optional address-enrichment connector in a batch import, preserving original addresses and flagging enrichment as unavailable.",
      domain: "Data integration",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 10. Consecutive-failure and recovery rules are an explicit teaching policy, not universal breaker semantics. Independent technical review is pending.",
    },
  },
  {
    id: 11,
    rev: "2.1",
    objective:
      "Allocate dependency waits within a caller deadline and explain what a timeout does and does not cancel.",
    prereqIds: [],
    mentalModel: {
      definition:
        "A timeout bounds how long an operation or phase may wait. An end-to-end deadline bounds the complete operation, including queueing, network phases, attempts, and local work.",
      analogy:
        "You knock on a door, wait for a limited time, then leave instead of waiting indefinitely.",
      analogyLimits:
        "Leaving does not stop the person inside from completing a task. Likewise, a client timeout does not prove the server canceled work or that a write did not commit.",
      correspondence: [
        ["Timeout", "Maximum wait at the door"],
        ["Deadline", "Latest time the whole visit may finish"],
        ["Cancellation signal", "Message asking the person inside to stop"],
      ],
    },
    scenario: {
      system: "An API performs authentication, one inventory call, and response formatting.",
      data: "A teaching request has a 600 ms total budget: 100 ms for authentication, at most 400 ms for inventory, and 100 ms reserved for formatting.",
      symptom:
        "An inventory call occasionally hangs and consumes the entire caller budget.",
      constraints: [
        "Queueing and connection setup must count toward the appropriate budget.",
        "The inventory lookup is read-only.",
        "Cancellation support must be verified rather than assumed.",
      ],
      baseline:
        "With no explicit inventory wait bound, the request may remain pending beyond the caller's 600 ms deadline.",
    },
    representation: {
      kind: "timeline",
      caption: "A child operation cannot receive more time than remains in the caller's budget.",
      data: {
        unit: "ms",
        events: [
          { label: "Authentication", start: 0, end: 100 },
          { label: "Inventory wait limit", start: 100, end: 500 },
          { label: "Formatting reserve", start: 500, end: 600 },
        ],
        deadline: 600,
        note: "Illustrative allocation; elapsed time reduces the remaining allowance.",
      },
      textEquivalent:
        "The total deadline is 600 ms. Authentication uses 100 ms; inventory may consume at most the next 400 ms; the final 100 ms is reserved for formatting. If authentication takes 180 ms, inventory has at most 320 ms with the same reserve.",
    },
    worked: {
      decision:
        "Propagate the caller deadline and cap the inventory operation at the smaller of 400 ms or remaining time minus the formatting reserve.",
      reasoning: [
        "A dependency timeout must fit inside the remaining end-to-end budget, not restart a fresh total budget.",
        "After 100 ms of authentication, 500 ms remains; reserving 100 ms leaves 400 ms for inventory.",
        "If authentication instead consumes 180 ms, only 320 ms remains available for inventory.",
        "Set appropriate connection and read controls, but also retain a total-operation bound so repeated partial progress cannot wait forever.",
        "On expiry, release local resources and request cancellation where supported; verify whether upstream work actually stops.",
      ],
    },
    contrast: [
      {
        alternative: "Use only a socket idle timeout",
        tradeoff:
          "Detects periods without network progress but may allow a slowly streaming operation to exceed the intended total duration.",
        whenNotToUse:
          "Do not use it as the sole control for an end-to-end response deadline.",
      },
    ],
    misconceptions: [
      {
        wrong: "A timeout proves the remote operation failed without taking effect.",
        discriminant:
          "Separate the caller's knowledge from the remote system's actual state.",
        counterexample:
          "A payment commits remotely, but its response is delayed past the caller timeout; blindly repeating it can create a second charge.",
      },
    ],
    practiceIds: ["t-11-find-flaw"],
    evidenceCriteria: [
      "Compute 400 ms after 100 ms authentication and 320 ms after 180 ms authentication.",
      "Distinguish idle timeout, operation timeout, and end-to-end deadline.",
      "Explain why timeout is not proof of remote cancellation or non-commit.",
    ],
    transfer: {
      variant:
        "Budget a report-generation workflow across queueing, data retrieval, and file upload, preserving time to report failure clearly.",
      domain: "Document automation",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 11. Budget values are instructional; real limits require latency distributions and caller requirements. Independent technical review is pending.",
    },
  },
  {
    id: 12,
    rev: "2.1",
    objective:
      "Decide whether a failed operation may be retried using failure classification, idempotency guarantees, and remaining budget.",
    prereqIds: [11, 14],
    mentalModel: {
      definition:
        "A retry repeats an operation after an unsuccessful or uncertain attempt. Safe retry policies restrict eligible failures, repeated effects, attempt count, and total elapsed time.",
      analogy:
        "You press a remote-control button again when the first signal may not have arrived.",
      analogyLimits:
        "Some buttons toggle state instead of setting it, so pressing twice can undo the first action. A lost response also does not reveal whether the first action succeeded.",
      correspondence: [
        ["Attempt", "One button press"],
        ["Transient failure", "Brief signal interruption"],
        ["Idempotent effect", "Repeated command leaving the same intended state"],
      ],
    },
    scenario: {
      system: "An order service calls a payment provider.",
      data: "The first charge attempt loses its response. The provider supports a documented idempotency key bound to the request payload and returns the original outcome for repetitions within its retention period.",
      symptom:
        "The client cannot tell whether the payment committed.",
      constraints: [
        "A retry must reuse the same operation key and unchanged payload.",
        "The policy permits at most two total attempts within the caller deadline.",
        "Permanent validation failures must not be retried unchanged.",
      ],
      baseline:
        "Retrying with a fresh key can create a second charge; abandoning the request without reconciliation leaves the payment outcome unknown.",
    },
    representation: {
      kind: "state-machine",
      caption: "Unknown outcome is not the same state as confirmed failure.",
      data: {
        states: [
          { id: "pending", label: "Attempt sent" },
          { id: "unknown", label: "Response lost: outcome unknown" },
          { id: "retry", label: "Repeat same operation key" },
          { id: "resolved", label: "Original outcome recovered" },
          { id: "reconcile", label: "Budget exhausted: reconcile" },
        ],
        transitions: [
          { from: "pending", to: "unknown", label: "Connection lost" },
          { from: "unknown", to: "retry", label: "Contract valid and budget remains" },
          { from: "retry", to: "resolved", label: "Provider returns stored outcome" },
          { from: "unknown", to: "reconcile", label: "No safe retry or no budget" },
          { from: "retry", to: "reconcile", label: "Outcome still unavailable" },
        ],
        now: "unknown",
        history: ["pending", "unknown"],
        budget: { maxAttempts: 2, idempotencyKey: "payment-operation-42" },
      },
      textEquivalent:
        "A lost response creates an unknown outcome. If the provider's idempotency contract applies and budget remains, retry with the same key and payload. Otherwise stop automatic attempts and reconcile the outcome.",
    },
    worked: {
      decision:
        "Make one bounded retry with the original idempotency key if the provider contract and remaining deadline permit; otherwise reconcile without issuing a new payment operation.",
      reasoning: [
        "A lost response is compatible with both non-execution and successful execution.",
        "Confirm the provider's retention period, payload matching, and concurrent-request behavior; a header alone does not establish deduplication.",
        "Reuse the original key because this is the same logical payment, not a new operation.",
        "Count the initial request as attempt one, leaving only one additional attempt under the stated policy.",
        "If a permanent validation error arrives, stop: repetition of the unchanged request does not repair invalid data.",
      ],
    },
    contrast: [
      {
        alternative: "Fail immediately and reconcile asynchronously",
        tradeoff:
          "Avoids extra synchronous load but delays a definitive user-visible outcome.",
        whenNotToUse:
          "Do not use automatic retries when the operation has non-repeatable effects and no reliable deduplication or reconciliation contract.",
      },
    ],
    misconceptions: [
      {
        wrong: "Every HTTP 5xx response is safe to retry.",
        discriminant:
          "Check the endpoint's failure semantics and effect guarantees, not just the status-code family.",
        counterexample:
          "A server commits a charge and then returns 500 while serializing its response; repeating an unprotected charge duplicates the effect.",
      },
    ],
    practiceIds: ["t-12-compare", "t-12-variant"],
    evidenceCriteria: [
      "Classify response loss as an unknown outcome rather than proof of failure.",
      "Preserve the key and payload and count two total attempts correctly.",
      "Reject retries for permanent validation failures and unsupported non-idempotent effects.",
    ],
    transfer: {
      variant:
        "A carrier purchase lost its response and its 12-hour deduplication window has expired. Resolve the original purchase outcome before choosing whether another purchase is justified.",
      domain: "Logistics integration",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 12, with canonical concept 14 as an explicit prerequisite. Provider guarantees are scenario assumptions, not universal API behavior. Independent technical review is pending.",
    },
  },
  {
    id: 13,
    rev: "2.1",
    objective:
      "Calculate capped exponential retry delays, apply full jitter, and reject a retry that cannot fit within the deadline.",
    prereqIds: [11, 12],
    mentalModel: {
      definition:
        "Exponential backoff increases the delay between eligible retry attempts geometrically, usually with a cap. Jitter randomizes those delays to reduce synchronization among clients.",
      analogy:
        "After unanswered knocks, visitors wait progressively longer and choose different moments to knock again.",
      analogyLimits:
        "Waiting does not make an unsafe operation repeatable or guarantee recovery. Visitors also need a final departure time; uncapped attempts can continue indefinitely despite increasing delays.",
      correspondence: [
        ["Backoff ceiling", "Maximum planned wait before the next knock"],
        ["Jitter", "Each visitor choosing a different wait"],
        ["Deadline", "Latest time a visitor can remain"],
      ],
    },
    scenario: {
      system: "A fleet of clients retries a transiently unavailable read-only status API.",
      data: "The teaching policy uses base 100 ms, cap 400 ms, and full jitter U(0, ceiling). Three retry ceilings are 100, 200, and 400 ms.",
      symptom:
        "Fixed retry delays cause clients that failed together to retry together.",
      constraints: [
        "At most four total attempts are allowed, including the initial one.",
        "Every attempt has its own timeout and shares one total deadline.",
        "A documented Retry-After value must be respected when applicable; stop if it cannot fit the deadline.",
      ],
      baseline:
        "Without jitter, clients use identical waits of 100, 200, and 400 ms and remain synchronized after a shared outage.",
    },
    representation: {
      kind: "timeline",
      caption: "Exponential ceilings grow; sampled waits need not grow monotonically.",
      data: {
        unit: "ms",
        events: [
          { label: "Retry 1 wait", ceiling: 100, sampledWait: 80 },
          { label: "Retry 2 wait", ceiling: 200, sampledWait: 30 },
          { label: "Retry 3 wait", ceiling: 400, sampledWait: 250 },
        ],
        formula: "ceiling(k) = min(400, 100 * 2^k), k = 0, 1, 2",
        jitter: "Uniform sample from zero to the current ceiling",
        note: "Illustrative samples exclude attempt duration; jitter reduces synchronization but cannot guarantee no collisions.",
      },
      textEquivalent:
        "The first, second, and third retry ceilings are 100, 200, and 400 ms. One client samples waits of 80, 30, and 250 ms. The second sampled wait is shorter despite its larger ceiling. Actual start times also include prior attempt durations.",
    },
    worked: {
      decision:
        "Use capped exponential ceilings with full jitter, a four-attempt maximum, and a deadline check before each wait and attempt.",
      reasoning: [
        "Index the first retry at k = 0: min(400, 100 × 2^0) gives a 100 ms ceiling.",
        "The next ceilings are 200 and 400 ms; the cap prevents further ceiling growth.",
        "Sample independently within each ceiling so clients do not all follow an identical schedule.",
        "With 180 ms remaining, a proposed 150 ms wait plus a required 100 ms attempt allowance does not fit; stop rather than starting an over-budget attempt.",
        "A server-directed delay can override the local schedule under the API contract, but it cannot extend the caller's deadline.",
      ],
    },
    contrast: [
      {
        alternative: "Fixed-delay retries",
        tradeoff:
          "Easy to reason about for isolated clients, but correlated failures can produce repeated synchronized load.",
        whenNotToUse:
          "Do not use identical fixed delays across a large fleet recovering from a shared failure.",
      },
    ],
    misconceptions: [
      {
        wrong: "With exponential backoff, every actual wait must be longer than the previous wait.",
        discriminant:
          "Distinguish the deterministic ceiling from the randomized wait sampled below it.",
        counterexample:
          "Full jitter can sample 80 ms from a 100 ms ceiling and then 30 ms from a 200 ms ceiling.",
      },
    ],
    practiceIds: ["t-13-predict", "t-13-variant"],
    evidenceCriteria: [
      "Derive ceilings of 100, 200, and 400 ms with an explicit retry index.",
      "Explain why sampled waits can decrease and why jitter does not guarantee collision-free retries.",
      "Reject a 150 ms wait plus 100 ms attempt allowance when only 180 ms remains.",
      "Preserve retry eligibility, attempt limits, and server-directed delay rules.",
    ],
    transfer: {
      variant:
        "A classroom device has battery allowance for one more reconnect, but only 180 ms remain. Decide whether a sampled 150 ms wait and required 100 ms attempt allowance are admissible under a 400 ms backoff ceiling.",
      domain: "Connected-device fleet management",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 13. Timing values and random samples are teaching examples, not fleet configuration defaults. Independent technical review is pending.",
    },
  },
// Lição 14 — Idempotency (F9, pacote s14; conteúdo do subagente, integração do agente principal).
  {
  id: 14,
  rev: "3.0",
  objective: "Design and trace a payment mutation so that a retry after an ambiguous response returns the original outcome rather than creating another charge.",
  prereqIds: [11, 12],
  mentalModel: {
    definition: "Idempotency means that repeating an operation with the same defined identity and input has the same intended effect as performing it once. For APIs, a server commonly binds a client-supplied idempotency key to a request fingerprint and a stored outcome for a bounded retention period. It is not a guarantee that every repeated request is harmless.",
    analogy: "A coat-check ticket identifies one deposited coat: presenting the same ticket again retrieves the same claim rather than depositing a second coat.",
    analogyLimits: "The ticket analogy hides concurrency, durable storage, request fingerprints, partial failure, and expiry. Real APIs must define which requests share a key, how conflicting payloads behave, what outcome is replayed, and how long the record survives. A key cannot make an external payment provider or downstream side effect exactly-once by itself.",
    correspondence: [["Idempotency key", "Coat-check ticket"], ["Stored request fingerprint and outcome", "The coat assigned to that ticket and its claim record"], ["Retry with same key", "Presenting the same ticket again"], ["Retention window", "How long the claim record remains available"]],
  },
  scenario: {
    system: "A checkout API creates a payment through a payment provider and records the resulting payment against an order.",
    data: "Client request POST /payments carries key pay-7f2 and payload {orderId: 482, amount: 64.20, currency: USD}. The server stores a fingerprint and outcome for 24 hours. A repeated key with the same fingerprint replays the outcome; a different fingerprint is rejected. The provider supports its own idempotency key.",
    symptom: "The provider commits the charge, but the response is lost. The caller sees a timeout and cannot tell whether the payment happened.",
    constraints: ["The caller may retry after a network timeout.", "The application database and payment provider do not share one atomic transaction.", "The 24-hour retention is a stated policy, not a universal safe duration.", "Order status reads are not mutations and can return newer data on a later request."],
    baseline: "Without a stable request identity and durable outcome record, retrying the POST can create a second charge; refusing every retry can leave a successfully charged order appearing unresolved.",
  },
  representation: {
    kind: "event-track",
    caption: "Compare the first commit, lost response, and retry: the retry must resolve to the same payment, while a changed payload conflicts.",
    data: {
      unit: "ms after first request",
      lanes: [{ id: "client", label: "Checkout client", kind: "actor" }, { id: "api", label: "Payment API", kind: "actor" }, { id: "provider", label: "Payment provider", kind: "actor" }],
      events: [
        { ts: 0, lane: "client", label: "POST key pay-7f2, fingerprint F", kind: "info" },
        { ts: 20, lane: "api", label: "Persist key + fingerprint; start payment", kind: "info" },
        { ts: 80, lane: "provider", label: "Charge P-901 committed", kind: "success" },
        { ts: 100, lane: "client", label: "Response lost; outcome unknown", kind: "warn" },
        { ts: 500, lane: "client", label: "Retry same key + fingerprint F", kind: "info" },
        { ts: 520, lane: "api", label: "Replay stored outcome for P-901", kind: "success" },
        { ts: 900, lane: "client", label: "Same key, changed amount: 70.00", kind: "warn" },
        { ts: 920, lane: "api", label: "Reject fingerprint conflict; no second charge", kind: "fail" },
      ],
      window: { from: 0, to: 920 },
      note: "Illustrative sequence. Durable ordering and provider behavior must be implemented and verified for the actual system.",
    },
    textEquivalent: "At 0 ms the client sends key pay-7f2 with fingerprint F. The provider commits payment P-901 at 80 ms, but the response is lost. A retry with the same key and fingerprint replays P-901; it does not charge again. Reusing the key for amount 70.00 is rejected as a fingerprint conflict. The timeline is illustrative, not proof of atomicity.",
  },
  worked: {
    decision: "Retry the payment POST only with the original key and identical semantic payload, and make the provider call using a stable corresponding key; reject key reuse with a different payload.",
    reasoning: [
      "The timeout bounds the caller's wait; it does not establish whether the provider committed the charge.",
      "A fresh key would describe a new logical operation and could create another payment.",
      "The server must durably associate the original key, a canonical request fingerprint, and an outcome or in-progress state before permitting a retry to start another effect.",
      "If the same key arrives concurrently, coordination must prevent both requests from initiating an independent charge; a later request can wait, replay, or receive a documented in-progress response.",
      "A different fingerprint under the same key is a conflict, not a cache hit: silently replaying would conceal a changed user intent.",
      "The API's retention must cover realistic retry/reconciliation delays. After expiry, the old key may no longer protect against duplication, so the client must reconcile payment state rather than assume it is safe to resend.",
      "A status GET may be repeated but can return changed information over time; idempotent mutation semantics do not mean every read has an invariant response.",
    ],
  },
  contrast: [{ alternative: "Use a natural business key such as orderId as the unique payment identity", tradeoff: "A database uniqueness constraint can be simple and durable for a strictly one-payment-per-order rule, but it cannot represent legitimate multiple attempts or partial captures without a richer domain identity. An explicit idempotency key separates one client-intended operation from later operations.", whenNotToUse: "Do not add a client key as a substitute for an existing authoritative uniqueness invariant when the domain truly permits only one payment per order; enforce that invariant transactionally and define how legitimate retries map to it." }],
  misconceptions: [
    { wrong: "A timeout means the payment did not happen, so a new request is safe.", discriminant: "Ask what evidence distinguishes caller timeout from provider commit state.", counterexample: "The provider commits P-901 and its response is lost. A request with a new key can commit P-902 and charge the same order again." },
    { wrong: "An idempotency key makes all requests with that key equivalent forever.", discriminant: "Compare payload fingerprint, operation type, concurrency, and retention policy.", counterexample: "The same key is reused with amount 70.00 instead of 64.20, or retried after the 24-hour record expired; neither case should be silently treated as the original safe replay." },
  ],
  practiceIds: ["t-14-predict", "t-14-choose-info"],
  evidenceCriteria: ["Trace an ambiguous timeout through provider commit and same-key replay without inventing a second effect.", "Explain why same-key/different-payload is a conflict and why key expiry weakens deduplication.", "Distinguish repeatable mutation behavior from a read whose returned state can change."],
  transfer: { variant: "A ticket-booking client loses the response after reserving a seat. Define a stable operation identity, conflict behavior, expiry policy, and reconciliation path before retrying.", domain: "Ticket booking" },
  provenance: { reviewed: false, notes: "Drafted in this round from the canonical concept and lesson contract; no effective independent technical or editorial review has occurred." },
},
];
