import type { Task } from "@/lib/exercises";
const exact = (picked: string[] | undefined, key: string) => picked?.length === 1 && picked[0] === key;
const exactSet = (picked: string[] | undefined, keys: string[]) => picked?.length === keys.length && keys.every((k) => picked.includes(k));

export const TASKS_DEVOPS: Task[] = [
  {
    id: "t-6-find-flaw", conceptId: 6, type: "find-flaw",
    prompt: "Choose the single release rule that prevents this known regression within the feedback budget without discarding production evidence.",
    context: "Product-search c42 builds in 20 s and passes arithmetic tests in 40 s. A 30 s consumer check rejects its string priceCents; clients require an integer. The pre-merge budget is 120 s. Today the check only logs a warning and deployment continues. A ten-minute production canary measures runtime failures after deployment.",
    options: [
      { key: "a", label: "Keep the warning informational and rely on the canary to catch the type change." },
      { key: "b", label: "Require the consumer check on the merge candidate; block on failure, promote the tested artifact after repair, and keep the canary." },
      { key: "c", label: "Require the consumer check before merge and remove the canary because tests establish production correctness." },
      { key: "d", label: "Add the ten-minute canary to the required pre-merge path and keep the consumer warning informational." },
    ],
    rubric: {
      criteria: [
        { key: "barrier", label: "Enforce the known invariant before exposure within the budget.", cause: "The rule either leaves the deterministic type failure non-blocking or spends ten minutes in a two-minute path. A logged failure alone cannot stop promotion.", check: a => a.picked?.length === 1 && (a.picked[0] === "b" || a.picked[0] === "c") },
        { key: "runtime", label: "Retain production evidence for behavior absent from fixtures.", cause: "The rule either substitutes production detection for a cheap known gate or treats fixture success as proof about runtime dependencies. These are complementary observations.", check: a => a.picked?.length === 1 && a.picked[0] === "b" },
      ],
      expected: "Choose b: 20 + 40 + 30 = 90 s, under 120 s. The contract must block c42, not merely log it. Repair creates a new candidate requiring fresh checks. Promote its tested artifact and retain the production canary because green fixtures cannot establish production behavior.",
      nextStep: "For the daily revenue variant, separate facts available before publication from facts that arrive only later.",
    },
    helpLevels: ["Locate the first point where the type mismatch is known, then ask whether that result can stop release.", "Compare the 90-second deterministic path with the 120-second budget; distinguish a blocking check from an informational report.", "Choose b: enforce the consumer contract before merge, then retain the canary to detect runtime behavior not represented in fixtures."],
  },
  {
    id: "t-6-variant", conceptId: 6, type: "variant",
    prompt: "Choose one publication policy that respects both the deadline and the limits of the available evidence.",
    context: "A revenue dataset publishes at 06:00. At 05:59, a reproducible 20-second check can verify required columns and numeric amount types. Late transactions become observable only at noon. Consumers accept versioned corrections at noon but reject structurally invalid tables. No pre-publication check can establish noon completeness.",
    options: [
      { key: "a", label: "Wait for noon completeness before publishing the first version." },
      { key: "b", label: "Publish at 06:00 without schema validation; repair all defects at noon." },
      { key: "c", label: "Block on schema/type failures, publish a version identified as provisional by 06:00 if checks pass, and reconcile late transactions at noon." },
      { key: "d", label: "Validate schema by 06:00 and mark the result final because the pre-publication checks passed." },
    ],
    rubric: {
      criteria: [
        { key: "structure", label: "Reject a known structural violation before publication.", cause: "The policy allows consumers to see a structural violation that a cheap reproducible check could detect before the deadline.", check: a => a.picked?.length === 1 && (a.picked[0] === "c" || a.picked[0] === "d") },
        { key: "late-evidence", label: "Meet the deadline without claiming completeness before late data arrives.", cause: "Waiting until noon misses the delivery constraint; calling a schema-valid table final confuses a checked invariant with unobserved data completeness.", check: a => a.picked?.length === 1 && a.picked[0] === "c" },
      ],
      expected: "Choose c. Twenty seconds fits the remaining minute and can block structurally invalid output. Completeness cannot be established at 06:00, so publication is provisional and versioned. Noon reconciliation checks a different invariant and produces an accepted correction; schema success never implied complete revenue.",
      nextStep: "Change the constraint so consumers reject corrections: identify the requirement conflict rather than claiming a stronger pipeline can observe future data.",
    },
    helpLevels: ["Sort the required facts by when they can actually be observed.", "Column types are knowable before 06:00; late-arrival completeness is not. Consumers explicitly permit versioned corrections.", "Choose c: validate structure before publication, label the version provisional, and reconcile at noon. The two gates protect different invariants."],
  },
{
    id: "t-7-compare",
    conceptId: 7,
    type: "compare",
    prompt:
      "Select all supported actions for the two changes. Change A modifies receipt-formatting code. Change B only corrects an externally supplied RECEIPT_DB_URL. Keep changes traceable and do not embed environment credentials.",
    context:
      "Image I1 contains commit c7e41, Node.js 22, and locked dependencies. The same I1 passes the test fixture with the correct database setting. A running container is disposable; changing its files does not change I1.",
    options: [
      {
        key: "rebuild",
        label:
          "For A, build and test a new image containing the code change, then record its digest.",
      },
      {
        key: "configure",
        label:
          "For B, keep the image digest and create a run with the corrected external setting; validate its database target.",
      },
      {
        key: "bake",
        label:
          "For B, bake the corrected database URL and credentials into a new environment-specific image.",
      },
      {
        key: "patch",
        label:
          "For A, edit the running container and use the original image identity as the release record.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "artifact",
          label: "Changed packaged code receives a new image identity.",
          cause:
            "You treated a source change as execution configuration. A container created from the original image would still contain the old code.",
          check: (a) => a.picked?.includes("rebuild") === true,
        },
        {
          key: "configuration",
          label: "A database-setting correction stays outside the image.",
          cause:
            "You coupled environment selection to packaging. The missing or incorrect external setting can be corrected without changing the packaged application.",
          check: (a) => a.picked?.includes("configure") === true,
        },
        {
          key: "boundary",
          label: "The plan avoids embedded credentials and untracked patches.",
          cause:
            "An extra action either stores environment credentials in immutable layers or creates running state that the recorded image cannot reproduce.",
          check: (a) =>
            !!a.picked?.length &&
            new Set(a.picked).size === a.picked.length &&
            a.picked.every((key) =>
              ["rebuild", "configure"].includes(key),
            ),
        },
      ],
      expected:
        "Select rebuild and configure. A changes the packaged code, so create and test a new image and identify it by digest. B changes only execution configuration, so reuse the artifact with the corrected external setting and verify the target. Baking credentials creates sensitive environment-specific layers; editing a running container breaks the release record without updating the image.",
      nextStep:
        "Predict what a fresh container from I1 contains after a manual edit to another running container, then apply the same boundary to the scheduled Python job.",
    },
    helpLevels: [
      "For each change, ask whether a fresh container from the existing image would already contain the required application files.",
      "The image owns packaged code and dependencies. A database destination supplied externally belongs to the configuration of a run. Consider what each proposed action records or exposes.",
      "Choose rebuild and configure only. The code change needs a new image; the external database correction does not. Do not add an image containing credentials or an untracked container edit.",
    ],
  },
  {
    id: "t-7-variant",
    conceptId: 7,
    type: "variant",
    prompt:
      "Select all actions supported by the batch-job requirements. Preserve a repeatable analytical environment, retain the report after worker removal, and verify completion without adding a web service.",
    context:
      "An environmental-data scheduler runs a Python 3.12 CSV analysis nightly with a ten-minute budget. The script is unchanged tonight, but the input snapshot date changes. Workers are removed after execution. The scheduler supports external storage mounts and injected credentials. No HTTP consumer exists.",
    options: [
      {
        key: "package",
        label:
          "Package the script, Python runtime, and locked dependencies; select the artifact by digest and create a new image when the parser changes.",
      },
      {
        key: "mount",
        label:
          "Supply the immutable input snapshot location and retained output storage at execution time, with credentials injected separately.",
      },
      {
        key: "verify",
        label:
          "Check exit status, report schema, input-snapshot identity, and durable report availability; measure the time budget separately.",
      },
      {
        key: "port",
        label:
          "Add an HTTP server and expose a port so the scheduler can consider the analytical job complete.",
      },
      {
        key: "guarantee",
        label:
          "Treat successful container startup as proof that the report is correct, retained, and produced within ten minutes.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "image-pkg",
          label: "The analytical implementation is a versioned artifact.",
          cause:
            "You did not preserve the script and its user-space dependencies as one identifiable package, or did not distinguish a parser change from new input data.",
          check: (a) => a.picked?.includes("package") === true,
        },
        {
          key: "run-storage",
          label: "Input selection and retained output belong to the run.",
          cause:
            "You treated changing data or retained results as image contents. A removed worker cannot preserve reports stored only in its disposable writable layer.",
          check: (a) => a.picked?.includes("mount") === true,
        },
        {
          key: "completion",
          label: "Completion is checked against the batch contract.",
          cause:
            "You used process startup as evidence of analytical completion. The job may start successfully and later fail, emit the wrong schema, exceed its budget, or lose its output.",
          check: (a) => a.picked?.includes("verify") === true,
        },
        {
          key: "scope",
          label: "No unnecessary server or unsupported guarantee is introduced.",
          cause:
            "You transferred web-service ceremony or an excessive correctness guarantee to a job whose requirements concern execution and retained output, not HTTP availability.",
          check: (a) =>
            !!a.picked?.length &&
            new Set(a.picked).size === a.picked.length &&
            a.picked.every((key) =>
              ["package", "mount", "verify"].includes(key),
            ),
        },
      ],
      expected:
        "Select package, mount, and verify. The script and locked analytical dependencies define the package. Tonight's input date, output destination, and storage credentials configure the run, so changing only the snapshot does not require a rebuild. Retained storage survives worker removal. Exit status and report checks provide completion evidence, while duration must be measured. No web server or exposed port is required, and startup proves neither the result nor the time budget.",
      nextStep:
        "Compare a new input date with a parser bug fix: identify which preserves the image digest, which requires a new image, and what output checks both runs still need.",
    },
    helpLevels: [
      "List what must remain identical between nights and what must survive after the worker disappears.",
      "Separate the analytical implementation from the selected dataset and storage. Then distinguish starting a process from completing and retaining a valid report.",
      "Choose package, mount, and verify only. Keep code and dependencies in the image; provide input and durable storage at execution time; validate the completed report. Do not add a port or infer correctness from startup.",
    ],
  }
