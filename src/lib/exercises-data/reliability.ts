import type { Task } from "@/lib/exercises";

export const TASKS_RELIABILITY: Task[] = [
  {
    id: "t-56-predict",
    conceptId: 56,
    type: "predict",
    prompt:
      "Choose one prediction for new traffic at t=6s and t=11s, and the restart decision.",
    context:
      "A's persistent journal fills at t=1s. Its process remains responsive. Readiness samples finish at 0,5,10s; two consecutive failures trigger withdrawal; propagation takes 1s. B is ready. Restarting cannot clear the journal. No other routing rules apply.",
    options: [
      {
        key: "a",
        label:
          "A remains eligible at 6s, is excluded at 11s, and liveness should not request a restart for this fault.",
      },
      {
        key: "b",
        label:
          "A is excluded at 6s because the first failed sample is sufficient; no restart is needed.",
      },
      {
        key: "c",
        label:
          "A remains eligible at 6s and is excluded at 11s; liveness should request a restart to repair journal capacity.",
      },
      {
        key: "d",
        label:
          "A remains eligible at both times because a responsive process establishes readiness.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "timing",
          label: "Account for sampling and propagation",
          cause:
            "Equating fault time or the first failed sample with withdrawal ignores the stated two-failure threshold and propagation delay.",
          check: a =>
            a.picked?.length === 1 &&
            (a.picked[0] === "a" || a.picked[0] === "c"),
        },
        {
          key: "local-recovery",
          label: "Restart only for a recoverable local fault",
          cause:
            "A persistent full journal is not repaired by restarting a responsive process; responsiveness alone also cannot authorize save traffic.",
          check: a =>
            a.picked?.length === 1 &&
            (a.picked[0] === "a" || a.picked[0] === "b"),
        },
      ],
      expected:
        "Choose a. At 6s only the 5s failure has completed, so A remains eligible. At 10s the second failure triggers withdrawal, effective at 11s. Keep liveness passing for this fault because a restart cannot repair persistent capacity. Withdrawal does not cancel earlier requests.",
      nextStep:
        "Reconstruct fault → samples → threshold → propagation, then ask what a restart would change.",
    },
    helpLevels: [
      "Separate what is true of the application from what the router has learned.",
      "Count completed failed samples at each requested time, then add propagation. Consider whether process replacement frees persistent storage.",
      "Choose a: eligible at 6s, excluded at 11s, no liveness-triggered restart for the full persistent journal.",
    ],
  },
  {
    id: "t-56-variant",
    conceptId: 56,
    type: "variant",
    prompt:
      "Choose one defensible admission and monitoring policy for this batch worker.",
    context:
      "A nightly exporter leases jobs. A separate heartbeat thread returns 200, but the persistent export disk is full. Jobs cannot be safely interrupted. Restarting does not free disk. A missing optional cache can safely fall back to the source within budget.",
    options: [
      {
        key: "a",
        label:
          "Keep acquiring leases while heartbeat passes; use the heartbeat as proof that exports complete.",
      },
      {
        key: "b",
        label:
          "Pause new leases when output capacity is unavailable, preserve or reconcile in-flight jobs, and track job progress separately; allow bounded cache fallback.",
      },
      {
        key: "c",
        label:
          "Restart on every disk-capacity failure and resume leases as soon as the heartbeat returns.",
      },
      {
        key: "d",
        label:
          "Pause leases on an empty optional cache even when fallback works, and terminate in-flight jobs to restore readiness.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "admission",
          label: "Gate new work on required capacity",
          cause:
            "Heartbeat activity is narrower than export capacity; restarting cannot free persistent disk, and optional cache warmth is not required when bounded fallback works.",
          check: a =>
            a.picked?.length === 1 && a.picked[0] === "b",
        },
        {
          key: "inflight-evidence",
          label: "Protect existing work and observe progress",
          cause:
            "Admission withdrawal is not safe cancellation or completion evidence; the independent heartbeat can remain green while exports stall.",
          check: a =>
            a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "Choose b. Job leasing replaces HTTP routing as the admission boundary. Required output capacity gates new jobs; optional cache misses do not if fallback meets the budget. Keep in-flight work safe and reconcile its state before recovery. Monitor job progress independently: a heartbeat on another thread does not prove exports complete. Repair disk capacity before resuming under an explicit recovery policy.",
      nextStep:
        "Identify the admission boundary, required resources, in-flight obligations and what the observed signal cannot establish.",
    },
    helpLevels: [
      "Which signal describes the actual work, and which merely describes a monitoring thread?",
      "Map readiness to acquiring leases, not cancelling jobs. Separate required output storage from optional cache warmth.",
      "Choose b: stop new leases on unavailable output capacity, preserve or reconcile in-flight work, measure progress separately, and permit safe bounded cache fallback.",
    ],
  },
{
    id: "t-57-predict",
    conceptId: 57,
    type: "predict",
    context:
      "Three Academy lesson-save replicas share a database. Database calls take 4 s against a 1 s save deadline; each local event loop remains responsive. A restart reconnects to the same database, opens 20 connections, and repeats 15 s of cache warming. Every save requires this database. Assume configured probe thresholds have been reached and endpoint withdrawal has propagated.",
    prompt:
      "Select exactly two statements: the appropriate probe policy and its remaining limitation.",
    options: [
      {
        key: "separate",
        label:
          "Keep local liveness successful; fail save readiness and withdraw these replicas without requesting a restart.",
      },
      {
        key: "restart",
        label:
          "Fail dependency-sensitive liveness so each replica reconnects and warms its cache again.",
      },
      {
        key: "limited",
        label:
          "All replicas may be unready; admission stops, but the database remains unavailable and accepted saves still need deadline handling.",
      },
      {
        key: "repaired",
        label:
          "Endpoint withdrawal restores save availability because the router can find a healthy database through another replica.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "policy",
          label:
            "Choose admission withdrawal rather than dependency-driven restart",
          cause:
            "The decision treats an external dependency failure as a locally repairable process failure. A restart reconnects to the same database and adds recovery work.",
          check: (a) =>
            (a.picked ?? []).includes("separate") &&
            !(a.picked ?? []).includes("restart"),
        },
        {
          key: "boundary",
          label:
            "Preserve the availability and in-flight-work limits",
          cause:
            "The prediction treats endpoint withdrawal as dependency repair or cancellation. Every replica still needs the same database, and admitted saves retain their own lifecycle.",
          check: (a) =>
            (a.picked ?? []).includes("limited") &&
            !(a.picked ?? []).includes("repaired"),
        },
        {
          key: "selection",
          label:
            "Make one coherent policy-and-limitation prediction",
          cause:
            "The answer does not contain exactly the two requested statements. Reconcile the platform action with what it can and cannot change.",
          check: (a) => {
            const picked = a.picked ?? [];
            return picked.length === 2 &&
              new Set(picked).size === 2 &&
              picked.every((key) =>
                ["separate", "restart", "limited", "repaired"].includes(key)
              );
          },
        },
      ],
      expected:
        "Select separate and limited. The processes still make local progress, so restarting does not address the shared database cause. Readiness withdraws replicas unable to honor the save contract without adding restart churn. Because all replicas need the same database, all may be unready; this is controlled admission failure, not restored availability. Accepted saves are not canceled by readiness.",
      nextStep:
        "Change only the cause to a locally stuck event loop that a restart can repair. Predict the lifecycle action, then contrast it with the unchanged external-database case.",
    },
    helpLevels: [
      "Identify what has failed and what recreating one process would actually change.",
      "Compare the scope of local progress, new-work admission, and work already accepted. A shared dependency is outside the lifecycle of any one replica.",
      "Choose separate and limited: preserve responsive processes, withdraw new saves, and state that neither database recovery nor cancellation of accepted saves follows from readiness.",
    ],
  },
  {
    id: "t-57-variant",
    conceptId: 57,
    type: "variant",
    context:
      "A video-transcoding worker has two GPU slots, both occupied by healthy 10-minute jobs. Its execution loop and heartbeat are healthy. There is no safe buffer for another job. The scheduler explicitly uses worker readiness before offering new leases, and a separate atomic slot reservation protects admission races. Restarting would interrupt running work; readiness alone neither revokes leases nor cancels jobs.",
    prompt:
      "Select exactly two statements that preserve running work while controlling admission.",
    options: [
      {
        key: "hold",
        label:
          "Keep liveness successful and mark readiness false while both slots are occupied; let existing jobs continue.",
      },
      {
        key: "recycle",
        label:
          "Fail liveness when slots are full so a fresh process can advertise empty capacity.",
      },
      {
        key: "resume",
        label:
          "After a slot is released, readiness may advertise capacity again; the scheduler still reserves a slot before assigning a new lease.",
      },
      {
        key: "lease-control",
        label:
          "Mark readiness false and rely on that signal to revoke the two active leases and requeue their work.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "continuity",
          label:
            "Distinguish occupied capacity from failed local progress",
          cause:
            "The answer confuses useful ongoing work with a hung process. Restarting a busy worker destroys progress rather than creating safe additional capacity.",
          check: (a) =>
            (a.picked ?? []).includes("hold") &&
            !(a.picked ?? []).includes("recycle"),
        },
        {
          key: "admission",
          label:
            "Keep lease lifecycle and slot reservation separate from readiness",
          cause:
            "The answer gives readiness powers it does not have. A scheduler must consume the signal; lease revocation and race-free slot reservation require separate mechanisms.",
          check: (a) =>
            (a.picked ?? []).includes("resume") &&
            !(a.picked ?? []).includes("lease-control"),
        },
        {
          key: "selection",
          label:
            "Select a consistent pair of admission decisions",
          cause:
            "The answer does not select exactly two distinct available statements. Trace existing jobs and the next offered job separately.",
          check: (a) => {
            const picked = a.picked ?? [];
            return picked.length === 2 &&
              new Set(picked).size === 2 &&
              picked.every((key) =>
                ["hold", "recycle", "resume", "lease-control"].includes(key)
              );
          },
        },
      ],
      expected:
        "Select hold and resume. Healthy occupied slots mean the worker is alive but cannot accept more work under this contract. Withhold new leases while current jobs continue. When capacity returns, readiness can signal eligibility to the integrated scheduler, but atomic reservation still decides whether a particular new job fits. Readiness neither revokes active leases nor guarantees an immediately available slot.",
      nextStep:
        "Now stop the execution loop while keeping both leases assigned. Explain what evidence would justify recovery by restart and why job recovery still requires the lease protocol.",
    },
    helpLevels: [
      "Trace the two running jobs separately from the next job the scheduler might offer.",
      "Ask whether full slots mean missing progress or successful work in progress. Then distinguish an admission signal from ownership of an active lease.",
      "Choose hold and resume. Keep healthy jobs running, withhold new admission until capacity returns, and retain separate slot reservation and lease recovery mechanisms.",
    ],
  }
];