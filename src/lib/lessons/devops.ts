import type { Lesson } from "./types";

export const LESSONS_DEVOPS: Lesson[] = [{
  id: 6, rev: "3.1", prereqIds: [],
  objective: "Locate a failed invariant in a release pipeline and place pre-merge and post-deploy gates according to detection cost and exposure.",
  mentalModel: {
    definition: "Continuous integration frequently integrates changes with automated build and test feedback. Continuous delivery keeps a validated artifact releasable, possibly behind a human release approval; continuous deployment automatically releases changes that pass the configured gates. A green pipeline means the declared checks passed for the tested inputs and environment, not that the software is correct in every environment.",
    analogy: "A factory inspection line stops a batch when a measured requirement fails before shipment.",
    analogyLimits: "Software checks sample behaviors rather than inspect every possible execution. Production dependencies and traffic can differ from fixtures, and shipping identical bytes does not reproduce identical operating conditions.",
    correspondence: [["Gate assertion", "Measured acceptance requirement"], ["Versioned artifact", "Identified batch"], ["Blocked promotion", "Shipment held for failed inspection"]],
  },
  scenario: {
    system: "A product-search API releases a new price serializer while two application versions may coexist.",
    data: "Commit c42 changes priceCents from integer 1299 to string '1299'. A consumer fixture requires an integer. Build takes 20 seconds, unit tests 40 seconds, and the consumer contract suite 30 seconds; these stages run sequentially in this teaching model.",
    symptom: "A previous release compiled and passed arithmetic tests but broke clients that validate the response type.",
    constraints: ["The deterministic contract suite must finish before merge; the team's pre-merge budget is 120 seconds.", "Required checks must apply to the candidate being merged, not an earlier revision; failed or missing checks block promotion.", "Promote the tested immutable artifact, with its revision recorded, rather than rebuilding different bytes for production.", "After deploy, observe a 5% canary for ten minutes; halt expansion if at least 10 of 1000 search responses fail. This is a teaching policy, not a universal threshold."],
    baseline: "The old pipeline ran build and arithmetic unit tests in 60 seconds, but had no response-type assertion. c42 now stops at the added contract gate after 90 seconds, before merge or deploy.",
  },
  representation: {
    kind: "table", caption: "Where does c42 stop, and which downstream observations have NOT happened?",
    data: {
      columns: [{ key: "stage", label: "Stage" }, { key: "invariant", label: "Required observation" }, { key: "result", label: "c42 result", emphasis: true }],
      rows: [
        { cells: { stage: "Build / 20 s", invariant: "Sources compile into an artifact", result: "PASS" }, tone: "ok" },
        { cells: { stage: "Unit / 40 s", invariant: "Price arithmetic fixtures pass", result: "PASS" }, tone: "ok" },
        { cells: { stage: "Contract / 30 s", invariant: "priceCents is an integer", result: "FAIL: string '1299'" }, tone: "down" },
        { cells: { stage: "Merge and promotion", invariant: "Required candidate checks pass", result: "BLOCKED" }, tone: "warn" },
        { cells: { stage: "Production canary / 10 min", invariant: "Fewer than 10 failures per 1000 responses", result: "NOT RUN: no production evidence" }, tone: "warn" },
      ],
      note: "Static worked trace, not a live runner. Durations exclude queue time. A failure blocks dependent stages; no canary result is inferred.",
    },
    textEquivalent: "c42 passes build at 20 seconds and unit tests at 60 seconds. At 90 seconds the contract rejects a string where an integer is required. Merge and promotion are blocked; the production canary has not run.",
  },
  worked: {
    decision: "Block c42 before merge, fix the response type, rerun required checks on the new candidate, then promote the tested artifact and evaluate the canary before expanding.",
    reasoning: ["Compilation establishes buildability, not API compatibility: strings still compile here.", "The consumer assertion names the missing invariant and exposes c42 deterministically in 30 additional seconds.", "The 90-second total fits the 120-second budget; discovering this only after deploy would expose clients unnecessarily.", "A blocking rule must consume the check result; merely printing FAIL while returning success is a formality, not a barrier.", "A repaired candidate still needs production signals: fixtures cannot reproduce every dependency or traffic pattern. If the canary breaches its stated threshold, halt expansion and investigate; rollback is an option only when application and data compatibility permit it."],
  },
  contrast: [
    { alternative: "Informational contract check after deployment", tradeoff: "Shorter merge feedback, but clients encounter a deterministically detectable regression and a non-blocking report cannot prevent expansion.", whenNotToUse: "Do not defer this cheap, stable contract check when it fits the budget and protects active consumers." },
    { alternative: "Run all checks before merge and omit production observation", tradeoff: "Pre-merge checks reduce exposure to known regressions, but realistic traffic and dependency behavior remain outside their fixtures; forcing every expensive experiment into this path also delays feedback.", whenNotToUse: "Do not treat pre-merge green as a substitute for runtime observation. A one-off disposable script may need proportionate local validation rather than a full ten-minute production canary." },
  ],
  misconceptions: [{ wrong: "Tests in CI replace observability in production.", discriminant: "Does the checked environment include the dependency behavior and traffic that produced the failure?", counterexample: "All contract fixtures return in 20 ms, but the production pricing provider slows to 3 seconds under peak load. The serializer passes every test while search requests time out; runtime latency and failure signals are needed." }],
  practiceIds: ["t-6-find-flaw", "t-6-variant"],
  evidenceCriteria: ["Identify the failed type invariant and explain why build success does not discharge it.", "Place the 30-second contract check before merge using the 120-second budget, and preserve production observation for uncovered behavior.", "In the data-pipeline variant, distinguish pre-publication validation from late-data reconciliation without claiming complete correctness."],
  transfer: { domain: "Daily analytics ingestion", variant: "A daily revenue table must publish by 06:00; a reproducible schema check takes 20 seconds, but late arrivals remain unknown until noon. Decide what blocks publication and what triggers a correction after publication; explain why waiting for all real-world evidence misses the deadline." },
  provenance: { reviewed: true, notes: "Revisão independente: revisão efetiva registrada. Verificados integralmente objetivo, modelo mental, limites da analogia, cenário, representação, exemplo, contrastes, contraexemplo, transferência e as duas tarefas, incluindo funções de rubrica e pistas. Conferidos o bloqueio do candidato, a promoção do artefato testado, os 90 segundos dentro do orçamento de 120 segundos e a ausência de evidência do canário após bloqueio. Confirmados os oito critérios editoriais de profundidade. Os tempos e limiares são hipóteses didáticas; não houve execução de pipeline ou validação operacional. Referências preservadas: Martin Fowler, Continuous Integration e Continuous Delivery." },
},
{
    id: 7,
    rev: "3.1",
    objective:
      "Use a same-commit environment comparison to decide whether to rebuild an image or change runtime configuration, and explain what a successful container run does not prove.",
    prereqIds: [],
    mentalModel: {
      definition:
        "A Docker image is a versioned, immutable package of filesystem layers and execution metadata: application files, user-space runtime, libraries, and defaults. A container runs a process with an isolated view of that filesystem plus a writable layer. Environment variables, mounts, and injected secrets configure a particular run. Changing packaged code or dependencies requires a new image; changing external configuration requires a newly configured run, not a new image. Linux containers share a host kernel, sometimes through a VM, so the image is not a complete machine snapshot.",
      analogy:
        "A sealed lunch kit contains a fixed recipe and ingredients, while the delivery label tells this particular delivery where to go. Replacing an ingredient means preparing a new kit; changing the destination does not.",
      analogyLimits:
        "The seal represents immutable image contents, not guaranteed safety or identical results everywhere. A container can write to its own layer, read mounted files, contact the wrong database, or exhaust resources. Host architecture, kernel capabilities, external services, and input data still matter.",
      correspondence: [
        ["Image filesystem and user-space runtime", "Sealed recipe and ingredients"],
        ["Image digest", "Identity of one exact sealed kit"],
        ["Runtime configuration", "Delivery instructions supplied separately"],
        ["Container process", "One use of the kit in a particular setting"],
      ],
    },
    scenario: {
      system:
        "The recurring checkout product has a Node.js 22 receipt service that converts a completed order into a PDF using the pdfkit package.",
      data:
        "Commit c7e41 contains the receipt code and package-lock.json fixing pdfkit at 0.15.0. Fixture order R-204 totals USD 42.00. The service requires RECEIPT_DB_URL and refuses startup when it is absent. Image I1 is an illustrative artifact label, not a real digest; it contains that commit, Node.js 22, and the locked dependencies.",
      symptom:
        "A clean developer checkout fails with a missing-module error, while the same commit inside I1 passes dependency loading but stops when RECEIPT_DB_URL is missing.",
      constraints: [
        "Keep commit c7e41 and fixture R-204 constant across the comparison.",
        "Use compatible Linux hosts and the same CPU architecture; cross-platform portability is not being tested.",
        "Do not put database credentials or environment-specific endpoints in image layers.",
        "Validate the selected database before writing receipts; successful startup alone is insufficient.",
        "Store retained receipts outside the disposable container writable layer.",
      ],
      baseline:
        "Developers run the checkout against their local Node installation and manually installed packages. One clean machine has not installed pdfkit, so the same source commit does not reach application startup.",
    },
    representation: {
      kind: "table",
      caption:
        "Hold the commit constant: the image fixes packaged dependencies, but a correct runtime configuration is still a separate requirement.",
      data: {
        columns: [
          { key: "environment", label: "Environment" },
          { key: "commit", label: "Commit" },
          { key: "package", label: "Runtime and dependencies" },
          { key: "configuration", label: "Runtime configuration" },
          { key: "result", label: "Observed result", emphasis: true },
        ],
        rows: [
          {
            cells: {
              environment: "Clean developer machine, native process",
              commit: "c7e41",
              package: "Node.js 22; pdfkit not installed",
              configuration: "RECEIPT_DB_URL selects the test fixture database",
              result: "Module loading fails before startup",
            },
            tone: "down",
          },
          {
            cells: {
              environment: "Container from image I1",
              commit: "c7e41",
              package: "Node.js 22; pdfkit 0.15.0 and locked dependencies",
              configuration: "RECEIPT_DB_URL absent",
              result: "Dependencies load; configuration validation stops startup",
            },
            tone: "warn",
          },
          {
            cells: {
              environment: "Container from the same image I1",
              commit: "c7e41",
              package: "Node.js 22; pdfkit 0.15.0 and locked dependencies",
              configuration:
                "RECEIPT_DB_URL selects the test fixture database; receipt output mounted",
              result: "Fixture R-204 produces a receipt totaling USD 42.00",
            },
            tone: "ok",
          },
        ],
        note:
          "Illustrative controlled observations, not executed benchmarks. Rows two and three use the same image artifact. The last result demonstrates one fixture, not production readiness or universal correctness.",
      },
      textEquivalent:
        "All three rows use commit c7e41. The native developer process lacks pdfkit and fails during module loading. Image I1 includes Node.js 22 and locked dependencies, so its container reaches configuration validation but fails without RECEIPT_DB_URL. Running the same I1 with the test database setting and an output mount produces the expected USD 42.00 fixture receipt. Dependencies and configuration are separate causes.",
    },
    worked: {
      decision:
        "Package code and locked dependencies into one immutable image, promote its digest, and supply validated environment configuration, secrets, and storage at execution time. Rebuild for a code or packaged-dependency change; recreate a configured run for a database-setting change.",
      reasoning: [
        "The developer-machine failure occurs before database access. Installing or packaging the missing dependency addresses that cause; changing a database URL cannot.",
        "The second row already contains the required dependency. Its explicit missing-configuration error does not justify rebuilding or editing code.",
        "The third row changes execution configuration while preserving I1. This is evidence that the environment-specific database setting belongs outside the image.",
        "A later code fix must produce a new image. Editing a running container's files would create untracked state that another container from I1 would not receive.",
        "Record and promote the exact image digest. A commit identifies source, and a tag is a mutable name; rebuilding the same commit with floating inputs can produce a different artifact.",
        "The successful fixture does not validate every database target, resource limit, or recovery procedure. Verify the selected environment and durable output separately.",
      ],
    },
    contrast: [
      {
        alternative:
          "Read the green fixture result as a guarantee of application correctness.",
        tradeoff:
          "This tempting interpretation appears when teams equate 'it starts in Docker' with release approval. It skips input coverage, external dependencies, and operational checks; a reproducible bug remains a bug.",
        whenNotToUse:
          "Do not use container startup or one passing fixture as the sole production-readiness gate.",
      },
      {
        alternative:
          "Treat the image as a reproducible user-space environment and configure each run separately.",
        tradeoff:
          "This interpretation is useful when dependency drift is causing failures. It reduces one class of variation but requires artifact tracking and explicit configuration validation; it does not freeze remote services or the host kernel.",
        whenNotToUse:
          "Do not prescribe Docker solely for a dependency-free local utility when an existing managed runtime already provides the required consistency and packaging adds no demonstrated value.",
      },
      {
        alternative:
          "Use a virtual machine when a separate guest kernel is required.",
        tradeoff:
          "A VM can package a guest operating system and kernel with greater resource and maintenance cost. A Linux container normally shares the kernel of its Linux host or supporting VM.",
        whenNotToUse:
          "Do not choose a container image as the solution to a requirement for a different kernel; choose the isolation and compatibility boundary deliberately.",
      },
    ],
    misconceptions: [
      {
        wrong: "Running in a container makes the service ready for production.",
        discriminant:
          "Check the target database, retained output, resource policy, and representative behavior independently of whether the process starts.",
        counterexample:
          "The receipt service starts from the expected image with valid credentials, but RECEIPT_DB_URL points to the wrong tenant database. The package is reproducible while the deployment is incorrect.",
      },
      {
        wrong: "The same source commit or image tag guarantees the same package.",
        discriminant:
          "Compare image digests and build inputs rather than only source revision or tag names.",
        counterexample:
          "Two builds of c7e41 use a moving base-image tag and produce different runtime layers. A later push can also move a release tag to a different image.",
      },
      {
        wrong: "Files written inside a container are durable application storage.",
        discriminant:
          "Ask where the data lives and what happens when the container is removed or replaced.",
        counterexample:
          "PDF receipts written only to the container writable layer disappear when that container is removed. Reusing the original image does not recover those receipts; retained data needs separately managed storage and recovery policy.",
      },
    ],
    practiceIds: ["t-7-compare", "t-7-variant"],
    evidenceCriteria: [
      "Explain why the missing dependency and missing database setting fail at different stages for the same commit.",
      "Assign code and locked dependencies to the image, and environment-specific settings, injected secrets, and retained data to execution configuration.",
      "Select a new image for changed code without rebuilding solely to change an external database setting.",
      "Distinguish image digest from commit and mutable tag, and identify at least one condition outside the image's guarantee.",
      "Transfer the boundary to a scheduled batch job and verify its actual output rather than treating process startup as completion.",
    ],
    transfer: {
      domain:
        "A scheduled environmental-data analysis job rather than a web receipt service.",
      variant:
        "A scheduler must run a Python 3.12 job over one immutable CSV snapshot each night, finish within ten minutes, and retain the resulting report after the worker is removed. The job has no HTTP server and needs no exposed port. Package the script, Python runtime, and locked analytical dependencies in an image; select the image by digest. Supply the input snapshot location and output destination at execution time, and inject any storage credentials without baking them into layers. Explain why a parser change needs a new image but a new input date does not. Verify the exit status, report schema, input-snapshot identity, and durable output; the image does not guarantee the time budget or analytical correctness.",
    },
    provenance: {
      reviewed: true,
      notes:
        "Revalidação independente s40: revisão efetiva registrada. Confirmada a correção de t-7-variant: o critério image-pkg verifica a opção package, existente na tarefa; a única combinação aceita é package, mount e verify. Revisados definição, matriz, contraexemplos, contrastes, pistas e transferência para processamento em lote. Referências: Docker Docs, What is an image? e documentação de containers e armazenamento. Os exemplos permanecem ilustrativos: não foram executados builds ou containers, e empacotamento reproduzível não comprova correção, durabilidade externa ou cumprimento do orçamento temporal.",
    },
  }
,
{
  id: 52,
  rev: "3.0",
  objective: "Decide whether a traffic switch and switch-back preserve checkout correctness by tracing shared state and readiness across two releases.",
  prereqIds: [],
  mentalModel: {
    definition: "Blue-green deployment prepares a new release in a second, equivalently provisioned environment, then switches the active traffic target as one routing decision. Keep the previous environment intact for a fast switch-back. This reverses routing, not shared-state changes. Existing connections may drain on the previous version; global propagation need not be instantaneous.",
    analogy: "Move a shop's entrance sign between two fully prepared counters that use the same order ledger.",
    analogyLimits: "The ledger is not copied with the counter. Moving the sign back cannot erase orders or restore a removed ledger column. Real routers propagate changes, and existing connections may keep using the old counter.",
    correspondence: [
      ["Blue and green", "Two equivalently equipped counters"],
      ["Traffic target switch", "Move the entrance sign"],
      ["Shared database", "One order ledger used by both counters"],
    ],
  },
  scenario: {
    system: "The Academy shop runs checkout v1 on blue while checkout v2 is prepared on green behind one load balancer.",
    data: "Both environments use one orders database. v1 reads total_cents; compatible v2 retains that field and adds optional display_currency. In the incompatible branch, v2 drops total_cents and writes only total_decimal. A user commits order 901 on green before a rendering bug triggers switch-back.",
    symptom: "Replacing files in the active checkout caused intermittent 502s. The team now assumes switching back will undo every release effect.",
    constraints: [
      "Each environment must carry the full checkout load; reserve duplicate application capacity during the rollback window.",
      "Keep the old release and its configuration available; drain existing requests rather than killing them at the flip.",
      "Verify both versions against schemas, cache values, message payloads and session formats used during coexistence; validate background workers too.",
      "Warm green with representative non-mutating traffic. For this teaching gate, require successful checkout-contract probes, error rate below 1% and p95 below 300 ms under a 200 requests/s rehearsal; these are scenario thresholds, not universal defaults.",
    ],
    baseline: "An in-place file replacement serves requests while code changes underneath them; no complete previous application environment is held ready for immediate routing recovery.",
  },
  representation: {
    kind: "table",
    caption: "Compare the same switch and switch-back with compatible and incompatible shared schemas. The routing operation is reversible in both; the data effects are not reversed.",
    data: {
      columns: [
        { key: "moment", label: "Branch / moment" },
        { key: "blue", label: "Version on blue" },
        { key: "green", label: "Version on green" },
        { key: "write", label: "User write" },
        { key: "result", label: "Result", emphasis: true },
      ],
      rows: [
        {
          cells: {
            moment: "Compatible / flip to green",
            blue: "v1 retained; draining",
            green: "v2 active",
            write: "901: total_cents=1200; display_currency=USD",
            result: "Both versions can read the committed order.",
          },
          tone: "ok",
        },
        {
          cells: {
            moment: "Compatible / switch back",
            blue: "v1 active",
            green: "v2 retained; draining",
            write: "901 remains committed",
            result: "Routing returns quickly; v1 reads 1200 cents. The order is not undone.",
          },
          tone: "ok",
        },
        {
          cells: {
            moment: "Incompatible / flip to green",
            blue: "v1 retained; draining",
            green: "v2 active; total_cents dropped",
            write: "901: total_decimal=12.00 only",
            result: "v2 reads the order; a remaining v1 request fails on the missing column.",
          },
          tone: "down",
        },
        {
          cells: {
            moment: "Incompatible / switch back",
            blue: "v1 active",
            green: "v2 retained; draining",
            write: "901 and changed schema remain",
            result: "Routing returns quickly, but v1 still fails. Switching the target does not restore the column or transform the order.",
          },
          tone: "down",
        },
      ],
      note: "Illustrative branches, not production timings. The atomic operation is the router's target selection, not a transaction spanning all requests, caches and database writes.",
    },
    textEquivalent: "With an additive schema, v2 writes order 901 retaining total_cents; switching back lets v1 read it, and the order remains. With total_cents dropped, v1 fails both during draining and after switch-back. Both flips change routing; neither restores schema or undoes writes.",
  },
  worked: {
    decision: "Use the compatible branch, rehearse and warm green before switching, retain blue, and postpone destructive schema cleanup beyond the rollback window and all old consumers.",
    reasoning: [
      "First ask whether v1 can read and write the state v2 will leave behind. Keeping total_cents usable and the added field optional preserves this teaching contract; test both directions rather than assuming additive means harmless.",
      "Read the table's switch-back rows: the routing result is the same, but only the compatible branch leaves v1 able to serve order 901. Database repair needs a separate validated plan.",
      "Check cache encoding, queued messages and session compatibility, including data written before rollback and consumed later. Separate application environments do not isolate these contracts.",
      "Green returning 200 on a shallow health endpoint does not establish capacity. Rehearse the scenario gates with caches and runtime warmed; cold caches or JIT can overload shared dependencies on the first full traffic wave.",
      "Switch the target, monitor checkout errors and latency, and drain old connections. A rendering regression can justify routing back only while the shared-state contract remains compatible; it does not erase transactions already committed.",
      "Summary: prepare, verify compatibility and readiness, flip, observe, retain recovery capacity. Reference for further reading: Martin Fowler, BlueGreenDeployment (https://martinfowler.com/bliki/BlueGreenDeployment.html). This lesson models target selection, not a production router configuration or a guarantee of bug-free releases.",
    ],
  },
  contrast: [
    {
      alternative: "Rolling deployment (concept 54)",
      tradeoff: "Replace instances incrementally to reduce spare-capacity demand, but old and new releases coexist throughout the rollout and rollback also takes steps. Shared-state compatibility remains necessary in either approach.",
      whenNotToUse: "Do not choose blue-green when a second full-capacity environment is unaffordable and a compatible incremental rollout meets the recovery requirement. Do not use either strategy as a workaround for an incompatible shared-state migration.",
    },
    {
      alternative: "Canary exposure (concept 53)",
      tradeoff: "Expose a limited audience first to gather production evidence rather than sending the first full wave to green. This reduces initial exposure, not the need for compatible shared state.",
      whenNotToUse: "Do not rely on a full blue-green flip when the decision requires evidence from a small production cohort before broad exposure.",
    },
  ],
  misconceptions: [
    {
      wrong: "Blue-green makes deployments risk-free because the flip is reversible.",
      discriminant: "Separate target selection from state mutations and the behavior of the new release.",
      counterexample: "v2 drops total_cents and commits order 901. The router can select v1 again immediately, but v1 still queries a missing column. Even a compatible v2 can contain a billing bug whose charges survive switch-back.",
    },
    {
      wrong: "The old environment is a backup of my data.",
      discriminant: "Locate the database and ask which copy received the user's write.",
      counterexample: "Both environments use the same orders database. Order 901 committed through green remains after traffic returns to blue; retaining blue preserves application binaries, not a historical database snapshot.",
    },
  ],
  practiceIds: ["t-52-predict", "t-52-variant"],
  evidenceCriteria: [
    "Predict order 901's persistence and v1's behavior in both switch-back rows.",
    "Reject the claim that a target change repairs schema or reverses business writes.",
    "Identify compatibility and warm-up evidence needed before the first full traffic wave.",
    "Transfer target switching to a documentation CDN while accounting for stale HTML and immutable assets.",
  ],
  transfer: {
    domain: "Static documentation publishing through a CDN",
    variant: "Two complete documentation builds are ready with no database. HTML can remain cached for 24 hours. Before changing the CDN origin target, decide how old HTML will still resolve assets, how to refresh HTML and warm representative paths, and what a switch-back cannot undo in edge caches. Use t-52-variant to test this changed constraint.",
  },
  provenance: {
    reviewed: false,
    notes: "Drafted in this round, without effective independent review (redigida nesta rodada, sem revisão independente efetiva). Canonical concept 52 is the input; the numerical gates and order record are teaching assumptions, not measurements. The Fowler reference is further reading, not a claim of source verification or independent review.",
  },
},
{
  "id": 53,
  "rev": "1.0",
  "objective": "Given checkout observations split by release and a declared promotion policy, choose hold, expand or abort exposure and explain why the fleet average is insufficient.",
  "prereqIds": [],
  "mentalModel": {
    "definition": "A canary release exposes a controlled subset of production traffic or users to a candidate while a stable release continues serving the rest. Compare release-labelled health and business outcomes against explicit guardrails; expand exposure only after adequate observation, hold when evidence is insufficient, and abort on a breach. Deployment makes a version available; routing or targeting controls exposure. A canary limits initial direct exposure, not every downstream consequence or the probability of a defect.",
    "analogy": "A transport operator tries a new ticket scanner at a few gates while the other gates retain the old scanner, then checks failures per scanner before adding gates.",
    "analogyLimits": "People at those gates are not guaranteed to represent all travellers. Both scanners may write to the same ticket ledger; a duplicate debit can survive returning to the old scanner. Real traffic weights are approximate, and sessions may need stable assignment rather than a fresh lottery on every request.",
    "correspondence": [
      ["Candidate and stable releases", "New and old ticket scanners"],
      ["Sticky user cohort", "Travellers assigned to the same trial gates"],
      ["Release-labelled guardrail", "Failure counts separated by scanner version"],
      ["Exposure ramp", "Adding trial gates only after a check"]
    ]
  },
  "scenario": {
    "system": "Academy shop checkout v2 is deployed beside v1; a router assigns a stable 5% user cohort to v2 for the whole checkout session.",
    "data": "Each illustrative window has 20,000 checkout attempts: 1,000 on v2 and 19,000 on v1. Window A has 5 v2 errors and 95 v1 errors. Window B has 80 v2 errors and 95 v1 errors. Release-labelled p95 is 240 ms for both in A; in B it is 420 ms for v2 and 240 ms for v1.",
    "symptom": "The fleet dashboard stays below 1% errors even as the candidate fails many of its checkouts; the team wants to expand automatically when a timer expires.",
    "constraints": [
      "Teaching promotion policy: a stage needs at least 30 minutes AND 1,000 candidate attempts, candidate errors at most 1%, candidate-minus-stable error rate at most 0.5 percentage points, and candidate p95 at most 300 ms. A guardrail breach aborts immediately; insufficient evidence holds. These are illustrative, not universal thresholds or statistical confidence guarantees.",
      "Use comparable contemporaneous cohorts; inspect device, region and payment-method coverage. Sticky user assignment does not guarantee precisely 5% of requests.",
      "Both versions share orders, sessions and payment dependencies: preserve read/write compatibility, retain stable capacity for full load, and test removing candidate exposure and draining in-flight requests.",
      "If a stage passes, authorize only the next declared step: 5% to 25% to 50% to 100%, with fresh observation at each partial stage and monitoring after full exposure. A timer alone never promotes.",
      "Version labels and guardrail telemetry must work before exposure. Missing measurements block promotion; a known breach is not excused by missing samples."
    ],
    "baseline": "An all-at-once release exposes every checkout before any release-specific production evidence is collected."
  },
  "representation": {
    "kind": "table",
    "caption": "Illustrative observations, not simulator output: compute candidate and fleet errors separately before choosing the next exposure.",
    "data": {
      "columns": [
        {"key": "stage", "label": "Window / exposure"},
        {"key": "sample", "label": "Duration; candidate attempts"},
        {"key": "rates", "label": "Candidate / stable / fleet errors"},
        {"key": "latency", "label": "Candidate / stable p95"},
        {"key": "action", "label": "Policy action", "emphasis": true}
      ],
      "rows": [
        {
          "cells": {
            "stage": "A early / 5%",
            "sample": "10 min; 1,000",
            "rates": "0.5% / 0.5% / 0.5%",
            "latency": "240 / 240 ms",
            "action": "HOLD: minimum duration not met"
          },
          "tone": "warn"
        },
        {
          "cells": {
            "stage": "A complete / 5%",
            "sample": "30 min; 1,000",
            "rates": "0.5% / 0.5% / 0.5%",
            "latency": "240 / 240 ms",
            "action": "Eligible for 25%, not 100%; verify coverage"
          },
          "tone": "ok"
        },
        {
          "cells": {
            "stage": "B complete / 5%",
            "sample": "30 min; 1,000",
            "rates": "8% / 0.5% / 0.875%",
            "latency": "420 / 240 ms",
            "action": "ABORT: route new sessions to stable; drain and investigate"
          },
          "tone": "down"
        }
      ],
      "note": "A early is a checkpoint within A, not an extra independent sample; B is an alternative outcome of the same stage. Fleet B = (80 + 95) / 20,000. Percentage-point delta B = 8 - 0.5 = 7.5. Request counts are stipulated observations, not an exact consequence of a 5% user cohort."
    },
    "textEquivalent": "At 5% user exposure, A early has 1,000 candidate attempts at 10 minutes: candidate and stable errors are both 0.5%, fleet errors 0.5%, and both p95 values 240 ms. Hold because 30 minutes have not elapsed. At A complete, the same illustrative totals occur after 30 minutes; the numerical gates pass and 25% is eligible after checking cohort coverage, not an immediate jump to 100%. In the alternative B complete at 30 minutes, 80/1,000 candidate attempts fail (8%), versus 95/19,000 stable attempts (0.5%). Combined errors are 175/20,000 = 0.875%. Candidate p95 is 420 ms, stable p95 240 ms. Abort despite the reassuring fleet average: candidate errors, error delta and latency all breach the declared gates."
  },
  "worked": {
    "decision": "Hold at A early; allow only the next stage after A complete and coverage checks; abort B even though fleet errors remain below 1%.",
    "reasoning": [
      "Separate denominators: 80/1,000 is 8%, while (80+95)/20,000 is 0.875%. Most requests still use stable, so the fleet average dilutes candidate harm.",
      "Apply sample and duration gates together: 1,000 fast attempts at 10 minutes do not meet a 30-minute requirement. Conversely, 30 minutes with only 20 attempts would not meet the sample requirement.",
      "For A complete, candidate errors 0.5%, delta zero and p95 240 ms pass. Inspect payment-method and device coverage before moving to 25%; these counts alone do not establish statistical significance or cover rare delayed failures.",
      "For B, candidate errors 8%, delta 7.5 percentage points and p95 420 ms breach the policy. Stop new candidate assignments without waiting for more harm; drain or explicitly handle in-flight sessions and restore stable capacity.",
      "Routing back does not refund charges or repair records already written. Shared dependency overload can affect stable users too, so 5% exposure is not a bound on total damage.",
      "Summary: define assignment and guardrails, expose a small cohort, compare labelled observations, hold for insufficient evidence, expand stepwise on adequate evidence, abort on breach. This is an editorial decision table, not a canary laboratory or production routing recipe."
    ]
  },
  "contrast": [
    {
      "alternative": "Blue-green target switch (52)",
      "tradeoff": "When two complete environments are ready and a broad switch is acceptable, blue-green emphasizes prepared target switching and recovery. Canary emphasizes limited production exposure and an evidence-driven ramp; the two can be combined.",
      "whenNotToUse": "Do not add a canary ramp when traffic is too sparse to inform its gates within the release window; use other validation and an explicit recovery plan, not a token five-minute canary."
    },
    {
      "alternative": "Rolling deployment (54)",
      "tradeoff": "Rolling replacement updates instances in batches based on readiness. That alone does not establish representative audience assignment or business-metric promotion gates. A rolling update can implement a canary if those controls are added.",
      "whenNotToUse": "Do not treat one healthy replacement pod as sufficient canary evidence when the requirement is to detect payment regressions by user cohort."
    },
    {
      "alternative": "Preproduction validation and a separately controlled migration",
      "tradeoff": "Contract tests and migration rehearsals can detect compatibility failures before any customer is exposed; they cannot reproduce every production condition.",
      "whenNotToUse": "Do not trial an irreversible, incompatible shared-schema change on a small cohort: old and new versions can corrupt or misread the same state. Resolve compatibility first. Avoid live trials where even one incorrect action is unacceptable."
    }
  ],
  "misconceptions": [
    {
      "wrong": "Below 1% fleet errors means the canary passed.",
      "discriminant": "Ask which release supplied the numerator and denominator.",
      "counterexample": "B has only 0.875% fleet errors but 8% candidate errors and a 7.5-percentage-point regression relative to stable."
    },
    {
      "wrong": "Thirty quiet minutes prove the candidate is safe for everyone.",
      "discriminant": "Check sample size, relevant segment coverage and delayed outcome visibility separately from elapsed time.",
      "counterexample": "A 30-minute pilot with 20 card payments says little about a rare wallet-provider failure or a settlement error visible tomorrow."
    },
    {
      "wrong": "Five percent exposure caps damage at five percent and rollback undoes it.",
      "discriminant": "Trace shared resources and irreversible effects beyond the cohort boundary.",
      "counterexample": "Candidate requests saturate a shared payment connection pool, slowing stable users too. Removing candidate traffic does not reverse a duplicate charge."
    }
  ],
  "practiceIds": [
    "t-53-compare",
    "t-53-variant"
  ],
  "evidenceCriteria": [
    "Compute B's 8% candidate error rate and 0.875% fleet rate using different denominators.",
    "Distinguish hold for insufficient duration from abort for a guardrail breach.",
    "Choose only the next exposure step after adequate comparable observations, not timer-based full promotion.",
    "Explain why shared-state compatibility and recovery remain necessary with a small cohort.",
    "Transfer evidence-gated exposure to delayed batch outcomes without increasing the blast radius just to obtain samples."
  ],
  "transfer": {
    "domain": "Municipal overnight water-meter billing batches",
    "variant": "A new billing calculator runs for a fixed pilot of 100 low-risk meters while stable handles all others. Assignment is per meter, not HTTP request. Incorrect bills are visible only after next-day reconciliation; there are no live request-latency signals. Policy requires two completed daily reconciliation cycles, at least 200 pilot bill calculations and zero mismatches before expansion. At the first cycle only 100 matching calculations exist. Decide whether to expand now and which evidence to await in t-53-variant; a candidate result can be staged before issuing bills to avoid irreversible customer charges."
  },
  "provenance": {
    "reviewed": false,
    "notes": "Authored and self-checked for this package (s41); no independent technical or learner review. Inspected canonical concept 53, Lesson 52, Task/Lesson contracts and the repository table-shape assertions. Counts, thresholds, cohorts and billing policy are teaching assumptions, not measured production results or confidence bounds. No external technical source consulted; no laboratory or production controller executed. Canonical advice of 2% for 30 minutes was not treated as a universal promotion rule."
  }
},
];