,
  {
    id: "t-52-predict",
    conceptId: 52,
    type: "predict",
    prompt: "Select exactly two predictions that hold after switching traffic back to blue.",
    context: "Shop checkout v1 on blue reads total_cents. Compatible v2 keeps that field; incompatible v2 drops it and writes only total_decimal. In each independent branch, order 901 commits on green before a rendering bug causes switch-back. Both environments share the database; no data repair or restore runs.",
    options: [
      {
        key: "a",
        label: "In the compatible branch, v1 can read order 901 and the order remains committed.",
      },
      {
        key: "b",
        label: "In the incompatible branch, routing returns to v1 but reads still fail on the missing column.",
      },
      {
        key: "c",
        label: "In the incompatible branch, retaining blue also retains the old database schema for its requests.",
      },
      {
        key: "d",
        label: "In both branches, moving traffic back removes order 901 because it was created through green.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "r1",
          label: "Preserves committed state in the compatible branch",
          cause: "You may be treating an environment as an isolated database snapshot rather than an application connected to shared state.",
          check: a =>
            (a.picked ?? []).includes("a") &&
            !(a.picked ?? []).includes("d"),
        },
        {
          key: "r2",
          label: "Separates routing recovery from schema recovery",
          cause: "You may be assuming that switching application binaries back also restores the schema they expect.",
          check: a =>
            (a.picked ?? []).includes("b") &&
            !(a.picked ?? []).includes("c"),
        },
        {
          key: "r3",
          label: "Makes only the two supported predictions",
          cause: "Additional predictions conflict with the stated shared database and absence of repair.",
          check: a =>
            a.picked?.length === 2 &&
            new Set(a.picked).size === 2 &&
            a.picked.every(p => ["a", "b"].includes(p)),
        },
      ],
      expected: "Choose a and b. The compatible schema keeps v1's read contract, so it can read the still-committed order. Dropping total_cents breaks that contract; changing routing back does not recreate the column or undo order 901. c invents a database copy; d invents transaction reversal.",
      nextStep: "Trace the write column through both switch-back rows, then test the CDN variant where persistent cache entries replace database compatibility as the key constraint.",
    },
    helpLevels: [
      "List what belongs to each environment and what is shared. Which part does the router actually change?",
      "Follow order 901 after commit. Separately ask whether the selected application's expected column still exists.",
      "Choose a and b: order 901 remains; v1 works only with the retained total_cents contract. Routing does not restore a database snapshot.",
    ],
  },
  {
    id: "t-52-variant",
    conceptId: 52,
    type: "variant",
    prompt: "Select exactly two release actions that satisfy the documentation publishing constraints.",
    context: "A documentation site has complete old and new static builds behind a CDN. There is no database. Cached HTML can survive for 24 hours, and its hashed asset URLs must keep working. Origin target selection is atomic at the control point, but cached edge responses are not replaced by that selection. The team requires representative paths to be warm before broad exposure; old assets can remain available for at least the HTML cache window.",
    options: [
      {
        key: "a",
        label: "Retain both builds' immutable hashed assets while either build's HTML can still be served.",
      },
      {
        key: "b",
        label: "Plan HTML invalidation or revalidation, verify its edge behavior, and prewarm representative new paths before broad exposure.",
      },
      {
        key: "c",
        label: "Delete the old build's assets once the origin target changes, since the new build is complete.",
      },
      {
        key: "d",
        label: "Use origin switch-back as the HTML cache recovery plan; it also replaces cached edge responses.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "r1",
          label: "Keeps assets reachable for cached documents",
          cause: "You may be considering only the newly active build and overlooking old HTML that still references previous assets.",
          check: a =>
            (a.picked ?? []).includes("a") &&
            !(a.picked ?? []).includes("c"),
        },
        {
          key: "r2",
          label: "Treats cache freshness and warm-up separately from routing",
          cause: "You may be extending atomic origin selection into a guarantee about distributed edge caches and readiness.",
          check: a =>
            (a.picked ?? []).includes("b") &&
            !(a.picked ?? []).includes("d"),
        },
        {
          key: "r3",
          label: "Selects only actions meeting both constraints",
          cause: "The selected set contains an unsupported cache or asset-retention assumption.",
          check: a =>
            a.picked?.length === 2 &&
            new Set(a.picked).size === 2 &&
            a.picked.every(p => ["a", "b"].includes(p)),
        },
      ],
      expected: "Choose a and b. Without a database, rollback safety still depends on persistent state: cached HTML and its asset references. Keep immutable assets for both builds while their HTML may survive, verify HTML refresh behavior, and prewarm representative paths. c breaks old cached pages; d incorrectly treats origin selection as edge invalidation. Warm-up reduces cold-path risk but cannot prove every page correct.",
      nextStep: "Explain what a user with yesterday's cached HTML sees after switch-back, and identify which asset-retention and cache-freshness evidence you would inspect.",
    },
    helpLevels: [
      "Follow one browser that still has yesterday's HTML. What does it request next, and who can answer from cache?",
      "Distinguish changing the origin target from changing cached HTML. Account separately for old asset references and cold new paths.",
      "Choose a and b. Retain referenced assets, verify HTML invalidation or revalidation, and prewarm new paths. Switching origins alone cannot replace cached edge responses.",
    ],
  },
  {
    id: "t-53-compare", conceptId: 53, type: "compare",
    prompt: "Select exactly two justified decisions, comparing the candidate with stable rather than only the fleet average.",
    context: "A and B are alternative 5% stages, not consecutive mandatory steps. A early: 10 minutes, 1,000 candidate attempts, 0.5% errors for both releases, p95 240 ms. B: 30 minutes, candidate 80/1,000 errors and p95 420 ms; stable 95/19,000 errors and p95 240 ms. Policy requires 30 minutes AND 1,000 candidate attempts; candidate errors <=1%, candidate-minus-stable <=0.5 percentage points and candidate p95 <=300 ms. A known breach aborts immediately.",
    options: [
      { key: "a", label: "Expand A early to 25% because it already has 1,000 candidate attempts." },
      { key: "b", label: "Hold A early because the duration requirement is still unmet." },
      { key: "c", label: "Expand B to 25% because fleet errors are 0.875%, below 1%." },
      { key: "d", label: "Abort B because candidate errors and latency breach the declared gates." },
    ],
    rubric: {
      criteria: [
        { key: "r1", label: "Respects the minimum observation duration", cause: "You may be treating a sample-count gate as a replacement for the observation-duration gate.", check: (a) => (a.picked ?? []).includes("b") },
        { key: "r2", label: "Stops exposure on candidate-specific harm", cause: "You may be allowing stable traffic to dilute candidate harm in the fleet average.", check: (a) => (a.picked ?? []).includes("d") },
        { key: "r3", label: "Selects only the two policy-supported decisions", cause: "An extra or missing choice mixes the distinct hold and abort conditions.", check: (a) => exactSet(a.picked, ["b", "d"]) },
      ],
      expected: "Choose b and d. A early lacks duration despite enough attempts. B has 8% candidate errors, 7.5 percentage points above stable, and p95 420 ms. Fleet errors of 0.875% do not override these breaches. Abort stops new candidate exposure, not committed business effects.",
      nextStep: "Recompute B using only candidate attempts, then replace A early with 30 minutes and only 20 candidate attempts: explain why it still holds.",
    },
    helpLevels: [
      "Identify the denominator and observation window each rule actually requires.",
      "Check duration and count independently; then compare candidate health with stable before reading the fleet average.",
      "Choose b and d: hold A early for duration; abort B for 8% errors, a 7.5-point delta and 420 ms p95.",
    ],
  },
  {
    id: "t-53-variant", conceptId: 53, type: "variant",
    prompt: "Select exactly two actions justified by the billing pilot policy at the first reconciliation.",
    context: "A municipal billing calculator has a fixed 100-meter pilot; stable handles all other meters. A meter stays assigned across days. Candidate calculations are staged before bills are issued. Policy requires two completed daily reconciliations, at least 200 pilot bill calculations and zero mismatches before expansion. After one daily cycle, 100 pilot calculations match. Failures appear only during next-day reconciliation; there is no relevant HTTP p95. Expansion before the policy passes is forbidden.",
    options: [
      { key: "a", label: "Expand to all meters now because the first 100 calculations match." },
      { key: "b", label: "Keep the pilot at 100 meters until both the cycle and calculation requirements are met with zero mismatches." },
      { key: "c", label: "Use a quiet 30-minute HTTP dashboard as the missing second reconciliation." },
      { key: "d", label: "Inspect candidate-versus-stable calculation results at the next completed daily reconciliation before deciding on expansion." },
    ],
    rubric: {
      criteria: [
        { key: "r1", label: "Preserves limited exposure while evidence is insufficient", cause: "You may be increasing the blast radius to accelerate evidence collection rather than respecting the fixed-pilot constraint.", check: (a) => (a.picked ?? []).includes("b") },
        { key: "r2", label: "Waits for the domain-specific correctness signal", cause: "You may be carrying HTTP latency or a short timer into a domain whose errors appear only at reconciliation.", check: (a) => (a.picked ?? []).includes("d") },
        { key: "r3", label: "Selects only actions permitted before expansion", cause: "An extra or missing action bypasses the explicit two-cycle, 200-calculation policy.", check: (a) => exactSet(a.picked, ["b", "d"]) },
      ],
      expected: "Choose b and d. One cycle and 100 matches meet neither two cycles nor 200 calculations. Keep exposure fixed; a second completed daily reconciliation can supply the missing results. Inspect release-labelled correctness rather than request latency. A mismatch blocks promotion; staged calculations reduce irreversible billing effects but do not prove every future tariff correct.",
      nextStep: "Suppose cycle two contains one tariff mismatch: state why the zero-mismatch gate blocks expansion and identify which staged bills require investigation.",
    },
    helpLevels: [
      "Which event makes the failure observable in this domain, and what unit does the policy count?",
      "Compare completed daily reconciliations and pilot calculations separately with their required totals; a quiet request graph supplies neither.",
      "Choose b and d: keep the 100-meter pilot and await the next daily reconciliation; one cycle and 100 matches are insufficient.",
    ],
  },
];