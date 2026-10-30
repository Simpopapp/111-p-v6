import type { Task } from "@/lib/exercises";

export const TASKS_NETWORKING: Task[] = [
  {
    id: "t-97-predict", conceptId: 97, type: "predict",
    prompt: "At t=100, which address does C use and how long until its cached entry expires? Choose one.",
    context: "At t=0 the authoritative A record changes from provider A to B with TTL 300 s. Resolver R cached A at t=-60 with TTL 300 s. C asks R at t=30 and honors the returned remaining TTL. No prefetch, serve-stale, connection reuse, or lookup delay is modeled.",
    options: [
      { key: "a", label: "B; the authoritative edit invalidated both caches at t=0." },
      { key: "b", label: "A; 140 s remain, because C inherited R's expiry at t=240." },
      { key: "c", label: "A; 230 s remain, because C started a new full 300-second TTL at t=30." },
      { key: "d", label: "A; 200 s remain, because the edit restarted every cache at t=0." },
    ],
    rubric: {
      criteria: [
        { key: "cache-source", label: "Uses the still-valid cached answer rather than assuming pushed invalidation", cause: "The choice may treat an authoritative edit as a cache invalidation broadcast rather than tracing C's answer source.", check: a => a.picked?.length === 1 && (a.picked[0] === "b" || a.picked[0] === "c" || a.picked[0] === "d") },
        { key: "expiry-clock", label: "Computes the inherited expiry without restarting the full TTL", cause: "The choice may restart a full TTL at the application or at the edit, instead of using the resolver's remaining TTL.", check: a => a.picked?.length === 1 && a.picked[0] === "b" },
      ],
      expected: "Choose b. R expires at -60 + 300 = 240. At t=30 it returns A with 210 s left; C honors that lifetime. At t=100 C therefore has 240 - 100 = 140 s left. A cold resolver can already return B, but C has not queried one.",
      nextStep: "Move R's original fetch to t=-200, keeping its TTL 300 s. Recompute the answer just before t=100 and on a successful lookup at t=100.",
    },
    helpLevels: ["Identify the source of C's answer and mark when that source originally fetched it.", "Find R's absolute expiry first; then subtract t=30 to get the lifetime passed to C.", "R expires at t=240; C inherits it. At t=100, A has 140 s remaining: choose b."],
  },
  {
    id: "t-97-variant", conceptId: 97, type: "variant",
    prompt: "Regional alerts must recover within 10 s. Which proposal addresses the stated constraints without promising DNS-only failover? Choose one.",
    context: "The alert hostname has TTL 60 s, some mobile applications cache addresses for 5 minutes, and connections persist. A second region is provisioned but its capacity and health checks are untested. The current proposal only edits the DNS address when a region fails.",
    options: [
      { key: "a", label: "Set the authoritative TTL to 5 s during the incident and keep the current client behavior; all clients will move within 10 s." },
      { key: "b", label: "Add another authoritative DNS provider; existing client address caches will immediately refresh." },
      { key: "c", label: "Preprovision a stable traffic endpoint with tested regional health and capacity, and test client reconnect behavior against the 10-second objective; DNS edits alone do not establish that bound." },
      { key: "d", label: "Reduce TTL to 5 s well before the incident but keep five-minute client caching and persistent connections; this establishes the 10-second recovery bound." },
    ],
    rubric: {
      criteria: [
        { key: "recovery-bound", label: "Accounts for client caching, existing connections, and tested destination readiness", cause: "The proposal may confuse authoritative availability or a short published TTL with movement of clients that retain addresses and connections; destination readiness is also unproven.", check: a => a.picked?.length === 1 && a.picked[0] === "c" },
      ],
      expected: "Choose c. A lower authoritative TTL cannot revoke five-minute application caches or relocate established connections. More authoritative providers improve a different availability boundary. A preprovisioned stable endpoint can change backend routing, but health detection, spare capacity, reconnect timing, endpoint availability, and regional failure tests must support the 10-second objective; the architecture alone is not a guarantee.",
      nextStep: "Design a regional-failure test recording detection, routing change, reconnect time, and first successful alert; state which observation would falsify the 10-second objective.",
    },
    helpLevels: ["List all the clocks between detecting failure and a client completing its next successful alert request.", "Compare the DNS TTL with the application's cache lifetime and existing connection behavior; then check whether the other region is actually ready.", "Choose c: preprovision and test traffic routing plus client reconnect behavior. None of the DNS-only changes revokes retained addresses or proves recovery within 10 s."],
  },
{
    id: "t-98-predict",
    conceptId: 98,
    type: "predict",
    prompt: "Predict the application observations. Select every supported statement.",
    context: "Independent snapshots A, B, and C are generated at 0, 20, and 40 ms. A arrives at 10 ms, initial B is lost, and C reaches both receivers at 50 ms. TCP recovers B at the stipulated 110 ms; its receive buffer holds C. UDP has no application retry. Snapshots older than 60 ms are discarded; UDP application sequence checks accept C as newer. Connections are already established.",
    options: [
      {
        key: "held",
        label: "At 50 ms TCP has C's bytes, but the application cannot receive them past the missing B range."
      },
      {
        key: "fresh",
        label: "At 50 ms the UDP application can accept C as a 10 ms-old independent snapshot."
      },
      {
        key: "restored",
        label: "At 110 ms UDP restores B because the later C datagram revealed its absence."
      },
      {
        key: "timely",
        label: "At 110 ms TCP recovery makes both B and C meet the 60 ms freshness limit."
      }
    ],
    rubric: {
      criteria: [
        {
          key: "gap",
          label: "Distinguish receipt from ordered stream delivery",
          cause: "Omitting the TCP observation may confuse bytes buffered at the receiver with bytes deliverable past a stream gap.",
          check: (a) => a.picked?.includes("held") === true
        },
        {
          key: "age",
          label: "Recognize independent fresh delivery",
          cause: "Omitting the UDP observation may import TCP's ordered-stream barrier into independent datagrams; C is only 50 - 40 = 10 ms old.",
          check: (a) => a.picked?.includes("fresh") === true
        },
        {
          key: "boundary",
          label: "Reject invented recovery and freshness guarantees",
          cause: "Additional selections attribute recovery to UDP or confuse eventual TCP delivery with meeting an application deadline.",
          check: (a) =>
            a.picked !== undefined &&
            a.picked.length === 2 &&
            new Set(a.picked).size === 2 &&
            a.picked.every((key) => key === "held" || key === "fresh")
        }
      ],
      expected: "Select held and fresh. C reaches both receivers at 50 ms, but TCP cannot expose its bytes past missing B. UDP exposes C independently, and the stated application accepts its 10 ms age. At 110 ms TCP releases B and C at ages 90 and 70 ms, so both are stale. UDP does not recover B without a higher-level mechanism.",
      nextStep: "Draw separate arrival and application-delivery rows, then try the plant variant where losing a command has a different cost."
    },
    helpLevels: [
      "Separate arrival at the receiver from delivery to the application. Calculate age from generation time.",
      "For TCP, ask whether an earlier byte range is missing. For UDP, inspect the application's sequence and expiry rules rather than inventing retransmission.",
      "Select held and fresh. TCP holds C until 110 ms; UDP can expose C at 50 ms. At TCP release, B is 90 ms old and C is 70 ms old, beyond the 60 ms limit; UDP never restores B in this trace."
    ]
  },
  {
    id: "t-98-variant",
    conceptId: 98,
    type: "variant",
    prompt: "Choose the plan that satisfies both plant flows without claiming more than the transport provides. Choose one.",
    context: "A temperature sensor sends an independent reading every 100 ms. One missing reading is acceptable, and readings older than 250 ms must be discarded. Valve commands are non-replaceable operations: a command must not disappear silently or be repeated as a new action. Expired commands must not execute. Operators need a confirmed result or an explicit unknown-outcome alarm. This is a design exercise, not safety certification.",
    options: [
      {
        key: "split",
        label: "Use a datagram protocol with sequence, expiry, and congestion behavior for readings; use a reliable protocol for commands plus command IDs, execution acknowledgments, expiry checks, duplicate handling, and outcome reconciliation."
      },
      {
        key: "transport",
        label: "Use the same reading protocol, but treat a TCP transport acknowledgment for a command as proof that the valve reached its target."
      },
      {
        key: "repeat",
        label: "Use the same reading protocol and reliable commands; if an execution response is missing, retry under a fresh command ID without checking the previous outcome."
      },
      {
        key: "discard",
        label: "Use datagrams for both flows; discard missing commands just like missing readings because newer network traffic can continue."
      }
    ],
    rubric: {
      criteria: [
        {
          key: "semantic",
          label: "Match recovery policy to message meaning",
          cause: "The selected plan does not preserve all command constraints: a replaceable reading and a non-replaceable operation cannot share a silent-loss policy.",
          check: (a) =>
            a.picked?.length === 1 && a.picked[0] === "split"
        },
        {
          key: "confirmed-action",
          label: "Require evidence of execution rather than transport receipt",
          cause: "Transport receipt alone does not establish valve movement. Missing execution feedback requires an explicit unknown outcome and reconciliation.",
          check: (a) =>
            a.picked?.length === 1 &&
            (a.picked[0] === "split" || a.picked[0] === "repeat")
        },
        {
          key: "identity",
          label: "Preserve command identity and validity",
          cause: "A fresh ID after a lost response can represent a second action; silently discarding commands or relying on transport acknowledgments also fails to establish safe expiry and duplicate handling.",
          check: (a) =>
            a.picked?.length === 1 && a.picked[0] === "split"
        }
      ],
      expected: "Choose split. Missing readings are acceptable because later independent readings replace them; the application must reject stale and reordered data and use an appropriate congestion policy. Commands require complete communication plus application-level identity, expiry enforcement, execution acknowledgment, duplicate handling, and reconciliation. TCP receipt is not valve execution, and a lost response leaves an unknown outcome. A fresh retry identity may authorize another action. These controls still do not constitute an industrial safety certification.",
      nextStep: "Now suppose every reading is legally required for an audit. Revisit the reading path: add durable recovery and completeness checks instead of retaining the silent-loss assumption."
    },
    helpLevels: [
      "For each flow, ask what losing one item means. What observation would prove the physical action happened?",
      "A later reading can replace an earlier reading under this policy. A command response can be lost after execution, so inspect operation identity and unknown-outcome handling.",
      "Choose split. Datagrams fit the stated replaceable-reading policy, while commands need reliable communication plus execution-level confirmation, stable identity, expiry, duplicate handling, and reconciliation."
    ]
  }
];