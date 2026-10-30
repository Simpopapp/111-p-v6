import type { Task } from "@/lib/exercises";

// Tarefas de prática âncora de Resilience (PRD project2 D8 / pacote s3-exercicios).
// Tarefas de Idempotency (F9, pacote s14; conteúdo do subagente).
const TASKS_14_IDEMPOTENCY: Task[] = [
  {
    id: "t-14-predict", conceptId: 14, type: "predict",
    prompt: "Predict the safe server response for each retry. Choose every statement supported by the stated policy.",
    context: "The provider committed payment P-901 for key K and fingerprint F, but the response was lost. The server retains key records for 24 hours, replays the stored outcome for the same fingerprint, and rejects a different fingerprint.",
    options: [
      { key: "same", label: "K + F retried within 24 hours returns the stored outcome for P-901 without starting another charge." },
      { key: "changed", label: "K reused with a changed amount is rejected as a fingerprint conflict." },
      { key: "expired", label: "After the record expires, K is still guaranteed to identify P-901 forever." },
      { key: "fresh", label: "A retry with a fresh key is equivalent to retrying K because the payload matches." },
    ],
    rubric: {
      criteria: [
        { key: "choice-same", label: "Same fingerprint replays outcome", cause: "Conflating a retry of one logical operation with a new payment can duplicate the external effect.", check: (a) => a.picked?.includes("same") === true },
        { key: "choice-changed", label: "Changed fingerprint conflicts", cause: "Treating a reused key as a cache hit can hide changed user intent.", check: (a) => a.picked?.includes("changed") === true },
        { key: "choice-expired", label: "Expiry removes the stated guarantee", cause: "Assuming permanent deduplication ignores the finite retention window.", check: (a) => a.picked?.includes("expired") === false },
        { key: "choice-fresh", label: "Fresh key is a new operation identity", cause: "Equating matching payloads with matching operation identity can authorize another charge.", check: (a) => a.picked?.includes("fresh") === false },
      ],
      expected: "Select same and changed only. The same key and fingerprint within retention replay P-901; a different fingerprint conflicts. The contract says nothing protects a key after expiry, and a fresh key denotes a distinct operation even when its payload happens to match. After expiry, reconcile the payment before deciding whether to create a new operation.",
      nextStep: "Trace who committed the side effect, what key/fingerprint the server retained, and whether that retention is still active.",
    },
    helpLevels: ["Focus on what the policy promises within its stated retention period.", "Compare operation identity (key), request identity (fingerprint), and the explicit expiry boundary.", "Same K + F replays P-901; K + changed fingerprint conflicts; expiry removes the guarantee; a fresh key may create a new charge."],
  },
  {
    id: "t-14-choose-info", conceptId: 14, type: "choose-info",
    prompt: "A checkout times out after sending a payment request. Before deciding whether to retry, choose the information and controls needed to avoid a duplicate charge.",
    context: "The payment provider may have committed even though the client received no response. The current idempotency record might be close to expiry.",
    options: [
      { key: "identity", label: "The original operation key and canonical request fingerprint, including whether the retry payload is identical." },
      { key: "outcome", label: "A provider/payment status lookup or reconciliation result for the original operation." },
      { key: "retention", label: "The server/provider retention state and whether the original key is still covered." },
      { key: "read-cache", label: "Whether the checkout page cached its last GET response; assume that proves no payment occurred." },
    ],
    rubric: {
      criteria: [
        { key: "choice-identity", label: "Preserve original operation identity", cause: "Using a new identity for an ambiguous retry can turn one intended payment into two.", check: (a) => a.picked?.includes("identity") === true },
        { key: "choice-outcome", label: "Reconcile ambiguous provider outcome", cause: "A client timeout is not evidence that the remote mutation failed to commit.", check: (a) => a.picked?.includes("outcome") === true },
        { key: "choice-retention", label: "Check the deduplication window", cause: "Retrying after the record expires assumes protection that the contract no longer provides.", check: (a) => a.picked?.includes("retention") === true },
        { key: "choice-read-cache", label: "Do not infer mutation outcome from cached read", cause: "A possibly stale read cache cannot establish whether the payment provider committed.", check: (a) => a.picked?.includes("read-cache") === false },
      ],
      expected: "Select identity, outcome, and retention. Reuse the original key only with the original semantic payload, and establish whether the payment already exists and whether deduplication is still active. A cached GET is neither authoritative evidence of non-commit nor a guarantee about a mutation; reads may be repeated while their returned state changes. If retention has expired and outcome remains ambiguous, reconcile before creating a new operation.",
      nextStep: "State the evidence that resolves remote outcome uncertainty before proposing a retry.",
    },
    helpLevels: ["Separate what the caller observed (timeout) from what the provider may have done.", "Look for operation identity, remote outcome evidence, and the time-bounded deduplication contract; a cached read is not proof of non-commit.", "Select identity, outcome, and retention. Reconcile the original operation; do not blindly send a fresh key after expiry."],
  },
];

