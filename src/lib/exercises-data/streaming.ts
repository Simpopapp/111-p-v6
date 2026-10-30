import type { Task } from "@/lib/exercises";
export const TASKS_STREAMING: Task[] = [
  {
    id: "t-22-predict", conceptId: 22, type: "predict",
    prompt: "A crashes. Select exactly TWO statements that predict recovery correctly.",
    context: "A owns the browser's WebSocket and local subscription. B is healthy and can read durable chat history. Sequence 41 is confirmed; 42 was stored before A crashed, but no acknowledgement reached the browser. The new-connection balancer can route a reconnect to B. No automatic socket migration exists.",
    options: [
      { key: "a", label: "B inherits the established socket because it can read the same history." },
      { key: "b", label: "The browser needs a new connection; B must validate access and restore its subscription." },
      { key: "c", label: "Resume after 41 with replay and deduplication; stored 42 may need to be delivered again." },
      { key: "d", label: "Sticky routing to A preserves the socket while A is down." },
      { key: "e", label: "TCP ordering on the old socket proves that 42 was processed by the browser." },
    ],
    rubric: {
      criteria: [
        { key: "owner", label: "Separate connection ownership from shared durable history.", cause: "Shared history or routing affinity is being mistaken for a transferable live connection.", check: (a) => a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("b") && !a.picked.includes("a") && !a.picked.includes("d") },
        { key: "cursor", label: "Recover the acknowledgement gap without claiming exactly-once transport.", cause: "Transport ordering is being mistaken for evidence of application processing across a disconnect.", check: (a) => a.picked?.length === 2 && new Set(a.picked).size === 2 && a.picked.includes("c") && !a.picked.includes("e") },
      ],
      expected: "Select b and c. A's socket is gone. B can accept a new connection, validate access and restore the subscription. Resume from confirmed 41; replay may include 42. Sequence-based deduplication addresses repeats. Shared storage helps recovery but cannot migrate a TCP connection.",
      nextStep: "Trace the case where 42 reached the browser but its acknowledgement was lost; identify where deduplication belongs.",
    },
    helpLevels: ["List what survives a replica crash and what exists only in that replica's memory.", "Durable history can survive while the socket and subscription do not. A missing acknowledgement leaves delivery uncertain.", "Choose b and c: create a new connection and restore application state, then replay after 41 with deduplication."],
  },
  {
    id: "t-22-variant", conceptId: 22, type: "variant",
    prompt: "Choose ONE transport plan that meets the quotation dashboard's requirements with the least unnecessary bidirectional connection machinery.",
    context: "500 browsers receive server-generated quotes once per second with at most two seconds of delay. Watchlist changes occur twice per day and can use POST. The deployed proxy supports streaming HTTP and WebSockets. Both streaming plans can meet capacity and latency targets. History with sequence IDs is available for a bounded replay window; no client typing, audio or continuous commands exist.",
    options: [
      { key: "a", label: "Use SSE for quote delivery and POST for watchlist changes; implement cursor-based replay and a snapshot when history expires." },
      { key: "b", label: "Use WebSockets for both directions and implement connection ownership, subscription restore and cursor replay." },
      { key: "c", label: "Poll once per minute, retaining independent HTTP requests for all operations." },
      { key: "d", label: "Use SSE and rely on reconnection alone to recreate any missing historical quotes without server replay support." },
    ],
    rubric: {
      criteria: [
        { key: "channel-fit", label: "Match a server-driven feed and rare commands to a proportional transport.", cause: "The decision ignores either the one-way traffic pattern or the explicit two-second freshness requirement.", check: (a) => a.picked?.length === 1 && a.picked[0] === "a" },
        { key: "renewal", label: "Keep replay and expired-cursor handling explicit.", cause: "Automatic reconnection is being confused with durable historical delivery, or the response does not choose a streaming plan with recovery.", check: (a) => a.picked?.length === 1 && (a.picked[0] === "a" || a.picked[0] === "b") },
      ],
      expected: "Choose a. SSE supplies the required server-to-browser stream; POST handles rare client commands. WebSockets in b can work, but their bidirectional channel is unnecessary under the stated minimization goal. Minute polling misses freshness. SSE reconnection is not a history store: the server must interpret a cursor and offer a snapshot beyond retained history.",
      nextStep: "Change the workload to continuous bidirectional collaboration; explain which assumption makes WebSockets worth reconsidering.",
    },
    helpLevels: ["Separate the direction and frequency of updates from the marketing label real-time.", "Rare commands can be independent requests. Compare the freshness target with the polling interval, then inspect each plan's replay assumption.", "Choose a: SSE plus POST fits this one-way feed. Preserve cursor replay and a snapshot fallback; reconnection alone cannot recover expired history."],
  },
{
    id: "t-23-predict",
    conceptId: 23,
    type: "predict",
    prompt:
      "Select every statement supported by the trace. Ignore response transit time.",
    context:
      "A returns sequence 41 at 3 seconds. B then waits 25 seconds and ends with an empty response. C opens at 28.2, but a changed proxy closes it at 38.2. Sequence 42 is stored at 39. The next request D opens after sequence 41 at 41.2. The application retains ordered history for five minutes.",
    options: [
      {
        key: "a",
        label:
          "D can return retained 42; its event-to-response delay is 2.2 seconds in this trace.",
      },
      {
        key: "b",
        label:
          "After B's empty response, the client needs another receive request to wait for later events.",
      },
      {
        key: "c",
        label:
          "C can carry 42 at second 39 because it was previously opened.",
      },
      {
        key: "d",
        label:
          "HTTP reconnect alone would recover 42 even if the server retained neither events nor a current snapshot.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "locate-delivery",
          label: "Locate delivery after the receive gap",
          cause:
            "You may be treating an earlier request as an ongoing channel rather than locating the next pending request.",
          check: (a) => a.picked?.includes("a") === true,
        },
        {
          key: "cycle",
          label: "Renew the request after an empty response",
          cause:
            "You may be interpreting a hold timeout as a subscription that remains active after its response ends.",
          check: (a) => a.picked?.includes("b") === true,
        },
        {
          key: "boundary",
          label: "Reject delivery through a closed request and transport-only replay",
          cause:
            "A closed request cannot carry a later response, and recovery depends on application history or resynchronization rather than reconnect alone.",
          check: (a) =>
            (a.picked ?? []).every((key) => key === "a" || key === "b"),
        },
      ],
      expected:
        "Select a and b only. B's empty response ends B; C is a new request. The proxy closes C before 42 exists, leaving no pending receive request at second 39. D asks after 41 and retrieves retained 42 at 41.2, so the illustrated delay is 41.2 - 39 = 2.2 seconds, excluding transit. Without the application's retained history or snapshot recovery, HTTP reconnect alone cannot reconstruct missing state.",
      nextStep:
        "Move D to second 45 and recalculate the delay. Then remove event retention and explain what a current-state snapshot can recover and what transition history it cannot.",
    },
    helpLevels: [
      "Mark the start and end of each request. Which request, if any, is pending when the event is stored?",
      "Separate the time the event is stored from the time a new receive request exists. Also distinguish application history from HTTP reconnection.",
      "Choose a and b only: D retrieves retained 42 after a 2.2-second gap; B's completed empty response requires a new request. C is closed, and transport reconnection does not supply history.",
    ],
  },
  {
    id: "t-23-variant",
    conceptId: 23,
    type: "variant",
    prompt:
      "Select the transport decision and recovery requirements justified by this factory route. Select every supported statement.",
    context:
      "A read-only dashboard monitors 200 machines with sparse status changes and a two-second healthy-operation freshness aim. HTTPS works, WebSocket Upgrade is rejected, and a separate test shows SSE buffering events for 20 seconds. Held requests are allowed for 20 seconds and completed JSON responses flush promptly. The proposed long-poll hold is 15 seconds; the alternative short-poll interval is 30 seconds. History is retained for five minutes.",
    options: [
      {
        key: "a",
        label:
          "Trial 15-second long polling: a pending request may complete as soon as status changes, without waiting for its hold limit.",
      },
      {
        key: "b",
        label:
          "Keep one receive request outstanding, resume by cursor, and show stale state during error recovery; resynchronize if retention expires.",
      },
      {
        key: "c",
        label:
          "Prefer the tested SSE route for this freshness aim because it avoids per-event receive requests despite its 20-second buffering.",
      },
      {
        key: "d",
        label:
          "Use 30-second short polling to meet the two-second freshness aim because each individual request completes quickly.",
      },
      {
        key: "e",
        label:
          "Treat the 15-second hold as a guaranteed maximum event delivery delay during proxy failures.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "fit",
          label: "Choose a transport from the measured route constraints",
          cause:
            "You may be choosing by protocol reputation instead of combining one-way traffic, prompt complete-response flushing and the observed streaming limitation.",
          check: (a) => a.picked?.includes("a") === true,
        },
        {
          key: "renewal",
          label: "Specify request lifecycle and application recovery",
          cause:
            "A transport choice does not define cursor replay, retention expiry or what users see during disconnection.",
          check: (a) => a.picked?.includes("b") === true,
        },
        {
          key: "limits",
          label: "Reject incompatible freshness claims",
          cause:
            "Stream buffering and polling intervals can delay visibility; a server hold bounds waiting on one request, not outage recovery or end-to-end delivery.",
          check: (a) =>
            (a.picked ?? []).every((key) => key === "a" || key === "b"),
        },
      ],
      expected:
        "Select a and b only. A held request can return immediately when an event arrives; 15 seconds is its maximum idle hold, not a mandatory delivery delay. The tested complete-response path makes long polling a plausible trial below the 20-second route limit. SSE's measured 20-second buffering conflicts with this freshness aim, while a change just after a 30-second poll can wait nearly 30 seconds before the next check. Maintain the receive cycle and application recovery explicitly. None of these settings proves delivery within a fixed deadline during failures. Upgrade rejection alone would not rule out SSE; the separate buffering test is decisive here.",
      nextStep:
        "Change the route so SSE flushes immediately. Reconsider SSE for this one-way dashboard, then explain which replay and stale-state requirements remain unchanged.",
    },
    helpLevels: [
      "For each transport, identify what prevents the next status change from becoming visible. Separate normal operation from recovery after failure.",
      "Compare the measured buffering delay and short-poll interval with the freshness aim. For a held request, ask whether data can end the wait early.",
      "Choose a and b only. Long polling fits this tested route provisionally, with prompt renewal and cursor recovery. Buffered SSE and 30-second polling miss the stated aim, and a hold timeout is not a delivery guarantee.",
    ],
  }
];