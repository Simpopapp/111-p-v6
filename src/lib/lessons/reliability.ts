import type { Lesson } from "./types";

export const LESSONS_RELIABILITY: Lesson[] = [{
  id: 56,
  rev: "3.1",
  prereqIds: [],
  objective:
    "Predict when a replica stops receiving new requests, distinguish restart from routing decisions, and bound what a green probe proves.",
  mentalModel: {
    definition:
      "A health check is a bounded observation supporting a specific action. Liveness asks whether restarting this process may recover local progress; readiness asks whether this replica can serve its assigned traffic. Neither proves end-to-end correctness.",
    analogy:
      "A restaurant can keep its kitchen open while its host temporarily stops seating new guests.",
    analogyLimits:
      "Software observations are sampled and can be stale. A successful check covers only its tested path; stopping new arrivals does not cancel work already admitted.",
    correspondence: [
      ["Liveness decision", "Whether to reopen a stuck kitchen"],
      ["Readiness decision", "Whether to seat new guests"],
      ["Probe interval", "Time between the host's inspections"],
    ],
  },
  scenario: {
    system:
      "Two replicas serve the Academy's lesson-save endpoint behind a router.",
    data:
      "Each save requires a durable local journal before database upload. Replica A's journal fills at t=1s; B retains space. Readiness samples complete at t=0,5,10s; two consecutive failures withdraw A, with routing propagation taking 1s.",
    symptom:
      "A returns save failures while its process-only /healthz still returns 200.",
    constraints: [
      "A's event loop remains responsive; restarting cannot free its persistent journal.",
      "Readiness must test capacity to accept a journal write, using a cheap bounded check, not a destructive write on every probe.",
      "The teaching trace assumes successful probe delivery and exactly 1s propagation; real detection timing varies.",
      "Withdrawal affects new requests only; admitted requests need their own timeout and error handling.",
    ],
    baseline:
      "A process-only probe stays green and leaves A eligible despite its inability to accept saves.",
  },
  representation: {
    kind: "event-track",
    caption:
      "Compare the failure time with the last readiness sample and the router's later withdrawal.",
    data: {
      unit: "s",
      window: { from: 0, to: 11 },
      lanes: [
        { id: "app", label: "Replica A", kind: "actor" },
        { id: "probe", label: "Readiness samples", kind: "signal" },
        { id: "router", label: "Router eligibility", kind: "actor" },
      ],
      events: [
        {
          ts: 0, lane: "probe",
          label: "Pass; failure streak 0", kind: "success",
        },
        {
          ts: 1, lane: "app",
          label: "Journal full; saves fail, process responsive", kind: "fail",
        },
        {
          ts: 5, lane: "probe",
          label: "Failure 1 of 2; still eligible", kind: "warn",
        },
        {
          ts: 10, lane: "probe",
          label: "Failure 2 of 2; withdraw requested", kind: "fail",
        },
        {
          ts: 11, lane: "router",
          label: "A excluded from new routing; B remains", kind: "info",
        },
      ],
      note:
        "Fixed teaching example, not a live execution. Liveness continues to pass. No automatic recovery timeline is assumed.",
    },
    textEquivalent:
      "At 0s readiness passes. At 1s A's journal fills. At 5s its first failed sample does not withdraw it. At 10s the second failure requests withdrawal. At 11s the router excludes A from new requests. A remains live throughout; already admitted requests are not rescued.",
  },
  worked: {
    decision:
      "Keep A live, fail readiness for saves, and route new requests away after the configured detection window; repair journal capacity before readmission.",
    reasoning: [
      "The required journal cannot accept saves, so process responsiveness is insufficient readiness evidence.",
      "At t=6s only one failed sample has completed: A is still eligible and failures remain possible.",
      "The second failure occurs at t=10s; propagation completes at t=11s, ten seconds after the fault.",
      "Restarting cannot repair persistent capacity. After repair, verify the actual acceptance path and apply an explicit recovery policy before readmission.",
    ],
  },
  contrast: [
    {
      alternative: "Process-only check",
      tradeoff:
        "Cheap evidence of responsiveness, but misses journal exhaustion and required dependencies.",
      whenNotToUse:
        "Do not use it alone to authorize save traffic.",
    },
    {
      alternative: "Dependency-aware readiness",
      tradeoff:
        "Tests required capacity more accurately but adds probe cost and may withdraw every replica during a shared dependency outage.",
      whenNotToUse:
        "Do not gate readiness on optional recommendations when lesson saves can safely proceed without them; use bounded checks and a defined all-unready response.",
    },
    {
      alternative: "Circuit breaker (10)",
      tradeoff:
        "A breaker limits selected dependency calls using their outcomes; readiness controls eligibility of a replica for traffic. They can compose but neither guarantees the other's scope.",
      whenNotToUse:
        "Do not use a breaker as proof that this replica can journal a save, or a probe as a substitute for per-call timeouts.",
    },
  ],
  misconceptions: [
    {
      wrong: "Green means the whole service works.",
      discriminant:
        "List the operations and resources actually exercised by the check.",
      counterexample:
        "A process-only 200 remains green while its full journal rejects every save.",
    },
    {
      wrong: "A slow external dependency should fail liveness.",
      discriminant:
        "Ask whether restarting this process repairs the observed failure.",
      counterexample:
        "Restarting all replicas during a database outage does not repair the database and may add a cold-start surge.",
    },
    {
      wrong: "An empty cache always means unready.",
      discriminant:
        "Decide whether safe bounded fallback exists for assigned traffic.",
      counterexample:
        "An empty optional lesson-preview cache can miss to a healthy store within budget, so the replica can remain ready.",
    },
  ],
  practiceIds: ["t-56-predict", "t-56-variant"],
  evidenceCriteria: [
    "Derive withdrawal time from samples, failure threshold and propagation rather than fault time.",
    "Separate local restart usefulness from eligibility for required traffic.",
    "Name an untested failure consistent with a green probe.",
    "Adapt admission checks to a batch worker without treating a heartbeat as completion evidence.",
  ],
  transfer: {
    domain: "Nightly batch export",
    variant:
      "A worker leases jobs rather than receiving HTTP requests. Its heartbeat runs on a separate thread, export disk is full, and jobs cannot be interrupted safely. Stop acquiring new leases when output capacity is unavailable; preserve or reconcile in-flight work. A heartbeat proves thread activity, not job progress. Define a separate progress timeout and recovery policy; restarting alone will not free persistent disk.",
  },
  provenance: { reviewed: true, notes: "Revisão técnica independente: revisão efetiva registrada. Verificados integralmente mentalModel, scenario, representation e equivalente textual, worked, contrast, misconceptions, transfer, evidenceCriteria e as tarefas t-56-predict e t-56-variant, incluindo funções de rubrica e pistas. Confirmados retirada em 11 s sob as hipóteses declaradas, distinção entre readiness e liveness, ausência de cancelamento automático de trabalho admitido e insuficiência do reinício para reparar armazenamento persistente cheio. Conferidos os oito critérios editoriais do planejamento §12.1 e o conceito canônico 56. Referência consultada: https://kubernetes.io/docs/concepts/workloads/pods/probes/ . Tempos e propagação são hipóteses didáticas, não garantias operacionais." },
},
{
  id: 57,
  rev: "3.1",
  objective:
    "Classify a failure by whether restarting can restore local progress or whether new work should stop, then predict the platform action and its limits.",
  prereqIds: [56],
  mentalModel: {
    definition:
      "Liveness and readiness turn observations into different decisions. A sustained liveness failure asks the platform to restart a container under its configured policy; readiness failure removes an instance from eligible service endpoints without requesting a restart. Liveness should target local failures that restarting can plausibly repair. Readiness should describe ability to accept the assigned work now. Neither signal proves end-to-end correctness.",
    analogy:
      "A workshop can stop accepting new orders while its machines keep running. Restarting a jammed machine is a different intervention from closing the order desk.",
    analogyLimits:
      "Software probes sample bounded paths and can misdiagnose slow processes. Closing admission does not cancel accepted work, and restarting a process cannot repair a shared supplier. A worker scheduler must explicitly consume the admission signal; an HTTP readiness endpoint alone does not control a queue.",
    correspondence: [
      ["Readiness failure", "Closing the order desk to new orders"],
      ["Liveness failure", "Requesting recovery of a jammed machine"],
      ["External database outage", "A supplier unavailable to every workshop"],
    ],
  },
  scenario: {
    system:
      "Three Academy replicas serve lesson-save requests through a service router.",
    data:
      "Every save requires the shared database. At t=0 its latency rises from 40 ms to 4 s, beyond the save deadline of 1 s. All event loops remain responsive. Restarting a replica creates 20 new database connections and requires 15 s of cache warming.",
    symptom:
      "A combined /health endpoint checks the database and drives both routing and liveness. During the slowdown, all three replicas repeatedly restart while saves continue to fail.",
    constraints: [
      "There is no local journal or alternative durable save path in this scenario; a replica unable to reach the database within the deadline cannot accept saves.",
      "Assume the probe failure threshold has been reached. The table compares resulting decisions, not exact detection or routing propagation times.",
      "The platform restarts a container on sustained liveness failure under the configured restart policy and withdraws unready endpoints from new routed traffic.",
      "Cold cache and migration states below temporarily prevent this endpoint from serving saves; in a service that can serve degraded results, they need not imply unready.",
      "Use cheap bounded checks or maintained local state. A probe must not create expensive database work on every sample.",
      "Already admitted requests require their own deadlines and failure handling. Readiness does not cancel them.",
    ],
    baseline:
      "The same dependency-sensitive result drives both probes, turning a shared database problem into synchronized restarts and renewed connection load.",
  },
  representation: {
    kind: "table",
    caption:
      "Read each row as failure → appropriate signal → platform action → effect on new work. Ask whether restarting changes the cause.",
    data: {
      columns: [
        { key: "failure", label: "Observed failure" },
        { key: "signal", label: "Probe decision", emphasis: true },
        { key: "action", label: "Platform action" },
        { key: "traffic", label: "Effect on new traffic" },
      ],
      rows: [
        {
          cells: {
            failure: "Local event loop stuck; restart can restore progress",
            signal: "Liveness fails; readiness also cannot serve",
            action: "Restart after the configured liveness threshold",
            traffic: "Unavailable during recovery; admit only after ready",
          },
          tone: "down",
        },
        {
          cells: {
            failure: "Shared database exceeds the save deadline",
            signal: "Readiness fails; local liveness remains healthy",
            action: "Withdraw endpoint; no probe-requested restart",
            traffic: "No new routed saves after propagation; all replicas may be unready",
          },
          tone: "warn",
        },
        {
          cells: {
            failure: "Required cache still warming",
            signal: "Readiness fails while local progress continues",
            action: "Keep process running; withhold admission",
            traffic: "Admit new saves once the readiness condition recovers",
          },
          tone: "warn",
        },
        {
          cells: {
            failure: "Replica applying a required migration; not serving yet",
            signal: "Readiness fails; liveness checks local progress",
            action: "Keep progressing process alive; withhold admission",
            traffic: "Other compatible ready replicas may serve",
          },
          tone: "warn",
        },
        {
          cells: {
            failure: "Process has exited",
            signal: "No successful probe is possible",
            action: "Runtime handles exit according to restart policy",
            traffic: "Replacement must become ready before admission",
          },
          tone: "down",
        },
      ],
      note:
        "Illustrative policy, not production configuration. Decisions follow configured thresholds; endpoint propagation takes time. A startup probe or suitable startup allowance may be needed to avoid killing legitimate initialization. Migration compatibility and shared-dependency recovery are separate responsibilities.",
    },
    textEquivalent:
      "A recoverable local hang calls for liveness-driven restart. An unavailable required database, required cold cache, or temporarily incompatible migration state calls for readiness withdrawal without restarting a progressing process. An exited process is handled by runtime restart policy. Withdrawal stops new routed work after propagation, not work already admitted. If every replica depends on the same unavailable database, all can become unready.",
  },
  worked: {
    decision:
      "Separate local liveness from save readiness. Keep responsive processes alive during the database slowdown and withhold new saves that cannot meet their deadline.",
    reasoning: [
      "First classify the cause: the database takes 4 s, but each process still makes local progress. Recreating a process cannot make that shared dependency faster.",
      "Under the baseline, all three replicas fail the same dependency-sensitive liveness check. Restarting adds 60 connection establishments across the fleet and repeats 15 s of warming per replica; these are modeled costs, not a measured latency prediction.",
      "With separate decisions, liveness remains successful while readiness reflects inability to complete a mandatory save. Withdrawal avoids pretending that a restart repairs the database.",
      "All three replicas may become unready. This prevents new routed saves under the stated policy but does not restore availability; callers need bounded failure behavior and operators must repair the dependency.",
      "When dependency state recovers, readiness can restore eligibility after the configured success condition and routing propagation. Recovery is sampled, not instantaneous.",
      "If a replica instead stops local progress and restarting is a plausible repair, liveness can request that recovery. Give legitimate startup work an appropriate allowance rather than treating warming as a hang.",
    ],
  },
  contrast: [
    {
      alternative:
        "Use one database-sensitive health result for both probes.",
      tradeoff:
        "This is simpler to wire, but the same database slowdown both withdraws replicas and restarts them. Shared failure becomes restart churn without repairing its cause.",
      whenNotToUse:
        "Do not use this policy when a dependency can fail independently of a healthy local process.",
    },
    {
      alternative:
        "Separate local liveness from dependency-aware readiness.",
      tradeoff:
        "This preserves healthy processes and makes admission explicit, but a mandatory shared dependency can make the entire service unready. It is not an availability guarantee.",
      whenNotToUse:
        "Do not gate the entire instance on an optional dependency if the assigned traffic can still be served correctly in a degraded mode; define readiness around the actual serving contract.",
    },
    {
      alternative:
        "Use readiness alone and omit local recovery detection.",
      tradeoff:
        "This avoids probe-driven restart storms but can leave a genuinely stuck process withdrawn indefinitely unless another recovery mechanism acts.",
      whenNotToUse:
        "Do not rely on readiness alone when local hangs require automatic restart and no other recovery mechanism detects them.",
    },
  ],
  misconceptions: [
    {
      wrong:
        "If the database is slow, failing liveness will fix the service.",
      discriminant:
        "Would recreating this process remove the cause, or would it reconnect to the same slow database?",
      counterexample:
        "All three Academy replicas are responsive but share the same slow database. Restarting them adds connection and warming work while saves still miss their deadline. Readiness can stop admission without adding restart churn, although it cannot repair the database.",
    },
    {
      wrong:
        "A failed readiness check restarts the container and cancels its requests.",
      discriminant:
        "Separate endpoint eligibility from process lifecycle and from already accepted work.",
      counterexample:
        "A replica becomes unready while handling a save. The platform withdraws it from new routing after propagation, but the process remains alive and the existing save still needs its own deadline.",
    },
    {
      wrong:
        "A cache that is not warm proves the process is dead.",
      discriminant:
        "Check whether initialization is progressing and whether the cache is required for the assigned traffic.",
      counterexample:
        "A required cache takes 15 s to warm while local progress stays healthy. Repeated liveness failures restart warming before completion; readiness can withhold admission while warming finishes.",
    },
  ],
  practiceIds: ["t-57-predict", "t-57-variant"],
  evidenceCriteria: [
    "Distinguish a recoverable local hang from an unavailable external dependency by asking whether a restart changes the cause.",
    "Predict restart versus endpoint withdrawal without claiming readiness cancels accepted requests.",
    "Explain why separating probes avoids restart churn but cannot make a shared database available.",
    "Transfer admission control to a worker scheduler while preserving running jobs and acknowledging the scheduler integration requirement.",
  ],
  transfer: {
    domain:
      "Batch video transcoding with leased jobs rather than HTTP requests.",
    variant:
      "Each worker has two GPU slots. Both slots hold healthy 10-minute jobs, the heartbeat remains healthy, and there is no safe local buffer for a third job. The scheduler explicitly consumes readiness before offering new leases. Decide whether to restart or withhold new jobs, predict what happens to current leases, and explain why readiness does not revoke a lease or atomically reserve a newly free slot. Compare this with a worker whose execution loop stops progressing.",
  },
  provenance: {
    reviewed: true,
    notes:
      "Revalidação independente s40: revisão efetiva registrada. Confirmada a correção de t-57-variant: admission rejeita lease-control, opção existente; a única combinação aceita é hold e resume. Revisados reinício por liveness, elegibilidade por readiness, propagação, trabalho já admitido, startup e indisponibilidade de dependência obrigatória. Fonte: Kubernetes, Configure Liveness, Readiness and Startup Probes. A transferência para workers explicita integração do scheduler, reserva atômica e ciclo de leases; readiness não cancela jobs nem revoga leases. Valores do cenário são ilustrativos e não foi executado cluster Kubernetes.",
  },
}
];