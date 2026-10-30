import type { Task } from "@/lib/exercises";
const exact = (picked: string[] | undefined, key: string) => picked?.length === 1 && picked[0] === key;
export const TASKS_SECURITY: Task[] = [
  {
    id: "t-78-compare", conceptId: 78, type: "compare",
    prompt: "Choose one support lookup implementation that preserves apostrophes and fixes the SQL grammar before receiving values.",
    context: "The statement filters username and password. Illustrative driver API: query(statement, values). Authorization and password hashing are outside this comparison.",
    options: [
      { key: "a", label: "Replace apostrophes in username, then concatenate username and password into SQL." },
      { key: "b", label: "Use WHERE username = $1 AND password = $2 and pass both values separately to the driver." },
      { key: "c", label: "Prepare a statement after interpolating both values into its SQL string." },
    ],
    rubric: {
      criteria: [{ key: "boundary", label: "Both values remain outside SQL syntax", cause: "The selected construction may still assemble SQL syntax from values; preparing an already interpolated string does not restore the boundary.", check: a => exact(a.picked, "b") }],
      expected: "B fixes the statement before values arrive and binds both through the driver. A is context-dependent string rewriting; C prepares attacker-influenced syntax. Binding does not prove authentication or authorization correct.",
      nextStep: "Compare the same comment payload as a bound value and as concatenated SQL in /labs/sqli; then try the catalog variant.",
    },
    helpLevels: ["Mark which parts of each query are chosen before user values arrive.", "A prepared-query call is not enough if interpolation already changed its statement argument.", "Choose B: the driver receives fixed syntax and two separate values, including legitimate apostrophes."],
  },
  {
    id: "t-78-variant", conceptId: 78, type: "variant",
    prompt: "Choose one museum catalog design for a title search and a selected sort column.",
    context: "Titles may contain apostrophes. Only title and accession_date are allowed sort columns. The driver binds values, not identifiers.",
    options: [
      { key: "a", label: "Bind the title value; map the sort selection to a fixed server-owned column and reject unknown selections." },
      { key: "b", label: "Bind title and sort with WHERE title = $1 ORDER BY $2, expecting $2 to name the requested column." },
      { key: "c", label: "Escape quotes in the title and append the submitted sort string unchanged." },
    ],
    rubric: {
      criteria: [{ key: "syntax", label: "Distinguish value binding from allowed syntax selection", cause: "The selected design either mistakes a value placeholder for an identifier or leaves user-controlled SQL syntax in the sort clause.", check: a => exact(a.picked, "a") }],
      expected: "A binds the title and chooses syntax only from fixed application mappings. B cannot make a value parameter a column identifier; C leaves the sort clause open. Permission to see each record remains a separate concern.",
      nextStep: "Trace title=O'Brien and an unknown sort choice through each path: one must remain literal and the other must be rejected.",
    },
    helpLevels: ["Separate the search value from the part that names a database structure.", "A placeholder represents a value; the application must own the finite set of column names.", "Choose A: bind the title, map allowed sorts, reject unknown choices; do not concatenate a submitted identifier."],
  },
  {
    id: "t-79-find-flaw", conceptId: 79, type: "find-flaw",
    prompt: "Which one rendering path violates the plain-comment requirement despite normal framework escaping elsewhere?",
    context: "A comment contains <img src=x onerror=alert(1)>. It must be displayed literally. data-note is a fixed inert attribute; none of these paths is an intentionally allowed rich-text editor.",
    options: [
      { key: "a", label: "Assign the string to a paragraph's textContent." },
      { key: "b", label: "Assign the string through a DOM API to the fixed data-note attribute." },
      { key: "c", label: "Assign the string to innerHTML to keep the supplied markup." },
    ],
    rubric: {
      criteria: [{ key: "sink", label: "Locate the browser parsing boundary", cause: "The selected path does not identify where the string is parsed into HTML and an event handler; inert text and a fixed inert attribute do not share innerHTML semantics.", check: a => exact(a.picked, "c") }],
      expected: "C creates HTML rather than text. The img handler can execute on an image-load error. A keeps literal text; B is inert only because the attribute name and DOM API are fixed as stated. Framework defaults cannot protect an unsafe escape hatch.",
      nextStep: "Compare this with href=javascript:alert(1): identify why keeping attribute delimiters intact still does not validate a URL scheme.",
    },
    helpLevels: ["Locate the operation that asks the browser to create elements from the string.", "The important distinction is parsing HTML versus assigning an inert value, not whether the source contains a script tag.", "Choose C: innerHTML creates markup and a handler; plain comments should use a text sink."],
  },
  {
    id: "t-79-variant", conceptId: 79, type: "variant",
    prompt: "Choose one archive kiosk policy that preserves approved bold/list descriptions and permits only https visitor links.",
    context: "Imports can contain img event handlers. Link text and href are separate values. No inline JavaScript is required. Approval at import time is not a rendering guarantee.",
    options: [
      { key: "a", label: "HTML-encode every field, including the href value, and insert encoded descriptions as literal text." },
      { key: "b", label: "Remove script tags at import, then render description HTML and accept the submitted href." },
      { key: "c", label: "Use a maintained subset HTML sanitizer for descriptions, a text sink for link labels, and parse/restrict href schemes to https before assignment." },
    ],
    rubric: {
      criteria: [{ key: "contexts", label: "Preserve permitted formatting without granting executable context", cause: "The selected policy either loses required formatting or treats HTML filtering/encoding as if it also validated executable handlers and URL schemes.", check: a => exact(a.picked, "c") }],
      expected: "C handles three output roles separately. A can display plain text safely but fails the formatting requirement and does not enforce the URL policy. B misses event handlers and javascript URLs. Sanitizer configuration and updates remain necessary; CSP is supplementary.",
      nextStep: "For each field name the final interpreter, allowed behavior, and a rejected example; explain why /labs/sqli cannot validate these browser properties.",
    },
    helpLevels: ["List which fields must retain markup and which represent a navigation destination.", "Preserving a safe HTML subset and validating a URL scheme are different jobs; text encoding alone cannot satisfy both.", "Choose C: sanitize allowed HTML, keep labels as text, and validate parsed https URLs before assigning href."],
  },
  {
    id: "t-67-find-flaw",
    conceptId: 67,
    type: "find-flaw",
    prompt:
      "Select exactly two unresolved failures in this shipping-key migration.",
    context:
      "The shop removes a committed key from the current branch, stores the SAME value in a manager and restarts both replicas with it in their environment. The issuer still accepts it. A diagnostic child process inherits and prints the environment into support bundles. The team declares the leak contained.",
    options: [
      {
        key: "a",
        label:
          "Copied history still contains an accepted key; issuer-side invalidation has not happened.",
      },
      {
        key: "b",
        label:
          "The inherited environment can expose the delivered key in support bundles.",
      },
      {
        key: "c",
        label:
          "Restarting both replicas necessarily prevents runtime secret retrieval.",
      },
      {
        key: "d",
        label:
          "A runtime manager requires putting its retrieved secret back in Git to preserve availability.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "lifecycle",
          label: "Recognize authority survives relocation",
          cause:
            "You may be treating removal from the current branch as invalidation at the issuer.",
          check: a => !!a.picked?.includes("a"),
        },
        {
          key: "delivery",
          label: "Recognize a runtime export path",
          cause:
            "You may be assuming an environment value is private after retrieval from a manager.",
          check: a => !!a.picked?.includes("b"),
        },
        {
          key: "scope",
          label: "Reject unsupported failure claims",
          cause:
            "You may be confusing retrieval and restart constraints with requirements that the scenario never states.",
          check: a =>
            a.picked?.length === 2 &&
            new Set(a.picked).size === 2 &&
            a.picked.every(p => p === "a" || p === "b"),
        },
      ],
      expected:
        "Choose a and b. Relocating the same accepted value cannot neutralize copies in Git history. A manager controls retrieval, not what the authorized process later exports. Issue a replacement, refresh both replicas, revoke the old value at the issuer and verify rejection; stop the support-bundle leak. Restarting does not inherently block retrieval, and committing secrets is not an availability requirement.",
      nextStep:
        "Trace who can copy the value before and after retrieval, then apply the CI variant.",
    },
    helpLevels: [
      "Separate possession of secret bytes from the issuer's decision to accept them.",
      "Trace one old clone and one diagnostic child process. Did either lose access when the storage location changed?",
      "Choose a and b: invalidate the old authority at the issuer and close the runtime export path; relocation alone does neither.",
    ],
  },
  {
    id: "t-67-variant",
    conceptId: 67,
    type: "variant",
    prompt:
      "Choose one credential plan for the unattended game-telemetry CI job.",
    context:
      "Jobs last at most eight minutes. The report service can exchange the CI platform's verified workload identity for a ten-minute, upload-only token with the report-service audience. It checks expiry on each request. Only the release workflow should be trusted. There is no human in the loop; reports already uploaded are not undone by expiry.",
    options: [
      {
        key: "job",
        label:
          "Authorize only the release workload identity, exchange per job for the scoped token, avoid logging it, discard local copies at job end and rely on enforced expiry with a containment path for early leaks.",
      },
      {
        key: "shared",
        label:
          "Keep one upload-only static token in a masked CI variable shared by release jobs; manually replace it after reported incidents.",
      },
      {
        key: "erase",
        label:
          "Exchange per job, then delete the local token file at job end as the only mechanism that invalidates copied tokens.",
      },
      {
        key: "broad",
        label:
          "Exchange identity from any repository workflow for a ten-minute token, using short expiry as the trust boundary.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "issuance",
          label: "Bind issuance to the intended workload",
          cause:
            "You may be substituting short duration or CI masking for authorization of who can obtain the token.",
          check: a =>
            a.picked?.length === 1 && a.picked[0] === "job",
        },
        {
          key: "invalidation",
          label: "Separate cleanup from invalidation",
          cause:
            "You may be assuming deletion recalls copies, or overlooking that static tokens have no per-job enforced end of authority.",
          check: a =>
            a.picked?.length === 1 &&
            (a.picked[0] === "job" || a.picked[0] === "broad"),
        },
      ],
      expected:
        "Choose job. Verified release-workload identity removes the need for a shared bootstrap API secret; issuer policy must check workflow identity and audience. Per-job scoped issuance plus enforced ten-minute expiry bounds copied-token use, whereas file deletion only removes a local copy. Expiry does not stop abuse during those ten minutes or undo an upload. On early exposure, stop the job, contain issuance and revoke if supported; otherwise account for residual validity until expiry. Broad workflow trust permits unauthorized issuance despite short lifetime.",
      nextStep:
        "Explain which issuer check stops an expired copied token and which evidence would reveal unauthorized uploads before expiry.",
    },
    helpLevels: [
      "Ask separately who may obtain authority and how a copied token stops working without a human.",
      "Compare workload authorization, per-job lifetime and local file cleanup. Which are enforced by the accepting service rather than the runner?",
      "Choose job: constrain release-workload issuance, use a scoped per-job token and enforced expiry, suppress exports and plan containment. Expiry limits future use, not damage already done.",
    ],
  },
  {
    id: "t-71-find-flaw", conceptId: 71, type: "find-flaw",
    prompt: "Choose exactly one correction to the claim: “The browser shows HTTPS, so login data is protected on the whole shop path and the API can omit ownership checks.”",
    context: "Browser-to-gateway TLS validates the public hostname. The gateway must inspect requests and sends HTTP to the API across an observable network.",
    options: [
      { key: "a", label: "Encrypt the API disk and shorten token lifetime; retain HTTP upstream and omit ownership checks." },
      { key: "b", label: "Use separately validated TLS to the API and keep ownership checks; the gateway still reads plaintext." },
      { key: "c", label: "Keep HTTP upstream and retain ownership checks; the public certificate also protects the upstream leg." },
    ],
    rubric: {
      criteria: [
        { key: "transport_scope", label: "Protect the exposed upstream connection", cause: "Public HTTPS or storage encryption has been extended beyond its actual protection boundary.", check: (a) => exact(a.picked, "b") },
        { key: "permission_boundary", label: "Retain application permission checks", cause: "Server identity or token lifetime has been substituted for an API ownership decision.", check: (a) => (a.picked ?? []).includes("b") || (a.picked ?? []).includes("c") },
      ],
      expected: "B is the only complete correction. A leaves the network exposure and removes authorization. C retains authorization but falsely extends browser TLS to the HTTP leg. Re-encryption protects two network legs, not plaintext inside the gateway.",
      nextStep: "Draw two independent connections and mark each decryption endpoint; then test the clock-failure variant without changing identity requirements.",
    },
    helpLevels: [
      "Mark where each connection begins and ends, then underline the claim about order permissions.",
      "TLS termination ends one protected channel. The next network leg and the API ownership decision are separate obligations.",
      "Choose B. Protect the second leg with validated TLS and keep API ownership checks; gateway plaintext remains.",
    ],
  },
  {
    id: "t-71-variant", conceptId: 71, type: "variant",
    prompt: "Choose exactly one safe upload policy for the field sensor.",
    context: "Environmental monitoring over intermittent satellite links; direct sensor-to-collector TLS, no gateway. A reset clock makes the certificate appear not yet valid. Upload may wait, approved authenticated time recovery is available, and certificate verification must remain enforced.",
    options: [
      { key: "a", label: "Bypass certificate-time validation for this connection, then upload over encryption." },
      { key: "b", label: "Encrypt local readings on disk and upload them over HTTP to avoid certificate errors." },
      { key: "c", label: "Recover time through the approved authenticated procedure, then upload only after collector certificate and hostname validation succeed." },
    ],
    rubric: {
      criteria: [
        { key: "identity_preserved", label: "Preserve authenticated destination identity despite intermittent connectivity", cause: "Connectivity pressure has displaced identity validation, or stored-data encryption has been mistaken for a protected channel.", check: (a) => exact(a.picked, "c") },
      ],
      expected: "C uses the permitted delay to recover validation prerequisites without silently weakening trust. A weakens certificate validation; B does not provide TLS server authentication or channel protection. Validated TLS protects reading contents on the satellite path, not addresses, traffic sizes or timing, and not the collector's later use of readings.",
      nextStep: "State what the satellite operator can still observe and what the collector can read; contrast that with the shop gateway's plaintext access.",
    },
    helpLevels: [
      "Which requirement may be delayed, and which trust requirement must remain true?",
      "The clock is a prerequisite for certificate validity checks. A storage control does not repair destination authentication.",
      "Choose C: restore time through the approved authenticated procedure, validate identity, then upload; traffic metadata remains observable.",
    ],
  },
];
