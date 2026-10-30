// Lições âncora autorizadas (PRD project2 D2 / pacote s1-licoes).
// Conteúdo gerado pelo enxame, integrado pelo agente principal (practiceIds
// sincronizados com src/lib/exercises-data).

import type { Lesson } from "./types";

export const LESSONS_PERFORMANCE: Lesson[] = [
  {
    id: 2,
    rev: "2.1",
    objective:
      "Choose a cache key and freshness policy from a concrete read workload, then predict hits, misses, and stale responses.",
    prereqIds: [],
    mentalModel: {
      definition:
        "Caching stores a reusable result closer to its consumer so later requests can avoid repeated computation or retrieval. Correct reuse depends on the cache key, freshness rules, and access boundaries.",
      analogy:
        "A student writes an answer on a sticky note instead of solving the same problem repeatedly.",
      analogyLimits:
        "The note can become outdated, and two apparently similar questions may depend on different currencies, users, or permissions. Remembering an answer does not establish that reuse is correct.",
      correspondence: [
        ["Cache key", "Label identifying the exact question"],
        ["Cached value", "Written answer"],
        ["TTL or invalidation", "Rule for replacing an outdated note"],
      ],
    },
    scenario: {
      system: "A product catalog using cache-aside reads.",
      data: "A teaching sequence requests the same product in USD at 0, 10, and 20 seconds. A cached value has a 30-second TTL; the source price changes at second 15.",
      symptom:
        "Database reads fall, but the request at second 20 receives the previous display price.",
      constraints: [
        "Catalog display prices may be stale for up to 30 seconds.",
        "Checkout must validate the current price against the authoritative source.",
        "Currency must be part of the cache key.",
      ],
      baseline:
        "Without caching, all three reads reach the database. With the stated cache, one miss loads the value and two hits reuse it.",
    },
    representation: {
      kind: "request-flow",
      caption: "A cache hit avoids a source read but does not prove freshness.",
      data: {
        nodes: [
          { id: "reader", label: "Catalog request" },
          { id: "cache", label: "Cache: product and currency key" },
          { id: "db", label: "Authoritative product store" },
          { id: "response", label: "Display response" },
        ],
        edges: [
          { from: "reader", to: "cache", label: "Look up key" },
          { from: "cache", to: "response", label: "Hit: reuse value" },
          { from: "cache", to: "db", label: "Miss: fetch and populate" },
          { from: "db", to: "response", label: "Return fetched value" },
        ],
        window: { durationMs: 30000, label: "One illustrative TTL" },
        limits: { ttlSeconds: 30, keyDimensions: ["productId", "currency"] },
      },
      textEquivalent:
        "At second 0, a miss loads the USD price. Seconds 10 and 20 are hits. The source changes at second 15, so the second-20 response is stale but within the stated display tolerance.",
    },
    worked: {
      decision:
        "Cache catalog display values by product and currency for 30 seconds, while validating checkout prices independently.",
      reasoning: [
        "Repeated reads of the same key are candidates for reuse because their output dependencies match.",
        "The initial miss performs a database read and stores the result; the next two requests reuse it.",
        "A source update does not automatically invalidate a separate cache, so the second-20 response remains old.",
        "The display policy explicitly accepts bounded staleness; checkout has a different correctness requirement.",
        "Measure hit ratio, miss latency, and stale-value incidents; a high hit ratio alone does not demonstrate correctness.",
      ],
    },
    contrast: [
      {
        alternative: "Invalidate on every product update",
        tradeoff:
          "Can reduce stale reads but introduces delivery, ordering, and race conditions between updates and cache fills.",
        whenNotToUse:
          "Do not assume invalidation guarantees immediate consistency unless the full update-and-read protocol establishes it.",
      },
    ],
    misconceptions: [
      {
        wrong: "A cache key containing the product ID is always sufficient.",
        discriminant:
          "List every input that changes the returned value or who may see it.",
        counterexample:
          "A USD request populates a product-only key; a later EUR request receives the USD amount labeled as EUR.",
      },
    ],
    practiceIds: ["t-2-predict", "t-2-variant"],
    evidenceCriteria: [
      "Classify the three requests as miss, hit, and hit.",
      "Identify the second-20 response as stale and explain why it is permitted only for display.",
      "Include currency in the key and separate checkout correctness from catalog freshness.",
    ],
    transfer: {
      variant:
        "Cache a school timetable while ensuring student-specific accommodations cannot leak through a shared cache key.",
      domain: "Education software",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 2. TTL and request times are teaching values, not recommended production defaults. Independent technical review is pending.",
    },
  },
  {
    id: 27,
    rev: "2.1",
    objective:
      "Detect query-count growth from a request trace and replace per-record relationship fetches with a bounded retrieval plan.",
    prereqIds: [],
    mentalModel: {
      definition:
        "An N+1 query pattern occurs when one query retrieves N records and subsequent code issues an additional query for each record to obtain related data.",
      analogy:
        "A waiter brings ten pancakes, then makes a separate trip for each pancake's butter.",
      analogyLimits:
        "A database join can multiply rows, and one enormous trip may transfer more data than several bounded trips. Fewer queries are not automatically less total work.",
      correspondence: [
        ["Initial list query", "Trip bringing the pancakes"],
        ["Per-record relationship query", "Separate butter trip for each pancake"],
        ["Batch fetch", "One trip carrying the required butter portions"],
      ],
    },
    scenario: {
      system: "A blog feed displaying 20 posts and their authors.",
      data: "The teaching model has five distinct authors and a fixed 4 ms round-trip overhead per sequential query, excluding execution and transfer.",
      symptom:
        "The trace contains one post query followed by 20 author queries.",
      constraints: [
        "The feed remains paginated to 20 posts.",
        "Only author ID and display name are needed.",
        "The solution must preserve posts and their author mapping.",
      ],
      baseline:
        "There are 21 queries and 84 ms of modeled round-trip overhead; repeated authors do not prevent the naive loop from fetching them again.",
    },
    representation: {
      kind: "query-explainer",
      caption: "Compare query-count growth, not just one fast local execution.",
      data: {
        statement:
          "Feed request: SELECT id, author_id, title FROM posts ORDER BY created_at DESC LIMIT 20 — only the author retrieval differs by strategy.",
        versions: [
          {
            label: "Lazy per-post author fetch",
            plan: [
              {
                step: "List posts",
                detail: "SELECT id, author_id, title FROM posts ORDER BY created_at DESC LIMIT 20",
                cost: "1 query · 4 ms",
              },
              {
                step: "Fetch author for each post",
                detail: "SELECT id, display_name FROM authors WHERE id = $1 — issued once per post",
                cost: "20 queries · 80 ms",
              },
            ],
          },
          {
            label: "Batch distinct authors",
            plan: [
              {
                step: "List posts",
                detail: "Same list query; collect the distinct author IDs from the bounded page",
                cost: "1 query · 4 ms",
              },
              {
                step: "Fetch distinct authors in one query",
                detail: "SELECT id, display_name FROM authors WHERE id IN (...)",
                cost: "1 query · 4 ms",
              },
            ],
          },
          {
            label: "Posts joined to authors",
            plan: [
              {
                step: "Single joined query",
                detail: "SELECT p.id, p.title, a.display_name FROM posts p JOIN authors a ON a.id = p.author_id ORDER BY p.created_at DESC LIMIT 20",
                cost: "1 query · 4 ms",
              },
            ],
          },
        ],
        plan: [
          {
            step: "List posts",
            detail: "SELECT id, author_id, title FROM posts ORDER BY created_at DESC LIMIT 20",
            cost: "1 query · 4 ms",
          },
          {
            step: "Fetch distinct authors in one query",
            detail: "SELECT id, display_name FROM authors WHERE id IN (...)",
            cost: "1 query · 4 ms",
          },
        ],
        note: "Sequential queries; 4 ms fixed modeled round-trip overhead; execution and transfer excluded. Overhead estimates, not total latency: a join can multiply rows and change pagination semantics.",
      },
      textEquivalent:
        "For 20 posts, lazy loading issues 21 queries with 84 ms modeled overhead. A distinct-author batch uses two queries and 8 ms; a suitable join uses one query and 4 ms. These are overhead estimates, not total latency predictions.",
    },
    worked: {
      decision:
        "Fetch the page of posts, collect its distinct author IDs, then fetch those authors in one bounded query and map by ID.",
      reasoning: [
        "Count queries within one feed request: one list query plus 20 relationship queries equals 21.",
        "Five distinct authors mean repeated per-post lookups are redundant, but the structural problem is the loop issuing queries.",
        "Collect unique author IDs from the already bounded page; the second query returns at most those five authors.",
        "Map each post to its author without changing post ordering or dropping records with missing optional relationships.",
        "Compare a join as another valid plan, then inspect row volume and execution plans rather than declaring any single query optimal.",
      ],
    },
    contrast: [
      {
        alternative: "Join the required author fields into the post query",
        tradeoff:
          "Can eliminate a round trip, but joins to multiple one-to-many relationships may multiply rows and complicate pagination.",
        whenNotToUse:
          "Do not blindly join every relationship when row multiplication changes page semantics or transfers excessive repeated data.",
      },
    ],
    misconceptions: [
      {
        wrong: "A fast individual query means there is no N+1 problem.",
        discriminant:
          "Measure how query count grows when the number of displayed records grows.",
        counterexample:
          "An author query taking only 4 ms of overhead still contributes 80 ms when issued sequentially for 20 posts.",
      },
    ],
    practiceIds: ["t-27-find-flaw"],
    evidenceCriteria: [
      "Derive N + 1 queries and calculate 21 for 20 posts.",
      "Produce a bounded two-query retrieval plan with correct author mapping.",
      "Explain why query count, row volume, and pagination semantics all matter.",
    ],
    transfer: {
      variant:
        "Replace one remote employee-directory call per payroll row with a bounded batch lookup, preserving missing-employee handling.",
      domain: "Payroll integration",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 27. Latency arithmetic isolates illustrative round-trip overhead and makes no total-performance guarantee. Independent technical review is pending.",
    },
  },
  {
    id: 91,
    rev: "2.1",
    objective:
      "Calculate nearest-rank P50 and P99 from a defined latency sample and distinguish tail evidence from an average.",
    prereqIds: [],
    mentalModel: {
      definition:
        "Latency is elapsed time between defined start and completion events. A percentile summarizes a distribution: under the nearest-rank convention, P99 is the value at rank ceil(0.99 × N) after sorting N observations.",
      analogy:
        "Record the waiting time for every customer in a queue, then inspect the customer near the slow end rather than only the average wait.",
      analogyLimits:
        "A percentile is not the probability that the next customer waits exactly that long, and a small or selectively recorded sample may not represent future traffic. Different percentile conventions can also differ.",
      correspondence: [
        ["Latency observation", "One customer's measured wait"],
        ["P50", "Middle ranked wait"],
        ["P99", "Wait at the 99th-percentile rank"],
      ],
    },
    scenario: {
      system: "A checkout endpoint measured from request arrival to response completion.",
      data: "A teaching sample contains 100 completed requests: 95 at 50 ms, three at 200 ms, and two at 1000 ms.",
      symptom:
        "The mean looks modest while some customers experience a full second of waiting.",
      constraints: [
        "Use nearest-rank percentiles for this exercise.",
        "Report the sample size and measurement boundary.",
        "Track timeouts and failures separately rather than silently omitting them.",
      ],
      baseline:
        "The mean is 73.5 ms, P50 is 50 ms, and P99 is 1000 ms. The mean conceals the magnitude of the slow tail.",
    },
    representation: {
      kind: "latency-histogram",
      caption: "Locate percentile ranks in the cumulative request count.",
      data: {
        unit: "ms",
        bins: [
          { min: 0, max: 100, count: 95, label: "95 observations at 50 ms" },
          { min: 100, max: 500, count: 3, label: "3 observations at 200 ms" },
          { min: 500, max: 1500, count: 2, label: "2 observations at 1000 ms" },
        ],
        sample: { count: 100, values: [{ value: 50, count: 95 }, { value: 200, count: 3 }, { value: 1000, count: 2 }] },
        markers: [
          { label: "P50", value: 50 },
          { label: "Mean", value: 73.5 },
          { label: "P99", value: 1000 },
        ],
        scenario: "Completed checkout requests in one illustrative window",
        note: "Exact repeated values support the arithmetic; coarse bins alone would only bound a percentile.",
      },
      textEquivalent:
        "Sorted ranks 1–95 are 50 ms, ranks 96–98 are 200 ms, and ranks 99–100 are 1000 ms. P50 is rank 50: 50 ms. P99 is rank 99: 1000 ms. Mean: 7350 divided by 100, or 73.5 ms.",
    },
    worked: {
      decision:
        "Report P50, P99, sample size, and failures, then use traces to investigate slow database calls or remote hops.",
      reasoning: [
        "Define the boundary first; browser-perceived latency and server-only latency measure different intervals.",
        "Sort the 100 observations and select rank ceil(0.50 × 100) = 50 for P50.",
        "Select rank ceil(0.99 × 100) = 99 for P99; it falls among the 1000 ms observations.",
        "Compute the mean as (95 × 50 + 3 × 200 + 2 × 1000) / 100 = 73.5 ms.",
        "The distribution demonstrates a tail, not its cause. Correlate slow traces with queries, network hops, and queueing before choosing a fix.",
      ],
    },
    contrast: [
      {
        alternative: "Report only average latency",
        tradeoff:
          "A mean is compact and useful for some aggregate calculations but can hide a small group of very slow requests.",
        whenNotToUse:
          "Do not use the mean alone to judge a user-facing tail-latency objective.",
      },
    ],
    misconceptions: [
      {
        wrong: "The overall P99 is the average of each server's P99.",
        discriminant:
          "Ask whether summaries preserve the weighted underlying distribution.",
        counterexample:
          "Server A handles 990 requests at 10 ms and B handles 10 at 1000 ms. Their P99 average is 505 ms, but combined nearest-rank P99 is 10 ms at rank 990.",
      },
    ],
    practiceIds: ["t-91-predict"],
    evidenceCriteria: [
      "Calculate P50 = 50 ms, P99 = 1000 ms, and mean = 73.5 ms using the stated convention.",
      "Explain why coarse histogram bins cannot reveal exact values without additional information.",
      "Request measurement boundaries, sample sizes, failures, and slow traces before recommending an optimization.",
    ],
    transfer: {
      variant:
        "Measure document-processing turnaround from submission to delivery, including failed jobs, and explain why median completion time alone misses delayed customers.",
      domain: "Administrative workflow analytics",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 91, Latency, with percentiles as its measurement lens. Canonical concept 93 remains distinct. Samples are instructional, not service-level recommendations. Independent technical review is pending.",
    },
  },
  {
    id: 44,
    rev: "2.1",
    objective:
      "Use backlog growth and downstream saturation to choose admission control before assuming more workers will increase useful throughput.",
    prereqIds: [15],
    mentalModel: {
      definition:
        "Backpressure propagates limited consumption capacity upstream so producers slow, pause, or receive explicit rejection. It bounds admitted work; it does not automatically increase capacity or guarantee that producers cooperate.",
      analogy:
        "A receiver asks someone pouring water to slow down before the cup overflows.",
      analogyLimits:
        "Software signals can be delayed or ignored. Rejected producers may retry and amplify load, and accepted work already in the system still needs processing.",
      correspondence: [
        ["Producer rate", "Pouring rate"],
        ["Bounded buffer", "Cup capacity"],
        ["Upstream capacity signal", "Request to slow pouring"],
      ],
    },
    scenario: {
      system: "A research export service shares one saturated storage dependency.",
      data:
        "Offered load is 6 jobs/s and useful completion is 4 jobs/s. Unfinished work begins at 20. Adding workers in a controlled trial leaves completions at 4/s and increases storage waits.",
      symptom:
        "Unfinished work rises to 40 after ten seconds while oldest-job age increases.",
      constraints: [
        "Clients can obey a temporary admission limit and delay requests locally.",
        "No accepted job may be silently discarded.",
        "The shared dependency is already saturated.",
      ],
      baseline:
        "Admitting all 6 jobs/s adds 2 unfinished jobs/s. Admitting 3/s while completing 4/s drains existing work at 1 job/s under the teaching assumptions.",
    },
    representation: {
      kind: "event-track",
      caption:
        "Compare offered, admitted, and completed rates before and after upstream control.",
      data: {
        unit: "s",
        lanes: [
          { id: "load", label: "Offered / admitted work", kind: "signal" },
          { id: "service", label: "Useful service", kind: "signal" },
          { id: "backlog", label: "Unfinished work", kind: "signal" },
        ],
        events: [
          { ts: 0, lane: "load", label: "Offered 6/s; admitted 6/s", kind: "info" },
          { ts: 0, lane: "service", label: "4/s; shared storage saturated", kind: "warn" },
          { ts: 0, lane: "backlog", label: "20 unfinished", kind: "info" },
          { ts: 10, lane: "backlog", label: "40 unfinished", kind: "warn" },
          { ts: 10, lane: "load", label: "Admit 3/s; cooperative clients defer excess", kind: "info" },
          { ts: 20, lane: "backlog", label: "30 unfinished", kind: "success" },
          { ts: 30, lane: "backlog", label: "20 unfinished", kind: "success" },
        ],
        window: { from: 0, to: 30 },
        note:
          "Constant-rate conservation model, not S5 throughput. Deferred client work is outside this backlog and has not disappeared. Real control needs capacity bounds, fairness, retry guidance, and verification of useful completions.",
      },
      textEquivalent:
        "Starting with 20 unfinished jobs, admitting 6/s and completing 4/s yields 40 after ten seconds. At t=10 admission falls to 3/s while service remains 4/s. Unfinished work then falls to 30 at t=20 and 20 at t=30. Excess offered work is deferred by cooperative clients, not silently lost.",
    },
    worked: {
      decision:
        "Bound admission, communicate delay upstream, and verify backlog age and useful completions before adding more workers against the saturated dependency.",
      reasoning: [
        "A rising count and rising oldest age indicate sustained accumulation, not just a brief burst.",
        "The controlled worker trial did not increase useful completions, so worker shortage is not established.",
        "At 6 admitted minus 4 completed, backlog grows by 2/s.",
        "Reducing admitted work to 3/s leaves 1/s of service to drain existing work.",
        "Measure deferred requests and user impact as well as server backlog; moving waiting upstream is a trade-off.",
        "After stabilizing, investigate the shared bottleneck and test whether additional capacity would raise useful throughput.",
      ],
    },
    contrast: [
      {
        alternative: "Add worker capacity after measuring worker saturation",
        tradeoff:
          "Can raise throughput when workers are the bottleneck and dependencies have headroom.",
        whenNotToUse:
          "Do not assume more workers help when a shared dependency is saturated and a controlled trial adds contention rather than completions.",
      },
      {
        alternative: "Keep buffering a short bounded burst",
        tradeoff:
          "Avoids rejecting a temporary surge but requires enough capacity and an acceptable waiting budget.",
        whenNotToUse:
          "Do not retain unbounded work when sustained admission exceeds service or deadlines make the waiting work useless.",
      },
    ],
    misconceptions: [
      {
        wrong: "A larger queue is backpressure.",
        discriminant: "Look for an upstream change in admitted rate.",
        counterexample:
          "Doubling storage while admitting 6/s and completing 4/s only delays overflow; it does not slow producers.",
      },
      {
        wrong: "A falling server backlog proves demand was satisfied.",
        discriminant: "Track rejected and deferred work outside that backlog.",
        counterexample:
          "Admission control lowers server backlog while clients accumulate deferred requests; end-to-end waiting may still be unacceptable.",
      },
    ],
    practiceIds: ["t-44-compare"],
    evidenceCriteria: [
      "Calculate backlog growth and drain rates with explicit boundaries.",
      "Separate offered load from admitted load.",
      "Use downstream saturation evidence before recommending workers.",
      "Name the upstream cost and verify the intervention.",
    ],
    transfer: {
      variant:
        "A video receiver cannot decode incoming frames fast enough. Compare requesting a lower sending rate, bounded buffering, and adding decoder capacity under a fixed network budget.",
      domain: "Live video processing",
    },
    provenance: {
      reviewed: false,
      notes:
        "Canonical concept 44 in Performance. Rates are illustrative; S5 slow mode shows accumulation but does not implement upstream flow control or capacity benchmarking. Independent review is pending.",
    },
  },

  // Lição 93 — P99 Latency (F9, pacote s16; conteúdo do subagente).
  {
  id: 93,
  rev: "3.0",
  objective:
    "Interpret a P99 change from an explicitly defined request distribution and choose what evidence to collect before optimizing a tail.",
  prereqIds: [91, 60, 92],
  mentalModel: {
    definition:
      "P99 is a rank-based summary of a defined set of latency observations. With nearest-rank convention, sort N observations and select rank ceil(0.99 × N). It describes the observed distribution at a stated boundary and window; it does not identify a cause or guarantee future latency.",
    analogy:
      "Imagine arranging every checkout wait from shortest to longest and reading the wait at the 99th position out of 100.",
    analogyLimits:
      "Real traffic is not a fixed queue: request mix, concurrency, time windows, failures, and measurement boundaries change. A percentile rank is not a promise about the next request, and aggregating percentiles alone loses the underlying distribution.",
    correspondence: [
      ["One latency observation", "One measured checkout wait"],
      ["Sorted sample", "Waits arranged shortest to longest"],
      ["Nearest-rank P99", "Value at rank ceil(0.99 × N)"],
    ],
  },
  scenario: {
    system:
      "A checkout service measures end-to-end request latency from gateway receipt to completed response, across a 10-minute window.",
    data:
      "In the baseline window there are 100 completed requests: ranks 1–95 are 100 ms, ranks 96–98 are 200 ms, and ranks 99–100 are 1000 ms. A later comparable window has 100 requests: 95 at 105 ms, three at 250 ms, and two at 2000 ms.",
    symptom:
      "The mean changes from 121 ms to 147.25 ms, while nearest-rank P99 rises from 1000 ms to 2000 ms; the tail worsens more sharply than the average suggests.",
    constraints: [
      "Use nearest-rank convention and state N, boundary, and window whenever reporting the percentile.",
      "The histogram bins are exact-value groups for this teaching sample; coarse production buckets only bound a percentile unless finer data is available.",
      "Completed requests exclude timeouts and failures unless those outcomes are represented separately; never silently treat them as fast or absent without disclosure.",
      "Do not average per-instance or per-window P99 values as a substitute for merging weighted observations or compatible histograms.",
    ],
    baseline:
      "Baseline: 95 × 100 + 3 × 200 + 2 × 1000 = 12,100 ms total, mean 121 ms; rank ceil(0.99 × 100) = 99 is 1000 ms. Later: 95 × 105 + 3 × 250 + 2 × 2000 = 14,725 ms, mean 147.25 ms; rank 99 is 2000 ms.",
  },
  representation: {
    kind: "latency-histogram",
    caption:
      "Read the cumulative counts to locate rank 99; the second window doubles P99 although its mean rises by only about 21.7%.",
    data: {
      unit: "ms",
      bins: [
        { from: 100, to: 100, count: 95 },
        { from: 200, to: 200, count: 3 },
        { from: 1000, to: 1000, count: 2 },
      ],
      sample: [...Array(95).fill(100), ...Array(3).fill(200), ...Array(2).fill(1000)],
      markers: [
        { label: "P50", value: 100, convention: "nearest-rank" },
        { label: "P99", value: 1000, convention: "nearest-rank" },
      ],
      scenario: { label: "Baseline mean", mean: 121 },
      note:
        "Exact repeated values are shown to make ranks auditable. Counts are 95 + 3 + 2 = 100; rank 99 lies in the 1000 ms group. Coarse buckets, small samples, censored failures, and incompatible windows limit inference.",
    },
    textEquivalent:
      "100 observations: ranks 1–95 = 100 ms, 96–98 = 200 ms, 99–100 = 1000 ms. P50 is rank 50 = 100 ms; P99 is rank ceil(0.99 × 100) = 99 = 1000 ms. Mean = (95 × 100 + 3 × 200 + 2 × 1000) / 100 = 121 ms. The later sample has P99 2000 ms and mean 147.25 ms.",
  },
  worked: {
    decision:
      "Treat the P99 increase as a signal to investigate the affected tail, not as proof that a particular component is slow. Compare compatible distributions and traces before selecting an optimization.",
    reasoning: [
      "Fix the measurement boundary, population, time window, and percentile convention before comparing values.",
      "For N = 100, nearest-rank P99 selects rank ceil(99) = 99, not the maximum by definition.",
      "Cumulative counts put rank 99 in the final two observations: 1000 ms at baseline and 2000 ms later.",
      "The mean rises 26.25 ms (about 21.7%), while P99 doubles; the mean alone understates the tail change.",
      "Split or correlate by route, instance, dependency, and trace; inspect timeouts, errors, and traffic mix before attributing cause.",
      "Do not average percentile summaries across servers or windows: use weighted underlying observations or a compatible mergeable distribution.",
    ],
  },
  contrast: [
    {
      alternative: "Report only mean latency",
      tradeoff:
        "The mean is useful for total work and broad trends, but a small slow population can dominate user harm without moving it proportionally.",
      whenNotToUse:
        "Do not use the mean alone to judge a user-facing tail objective or to dismiss a sharp P99 regression.",
    },
    {
      alternative: "Compare only the maximum",
      tradeoff:
        "The maximum surfaces the single most extreme observation but is highly sensitive to sample size and isolated anomalies; P99 summarizes a specified rank instead.",
      whenNotToUse:
        "Do not treat P99 as a replacement for failure counts, nor interpret it as a guarantee about every request.",
    },
  ],
  misconceptions: [
    {
      wrong: "P99 always means the slowest request, or 99% of requests take exactly that long.",
      discriminant:
        "Ask for N, rank convention, sample boundary, and the number of observations above the selected rank.",
      counterexample:
        "For 100 observations with 99 at 100 ms and one at 10,000 ms, nearest-rank P99 is rank 99 = 100 ms; maximum is 10,000 ms. The extreme observation is not automatically P99.",
    },
    {
      wrong: "Averaging instance P99 values or window P99 values gives the combined P99.",
      discriminant:
        "Check whether the underlying counts and weights are preserved; percentile summaries discard distribution detail.",
      counterexample:
        "Instance A serves 990 requests at 10 ms and B serves 10 at 1000 ms. A's P99 is 10 ms and B's is 1000 ms; their simple average is 505 ms, but the combined 1000-request nearest-rank P99 is rank 990 = 10 ms.",
    },
  ],
  practiceIds: ["t-93-compare", "t-93-find-flaw"],
  evidenceCriteria: [
    "Calculate P99 under a named convention from a distribution whose count, boundary, and sample size are explicit.",
    "Explain how P99 and mean can move by different proportions and identify why that changes investigation priority.",
    "Reject a percentile computed only from successful requests when failures/timeouts are material, and request their separate counts or an explicit treatment.",
    "Explain why averaging per-instance/window percentiles can conceal a tail and name a distribution-preserving aggregation approach.",
    "Distinguish a tail signal from causal evidence and select trace or segmentation data to investigate next.",
  ],
  transfer: {
    variant:
      "For a document-rendering pipeline, compare two explicitly sampled submission-to-delivery windows. Include retries, timeouts, and unfinished jobs separately; use the changed P99 to prioritize trace investigation without assuming the renderer is the cause.",
    domain: "Asynchronous document processing",
  },
  provenance: {
    reviewed: false,
    notes:
      "New editorial proposal for canonical concept 93, informed by the existing latency lesson and canonical relationship to composition. Percentiles use nearest-rank examples with explicit instructional samples; examples are not service-level recommendations. Independent technical and editorial review is pending.",
  },
},
{
    id: 92,
    rev: "3.0",
    objective:
      "Identify a shared bottleneck from controlled concurrency trials and choose an admission or capacity change using successful completions per second.",
    prereqIds: [91, 44],
    mentalModel: {
      definition:
        "Throughput is completed work per unit of time at a stated boundary. Useful throughput counts successful business completions, not arrivals, admissions, attempts, or retries. Concurrency is work in flight; adding it helps only while the resources needed to finish that work have spare capacity.",
      analogy:
        "Several checkout clerks prepare receipts, but every receipt must pass through one shared stamp before it is finished.",
      analogyLimits:
        "Software work can overlap, fail, retry, or contend for resources. A real database may have many independent paths rather than one stamp. The analogy describes the serialized resource in this example, not all databases.",
      correspondence: [
        ["Worker", "Clerk preparing a receipt"],
        ["Serialized database commit", "Shared stamp used by one clerk at a time"],
        ["Successful completion", "Finished receipt after stamping"],
        ["Admission control", "Limit on receipts allowed into the working area"],
      ],
    },
    scenario: {
      system:
        "A store's order-receipt service has configurable workers and one shared serialized database commit path.",
      data:
        "Synthetic steady ten-second trials offer 100 orders/s. With one worker, 200 orders succeed; with four, 500 succeed; with sixteen, 400 succeed. Each successful order requires a serialized commit occupying 20 ms in the idealized model. In the sixteen-worker trial, contention and failed attempts consume additional database time.",
      symptom:
        "More workers increase admitted work and database contention, but useful throughput falls from 50 to 40 successful orders/s.",
      constraints: [
        "Count each successfully committed order once; retries and failed attempts are not useful completions.",
        "Compare the same request mix and ten-second measurement boundary after warm-up.",
        "Report admissions, successful completions, failures, and queue age separately.",
        "Do not change order correctness or remove the required commit.",
        "All numbers are teaching inputs, not production measurements or recommended worker counts.",
      ],
      baseline:
        "One worker: 200/10 = 20 successful orders/s. Four workers: 500/10 = 50/s. Sixteen workers: 400/10 = 40/s. The idealized serial ceiling is 1000/20 = 50 commits/s, before contention or failures.",
    },
    representation: {
      kind: "request-flow",
      caption:
        "Follow work through the serialized commit. Window counters show admissions, while worker labels show successful completions per second from separate ten-second trial counts.",
      data: {
        nodes: [
          {
            id: "orders",
            label: "Synthetic offered load: 100 orders/s",
            kind: "client",
          },
          {
            id: "gate",
            label: "Admission gate: reject excess offered orders",
            kind: "edge",
          },
          {
            id: "one",
            label: "1 worker: 200 successes/10 s = 20/s",
            kind: "service",
          },
          {
            id: "four",
            label: "4 workers: 500 successes/10 s = 50/s",
            kind: "service",
          },
          {
            id: "sixteen",
            label: "16 workers: 400 successes/10 s = 40/s",
            kind: "service",
          },
          {
            id: "db",
            label: "Shared serial commit: 20 ms; ideal ceiling 50/s",
            kind: "store",
          },
        ],
        edges: [
          { from: "orders", to: "gate", label: "Same offered load in separate trials" },
          { from: "gate", to: "one", label: "Trial A" },
          { from: "gate", to: "four", label: "Trial B" },
          { from: "gate", to: "sixteen", label: "Trial C" },
          { from: "one", to: "db", label: "Required commit" },
          { from: "four", to: "db", label: "Same shared path" },
          { from: "sixteen", to: "db", label: "Additional contention" },
        ],
        window: [
          {
            ts: "A: 10-second trial",
            accepted: 200,
            rejected: 800,
            destination: "one",
          },
          {
            ts: "B: 10-second trial",
            accepted: 500,
            rejected: 500,
            destination: "four",
          },
          {
            ts: "C: 10-second trial",
            accepted: 1000,
            rejected: 0,
            destination: "sixteen",
          },
        ],
      },
      textEquivalent:
        "Three separate synthetic ten-second trials each offer 1000 orders. A admits 200, rejects 800, and completes 200 successfully: 20/s. B admits 500, rejects 500, and completes 500: 50/s. C admits 1000, rejects none, and completes 400: 40/s; its other 600 admissions are not successful completions in the window. Track their pending or failed outcomes separately. All workers share a required 20 ms serial commit, giving an ideal ceiling of 50/s. Admissions are not throughput.",
    },
    worked: {
      decision:
        "Keep admission within the demonstrated safe capacity while investigating commit contention; do not add workers to the same saturated serial path.",
      reasoning: [
        "Define completion as one successfully committed order, then divide successful counts by the ten-second window.",
        "The trials produce 20/s, 50/s, and 40/s. Accepting 100/s in trial C does not mean completing 100/s.",
        "One worker leaves capacity unused in this model; four reach the ideal serial ceiling of 1000/20 = 50/s.",
        "Sixteen workers do not remove serialization. Contention and failed attempts can consume time without completing additional orders.",
        "Inspect commit occupancy, lock waits, failed attempts, queue age, and comparable latency distributions before changing capacity.",
        "A ten-second count alone does not prove sustainable capacity. Repeat longer comparable trials and account for unfinished work and failures.",
        "Reducing serial occupancy or safely partitioning independent work may raise the ceiling; admission control protects capacity but does not create it.",
      ],
    },
    contrast: [
      {
        alternative: "Add workers while the shared dependency has spare capacity",
        tradeoff:
          "Can overlap independent waits and raise completions, but consumes connections and memory and may expose the next bottleneck.",
        whenNotToUse:
          "Do not increase workers blindly when commit occupancy and lock waits already show a saturated shared resource.",
      },
      {
        alternative: "Shorten or safely partition the serialized commit path",
        tradeoff:
          "Can change the capacity limit but requires correctness analysis and a controlled load test; partitioning may introduce cross-partition coordination.",
        whenNotToUse:
          "Do not partition operations that require a shared invariant without a protocol preserving that invariant.",
      },
      {
        alternative: "Bound admission and retain a finite queue",
        tradeoff:
          "Limits overload and queue growth, but excess demand must wait, be rejected, or move to a separately managed workflow.",
        whenNotToUse:
          "Do not present a bounded queue as a solution to indefinitely sustained demand above completion capacity.",
      },
    ],
    misconceptions: [
      {
        wrong: "Reducing application preparation time automatically increases end-to-end useful throughput.",
        discriminant:
          "Ask which latency was reduced, at what concurrency, and whether successful completions increased at the same measurement boundary.",
        counterexample:
          "A synthetic larger batch cuts application preparation time from 10 ms to 5 ms per order, then releases many commits together. Database contention lowers successful completions from 500 to 400 per ten seconds: 50/s to 40/s. Faster preparation is not faster end-to-end completion under load.",
      },
      {
        wrong: "Accepting 100 orders/s means the service has throughput of 100 orders/s.",
        discriminant:
          "Separate arrivals and admissions from successfully completed business operations.",
        counterexample:
          "Trial C admits 1000 orders in ten seconds but completes only 400 successfully. Its useful throughput is 40/s; pending work and failures need separate accounting.",
      },
    ],
    practiceIds: ["t-92-predict", "t-92-variant"],
    evidenceCriteria: [
      "Calculate 20/s, 50/s, and 40/s from successful completions and the stated window.",
      "Locate the required serialized commit and derive its ideal 50/s ceiling.",
      "Distinguish admitted work, retries, failures, pending work, and successful completions.",
      "Choose a bottleneck measurement or safe admission response before adding workers.",
      "Explain when extra concurrency helps and when it only adds contention.",
    ],
    transfer: {
      variant:
        "A hospital laboratory uploads results through one serialized signing device. Unlike interactive checkout, overnight work may queue, but all results must finish before a morning deadline. Identify the signing capacity, compare remaining work with available time, and decide whether a bounded queue is sufficient or signing capacity must change.",
      domain: "Healthcare laboratory operations",
    },
    provenance: {
      reviewed: true,
      notes:
        "Revalidação independente s40: revisão efetiva registrada. Confirmado o alinhamento de misconceptions[0]: reduzir preparação não garante maior throughput útil fim a fim, como demonstra a queda sintética de 50/s para 40/s sob contenção. Verificadas as dez tarefas do pacote, incluindo as soluções únicas b e c das tarefas desta lição, e as contas do teto serial de 50/s e de 3000 assinaturas em dez minutos. Referência conceitual: Raj Jain, The Art of Computer Systems Performance Analysis. Cenários são sintéticos, sem benchmark de produção. A convenção nearest-rank do simulador foi conferida separadamente: P99=100ms, máximo=10000ms e média=199ms; esse exemplo não integra o texto atual desta lição.",
    },
  },
  {
    id: 94,
    rev: "3.0",
    objective:
      "Calculate fan-out amplification under explicit assumptions and choose a tail intervention that fits completion requirements and load limits.",
    prereqIds: [91, 11],
    mentalModel: {
      definition:
        "Tail latency concerns unusually slow observations in a latency distribution. When a response waits for every parallel dependency, its dependency-wait time is the maximum of those waits. If dependency fast events are independent, the probability that all are fast is the product of their individual probabilities.",
      analogy:
        "A group can leave only when every traveler has arrived; one late traveler delays the departure.",
      analogyLimits:
        "Dependencies may share queues, networks, or hosts, so delays can be correlated. A page may render partial content or stop waiting at a deadline. The analogy and product calculation apply only to the stated wait-for-all model.",
      correspondence: [
        ["Dependency request", "Traveler expected at departure"],
        ["Wait-for-all page", "Departure requiring every traveler"],
        ["Slowest dependency", "Last traveler to arrive"],
        ["Partial response at a deadline", "Leaving without an optional traveler"],
      ],
    },
    scenario: {
      system:
        "A store's inventory page launches 50 parallel read requests and waits for all results before rendering.",
      data:
        "A teaching sample contains 100 dependency responses: 99 at 100 ms and one at 10,000 ms. For the fan-out calculation only, assume every call independently draws from a two-point distribution with those same probabilities: 0.99 at 100 ms and 0.01 at 10,000 ms.",
      symptom:
        "A dependency can have nearest-rank P99 of 100 ms while the wait-for-all page has about a 39.5% chance of encountering at least one slow dependency under the hypothetical independent model.",
      constraints: [
        "Use nearest-rank percentiles for the 100-response teaching sample.",
        "The product calculation requires independent calls; the sample alone does not establish that assumption or estimate future traffic reliably.",
        "All calls start together; page dependency-wait time is their maximum. Rendering and network overhead outside these calls are excluded.",
        "Optional recommendation results may be omitted, but required inventory results must not be reported as successful when unavailable.",
        "Duplicate reads are allowed only with a bounded load budget; no duplicate writes are proposed.",
      ],
      baseline:
        "For the 100-response sample, rank ceil(0.99 × 100) = 99 gives P99 = 100 ms; maximum = 10,000 ms; mean = (99 × 100 + 10,000)/100 = 199 ms. Under the additional independent model, 50-call all-fast probability is 0.99^50 ≈ 60.5%, not 99%.",
    },
    representation: {
      kind: "table",
      caption:
        "Calculate the probability of at least one slow dependency, not an invented page percentile.",
      data: {
        columns: [
          { key: "fanout", label: "Parallel required calls" },
          { key: "allFast", label: "All fast: 0.99^n" },
          { key: "someSlow", label: "At least one slow: 1 - 0.99^n", emphasis: true },
        ],
        rows: [
          {
            cells: {
              fanout: 1,
              allFast: "0.99 = 99%",
              someSlow: "0.01 = 1%",
            },
          },
          {
            cells: {
              fanout: 10,
              allFast: "≈ 90.4%",
              someSlow: "≈ 9.6%",
            },
          },
          {
            cells: {
              fanout: 50,
              allFast: "≈ 60.5%",
              someSlow: "≈ 39.5%",
            },
            tone: "warn",
          },
        ],
        note:
          "Hypothetical independent two-point model: each call takes 100 ms with probability 0.99 or 10,000 ms with probability 0.01. Calls start together and all are required. Rounded probabilities are not measured page percentiles. Shared causes can invalidate the product calculation.",
      },
      textEquivalent:
        "For independent calls, multiply their fast probabilities. One required call has a 1% slow-event probability. Ten have 1 - 0.99^10, about 9.6%. Fifty have 1 - 0.99^50, about 39.5%. The 100-observation source example has nearest-rank P99 100 ms, maximum 10,000 ms, and mean 199 ms; these are different summaries from the page slow-event calculation.",
    },
    worked: {
      decision:
        "Remove optional calls from the required render path, set dependency deadlines consistent with the page budget, and consider bounded hedging only for safe reads with spare independent capacity.",
      reasoning: [
        "Identify whether the page waits for every dependency. In this model, its dependency-wait time is the maximum, not the average, of the 50 waits.",
        "Keep the sample arithmetic separate from the probability model: nearest-rank P99 is rank 99 at 100 ms, while the single 10,000 ms response determines the sample maximum.",
        "Under independent 0.99 fast events, all 50 are fast with probability 0.99^50 ≈ 0.605; at least one is slow with probability about 0.395.",
        "Reducing required fan-out from 50 to 10 changes the modeled slow-event probability to about 9.6%, but omitted data must be optional or obtained through a correct alternative design.",
        "A deadline limits waiting and enables an explicit partial or failed response; it does not make an unfinished dependency succeed or prove remote work stopped.",
        "A delayed hedge may help a safe read if another replica can finish sooner. Budget extra attempts, cancel losers where possible, and verify shared bottlenecks are not being amplified.",
        "Measure end-to-end distributions, incomplete responses, correlated traces, and dependency load. Do not infer production page behavior from the toy product alone.",
      ],
    },
    contrast: [
      {
        alternative: "Reduce required fan-out or render optional data progressively",
        tradeoff:
          "Reduces exposure to slow dependencies but may change freshness, completeness, payload size, or aggregation work.",
        whenNotToUse:
          "Do not omit a result that is required for a correct decision or replace many calls with an unbounded expensive aggregate.",
      },
      {
        alternative: "Use per-dependency deadlines and explicit fallback",
        tradeoff:
          "Bounds caller waiting but trades completeness or success for latency; remote work may continue unless cancellation is effective.",
        whenNotToUse:
          "Do not label missing required inventory as a successful complete page.",
      },
      {
        alternative: "Send a delayed hedge for a safe read",
        tradeoff:
          "May reduce waits when replica delays differ, but adds load and can worsen an overloaded shared dependency.",
        whenNotToUse:
          "Do not hedge non-idempotent writes or duplicate calls into a saturated shared bottleneck without an established safety and load budget.",
      },
      {
        alternative: "Accept the tail for an offline complete report",
        tradeoff:
          "Avoids duplicate load and preserves completeness, but consumes more elapsed time and may miss a completion deadline.",
        whenNotToUse:
          "Do not accept an unbounded tail for an interactive response with a strict user-facing deadline.",
      },
    ],
    misconceptions: [
      {
        wrong: "Improving the average dependency latency necessarily fixes the page.",
        discriminant:
          "For a wait-for-all page, inspect the slowest required call and the joint distribution, not just the mean of individual calls.",
        counterexample:
          "In a synthetic page instance, 49 calls finish at 100 ms and one at 10,000 ms. Making those 49 calls finish at 50 ms reduces their mean across the page's calls from 298 ms to 249 ms, but the page still waits 10,000 ms for the last call.",
      },
      {
        wrong: "A dependency P99 of 100 ms guarantees a 50-call page finishes quickly.",
        discriminant:
          "State the percentile convention, sample, fan-out, and dependence assumptions before making a page-level claim.",
        counterexample:
          "The sample of 99 responses at 100 ms and one at 10,000 ms has nearest-rank P99 100 ms. Under the explicitly assumed independent model, a 50-call page encounters a slow call about 39.5% of the time, not every time and not only 1% of the time.",
      },
    ],
    practiceIds: ["t-94-predict", "t-94-variant"],
    evidenceCriteria: [
      "Calculate sample P99 = 100 ms, maximum = 10,000 ms, and mean = 199 ms without confusing them.",
      "Derive 1 - 0.99^50 ≈ 39.5% and state independence and wait-for-all assumptions.",
      "Explain why reducing fast-call time may leave the page's slowest required call unchanged.",
      "Choose among reduced fan-out, deadlines, hedging, and accepting delay using completeness and load constraints.",
      "Report partial or failed responses separately instead of declaring a timeout to be a successful result.",
    ],
    transfer: {
      variant:
        "A financial reporting job aggregates 50 services. An overnight report must be complete by morning and cannot add duplicate load; an interactive preview must return within a user-facing deadline and may mark optional sections unavailable. Locate the tail in the slowest required service and justify different waiting, fallback, or fan-out policies for the two modes.",
      domain: "Financial reporting",
    },
    provenance: {
      reviewed: true,
      notes:
        "Revisão técnica independente s39 concluída: revisão efetiva registrada. Verificados todos os campos da lição e as tarefas t-94-predict e t-94-variant, incluindo rubricas executáveis, causas prováveis, respostas esperadas e pistas graduadas. Confirmados nearest-rank P99 = 100 ms, máximo = 10.000 ms e média = 199 ms contra percentile e P99_NEAREST_RANK_EXAMPLE em src/lib/simulators.ts. Recalculados 1 - 0,99^10 ≈ 9,6%, 1 - 0,99^50 ≈ 39,5% e o contraexemplo de média 298 para 249 ms sem redução do máximo. Conferidos independência, espera por todas as chamadas, limites de deadlines e hedging, contraexemplos e os oito critérios de profundidade, incluindo transferência para relatórios financeiros. Referência técnica declarada na lição: Dean e Barroso, The Tail at Scale, CACM, 2013, DOI 10.1145/2408776.2408794. Os números são didáticos, não tráfego medido. Ressalvas externas registradas para o conceito canônico 94 e a descrição de competência da bancada; não constituem afirmações aprovadas por esta revisão.",
    },
  },
{
  "id": 41,
  "rev": "1.0",
  "objective": "Distinguish temporary allocation from unintended retention using comparable post-collection heap samples, then choose a retaining-path investigation and a lifecycle fix.",
  "prereqIds": [],
  "mentalModel": {
    "definition": "A memory leak is memory that remains retained after its intended useful lifetime. In garbage-collected runtimes, an unintended reference path from a live root can keep otherwise obsolete objects reachable, so collection cannot reclaim them. In manually managed systems, failing to release an allocation can also leak memory. A growing post-collection live set under comparable workloads is evidence to investigate, not proof by itself: legitimate caches and unfinished work can also grow.",
    "analogy": "A shop clears finished orders from its counter, but a permanent filing list still points to every discarded order folder. The cleaner must keep anything still listed.",
    "analogyLimits": "Collectors trace reachability, not business usefulness or written lists. Unreachable cycles can be collected by tracing collectors. Native allocations and resources may require explicit cleanup; process RSS is not the same measurement as managed heap usage.",
    "correspondence": [
      ["Live root and reference chain", "Permanent filing list pointing to folders"],
      ["Completed request payload", "Folder no longer needed by the shop"],
      ["Collection of unreachable objects", "Cleaner removing unlisted folders"],
      ["Lifecycle cleanup", "Removing obsolete entries from the permanent list"]
    ]
  },
  "scenario": {
    "system": "The Academy shop runs a long-lived order-summary service with a process-wide diagnostic array.",
    "data": "Synthetic matched trials A and B each run three batches of 1000 completed requests. Each batch is followed by an idle interval and a comparable completed major collection. Trial A appends request payloads to a diagnostic array without removing them. Trial B keeps aggregate counters only. Units are MiB of managed heap used; no native-memory measurements are included.",
    "symptom": "Both trials have allocation peaks, but only A has a steadily rising post-collection floor after completed batches.",
    "constraints": [
      "Same request mix, worker count, warm-up and completed-work boundary in both trials.",
      "No pending requests, intentional growing cache or background backlog in this teaching model.",
      "Collection observations are supplied synthetic data, not a recommendation to force collection in production.",
      "Preserve required business records in durable storage; the diagnostic array is not an audit store.",
      "A 512 MiB heap limit is a capacity constraint, not a measured crash time."
    ],
    "baseline": "After warm-up both trials use 80 MiB after collection. A then retains 100, 120 and 140 MiB; B returns to 80 MiB after every batch."
  },
  "representation": {
    "kind": "table",
    "caption": "Compare post-collection floors across equal completed batches, not just the largest allocation peak.",
    "data": {
      "note": "Synthetic separate trials. Peaks occur during batches; floors are measured after idle and comparable major collections. All memory values are managed heap used in MiB.",
      "columns": [
        {"key": "batch", "label": "Completed batches"},
        {"key": "ap", "label": "A peak (MiB)"},
        {"key": "af", "label": "A after collection (MiB)", "emphasis": true},
        {"key": "bp", "label": "B peak (MiB)"},
        {"key": "bf", "label": "B after collection (MiB)", "emphasis": true}
      ],
      "rows": [
        {"cells": {"batch": "0: warm-up baseline", "ap": 80, "af": 80, "bp": 80, "bf": 80}},
        {"cells": {"batch": "1: 1000 requests", "ap": 180, "af": 100, "bp": 180, "bf": 80}},
        {"cells": {"batch": "2: 2000 requests total", "ap": 200, "af": 120, "bp": 180, "bf": 80}},
        {"cells": {"batch": "3: 3000 requests total", "ap": 220, "af": 140, "bp": 180, "bf": 80}}
      ]
    },
    "textEquivalent": "Separate synthetic trials A and B start at 80 MiB after warm-up. After batch 1 (1000 completed requests), A peaks at 180 MiB and settles at 100 MiB after idle and major collection; B peaks at 180 and settles at 80. After batch 2 (2000 total), A peaks at 200 and settles at 120; B peaks at 180 and settles at 80. After batch 3 (3000 total), A peaks at 220 and settles at 140; B peaks at 180 and settles at 80. A's floor rises by 20 MiB per 1000 completions, totaling 60 MiB above baseline. B's floor is stable despite repeated allocation peaks. Values describe managed heap used, not RSS, and do not establish an exact failure time."
  },
  "worked": {
    "decision": "Investigate the diagnostic array's retaining paths and replace indefinite payload retention with counters or explicitly bounded, expiring diagnostics; verify the result with matched repeated batches.",
    "reasoning": [
      "B demonstrates that a 180 MiB peak alone does not imply a leak: temporary allocations become collectible.",
      "A's post-collection floor increases 80 → 100 → 120 → 140 MiB while all batches finish. The increase is 60 MiB across 3000 completions, or 20 MiB per batch in this model.",
      "The time series prioritizes retention investigation; it does not identify an owning reference by itself. Compare safely captured heap snapshots at equivalent lifecycle points and inspect dominators and retaining paths.",
      "In this specified scenario the path is a live process-wide diagnostic array pointing to completed request payloads. Reachability explains why another collection cannot free those payloads.",
      "Remove unnecessary payload references at lifecycle completion, or retain only a bounded, expiring diagnostic sample when justified. Preserve required order records separately.",
      "Repeat the same workload and confirm that obsolete payload counts and the post-collection floor stabilize. Check correctness, diagnostic usefulness, collection activity and latency separately; no latency effect is measured here.",
      "A restart can temporarily recover headroom but the same retention policy recreates growth. Rising collection frequency or eventual OOM can accompany a leak, but neither is necessary or sufficient evidence, and the three samples do not predict an exact crash time."
    ]
  },
  "contrast": [
    {
      "alternative": "Keep high temporary allocation with a stable live set",
      "tradeoff": "May still incur collection CPU or pauses and deserve allocation tuning, without implying unintended retention.",
      "whenNotToUse": "Do not delete useful live data solely because one heap peak is high."
    },
    {
      "alternative": "Use a bounded diagnostic sample with explicit expiry",
      "tradeoff": "Preserves some debugging context while bounding retained data; byte size and cleanup behavior must be checked, not just entry count.",
      "whenNotToUse": "Do not treat eviction from diagnostic memory as permission to delete legally required durable records."
    },
    {
      "alternative": "Restart or raise the memory limit as temporary containment",
      "tradeoff": "Can buy recovery time but does not remove the retaining reference; collect safe evidence first when feasible.",
      "whenNotToUse": "Do not call containment a verified fix or extrapolate an exact OOM time from three heap samples."
    }
  ],
  "misconceptions": [
    {
      "wrong": "A high heap reading proves a memory leak.",
      "discriminant": "Compare live-set floors after equivalent completed work and comparable collections, and establish whether retained objects have outlived their purpose.",
      "counterexample": "B repeatedly reaches 180 MiB yet returns to 80 MiB; its peaks alone do not demonstrate a leak."
    },
    {
      "wrong": "The garbage collector eventually frees all objects that the business no longer needs.",
      "discriminant": "Collection follows reachability, not application intent.",
      "counterexample": "A's permanent diagnostic array still points to completed payloads, so those payloads remain reachable through repeated collections."
    },
    {
      "wrong": "A restart that lowers memory proves the leak is fixed.",
      "discriminant": "Verify the retention slope under repeated matched work after the change, rather than the immediate reset.",
      "counterexample": "Restarting A removes its array contents, but the unchanged append policy recreates 20 MiB of retained growth per batch in this model."
    },
    {
      "wrong": "Every rising process RSS graph is a managed-object leak.",
      "discriminant": "Separate managed heap used, allocator reservation, native buffers and legitimate live work before identifying the mechanism.",
      "counterexample": "A runtime may keep reserved pages after managed objects are collected; RSS need not fall with the post-collection live set."
    }
  ],
  "practiceIds": [
    "t-41-compare",
    "t-41-variant"
  ],
  "evidenceCriteria": [
    "Use the four comparable post-collection samples to distinguish A's 20 MiB-per-batch growth from B's stable floor.",
    "Explain how a live root retains obsolete payloads and why additional collection cannot reclaim them.",
    "Separate a retention hypothesis from proof supplied by object lifetimes and retaining paths.",
    "Choose lifecycle cleanup or bounded diagnostics while preserving required durable records.",
    "Explain why restart is containment and why RSS, GC frequency and OOM alone do not establish this mechanism.",
    "Transfer the investigation to a privacy-constrained application without exporting sensitive heap contents."
  ],
  "transfer": {
    "domain": "Offline clinical imaging workstation",
    "variant": "A workstation remains open for an eight-hour imaging shift and cannot be restarted during acquisition. After each scan closes, pending work is zero, but comparable post-collection heap samples rise. Patient data cannot leave the device and full heap dumps are prohibited. Choose local non-sensitive lifecycle counters and safe aggregate retaining-path investigation, then test removal of obsolete preview listeners without discarding required clinical records."
  },
  "provenance": {
    "reviewed": false,
    "notes": "Authored for package s44-performance-41; no independent technical review or learner validation has occurred. Canonical concept 41 and lesson 92 were inspected. All batch counts and heap values are synthetic teaching inputs, not measured runtime behavior. Mechanism reference for later review: MDN, JavaScript memory management, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management (reference supplied for consultation, not fetched or independently verified in this package). Managed reachability does not cover all native-resource leaks. Integration and independent technical review remain pending."
  }
},
];