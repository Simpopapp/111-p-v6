import type { Task } from "@/lib/exercises";
const exact = (picked: string[] | undefined, key: string) => picked?.length === 1 && picked[0] === key;

// Tarefas de prática âncora de Performance (PRD project2 D8 / pacote s3-exercicios).
// Tarefas F9 (pacote s16; conteúdo do subagente).
const TASKS_93_F9: Task[] = [
  {
    id: "t-93-compare",
    conceptId: 93,
    type: "compare",
    prompt:
      "Compare the two checkout windows. Which conclusion best supports the next engineering decision? Choose one.",
    context:
      "Both windows contain 100 completed requests measured from gateway receipt to response completion, using nearest-rank percentiles. Window A: 95 at 100 ms, 3 at 200 ms, 2 at 1000 ms (mean 121 ms, P99 1000 ms). Window B: 95 at 105 ms, 3 at 250 ms, 2 at 2000 ms (mean 147.25 ms, P99 2000 ms). Failures and timeouts are reported separately and have not changed between windows.",
    options: [
      { key: "a", label: "The mean rose about 21.7% but P99 doubled; investigate the tail using traces and segmentation before attributing cause." },
      { key: "b", label: "The mean rose only modestly, so the tail is effectively unchanged and no investigation is warranted." },
      { key: "c", label: "The P99 doubling proves the database is the cause; optimize database queries immediately." },
      { key: "d", label: "Average the two P99 values to decide the combined system's P99." },
    ],
    rubric: {
      criteria: [
        {
          key: "tail-change-and-causality",
          label: "Recognizes the disproportionate tail change without claiming a cause",
          cause:
            "The response either lets the mean conceal a doubled P99 or mistakes a percentile signal for causal evidence.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "a",
        },
      ],
      expected:
        "P99 rises from 1000 to 2000 ms (2×), while mean rises from 121 to 147.25 ms (about 21.7%). This makes tail-focused investigation worthwhile, but the distribution alone cannot identify the responsible dependency. Compare traces, routes, instances, and workload before choosing a fix.",
      nextStep:
        "Choose a segmentation (route, instance, or dependency) and state what trace evidence would distinguish queueing from a slow downstream call.",
    },
    helpLevels: [
      "Compare rank 99 in both sorted samples, separately from the arithmetic mean.",
      "The mean changes by 26.25 ms; P99 changes from 1000 to 2000 ms. Ask whether that proves a specific cause.",
      "Select the option that prioritizes investigation of the tail but requires traces/segmentation before naming a culprit.",
    ],
  },
  {
    id: "t-93-find-flaw",
    conceptId: 93,
    type: "find-flaw",
    prompt:
      "Identify the main flaw in this reliability report and choose the best correction.",
    context:
      "A service reports P99 = 80 ms from successful requests only. During the same window, 4% of requests timed out and were omitted. The dashboard then averages the P99 summaries of two unequal-volume instances to claim the fleet P99 is 80 ms. One instance handled 990 successful requests at 10 ms; the other handled 10 at 1000 ms.",
    options: [
      { key: "a", label: "The report is sound because P99 already includes timeouts and weighting." },
      { key: "b", label: "Both selection and aggregation are flawed: disclose timeouts and population, then merge compatible weighted distributions or observations rather than averaging P99 summaries." },
      { key: "c", label: "Use the maximum latency as the fleet P99; it always equals nearest-rank P99." },
      { key: "d", label: "Average the instance P99 values after weighting each instance equally, regardless of request volume." },
    ],
    rubric: {
      criteria: [
        {
          key: "population-and-aggregation",
          label: "Detects successful-only selection and invalid averaging of percentile summaries",
          cause:
            "The response assumes omitted failures are represented in a successful-only sample, or assumes percentile summaries can be combined arithmetically without preserving request counts and distributions.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "A successful-only P99 is conditional on completing requests and hides the 4% timeouts; report their count/rate and define their treatment. The fleet calculation also cannot average instance P99s. With the stated 990 requests at 10 ms and 10 at 1000 ms, combined nearest-rank P99 at rank 990 is 10 ms, while the simple average of instance P99s (10 and 1000 ms) is 505 ms. Preserve weights and distribution using merged observations or compatible histogram/sketch data; disclose approximation and window alignment.",
      nextStep:
        "Rewrite the report header with population, window, boundary, convention, failures, and aggregation method before using it for a decision.",
    },
    helpLevels: [
      "Ask which requests are absent from the successful-only sample and whether the two instances handled equal volume.",
      "A percentile summarizes its input population; omitted timeouts cannot affect its rank. Percentile summaries also do not retain all counts/distribution detail.",
      "Choose the correction that reports failures and combines weighted underlying distributions, not per-instance P99 numbers.",
    ],
  },
];

export const TASKS_PERFORMANCE: Task[] = [
  {
    id: "t-2-predict",
    conceptId: 2,
    type: "predict",
    prompt:
      "Before observing the requests, predict the values returned at t=20 and t=31 seconds. Choose one.",
    context:
      "At t=0, a product read puts price $40 in a cache with a 30-second TTL. At t=10, an administrator changes the database price to $45. Writes do not invalidate this cache. A read uses an unexpired entry; otherwise it fetches the current database value and caches it. No other reads or writes occur, and reads do not extend the TTL.",
    options: [
      { key: "a", label: "$45 at t=20; $45 at t=31." },
      { key: "b", label: "$40 at t=20; $40 at t=31." },
      { key: "c", label: "$40 at t=20; $45 at t=31." },
      { key: "d", label: "$45 at t=20; $40 at t=31." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-freshness",
          label: "Track cache lifetime independently from database updates.",
          cause:
            "The prediction assumes a database write refreshes a separate cache automatically, or assumes a cache hit extends a fixed TTL despite the stated policy.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "The t=20 request returns the unexpired cached $40. By t=31 the entry has expired, so the read fetches $45 from the database. This reduces repeated database work while allowing stale reads before expiry.",
      nextStep:
        "Add write-time invalidation to the timeline and identify which response changes.",
    },
    helpLevels: [
      "Draw separate timelines for the database value and the cached value.",
      "A write changes only the database in this scenario; the original cache expiry is still t=30.",
      "Evaluate each read against that expiry before deciding whether it reaches the database.",
    ],
  },
  {
    id: "t-2-variant",
    conceptId: 2,
    type: "variant",
    prompt:
      "Transfer the cache reasoning to museum audio guides. Which policy meets the requirement while avoiding a database read for every play? Choose one.",
    context:
      "Unlike the product-price scenario, this system serves exhibit descriptions. Ordinary edits may remain stale for up to 120 seconds. All description reads use one shared cache. Safety closures use a separate uncached alert channel. Writes cannot reliably publish invalidation events. Cache entries can have a fixed lifetime measured from their database fetch.",
    options: [
      { key: "a", label: "Cache descriptions for 10 minutes after each database fetch." },
      {
        key: "b",
        label:
          "Cache descriptions for 90 seconds after each database fetch, without extending expiry on hits.",
      },
      { key: "c", label: "Cache descriptions for 90 seconds after their most recent cache hit." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-staleness",
          label: "Bound stale descriptions independently of reading frequency.",
          cause:
            "The policy either exceeds the permitted stale interval or restarts expiry on cache hits, allowing a popular description to remain stale indefinitely without invalidation.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "A fixed 90-second lifetime bounds stale reuse below the 120-second allowance while serving repeated plays from cache. Sliding expiry can keep a popular old entry alive indefinitely. The separate alert channel carries the stricter safety requirement.",
      nextStep:
        "Place an edit immediately after a cache fill, then simulate continuous plays until the next database fetch.",
    },
    helpLevels: [
      "The changed domain still has the same two stores: an authoritative database and a reusable copy.",
      "Look for an expiry rule that frequent reads cannot postpone.",
      "Test the worst case: an edit just after a cache fill followed by a steady stream of plays.",
    ],
  },
  {
    id: "t-27-find-flaw",
    conceptId: 27,
    type: "find-flaw",
    prompt:
      "Find the change that removes the page-size-dependent database round trips while preserving each order's customer name. Choose one.",
    context:
      "An admin page first fetches 50 orders in one query. It then loops over those orders and awaits getCustomer(order.customerId) once per order. Each call issues a database query; no relation cache is present. The page therefore makes 51 database queries. The customer relation is many-to-one.",
    options: [
      { key: "a", label: "Run the existing customer lookups concurrently." },
      { key: "b", label: "Increase the database connection-pool limit." },
      { key: "c", label: "Fetch the orders with their customer names using a relation join." },
      { key: "d", label: "Add an index on the customer primary key." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-roundtrips",
          label: "Replace per-order relation lookups with a set-based fetch.",
          cause:
            "The proposed fix changes scheduling, connection capacity, or individual lookup speed while preserving the extra query for every order.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "Joining the many-to-one customer relation retrieves the required names with the orders in one query. Batched eager loading would also remove the per-order query growth, though it may use two queries. Concurrent lookups still issue 51 queries and may increase database pressure.",
      nextStep:
        "Compare query counts for pages of 10, 50, and 100 orders before and after the relation fetch.",
    },
    helpLevels: [
      "Count database calls rather than only measuring how long the loop takes.",
      "Parallel execution overlaps calls but does not eliminate their round trips.",
      "Move relation retrieval out of the per-order loop and into a set-based database operation.",
    ],
  },
  {
    id: "t-91-predict",
    conceptId: 91,
    type: "predict",
    prompt:
      "Before publishing the dashboard, predict the mean and P99 for this sample. Use the nearest-rank percentile definition and choose one.",
    context:
      "A batch contains exactly 1,000 requests: 980 complete in 20 ms and 20 complete in 1,020 ms. Nearest-rank P99 is the value at position ceil(0.99 × N) in the ascending list. The dashboard also reports the arithmetic mean.",
    options: [
      { key: "a", label: "Mean 40 ms; P99 20 ms." },
      { key: "b", label: "Mean 20 ms; P99 1,020 ms." },
      { key: "c", label: "Mean 40 ms; P99 1,020 ms." },
      { key: "d", label: "Mean 1,020 ms; P99 1,020 ms." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-tail",
          label: "Use a weighted mean and locate the percentile's ranked request.",
          cause:
            "The prediction substitutes the typical fast response for either the weighted mean or the 990th ranked response, hiding the slow minority.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "The mean is (980 × 20 + 20 × 1,020) / 1,000 = 40 ms. Positions 981 through 1,000 are 1,020 ms, so position 990 gives a P99 of 1,020 ms. A small mean does not rule out a costly tail from slow database calls or remote hops.",
      nextStep:
        "Split the slow requests by database duration and remote-hop duration to locate the tail's dominant contributor.",
    },
    helpLevels: [
      "The mean uses all durations; P99 selects a position in a sorted list.",
      "Find the last position occupied by a 20 ms request, then calculate the P99 rank.",
      "Check whether rank 990 falls inside the final block of 20 slow requests, and weight both groups when calculating the mean.",
    ],
  },
  ...TASKS_93_F9,
{
    id: "t-92-predict",
    conceptId: 92,
    type: "predict",
    prompt:
      "Choose the conclusion supported by these trials before adding more workers.",
    context:
      "Synthetic ten-second trials use the same order mix. One worker completes 200 orders, four complete 500, and sixteen complete 400. Every success requires one shared serialized 20 ms commit. Sixteen workers admit 1000 orders; incomplete and failed outcomes are tracked separately.",
    options: [
      {
        key: "a",
        label:
          "Sixteen workers provide 100 orders/s because 1000 orders were admitted.",
      },
      {
        key: "b",
        label:
          "Four workers complete 50 orders/s, matching the ideal serial ceiling; inspect contention and bound admission before adding workers.",
      },
      {
        key: "c",
        label:
          "Sixteen workers complete 40 orders/s, so doubling workers should produce 80 orders/s without changing the commit path.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "r92p",
          label:
            "Use successful completions and the shared resource ceiling to select the next action.",
          cause:
            "You may be treating admissions as completed work or assuming worker capacity scales independently of the required serialized commit.",
          check: (a) =>
            a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "Divide successes by ten seconds: 20/s, 50/s, and 40/s. The ideal shared commit ceiling is 1000 ms / 20 ms = 50/s. Four workers reach that modeled ceiling; sixteen do not remove it. Inspect commit occupancy, lock waits, failures, and queue age, and keep admission within demonstrated safe capacity. Repeat comparable longer trials before claiming sustainability.",
      nextStep:
        "Write separate counters for offered, admitted, successful, failed, and still-pending orders, then identify which counter determines useful throughput.",
    },
    helpLevels: [
      "Choose the event that means an order is actually finished, and keep its time window fixed.",
      "Compute each successful count divided by ten. Then compute how many non-overlapping 20 ms commits fit in one second.",
      "Choose the conclusion using 50 successful orders/s and the shared serial ceiling. Admissions of 100/s do not establish completion throughput of 100/s.",
    ],
  },
  {
    id: "t-92-variant",
    conceptId: 92,
    type: "variant",
    prompt:
      "A laboratory has 6000 results left to sign and ten minutes before its delivery deadline. Choose the supported capacity decision.",
    context:
      "Synthetic signing model: every result needs one serialized 200 ms signature from a hardware device; preparation is already fast enough to keep it busy. The queue is bounded, signatures must remain valid, and no retries or failures are included in this ideal calculation.",
    options: [
      {
        key: "a",
        label:
          "Add preparation workers; they can make the same signing device finish all 6000 results within ten minutes.",
      },
      {
        key: "b",
        label:
          "Keep the queue bounded and assume that this alone makes the deadline feasible.",
      },
      {
        key: "c",
        label:
          "The device can sign at most 3000 results in ten minutes; change signing capacity or the negotiated deadline while preserving validity.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "r92v",
          label:
            "Compare required work with bottleneck capacity over the remaining deadline.",
          cause:
            "You may be confusing buffering or upstream concurrency with additional capacity at the serialized signing device.",
          check: (a) =>
            a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "The ideal device capacity is 1000/200 = 5 signatures/s. Ten minutes contain 600 seconds, so at most 3000 signatures fit. Finishing 6000 requires at least 1200 seconds under this ideal model. More preparation workers and a bounded queue cannot change that bound. Additional authorized signing capacity or a renegotiated deadline needs validation; do not bypass signature correctness.",
      nextStep:
        "Calculate required signatures per second, then specify how any proposed change affects the signing bottleneck rather than only its input queue.",
    },
    helpLevels: [
      "Find the resource every completed result must use and compare remaining work with remaining time.",
      "Convert 200 ms per signature into signatures per second; multiply by 600 seconds.",
      "The ideal limit is 5/s × 600 s = 3000 signatures. Choose the capacity or deadline change, not additional preparation workers.",
    ],
  },
  {
    id: "t-94-predict",
    conceptId: 94,
    type: "predict",
    prompt:
      "Choose the statement that correctly separates the sample percentile from the modeled page slow-event probability.",
    context:
      "A teaching sample has 99 responses at 100 ms and one at 10,000 ms. Use nearest-rank percentiles. Separately, assume each of 50 parallel required calls independently takes 100 ms with probability 0.99 or 10,000 ms with probability 0.01. Ignore other page overhead.",
    options: [
      {
        key: "a",
        label:
          "Sample P99 is 10,000 ms, and every page is slow because it has fifty calls.",
      },
      {
        key: "b",
        label:
          "Sample P99 is 100 ms, so only 1% of these fifty-call pages can encounter a slow dependency.",
      },
      {
        key: "c",
        label:
          "Sample P99 is 100 ms, maximum is 10,000 ms, and mean is 199 ms; the model gives about 39.5% probability of at least one slow call.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "r94p",
          label:
            "Apply nearest-rank and the independent wait-for-all product without claiming a guarantee.",
          cause:
            "You may be equating P99 with the maximum or applying a single-call slow probability directly to a page that requires many calls.",
          check: (a) =>
            a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "Nearest-rank selects ceil(0.99 × 100) = rank 99, which is 100 ms. The maximum is 10,000 ms; the mean is (99 × 100 + 10,000)/100 = 199 ms. Under the additional independent model, all 50 calls are fast with probability 0.99^50 ≈ 60.5%, so at least one is slow with probability about 39.5%. This is not a measured page percentile, a guarantee, or evidence that real dependency delays are independent.",
      nextStep:
        "Recalculate for ten required calls and identify what evidence would challenge the independence assumption.",
    },
    helpLevels: [
      "Treat the ranked sample and the hypothetical probability model as two distinct calculations.",
      "Locate rank 99 in the sorted sample. For the page, first calculate the probability that every required call is fast.",
      "Rank 99 is 100 ms. The page slow-event probability is 1 - 0.99^50 ≈ 39.5%; choose the statement that also preserves maximum 10,000 ms and mean 199 ms.",
    ],
  },
  {
    id: "t-94-variant",
    conceptId: 94,
    type: "variant",
    prompt:
      "Choose the justified tail policy for the offline report and its interactive preview.",
    context:
      "A financial report waits for 50 services. The overnight version needs every section, has a morning deadline, and may not add duplicate load. The interactive preview has a strict response deadline and may label optional sections unavailable. Shared service saturation is possible, and cancellation is not guaranteed.",
    options: [
      {
        key: "a",
        label:
          "Hedge every service in both modes because duplicate requests have no meaningful capacity cost.",
      },
      {
        key: "b",
        label:
          "For the offline report, track the slowest required service and deadline feasibility without hedging; for the preview, remove optional sections from the blocking path and return explicit partial results at its deadline.",
      },
      {
        key: "c",
        label:
          "Use a short timeout in both modes and label each timed-out required section successfully complete.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "r94v",
          label:
            "Fit the intervention to completeness, deadline, and duplicate-load constraints.",
          cause:
            "You may be treating hedging as free capacity or assuming a timeout can turn missing required data into a successful complete report.",
          check: (a) =>
            a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "The slowest required service determines wait-for-all completion. The offline report may tolerate longer waits only while its morning deadline remains feasible; monitor progress and escalate an at-risk deadline without adding prohibited duplicates. The preview can stop blocking on optional sections and explicitly disclose missing data. A timeout bounds caller waiting but does not prove remote cancellation or successful completion. Hedging is not justified under the stated load constraint.",
      nextStep:
        "Name one required and one optional section, then define what the preview displays when each is unavailable.",
    },
    helpLevels: [
      "Compare what each mode must deliver, when it must deliver it, and whether additional requests are permitted.",
      "A complete offline report cannot silently drop required sections. A preview may disclose missing optional sections, but duplicate load remains constrained.",
      "Choose the mode-specific policy: monitor complete offline work against its deadline, and use explicit partial results for optional preview data rather than unconditional hedging or false success.",
    ],
  },
  {
    id: "t-41-compare", conceptId: 41, type: "compare",
    prompt: "Choose one comparison and next investigation supported by the evidence.",
    context: "Separate matched trials complete three equal request batches, with no pending work or intentional growing cache. Post-major-collection heap floors are A: 80, 100, 120, 140 MiB; B: 80, 80, 80, 80 MiB. B peaks at 180 MiB during each batch. The diagnostic ownership path has not yet been inspected.",
    options: [
      { key: "a", label: "B has a leak because its temporary peak is much larger than its 80 MiB baseline; remove its live data first." },
      { key: "b", label: "A shows retained growth worth investigating; compare obsolete-object lifetimes and retaining paths before naming the owning reference." },
      { key: "c", label: "A needs more collection cycles, since a collector can reclaim completed payloads even if a permanent array still references them." },
    ],
    rubric: {
      criteria: [
        { key: "r41c", label: "Choose the decision supported by lifecycle evidence and the scenario constraints.", cause: "You may be treating a temporary allocation peak as a leak, or assuming collection can reclaim objects still reachable from a live root.", check: (a) => exact(a.picked, "b") },
      ],
      expected: "A gains 20 MiB per completed batch after comparable collections; B returns to baseline despite peaks. This supports investigating A, not claiming an owner from the graph alone. Compare snapshots safely and inspect paths from live roots to objects whose intended lifetime has ended. Reachable obsolete objects cannot be fixed by simply requesting more collection.",
      nextStep: "For each trial, write its post-collection change across 3000 completions, then name one retaining-path observation needed to distinguish obsolete payloads from legitimate live data.",
    },
    helpLevels: [
      "Compare measurements taken at the same lifecycle point; distinguish a peak from what remains after work finishes.",
      "Subtract each trial's initial post-collection value from its final value. Ask whether the numbers alone identify a reference owner.",
      "Choose b: A retains 60 MiB more after three batches, while B's floor is unchanged. Inspect object lifetimes and retaining paths; a trend is not an ownership proof.",
    ],
  },
  {
    id: "t-41-variant", conceptId: 41, type: "variant",
    prompt: "Choose one investigation and verification plan for the next clinical imaging shift.",
    context: "An offline clinical workstation cannot restart during an eight-hour acquisition shift. Full heap dumps are prohibited because they may expose patient data. After each completed scan closes and comparable collections finish, heap floors are 200, 230, 260 and 290 MiB; pending scans are zero. Preview listeners are a hypothesis, not a confirmed cause. Required clinical records must remain intact.",
    options: [
      { key: "a", label: "Schedule hourly restarts during acquisition and call the lower starting heap a verified correction." },
      { key: "b", label: "Export full heap dumps for diagnosis and delete all scan records from memory and durable storage to guarantee lower usage." },
      { key: "c", label: "Use approved local non-sensitive lifecycle counters and aggregate ownership evidence; test removal of obsolete preview listeners, preserve required records, and compare post-collection floors over equivalent closed scans." },
    ],
    rubric: {
      criteria: [
        { key: "r41v", label: "Choose the decision supported by lifecycle evidence and the scenario constraints.", cause: "You may be equating a reset with root-cause correction, ignoring evidence-handling constraints, or deleting required records instead of releasing obsolete application references.", check: (a) => exact(a.picked, "c") },
      ],
      expected: "Choose c. Rising floors after completed scans justify investigating retention but do not prove the listener hypothesis. Use privacy-approved local evidence such as listener registrations minus removals and counts of closed previews still retained. If ownership evidence confirms obsolete listeners, remove them when previews close and repeat matched scans. Verify stable obsolete-object counts and heap floors while preserving acquisition correctness and required records. Restarts violate the shift constraint and only reset symptoms; full dumps violate the privacy constraint.",
      nextStep: "Specify a non-sensitive counter for preview creation and disposal, the lifecycle event that should balance it, and a matched before/after scan sequence that could falsify the listener hypothesis.",
    },
    helpLevels: [
      "List what the shift and privacy constraints rule out before deciding what evidence can be collected.",
      "Compare object lifecycle counters locally; require ownership evidence before treating preview listeners as the cause, and preserve required records.",
      "Choose c: gather approved local aggregate evidence, test listener cleanup only when supported, and verify repeated post-collection floors without restarting or exporting patient data.",
    ],
  },
];