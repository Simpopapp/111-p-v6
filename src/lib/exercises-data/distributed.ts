import type { Task } from "@/lib/exercises";
const exact = (picked: string[] | undefined, key: string) => picked?.length === 1 && picked[0] === key;

export const TASKS_DISTRIBUTED: Task[] = [
  {
    id: "t-34-predict",
    conceptId: 34,
    type: "predict",
    prompt: "Select exactly one prediction for a South read that promises current authoritative stock.",
    context: "Both replicas started at 1. During a partition North completes and acknowledges stock=0. Only then South receives a read; it still stores 1 and cannot reach authority. Both nodes run normally. The partition may last indefinitely.",
    options: [
      { key: "a", label: "Answer 1 locally; a later synchronization makes this earlier read linearizable." },
      { key: "b", label: "Withhold the authoritative result or return unavailable; this request loses availability rather than asserting the stale value." },
      { key: "c", label: "Return unavailable and count it as satisfying both consistency and CAP availability." },
      { key: "d", label: "Return 0 because a healthy local process can infer every completed remote update." },
    ],
    rubric: {
      criteria: [
        { key: "history", label: "Respects the completed-write/later-read order", cause: "May be ignoring real-time order or assuming that local health provides knowledge of remote writes.", check: a => a.picked?.length === 1 && a.picked[0] === "b" },
        { key: "response_contract", label: "Counts refusal as an availability loss", cause: "May be counting an error or indefinite wait as successful completion of the requested read.", check: a => a.picked?.length === 1 && a.picked[0] === "b" },
      ],
      expected: "B: the completed write precedes this read, so returning 1 cannot be linearizable. South cannot safely infer 0 from its local state. Refusal avoids asserting stale authority but loses availability for the read; later synchronization cannot repair its historical ordering. This does not specify a complete replication protocol.",
      nextStep: "Change only the read contract to an explicitly stale display. Explain why returning 1 becomes acceptable under that weaker contract, not linearizable under the original one.",
    },
    helpLevels: [
      "Mark which operation completed before the other began; then ask what evidence South actually has.",
      "Separate a successful stock result from an error, and distinguish eventual convergence from the earlier operation history.",
      "Choose B. Returning 1 contradicts the earlier completed write; refusing avoids that assertion but sacrifices availability for this authoritative read.",
    ],
  },
  {
    id: "t-34-variant",
    conceptId: 34,
    type: "variant",
    prompt: "Select exactly two decisions supported by these contracts: one for the withdrawal and one for the feed.",
    context: "North and South each initially show a $100 balance. North completes an $80 withdrawal before South receives another $80 withdrawal. They cannot communicate. No spending rights were preallocated, South has no authority to approve, and overdraft is forbidden. A separate social-feed read explicitly permits stale posts and the local feed data is accessible.",
    options: [
      { key: "a", label: "Refuse or defer South's withdrawal confirmation while authority is unreachable; the withdrawal loses availability." },
      { key: "b", label: "Confirm South's withdrawal using its local $100; reconcile after both payments have been made." },
      { key: "c", label: "Serve South's local feed under its stale-read contract; do not claim a linearizable view." },
      { key: "d", label: "Reject the feed read because every operation in the same product must share the ledger's partition policy." },
    ],
    rubric: {
      criteria: [
        { key: "spend_authority", label: "Preserves the withdrawal constraint and names refusal cost", cause: "May be treating a local balance or later reconciliation as authority to spend money already withdrawn elsewhere.", check: a => (a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("a") && !a.picked.includes("b")) ?? false },
        { key: "operation_scope", label: "Uses the weaker feed contract without a product-wide label", cause: "May be applying one consistency policy to unrelated operations rather than checking their explicit contracts.", check: a => (a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("c") && !a.picked.includes("d")) ?? false },
      ],
      expected: "A and C. The completed withdrawal leaves $20; South cannot justify paying another $80 from its stale $100 without violating the given constraint. Refusing/defering confirmation loses availability for that withdrawal. Serving a stale feed is allowed by its different contract. Reconciliation cannot undo money already paid. Preallocated spending rights would change this case, but are explicitly absent; CAP alone is not a proof of financial safety.",
      nextStep: "Suppose South had $20 of independently spendable preallocated rights. Reconsider a $10 withdrawal versus an $80 withdrawal; identify the changed assumption instead of claiming CAP was bypassed.",
    },
    helpLevels: [
      "Write down what each endpoint promises and which action has an irreversible external effect.",
      "A local balance is not proof that remote spending did not occur. The feed permits stale data; the withdrawal contract does not permit overdraft.",
      "Select A and C: withhold unauthorized withdrawal confirmation at an availability cost, but serve the explicitly stale feed. Later merging does not undo a paid withdrawal.",
    ],
  },
{
    id: "t-35-predict",
    conceptId: 35,
    type: "predict",
    prompt:
      "At e2, select exactly two statements: the observed South response and the consequence of keeping South isolated. Assume no further writes.",
    context:
      "Initially all replicas hold blue r7. North durably accepts green r8 and acknowledges the save. No r8 update has reached South when the member refreshes through South. The profile editor requires read-your-writes; feed avatars may be stale.",
    options: [
      {
        key: "old",
        label:
          "South returns blue r7; this is allowed for the feed but not as the editor's confirmed post-save state.",
      },
      {
        key: "new",
        label:
          "South returns green r8 because North has acknowledged the save.",
      },
      {
        key: "open",
        label:
          "While South remains isolated, eventual consistency supplies no deadline for South to show r8.",
      },
      {
        key: "timer",
        label:
          "A short fixed wait establishes that South will return r8 even if replication messages still cannot arrive.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "observed_state",
          label: "Trace the serving replica's applied revision",
          cause:
            "You transferred North's acknowledgement to South without an update delivery. Re-read which replica holds r8 at e2.",
          check: (a) =>
            (a.picked ?? []).includes("old") &&
            !(a.picked ?? []).includes("new"),
        },
        {
          key: "delivery_condition",
          label: "Separate eventual convergence from a deadline",
          cause:
            "You treated elapsed time as evidence of propagation. An isolated replica cannot apply a message it has not received.",
          check: (a) =>
            (a.picked ?? []).includes("open") &&
            !(a.picked ?? []).includes("timer"),
        },
        {
          key: "selection_scope",
          label: "Make only the two requested claims",
          cause:
            "Extra, unknown or repeated selections do not describe one coherent prediction. Select one response and one convergence consequence.",
          check: (a) =>
            a.picked?.length === 2 &&
            new Set(a.picked).size === 2 &&
            a.picked.every((p) => p === "old" || p === "open"),
        },
      ],
      expected:
        "Select old and open. South has only r7 at e2, so it returns blue under a local eventual-read policy. That is acceptable for the feed but fails the editor's stated read-your-writes requirement. Convergence depends on delivery and repair; a continuing partition has no convergence deadline supplied by eventual consistency.",
      nextStep:
        "Change the e2 editor read to require at least r8. State what the service should return if no reachable eligible replica can establish that revision.",
    },
    helpLevels: [
      "Follow the replica serving the refresh rather than the replica that accepted the save.",
      "List South's applied revisions at e2. Then ask what a continuing partition prevents.",
      "Choose old and open: South still has r7, and a partition can postpone r8 delivery indefinitely. Fix the editor's read contract rather than assuming the save failed.",
    ],
  },
  {
    id: "t-35-variant",
    conceptId: 35,
    type: "variant",
    prompt:
      "Select exactly three policies: one for public ranking display, one for personal score confirmation, and one for prize settlement.",
    context:
      "A game region durably acknowledges score revision 42. Public rankings may lag without a fixed bound. The player's confirmation must reflect revision 42 or a later state. Partitions can outlast the five-minute tournament close. Only an authoritative final result may award prizes; the settlement authority may delay finalization when required evidence is unavailable.",
    options: [
      {
        key: "display",
        label:
          "Serve public rankings from local replicas under the stated stale-display contract; mark them provisional.",
      },
      {
        key: "receipt",
        label:
          "Carry the acknowledged score revision into personal reads; show a confirmed score only after establishing at least that revision, otherwise show pending.",
      },
      {
        key: "settle",
        label:
          "Award prizes only from the designated authoritative finalization path; delay settlement if it cannot establish the final result.",
      },
      {
        key: "sleep",
        label:
          "Wait five seconds after acknowledgement, then confirm whatever score the nearest replica returns.",
      },
      {
        key: "final-result",
        label:
          "At tournament close, award each region's prize using its local public ranking and reconcile winners afterward.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "display_contract",
          label: "Keep public display separate from authority",
          cause:
            "You omitted the stale-tolerant public path. Its display contract permits local reads, but those reads do not establish prize eligibility.",
          check: (a) => (a.picked ?? []).includes("display"),
        },
        {
          key: "session_contract",
          label: "Preserve the acknowledged personal revision",
          cause:
            "A fixed wait does not prove the nearest replica has revision 42. Personal confirmation needs revision evidence or an explicit pending state.",
          check: (a) =>
            (a.picked ?? []).includes("receipt") &&
            !(a.picked ?? []).includes("sleep"),
        },
        {
          key: "settlement_contract",
          label: "Require authority before awarding prizes",
          cause:
            "Local public rankings may disagree across the closing deadline. Later convergence cannot undo an already incorrect prize promise.",
          check: (a) =>
            (a.picked ?? []).includes("settle") &&
            !(a.picked ?? []).includes("final-result"),
        },
        {
          key: "policy_scope",
          label: "Choose exactly one policy per required read purpose",
          cause:
            "The selection contains missing, repeated or incompatible policies. Cover display, personal confirmation and settlement without extra choices.",
          check: (a) =>
            a.picked?.length === 3 &&
            new Set(a.picked).size === 3 &&
            a.picked.every(
              (p) => p === "display" || p === "receipt" || p === "settle",
            ),
        },
      ],
      expected:
        "Select display, receipt and settle. Public display explicitly tolerates stale data. Personal confirmation carries a session revision requirement and reports pending when that requirement cannot be established. Prize settlement needs the authoritative final result, so isolation can delay it beyond tournament close. Eventual replication neither establishes a five-second freshness bound nor turns provisional regional rankings into final authority.",
      nextStep:
        "Now require public rankings to be at most two seconds stale. Identify the extra freshness evidence and fallback needed; eventual consistency alone no longer satisfies that contract.",
    },
    helpLevels: [
      "Classify each read by the harm caused by an old value. Do not give every screen the same contract.",
      "Separate provisional public display, the player's own acknowledged revision, and the irreversible prize decision. Ask what each path must do during isolation.",
      "Choose display, receipt and settle. Keep public rankings provisional, require revision evidence for personal confirmation, and delay authoritative settlement rather than award from divergent local rankings.",
    ],
  }
