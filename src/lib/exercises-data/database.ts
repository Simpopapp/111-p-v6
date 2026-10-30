import type { Task } from "@/lib/exercises";
const exact = (picked: string[] | undefined, key: string) => picked?.length === 1 && picked[0] === key;

// Tarefas F9 (pacote s15; conteúdo do subagente).
const TASKS_25_26_F9: Task[] = [
  {
    id: "t-25-compare",
    conceptId: 25,
    type: "compare",
    prompt:
      "A planner uses a sequential scan for this catalog request, although an index on category_id exists. Which explanation is best supported by the information given, and what evidence would you inspect before changing the index?",
    context:
      "The table has 240,000 products. The request filters on category_id = 42 and active = true, orders by created_at descending, and returns 30 rows. Measurements indicate that the predicate may match a substantial share of the table, but no target-engine plan output or representative runtime comparison is provided.",
    options: [
      {
        key: "a",
        label:
          "The sequential scan may be reasonable if many rows qualify; inspect the plan, selectivity, and measured work before deciding whether a different index helps.",
      },
      {
        key: "b",
        label:
          "The index is defective because every query with an indexed filter should use an index scan.",
      },
      {
        key: "c",
        label:
          "The limit proves that the database reads only 30 rows, so the sequential scan must be caused by a missing index on created_at.",
      },
      {
        key: "d",
        label:
          "Add indexes to category_id, active, and created_at separately without measuring; the planner will combine them at no additional write cost.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice_selectivity",
          label: "Connects scan choice to selectivity",
          cause:
            "Treats an index as automatically cheaper without considering how many rows qualify or how much table data must be fetched.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
        {
          key: "choice_evidence",
          label: "Names relevant evidence",
          cause:
            "Infers the correct access path from the index declaration or result limit alone instead of inspecting plan and workload evidence.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
      ],
      expected:
        "Option A is best supported. An index can be ignored when the predicate matches a large fraction of the table or when its use would require costly row fetches. A 30-row output limit does not establish that only 30 rows were examined. Inspect target-engine plan output, representative estimated and actual row evidence where available, data distribution, ordering work, and read/write measurements before changing the index.",
      nextStep:
        "Compare a measured candidate access path with the current plan on representative data, and include the write cost of any additional index.",
    },
    helpLevels: [
      "Separate the number of rows returned from the number of rows the database may need to examine.",
      "Ask how many rows match the predicate and what work remains after locating index entries.",
      "An index is a candidate access path, not a command. A low-selectivity predicate can make a scan reasonable; use plan and workload evidence before changing it.",
    ],
  },
  {
    id: "t-25-find-flaw",
    conceptId: 25,
    type: "find-flaw",
    prompt:
      "Find the unsupported claim in the proposal and choose the response that corrects it without dismissing a potentially useful index.",
    context:
      "The product-import service inserts and edits thousands of rows during a daily batch. A teammate proposes an index on active and says: \"This can only make our filtered reads faster. Inserts and updates are unaffected, so we should keep it even if the planner rarely uses it.\" No read/write measurements or index-usage review are supplied.",
    options: [
      {
        key: "a",
        label:
          "The proposal ignores maintenance and storage costs; measure whether the index benefits relevant reads and how it affects inserts and updates before keeping it.",
      },
      {
        key: "b",
        label:
          "The proposal is sound because indexes are separate from table rows and therefore do not participate in writes.",
      },
      {
        key: "c",
        label:
          "The index must be removed immediately because every additional index makes every write fail.",
      },
      {
        key: "d",
        label:
          "Keep the index without review because an index that is rarely selected cannot add write work.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice_maintenance",
          label: "Identifies index write maintenance",
          cause:
            "Treats an index as read-only metadata and omits the work needed to maintain it as indexed values and rows change.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
        {
          key: "choice_balance",
          label: "Keeps the decision evidence-based",
          cause:
            "Replaces the unsupported claim with an absolute rule instead of weighing measured read benefit against write and storage cost.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
      ],
      expected:
        "Option A identifies the flaw. Inserts, deletes, and updates to indexed keys generally require corresponding index maintenance, with engine-specific costs. That does not prove the index should be removed: it may help important reads. Compare representative read plans and performance with import and update workload, inspect whether the index serves other queries or constraints, and decide from the overall workload.",
      nextStep:
        "List the read queries the index is meant to support and the writes that maintain it, then compare both sides using representative evidence.",
    },
    helpLevels: [
      "Consider what must change in an index when a row is inserted or its indexed value changes.",
      "An index can improve some reads and still add storage or maintenance work to writes.",
      "Choose the response that recognizes both sides: measure read benefit and write cost before keeping or dropping the index.",
    ],
  },
  {
    id: "t-26-choose-info",
    conceptId: 26,
    type: "choose-info",
    prompt:
      "The joined query has replaced 100 per-product category lookups, but the page is still slow. Which next investigation is most useful before rewriting the query or adding an index?",
    context:
      "The endpoint currently selects every column from products and categories. Each product row includes a large import_payload used by a separate administrative workflow, while the page displays only product id, name, price, and category name. No execution-plan evidence is available yet.",
    options: [
      {
        key: "a",
        label:
          "Capture the exact query and representative plan or runtime evidence, then compare a projection containing only the fields the page needs while checking result equivalence.",
      },
      {
        key: "b",
        label:
          "Assume the remaining issue is still N+1 and restore one category query per product so each lookup is smaller.",
      },
      {
        key: "c",
        label:
          "Add an index to every selected column, including import_payload, before inspecting the query plan.",
      },
      {
        key: "d",
        label:
          "Remove the category join because joins are inherently slower, even though the page needs the category name.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice_projection",
          label: "Recognizes unused projected data",
          cause:
            "Focuses only on query count or indexes and overlooks that the endpoint requests a large column it does not use.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
        {
          key: "choice_measurement",
          label: "Uses plan evidence and checks result",
          cause:
            "Recommends a rewrite or index from query appearance alone without establishing baseline work and preserving the required result.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
      ],
      expected:
        "Option A is the strongest next investigation. N+1 has already been addressed, so inspect the cost of the remaining query. A focused projection avoids requesting import_payload for this page and can reduce data transferred or processed, but physical-I/O benefit depends on engine and storage layout. Compare the exact query and plan or representative runtime evidence, and verify that required rows, fields, and ordering remain correct.",
      nextStep:
        "Write down the page's required fields and compare the baseline query with an equivalent focused projection using the target database's documented plan output.",
    },
    helpLevels: [
      "The application already reduced the number of queries. Look at the work and data requested by the remaining query.",
      "Identify which selected fields the page actually displays and which large field belongs to another workflow.",
      "Measure the exact query, test a focused projection, and preserve result correctness; do not claim an I/O improvement without evidence.",
    ],
  },
  {
    id: "t-26-find-flaw",
    conceptId: 26,
    type: "find-flaw",
    prompt:
      "A reviewer sees a sequential scan in the plan and says it proves the database ignored a useful index. Choose the response that identifies the flaw and the next check.",
    context:
      "A reporting query filters on a low-selectivity status value and reads many rows to calculate a total. An index exists on status. The reviewer proposes forcing an index scan, but has not compared estimated and actual row counts or representative resource and runtime evidence.",
    options: [
      {
        key: "a",
        label:
          "A sequential scan can be reasonable when many rows qualify; compare selectivity and target-engine plan and runtime evidence before forcing another path.",
      },
      {
        key: "b",
        label:
          "Any sequential scan proves a missing index, regardless of rows returned or data distribution.",
      },
      {
        key: "c",
        label:
          "Force the index scan because an index on the filter column always reads fewer pages than a table scan.",
      },
      {
        key: "d",
        label:
          "Replace the query with a subquery because nested query syntax prevents sequential scans.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice_scan",
          label: "Recognizes a scan may be appropriate",
          cause:
            "Interprets a plan operator as inherently wrong without considering selectivity and the amount of data required.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
        {
          key: "choice_verification",
          label: "Requests relevant verification",
          cause:
            "Forces a plan from operator names alone without comparing evidence for the target engine and workload.",
          check: (a) => a.picked?.includes("a") ?? false,
        },
      ],
      expected:
        "Option A is best. A low-selectivity predicate and an aggregate that reads many rows can make a sequential scan cheaper than traversing an index and fetching many table rows. The plan must be interpreted in context. Compare selectivity, estimated and actual row evidence where available, resource information, and representative runtime on the target engine before considering a forced path.",
      nextStep:
        "Consult the target database's plan documentation and compare the scan with a candidate alternative on the same representative data and query parameters.",
    },
    helpLevels: [
      "The query needs many rows to calculate the total. Ask whether an index would avoid reading most of those rows.",
      "An index can locate matching entries but may still require many row fetches; a scan is not automatically a failure.",
      "Choose the answer that uses selectivity and engine-specific evidence rather than forcing an access path from the operator name alone.",
    ],
  },
];

export const TASKS_DATABASE: Task[] = [
  {
    id: "t-81-order",
    conceptId: 81,
    type: "order",
    prompt:
      "Order the four steps. Each step has the prerequisites described below. Which step would lose its justification if an unlisted old writer remained active?",
    context:
      "A read-only archive serves old queries using shelf_code. New queries will use location_code with the same meaning. All writes are paused until this migration finishes. The new query release is allowed only after copied values are verified. The retirement check covers all readers; if an old writer were discovered, that check would also need to cover it before removal. The task evaluates the order; use the retirement step to identify the broken assumption.",
    options: [
      {
        key: "a",
        label: "Release queries that read location_code after verification.",
      },
      {
        key: "b",
        label: "Copy shelf_code into location_code and verify every value.",
      },
      {
        key: "c",
        label: "Confirm old users are retired, then remove shelf_code.",
      },
      {
        key: "d",
        label: "Add location_code while preserving shelf_code.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "sequence",
          label: "Respect field creation, verified copying, and reader retirement.",
          cause:
            "The proposed sequence uses a field before it is ready or removes a field while an old user may still require it.",
          check: (a) => a.order?.join(",") === "d,b,a,c",
        },
      ],
      expected:
        "Add the field, copy and verify while writes are paused, release the new queries, then confirm retirement and remove the old field. Step c loses its justification if an old writer remains: it is still a user of shelf_code. If writes were not paused, this copy-only plan would additionally need a synchronization protocol.",
      nextStep:
        "Remove the write pause and identify how an update arriving during the copy could be lost from location_code.",
    },
    helpLevels: [
      "For each step, list the field and data it requires.",
      "The new query release requires verified values, and removal requires retirement evidence.",
      "The order is d, b, a, c. An undiscovered old writer invalidates c's retirement assumption; live writes would also require synchronization during copying.",
    ],
  },
  {
    id: "t-81-find-flaw",
    conceptId: 81,
    type: "find-flaw",
    prompt:
      "Which observation most directly contradicts the plan's claim that the new field will stay current? Choose one.",
    context:
      "A service adds display_label, copies nickname once, and deploys new servers that write both fields. Old servers remain for one day and still update nickname only. There is no trigger, change capture, or reconciliation. The plan claims that all display_label values stay current because new servers dual-write.",
    options: [
      {
        key: "a",
        label: "The copy runs in batches of 500 rows.",
      },
      {
        key: "b",
        label: "An old server updates nickname after that row was copied.",
      },
      {
        key: "c",
        label: "A new server inserts a row with both values equal.",
      },
      {
        key: "d",
        label: "A read uses an explicit list of columns.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "diagnosis",
          label: "Find a writer outside the claimed synchronization mechanism.",
          cause:
            "The diagnosis treats new-server dual writes as coverage for old servers that do not execute that code.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "The old-server update changes nickname but not display_label after the one-time copy. Dual writes in new code cannot synchronize writers still running old code.",
      nextStep:
        "List every active write path and propose either a bridge covering it or a coordinated period without that writer.",
    },
    helpLevels: [
      "Trace one row after its copy has finished.",
      "Ask which versions execute the dual-write code.",
      "Option b supplies a counterexample: the old server changes only nickname, leaving display_label stale.",
    ],
  },
  {
    id: "t-82-predict",
    conceptId: 82,
    type: "predict",
    prompt:
      "Predict the old exporter's behavior on each schema. Choose one.",
    context:
      "The exporter explicitly SELECTs id, code and INSERTs id, code. S1 has those columns. S2 retains them and adds language NOT NULL DEFAULT 'en'; that default is acceptable. S3 instead renames code to numeric_code and changes its type to integer, with no alias or adapter. The exporter still sends alphanumeric values such as 'A7'.",
    options: [
      {
        key: "a",
        label: "Reads and inserts work on S2; both fail on S3.",
      },
      {
        key: "b",
        label: "Reads work but inserts fail on S2; both work on S3.",
      },
      {
        key: "c",
        label: "Both fail on S2; reads work but inserts fail on S3.",
      },
      {
        key: "d",
        label: "Reads and inserts work on both S2 and S3.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "prediction",
          label: "Track explicit column names and omitted-field defaults.",
          cause:
            "The prediction overlooks either S2's acceptable insert default or S3's removal of the exact column the exporter queries.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "a",
        },
      ],
      expected:
        "S2 preserves code and supplies language for old inserts. S3 removes code, so both old SQL statements fail; even merely redirecting the name would not establish that alphanumeric values fit an integer contract.",
      nextStep:
        "Evaluate a new exporter that requires language against S1 to test the opposite compatibility direction.",
    },
    helpLevels: [
      "Evaluate SELECT and INSERT separately.",
      "An omitted field can use a default, but a missing named column cannot.",
      "Option a matches the contract: S2 preserves both operations; S3 removes code and also introduces an incompatible value domain.",
    ],
  },
  {
    id: "t-82-variant",
    conceptId: 82,
    type: "variant",
    prompt:
      "Transfer the compatibility reasoning to archive importers. Choose the accurate matrix summary.",
    context:
      "Layout L1 has accession and title. L2 preserves both and adds collection with default 'general'. Importer I1 reads and writes only accession and title, explicitly by name; 'general' is acceptable. I2 also requires collection and has no fallback. Both importers require accession. L3 removes accession. Assume no adapters or other changes.",
    options: [
      {
        key: "a",
        label: "I1 works on L2; I2 works on L1; both fail on L3.",
      },
      {
        key: "b",
        label: "I1 fails on L2; I2 fails on L1; both work on L3.",
      },
      {
        key: "c",
        label: "I1 works on L2; I2 fails on L1; both fail on L3.",
      },
      {
        key: "d",
        label: "I1 fails on L2; I2 works on L1; both fail on L3.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "transfer",
          label: "Check both compatibility directions and the shared dependency.",
          cause:
            "The matrix assumes compatibility is symmetric or overlooks that both importers still depend on accession.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "I1 works on L2 because its fields remain and the new default is acceptable. I2 fails on L1 because collection is absent. Both fail on L3 because accession is removed. A newer layout does not imply universal compatibility.",
      nextStep:
        "Add a row for an importer that explicitly tolerates missing collection and explain which result changes.",
    },
    helpLevels: [
      "Write each importer's required fields beside each layout.",
      "The default helps an old writer on L2; it cannot add a field to L1.",
      "Option c preserves the direction of each check and catches the accession dependency shared by both importers.",
    ],
  },
  ...TASKS_25_26_F9,
  {
    id: "t-28-predict", conceptId: 28, type: "predict",
    prompt: "Select exactly two predictions supported by this model: one about the request timeline and one about the proposed connection budget.",
    context: "Shop has four processes, possibly eight during deployment. PostgreSQL allows 100 sessions; 20 are reserved. In one process, twelve requests arrive together at a warm pool of four. Each holds one session for exactly 20 ms, with no other overhead. Proposed new maximum: 12 per process.",
    options: [
      {key: "wait", label: "The final four requests finish at 60 ms: 40 ms waiting and 20 ms holding a session."},
      {key: "sql", label: "The final four finish at 60 ms because their individual transactions now execute for 60 ms."},
      {key: "overlap", label: "Twelve slots per process fit normally (48), but eight overlapping processes could demand 96 against an application budget of 80."},
      {key: "local", label: "Twelve slots are safe during deployment because each process individually uses fewer than 80."},
    ],
    rubric: {
      criteria: [
        {key: "timeline", label: "Separate waiting from holding time", cause: "You may be attributing serialized admission delay to slower SQL execution rather than counting waves of slot reuse.", check: a => a.picked?.includes("wait") === true && !a.picked.includes("sql")},
        {key: "aggregate", label: "Budget all overlapping processes", cause: "You may be comparing one local maximum against a global limit or ignoring deployment overlap and reserved clients.", check: a => a.picked?.includes("overlap") === true && !a.picked.includes("local")},
        {key: "selection", label: "Choose only the two supported predictions", cause: "Selecting competing predictions does not commit to a single timeline and budget interpretation.", check: a => a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.every(k => ["wait", "sql", "overlap", "local"].includes(k))},
      ],
      expected: "Select wait and overlap. Four slots produce waves ending at 20, 40, and 60 ms; the last wave waits 40 ms then holds a session for 20 ms. The usable budget is 100 - 20 = 80. Four times 12 = 48 fits normally; eight times 12 = 96 exceeds it during overlap. Neither arithmetic nor a larger pool guarantees database throughput.",
      nextStep: "Repeat with eight slots per process: write the two completion waves and recompute the overlap maximum before choosing a limit.",
    },
    helpLevels: ["Track when a slot becomes reusable and identify which limits belong to a process versus the whole database.", "Group the twelve arrivals into waves of four; separately multiply the proposed pool maximum by the largest simultaneous process count.", "Choose wait and overlap: the last wave is 40 ms acquisition + 20 ms transaction; deployment demand is 8 × 12 = 96, above 80."],
  },
  {
    id: "t-28-find-flaw", conceptId: 28, type: "find-flaw",
    prompt: "Find the two unsafe steps in this illustrative acquisition/release plan. Select exactly two; this is pseudocode policy, not production-ready code.",
    context: "Four Shop processes each have a maximum of 20 sessions. Twenty other clients occupy the reserved sessions on a database with a hard limit of 100. On request completion, a session may still have an open transaction after an application exception.",
    options: [
      {key: "escape", label: "If no pooled session is free, call connect() directly and close that extra connection after the request."},
      {key: "pending", label: "If the pending queue is full, reject locally; otherwise wait only within the remaining acquisition deadline."},
      {key: "dirty", label: "In finally, return the borrowed session immediately, leaving any open transaction for its next borrower to handle."},
      {key: "cleanup", label: "Before releasing, complete or roll back the transaction; discard the connection if its state cannot be made safe."},
    ],
    rubric: {
      criteria: [
        {key: "bound", label: "Find the uncounted connection escape", cause: "You may be treating the pool as a reuse cache instead of an admission limit that protects the backend.", check: a => a.picked?.includes("escape") === true && !a.picked.includes("pending")},
        {key: "transaction-hygiene", label: "Find unsafe session reuse", cause: "You may be treating a connection as stateless and assuming finally alone cleans up its transaction.", check: a => a.picked?.includes("dirty") === true && !a.picked.includes("cleanup")},
        {key: "selection", label: "Identify only two unsafe steps", cause: "Marking both safe and unsafe lifecycle steps leaves the proposed repair ambiguous.", check: a => a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.every(k => ["escape", "pending", "dirty", "cleanup"].includes(k))},
      ],
      expected: "Select escape and dirty. Four times 20 plus 20 reserved clients already equals 100; an extra direct connection attempts session 101 and is refused. Keep exhaustion inside a bounded queue/deadline or reject. Returning an open transaction can leak state and locks to another borrower. Finish or roll back first, discarding unusable connections. A caller timeout does not by itself cancel database execution.",
      nextStep: "Trace an exception from acquisition through transaction cleanup and release, then explain what happens when no slot arrives before the deadline.",
    },
    helpLevels: ["Check two invariants: total admitted sessions and the state seen by the next borrower.", "Count sessions outside the pool too. Then distinguish running a finally block from actually ending a transaction.", "Choose escape and dirty. Overflow attempts session 101; returning an unfinished transaction leaks state. Bounded admission and verified cleanup preserve the intended invariants."],
  },
  {
    id: "t-29-compare", conceptId: 29, type: "compare",
    prompt: "Select exactly one plan that satisfies both read policies without claiming write scaling.",
    context: "Order 701 is acknowledged paid v1 on the leader at 0 ms. R1 makes v1 visible at 120 ms and R2 at 300 ms. At 150 ms a new confirmation SELECT must see v1 or newer. Catalog reads may be up to 2 seconds stale; assume their candidate replicas meet that policy. There is no cache on confirmation and all reads use fresh statement snapshots.",
    options: [
      { key: "a", label: "Randomly distribute confirmation and catalog reads across R1 and R2; keep writes on the leader." },
      { key: "b", label: "Read confirmation from the leader, offload eligible catalog reads to replicas, and keep writes on the leader." },
      { key: "c", label: "Pin confirmation to R2 after payment and offload catalog reads; keep writes on the leader." },
      { key: "d", label: "Read confirmation from the leader and send new order writes to R1 and R2 to increase write capacity." },
    ],
    rubric: {
      criteria: [
        { key: "route-policy", label: "Meet freshness and single-writer constraints", cause: "You may be treating every read-only query as replica-safe, mistaking replica affinity for catch-up, or treating read replicas as independent writers.", check: (a) => exact(a.picked, "b") },
      ],
      expected: "Choose b. At 150 ms R1 has v1 but R2 has only v0, so random routing or affinity to R2 can show pending after payment. A fresh leader read sees the acknowledged write under these assumptions. Catalog reads have a separate freshness allowance. Writes still go to the leader; replicas do not create write capacity.",
      nextStep: "Write the R1/R2 results at 50 and 150 ms, then describe the evidence required to move confirmation safely to a replica.",
    },
    helpLevels: [
      "Separate the required data version for each read from whether its SQL is read-only.",
      "At 150 ms, compare each replica's replay time with the confirmation version; then identify the sole write authority.",
      "Choose b: fresh leader confirmation preserves v1 visibility, eligible catalog reads can be offloaded, and writes remain leader-bound.",
    ],
  },
  {
    id: "t-29-variant", conceptId: 29, type: "variant",
    prompt: "Select exactly one routing and failure policy for the hospital workflow.",
    context: "A medication administration is acknowledged on the leader. The next-dose check must include that write. The leader then becomes unreachable. A replica accepts queries, but its replay position is unknown. Daily reports permit 10-minute-old data, and another reporting replica has verified data freshness within 1 minute. No stale cache or pre-existing transaction snapshot is involved.",
    options: [
      { key: "a", label: "Use the reachable replica for the next-dose check because connection success proves freshness; use the reporting replica for the report." },
      { key: "b", label: "Wait a fixed 300 ms, then use the unknown-position replica for the next-dose check; use the reporting replica for the report." },
      { key: "c", label: "Report the next-dose check unavailable and invoke the defined clinical fallback; use the verified reporting replica for the report." },
      { key: "d", label: "Pin the next-dose session to the unknown-position replica; use the reporting replica for the report." },
    ],
    rubric: {
      criteria: [
        { key: "required-visibility", label: "Respect zero-staleness and explicit degradation", cause: "You may be inferring required-write visibility from reachability, a fixed delay, or session affinity instead of verified replay progress.", check: (a) => exact(a.picked, "c") },
      ],
      expected: "Choose c. The next-dose check cannot silently use a replica whose inclusion of the acknowledged write is unknown. With the leader unavailable and no verified replica for that write, expose unavailability and use the defined clinical fallback. The reporting replica meets the separate 10-minute allowance. Waiting or pinning alone proves nothing; a replica route would require verifying application of the required write and a fresh read snapshot.",
      nextStep: "Change the facts: a replica has verified replay through the required commit. Explain how that evidence changes the next-dose route and why a fixed sleep did not.",
    },
    helpLevels: [
      "Ask which decision requires a particular acknowledged write and which allows older data.",
      "A reachable database can still be behind. Look for evidence of the required commit, and keep the report's separate allowance in view.",
      "Choose c: unknown replay cannot satisfy the next-dose guarantee, so expose unavailability and invoke the defined fallback; the verified reporting replica meets its allowance.",
    ],
  },
];
