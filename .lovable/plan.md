# Resume the VibeCoder Academy remix

**Approval recorded:** 2026-10-30. The user approved this plan and explicitly authorized execution on the next remix activation, without another approval request. This round is registration only; do not implement the catalog changes now. Durable handoff: `docs/planning/remix8-approved-plan.md` and `.opencode/roadmap-proj3`.

## Next milestone: correct the canonical catalog
Resume the unfinished stage identified by the Project 3 roadmap: bring outdated concept summaries into alignment with the reviewed lessons, before expanding lesson coverage further.

- Recover and verify the saved review recommendations for Horizontal Scaling, Liveness & Readiness Probes, SQL Injection, XSS, Throughput, Tail Latency, HTTP/2 & HTTP/3, and TCP vs UDP (IDs 46, 57, 78, 79, 92, 94, 97, 98; confirm each name against the source).
- Apply confirmed corrections to the catalog’s original source and regenerate the catalog deterministically; never edit the generated catalog by hand.
- Preserve all 111 concept IDs, names, categories, lesson links, and existing learning records.
- Verify the updated summaries through the library and lesson views, and run the existing tests plus focused source/regeneration integrity tests.
- Record the actual results in the Project 3 roadmap and a stage status report, then request an independent project-monitor evaluation. Report any monitor availability problem rather than claiming an evaluation happened.

## Scope boundaries
Keep the existing visual design and learning flows. This milestone adds no accounts, infrastructure, payments, or new lessons. New lesson expansion and independent review of the latest lessons remain subsequent roadmap work.

## Technical approach
- Treat `.opencode/project1.md` as the catalog source and confirm the extraction format against `src/lib/concepts.ts`.
- Recover an existing generator if present; otherwise add a small reproducible extraction script with validation of IDs, categories, and required fields.
- Check review artifacts before choosing exact replacement text. Missing recommendations are a documented gap, not evidence of an approved correction.
- Keep unrelated source records byte-identical where possible and test regeneration determinism.
- Use preview checks and the harness-provided type/build diagnostics; do not run manual builds or typechecks.