,
  {
    id: "t-39-predict",
    conceptId: 39,
    type: "predict",
    prompt: "Select exactly two supported predictions: one final outcome and one explanation of its cause.",
    context: "One shop server runs concurrent handlers R and S against MUG.stock=1. Each reads, checks >0, computes a constant newStock and later writes that constant unconditionally. The fixed schedule is R reads 1; S reads 1; R writes 0 and confirms R; S writes 0 and confirms S. All writes commit; no retry, replication or other request exists.",
    options: [
      { key: "a", label: "Final stock is 0 and both purchases are confirmed, violating the one-unit allocation constraint." },
      { key: "b", label: "Final stock is -1 because each write must decrement the latest database value." },
      { key: "c", label: "S's decision uses a value read before R's mutation; the read and allocation were not one atomic decision." },
      { key: "d", label: "Only R can confirm because a single application server serializes complete HTTP handlers." },
    ],
    rubric: {
      criteria: [
        { key: "result_trace", label: "Tracks constant writes and confirmation count", cause: "May be substituting an atomic decrement for the stated constant writes, or checking only whether the final counter is negative.", check: a => (a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("a") && !a.picked.includes("b")) ?? false },
        { key: "window_reason", label: "Locates the shared-state decision window", cause: "May be assuming one server serializes entire handlers, overlooking interleaving across database awaits.", check: a => (a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("c") && !a.picked.includes("d")) ?? false },
      ],
      expected: "A and C. Both read 1 and independently compute the constant 0. Writing 0 twice leaves 0, yet both handlers confirm. R's window from read to write contains S's read; S's window contains R's write. A single server does not prevent this schedule when handlers await I/O. The invariant concerns allocations, not just a nonnegative counter.",
      nextStep: "Replace each constant write with a conditional database decrement. Trace the two affected-row results and state when a confirmation may be sent.",
    },
    helpLevels: [
      "Keep separate records of the stored counter and the number of confirmations. Follow the given operations literally.",
      "An unconditional assignment of a precomputed constant is not a decrement of the latest row value. Mark what S knew when it decided.",
      "Choose A and C: both write 0, so final stock is 0 with two confirmations. Both decisions used the old 1 because their read-to-write windows overlap.",
    ],
  },
  {
    id: "t-39-variant",
    conceptId: 39,
    type: "variant",
    prompt: "Select exactly two decisions supported by the campaign's capacity and latency constraints.",
    context: "A loyalty campaign mass-mail causes thousands of simultaneous claims. One authoritative PostgreSQL campaign row has remaining=1. There is no queue, each request is a different claim, the endpoint is synchronous, and exhaustion may be rejected. The immediate invariant is at most one committed slot allocation. There is no cross-row eligibility rule. Coupon-record creation and email are separate effects not included in that invariant; no atomic integration with them is supplied.",
    options: [
      { key: "a", label: "Allocate with UPDATE campaign SET remaining=remaining-1 WHERE id=$1 AND remaining>0 RETURNING remaining; count success only if a row was returned and committed, and reject exhausted claims." },
      { key: "b", label: "Approve from a frontend remaining>0 check, then assign its computed value later; distinct legitimate clients cannot conflict." },
      { key: "c", label: "Treat hot-row waiting as a latency cost, avoid unbounded optimistic retry storms, and design coupon persistence/email separately rather than claiming the counter makes them atomic." },
      { key: "d", label: "Keep a row lock through remote email delivery; a committed counter update then proves each email was delivered exactly once." },
    ],
    rubric: {
      criteria: [
        { key: "capacity_boundary", label: "Places capacity admission at the authoritative mutation", cause: "May be treating independent client observations as shared authority, or confirming before the guarded mutation commits.", check: a => (a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("a") && !a.picked.includes("b")) ?? false },
        { key: "contention_scope", label: "Names contention cost and separates external effects", cause: "May be assuming an atomic row update removes contention or coordinates remote delivery; holding a lock across a network call adds waiting without exactly-once delivery.", check: a => (a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("c") && !a.picked.includes("d")) ?? false },
      ],
      expected: "A and C. Capacity checking and decrement belong in one authoritative mutation; confirmation requires a returned row and successful commit, not a prior display value. A losing claim gets no row (or an error that is not success). The hot row can still wait or fail under database limits. Optimistic conflicts need bounded retry/recomputation, not a storm. This only allocates a slot: durable coupon creation and email require a separately designed transaction/workflow. A database lock cannot make remote email transactional or exactly-once.",
      nextStep: "Add a durable coupon record requirement. Identify which writes must commit together and which remote effect remains outside that database transaction; do not count a sent email as proof of a committed record.",
    },
    helpLevels: [
      "List the immediate invariant, the forbidden architecture change, and the effects that are explicitly outside the model.",
      "Find the operation that checks capacity at mutation time. Then ask what thousands of contenders wait for and whether a database commit controls a mail provider.",
      "Choose A and C. A committed conditional update admits at most the last available slot; it still contends on a row. Bound conflict handling and design coupon persistence/email separately: neither client checks nor a lock held over email supplies those guarantees.",
    ],
  },
  {
    id: "t-38-predict", conceptId: 38, type: "predict",
    prompt: "Select exactly one outcome supported by the store protocol.",
    context: "A acquires catalog token 41, pauses and outlives its lease. B retries after expiry, acquires 42 and commits v2 with durable high-water 42. A then submits v1 with 41. The store atomically rejects tokens below its high-water mark on every write. No other requests occur.",
    options: [
      { key: "a", label: "A's v1 replaces v2 because lease expiry only affects acquisition." },
      { key: "b", label: "The store rejects A's 41 and retains v2 because 41 is below the recorded 42." },
      { key: "c", label: "A cannot submit a request because lease expiry terminates its process." },
      { key: "d", label: "The store must accept 41 if A's local wall clock says the lease is valid." },
    ],
    rubric: {
      criteria: [
        { key: "epoch_guard", label: "Predicts the effect at the resource boundary", cause: "May be ignoring resource-side fencing or assuming expiry terminates a process; distinguish a submitted request from an accepted mutation.", check: (a) => exact(a.picked, "b") },
      ],
      expected: "B. A can resume and submit a request, but the store atomically compares 41 with durable high-water 42 and rejects it. Expiry enabled B's acquisition; it did not terminate A. Without the store check, this schedule could regress to v1 regardless of a previous successful lock acquisition.",
      nextStep: "Replay the trace with the high-water check removed. Identify the final payload, then explain why a pre-send ownership check still leaves a delay window.",
    },
    helpLevels: [
      "Separate what the authority grants, what a worker can send, and what the store can commit.",
      "Read the store's high-water mark when the late request arrives; compare ownership epochs rather than wall-clock readings.",
      "Choose B: 41 < 42, so the atomic store guard rejects v1 and keeps v2. The stale worker can run; the guard prevents this stale effect.",
    ],
  },
  {
    id: "t-38-variant", conceptId: 38, type: "variant",
    prompt: "Select exactly one defensible decision under the reminder service's constraints.",
    context: "Duplicate clinical appointment emails are forbidden. A calls a provider and times out; the outcome is unknown. A's lease expires and B can acquire a newer token. The provider supports neither fencing tokens nor idempotency keys nor an authoritative send-status query. No atomic transaction spans your database and the provider.",
    options: [
      { key: "a", label: "Retry after acquiring the newer token; the provider will infer which owner is current." },
      { key: "b", label: "Increase the TTL and retry after expiry; a longer lease proves the first email was not sent." },
      { key: "c", label: "Do not retry this unknown outcome automatically; the current API cannot guarantee both eventual delivery and no duplicate. Require receiver deduplication or authoritative reconciliation, or renegotiate the delivery requirement." },
      { key: "d", label: "Record a local sent flag before calling and treat that flag as proof the provider delivered the email." },
    ],
    rubric: {
      criteria: [
        { key: "effect_boundary", label: "Recognizes the unsupported external guarantee", cause: "May be extending lock ownership or a local flag to an external effect that cannot enforce epochs or resolve an unknown result.", check: (a) => exact(a.picked, "c") },
      ],
      expected: "C. A timeout is not proof of non-delivery. B's newer lease/token does not control an API that ignores it. Retrying may duplicate; declining to retry may lose delivery. A local flag cannot atomically establish the remote outcome. Stop automatic retry of this unknown send and obtain receiver deduplication or authoritative reconciliation, or explicitly change the requirement. No TTL choice proves both guarantees with the supplied interface.",
      nextStep: "Assume a replacement provider offers durable idempotency keys per reminder. Specify a stable key across retries and check its retention and payload rules before claiming duplicate suppression.",
    },
    helpLevels: [
      "Write down what is known after the timeout and which component can observe whether an email was sent.",
      "Compare retrying with not retrying when the first call may already have succeeded. Ask whether the receiver understands a newer ownership epoch.",
      "Choose C: ownership changed, but the remote outcome remains unknown. Retry can duplicate and no retry can lose delivery; receiver support or the requirement must change.",
    ],
  },
];