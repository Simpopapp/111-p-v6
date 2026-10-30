import type { Lesson } from "./types";

export const LESSONS_OBSERVABILITY: Lesson[] = [
  {
    id: 58,
    rev: "2.2",
    objective:
      "Interpret an alert as a bounded observation, distinguish monitoring from observability, and request evidence that separates competing explanations.",
    prereqIds: [],
    mentalModel: {
      definition:
        "Monitoring checks selected signals against expected behavior. Observability is the ability to investigate internal behavior from available outputs, including questions not anticipated by a particular dashboard. Collecting metrics supports both but does not by itself establish either useful alerts or explainable behavior.",
      analogy:
        "A building panel reports that a room is too warm; an investigator combines that reading with occupancy, equipment state, and inspection.",
      analogyLimits:
        "A sensor can be stale, misplaced, or calibrated incorrectly. Software telemetry also has coverage gaps and measurement changes; a warning identifies a condition in its measurement scope, not its cause.",
      correspondence: [
        ["Alert condition", "Temperature crossing the configured threshold"],
        ["Telemetry coverage", "Rooms and equipment with working sensors"],
        ["Investigation", "Combining readings with contextual inspection"],
      ],
    },
    scenario: {
      system:
        "A document-preview service has API metrics, structured logs, sampled traces, and a synthetic browser check.",
      data:
        "The five-minute server-error ratio rises from 0.2% to 3%. Request count and error count are collected at the API edge. The alert threshold is 2%.",
      symptom:
        "The alert fires, but the team has not established which users or routes are affected or why.",
      constraints: [
        "An alert is not a root-cause diagnosis or a complete incident declaration.",
        "Compare the same route scope, denominator, and time interval before interpreting a change.",
        "Telemetry can fail independently of the user-facing service.",
      ],
      baseline:
        "The previous comparable five-minute interval recorded 20 server errors in 10,000 eligible requests: 0.2%.",
    },
    representation: {
      kind: "event-track",
      caption:
        "Separate measured symptoms, user-path evidence, and investigation decisions.",
      data: {
        unit: "min",
        lanes: [
          { id: "edge", label: "API edge measurements", kind: "signal" },
          { id: "probe", label: "Synthetic browser check", kind: "signal" },
          { id: "responder", label: "Responder", kind: "actor" },
        ],
        events: [
          {
            ts: 0,
            lane: "edge",
            label: "Previous 5 min: 20 / 10,000 errors = 0.2%",
            kind: "info",
          },
          {
            ts: 5,
            lane: "edge",
            label: "Latest 5 min: 300 / 10,000 errors = 3%; alert fires",
            kind: "warn",
          },
          {
            ts: 5,
            lane: "probe",
            label: "One preview check succeeds from one location",
            kind: "success",
          },
          {
            ts: 6,
            lane: "responder",
            label: "Request route, region, and measurement-coverage breakdown",
            kind: "info",
          },
        ],
        window: { from: 0, to: 6 },
        note:
          "Synthetic observations, not production measurements. Points label completed windows; one successful probe cannot establish universal availability.",
      },
      textEquivalent:
        "At minute 0, the preceding five-minute edge window contains 20 errors among 10,000 requests, or 0.2%. At minute 5, the latest window contains 300 among 10,000, or 3%, crossing the 2% alert threshold. A single browser preview check succeeds at minute 5 from one location. At minute 6, the responder requests route, region, and collection-coverage breakdowns. Neither signal identifies the cause or proves that every user is affected.",
    },
    worked: {
      decision:
        "Treat the alert as a credible symptom requiring triage, then obtain comparable scoped measurements and user-path evidence before selecting a corrective change.",
      reasoning: [
        "Verify the numerator, denominator, freshness, and alert window: 300 / 10,000 is 3%.",
        "Keep at least two explanations open: service behavior changed, or measurement coverage or traffic composition changed.",
        "A successful probe narrows one observation but does not contradict errors on other paths.",
        "Request route and region breakdowns with counts, then inspect representative failures using correlated logs or traces.",
        "Escalate according to impact and urgency without waiting for a complete causal explanation.",
      ],
    },
    contrast: [
      {
        alternative: "Add another aggregate dashboard",
        tradeoff:
          "It may improve visibility, but duplicating the same aggregate does not add evidence that distinguishes explanations.",
        whenNotToUse:
          "Do not add dashboards when the missing information is a denominator, correlation identifier, user-path check, or uninstrumented boundary.",
      },
      {
        alternative: "Use only synthetic checks",
        tradeoff:
          "They test a defined journey independently of real traffic but cover only selected locations, inputs, and times.",
        whenNotToUse:
          "Do not infer that all users are unaffected from one passing synthetic journey.",
      },
    ],
    misconceptions: [
      {
        wrong: "An error alert identifies the failing component.",
        discriminant:
          "Ask whether the alert measures an outcome or directly tests the proposed causal mechanism.",
        counterexample:
          "The edge reports increased errors after a client starts sending malformed requests; the database remains healthy.",
      },
      {
        wrong: "Collecting more metrics automatically makes the system observable.",
        discriminant:
          "Check whether an unexpected question can be answered with context and correlated evidence.",
        counterexample:
          "Hundreds of CPU charts cannot explain which request lost its authorization context when request identifiers are absent.",
      },
    ],
    practiceIds: ["t-58-predict", "t-58-choose-info"],
    evidenceCriteria: [
      "State what the alert measures, including its interval and denominator.",
      "Separate measured symptom, user impact, and causal hypothesis.",
      "Choose evidence that could change the relative plausibility of competing explanations.",
    ],
    transfer: {
      variant:
        "Investigate a rise in failed file uploads while a homepage uptime check continues to pass; specify what each signal leaves unknown.",
      domain: "File collaboration",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 58 under D1/D17. Numbers and observations are synthetic teaching data. Monitoring and observability are distinguished without prescribing a vendor. Independent technical review is pending.",
    },
  },
  {
    id: 60,
    rev: "2.2",
    objective:
      "Read trace_id and parent-child spans to locate observed elapsed time while separating per-request evidence from population and causal claims.",
    prereqIds: [58],
    mentalModel: {
      definition:
        "Distributed tracing correlates recorded spans belonging to an operation through a trace_id. Each span records an instrumented operation with its own span_id, timing, attributes, and usually a parent relationship. Propagated context connects work across service boundaries; missing instrumentation or sampling can leave gaps.",
      analogy:
        "A parcel itinerary groups timestamped handling records under one shipment reference.",
      analogyLimits:
        "An itinerary records participating checkpoints, not every physical event. Likewise, traces describe recorded operations, may be incomplete, and do not prove that the longest span is the underlying cause of a slowdown.",
      correspondence: [
        ["trace_id", "Shared shipment reference"],
        ["span_id", "Identifier of one handling record"],
        ["Parent-child relationship", "Recorded subtask within a handling stage"],
      ],
    },
    scenario: {
      system:
        "A report API calls a metadata service and then renders a preview.",
      data:
        "Trace tr-demo-7 contains root span r, 0–800 ms; child metadata span m, 100–650 ms; and child rendering span p, 650–780 ms. Timing uses one normalized teaching clock.",
      symptom:
        "One sampled report request took 800 ms, and the metadata child occupied 550 ms.",
      constraints: [
        "The sample contains one request, not a representative latency distribution.",
        "A client-side dependency span includes elapsed waiting and is not a CPU profile of the remote service.",
        "Child spans are nested inside the root; overlapping or nested durations must not be blindly summed.",
      ],
      baseline:
        "The expected report duration is below 400 ms, but no population baseline is provided by this individual trace.",
    },
    representation: {
      kind: "event-track",
      caption:
        "Follow the shared trace identifier and observe span boundaries without adding nested durations.",
      data: {
        unit: "ms",
        lanes: [
          { id: "api", label: "Report API: span r", kind: "actor" },
          { id: "metadata", label: "Metadata call: span m", kind: "actor" },
          { id: "render", label: "Preview renderer: span p", kind: "actor" },
        ],
        events: [
          {
            ts: 0,
            lane: "api",
            label: "Start r; trace_id=tr-demo-7",
            kind: "info",
          },
          {
            ts: 100,
            lane: "metadata",
            label: "Start m; parent=r; trace_id=tr-demo-7",
            kind: "info",
          },
          {
            ts: 650,
            lane: "metadata",
            label: "End m; elapsed 550 ms",
            kind: "success",
          },
          {
            ts: 650,
            lane: "render",
            label: "Start p; parent=r; trace_id=tr-demo-7",
            kind: "info",
          },
          {
            ts: 780,
            lane: "render",
            label: "End p; elapsed 130 ms",
            kind: "success",
          },
          {
            ts: 800,
            lane: "api",
            label: "End r; elapsed 800 ms",
            kind: "success",
          },
        ],
        window: { from: 0, to: 800 },
        note:
          "One synthetic complete trace with a normalized clock. Boundary markers represent span starts and ends; production clock alignment and sampling require validation.",
      },
      textEquivalent:
        "All records share trace_id tr-demo-7. Root span r runs from 0 to 800 ms. Its child m, the metadata call, runs from 100 to 650 ms, taking 550 ms. Its child p, preview rendering, runs from 650 to 780 ms, taking 130 ms. The remaining 120 ms is outside these two recorded children. Total root duration is 800 ms, not 1,480 ms. The trace establishes recorded timing for one request, not the population distribution or the cause of the metadata wait.",
    },
    worked: {
      decision:
        "Investigate the metadata-call interval for this request and obtain population measurements before claiming a general bottleneck.",
      reasoning: [
        "The shared trace_id groups the operation; span_id and parent identifiers distinguish its recorded stages.",
        "Metadata occupies 550 of the root's 800 ms, making that interval a useful next inspection target.",
        "The root already contains its children; adding all durations double-counts time.",
        "Inspect remote child spans, queueing evidence, and correlated logs to distinguish server work, network wait, and contention.",
        "Use comparable request metrics and additional traces with known sampling rules to assess prevalence.",
      ],
    },
    contrast: [
      {
        alternative: "Use structured logs",
        tradeoff:
          "Logs can expose detailed events and errors, but reconstructing cross-service timing requires identifiers and consistent instrumentation.",
        whenNotToUse:
          "Do not choose disconnected log lines alone when the question requires parent-child timing across service boundaries.",
      },
      {
        alternative: "Use aggregate metrics",
        tradeoff:
          "Metrics describe rates and distributions efficiently but usually cannot reconstruct one request's operation tree.",
        whenNotToUse:
          "Do not use a population percentile as evidence of the exact path taken by one particular request.",
      },
    ],
    misconceptions: [
      {
        wrong: "The longest child span proves that service's CPU caused the delay.",
        discriminant:
          "Separate elapsed time at the caller from the mechanism inside the dependency.",
        counterexample:
          "A 550 ms client span can contain 500 ms waiting for a connection and only 50 ms of remote execution.",
      },
      {
        wrong: "One slow trace proves most users are slow.",
        discriminant:
          "Ask how the trace was selected and what denominator represents the population.",
        counterexample:
          "A sampler retains only slow requests, so every displayed trace is slow even when most requests are fast.",
      },
    ],
    practiceIds: ["t-60-compare", "t-60-find-flaw"],
    evidenceCriteria: [
      "Identify trace_id, span identifiers, parent relationships, and elapsed durations.",
      "Avoid double-counting nested span durations.",
      "State both an observation supported by a trace and a causal or population claim it does not support.",
    ],
    transfer: {
      variant:
        "Follow one notification through an API and worker while noting a missing context boundary; explain what cannot be reconstructed from the available spans.",
      domain: "Notification delivery",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 60. Terminology follows the OpenTelemetry trace/span model; example timing is synthetic and does not represent a deployed system. Independent technical review is pending.",
    },
  },
  {
    id: 61,
    rev: "2.2",
    objective:
      "Choose counters, rates, gauges, or histograms for a question and predict how units, windows, and aggregation change interpretation.",
    prereqIds: [58],
    mentalModel: {
      definition:
        "Metrics are numerical observations indexed by time and selected dimensions. A counter accumulates events until reset; a rate expresses counter increase per time unit; a gauge records a current value; a histogram counts observations in value ranges. Interpretation requires units, scope, collection coverage, and a time window.",
      analogy:
        "A station records cumulative passenger entries, passengers per minute, people currently waiting, and waiting-time ranges.",
      analogyLimits:
        "A station total can hide an overcrowded platform. Software aggregation likewise hides subgroup behavior, and counters can reset when processes restart. A histogram summarizes values rather than preserving every individual event.",
      correspondence: [
        ["Counter", "Cumulative entries at a turnstile"],
        ["Rate", "Entries per minute"],
        ["Gauge", "People waiting now"],
        ["Histogram", "Counts in waiting-time ranges"],
      ],
    },
    scenario: {
      system:
        "An image-transformation API records a completed-request counter and request-duration histogram.",
      data:
        "A counter reads 1,000 at t=0 min, 1,600 at t=1, and 1,600 at t=5. Assume complete collection and no reset in this teaching interval.",
      symptom:
        "Two dashboards show 10 requests/s and 2 requests/s for the same service, apparently disagreeing.",
      constraints: [
        "Compare time windows before treating different rates as contradictory.",
        "Counter reset handling is required outside the stated no-reset example.",
        "Do not average per-instance percentiles to obtain a service percentile.",
      ],
      baseline:
        "The first-minute increase is 600 requests; the full five-minute increase is also 600 requests.",
    },
    representation: {
      kind: "event-track",
      caption:
        "The same counter increase produces different rates over different windows.",
      data: {
        unit: "min",
        lanes: [
          { id: "counter", label: "Completed-request counter", kind: "signal" },
          { id: "rate", label: "Derived request rate", kind: "signal" },
        ],
        events: [
          {
            ts: 0,
            lane: "counter",
            label: "1,000 requests",
            kind: "info",
          },
          {
            ts: 1,
            lane: "counter",
            label: "1,600 requests",
            kind: "info",
          },
          {
            ts: 1,
            lane: "rate",
            label: "Window [0,1]: 600 / 60 = 10 requests/s",
            kind: "info",
          },
          {
            ts: 5,
            lane: "counter",
            label: "1,600 requests",
            kind: "info",
          },
          {
            ts: 5,
            lane: "rate",
            label: "Window [0,5]: 600 / 300 = 2 requests/s",
            kind: "info",
          },
        ],
        window: { from: 0, to: 5 },
        note:
          "Synthetic endpoint-difference calculation with complete collection and no counter reset. Longer windows smooth bursts but can hide short disruptions.",
      },
      textEquivalent:
        "The completed-request counter is 1,000 at minute 0, 1,600 at minute 1, and 1,600 at minute 5. The first-minute rate is (1,600 minus 1,000) / 60 seconds = 10 requests/s. The five-minute average is the same increase divided by 300 seconds = 2 requests/s. Both are correct for their windows; no additional completions occur after minute 1.",
    },
    worked: {
      decision:
        "Label each rate with its window and use a duration histogram, rather than request count, to investigate tail latency.",
      reasoning: [
        "Subtract counter observations to obtain an event increase, accounting for resets when present.",
        "Divide by elapsed seconds to obtain requests/s, not requests or milliseconds.",
        "The longer interval includes four idle minutes, so its lower average does not contradict the first-minute burst.",
        "For latency questions, inspect counts by duration range and compare the same population and window.",
        "With 99 observations of 100 ms and one of 10,000 ms, nearest-rank P99 is 100 ms, maximum is 10,000 ms, and mean is 199 ms. A single extreme is not automatically P99.",
        "Merge compatible histogram counts before estimating a population percentile; bucket boundaries limit precision, and averaging percentiles does not reconstruct the distribution.",
      ],
    },
    contrast: [
      {
        alternative: "Use a long-window mean",
        tradeoff:
          "It is stable and compact but hides brief bursts and unequal user experiences.",
        whenNotToUse:
          "Do not use it alone to answer whether a small group experienced severe delays.",
      },
      {
        alternative: "Add a request identifier as a metric label",
        tradeoff:
          "It seems to preserve individual context but creates very high cardinality and expensive time series.",
        whenNotToUse:
          "Do not encode unbounded request identities in aggregate metric labels; use correlated logs or traces for individual requests.",
      },
    ],
    misconceptions: [
      {
        wrong: "A larger cumulative counter means traffic is currently faster.",
        discriminant:
          "Compare increases over equal elapsed intervals rather than lifetime totals.",
        counterexample:
          "A counter stays at one million during a complete traffic stop.",
      },
      {
        wrong: "The average of two instance P99 values is the combined P99.",
        discriminant:
          "Check whether observation counts and the underlying distributions were combined.",
        counterexample:
          "One instance handles ten requests and another handles ten thousand; averaging their two percentile values gives each instance equal weight, not each request.",
      },
    ],
    practiceIds: ["t-61-predict", "t-61-compare"],
    evidenceCriteria: [
      "Calculate a rate with explicit units and interval.",
      "Choose the metric form that retains information needed by the question.",
      "Explain one aggregation limitation without inventing unavailable distribution data.",
    ],
    transfer: {
      variant:
        "Measure completed video encodes per second, queued jobs now, and processing-duration tails; explain why these require different metric forms.",
      domain: "Media processing",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 61. Counter arithmetic assumes no resets only where explicitly stated. The nearest-rank example preserves the planning document's percentile convention. Independent technical review is pending.",
    },
  },
  {
    id: 63,
    rev: "2.2",
    objective:
      "Define a user-relevant SLI, choose a contextual SLO, and calculate the remaining request-based error budget over a declared window.",
    prereqIds: [58, 61],
    mentalModel: {
      definition:
        "A service-level indicator, or SLI, quantifies a defined aspect of service experience. A service-level objective, or SLO, sets a target for that indicator over a declared window. For a good-event ratio target S, the error-budget fraction is 1 minus S; multiplying it by eligible events gives the allowed bad-event count for that evaluated population.",
      analogy:
        "A delivery team defines what counts as an on-time delivery, chooses a monthly target, and tracks how many late deliveries fit within the allowance.",
      analogyLimits:
        "A budget is not permission to harm particular customers. Request-based and time-based budgets are different, rolling windows change over time, and an internal signal can look healthy while the user journey fails.",
      correspondence: [
        ["SLI specification", "Rule for counting on-time deliveries"],
        ["SLO", "Target share delivered on time over a month"],
        ["Error budget", "Allowed share outside that target"],
      ],
    },
    scenario: {
      system:
        "A document search service measures eligible user searches at its public edge.",
      data:
        "A good event is an eligible search returning a correct usable result within 500 ms. The SLO is at least 99.5% good events over a rolling 28-day window. A teaching snapshot contains 100,000 eligible searches and 300 bad events.",
      symptom:
        "The team needs a reliability target and a way to discuss release risk without confusing host uptime with search experience.",
      constraints: [
        "Define eligibility and exclusions before evaluating results; do not exclude failures merely to improve the ratio.",
        "A bad event is counted once even when it is both slow and unsuccessful.",
        "The snapshot calculation is request-based, not an allowance measured in outage minutes.",
      ],
      baseline:
        "The current snapshot has 99,700 good events out of 100,000: a 99.7% SLI.",
    },
    representation: {
      kind: "table",
      caption:
        "Read the measurement, target, and budget as distinct quantities.",
      data: {
        columns: [
          { key: "item", label: "Quantity", emphasis: true },
          { key: "value", label: "Snapshot value" },
          { key: "meaning", label: "Interpretation" },
        ],
        rows: [
          {
            cells: {
              item: "MEASURE — SLI",
              value: "99,700 / 100,000 = 99.7%",
              meaning: "Eligible searches correct and within 500 ms",
            },
          },
          {
            cells: {
              item: "TARGET — SLO",
              value: "At least 99.5% over rolling 28 days",
              meaning: "A chosen target, not the observed result",
            },
          },
          {
            cells: {
              item: "ALLOWANCE — error budget",
              value: "0.5% × 100,000 = 500 bad events",
              meaning: "Snapshot budget for this eligible population",
            },
          },
          {
            cells: {
              item: "USED — bad events",
              value: 300,
              meaning: "60% of the snapshot budget consumed",
            },
            tone: "warn",
          },
          {
            cells: {
              item: "REMAINING — snapshot allowance",
              value: 200,
              meaning: "40% remains; future traffic and rolling expiry change it",
            },
          },
        ],
        note:
          "Synthetic request-based snapshot. Labels carry meaning without color. The budget is not an SLA or a guarantee, and a rolling-window balance is not fixed.",
      },
      textEquivalent:
        "The observed SLI is 99,700 good searches divided by 100,000 eligible searches, or 99.7%. Good means a correct usable result within 500 ms. The SLO is at least 99.5% over rolling 28 days. The bad-event allowance for this snapshot is 0.5% of 100,000, or 500 events. Of these, 300 have been used: 60%. Two hundred remain: 40%. This is a request-based snapshot, not 200 minutes of downtime; future events and rolling expiry change the balance.",
    },
    worked: {
      decision:
        "Use the user-search SLI and a contextual target below 100%, then connect budget consumption to an explicit release-risk discussion.",
      reasoning: [
        "Specify which searches count and what constitutes a correct, timely result before setting a percentage.",
        "Compute the observed SLI separately from the chosen SLO: 99.7% observed versus 99.5% targeted.",
        "Compute allowed bad events as (1 - 0.995) × 100,000 = 500.",
        "Subtract 300 used events to obtain 200 remaining in this snapshot.",
        "A 100% target leaves no error budget: any measured bad event violates it. Arbitrarily approaching 100% can impose costs with little user benefit; choose the target from user needs, dependencies, and feasible investment.",
        "Budget consumption informs decisions but does not prove the next release is safe or replace incident response.",
      ],
    },
    contrast: [
      {
        alternative: "Use host uptime as the SLI",
        tradeoff:
          "It is easy to collect but may not represent whether users obtain usable search results.",
        whenNotToUse:
          "Do not substitute host health for a user-facing SLI when requests can fail on healthy hosts.",
      },
      {
        alternative: "Set a stricter search target",
        tradeoff:
          "A stricter target can reflect higher user need but requires more reliability investment and permits fewer bad events.",
        whenNotToUse:
          "Do not choose extra nines solely for prestige or declare a 100% target as evidence that failure is impossible.",
      },
    ],
    misconceptions: [
      {
        wrong: "The SLO is the percentage we observed today.",
        discriminant:
          "Separate the specification, observed result, target, and evaluation window.",
        counterexample:
          "A 99.7% observed result can satisfy a 99.5% target without changing that target.",
      },
      {
        wrong: "A request-based budget converts directly into downtime minutes.",
        discriminant:
          "Identify the denominator: requests or elapsed time.",
        counterexample:
          "One minute during peak traffic can consume more request-based budget than ten minutes during a quiet period.",
      },
    ],
    practiceIds: ["t-63-compare", "t-63-find-flaw"],
    evidenceCriteria: [
      "Define an SLI that measures the stated user experience.",
      "Keep SLI, SLO, window, and budget units distinct.",
      "Calculate 500 allowed, 300 used, and 200 remaining bad events for the snapshot.",
      "Explain a contextual trade-off between reliability investment and a stricter target.",
    ],
    transfer: {
      variant:
        "Define timely, correct export delivery for a reporting product and distinguish request-based completion success from minutes of API uptime.",
      domain: "Business reporting",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 63 using the SLI/SLO/error-budget model described in Google SRE materials. The target and numbers are teaching assumptions, not universal recommendations. Independent technical review is pending.",
    },
  },
{
  id: 65,
  rev: "3.1",
  objective: "Calculate remaining error budget and choose a release or reliability action using both cumulative consumption and current burn, without treating the budget as permission to harm users.",
  prereqIds: [63],
  mentalModel: {
    definition: "An error budget is the allowed fraction of bad eligible events implied by an SLO: 1 - SLO. Multiply that fraction by eligible events to obtain a request budget, or by duration only for a time-based availability SLI. Remaining budget is allowance minus observed bad events in the same window. Burn rate is observed bad-event fraction divided by allowed bad-event fraction over a stated interval. An agreed product policy turns these measurements into release, escalation, and reliability decisions; the numbers do not choose actions by themselves.",
    analogy: "A shared expedition reserve lets the group take bounded risks; the remaining reserve and rate of consumption determine whether to continue or repair equipment.",
    analogyLimits: "Errors are not interchangeable coins: the same count can repeatedly harm one customer. Reserves cannot justify security breaches, data loss, or ignoring active harm. Bad telemetry or a poorly chosen SLI corrupts the account, and a calendar reset does not repair the service.",
    correspondence: [["SLO allowance", "Agreed expedition reserve"], ["Bad eligible events", "Reserve consumed"], ["Remaining budget and burn", "Reserve left and consumption speed"], ["Release policy", "Agreed continue-or-repair rule"]],
  },
  scenario: {
    system: "The recurring shop checkout API counts eligible checkout attempts at its edge; a server failure or timeout is bad. Client validation rejections are excluded by the agreed SLI.",
    data: "Synthetic fixed 28-day month: exactly 100,000 eligible requests per week, 400,000 total. SLO is 99.9% successful requests, allowing 400 bad requests. Weekly bad counts are 200, 100, 100, and 200. Percentages in the table use each week's denominator; balances use the entire month's allowance.",
    symptom: "Week 1 and week 4 both report 0.2% failures, but the release manager proposes the same feature-release decision despite different balances.",
    constraints: ["This exercise assumes the full monthly denominator is known; in production request totals evolve and forecasting must be labeled, not booked as guaranteed allowance.", "Agreed policy: while budget remains and no fast-burn or severe-impact signal is active, allow bounded canaries; at zero or negative balance stop discretionary feature releases, prioritize reliability, and permit tested corrective changes.", "Page for ongoing urgent impact or confirmed fast burn in paired short and longer windows; weekly aggregates alone cannot justify waking someone. Investigate measurement coverage and concentrated customer harm even with positive balance."],
    baseline: "The preceding comparable month had 200 bad requests out of 400,000 (0.05%): half its 400-request allowance consumed. The current month starts with a fresh 400-request allowance, not a repaired system.",
  },
  representation: {
    kind: "table",
    caption: "The same weekly 0.2% does not buy the same release decision: read the signed monthly balance, not just the weekly rate.",
    data: {
      columns: [{ key: "week", label: "Week" }, { key: "slo", label: "Agreed monthly SLO" }, { key: "error", label: "Observed weekly errors" }, { key: "remaining", label: "Monthly budget remaining", emphasis: true }, { key: "decision", label: "Decision taken" }],
      rows: [
        { cells: { week: 1, slo: "99.9%", error: "200 / 100,000 = 0.2%", remaining: "200 requests (50%)", decision: "Continue bounded feature canary; investigate 2x weekly burn; tune alert to short/long burn evidence, not this weekly rate alone." } },
        { cells: { week: 2, slo: "99.9%", error: "100 / 100,000 = 0.1%", remaining: "100 requests (25%)", decision: "Continue only bounded releases under policy; prioritize the reliability fix and inspect current burn." } },
        { cells: { week: 3, slo: "99.9%", error: "100 / 100,000 = 0.1%", remaining: "0 requests (0%)", decision: "Stop discretionary feature releases; schedule tested corrective work." } },
        { cells: { week: 4, slo: "99.9%", error: "200 / 100,000 = 0.2%", remaining: "-200 requests (-50%)", decision: "Keep feature hold; mitigate and verify recovery; page only if current urgency warrants it." } },
      ],
      note: "Synthetic retrospective ledger, not a live forecast. Signed negative balance exposes overspend. Week 1 is conditionally within the monthly allowance, not proof of sustainable burn: 0.2% / 0.1% = 2x. Weekly data cannot reveal a five-minute incident.",
    },
    textEquivalent: "Each week has 100,000 requests; the fixed 28-day SLO is 99.9%, giving 400 allowed failures. Week 1: 200 failures (0.2%), 200 remaining, bounded canary continues with investigation and burn-alert tuning. Week 2: 100 (0.1%), 100 remaining, bounded releases and reliability priority. Week 3: 100 (0.1%), zero remaining, discretionary features stop. Week 4: 200 (0.2%), minus 200 remaining, feature hold continues and recovery is verified. Both 0.2% weeks burn at 2x; paging requires current impact and shorter-window evidence.",
  },
  worked: {
    decision: "Keep week 4 discretionary feature releases on hold, allow reviewed reliability fixes, and inspect current impact and paired burn windows before deciding to page.",
    reasoning: ["Compute (1 - 0.999) × 400,000 = 400 bad requests allowed, not 400 minutes.", "Subtract cumulative errors: balances are 200, 100, 0, then -200. The final 600 / 400,000 = 0.15% bad exceeds the 0.1% allowance.", "Week 1 consumes half the entire allowance while only a quarter of requests has elapsed. Its 2x burn is a warning, even though the balance is positive; continuing a canary is conditional, not unconditional permission.", "Week 4 has no remaining tolerance under the agreed policy. A freeze includes discretionary risk, not a ban on emergency remediation. Record owner, corrective action, verification interval, and conditions for resuming features.", "At a sustained 1% error rate, burn is 10x; with 200 requests left and 1,000 eligible requests/hour, projected exhaustion is 200 / 10 = 20 hours. This assumes unchanged traffic and error rate, not a guaranteed deadline.", "Use current impact plus confirmed short/long-window burn for urgency; do not page from a stale weekly total or silence a real incident because budget remains."],
  },
  contrast: [
    { alternative: "Fixed monthly ledger versus rolling-window burn monitoring", tradeoff: "A fixed ledger is easy to reconcile and agree on but resets at a boundary. Rolling windows age out old events and paired short/long burn windows react sooner, at the cost of moving balances and noisy low-volume estimates. Burn rate can complement either fixed or rolling SLO accounting; it is not itself a different SLO.", whenNotToUse: "Do not replace an agreed monthly obligation silently with a rolling target. Avoid automatic paging from a single tiny window; check sample size and sustained impact. Do not use monthly totals alone to detect fast incidents." },
    { alternative: "Target 100% availability", tradeoff: "Zero allowed failures leaves no nonzero tolerance to allocate and makes burn-rate division undefined. Absolute uninterrupted service cannot be guaranteed in a fallible distributed service; an aspiration is not an actionable risk policy.", whenNotToUse: "Do not use a 100% target to resolve ordinary feature-versus-reliability tradeoffs. Separate safety, privacy, and correctness obligations from an availability budget." },
  ],
  misconceptions: [
    { wrong: "The goal is 100% availability, so more nines are free improvement.", discriminant: "Ask how much failure is allowed and what engineering or delivery cost buys the extra nine.", counterexample: "For a time-based 28-day SLO, 99.9% permits 40.32 minutes; 99.99% permits 4.032. At 100%, allowance is zero: a single one-second outage violates it, and stopping all deployments still cannot prevent power or dependency failures." },
    { wrong: "The budget is a performance score used to punish the team.", discriminant: "Ask whether the agreed consequence changes product risk or assigns personal blame.", counterexample: "A dependency outage spends the checkout budget without a team deployment. Product pauses a promotion and funds dependency isolation rather than penalizing the on-call engineer. Hiding failures to preserve a score would destroy the evidence the policy needs." },
    { wrong: "A positive balance means every user has an acceptable experience.", discriminant: "Inspect who receives the bad events and whether the SLI covers the critical journey.", counterexample: "All 200 week-1 failures could hit one merchant repeatedly while the global budget remains positive. Segment investigation and mitigation are still necessary." },
  ],
  practiceIds: ["t-65-predict", "t-65-variant"],
  evidenceCriteria: ["Derive the allowance with the right unit and window, then subtract cumulative bad events.", "Explain why equal weekly percentages lead to different release decisions under the stated policy.", "Distinguish current burn urgency from cumulative budget and state what evidence would justify paging.", "Transfer the ledger to late photo jobs without subtracting latency milliseconds from a request budget."],
  transfer: { domain: "Nightly batch photo processing", variant: "A photo pipeline runs only 00:00–06:00. The nightly latency SLO is p95 completion latency <= 10 minutes, operationalized here as at least 95% of 1,000 eligible jobs completing within 10 minutes (nearest-rank empirical percentile, complete coverage). Thus at most 50 jobs may be late. Already 45 are late; a planned filter experiment predicts 20 additional distinct late jobs, while 200 jobs still await processing at 05:00. Decide whether to defer the experiment and reserve capacity for the deadline; identify what happens to unfinished jobs at cutoff. Use the five-job remaining allowance, not an imaginary millisecond wallet. Include unfinished jobs consistently in measurement; a p95 computed only on completed jobs can hide deadline failures. Unlike the shop, there is no daytime capacity to recover this night's deadline." },
  provenance: { reviewed: false, notes: "Drafted in this round, without effective independent review (redigida nesta rodada, sem revisão independente efetiva). Synthetic teaching data; no production-ready runbook or calibrated paging thresholds. Mechanism references for further consultation: Google SRE, Embracing Risk, https://sre.google/sre-book/embracing-risk/ ; SRE Workbook, Alerting on SLOs, https://sre.google/workbook/alerting-on-slos/ . References identified, not independently revalidated in this round. Summary: measure a scoped SLI, subtract consumption, apply an agreed risk policy, verify impact; next apply it to nightly latency. Request budgets do not measure each user's experience or replace judgment." },
}
];