export const TASKS_RESILIENCE: Task[] = [
  {
    id: "t-10-predict",
    conceptId: 10,
    type: "predict",
    prompt:
      "Before sending the next requests, predict the downstream attempt count while the breaker is open and at its first recovery check. Choose one.",
    context:
      "A recommendation API has tripped its circuit breaker. The breaker remains open from t=0 until t=10 seconds. During that interval, 40 requests arrive and receive a local fallback. At t=10, three requests arrive together. This breaker's half-open policy admits exactly one probe and immediately gives fallback to other arrivals while that probe is pending. The probe has not completed yet.",
    options: [
      { key: "a", label: "0 downstream attempts before t=10; 1 at t=10." },
      { key: "b", label: "40 downstream attempts before t=10; 1 at t=10." },
      { key: "c", label: "0 downstream attempts before t=10; 3 at t=10." },
      { key: "d", label: "40 downstream attempts before t=10; 3 at t=10." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-breaker",
          label: "Suppress open-state calls and bound half-open probes.",
          cause:
            "The prediction treats fallback as something produced only after another failed call, or treats the recovery boundary as permission to release all traffic before a probe succeeds.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "a",
        },
      ],
      expected:
        "The open breaker makes no downstream attempts for the 40 arrivals. At t=10 it permits one recovery probe, not all three requests. The other two receive fallback. A completed successful probe can inform a later transition back to normal traffic.",
      nextStep:
        "Trace the next state for a successful probe and for a failed probe, using an explicit reopen delay.",
    },
    helpLevels: [
      "Count outbound network attempts separately from requests receiving a response.",
      "An open breaker can return a local fallback without occupying a downstream connection.",
      "At the recovery boundary, apply the stated one-probe rule before considering whether normal traffic can resume.",
    ],
  },
  {
    id: "t-11-find-flaw",
    conceptId: 11,
    type: "find-flaw",
    prompt:
      "Which proposed fix addresses both the unbounded wait and the mistaken conclusion about the write? Choose one.",
    context:
      "An inventory client uses Promise.race between an HTTP write and a 500 ms timer. When the timer wins, it reports 'the write failed' but leaves the HTTP operation running. Requests accumulate in the connection pool. The server may have committed a write before its reply was delayed, and the client has an operation ID for checking status.",
    options: [
      { key: "a", label: "Keep the race and raise the connection-pool limit; retain the failure message." },
      {
        key: "b",
        label:
          "Apply the deadline through transport cancellation and resource cleanup; report an unknown outcome and query status by operation ID.",
      },
      {
        key: "c",
        label: "Apply transport cancellation and resource cleanup; report that the server rolled back the write.",
      },
      { key: "d", label: "Keep the HTTP operation running and query status immediately after displaying the timer message." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-deadline",
          label: "Release client resources without claiming remote rollback.",
          cause:
            "The fix confuses stopping the caller's wait with cancelling underlying I/O, or confuses a missing response with proof that a remote write did not commit.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "A timer race alone does not stop the losing HTTP operation. Propagate a deadline to a transport that supports cancellation and cleanup. Even then, client cancellation cannot prove remote rollback: the write outcome may be unknown and should be reconciled using its operation ID.",
      nextStep:
        "Test a server that commits immediately but delays its reply, then verify client cleanup and status reconciliation.",
    },
    helpLevels: [
      "Separate the caller's wait, the client's network resources, and the server's write.",
      "Winning a timer race does not by itself terminate the HTTP operation that lost.",
      "A released client connection still cannot reveal whether the server committed before cancellation arrived.",
    ],
  },
  {
    id: "t-12-compare",
    conceptId: 12,
    type: "compare",
    prompt:
      "Compare the two bounded retry policies and choose one. Both are defensible here; feedback will explain what each gives up.",
    context:
      "A read-only catalog GET sometimes receives a documented transient 503 after 100 ms. The caller has 1,500 ms left. Policy A makes at most one retry after a randomized 100–200 ms delay; that attempt has a 400 ms timeout. Policy B makes at most two retries after randomized delays of 100–200 ms and 200–400 ms; each attempt has a 400 ms timeout. Both enforce the caller's remaining deadline, and load testing shows spare capacity for either policy.",
    options: [
      { key: "a", label: "Deploy policy A." },
      { key: "b", label: "Deploy policy B." },
      { key: "c", label: "Retry every 503 immediately until the caller's deadline expires." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-retry",
          label: "Choose a bounded, paced retry policy for a safe transient failure.",
          cause:
            "The policy uses a time deadline as its only retry bound and removes pacing, allowing a fast-failing dependency to receive a burst of repeated attempts.",
          check: (a) =>
            a.picked?.length === 1 && (a.picked[0] === "a" || a.picked[0] === "b"),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "One retry limits added downstream work and waiting time, but gives a transient fault fewer chances to clear.",
        },
        {
          picks: ["b"],
          tradeoff:
            "Two retries provide another recovery opportunity within the stated remaining budget, but can consume more latency and downstream capacity. Spare capacity must be rechecked during incidents.",
        },
      ],
      expected:
        "Both A and B retry a read-only operation after a documented transient failure, cap attempts, add randomized delays, and honor the overall deadline. A favors lower amplification; B favors another recovery opportunity. Immediate deadline-only retries can amplify an outage.",
      nextStep:
        "Remove the spare-capacity assumption and compare each policy's worst-case downstream attempts per incoming request.",
    },
    helpLevels: [
      "Check operation safety, failure classification, and retry bounds separately.",
      "Both named policies have an attempt cap and pacing; their main difference is additional work versus another chance to recover.",
      "A caller deadline limits elapsed time but does not prevent many rapid attempts when failures return immediately.",
    ],
  },
  {
    id: "t-13-predict",
    conceptId: 13,
    type: "predict",
    prompt:
      "Before running the outage simulation, predict which schedule is less likely to create synchronized retry waves. Choose one.",
    context:
      "Two thousand sensor gateways fail at the same instant. Schedule A waits exactly 1, 2, and 4 seconds between successive retries. Schedule B independently samples each gateway's waits from 0–1, 0–2, and 0–4 seconds respectively. Both allow only three retries, use the same overall deadline, and make no further attempts after it expires. Ignore timer quantization.",
    options: [
      { key: "a", label: "Schedule A is less likely to create synchronized waves." },
      { key: "b", label: "Schedule B is less likely to create synchronized waves." },
      { key: "c", label: "Both schedules produce the same retry timing distribution." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-jitter",
          label: "Distinguish growing delays from independent desynchronization.",
          cause:
            "The prediction assumes exponential delay growth alone separates clients that failed together, or assumes matching retry caps imply matching arrival patterns.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "A keeps identical clients aligned, with retry waves at approximately t=1, t=3, and t=7. B spreads attempts through independently randomized, growing windows. Jitter reduces synchronization but does not guarantee a maximum instantaneous rate or eliminate the need for attempt and deadline limits.",
      nextStep:
        "Plot attempts per 100 ms bin for both schedules, then add a server-side admission limit to bound accepted work.",
    },
    helpLevels: [
      "All gateways share the same starting instant; compare whether they also share the same subsequent waits.",
      "Increasing a delay changes when a wave happens, but identical delays can preserve the wave.",
      "Independent random samples spread retry times even when every client uses the same growing upper bounds.",
    ],
  },
  {
    id: "t-12-variant", conceptId: 12, type: "variant",
    prompt: "Choose the next action supported by this carrier contract.",
    context: "A shipping-label purchase lost its response yesterday. The carrier deduplicates the same operation key and payload for 12 hours only; that window has expired. A status lookup by the original operation identifier is available. Buying another label can incur another non-refundable charge.",
    options: [
      { key: "a", label: "Reconcile the original operation through status lookup before authorizing another purchase." },
      { key: "b", label: "Retry the old key now; it still guarantees no second charge after expiry." },
      { key: "c", label: "Send a fresh key because a lost response proves the purchase failed." },
    ],
    rubric: {
      criteria: [{
        key: "choice-reconcile",
        label: "Resolve the unknown outcome without assuming expired deduplication.",
        cause: "The choice treats response loss as proof of non-commit or extends a time-bounded deduplication guarantee beyond its stated window.",
        check: (a) => a.picked?.length === 1 && a.picked[0] === "a",
      }],
      expected: "Choose A. The original purchase may have committed. Neither an expired key nor a fresh key protects this request under the stated contract. Query the original operation; if status remains inconclusive, keep the outcome unresolved rather than silently authorizing another purchase.",
      nextStep: "List the evidence needed to distinguish an existing label from a confirmed non-purchase before deciding whether a new purchase is justified.",
    },
    helpLevels: [
      "Separate missing response evidence from the carrier's actual purchase outcome.",
      "Compare elapsed time with the explicit deduplication window.",
      "Choose A: reconcile the original operation. The 12-hour guarantee has expired, and a fresh key may create another charge.",
    ],
  },
  {
    id: "t-13-variant", conceptId: 13, type: "variant",
    prompt: "Choose whether the proposed reconnect attempt is admissible.",
    context: "A battery-powered classroom device reconnects after a campus outage. One additional attempt is allowed by its battery budget. Its next capped backoff ceiling is 400 ms, and full jitter has sampled a 150 ms wait. Only 180 ms remain in the reconnect deadline; this policy requires reserving a full 100 ms attempt allowance before starting. There is no server-directed delay.",
    options: [
      { key: "a", label: "Stop this reconnect cycle and report that its deadline budget cannot admit the proposed attempt." },
      { key: "b", label: "Wait 150 ms and start the 100 ms attempt because the battery permits one more attempt." },
      { key: "c", label: "Use the 400 ms ceiling as the actual wait and then attempt." },
    ],
    rubric: {
      criteria: [{
        key: "choice-budget",
        label: "Require both battery eligibility and enough time for wait plus attempt.",
        cause: "The choice treats a remaining attempt allowance as sufficient, ignores the total deadline, or confuses the backoff ceiling with the sampled wait.",
        check: (a) => a.picked?.length === 1 && a.picked[0] === "a",
      }],
      expected: "Choose A. The proposed wait plus reserved attempt requires 150 + 100 = 250 ms, exceeding the 180 ms remaining. Battery eligibility is necessary but not sufficient. The 400 ms ceiling is not the sampled wait, and jitter cannot extend a deadline.",
      nextStep: "Reassess the same proposed wait with 300 ms remaining, then explain which independent constraint would still prevent a retry if its battery allowance were exhausted.",
    },
    helpLevels: [
      "Check the independent resource and time constraints separately.",
      "Add the sampled wait to the required attempt allowance, not to the ceiling.",
      "Choose A: 250 ms does not fit in 180 ms, even though the battery permits one more attempt.",
    ],
  },
  ...TASKS_14_IDEMPOTENCY,
];
