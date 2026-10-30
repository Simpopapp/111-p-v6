import type { Lesson } from "./types";
export const LESSONS_SECURITY: Lesson[] = [
{"id":78,"rev":"3.0","objective":"Separate SQL syntax from values in a support lookup, then handle a dynamic sort field without treating identifiers as bindable values.","prereqIds":[],"mentalModel":{"definition":"SQL injection occurs when untrusted input becomes SQL syntax rather than a value. Binding values through the database driver preserves the statement structure; identifiers and keywords require a separate, server-owned choice of syntax.","analogy":"A clerk receives a fixed lookup form with a separate box for the requested name, rather than a letter allowed to rewrite the lookup instructions.","analogyLimits":"A database parses a formal language, not human intent. A placeholder usually represents a value, not a column name; stored procedures and ORMs can still concatenate unsafe SQL.","correspondence":[["Untrusted value","Message handed to a clerk"],["Interpreter boundary","Rules governing what the clerk may execute"]]},"scenario":{"system":"Support staff at the recurring shop investigate customer accounts.","data":"Demo users: alice, O'Brien, bob, carol. The lab fixes an inline password predicate to secret.","symptom":"The input x' OR '1'='1' -- changes a lookup into a broad match in the concatenated demo.","constraints":["Preserve legitimate apostrophes.","Bind all user-controlled values through the driver.","Only username or created_at may be selected as a sort column."],"baseline":"Compare concatenation and binding for the same input; also check that O'Brien remains a valid literal lookup."},"representation":{"kind":"table","caption":"Compare the same input at each interpreter boundary.","data":{"columns":[{"key":"path","label":"Path"},{"key":"interpretation","label":"Interpretation","emphasis":true},{"key":"result","label":"Consequence"}],"rows":[{"cells":{"path":"Concatenation: x' OR '1'='1' --","interpretation":"WHERE user = 'x' OR '1'='1' --' AND pass = 'secret'","result":"The comment removes the trailing predicate in the supported demo; all four rows match."}},{"cells":{"path":"Bound value: x' OR '1'='1' --","interpretation":"WHERE user = $1 AND pass = $2; input is one value","result":"No literal username matches; SQL structure is unchanged."}},{"cells":{"path":"Bound value: O'Brien","interpretation":"One literal username, apostrophe included","result":"A legitimate matching row can be returned; parameterization does not mean zero rows."}}],"note":"Fixed editorial comparison, not a live execution. Snippets are illustrative, not production implementations."},"textEquivalent":"Concatenation: x' OR '1'='1' -- — WHERE user = 'x' OR '1'='1' --' AND pass = 'secret' — The comment removes the trailing predicate in the supported demo; all four rows match.. Bound value: x' OR '1'='1' -- — WHERE user = $1 AND pass = $2; input is one value — No literal username matches; SQL structure is unchanged.. Bound value: O'Brien — One literal username, apostrophe included — A legitimate matching row can be returned; parameterization does not mean zero rows.."},"worked":{"decision":"Bind username and password values; map sort choices to server-owned column names.","reasoning":["First mark the quote and comment in the concatenated statement: they change the grammar, not merely the search text.","Next hold the statement constant and send values separately through the driver. Do not interpolate into a string before calling a prepared-query API.","For sort=username choose the fixed username column; for sort=created choose created_at; reject other choices. Binding ORDER BY $1 does not select a column name.","In /labs/sqli compare the supported comment payload and a literal name. The simulator recognizes selected patterns over four fictional names; it is not a SQL parser, password verifier, authentication design, or proof of exploitability on an actual database. The no-comment OR example also depends on the remaining predicate and AND precedence."]},"contrast":[{"alternative":"Escape apostrophes in a concatenated string","tradeoff":"Correct dialect-aware escaping can apply in limited contexts, but ad hoc replacement is not a general syntax boundary.","whenNotToUse":"Do not use quote replacement as the defense for numeric clauses or dynamic identifiers."},{"alternative":"Use an ORM or stored procedure","tradeoff":"Useful abstraction when it binds values; raw SQL and dynamic statements remain review points.","whenNotToUse":"Do not assume an API name proves values are bound."},{"alternative":"Bind values and allow-list syntax choices","tradeoff":"Preserves names and restricts grammar; requires explicit mappings for identifiers.","whenNotToUse":"Do not use SQL parameterization as browser XSS protection or as authorization; a safe query can still expose unauthorized rows."}],"misconceptions":[{"wrong":"Escaping quotes solves SQL injection.","discriminant":"Identify whether the insertion point is a quoted string, numeric expression, or identifier.","counterexample":"A report concatenates WHERE account_id = followed by 0 OR 1=1. There are no apostrophes to escape, yet the predicate changes."},{"wrong":"A parameterized query cannot return rows.","discriminant":"Binding preserves meaning rather than forcing rejection.","counterexample":"O'Brien is a legitimate literal demo name and still matches when bound."}],"practiceIds":["t-78-compare","t-78-variant"],"evidenceCriteria":["Locate the interpreter boundary and explain the observed consequence.","Choose a mitigation under the stated constraints without accepting the competing unsafe change.","Transfer the decision to another domain and name what remains unproved."],"transfer":{"domain":"Museum catalog","variant":"An internal museum catalog accepts a title containing apostrophes and a curator-selected sort key. Only accession_date and title are allowed; the driver cannot bind identifiers. Choose value binding plus a server-owned sort mapping, and explain why access permissions still need separate checks."},"provenance":{"reviewed":false,"notes":"Drafted in this round; no effective independent review. Reference: OWASP SQL Injection Prevention Cheat Sheet (parameterized queries and allow-list identifiers). References named for follow-up, not independently revalidated in this round. Revisão independente (s38b) confirmou a lição e os limites do simulador; ajuste pendente é no resumo canônico (fix) do conceito 78, registrado para a rodada seguinte."}},
{"id":79,"rev":"3.0","objective":"Choose a safe rendering path for plain comments, links, and limited rich text by locating the browser interpretation context.","prereqIds":[],"mentalModel":{"definition":"XSS occurs when untrusted content is interpreted as executable browser content in an application origin. Safety depends on the output context and sink: use text APIs for plain text, context-appropriate encoding where supported, URL scheme validation for links, and maintained HTML sanitization when HTML is intentionally allowed. Avoid inserting untrusted content into inline JavaScript or event handlers.","analogy":"A clerk can file a message as quoted text, or mistakenly treat it as instructions. Each destination has its own rules for recognizing instructions.","analogyLimits":"The browser has nested HTML, URL, and JavaScript interpreters; a single universal quoting stamp cannot protect them all. HTML text escaping does not validate a URL or make inline JavaScript safe.","correspondence":[["Untrusted value","Message handed to a clerk"],["Interpreter boundary","Rules governing what the clerk may execute"]]},"scenario":{"system":"The same shop displays support comments and customer-provided profile links.","data":"Controlled string: <img src=x onerror=alert(1)>. Profile link test: javascript:alert(1). No real customer data is involved.","symptom":"A comment displayed with innerHTML can execute a handler instead of remaining a visible comment.","constraints":["Plain comments must display literally.","Profile links may use only validated https URLs.","A separate help editor must retain approved bold and list markup.","Avoid inline JavaScript and event-handler insertion."],"baseline":"Compare the same comment string via textContent, innerHTML, and a quoted data-note attribute set through a DOM API."},"representation":{"kind":"table","caption":"Compare the same input at each interpreter boundary.","data":{"columns":[{"key":"path","label":"Path"},{"key":"interpretation","label":"Interpretation","emphasis":true},{"key":"result","label":"Consequence"}],"rows":[{"cells":{"path":"textContent = <img src=x onerror=alert(1)>","interpretation":"HTML text value, not parsed markup","result":"The tag is visible text; no image or handler is created."}},{"cells":{"path":"innerHTML = <img src=x onerror=alert(1)>","interpretation":"HTML parser creates an image with an event handler","result":"A failed image load can execute the handler; reject this sink for plain comments."}},{"cells":{"path":"setAttribute(data-note, same string)","interpretation":"Fixed inert attribute name with a DOM value","result":"The string is data; changing the attribute to onclick changes the safety assumption."}},{"cells":{"path":"href = javascript:alert(1)","interpretation":"URL context: a script scheme, even if HTML-escaped","result":"Validate the parsed scheme and reject; escaping alone cannot authorize a URL."}},{"cells":{"path":"Inline JavaScript receives the same string","interpretation":"JavaScript parser rules, possibly nested in HTML","result":"Do not interpolate untrusted data into script source; pass data through safe APIs instead."}}],"note":"Fixed editorial comparison, not a live execution. Snippets are illustrative, not production implementations."},"textEquivalent":"textContent = <img src=x onerror=alert(1)> — HTML text value, not parsed markup — The tag is visible text; no image or handler is created.. innerHTML = <img src=x onerror=alert(1)> — HTML parser creates an image with an event handler — A failed image load can execute the handler; reject this sink for plain comments.. setAttribute(data-note, same string) — Fixed inert attribute name with a DOM value — The string is data; changing the attribute to onclick changes the safety assumption.. href = javascript:alert(1) — URL context: a script scheme, even if HTML-escaped — Validate the parsed scheme and reject; escaping alone cannot authorize a URL.. Inline JavaScript receives the same string — JavaScript parser rules, possibly nested in HTML — Do not interpolate untrusted data into script source; pass data through safe APIs instead.."},"worked":{"decision":"Render comments as text; validate profile URLs; sanitize intentionally allowed help HTML.","reasoning":["Trace each value to its final sink rather than labeling the entire record clean.","For comments choose textContent or framework text interpolation. Do not replace the sink with innerHTML to preserve angle brackets.","For profile links parse with a URL API, require https under the stated policy, and assign through the framework or DOM attribute API. A safe scheme does not certify destination trust.","For the help editor use a maintained HTML sanitizer configured for the required subset at the rendering boundary. Do not mutate sanitized markup into unsafe HTML afterward; keep the sanitizer updated.","The table describes browser behavior, not an executing attack demo. /labs/sqli models server SQL interpretation, not DOM sinks or browser execution. CSP is defense in depth, not a replacement for safe rendering."]},"contrast":[{"alternative":"Strip suspicious strings at input","tradeoff":"Can enforce business rules, but loses context and can corrupt legitimate content.","whenNotToUse":"Do not use a blacklist of script tags: an img event handler is already a counterexample."},{"alternative":"Encode at the output context or use a safe text sink","tradeoff":"Preserves plain text without creating markup; each context has different requirements.","whenNotToUse":"Do not apply HTML text encoding as the sole defense for URLs, JavaScript source, or intentionally allowed HTML."},{"alternative":"Sanitize HTML with an explicit allowed subset","tradeoff":"Preserves selected formatting at the cost of a maintained policy and sanitizer dependency.","whenNotToUse":"Do not sanitize plain text into HTML unnecessarily, or treat sanitization as authorization of external links."}],"misconceptions":[{"wrong":"Modern frameworks eliminate XSS.","discriminant":"Check escape hatches and the semantics of the sink, not only text interpolation.","counterexample":"A component assigning a stored comment to innerHTML bypasses normal text escaping; a raw href accepting javascript: also needs a URL policy even if attribute delimiters are escaped."},{"wrong":"Removing script tags makes HTML safe.","discriminant":"Executable HTML includes more than script elements.","counterexample":"<img src=x onerror=alert(1)> contains no script tag but supplies an executable event handler in a permissive HTML sink."}],"practiceIds":["t-79-find-flaw","t-79-variant"],"evidenceCriteria":["Locate the interpreter boundary and explain the observed consequence.","Choose a mitigation under the stated constraints without accepting the competing unsafe change.","Transfer the decision to another domain and name what remains unproved."],"transfer":{"domain":"Public museum archive","variant":"An archive kiosk imports curator-approved rich descriptions and visitor-provided external links. It must preserve bold/list formatting but permit only https links and no event handlers. Choose maintained HTML sanitization for descriptions and URL validation for links; explain why input-time approval and text encoding alone do not meet both requirements."},"provenance":{"reviewed":false,"notes":"Drafted in this round; no effective independent review. Reference: OWASP Cross Site Scripting Prevention Cheat Sheet (contextual encoding, safe sinks, and HTML sanitization). References named for follow-up, not independently revalidated in this round. Revisão independente (s38b) confirmou a lição; ajuste pendente é no resumo canônico (fix) do conceito 79 (sanitização universal), registrado para a rodada seguinte."}}
,
{
  id: 67,
  rev: "3.0",
  objective:
    "Trace a shop API credential through creation, storage, delivery, rotation and revocation; choose a migration that keeps checkout working while making a leaked copy unusable.",
  prereqIds: [],
  mentalModel: {
    definition:
      "Secrets management controls a credential's lifecycle: generate an unpredictable value with a cryptographically secure generator or trusted issuer, restrict who can read stored copies, deliver it only to authorized workloads, replace it routinely, and invalidate old values at the accepting service. Storage alone does not manage that lifecycle.",
    analogy:
      "A shop issues numbered keys, records who receives them and changes the lock when a key must stop working, rather than merely buying a stronger key cabinet.",
    analogyLimits:
      "Digital keys can be copied invisibly. A cabinet cannot retrieve those copies; only issuer-side revocation or enforced expiry stops their future use. Rotation does not undo actions already taken.",
    correspondence: [
      ["Secret store", "Restricted key cabinet"],
      ["Workload delivery", "Handing a key to an authorized worker"],
      ["Issuer-side revocation", "Changing which keys the lock accepts"],
    ],
  },
  scenario: {
    system:
      "The recurring shop's checkout workers call a shipping-label API; two worker replicas must continue fulfilling paid orders.",
    data:
      "One long-lived shipping API key is committed in config.ts. The issuer supports two active keys, explicit revocation, and key-specific request logs. Workers cache their configured key until restarted. A support bundle includes an environment dump.",
    symptom:
      "An unknown client uses the shipping key after a contractor downloads repository history. Moving the current value to an environment variable leaves those calls succeeding.",
    constraints: [
      "Do not print credentials in logs, bundles or tickets.",
      "Keep checkout available during a controlled replacement; active abuse may require immediate revocation and temporary interruption.",
      "The shipping issuer does not support short-lived credentials; runtime delivery must therefore use a managed static key.",
      "Remove the committed value, but assume existing clones and backups retain it.",
    ],
    baseline:
      "Compare each storage path for the same shipping API permission. In a controlled test, record whether a new-key request succeeds and whether an old-key request is rejected after revocation; never test using a real leaked credential in a teaching environment.",
  },
  representation: {
    kind: "table",
    caption:
      "Follow the same shipping API authority through four placements: copying bytes elsewhere is not revocation.",
    data: {
      columns: [
        { key: "local", label: "Location" },
        { key: "readers", label: "Who can read" },
        { key: "leak", label: "Leak consequence" },
        { key: "rotation", label: "Rotation cost", emphasis: true },
      ],
      rows: [
        {
          cells: {
            local: "Key committed in repository",
            readers:
              "Repository readers, clones, CI and retained history",
            leak:
              "The exposed bytes persist in copied Git history; revocation can still invalidate their authority.",
            rotation:
              "Issue replacement, update every consumer and revoke old key. History cleanup cannot recall clones.",
          },
        },
        {
          cells: {
            local: "Untracked .env on one machine",
            readers:
              "File owner, permitted local processes, privileged users and any backups containing it",
            leak:
              "A copied value remains usable until expiry or revocation; .gitignore does not control runtime readers.",
            rotation:
              "Replace each machine's copy, restart cached consumers, verify and revoke; manual inventory is costly.",
          },
        },
        {
          cells: {
            local: "Secret manager referenced at runtime",
            readers:
              "Authorized workload identities, permitted administrators and compromised authorized runtimes",
            leak:
              "Access policies and audit narrow exposure, but a stolen fetched value still works until invalidated.",
            rotation:
              "Create a new version, refresh consumers, verify new use and revoke old value at issuer; changing a stored version alone is insufficient.",
          },
        },
        {
          cells: {
            local: "Short-lived credential injected at deploy",
            readers:
              "Authorized deployment path and target runtime; potentially inherited child processes",
            leak:
              "If supported and expiry is enforced by issuer, copied authority expires; compromise can still abuse it before expiry.",
            rotation:
              "Automated issuance and refresh reduce manual work; bootstrap identity and refresh failures must be handled. This shipping issuer cannot use this option.",
          },
        },
      ],
      note:
        "Compare the same API authority, not a proposal to reuse one literal key across environments. The ephemeral row is a conditional issuer capability. Git uniquely preserves exposure through version history in this comparison; dumps, backups and logs can also retain other leaked copies. No placement prevents all leaks.",
    },
    textEquivalent:
      "A committed key reaches repository readers and persists in history; replace all consumers and revoke it. A local .env limits repository exposure but is readable by permitted processes and backups; update and restart each consumer. A runtime secret manager narrows and audits retrieval but still requires refresh and issuer revocation. An issuer-supported ephemeral deploy credential expires automatically but can be abused until expiry and needs automated refresh. Cheap, tested rotation makes leaks more manageable, not harmless.",
  },
  worked: {
    decision:
      "Contain the incident at the issuer and migrate shipping workers to a runtime-referenced secret with a tested rotation procedure, not just an environment rename.",
    reasoning: [
      "Inventory both replicas, CI, local copies and support bundles; stop dumping environment values. Generate the replacement through the issuer, not from a predictable shop name.",
      "Store the replacement behind a workload-scoped retrieval policy; use an existing workload identity rather than committing a new secret-manager access key. The fetched value still enters process memory.",
      "Publish the new reference/version and restart both replicas because they cache credentials. Confirm new-key requests succeed and old-key traffic from legitimate workers has stopped.",
      "For the stated overlap procedure, revoke the old key at the shipping issuer and verify it is rejected. If abuse is ongoing, revoke immediately even if fulfillment briefly pauses; availability does not justify leaving known abuse enabled.",
      "Remove the secret from tracked code and coordinate history cleanup, but treat old clones as permanently exposed. Review key-specific requests for misuse; revocation cannot recover stolen data or reverse labels already purchased.",
      "Schedule and rehearse the same replacement before any incident. Measure refresh completion and failed requests without logging secret values; expiry or revocation limits duration only when actually enforced.",
    ],
  },
  contrast: [
    {
      alternative: "Environment variable instead of secret manager",
      tradeoff:
        "An environment variable is a delivery channel, not an issuance, access-audit or revocation system. It may carry a managed secret, but authorized process readers can still copy it.",
      whenNotToUse:
        "Do not add a manager just to rename a local teaching value; do not call environment-only distribution lifecycle management when consumers cannot be inventoried and refreshed.",
    },
    {
      alternative: "Database encryption at rest (concept 72)",
      tradeoff:
        "Encryption at rest protects stored data against a different access path. A client presenting an accepted credential may still read decrypted data through the service; credential revocation controls that authority.",
      whenNotToUse:
        "Do not substitute disk encryption for revoking a stolen API key, or claim secret management replaces encryption of stored data.",
    },
  ],
  misconceptions: [
    {
      wrong: "An environment variable is a safe place by itself.",
      discriminant:
        "Identify who can observe the process and every export path, not just whether Git tracks a file.",
      counterexample:
        "A worker starts a diagnostic child process that inherits its environment; the child prints it into a support bundle. A crash report can do the same. On some Linux configurations /proc exposes process environments to permitted readers; access depends on OS policy, not on the variable being called secret.",
    },
    {
      wrong: "Rotate only after someone reports a leak.",
      discriminant:
        "Can an undetected copied value remain valid indefinitely, and has every consumer successfully refreshed before?",
      counterexample:
        "A copied month-old key keeps buying labels if never invalidated. Routine replacement with issuer-side revocation bounds that old value's lifetime even when no alert fires; a compromised workload able to fetch replacements still needs containment.",
    },
  ],
  practiceIds: ["t-67-find-flaw", "t-67-variant"],
  evidenceCriteria: [
    "Distinguish retained secret bytes from currently accepted authority and explain why Git deletion is insufficient.",
    "Trace generation, storage readers, runtime delivery, consumer refresh and issuer-side invalidation for both replicas.",
    "Explain an environment leak path and verify replacement success plus rejection of the old credential without printing either value.",
    "Adapt the lifecycle to unattended short-lived CI jobs, including issuer trust, expiry and limits of post-leak containment.",
  ],
  transfer: {
    domain: "Game telemetry publishing in CI",
    variant:
      "A CI job publishes game telemetry reports for at most eight minutes, with no human approval step. The report service accepts workload-identity exchange for a ten-minute, report-upload-only credential bound to the intended audience. Choose a per-job issuance and cleanup plan, explain why a shared static CI variable fails to provide job-bounded authority, and identify what expiry cannot undo if a token leaks in minute two.",
  },
  provenance: {
    reviewed: false,
    notes:
      "redigida nesta rodada, sem revisão independente efetiva. Contract and rubric self-checks are not independent technical review or learner validation; scenario capabilities are teaching assumptions, not a production-ready implementation.",
  },
},
{
  "id": 71,
  "rev": "1.0",
  "objective": "Given a shop login path with TLS termination at a gateway, locate the unprotected leg and choose a correction while distinguishing server identity from customer authorization.",
  "prereqIds": [],
  "mentalModel": {
    "definition": "TLS establishes a protected channel between its endpoints. With correct certificate and hostname validation, the full certificate-based TLS 1.3 handshake authenticates the server and derives symmetric keys; authenticated encryption provides confidentiality and integrity for application records in transit. Client certificates are optional, and application authorization is separate.",
    "analogy": "A courier checks the destination office identity, agrees on a private tamper-evident communication channel, and delivers a readable message inside that office.",
    "analogyLimits": "TLS is a cryptographic protocol, not a physical seal. Its endpoint can read and misuse plaintext. Protection ends where TLS terminates; a new delivery needs its own protected channel. It does not hide all traffic metadata.",
    "correspondence": [
      ["Certificate validation and CertificateVerify", "Checking the destination identity and proof it controls its credential"],
      ["Derived symmetric traffic keys", "The private communication channel"],
      ["TLS termination", "Opening the message inside the destination office"]
    ]
  },
  "scenario": {
    "system": "Academy shop: browser -> checkout gateway -> order API.",
    "data": "Fictional login password and customer order identifiers; no real credentials.",
    "symptom": "HTTPS succeeds in the browser, but a capture on the gateway-to-API network leg contains readable login fields.",
    "constraints": [
      "The gateway must terminate TLS to route requests.",
      "Both network legs cross networks where passive observation and active tampering are in scope.",
      "Clients must validate certificates and hostnames; ignoring errors is forbidden.",
      "Customer access checks remain required at the API."
    ],
    "baseline": "Hold the request and route constant: A uses browser-to-gateway TLS plus gateway-to-API HTTP; B uses independently validated TLS on both legs. The gateway can read plaintext in both cases."
  },
  "representation": {
    "kind": "table",
    "caption": "Follow the full TLS 1.3 handshake, then locate the boundary where protection ends.",
    "data": {
      "columns": [
        {"key": "phase", "label": "Phase"},
        {"key": "mechanism", "label": "Mechanism", "emphasis": true},
        {"key": "scope", "label": "Guarantee and limit"}
      ],
      "rows": [
        {
          "cells": {
            "phase": "1. Negotiate",
            "mechanism": "ClientHello and ServerHello exchange ephemeral key shares and select TLS 1.3 parameters.",
            "scope": "Both sides derive handshake secrets; the server is not authenticated by key exchange alone."
          }
        },
        {
          "cells": {
            "phase": "2. Authenticate server",
            "mechanism": "The client validates the certificate chain and requested hostname; CertificateVerify signs the handshake transcript.",
            "scope": "Trusted identity plus proof of private-key possession; a certificate alone does not authorize a customer."
          }
        },
        {
          "cells": {
            "phase": "3. Confirm handshake",
            "mechanism": "Finished authenticates the transcript using a derived secret; failures abort.",
            "scope": "Transcript tampering is detected. This is a full handshake without resumption, client certificates or 0-RTT."
          }
        },
        {
          "cells": {
            "phase": "4. Send records",
            "mechanism": "Derived symmetric traffic keys protect application records with authenticated encryption.",
            "scope": "Network observers cannot read or silently modify protected content; endpoints can read it. Addresses, sizes and timing remain observable."
          }
        },
        {
          "cells": {
            "phase": "5. Terminate at gateway",
            "mechanism": "The gateway decrypts the request and opens a separate HTTP connection to the origin.",
            "scope": "Browser-to-gateway TLS does not protect gateway-to-origin HTTP. A separate validated TLS connection is needed on that leg."
          }
        }
      ],
      "note": "Fixed editorial model, not a packet capture or lab. Steps summarize dependencies, not a complete wire-message ordering; in TLS 1.3 handshake messages after ServerHello are encrypted. No resumption or 0-RTT."
    },
    "textEquivalent": "1. Negotiate — ClientHello and ServerHello exchange ephemeral key shares and select TLS 1.3 parameters. — Both sides derive handshake secrets; the server is not authenticated by key exchange alone. 2. Authenticate server — The client validates the certificate chain and requested hostname; CertificateVerify signs the handshake transcript. — Trusted identity plus proof of private-key possession; a certificate alone does not authorize a customer. 3. Confirm handshake — Finished authenticates the transcript using a derived secret; failures abort. — Transcript tampering is detected. This is a full handshake without resumption, client certificates or 0-RTT. 4. Send records — Derived symmetric traffic keys protect application records with authenticated encryption. — Network observers cannot read or silently modify protected content; endpoints can read it. Addresses, sizes and timing remain observable. 5. Terminate at gateway — The gateway decrypts the request and opens a separate HTTP connection to the origin. — Browser-to-gateway TLS does not protect gateway-to-origin HTTP. A separate validated TLS connection is needed on that leg."
  },
  "worked": {
    "decision": "Keep validated browser-to-gateway TLS and replace gateway-to-API HTTP with a separate TLS connection that validates the API identity. Keep API authorization checks.",
    "reasoning": [
      "The capture is on the second leg. A browser HTTPS indicator describes the first connection, not the complete application path.",
      "Compare A and B with identical data: A exposes fields on the second network leg; B protects that leg against network reading and undetected alteration, assuming uncompromised endpoints and valid identity checks.",
      "The gateway is a TLS endpoint in both designs and still sees plaintext. Re-encryption is not browser-to-origin end-to-end secrecy against that gateway.",
      "Certificate validation and CertificateVerify authenticate the server; Finished checks the handshake transcript. Symmetric traffic keys protect records, rather than encrypting every request with the certificate public key.",
      "Verify the configured upstream scheme and identity checks; in a controlled test confirm plaintext fields are absent from that leg and an invalid upstream identity fails closed. This is a verification plan, not a claim that a capture was executed.",
      "Test customer A requesting customer B's order separately: encryption cannot decide who may access an order."
    ]
  },
  "contrast": [
    {
      "alternative": "TLS termination followed by HTTP on a deliberately trusted local leg",
      "tradeoff": "Can simplify a narrowly scoped local deployment, but explicitly leaves that leg outside TLS protection. It fails this scenario because the second network is in scope.",
      "whenNotToUse": "Do not accept this topology when confidentiality or integrity is required across the upstream network."
    },
    {
      "alternative": "TLS passthrough to the origin",
      "tradeoff": "Moves the TLS endpoint to the origin and keeps the gateway from reading TLS plaintext, but prevents this gateway from doing the required plaintext routing.",
      "whenNotToUse": "Do not choose passthrough when the gateway must inspect requests under the stated routing constraint."
    },
    {
      "alternative": "Encryption at rest or shorter-lived application tokens",
      "tradeoff": "Disk encryption addresses stored media; token lifetime limits a different exposure window. Neither protects an HTTP network leg.",
      "whenNotToUse": "Do not use TLS as the remedy for stolen backup media, missing order authorization, XSS or CSRF. Those mechanisms require separate controls; HTTPS remains appropriate for transport."
    }
  ],
  "misconceptions": [
    {
      "wrong": "HTTPS on the public hostname protects every internal hop.",
      "discriminant": "Identify the two endpoints of each TLS connection and the protocol on the next leg.",
      "counterexample": "The shop gateway terminates HTTPS and forwards plaintext HTTP to the API."
    },
    {
      "wrong": "A valid server certificate authenticates the customer and authorizes their orders.",
      "discriminant": "Ask whose identity was checked and which component evaluates order ownership.",
      "counterexample": "An unauthenticated caller can establish server-authenticated TLS and still receive an API 401 or 403."
    },
    {
      "wrong": "TLS prevents XSS and makes the server trustworthy with my data.",
      "discriminant": "Separate network alteration from code interpreted at an endpoint and endpoint behavior.",
      "counterexample": "A vulnerable server can deliver a stored script over valid HTTPS; the browser decrypts and executes it. A TLS endpoint can also log passwords."
    }
  ],
  "practiceIds": [
    "t-71-find-flaw",
    "t-71-variant"
  ],
  "evidenceCriteria": [
    "Locate the exposed network leg and name its TLS endpoints.",
    "Explain certificate identity checks, transcript verification and symmetric record protection without treating them as authorization.",
    "Choose upstream TLS under the routing constraint and explain why the gateway still sees plaintext.",
    "Transfer the channel boundary to a new domain and constraint, rejecting certificate bypass and unrelated storage fixes."
  ],
  "transfer": {
    "domain": "Remote environmental monitoring",
    "variant": "A field sensor sends readings directly to a research collector over intermittent satellite links, without an inspection gateway. Its clock has reset and the collector certificate is not yet valid according to that clock. Upload may wait, and approved authenticated time recovery is available. Choose safe clock recovery followed by validated TLS, rather than bypassing validation or encrypting only local storage; identify what remains visible to the satellite operator."
  },
  "provenance": {
    "reviewed": false,
    "notes": "Authored for package s42; self-checked against repository Lesson/Task contracts, instrument shape assertions, canonical concepts 71/72/73/69/70/79 and the complete lesson/task 78 exemplar. Consulted RFC 8446 via web search (https://www.rfc-editor.org/rfc/rfc8446.html), especially the full-handshake model and authentication/confidentiality/integrity scope. The table is an editorial simplification, not a trace; no TLS lab, packet capture, deployment test, learner study or independent technical review was performed."
  }
},
];
