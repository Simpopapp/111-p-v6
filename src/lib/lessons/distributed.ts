import type { Lesson } from "./types";

export const LESSONS_DISTRIBUTED: Lesson[] = [{
  id: 34,
  rev: "3.0",
  objective: "Choose which operations to serve or refuse during a partition, and explain the consistency or availability cost using a concrete read/write history.",
  prereqIds: [],
  mentalModel: {
    definition: "CAP says that when replicas cannot communicate, a read/write service cannot guarantee both linearizability and availability for every request to a non-failing node. Linearizability makes operations appear atomic in one order respecting real-time completion. Availability here requires every such request eventually to return a result allowed by the operation specification; an error or indefinite wait does not satisfy it. The conflict concerns operations and their contracts, not a permanent label for an entire product.",
    analogy: "Two library desks share the last reservable copy. When their phone link fails, a desk cannot both promise every visitor an immediate successful reservation and preserve a single authoritative reservation history.",
    analogyLimits: "People can agree to reconcile promises later, but that changes the reservation contract. CAP availability is eventual response, not an immediate-response SLA. Real services also have timeouts, partial failures, and operation-specific consistency requirements; a two-desk story is not a replication protocol.",
    correspondence: [
      ["Replicas", "Library reservation desks"],
      ["Partition", "No messages cross the phone link"],
      ["Refused operation", "Desk declines to confirm without authority"],
      ["Relaxed contract", "Desk records a tentative wish rather than a guaranteed reservation"],
    ],
  },
  scenario: {
    system: "A library app with North and South replicas: a reading-list endpoint and an authoritative reservation endpoint.",
    data: "Initially both replicas store remainingCopies=1 for book B. North completes a reservation and acknowledges remainingCopies=0. Only afterward a new South read begins. Messages between regions are lost; clients can still reach their local replica.",
    symptom: "South returns remainingCopies=1 as the current authoritative value even though North's decrement completed before the read began.",
    constraints: [
      "No cross-region messages arrive for the duration of the example; nodes themselves remain running.",
      "A confirmed reservation must not allocate the same copy twice; a tentative reading-list item carries no reservation promise.",
      "South cannot reach an authoritative quorum; North has the authority required by the illustrative reservation policy.",
      "The product permits stale reading lists but requires authoritative reservation decisions; no specific database protocol is assumed.",
    ],
    baseline: "With communication restored and coordination functioning, South can learn the completed decrement. The partition removes that evidence; a local health check does not restore it.",
  },
  representation: {
    kind: "table",
    caption: "After North's acknowledged decrement, inspect South's responses. Which operation contract is weakened or which request loses availability?",
    data: {
      columns: [
        { key: "operation", label: "Operation at South" },
        { key: "response", label: "Response under partition", emphasis: true },
        { key: "cost", label: "Guarantee or cost" },
      ],
      rows: [
        { cells: { operation: "Read current authoritative stock", response: "Return local value 1", cost: "Available response, but violates linearizability after completed decrement to 0" }, tone: "warn" },
        { cells: { operation: "Read current authoritative stock", response: "Withhold; return unavailable at product timeout", cost: "Does not assert stale stock; sacrifices availability for this request" }, tone: "down" },
        { cells: { operation: "Confirm last-copy reservation", response: "Refuse without authority", cost: "Avoids an unsupported confirmation; South cannot complete the operation" }, tone: "down" },
        { cells: { operation: "Add tentative reading-list item", response: "Accept locally; show pending synchronization", cost: "Local success permitted by this weaker contract; reconciliation still required" }, tone: "ok" },
      ],
      note: "Static worked example, not a running simulator. Rows are policy alternatives or distinct operations, not simultaneous guarantees for one authoritative read. Returning an error is not CAP availability. A local receipt does not guarantee later global acceptance.",
    },
    textEquivalent: "North completed stock 1→0 before South's read starts. South's local authoritative answer 1 breaks linearizability. Withholding that answer or returning unavailable loses availability for that request. South refuses reservation confirmation without authority but may accept a tentative reading-list item under a weaker contract. No row makes both guarantees hold for an isolated authoritative read.",
  },
  worked: {
    decision: "Refuse South's authoritative reservation/read when it cannot coordinate; keep tentative reading-list operations locally usable with an explicit pending state.",
    reasoning: [
      "Real-time order matters: North's decrement completed before South's read began. A linearizable authoritative read cannot return the earlier value 1.",
      "South cannot distinguish a delayed decrement from no decrement. Returning its local value preserves a response but not the required single-copy history.",
      "An unavailable error is an honest product response, not success for the requested stock read. Waiting may succeed after healing, but cannot guarantee completion if the partition persists.",
      "The invariant needs more than a label: an authority/quorum policy with fencing must prevent isolated writers from confirming the same copy. CAP itself implements none of this.",
      "A reading-list addition is a different promise. Accept it tentatively and define merge and durability behavior separately; eventual consistency describes convergence after communication resumes, not the partition-time choice itself.",
      "Without a partition CAP does not force this either/or decision; coordination latency and other failure modes still matter. Removing partitions from the model is an assumption, not a useful switch called CA.",
    ],
  },
  contrast: [
    { alternative: "Require authority for authoritative stock and reservations", tradeoff: "Preserves the chosen history/invariant only with a correct coordination protocol; isolated requests fail or wait.", whenNotToUse: "Do not impose this cost on tentative reading-list edits whose contract explicitly tolerates temporary divergence." },
    { alternative: "Serve local reads and tentative edits", tradeoff: "Keeps these operations responsive but may expose stale data and conflicting edits; specify reconciliation and user-visible status.", whenNotToUse: "Do not call a local stale stock answer authoritative or promise a confirmed last-copy allocation from both isolated regions." },
    { alternative: "Eventual consistency (concept 35)", tradeoff: "Defines convergence expectations after updates can propagate, with explicit conflict rules; it does not erase an earlier stale read or double confirmation.", whenNotToUse: "Do not use later convergence as proof that every earlier operation was linearizable or that a financial invariant held." },
  ],
  misconceptions: [
    { wrong: "CAP means pick any two corners, so choose CA and disable partitions.", discriminant: "Ask what the service does when communication actually fails; a topology preference cannot deliver missing messages.", counterexample: "Two healthy replicas become isolated. South still cannot both answer an authoritative read and know North's completed write, even if the design document says CA." },
    { wrong: "The system is AP once, so every endpoint should accept local writes.", discriminant: "Name each operation's promise: tentative list edit differs from confirmed reservation.", counterexample: "The same app accepts a reading-list edit at South while refusing last-copy confirmation there. A product-wide label conceals this necessary distinction." },
    { wrong: "HTTP 503 preserves CAP availability, and eventual synchronization repairs consistency retroactively.", discriminant: "Check whether the requested operation completed with a valid result and whether its history respected real-time order.", counterexample: "A 503 is no successful stock read. A later correct value 0 cannot make the earlier authoritative answer 1 linearizable." },
  ],
  practiceIds: ["t-34-predict", "t-34-variant"],
  evidenceCriteria: [
    "Identify the completed write and later read that rule out the stale authoritative result.",
    "Name the specific refused operation and its availability cost rather than assigning one CAP label to the product.",
    "Distinguish successful tentative acceptance, authoritative success, and an unavailable error.",
    "Transfer the reasoning to ledger withdrawals versus a social feed, and separate reconciliation from partition-time guarantees.",
  ],
  transfer: {
    domain: "Financial ledger and social activity feed",
    variant: "Two isolated ledger replicas each show $100. North has completed an $80 withdrawal before South receives a new $80 withdrawal. No spending rights were preallocated; overdraft is forbidden. Decide what South may confirm, then contrast a feed endpoint that explicitly permits stale posts. State the availability cost and why later reconciliation cannot undo a paid withdrawal.",
  },
  provenance: { reviewed: true, notes: "Revisão independente: revisão efetiva registrada. Conferidos integralmente definição, limites da analogia, história de leitura e escrita, tabela, contrastes, contraexemplos, transferência e duas tarefas com rubricas e pistas. Confirmados o escopo de partição, a ordem escrita concluída antes da leitura, a perda de disponibilidade na recusa e a impossibilidade de corrigir retroativamente uma leitura não linearizável por convergência posterior. Confirmados os oito critérios editoriais. Referências bibliográficas preservadas: Gilbert e Lynch, 2002, DOI 10.1145/564585.564601; Brewer, 2012, DOI 10.1109/MC.2012.37. A revisão não executou protocolo de replicação nem verificou integralmente esses artigos nesta rodada. O resumo canônico legado pick two requer atualização separada." },
},
{
    id: 35,
    rev: "3.0",
    objective:
      "Trace asynchronous replica updates, classify which product reads may be stale, and choose a read-your-writes policy without inventing a convergence deadline.",
    prereqIds: [34],
    mentalModel: {
      definition:
        "Eventual consistency allows replicas to expose different states while updates propagate asynchronously. If updates stop, communication and repair eventually deliver the required updates, and conflict resolution produces compatible results, replicas converge. This guarantee alone specifies neither a convergence deadline nor the order in which replicas catch up. Read-your-writes is a separate session guarantee: after a successful write, that client's subsequent reads must reflect that write or a later state that supersedes it.",
      analogy:
        "Three library desks keep copies of a member's profile card. One desk records a new photo and sends copies to the others later. A visitor at another desk can still see the old card before delivery.",
      analogyLimits:
        "Real replication needs version tracking, retries, durable storage and conflict resolution. Paper delivery does not model concurrent writes or prove convergence. Returning to the same desk helps only if that desk retains the acknowledged update and the session does not silently fail over to an older copy.",
      correspondence: [
        ["Replica state", "A desk's copy of the profile card"],
        ["Asynchronous propagation", "Sending revised cards after accepting an edit"],
        ["Stale read", "A visitor sees a desk's older card"],
        ["Session version requirement", "The editor asks to see at least the revision just accepted"],
      ],
    },
    scenario: {
      system:
        "The library app from the CAP lesson now stores member avatars in North, South and West replicas. The profile editor and reading-list feed use separate read policies.",
      data:
        "All replicas begin with avatar=blue, revision=7. At event e1, North durably accepts avatar=green, revision=8 and acknowledges it to the member. South and West apply revision 8 later. There are no concurrent edits or additional avatar caches in this teaching trace.",
      symptom:
        "The member refreshes the profile editor through South after the acknowledgement and sees the old blue avatar, although the save succeeded at North.",
      constraints: [
        "The reading-list feed may display an older avatar during propagation; this is not a promise of bounded staleness.",
        "After save acknowledgement, the profile editor must not label revision 7 as the member's confirmed current edit.",
        "North retains revision 8 in this trace. Production durability and failover behavior require an explicit storage contract.",
        "During a partition, a region unable to establish the required revision may return a pending or unavailable response rather than a stale confirmed edit.",
        "Event labels describe one observed execution, not elapsed-time guarantees. Event e4 occurs only after delivery and repair succeed.",
      ],
      baseline:
        "Routing every read to any locally reachable replica keeps reads easy to serve but supplies no read-your-writes guarantee. A successful write acknowledgement at North does not establish application at South or West.",
    },
    representation: {
      kind: "table",
      caption:
        "Follow the acknowledged revision, then check which replica each member read actually reaches.",
      data: {
        columns: [
          { key: "event", label: "Observed event" },
          { key: "north", label: "North" },
          { key: "south", label: "South" },
          { key: "west", label: "West" },
          { key: "read", label: "Member read", emphasis: true },
        ],
        rows: [
          {
            cells: {
              event: "e0: before edit",
              north: "blue / r7",
              south: "blue / r7",
              west: "blue / r7",
              read: "South returns blue / r7",
            },
            tone: "ok",
          },
          {
            cells: {
              event: "e1: North acknowledges r8",
              north: "green / r8",
              south: "blue / r7",
              west: "blue / r7",
              read: "North returns green / r8 after acknowledgement",
            },
            tone: "warn",
          },
          {
            cells: {
              event: "e2: refresh before propagation",
              north: "green / r8",
              south: "blue / r7",
              west: "blue / r7",
              read: "South returns blue / r7: own edit disappears",
            },
            tone: "warn",
          },
          {
            cells: {
              event: "e3: West applies r8; South remains isolated",
              north: "green / r8",
              south: "blue / r7",
              west: "green / r8",
              read: "West returns green / r8; South could still return r7",
            },
            tone: "warn",
          },
          {
            cells: {
              event: "e4: communication and repair succeed",
              north: "green / r8",
              south: "green / r8",
              west: "green / r8",
              read: "South now returns green / r8",
            },
            tone: "ok",
          },
        ],
        note:
          "One finite teaching trace, not a latency SLA. West catches up before South here; eventual consistency does not require that order. If South stays partitioned, e4 can be delayed indefinitely.",
      },
      textEquivalent:
        "Initially North, South and West all hold blue r7. North acknowledges green r8 at e1 and can return it. A South refresh at e2 returns blue r7. West applies r8 at e3 while South still holds r7. Only after communication and repair succeed at e4 do all three hold green r8. The trace provides no convergence deadline.",
    },
    worked: {
      decision:
        "Keep local eventual reads for feed avatars. For the editor, carry the acknowledged revision and serve a confirmed result only from a path known to have applied at least that revision; otherwise show an explicit pending state.",
      reasoning: [
        "At e2, North's acknowledgement proves acceptance under North's stated write contract, not propagation to South. South can legally return r7 under the eventual-read contract.",
        "The same r7 response is acceptable in the feed but violates the editor's stated post-save experience. Classify the read, not the whole application.",
        "In this single-writer trace, the save response carries r8. An editor read can require revision >= 8. In a multi-writer system, the token must express causal progress under the actual protocol rather than assuming one integer orders every write.",
        "Route the editor to North while it remains eligible and retains the update, or use a replica that proves it has applied the required revision. A sticky session without safe failover rules is insufficient.",
        "If the required state cannot be established during a partition, display pending or unavailable. Do not relabel an old response as confirmed, and do not claim a fixed sleep makes it fresh.",
        "Returning the accepted avatar in the save response supports immediate UI feedback, but does not by itself guarantee the next server read. Reconciliation must preserve the revision requirement.",
        "Test by delaying South's replication after an acknowledged save. Feed reads may show r7; editor reads must show at least r8 or an explicit non-confirmed state. Measure propagation delay separately from this correctness assertion.",
      ],
    },
    contrast: [
      {
        alternative: "Use local eventual reads for every endpoint",
        tradeoff:
          "Avoids waiting for remote replication, but permits the editor to show an older revision after a successful save.",
        whenNotToUse:
          "Do not use this contract for reads that must confirm the user's own acknowledged edit or enforce an authoritative business decision.",
      },
      {
        alternative: "Pin editor reads to the accepting replica",
        tradeoff:
          "Can provide read-your-writes if that replica retains the update and routing preserves the session requirement. Distance, outages and failover complicate the policy.",
        whenNotToUse:
          "Do not treat affinity alone as a guarantee when failover can select a replica that has not applied the acknowledged write.",
      },
      {
        alternative: "Use a quorum-based read/write protocol",
        tradeoff:
          "For a fixed replica set, R + W > N gives read/write set intersection. Returning the required version also depends on successful writes, version selection, reconciliation and the actual protocol; overlap alone is not a proof of linearizability.",
        whenNotToUse:
          "Do not assume arbitrary quorum settings or sloppy quorums provide the same guarantees. A required quorum may be unreachable during a partition.",
      },
      {
        alternative: "Wait for explicit revision confirmation",
        tradeoff:
          "A version-aware path can wait, route elsewhere or report pending until the required revision is observable. It adds coordination and may sacrifice a successful response during isolation.",
        whenNotToUse:
          "Do not substitute a fixed delay for evidence, or impose this cost on feed reads whose contract already permits staleness.",
      },
    ],
    misconceptions: [
      {
        wrong: "Eventual means every replica becomes equal quickly.",
        discriminant:
          "Ask which assumption ensures delivery and which contract, if any, sets a maximum delay.",
        counterexample:
          "The member saves a green avatar at North, refreshes through South and sees blue. If South is partitioned, convergence waits for communication and repair; the word eventual sets no timer.",
      },
      {
        wrong: "A successful save makes every later read show my edit.",
        discriminant:
          "Separate write acknowledgement from the version applied at the replica serving the next read.",
        counterexample:
          "North acknowledges r8 at e1, but South still returns r7 at e2. The save succeeded while the read-your-writes policy was absent.",
      },
      {
        wrong: "Asynchronous replication automatically resolves conflicting writes.",
        discriminant:
          "Identify both the delivery mechanism and the conflict-resolution rule.",
        counterexample:
          "Two isolated replicas accept different avatars. Delivering both updates does not select a shared result if each replica simply keeps whichever update arrived last locally.",
      },
    ],
    practiceIds: ["t-35-predict", "t-35-variant"],
    evidenceCriteria: [
      "Predict the e2 South response as blue r7 and identify the editor contract it violates.",
      "Explain why an indefinitely isolated South has no promised catch-up deadline.",
      "Separate feed staleness tolerance from an editor revision requirement.",
      "Specify what happens when the required revision is unavailable instead of silently returning an older confirmed state.",
      "Transfer the distinction to public rankings, personal score confirmation and authoritative prize settlement.",
    ],
    transfer: {
      domain: "Competitive multiplayer game leaderboards",
      variant:
        "A regional score service acknowledges score revision 42. Public rankings may lag without a fixed freshness bound, but the player's confirmation screen must reflect revision 42 or a later state. Regional partitions can outlast the five-minute tournament close, and prizes require a final authoritative result. Choose separate policies for public display, personal confirmation and settlement; explain why eventual public rankings cannot establish the prize winner at the deadline.",
    },
    provenance: {
      reviewed: true,
      notes:
        "Revalidação independente s40: revisão efetiva registrada. Confirmada a correção de settlement_contract em t-35-variant: a rubrica rejeita final-result, alternativa real que premia a partir de rankings regionais provisórios. A única combinação aceita é display, receipt e settle. Revisados convergência condicional, ausência de prazo implícito, requisito de revisão da sessão, contraexemplos, pistas e transferência para premiação autoritativa. Fonte: Werner Vogels, Eventually Consistent. O traço permanece sintético, com um escritor, aceitação durável explicitada e sem promessa de comportamento de produção.",
    },
  }
,
{
  id: 39,
  rev: "3.0",
  objective: "Trace two concurrent checkout handlers, locate the check-then-act window, and choose a database operation that prevents both from selling the last item without claiming wider guarantees.",
  prereqIds: [],
  mentalModel: {
    definition: "A race condition occurs when correctness depends on how concurrent operations interleave. In a non-atomic read-modify-write, each handler can make a locally valid decision from the same old value, then overwrite the other's result. Concurrency does not require multiple servers: handlers on one server can interleave while awaiting database I/O, even with a single-threaded event loop.",
    analogy: "Two clerks read 'one ticket left' on a board. Each promises a ticket before either updates the board. Both erase 1 and write 0; a tidy board now hides two promises.",
    analogyLimits: "The board does not model database isolation, transactions, or crash recovery. A database can enforce a conditional mutation atomically; asking clerks to work faster or look again is not equivalent. Preventing a lost stock update does not itself coordinate payment or message delivery.",
    correspondence: [
      ["Concurrent handlers R and S", "Two clerks"],
      ["Shared stock row", "Ticket board"],
      ["Read-to-write window", "Gap between seeing availability and changing the board"],
      ["Two confirmations against one unit", "Two promises for one ticket"],
    ],
  },
  scenario: {
    system: "The recurring shop checkout service runs one application server with concurrent HTTP handlers and one authoritative PostgreSQL inventory table.",
    data: "SKU MUG has stock=1. R and S are different legitimate purchases. Each handler reads stock, checks stock>0, computes newStock=stock-1 in application memory, then executes an unconditional UPDATE setting stock to newStock and confirms its purchase. No retries or replica reads occur in this example.",
    symptom: "Both buyers receive confirmation while the row ends at stock=0. Two units were promised although only one existed; a nonnegative final counter did not prove correct allocation.",
    constraints: [
      "At most one purchase may allocate the remaining unit; an out-of-stock response is permitted.",
      "Both handlers may await I/O between their read and write on the same server.",
      "The decisive inventory condition is local to one row in one authoritative database; no cross-row eligibility rule is included.",
      "Payment and durable order creation are outside this stock-only model and need separate transactional or workflow design.",
    ],
    baseline: "Sequential execution reads 1, writes 0, confirms R; S then reads 0 and declines. The same per-handler code fails only when both reads precede either write.",
  },
  representation: {
    kind: "timeline",
    caption: "Read the shared-row history: R read 1, S read 1, R wrote 0, S wrote 0. Point to each read-to-write window: where does the second decision reuse stale evidence?",
    data: {
      unit: "logical steps (not milliseconds)",
      events: [
        { label: "R reads MUG.stock=1 and decides to sell", start: 0, end: 1 },
        { label: "S reads MUG.stock=1 and decides to sell", start: 1, end: 2 },
        { label: "R writes its computed 0; confirms purchase R", start: 2, end: 3 },
        { label: "S writes its computed 0; confirms purchase S", start: 3, end: 4 },
        { label: "R check-then-act window: read at 0 to write at 2; S reads inside it", start: 0, end: 2 },
        { label: "S check-then-act window: read at 1 to write at 3; R writes inside it", start: 1, end: 3 },
      ],
      note: "Static illustrative schedule, not measured execution. The first four intervals locate ordered operations; the final two expose overlapping windows, not additional operations. Labels identify handlers because this timeline has no actor-lane field. Confirmation is simplified; crashes and payment are not modeled.",
    },
    textEquivalent: "At step 0 R reads 1; at step 1 S also reads 1. R's read-to-write window spans 0–2 and contains S's read. At step 2 R writes 0 and confirms R. At step 3 S writes its previously computed 0 and confirms S; S's window 1–3 contains R's write. Final stock is 0 with two confirmations. Sequential execution instead makes S read 0 and decline.",
  },
  worked: {
    decision: "Move the stock condition and decrement into one conditional UPDATE, and confirm allocation only when that operation returns a row successfully committed.",
    reasoning: [
      "Name the invariant first: successful allocations must not exceed initial stock. A final value of 0 can hide two successful allocations; looking only for negative stock misses this schedule.",
      "Both handlers read 1 before either writes. Each computes 0 correctly in isolation. The second unconditional write loses the first decrement's meaning because no indivisible operation connects the old read to allocation.",
      "Illustrative PostgreSQL statement, not production-ready checkout code: UPDATE inventory SET stock = stock - 1 WHERE sku = 'MUG' AND stock > 0 RETURNING stock; input is the SKU, output is one updated row or none. Real code must parameterize inputs and handle transaction completion and database errors.",
      "With the row initially at 1, under PostgreSQL READ COMMITTED the first updater can decrement to 0; a competing updater waits for that row and rechecks the condition against its committed value. It then updates zero rows. Higher isolation may instead report a serialization failure, which is not a successful allocation.",
      "A returned row inside an uncommitted transaction is not a completed promise. On zero rows, report out of stock; on abort or error, do not confirm allocation. For this stock-only model, successful commit plus a returned row is the success condition.",
      "A preliminary read may remain for display, but it must not authorize confirmation. The UPDATE protects only the condition it evaluates: customer eligibility checked earlier outside the database can still race. Transactions alone do not make arbitrary application read-then-write logic safe at every isolation level.",
      "Test the given overlap deliberately and assert one committed allocation and one rejection, not just stock>=0. Payment/order atomicity, duplicate retries, and multi-row rules require additional design. Faster handlers merely reduce some opportunities; they do not remove the permitted schedule.",
    ],
  },
  contrast: [
    { alternative: "Single conditional UPDATE for a row-local invariant", tradeoff: "Keeps condition and mutation together with one database round trip. A hot row still serializes competing writes and can add waiting latency; it is not lock-free.", whenNotToUse: "Do not present it as protection for rules read elsewhere, multiple unrelated rows, payments, or global inventory across independent authorities." },
    { alternative: "Optimistic locking: conditional write on a version, then bounded retry on conflict", tradeoff: "Allows computation outside a long-held lock. A zero-row version match means conflict: reload, recompute and retry within a budget, or return a conflict. Under heavy contention repeated conflicts waste work and increase tail latency.", whenNotToUse: "Avoid blind unlimited retries on a hot SKU, or replaying external side effects before a conditional write succeeds. Prefer the simpler conditional decrement when it expresses the entire rule." },
    { alternative: "Pessimistic locking: SELECT FOR UPDATE, recheck and mutate within one transaction", tradeoff: "Serializes access before the decision. Contenders wait; longer transactions raise latency and multi-row lock ordering can cause deadlocks. All relevant writers must honor the protocol.", whenNotToUse: "Do not hold database locks while waiting for a buyer or remote payment provider. Do not add a long locking workflow when a single row-local statement suffices." },
  ],
  misconceptions: [
    { wrong: "The code runs too quickly for a race to happen.", discriminant: "Can another handler read the same row after this read but before this write? Check scheduling and await boundaries, not perceived speed.", counterexample: "A sale brings two buyers to the last mug together. R awaits database I/O; S reads 1 before R's write. Even microsecond operations can follow R-read, S-read, R-write, S-write under load." },
    { wrong: "Frontend validation prevents two buyers from buying the last item.", discriminant: "Does disabling a button coordinate independent clients at the authoritative mutation?", counterexample: "Two legitimate clients each load stock=1 and each click once. Both validations pass. Their server handlers still interleave on the same row; neither client did anything invalid." },
    { wrong: "Wrapping the existing read and unconditional write in a transaction guarantees safety.", discriminant: "Which isolation level or locking/conditional-write rule prevents both decisions from using the old value?", counterexample: "At READ COMMITTED, two transactions can both SELECT 1 and later each SET stock=0 from an application constant. The write lock serializes writes but does not recompute that constant or revoke both earlier decisions." },
  ],
  practiceIds: ["t-39-predict", "t-39-variant"],
  evidenceCriteria: [
    "Trace the four interleaved operations and explain why stock=0 can coexist with two confirmations.",
    "Locate the read-to-write window and distinguish concurrency on one server from replication lag or duplicate retries.",
    "Make confirmation depend on a committed conditional update result; name the row-local scope of that protection.",
    "Compare contention retries with lock waiting and reject unnecessary remote calls while holding locks.",
    "Transfer the invariant to a burst of coupon claims without relying on client validation or adding a forbidden queue.",
  ],
  transfer: {
    domain: "Loyalty marketing campaign coupon issuance",
    variant: "A mass-mail event triggers thousands of legitimate coupon claims at once. A campaign row has remaining=1; each claim may issue one coupon. There is no queue, no duplicate delivery in this exercise, and the synchronous endpoint may reject exhausted claims. Choose a bounded decision for the last slot, state what result authorizes issuance, and explain why atomic capacity allocation alone does not make email delivery or a separate coupon record atomic. Contrast optimistic retries under this burst with database lock waiting.",
  },
  provenance: {
    reviewed: false,
    notes: "Drafted in this round; no effective independent review (redigida nesta rodada, sem revisão independente efetiva). Mechanism references: PostgreSQL 17 documentation, Transaction Isolation, section 13.2.1 (https://www.postgresql.org/docs/17/transaction-iso.html); Explicit Locking, section 13.3 (https://www.postgresql.org/docs/17/explicit-locking.html); UPDATE command (https://www.postgresql.org/docs/17/sql-update.html). References identify intended semantics; no live database experiment or independent source review was performed for this draft. The SQL is illustrative, not a complete checkout implementation.",
  },
},
{
  "id": 38,
  "rev": "1.0",
  "objective": "Trace an expired lease and a resumed worker, predict which writes a fencing-aware store accepts, and choose a coordination boundary when an external API cannot enforce fencing.",
  "prereqIds": [39],
  "mentalModel": {
    "definition": "A distributed lock coordinates contenders on different processes through a shared authority. A lease grants ownership for a limited duration so another contender can progress after failure. Expiration does not stop the old process or cancel its delayed requests. Lease safety depends on the service's timing assumptions, including clock rate/drift and elapsed-time handling; synchronized wall clocks alone are insufficient. For correctness-sensitive writes, a trustworthy authority can issue strictly increasing fencing tokens per resource. The protected store must atomically compare the token with its durable high-water mark and apply the write, rejecting older tokens. This fences stale writes after a newer token is recorded; it does not guarantee that only one process is executing. Token generation and resource-side enforcement require appropriate consistency guarantees, not just a TTL or a majority of lock replies.",
    "analogy": "A booking desk gives each temporary room supervisor a numbered badge. After a badge expires, the desk can issue a higher number. The room's gatekeeper remembers the highest number it has admitted and refuses lower numbers.",
    "analogyLimits": "A badge cannot stop someone already walking toward the room. A gatekeeper must actually inspect every entry and update its record atomically. The metaphor does not supply reliable token issuance, durable storage, clock assumptions, or protection for a different room or an outside service.",
    "correspondence": [
      ["Lease authority", "Booking desk"],
      ["Worker", "Temporary supervisor"],
      ["Fencing token", "Increasing badge number"],
      ["Atomic resource-side validation", "Gatekeeper checking and recording the highest badge"]
    ]
  },
  "scenario": {
    "system": "The recurring Academy shop runs two workers that publish a generated catalog snapshot to one authoritative snapshot store.",
    "data": "Resource catalog:summer starts with high-water token 40. Worker A acquires token 41 with a 5-second lease, computes snapshot v1, then pauses. B first contends, later acquires token 42 after expiry, and publishes v2. A resumes with its old v1 request. Versions v1/v2 label payloads, not fencing tokens.",
    "symptom": "Without resource-side validation, A can overwrite v2 with v1 even though the lease authority granted only one unexpired lease at a time.",
    "constraints": [
      "Snapshot regression is unacceptable; duplicated computation is acceptable.",
      "Assume a consistent authority issues strictly increasing, never-reused tokens for this resource, including after failover.",
      "The store durably records the highest accepted token and atomically rejects smaller tokens with each snapshot write; all writers use that path.",
      "Equal tokens may write within one lease in this model; ordering or deduplication of requests within that lease needs a separate rule.",
      "Pauses and message delays can exceed the lease duration; client wall clocks need not agree. The diagram uses an illustrative observer axis, not a deployable global clock.",
      "When ownership is uncertain, workers stop starting new protected work; safe progress can wait for authority recovery. There is no distributed-lock laboratory in this lesson."
    ],
    "baseline": "With cooperative sequential workers and no pause, A publishes v1 before its lease expires and B later publishes v2. That happy path does not exercise stale requests."
  },
  "representation": {
    "kind": "event-track",
    "caption": "Follow acquisition, contention, expiry, retry and resumed writes. Does lease expiry stop A, or does store validation stop A's stale effect?",
    "data": {
      "unit": "illustrative observer seconds",
      "note": "Static example, not measured execution. Expiry is evaluated by the lease authority; timestamps do not assume synchronized client clocks. Store rejection requires the stated atomic durable token check.",
      "lanes": [
        {"id": "a", "label": "Worker A", "kind": "actor"},
        {"id": "b", "label": "Worker B", "kind": "actor"},
        {"id": "guard", "label": "Authority / protected store signals", "kind": "signal"}
      ],
      "events": [
        {"ts": 0, "lane": "a", "label": "Acquire catalog:summer lease; token 41, expires at authority t=5", "kind": "success"},
        {"ts": 1, "lane": "a", "label": "Compute v1, then pause before sending write", "kind": "warn"},
        {"ts": 2, "lane": "b", "label": "Acquire denied; schedule bounded retry with backoff/jitter", "kind": "warn"},
        {"ts": 5, "lane": "guard", "label": "Authority expires A's lease; A is not terminated", "kind": "info"},
        {"ts": 6, "lane": "b", "label": "Retry acquisition succeeds with token 42", "kind": "success"},
        {"ts": 7, "lane": "b", "label": "Publish v2 with 42; store atomically advances high-water 40 to 42", "kind": "success"},
        {"ts": 8, "lane": "a", "label": "Resume and submit v1 with stale token 41", "kind": "warn"},
        {"ts": 9, "lane": "guard", "label": "Reject 41 < 42; keep v2 and high-water 42", "kind": "fail"}
      ],
      "window": {"from": 0, "to": 9}
    },
    "textEquivalent": "At observer second 0, A acquires token 41 with authority expiry at 5. At 1 A computes v1 and pauses before its write. At 2 B is denied acquisition and schedules a bounded backoff/jitter retry. At 5 the authority expires A's lease; A has not been terminated. At 6 B retries and acquires token 42. At 7 B's v2 write and durable high-water advance from 40 to 42 commit atomically. At 8 A resumes and submits v1 with 41. At 9 the store rejects 41 because it is below 42, leaving v2 and high-water 42. Without that store check, the same schedule could end at v1. These seconds describe an illustrative observer order, not synchronized client clocks."
  },
  "worked": {
    "decision": "Use the lease to coordinate work and require the snapshot store to fence every write; do not treat lease possession as permanent write authority.",
    "reasoning": [
      "State the invariant: once the store accepts a newer ownership epoch, an older epoch must not overwrite it. This is narrower than exactly-once publishing or only one running worker.",
      "B's denial at 2 shows contention. Bounded retry with backoff and jitter avoids a tight retry loop but is a liveness/load policy, not the safety proof.",
      "At authority expiry 5, A may still exist. A pause, a partition, or an already-sent delayed request can outlast a lease. Renewing or checking ownership immediately before sending still leaves a gap before the store applies the write.",
      "At 7 the store atomically commits v2 and high-water 42. At 9 it compares 41 with 42 and refuses v1. A separate read of the high-water mark followed by an unchecked write would introduce another race.",
      "Counterfactual: remove only the store check. B still acquires after A expires, but A's late write can succeed and regress the catalog. More acquisition replies or a longer TTL do not revoke that request.",
      "A token is an ordered epoch, not merely a random owner ID. The authority must preserve its ordering across failure; a consensus-backed service can supply suitable ordering under its documented guarantees, but consensus at acquisition alone does not fence an unguarded external store.",
      "Fencing only rejects an old epoch once the store has recorded a higher one. It does not make the store know lease expiry, order two writes carrying the same token, or make external effects transactional. Release and renewal must compare ownership identity atomically so an old worker cannot delete or extend B's lease.",
      "Use documented lease timing assumptions and stop new work on uncertain ownership. Longer leases delay recovery; shorter leases increase renewals and expiry risk. Test the pause schedule and assert both the rejected stale write and the final v2, not merely a successful lock acquisition."
    ]
  },
  "contrast": [
    {
      "alternative": "Atomic conditional update or transaction in the authoritative database",
      "tradeoff": "Keeps a row-local condition and mutation at the resource without a separate lease protocol. Contenders may wait or retry under the database's isolation rules.",
      "whenNotToUse": "Do not claim it atomically controls an unrelated external API; use it instead of a distributed lock when the entire invariant already fits in that database."
    },
    {
      "alternative": "Lease used only to reduce duplicate computation",
      "tradeoff": "May be sufficient when occasional duplicate refresh work and last-writer outcomes are acceptable. Expiry improves recovery but permits overlap of running workers.",
      "whenNotToUse": "Do not use a TTL-only lease as the sole correctness boundary for irreversible effects or forbidden snapshot regression."
    },
    {
      "alternative": "Lease plus ordered fencing at the protected store",
      "tradeoff": "Rejects older epochs after a higher epoch is durably recorded, but needs a consistent token authority, atomic store enforcement and coverage of every writer; authority failures may reduce availability.",
      "whenNotToUse": "Do not claim protection for an API that ignores tokens or allows unchecked write paths. A random lease-owner value is not an ordered fencing token."
    }
  ],
  "misconceptions": [
    {
      "wrong": "An expired lease means its worker cannot write anymore.",
      "discriminant": "Which component rejects the resumed worker's request at the instant the effect is applied?",
      "counterexample": "A pauses before expiry and resumes after B publishes v2. Without the store check, A can still overwrite it with v1."
    },
    {
      "wrong": "Synchronizing wall clocks or choosing a sufficiently long TTL proves exclusion.",
      "discriminant": "Are pause and network-delay bounds guaranteed, and what happens if a request arrives after the ownership check?",
      "counterexample": "Even with equal wall clocks, A can pause longer than the TTL or its request can be delayed until after B's write. NTP does not cancel that request."
    },
    {
      "wrong": "Adding a fencing token field automatically protects every effect.",
      "discriminant": "Does the receiver durably and atomically reject older tokens on every write?",
      "counterexample": "An email provider ignores token 41 and sends the request after token 42 was used elsewhere; the snapshot store's fencing cannot unsend that email."
    }
  ],
  "practiceIds": [
    "t-38-predict",
    "t-38-variant"
  ],
  "evidenceCriteria": [
    "Locate the acquisition denial, expiry, retry and resumed stale write in the two-worker history.",
    "Predict acceptance of 42 and rejection of 41 using the store's atomic durable high-water mark; explain the unchecked counterfactual.",
    "Distinguish lease validity, worker execution, ordered fencing and random ownership identity.",
    "Name timing assumptions, resource enforcement and availability costs without promising exactly-once external effects.",
    "Reject a lease-only correctness claim when transferring to an API without token enforcement and identify the missing receiver guarantee."
  ],
  "transfer": {
    "domain": "Clinical appointment reminder delivery",
    "variant": "Two reminder workers call an external email API. Duplicate sends are forbidden, but this provider accepts neither fencing tokens nor idempotency keys and offers no authoritative send-status query. After a timeout the send outcome is unknown; unlike snapshot publishing, the effect cannot be overwritten or rolled back. Decide whether lease expiry permits a safe retry and identify the receiver capability or product constraint that must change."
  },
  "provenance": {
    "reviewed": false,
    "notes": "Original editorial draft for concept 38 (package s43); no independent technical or learner review. Mechanism reference: Martin Kleppmann, How to do distributed locking (2016-02-08), https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html, located through web search for the paused-holder and resource-side fencing arguments. This is not an endorsement of a universal Redlock guarantee. The observer trace and store protocol are illustrative assumptions, not a live infrastructure experiment or production implementation. Canonical concept text was not modified."
  }
},
];