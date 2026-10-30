import type { Lesson } from "./types";

export const LESSONS_DATABASE: Lesson[] = [
  {
    id: 81,
    rev: "2.1",
    objective:
      "Order a database change around the readers and writers that remain active, and identify the evidence required before removing an old field.",
    prereqIds: [],
    mentalModel: {
      definition:
        "A database migration is a controlled transition of stored structure or data. Its safety depends on intermediate states, active application versions, concurrent writes, and recovery constraints, not just the final schema.",
      analogy:
        "A library replaces its catalog cards while visitors still use the old drawers.",
      analogyLimits:
        "Database writers can change records during copying, and schema operations can lock tables or rewrite data. Keeping two drawers does not automatically keep their contents consistent.",
      correspondence: [
        ["Expanded schema", "Old and new catalog drawers coexist"],
        ["Backfill", "Copy existing cards into the new drawer"],
        ["Contract phase", "Remove the retired drawer after its users leave"],
      ],
    },
    scenario: {
      system: "A library service changing a required member nickname into a display label.",
      data:
        "There are 100,000 members. Old servers read and write nickname. The target application uses display_label with the same string meaning. Servers cannot all switch at once.",
      symptom:
        "A direct column rename passes a new-server test but makes old-server queries fail.",
      constraints: [
        "Reads and writes continue during the transition.",
        "Old writers do not know display_label.",
        "The intermediate schema must support old-server rollback.",
        "No database-specific online DDL guarantee is assumed.",
      ],
      baseline:
        "The original schema contains nickname only. A direct rename removes the identifier that old servers still query.",
    },
    representation: {
      kind: "query-explainer",
      caption:
        "Inspect the intermediate contracts and costs before removing the old column.",
      data: {
        statement:
          "Illustrative transition: members.nickname -> members.display_label; both store the same string meaning.",
        versions: [
          {
            label: "Direct replacement",
            plan: [
              {
                step: "Rename",
                detail:
                  "Rename nickname to display_label while old servers remain.",
                cost: "Potential DDL locking; old queries lose their column.",
              },
              {
                step: "Deploy",
                detail:
                  "New servers work, but old servers can still receive traffic.",
                cost: "Mixed-version failures until old readers and writers leave.",
              },
            ],
          },
        ],
        plan: [
          {
            step: "Expand",
            detail:
              "Add nullable display_label while preserving nickname; assess DDL behavior first.",
            cost: "Extra storage; lock or rewrite behavior depends on the database.",
          },
          {
            step: "Bridge writes",
            detail:
              "Establish a database-side bridge that copies nickname changes into display_label in the same transaction. Keep nickname authoritative while old writers exist.",
            cost: "Extra write work and bridge maintenance.",
          },
          {
            step: "Backfill",
            detail:
              "Copy existing nickname values in bounded batches with concurrency control so a stale copy cannot overwrite a newer bridged value.",
            cost: "Table reads, writes, logging, and contention.",
          },
          {
            step: "Verify and switch",
            detail:
              "Verify coverage and equality, then move reads to display_label. Keep writes through nickname and the bridge during the rollback window.",
            cost: "Validation queries and a temporary dual-field contract.",
          },
          {
            step: "Contract",
            detail:
              "After old users and the rollback window are retired, coordinate the final writer switch and remove the bridge and nickname.",
            cost: "Loss of old-code rollback; DDL still requires assessment.",
          },
        ],
        note:
          "Didactic model, not executable SQL or a production runbook. Transactional bridge behavior, batch concurrency control, DDL locks, and recovery must be designed for the actual database.",
      },
      textEquivalent:
        "A direct rename breaks old servers because nickname disappears. A staged transition first preserves nickname and adds display_label, then bridges old writes transactionally. A concurrency-safe backfill copies existing values in bounded batches. Equality and coverage are verified before reads switch; writes continue through nickname during the rollback window. Only after old users and that window are retired can the final writer switch, bridge removal, and column removal be coordinated. The staged plan adds storage, write work, validation, and operational complexity; it does not guarantee lock-free DDL.",
    },
    worked: {
      decision:
        "Use a staged transition with one authoritative write path during coexistence, and make contraction conditional on compatibility and data evidence.",
      reasoning: [
        "List old readers and writers first: both require nickname, so the first schema change must preserve it.",
        "A new-application dual write alone misses old-server writes. The scenario therefore needs a bridge covering those writers or a different coordination strategy.",
        "Keep nickname authoritative while old writers exist; otherwise two independently writable fields can disagree.",
        "Backfill under concurrency control and verify both missing values and mismatches. Finishing a batch job alone does not establish consistency.",
        "Preserving nickname and its write path supports old-code rollback during the stated window, but only while data meanings remain compatible.",
        "Retire old users and rollback expectations before contraction. Dropping the column cannot be undone safely merely by redeploying old code.",
      ],
    },
    contrast: [
      {
        alternative: "Use a coordinated maintenance window",
        tradeoff:
          "Stopping all affected readers and writers can simplify a small migration, but introduces downtime and still requires data validation and recovery planning.",
        whenNotToUse:
          "Do not add a multi-release bridge to a disposable database or a small system whose users explicitly accept a verified maintenance window; conversely, do not assume a window is available when clients cannot be stopped.",
      },
    ],
    misconceptions: [
      {
        wrong: "Adding a column, deploying new code, and copying rows is automatically safe.",
        discriminant:
          "Identify every writer active during the copy and how its updates reach the target field.",
        counterexample:
          "An old server updates nickname after its row was copied. Without a bridge or reconciliation protocol, display_label retains the previous value.",
      },
    ],
    practiceIds: ["t-81-order", "t-81-find-flaw"],
    evidenceCriteria: [
      "Preserve fields needed by active readers and writers.",
      "Explain how concurrent old-version writes reach the new field.",
      "Require data validation and retirement evidence before contraction.",
      "State why code rollback does not reverse destructive data changes.",
    ],
    transfer: {
      variant:
        "Move a museum inventory identifier to a new field while overnight importers still write the old field.",
      domain: "Museum inventory",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 81. The bridge and data volume are teaching assumptions; database-specific technical review and executable migration design remain pending.",
    },
  },
  {
    id: 82,
    rev: "2.1",
    objective:
      "Build a directional compatibility matrix for application queries against old and new database schemas, without treating a schema number as proof of compatibility.",
    prereqIds: [],
    mentalModel: {
      definition:
        "Schema versioning records the evolution of stored structures and their migration history. Compatibility is a separate relation between a particular reader or writer and a particular schema.",
      analogy:
        "A revised form can keep the boxes that older clerks still fill in.",
      analogyLimits:
        "A revision label does not show whether a clerk uses a removed box. Database compatibility also includes types, constraints, defaults, queries, and data meaning.",
      correspondence: [
        ["Schema revision", "Identified edition of the form"],
        ["Query contract", "Boxes a clerk expects to read or fill"],
        ["Compatibility test", "Try that clerk's actual procedure on that edition"],
      ],
    },
    scenario: {
      system: "A member service with independently deployed application versions.",
      data:
        "S1 has members(id, nickname). S2 adds locale NOT NULL DEFAULT 'en' and keeps nickname. S3 removes nickname. A1 explicitly reads id and nickname and inserts only those fields. A2 also explicitly reads and writes locale.",
      symptom:
        "A recorded migration history is mistaken for permission to run any application version against any schema.",
      constraints: [
        "Queries name columns explicitly; there is no positional decoding or SELECT *.",
        "The locale default is acceptable for A1-created members.",
        "A2 has no fallback when locale is absent.",
        "Only the stated query contracts are assessed.",
      ],
      baseline:
        "A1 works with S1. Compatibility for other combinations must be checked rather than inferred from increasing revision numbers.",
    },
    representation: {
      kind: "table",
      caption:
        "Check each application against each schema; directions are not interchangeable.",
      data: {
        columns: [
          { key: "pair", label: "Application × schema", emphasis: true },
          { key: "result", label: "Outcome" },
          { key: "reason", label: "Reason" },
        ],
        rows: [
          {
            cells: {
              pair: "A1 × S1",
              result: "PASS — baseline",
              reason: "Required columns exist.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "A1 × S2",
              result: "PASS — old application on new schema",
              reason: "nickname remains; omitted locale gets an acceptable default.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "A2 × S1",
              result: "FAIL — new application on old schema",
              reason: "locale queries reference an absent column.",
            },
            tone: "down",
          },
          {
            cells: {
              pair: "A2 × S2",
              result: "PASS — matching contract",
              reason: "nickname and locale both exist.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "A1 × S3",
              result: "FAIL — removed field",
              reason: "A1 still queries nickname.",
            },
            tone: "down",
          },
          {
            cells: {
              pair: "A2 × S3",
              result: "FAIL — removed field",
              reason: "Adding locale did not remove A2's nickname dependency.",
            },
            tone: "down",
          },
        ],
        note:
          "Compatibility is limited to the stated reads and writes. Extra columns can break positional consumers; defaults must also preserve business meaning. Schema revisions are not API versions.",
      },
      textEquivalent:
        "A1 works on S1 and S2: nickname remains, and S2 supplies an acceptable locale default on inserts. A2 works on S2 but fails on S1 because locale is absent. Both A1 and A2 fail on S3 because both still query the removed nickname column. Thus old-application-on-new-schema compatibility does not imply new-application-on-old-schema compatibility.",
    },
    worked: {
      decision:
        "Record schema history and test a directional matrix of actual application reads and writes before allowing mixed revisions.",
      reasoning: [
        "In this lesson, backward compatibility means an old application works against the new schema; forward compatibility means a new application works against the old schema. Other contexts use these labels differently, so retain the explicit pair.",
        "A1 on S2 is backward compatible under the stated explicit-column and acceptable-default assumptions.",
        "A2 on S1 is not forward compatible because its locale query cannot succeed.",
        "Removing nickname breaks both stated applications, even though S3 is a newer recorded revision.",
        "A schema revision tracks storage evolution. An API version tracks an external contract; an adapter can preserve the API while storage changes.",
      ],
    },
    contrast: [
      {
        alternative: "Use a simple ordered migration history without a broad support matrix",
        tradeoff:
          "A single application stopped during migration may need only its before/after contracts, rather than long-lived multi-version support.",
        whenNotToUse:
          "Do not maintain elaborate schema-version negotiation for a disposable local database. Do not omit compatibility analysis when multiple application versions actually coexist.",
      },
    ],
    misconceptions: [
      {
        wrong: "A new schema revision supports every older application.",
        discriminant:
          "Compare the application's required columns and accepted meanings with the new schema.",
        counterexample:
          "S3 has a later revision number but removes nickname, so A1's explicit SELECT fails.",
      },
    ],
    practiceIds: ["t-82-predict", "t-82-variant"],
    evidenceCriteria: [
      "Distinguish old-application/new-schema from new-application/old-schema compatibility.",
      "Explain why an acceptable default can preserve an old insert.",
      "Predict failure from a removed or incompatible field.",
      "Separate migration history, storage schema, and external API contract.",
    ],
    transfer: {
      variant:
        "Assess old and new archive importers against record layouts with an added defaulted field and a removed accession field.",
      domain: "Digital archives",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 82. Compatibility terminology is explicitly scoped to application/schema pairs. Independent technical review is pending.",
    },
  },

  // Lições 25/26 — Database Indexing e Query Optimization (F9, pacote s15; conteúdo do subagente).
  {
  id: 25,
  rev: "3.0",
  objective:
    "Decide whether a database index is justified for a catalog query by comparing its expected read benefit with selectivity, storage, and write costs, then verify the decision against an execution plan.",
  prereqIds: [],
  mentalModel: {
    definition:
      "A database index is an auxiliary data structure that maps indexed key values to row locations or primary keys, allowing some queries to locate qualifying rows without examining every row. Its usefulness depends on the query predicate, data distribution, table size, available access paths, and the cost of maintaining and using the structure.",
    analogy:
      "A catalog can use an alphabetized finding aid to narrow a search instead of opening every record.",
    analogyLimits:
      "A database index is not a free, always-current list outside the database: the engine must maintain it as rows change, may need extra page reads to fetch table data, and can choose a scan when many rows qualify or the index does not match the query.",
    correspondence: [
      ["Indexed key values", "Terms or attributes in the finding aid"],
      ["Index entries pointing to rows", "References from a catalog entry to records"],
      ["Index maintenance on writes", "Updating the finding aid when records change"],
      ["Planner choosing an access path", "Choosing whether the finding aid saves work for this search"],
    ],
  },
  scenario: {
    system:
      "A bookstore catalog service stores products and serves a filtered product listing.",
    data:
      "The products table contains 240,000 rows. The common request is WHERE category_id = 42 AND active = true, ordered by created_at descending, with 30 rows returned. About 18% of products are active in category 42. Product edits and imports occur throughout the day.",
    symptom:
      "The listing becomes slower as the catalog grows. The team proposes an index on category_id without checking the query shape, the rows selected, or the cost of maintaining another index.",
    constraints: [
      "The query and data distribution are illustrative; actual plans and costs depend on the database engine, statistics, cache, and workload.",
      "The request returns a small page, but the matching predicate may still qualify many rows before pagination.",
      "Product creation, category changes, activation changes, and imports must remain responsive.",
      "No index is assumed to eliminate sorting or table reads unless the actual plan and index definition demonstrate that behavior.",
    ],
    baseline:
      "The existing schema has no index supporting this filter. The engine can scan the products table, test the predicate, and sort qualifying rows; the proposal is not yet supported by a measured plan.",
  },
  representation: {
    kind: "query-explainer",
    caption:
      "Compare the scanned rows, qualifying rows, and write work; an index is useful only when the query can exploit it.",
    data: {
      statement:
        "SELECT id, name, price, created_at FROM products WHERE category_id = 42 AND active = true ORDER BY created_at DESC LIMIT 30;",
      versions: [
        {
          label: "Illustrative table scan",
          plan: [
            {
              step: "Scan products",
              detail:
                "Examine table rows and test category_id and active for each candidate row.",
              cost:
                "Potentially many row checks as the table grows; actual cost depends on storage and cache.",
            },
            {
              step: "Sort qualifying rows",
              detail:
                "Order matching rows by created_at before returning the requested page.",
              cost:
                "Sort work depends on the number of qualifying rows and available plan strategies.",
            },
            {
              step: "Return page",
              detail:
                "Return at most 30 matching rows.",
              cost:
                "A small result does not prove that only 30 rows were examined.",
            },
          ],
        },
        {
          label: "Candidate composite index, subject to measurement",
          plan: [
            {
              step: "Probe candidate index",
              detail:
                "An index beginning with category_id and active may narrow candidates for this predicate; its ordering usefulness depends on key order and engine behavior.",
              cost:
                "Index pages must be read, and matching entries may still lead to table-row reads.",
            },
            {
              step: "Check residual conditions and ordering",
              detail:
                "The engine may apply remaining filters or sort if the chosen index does not provide the needed order.",
              cost:
                "The existence of an index does not guarantee that sorting disappears.",
            },
            {
              step: "Maintain on writes",
              detail:
                "Insertions and changes to indexed values update the index.",
              cost:
                "Additional storage, logging, and write work are workload- and engine-dependent.",
            },
          ],
        },
      ],
      plan: [
        {
          step: "Measure the real query",
          detail:
            "Inspect the plan and representative runtime evidence for the exact predicate, ordering, projection, and parameter values.",
          cost:
            "A plan is evidence for a workload and environment, not a permanent promise.",
        },
        {
          step: "Check selectivity and distribution",
          detail:
            "Determine how many rows qualify and whether the values are skewed; a key with many matching rows may not narrow the search enough.",
          cost:
            "Statistics can be stale or may not capture every correlation.",
        },
        {
          step: "Compare candidate access paths",
          detail:
            "Consider the complete query, including ordering and selected columns, rather than adding an index on one frequent column by habit.",
          cost:
            "A different index can help one query while consuming storage and slowing writes.",
        },
        {
          step: "Retest read and write workload",
          detail:
            "Compare representative reads and writes after any index change, then retain only indexes with justified benefit.",
          cost:
            "Results depend on production-like data, concurrency, cache, and engine configuration.",
        },
      ],
      note:
        "Teaching model only, not executable SQL advice or a production guarantee. Index syntax, ordering behavior, included columns, statistics, and planner decisions vary by database engine. Validate with the target engine and representative data.",
    },
    textEquivalent:
      "The baseline scan checks candidate table rows, may sort matches, and returns at most 30 rows; the small page does not mean only 30 rows were examined. A candidate composite index may narrow candidates, but may still require row reads or sorting, and it adds storage and write maintenance. Measure the exact query, inspect selectivity and distribution, compare plans, and retest both reads and writes on representative data. Database engines differ, and an index does not guarantee a particular plan.",
  },
  worked: {
    decision:
      "Do not approve an index on category_id alone as an automatic fix. Measure the exact query, inspect its plan and selectivity, then test a query-shaped candidate index against both read and write workload.",
    reasoning: [
      "The listing filters on category_id and active, orders by created_at, and returns only selected fields. An index proposal must be evaluated against that complete shape.",
      "The 30-row limit describes output size, not the number of rows the engine may need to examine before it can filter or order results.",
      "If the predicate matches a large fraction of a table, an index lookup followed by many row reads may cost more than a scan. The planner can reasonably choose the scan.",
      "A candidate index may help if it narrows the relevant rows or supports ordering, but the exact key order and benefit depend on the engine and workload.",
      "Every index has a maintenance and storage cost. Frequent imports and changes to indexed values make that cost important.",
      "The decision is provisional until a representative plan and read/write measurements support it; an index that is unused or harmful should be reconsidered.",
    ],
  },
  contrast: [
    {
      alternative:
        "Keep a table scan for a small table or a predicate that matches most rows.",
      tradeoff:
        "A scan can be simpler and cheaper when an index would select a large fraction of the table or when table pages are already efficiently read. Its cost can grow as the table and workload change.",
      whenNotToUse:
        "Do not add an index merely because a column appears in WHERE. If the predicate has low selectivity, the table is small, or the plan shows the index would cause many random row reads, compare measured alternatives first.",
    },
    {
      alternative:
        "Use a narrower index aligned with a frequent filter or ordering pattern.",
      tradeoff:
        "A narrower index can reduce storage and maintenance but may not cover all predicates or ordering needs.",
      whenNotToUse:
        "Do not assume one index supports every query that mentions the same column; validate the complete predicate, sort order, projection, and parameter distribution.",
    },
    {
      alternative:
        "Remove or consolidate a redundant index after checking usage and constraints.",
      tradeoff:
        "Reducing redundant structures can lower write and storage costs, but an index may also support a constraint or an infrequent critical query.",
      whenNotToUse:
        "Do not drop an index solely because one observed query does not use it; assess the broader workload, constraints, and operational requirements.",
    },
  ],
  misconceptions: [
    {
      wrong:
        "Adding an index to a filtered column guarantees that the query becomes faster.",
      discriminant:
        "Check whether the planner uses the index, how many rows qualify, and how many table rows must still be fetched.",
      counterexample:
        "If a predicate matches most rows, following index entries to retrieve a large part of the table can be more expensive than scanning it. The planner may correctly ignore the index.",
    },
    {
      wrong:
        "A query returning 30 rows examines only 30 rows.",
      discriminant:
        "Distinguish rows returned from rows examined, filtered, sorted, or read from index and table pages.",
      counterexample:
        "Without a selective access path, the engine may inspect many rows to find the 30 results and determine their ordering.",
    },
    {
      wrong:
        "Indexes improve reads without affecting writes.",
      discriminant:
        "Include inserts, updates to indexed keys, deletes, storage, and maintenance in the workload comparison.",
      counterexample:
        "An import that inserts many products must also maintain every relevant index entry, increasing work compared with a table that has fewer indexes.",
    },
  ],
  practiceIds: ["t-25-compare", "t-25-find-flaw"],
  evidenceCriteria: [
    "Describe how an index can reduce candidate row lookup and why this is conditional on query shape and data distribution.",
    "Distinguish result rows from rows examined and explain why low selectivity can make a scan preferable.",
    "Name at least one read benefit and one storage or write-maintenance cost in the scenario.",
    "State what plan or workload evidence would support keeping, changing, or rejecting a candidate index.",
    "Identify a condition in which adding an index is not justified.",
  ],
  transfer: {
    variant:
      "A billing service searches 18 million payment-event records by merchant_id, status, and occurred_at range while ingesting new events continuously. Propose what you would measure before creating an index and explain how write volume affects the decision.",
    domain: "Billing and payment-event search",
  },
  provenance: {
    reviewed: false,
    notes:
      "Editorial lesson based on canonical concept 25. The scenario and plan descriptions are illustrative, not measured results. No engine-specific plan, index definition, or performance claim has received technical review.",
  },
},
  {
  id: 26,
  rev: "3.0",
  objective:
    "Use an execution plan and measured evidence to identify avoidable query work, then compare a focused projection or query rewrite without assuming that fewer query steps or an index always lowers total cost.",
  prereqIds: [],
  mentalModel: {
    definition:
      "Query optimization is the process of examining and improving the work required to produce a query result. A database optimizer chooses an execution plan from available alternatives using query semantics, statistics, indexes, and engine-specific cost estimates; developers can improve the inputs and query shape, then verify the resulting plan and runtime behavior.",
    analogy:
      "A delivery coordinator compares routes and cargo so a trip carries only what the destination needs.",
    analogyLimits:
      "A database plan is not simply a shortest route chosen from a map: operations can have different I/O, memory, cardinality, concurrency, and cache costs. A syntactically shorter query or smaller result does not by itself prove less total work.",
    correspondence: [
      ["Execution plan", "A proposed sequence of delivery operations"],
      ["Rows and bytes processed", "Cargo handled along the route"],
      ["Projection", "Only the fields required at the destination"],
      ["Planner estimates", "The coordinator's estimate based on available information"],
    ],
  },
  scenario: {
    system:
      "A bookstore catalog page loads a product list with its available category label.",
    data:
      "The catalog contains 240,000 products and 400 categories. A product row also has a large description and an uncompressed import_payload column used by an administrative workflow but not by the page. The page needs product id, name, price, category_id, and category name; it displays 30 products.",
    symptom:
      "The page is slow even after the application reduces N+1 category lookups to a joined query. The current SQL uses SELECT * across products and categories, and the team assumes a new index or a shorter subquery will solve the remaining delay.",
    constraints: [
      "The relevant N+1 pattern has already been addressed conceptually: this lesson investigates work inside the remaining database query, not the number of application round trips.",
      "The payload column is large and not needed by the page, but the actual physical cost of reading it depends on the database, storage layout, projection, and plan.",
      "A plan's estimated and actual rows, buffers, and timing are engine-specific; inspect the target database's documentation and output.",
      "Do not remove a subquery or add an index without checking semantics, plan evidence, and representative measurements.",
    ],
    baseline:
      "The application now issues one joined query rather than one query per product, but SELECT * requests columns the page does not use. The plan and measured work have not yet been compared with a focused projection.",
  },
  representation: {
    kind: "query-explainer",
    caption:
      "Separate query count from the cost of each query; inspect projected data, join work, estimates, and measured execution.",
    data: {
      statement:
        "SELECT * FROM products p JOIN categories c ON c.id = p.category_id WHERE p.active = true ORDER BY p.created_at DESC LIMIT 30;",
      versions: [
        {
          label: "Broad projection",
          plan: [
            {
              step: "Read product rows",
              detail:
                "The query requests every product column, including description and import_payload, although the page does not display them.",
              cost:
                "May increase data transfer and processing; exact physical reads depend on engine, layout, and chosen plan.",
            },
            {
              step: "Join categories",
              detail:
                "Match product category_id values to category rows using an available join strategy.",
              cost:
                "Join work depends on cardinality, statistics, available access paths, and engine.",
            },
            {
              step: "Order and limit",
              detail:
                "Produce products in the requested order and return at most 30 rows.",
              cost:
                "The plan may still need work to find or order qualifying rows before returning the page.",
            },
          ],
        },
        {
          label: "Focused projection to test",
          plan: [
            {
              step: "Read required product fields",
              detail:
                "Request id, name, price, category_id, and created_at only if needed for ordering or output.",
              cost:
                "Can reduce transferred or processed data, but does not guarantee a specific storage-I/O reduction.",
            },
            {
              step: "Join required category field",
              detail:
                "Return category name with the product fields needed by the page.",
              cost:
                "The join remains; projection does not remove its semantic requirement.",
            },
            {
              step: "Compare plan and runtime",
              detail:
                "Inspect estimated and actual rows and engine-provided resource evidence for the exact query.",
              cost:
                "One run can be distorted by cache, concurrency, parameters, or measurement overhead.",
            },
          ],
        },
      ],
      plan: [
        {
          step: "Establish the measured baseline",
          detail:
            "Capture the exact query, parameters, representative data conditions, plan, and runtime evidence before changing it.",
          cost:
            "A plan and timing describe a specific engine, dataset, and environment.",
        },
        {
          step: "Find mismatches and unnecessary work",
          detail:
            "Compare estimated and actual row counts where available; inspect broad projection, repeated work, sorting, joins, and filters.",
          cost:
            "The fields and interpretation of EXPLAIN output differ by database engine.",
        },
        {
          step: "Change one query-shape decision",
          detail:
            "Test a focused projection or a semantics-preserving rewrite; do not assume fewer lines or fewer nested queries mean lower cost.",
          cost:
            "A rewrite can change semantics or lead to another plan, so correctness and performance both require checking.",
        },
        {
          step: "Recheck correctness and performance",
          detail:
            "Compare results and representative plan and runtime evidence, including relevant parameter and data distributions.",
          cost:
            "A faster sample can be an outlier; verify the workload that matters.",
        },
      ],
      note:
        "Teaching model only. EXPLAIN and EXPLAIN ANALYZE syntax, output, timing semantics, row and buffer reporting, and instrumentation overhead vary across database engines. Use the target engine's documentation; do not treat illustrative plan steps as measured output.",
    },
    textEquivalent:
      "The broad query requests every product and category column, including a large payload unused by the page. A focused projection may reduce transferred or processed data, but the join remains and storage-I/O benefit is not guaranteed. Establish a baseline, inspect the target engine's plan and available actual-versus-estimated evidence, change one query-shape decision, then verify result correctness and representative performance. Query count and per-query cost are separate: solving N+1 does not prove that the remaining query is efficient.",
  },
  worked: {
    decision:
      "Keep the joined query that avoids repeated category lookups, replace SELECT * with the fields the page needs, and compare plan and runtime evidence before considering further indexes or rewrites.",
    reasoning: [
      "The original N+1 pattern caused many application-to-database round trips; the lesson assumes that pattern has already been addressed. The remaining query can still do unnecessary work.",
      "The page does not need description or import_payload. Requesting all columns increases the logical data requested and may increase transfer or processing, though physical-I/O effects depend on the engine and storage layout.",
      "The category name is required, so the join is not automatically unnecessary. A rewrite that removes it would need another correct source for that value.",
      "A focused projection is a bounded change that preserves the result fields needed by the page. Check that it still returns the same rows and ordering.",
      "Inspect the actual engine's plan output and representative measurements. Estimated row counts, actual row counts, timing, and resource counters mean only what that engine documents.",
      "If the plan shows a sequential scan, do not conclude that it is wrong: table size, selectivity, statistics, and requested work may make that plan cheaper than an index path.",
    ],
  },
  contrast: [
    {
      alternative:
        "Retain SELECT * for a workflow that genuinely consumes all columns.",
      tradeoff:
        "It can avoid maintaining multiple query variants, but transfers and processes fields that a narrow page does not need.",
      whenNotToUse:
        "Do not use SELECT * as the default for a latency-sensitive endpoint when the result needs only a small subset of columns, especially when rows contain large payloads.",
    },
    {
      alternative:
        "Rewrite a subquery as a join or another equivalent form.",
      tradeoff:
        "A rewrite may clarify intent or expose another plan, but the optimizer may already transform the original query and the rewrite can change duplicate, NULL, or aggregation semantics.",
      whenNotToUse:
        "Do not remove or flatten a subquery merely because it looks nested; first establish that it is a measured source of work and that the rewritten query preserves semantics.",
    },
    {
      alternative:
        "Add an index when plan evidence shows a selective access path is useful.",
      tradeoff:
        "An index may reduce candidate lookup work for some predicates but adds storage and write maintenance and may be ignored.",
      whenNotToUse:
        "Do not treat a sequential scan as an error or add an index solely to make EXPLAIN display an index scan. A low-selectivity query or broad data request can favor a scan.",
    },
  ],
  misconceptions: [
    {
      wrong:
        "Fewer application queries guarantee that the page is fast.",
      discriminant:
        "Measure the remaining query's work, including rows processed, projection, join strategy, sorting, data volume, and runtime evidence.",
      counterexample:
        "Replacing 101 N+1 queries with one SELECT * query can reduce round trips yet still read or transfer large unused columns and process a costly join or sort.",
    },
    {
      wrong:
        "EXPLAIN showing a sequential scan proves that the database failed to use an index.",
      discriminant:
        "Check selectivity, estimated and actual row counts when available, table size, requested rows, and engine-specific cost evidence.",
      counterexample:
        "If a query returns a large fraction of the table, scanning sequentially can be cheaper than following an index and fetching many scattered rows.",
    },
    {
      wrong:
        "Every subquery is slower than an equivalent join.",
      discriminant:
        "Compare semantics and measured plans for the exact engine; optimizers may transform query forms, and rewrites can change duplicates or NULL behavior.",
      counterexample:
        "A subquery used to express an existence condition may have a plan as good as, or better than, a handwritten join; an uncareful join rewrite can duplicate outer rows.",
    },
  ],
  practiceIds: ["t-26-choose-info", "t-26-find-flaw"],
  evidenceCriteria: [
    "Distinguish the number of application queries from the cost of each query.",
    "Explain why requesting unused large columns can be avoidable work without claiming a guaranteed physical-I/O reduction.",
    "Use execution-plan evidence and representative measurements rather than query appearance alone.",
    "Explain why a sequential scan can be reasonable and why an index can be ignored.",
    "Evaluate a subquery rewrite for both plan evidence and semantic equivalence.",
  ],
  transfer: {
    variant:
      "A log-search endpoint joins event records to service metadata and currently selects every column, including a large raw_payload field. State which evidence you would collect, which fields you would project, and how you would assess a proposed subquery rewrite.",
    domain: "Operational log search",
  },
  provenance: {
    reviewed: false,
    notes:
      "Editorial lesson based on canonical concept 26 and contrasted with concept 25: concept 27 addresses repeated application queries, concept 25 addresses index structure and maintenance, and this lesson investigates the plan and work of a query. Scenario and plan steps are illustrative; no engine-specific output or performance claim has received technical review.",
  },
},
{
  id: 28, rev: "3.0",
  objective: "Size a bounded connection pool across application processes, distinguish acquisition wait from query time, and choose an exhaustion policy within the checkout deadline.",
  prereqIds: [11],
  mentalModel: {
    definition: "A connection pool lends reusable database sessions under a fixed concurrency limit. Creating a session costs TCP setup, TLS negotiation when enabled, authentication, and backend/session resources. Acquire a slot, use its connection, finish or roll back the transaction, then release it in a finally path. When every slot is busy, bounded waiting or explicit rejection preserves the limit; opening an uncounted connection does not.",
    analogy: "A workshop lends a fixed set of expensive tools. A borrower waits for a tool to be returned rather than ordering another whenever the shelf is empty.",
    analogyLimits: "Tools do not carry transaction state. A database session can retain settings, locks, or an open transaction; returning it without cleanup can leak state to the next borrower. A pool also needs a bound on waiting callers, not only on tools.",
    correspondence: [["Pool maximum", "Number of lendable tools"], ["Acquire wait", "Time waiting at the counter"], ["Release after transaction cleanup", "Return a safe tool for the next borrower"]],
  },
  scenario: {
    system: "Shop checkout uses PostgreSQL through four application processes; each process owns one pool.",
    data: "The database allows 100 connections; reserve 20 for operations and other clients. A modeled burst sends 12 checkouts simultaneously to each process. Each checkout holds one session for exactly 20 ms, including its transaction. A new session would add an illustrative 35 ms setup cost, not included in the warm-pool samples.",
    symptom: "With four warm connections per process, requests finish in three waves although every transaction still takes 20 ms. Developers propose 30 connections per process to fix checkout latency.",
    constraints: ["Four processes normally run; rolling deployment can temporarily run eight.", "Checkout has an 80 ms deadline; bound acquisition wait to 45 ms and cap pending acquisitions separately.", "No other application pools beyond the stated processes; the reserved 20 connections must remain available.", "The burst model ignores network variance and assumes enough database CPU at the compared 16 and 32 total sessions. These are teaching samples, not benchmarks."],
    baseline: "A warm pool of four per process admits four transactions at a time. In one process, waits are 0, 20, and 40 ms for groups of four; end-to-end durations are 20, 40, and 60 ms. Creating a connection per request instead repeats setup and removes this application's concurrency bound.",
  },
  representation: {
    kind: "latency-histogram",
    caption: "Predict which part of the 60 ms tail is SQL execution. The histogram shows one process with pool size four; compare the size-eight sample in the equivalent text.",
    data: {
      unit: "ms", bins: [{from: 0, to: 30, count: 4}, {from: 30, to: 50, count: 4}, {from: 50, to: 70, count: 4}],
      sample: [20,20,20,20,40,40,40,40,60,60,60,60],
      markers: [{label: "P50", value: 40, convention: "nearest-rank"}, {label: "P95", value: 60, convention: "nearest-rank"}],
      scenario: {label: "Warm pool four, burst of twelve", mean: 40},
      note: "Synthetic ordered durations; bins are [from,to). Tail decomposition: 40 ms acquisition wait + 20 ms transaction = 60 ms. Pool eight comparison: eight requests at 20 ms and four at 40 ms; P50 20 ms, P95 40 ms, mean 26.67 ms. A single-series histogram cannot display stacked phases or a second histogram; this comparison is textual. No measured production percentiles are claimed.",
    },
    textEquivalent: "Pool four: ordered durations 20,20,20,20,40,40,40,40,60,60,60,60 ms. Four wait 0 ms, four wait 20 ms, four wait 40 ms; each then holds a session for 20 ms. The slowest request spends two thirds of its 60 ms waiting, not executing. Pool eight under the same burst and service time: 20,20,20,20,20,20,20,20,40,40,40,40 ms, waits 0 ms for eight and 20 ms for four. P50/P95 change from 40/60 to 20/40 ms using nearest rank. Four processes times eight slots is 32; eight overlapping processes times eight is 64, below the 80-connection application budget. These tiny modeled samples explain a queue, not a production SLO.",
  },
  worked: {
    decision: "Trial a maximum of eight sessions per process with a 45 ms acquisition timeout, a bounded pending queue, and no overflow connections; validate under realistic load before adopting it.",
    reasoning: [
      "First compute the application budget: 100 minus 20 equals 80. Four processes times 30 equals 120, already above the budget; a deployment overlap makes it worse. Count processes and workers, not just hosts.",
      "Eight overlapping processes times eight equals 64. This leaves connection headroom but does not prove adequate CPU, I/O, or latency capacity. Multiple database/user pools must be added together if introduced.",
      "In the modeled burst, four slots cause a 40 ms wait for the last group; eight reduce that wait to 20 ms while transaction duration stays 20 ms. Observe acquisition wait, active/idle sessions, pending count, transaction time, database CPU, and locks separately.",
      "A 45 ms acquisition timeout plus the modeled 20 ms transaction fits the 80 ms deadline. Real execution also needs a remaining-budget-aware query/transaction timeout and cancellation handling; timing out a caller does not automatically stop database work.",
      "Bound the pending queue and reject when it is full or its deadline expires. Do not create an overflow session. Release only after transaction completion or rollback; discard a broken connection rather than returning uncertain state.",
      "Load-test smaller and larger limits. A pool cannot fix slow SQL, lock contention, or deadlocks. Budget arithmetic is necessary but not a throughput guarantee.",
    ],
  },
  contrast: [
    {alternative: "No pool: connect for each request", tradeoff: "A one-shot administrative job can connect once and close cleanly; a busy request path repeats handshake/authentication and can create an uncontrolled connection burst.", whenNotToUse: "Do not add a resident pool to a truly one-shot script with one database operation merely to reuse a connection it will never reuse."},
    {alternative: "External PgBouncer or managed pooler", tradeoff: "Central backend limits can absorb many short-lived application clients. Transaction pooling lends a backend for a transaction, not a stable session across transactions; session-level settings, temporary objects, and prepared statement support need compatibility checks against the actual pooler version/configuration. Session pooling preserves affinity but multiplexes less.", whenNotToUse: "Do not blindly use transaction pooling for workflows requiring cross-transaction session affinity. For a few stable processes, an in-process pool may be simpler; an external pooler adds an operational dependency and its own queue/timeouts."},
    {alternative: "Immediate rejection instead of waiting", tradeoff: "Fail-fast admission avoids queue delay under a strict deadline but sheds bursts that bounded waiting could have served. Upstream retries need a budget and backoff, not a retry storm.", whenNotToUse: "Do not choose a long acquisition queue when its wait already consumes the caller's remaining deadline."},
  ],
  misconceptions: [
    {wrong: "More connections always make the database faster.", discriminant: "Compare throughput and execution latency under the same load, not only free pool slots.", counterexample: "In a separate synthetic capacity test, 32 continuously busy sessions each take 20 ms: about 1600 transactions/s. With 80 busy sessions, contention raises duration to 100 ms: about 800/s. Both fit the application's 80-session budget, yet the larger pool is slower. These numbers illustrate a possible contention curve, not PostgreSQL benchmark results."},
    {wrong: "If the pool is empty, open one extra connection outside it.", discriminant: "Count actual backend sessions across all processes, including overflow and reserved clients.", counterexample: "Four pools of 20 consume the 80-session application budget. With 20 reserved clients connected, one overflow attempt reaches 101 against a hard limit of 100 and is refused; a burst repeats the failure instead of preserving bounded admission."},
  ],
  practiceIds: ["t-28-predict", "t-28-find-flaw"],
  evidenceCriteria: ["Compute the connection budget including deployment overlap and reserved clients.", "Decompose tail duration into acquisition wait and transaction duration.", "Select bounded admission and explain why overflow defeats it.", "Identify cleanup, cancellation, and backend saturation limits rather than claiming the pool guarantees speed."],
  transfer: {domain: "Billing API client", variant: "A billing worker reuses HTTP connections to a provider allowing 60 requests per minute per account. Ten workers each propose a pool of ten sockets. Explain why socket reuse limits concurrent transport resources but cannot enforce an account-wide request rate (HTTP/2 may also multiplex requests). Design a shared rate budget plus bounded in-flight work and deadline-aware waiting; use provider retry guidance and payment idempotency for ambiguous outcomes. Unlike checkout's database connection ceiling, the binding constraint is requests per time window, even if a single socket can send them all."},
  provenance: {reviewed: false, notes: "Drafted in this round without effective independent review (redigida nesta rodada, sem revisão independente efetiva). All timings and capacity examples are synthetic assumptions, not observed measurements. Mechanism references for integration review: PostgreSQL connection settings https://www.postgresql.org/docs/current/runtime-config-connection.html and PgBouncer feature compatibility https://www.pgbouncer.org/features.html . Version-specific pooler compatibility and production tuning remain unverified. No production-ready code is supplied."},
},
{
  "id": 29,
  "rev": "1.0",
  "objective": "Route freshness-sensitive and stale-tolerant reads in a single-leader system, predict replica results from replay timing, and explain why read replicas do not scale writes.",
  "prereqIds": [],
  "mentalModel": {
    "definition": "A read replica maintains a database copy by receiving and applying changes from a leader. In this single-writer, asynchronous model, writes commit on the leader; eligible read-only queries can run on replicas. More replicas add potential read capacity, not independent write capacity. Commit acknowledgment does not mean every replica has applied the change.",
    "analogy": "A central desk records orders while satellite desks consult copied ledgers delivered later. Extra desks can answer more questions, but only the central desk records new orders.",
    "analogyLimits": "Database changes are replayed through a replication protocol, not manually copied pages. Replicas have independent replay positions and can lag by different amounts; delivery is not the same as query visibility. Extra desks also consume resources to keep their ledgers current.",
    "correspondence": [
      ["Leader commit", "Central desk records an order"],
      ["Replica replay", "Satellite desk updates its ledger"],
      ["Stale read", "Answer from an older ledger"]
    ]
  },
  "scenario": {
    "system": "The Academy shop uses one PostgreSQL leader and two asynchronous read replicas, R1 and R2.",
    "data": "Order 701 starts as pending (version 0). At t=0 ms the leader commits paid (version 1) and acknowledges it. R1 makes version 1 query-visible at t=120 ms; R2 at t=300 ms. No later writes occur.",
    "symptom": "Catalog reads saturate leader CPU, while some customers see pending immediately after paying when all reads are randomly distributed.",
    "constraints": [
      "Catalog browsing may tolerate data up to 2 seconds old; payment confirmation must read the acknowledged order version or newer.",
      "All writes go to the leader; no promotion or multi-writer behavior is modeled.",
      "Each listed read starts a new statement snapshot after the stated time; network time is omitted. Replay times are synthetic observations, not latency bounds.",
      "Replica health and replay progress must be checked; when freshness cannot be established, use the leader within capacity or return an explicit unavailable/retry state, not a stale confirmation."
    ],
    "baseline": "Every read currently reaches the leader. Moving eligible catalog reads can reduce its read work; blindly moving confirmation reads causes stale results during replay lag."
  },
  "representation": {
    "kind": "table",
    "caption": "Which reads can show pending after paid was acknowledged? Compare statement time, destination, and replay visibility.",
    "data": {
      "columns": [
        {"key": "time", "label": "Time (ms)"},
        {"key": "action", "label": "Operation / destination"},
        {"key": "state", "label": "Observed state", "emphasis": true}
      ],
      "rows": [
        {"cells": {"time": 0, "action": "Commit and acknowledge / leader", "state": "paid v1"}},
        {"cells": {"time": 50, "action": "New SELECT / R1", "state": "pending v0"}, "tone": "warn"},
        {"cells": {"time": 50, "action": "New SELECT / leader", "state": "paid v1"}, "tone": "ok"},
        {"cells": {"time": 120, "action": "Replay becomes visible / R1", "state": "paid v1"}},
        {"cells": {"time": 150, "action": "New SELECT / R1", "state": "paid v1"}, "tone": "ok"},
        {"cells": {"time": 150, "action": "New SELECT / R2", "state": "pending v0"}, "tone": "warn"},
        {"cells": {"time": 300, "action": "Replay becomes visible / R2", "state": "paid v1"}}
      ],
      "note": "Synthetic single-write trace. Each SELECT uses a fresh statement snapshot. Visibility times differ across replicas; elapsed time alone is not a general freshness guarantee."
    },
    "textEquivalent": "At 0 ms, the leader commits and acknowledges paid v1 for order 701. At 50 ms, a new SELECT on R1 reads pending v0, while a new SELECT on the leader reads paid v1. R1 makes v1 visible at 120 ms, so a new R1 SELECT at 150 ms reads paid v1. At that same 150 ms, R2 still reads pending v0. R2 makes v1 visible at 300 ms. No later writes occur. These are synthetic timings with fresh statement snapshots, not guaranteed lag limits."
  },
  "worked": {
    "decision": "Offload eligible catalog reads to healthy replicas and route post-payment confirmation to the leader using a fresh read; keep writes on the leader.",
    "reasoning": [
      "Classify by freshness requirement, not just SELECT versus UPDATE. A confirmation SELECT is read-only but cannot accept the old order version.",
      "At 50 ms, R1 has not replayed v1. A successful write acknowledgment proves the leader committed, not that R1 or R2 can serve that version.",
      "Pin the customer's confirmation path to the leader after the write. Pinning to an arbitrary replica does not provide read-your-writes. Do not reuse a transaction snapshot from before the commit or serve a stale cache entry on this path.",
      "A replica is an alternative only after verifying that its applied position includes the required write and using an appropriate fresh snapshot. A fixed sleep or low lag sample is not such proof; session affinity to a replica alone is insufficient.",
      "Send catalog queries to replicas only while the 2-second freshness policy can be supported. Monitor replay progress and freshness, read latency, leader CPU, replica CPU/I/O, and fallback load. Unknown or excessive lag requires a defined fallback or explicit degradation.",
      "Read offload may relieve shared leader resources, but all writes still commit there and replicas must replay them. Do not claim linear scaling or solve a write-bound workload by adding read replicas."
    ]
  },
  "contrast": [
    {
      "alternative": "Application cache",
      "tradeoff": "A cache reuses selected results and avoids database work on hits; a replica executes database queries over a replicated dataset. Cache invalidation/TTL and replica replay lag are different freshness mechanisms and can compound.",
      "whenNotToUse": "Do not replace replica freshness checks with a cache TTL, or bypass only the replica while still serving a stale confirmation cache entry."
    },
    {
      "alternative": "Keep reads on the leader",
      "tradeoff": "Fresh statement reads after acknowledgment avoid this replica-lag window, at the cost of consuming leader capacity. This does not repair an older transaction snapshot.",
      "whenNotToUse": "Do not add replicas for a small workload that fits the leader, or when every read requires freshness and no replica catch-up protocol exists."
    },
    {
      "alternative": "Investigate the write path instead",
      "tradeoff": "Query/index changes, reducing write work, or a partitioning design may address a write bottleneck; each needs its own evidence and trade-offs. Read replicas continue applying leader writes.",
      "whenNotToUse": "Do not prescribe read replicas when measurements show write execution or lock contention is the binding limit and there is little removable read work."
    }
  ],
  "misconceptions": [
    {
      "wrong": "Adding two read replicas triples write capacity.",
      "discriminant": "Locate where writes are accepted and committed, and count replay work separately from client reads.",
      "counterexample": "All 900 writes/s still commit on the same leader after R1 and R2 are added; both replicas also replay those writes. The trace changes read destinations, not write authority."
    },
    {
      "wrong": "After a successful write, any replica returns that write.",
      "discriminant": "Compare the required commit with the chosen replica's applied position, not merely write success.",
      "counterexample": "At 150 ms R1 returns paid v1 but R2 still returns pending v0, although the leader acknowledged at 0 ms."
    },
    {
      "wrong": "Waiting 300 ms or sticking to one replica guarantees fresh reads.",
      "discriminant": "Separate an observed replay delay from a guaranteed bound and affinity from catch-up verification.",
      "counterexample": "A later replay stall can last beyond 300 ms; a session pinned to that stalled replica keeps reading old state."
    }
  ],
  "practiceIds": [
    "t-29-compare",
    "t-29-variant"
  ],
  "evidenceCriteria": [
    "Predict the different R1 and R2 results at 150 ms using their replay visibility times.",
    "Choose a fresh leader read for confirmation and state why arbitrary replica affinity is insufficient.",
    "Explain which read work a replica offloads and why writes remain leader-bound.",
    "Distinguish cache invalidation from replica replay and define a freshness-aware fallback."
  ],
  "transfer": {
    "domain": "Hospital medication administration",
    "variant": "A hospital records medication administrations on a leader. The next-dose check must include the last acknowledged administration; unlike catalog browsing, it has no stale-data allowance. If the leader is unavailable, the electronic check must report unavailable and invoke the hospital's defined clinical fallback, not silently use an unverified replica. A daily retrospective report can tolerate data 10 minutes old. Route both reads, explain why elapsed time and replica affinity cannot prove freshness, and state what replay-position verification would be needed before a replica could serve the next-dose check. This is a database decision exercise, not clinical guidance."
  },
  "provenance": {
    "reviewed": false,
    "notes": "Authored for package s45; no independent technical or learner review performed. The trace, order, timings, and workload figures are synthetic teaching assumptions, not measurements or lag guarantees. Mechanism references consulted: PostgreSQL 18, sections 26.2 (https://www.postgresql.org/docs/18/warm-standby.html) and 26.4 (https://www.postgresql.org/docs/18/hot-standby.html): asynchronous replication and read-only standby queries. Scope is single-leader asynchronous read scaling, not failover, synchronous visibility guarantees, or a production routing implementation. Summary: offload stale-tolerant reads; preserve required write visibility; replicas do not add write authorities."
  }
},
];
