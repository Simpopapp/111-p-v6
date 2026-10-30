import type { Task } from "@/lib/exercises";

export const TASKS_SCALING: Task[] = [
  {
    id: "t-45-predict", conceptId: 45, type: "predict",
    prompt: "Predict the first useful scale-out response and backlog at that instant. Choose one.",
    context: "Two ready search replicas serve 100 requests/s each. At t=0 demand steps to 360/s and stays there. A trailing-window alarm fires at t=30 s and requests two replicas. Provisioning takes 45 s AFTER the alarm, then readiness takes 15 s. The database supports 500/s. Ignore service time, rejection, expiry and failures; no further scaling action occurs.",
    options: [
      { key: "a", label: "At 30 s; backlog 4,800 requests." },
      { key: "b", label: "At 75 s; backlog 12,000 requests." },
      { key: "c", label: "At 90 s; backlog 14,400 requests." },
      { key: "d", label: "At 90 s; backlog zero because capacity becomes 400/s." },
    ],
    rubric: {
      criteria: [
        { key: "timing", label: "Wait for measurement, provisioning and readiness.", cause: "The chosen result may count an alarm or a provisioned replica as ready service. Add all three delays before routing work.", check: a => a.picked?.length === 1 && (a.picked[0] === "c" || a.picked[0] === "d") },
        { key: "accumulation", label: "Preserve waiting work accumulated before useful capacity arrives.", cause: "New capacity does not erase earlier work. The deficit is 360 - 200 requests/s for 90 seconds, then only 40/s is spare.", check: a => a.picked?.length === 1 && a.picked[0] === "c" },
      ],
      expected: "Choose c: 30 + 45 + 15 = 90 s; (360 - 200) × 90 = 14,400 waiting requests. Capacity then becomes min(400, 500) = 400/s and drains at 40/s. Under continued demand it needs another 360 s, not an instant reset.",
      nextStep: "Compare scheduling readiness before a known launch with the worker variant's unexpected arrival and provider cap.",
    },
    helpLevels: ["Identify the event that permits routing to a new replica; distinguish it from the alarm.", "Add detection, provisioning and readiness delays. Multiply the pre-readiness demand-capacity deficit by that total.", "Choose c: first useful service at 90 s, backlog 160 × 90 = 14,400. Only 40/s spare capacity remains afterward."],
  },
  {
    id: "t-45-variant", conceptId: 45, type: "variant",
    prompt: "Choose one complete policy for unexpected document arrivals while preserving the provider cap.",
    context: "A background document queue has unpredictable bursts and low CPU while waiting for OCR. The external provider permits at most eight concurrent calls across ALL workers. Each worker performs one call at a time; jobs are safely retryable and queued durably. Two workers stay warm; each new worker needs 60 s to warm. Jobs may wait up to five minutes; intake can defer excess work. A load test supports adding two workers per evaluation, with no repeated action while those workers start. Provider capacity cannot be raised this week.",
    options: [
      { key: "a", label: "Track oldest waiting age and backlog; min 2, max 8, step +2 after reevaluation; globally cap OCR concurrency at 8 and defer intake before the waiting budget is exhausted." },
      { key: "b", label: "Track worker CPU only; min 2, max 8, step +2; globally cap OCR concurrency at 8 and defer intake near the waiting limit." },
      { key: "c", label: "Track oldest waiting age and backlog; min 2, max 16, step +2; allow every worker its own eight-call allowance and defer intake near the waiting limit." },
      { key: "d", label: "Track oldest waiting age and backlog; min 2, max 8, step +2 with a global eight-call cap; accept all intake because queued jobs will eventually finish." },
    ],
    rubric: {
      criteria: [
        { key: "signal", label: "Observe waiting demand rather than treating low CPU as spare end-to-end capacity.", cause: "CPU alone can remain low while workers wait on OCR. Waiting age and backlog expose demand and the five-minute budget.", check: a => a.picked?.length === 1 && (a.picked[0] === "a" || a.picked[0] === "c" || a.picked[0] === "d") },
        { key: "boundary", label: "Keep the provider allowance global and retain bounded intake under sustained overload.", cause: "A per-worker allowance multiplies the provider load; an unbounded queue can exceed the five-minute budget even with eight workers. Scaling and admission solve different problems.", check: a => a.picked?.length === 1 && (a.picked[0] === "a" || a.picked[0] === "b") },
      ],
      expected: "Choose a. Waiting age and backlog reveal I/O-bound pressure. Min 2 avoids a fully cold start; max 8 and tested +2 steps respect one-call-per-worker capacity, with a global eight-call cap. The 60 s startup still consumes waiting budget. Defer excess intake before five minutes; no replica policy guarantees that budget under arbitrary arrivals. Stabilize and drain before scale-in.",
      nextStep: "Recalculate if each worker may run two calls concurrently: a global eight-call cap still applies, but eight workers may no longer be a justified maximum.",
    },
    helpLevels: ["Which observation reveals queued demand when worker CPU is low? Identify whether the provider limit applies per worker or to the whole system.", "Startup consumes part of the waiting budget. Extra workers cannot raise the fixed provider allowance; sustained excess intake needs its own control.", "Choose a: waiting age/backlog, min 2, max 8, tested +2 steps, global concurrency 8 and bounded intake. Low CPU and unlimited queuing do not establish safe spare capacity."],
  },
{
    id: "t-46-predict",
    conceptId: 46,
    type: "predict",
    prompt: "Select exactly two supported predictions: one about the next authenticated request and one about the proposed scale-out.",
    context: "Shop replica A stores session S only in memory. B has compatible code but no S. After login on A, the balancer deliberately sends the next request to B; missing sessions are treated as logged out. The operator proposes adding C and D without moving state. The database already sustains its measured ceiling of 150 requests/s. Assume all replicas are ready and healthy.",
    options: [
      {
        key: "b-missing",
        label: "B treats this request as logged out because it cannot resolve S, even if it has spare CPU.",
      },
      {
        key: "b-copy",
        label: "B resolves S from A automatically because both replicas run compatible code.",
      },
      {
        key: "state-first",
        label: "C and D do not repair S's location or raise the stated database ceiling; state placement and the shared bottleneck need separate treatment.",
      },
      {
        key: "affinity-recovery",
        label: "Routing S back to A would also preserve S if A disappeared.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "session-path",
          label: "Predicts the specified request from the actual location of S.",
          cause: "You may be treating compatible code as replicated runtime data. Trace where B would read S; the scenario supplies no state-sharing mechanism.",
          check: (a) =>
            !!a.picked?.includes("b-missing") &&
            !a.picked?.includes("b-copy"),
        },
        {
          key: "capacity-bound",
          label: "Separates added processes from continuation and dependency capacity.",
          cause: "You may be counting replicas as useful capacity without checking state access or the database ceiling. Trace S and then identify the shared limiting resource.",
          check: (a) =>
            !!a.picked?.includes("state-first") &&
            !a.picked?.includes("affinity-recovery"),
        },
      ],
      expected: "Choose b-missing and state-first. B receives the cookie but lacks S, so the specified request is treated as logged out. More ready replicas do not copy A's memory. A shared session store with explicit durability can remove that continuation dependency; it does not lift the database's 150 requests/s limit. Affinity may hide the missing-state problem while A lives, but cannot recover its memory after A is lost.",
      nextStep: "Repeat the trace after deleting A: identify the surviving authoritative copy of S, then check the database limit separately from replica count.",
    },
    helpLevels: [
      "Trace one request rather than total traffic: which process receives it, and where would that process look for the session?",
      "Compatible code does not copy memory. Also distinguish a routing workaround while A lives from recovery after A is gone.",
      "Choose b-missing and state-first: B lacks S, and C/D repair neither session placement nor the shared database ceiling.",
    ],
  },
  {
    id: "t-46-variant",
    conceptId: 46,
    type: "variant",
    prompt: "Select exactly two changes needed to meet the acknowledged-result survival and two-minute restart budget.",
    context: "A photo service has durable queued jobs, stable job IDs and shared input objects. Each transform lasts twenty minutes. Workers may disappear without warning. The current worker acknowledges on dequeue and keeps both intermediate progress and final output only on local disk. Lost unacknowledged jobs can be redelivered. Completed results must survive worker loss, and recovery must redo at most two minutes of processing. Assume the shared store can meet the chosen checkpoint and durability policy; redelivery can still occur.",
    options: [
      {
        key: "checkpoint",
        label: "Persist recoverable processing checkpoints and their metadata outside the worker at intervals that bound lost work to two minutes.",
      },
      {
        key: "commit-ack",
        label: "Publish durable output under the stable job identity before acknowledging; make repeated publication safe if the worker dies before the acknowledgement.",
      },
      {
        key: "early-ack",
        label: "Retain acknowledgement on dequeue and use the queue's persistence to recover the job after worker loss.",
      },
      {
        key: "local-restart",
        label: "Keep all intermediate state local and restart the full twenty-minute transformation when the worker disappears.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "restart-budget",
          label: "Places recoverable progress outside the worker to satisfy the restart budget.",
          cause: "You may be confusing durable input with durable progress. Input permits a full restart, but a twenty-minute restart violates the stated two-minute lost-work budget.",
          check: (a) =>
            !!a.picked?.includes("checkpoint") &&
            !a.picked?.includes("local-restart"),
        },
        {
          key: "durable-completion",
          label: "Acknowledges only after durable publication and handles the duplicate window.",
          cause: "You may be treating queue persistence as protection after acknowledgement, or treating publication followed by acknowledgement as atomic. A crash can lose early-acknowledged work or redeliver already-published work.",
          check: (a) =>
            !!a.picked?.includes("commit-ack") &&
            !a.picked?.includes("early-ack"),
        },
      ],
      expected: "Choose checkpoint and commit-ack. Shared input and durable queue entries do not retain local processing progress. The two-minute budget requires externally recoverable checkpoints, with a persistence protocol and frequency that actually bound lost work. Publish the durable result before acknowledging so worker loss cannot leave an acknowledged job with no result. A crash after publication but before acknowledgement can redeliver the job, so stable identity and retry-safe publication remain necessary. If full recomputation were acceptable, local intermediate scratch could instead be disposable.",
      nextStep: "Trace three crashes: before a checkpoint, after durable output but before acknowledgement, and after acknowledgement. State what survives and what may repeat in each case.",
    },
    helpLevels: [
      "Separate the promises: recovering a job, recovering its progress, and retaining its completed result are different requirements.",
      "An acknowledgement removes the queue's obligation to redeliver that job. Ask which local losses violate the two-minute budget and what happens between output publication and acknowledgement.",
      "Choose checkpoint and commit-ack. Recover progress outside the worker, publish durable output before acknowledgement, and make repeated publication safe across the crash window.",
    ],
  }
];