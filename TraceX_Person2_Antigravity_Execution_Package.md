# TraceX — Person 2 Antigravity Execution Package
Companion to `TraceX_Person2_Engineering_Blueprint.md` (source of truth — nothing here changes its architecture, scope, or contracts). This document only sequences it and turns it into pasteable prompts.

---

## 1. Implementation Order

**Do this first, outside Antigravity, before T6/T8 fixtures are written:** get Apoorv to agree — even just in writing, not implemented yet — to the `edges[]`/`Case`/`data_mode`/auth contracts in Blueprint Section 3. This doesn't block T1/T2 below, but T6/T8's fixtures must match the *agreed* shape, not a guessed one, or you'll rework them later.

| # | Task | Can start now? | Why |
|---|---|---|---|
| T1 | Remove fabricated default data | ✅ Immediately | Pure `new-ui` cleanup, zero backend dependency |
| T2 | Routing scaffold | ✅ Immediately | Pure `new-ui` cleanup, zero backend dependency |
| T3 | Authentication | ✅ Start now, against a local stub | Build the flow against a documented mock matching Blueprint §3.2; **cannot be marked done** until Apoorv's real `/api/v1/auth/*` is live and swapped in |
| T4 | Route guards / Security UX states | ✅ Immediately after T3's stub exists | Pure frontend logic once `useAuth` shape exists |
| T5 | Case workspace | ⚠️ Start now, against a stub | Needs Apoorv's `/api/v1/cases/*` + reworked `/api/v1/trace` for real completion |
| T6 | R1–R8 Intelligence Engine | ✅ Immediately, against a fixture | Build and fully unit-test against a hand-written `edges[]` fixture that matches the frozen contract — don't wait for live data |
| T7 | Findings UI | ✅ Immediately, after T6 | Consumes T6's own endpoint, which works standalone |
| T8 | Grounded Copilot backend | ✅ Immediately, against fixtures | Tools + validator are testable with zero live backend data; only the real LLM call needs your own API key (not Apoorv) |
| T9 | Copilot UI | ✅ Immediately, after T8 | Consumes T8's own endpoint |
| T10 | Gas-parent / cross-complaint / exit UI | ⚠️ Start now, against a stub | Needs Apoorv's `/gas-parent-clusters`, `/cross-complaint-matches`, `/exits` for real completion |
| T11 | Evidence / verification / notice UI | ⚠️ Start now, against a stub | Needs Apoorv's evidence export/verify + reworked freeze-notice for real completion |
| T12 | Retire old `frontend/` | ⛔ Last, only after everything else is verified | Shared infra (`docker-compose.yml`) — coordinate with Apoorv before deleting |

**Practical sequencing:** T1 → T2 → T3 → T4 in one line (each unblocks the next). In parallel, T6 → T7 → T8 → T9 in a second line (fully self-contained, no Person-1 blocker). T5 / T10 / T11 can be scaffolded against stubs any time after T2, but flag each as **WAIT FOR PERSON 1** in your own tracker until swapped to real endpoints. T12 is always last.

---

## 2. Antigravity Master Prompt

Paste this once, at the start of your Antigravity session, before any task prompt below.

```
You are implementing Person 2's responsibilities on TraceX, a two-person crypto-fraud
forensics hackathon project. Read this entire prompt before touching any file.

=== WHAT TRACEX IS ===
TraceX turns a real reported crypto-fraud transaction into an explainable,
evidence-backed investigation an authorized investigator can act on. It traces
tainted funds from a fraud transaction through the blockchain, explains findings
with on-chain evidence, and drafts (never auto-issues) an investigator's request.
It NEVER determines who is guilty.

Security principle: blockchain data may be public; the investigation, evidence,
and case workspace are access-controlled and auditable.

=== MY ROLE (PERSON 2 / ANVESH) ===
I own exactly these areas. Nothing else.
- Intelligence / Rule Engine (deterministic R1-R8 findings)
- Grounded AI Copilot (tool-calling LLM + citation validation, never invents facts)
- The entire frontend (new-ui/ — consolidating from two frontends down to one)
- Security UX (login, sessions, role-aware routes, unauthorized/forbidden states)
- Frontend integration with Person 1 (Apoorv)'s backend

Person 1 (Apoorv) owns: the trace engine (blockchain/tracer.py, rpc_client.py),
evidence/data layer, provider integrations, Case/Trace/Edge/Finding/Exit/Evidence/
Audit persistence models, authentication/RBAC middleware implementation, the legal
notice generator, and Neo4j. I do not touch his code.

=== FILES I OWN (safe to modify) ===
- new-ui/ (entire tree)
- backend/intelligence/ (new package, mine)
- backend/copilot/ (new package, mine)
- backend/api/routes_intelligence.py (new file, mine)
- backend/api/routes_copilot.py (new file, mine)
- backend/tests/test_intelligence_rules.py, backend/tests/test_copilot_validator.py (new, mine)

=== FILES I MUST NEVER MODIFY ===
- backend/blockchain/tracer.py
- backend/blockchain/rpc_client.py
- backend/legal/notice_generator.py
- backend/neo4j/
- backend/database/schemas.py — READ-ONLY imports allowed (SQLAlchemy Session
  queries for my intelligence engine / copilot tools), NEVER write to it, NEVER
  add/alter tables in it
- backend/scraper/exchange_crawler.py
- backend/ml/
- Anything under frontend/ (old Next.js app) until the explicit retirement task,
  and even then only after I say to proceed

=== BACKEND CONTRACTS I DEPEND ON (Person 1 owns these) ===
These may not exist yet, or may not match the shape below. NEVER assume they
exist or invent a plausible-looking response for them. If a task needs one of
these and it isn't confirmed live, STOP and tell me — do not fake it, mock it
silently, or "helpfully" implement a fallback that looks real.

Auth: POST /api/v1/auth/login, POST /api/v1/auth/logout, GET /api/v1/auth/me
  -> {id, username, role: INVESTIGATOR|SUPERVISOR|ADMIN}, httpOnly session cookie

Cases: POST /api/v1/cases, GET /api/v1/cases, GET /api/v1/cases/{case_id},
  POST /api/v1/cases/{case_id}/trace (root = fraud tx hash, not a wallet)

Trace/edges: GET /api/v1/trace/{trace_id} must return edges[] where each edge has
  {edge_id, from, to, tx_hash, value, asset, timestamp, hop_number, taint_amount,
  taint_source_tx, evidence_id, boundary_type, data_mode}. NONE of taint_amount,
  taint_source_tx, evidence_id, boundary_type, data_mode exist in the current repo
  (today's HopRecord only has hop_number/from/to/value/tx_hash/asset/chain/timestamp).

Evidence: POST /api/v1/cases/{case_id}/evidence/export,
  GET /api/v1/evidence/{bundle_id}/manifest, POST /api/v1/evidence/{bundle_id}/verify

Exits: GET /api/v1/cases/{case_id}/exits -> [{exit_id, wallet, vasp_name,
  tier: A|B|C, evidence_ids, confidence}]

Gas-parent clusters: GET /api/v1/cases/{case_id}/gas-parent-clusters
Cross-complaint matches: GET /api/v1/cases/{case_id}/cross-complaint-matches

WebSocket (existing, confirmed live): ws://.../ws/trace/{trace_id} emits
  HOP_DISCOVERED, TRACE_COMPLETED, TRACE_FAILED (already implemented, keep as-is)
WebSocket (new, may not exist): DATA_MODE_CHANGED -> {event, trace_id, data_mode,
  reason}. If absent, poll data_mode from the trace GET response instead of
  blocking on this event.

=== SECURITY REQUIREMENTS ===
- No case/evidence data reaches the browser for an unauthorized user, ever.
- Frontend route guards (RequireAuth/RequireRole) are UX convenience only — the
  real security boundary is the backend rejecting the request. Never present a
  guard as "the fix" for an authorization problem; the fix is always the backend
  401/403.
- Session state lives in an httpOnly cookie set by the backend. Never store a
  raw session token in localStorage, sessionStorage, or any JS-readable state.
- No provider key, LLM key, or secret may appear in any frontend file, bundled
  JS, or network payload sent from the browser.
- Every protected action needs BOTH a disabled/hidden UI affordance AND a
  backend check — never rely on hiding a button as the only protection.

=== LIVE / CACHED / UNAVAILABLE RULES ===
Every trace/edge/finding response carries a data_mode field: LIVE, CACHED, or
UNAVAILABLE. This must be visibly shown wherever trace data is displayed, not
buried in one corner. If data_mode is UNAVAILABLE, the UI must say so honestly
— never silently show stale or fabricated data as if it were current. This is a
product integrity requirement, not a cosmetic one.

=== NO FABRICATED DATA RULE ===
The existing new-ui/src/data/cases.ts mock dataset (FORENSIC_CASES) must never
be reachable as the default state or silently merged with real trace data. If
demo/mock data is shown at all, it must be behind an explicit user action and
visibly tagged as simulation. Never write code that quietly substitutes fake
data for a missing/failed backend response — an honest error state is always
correct; invented-looking data is never correct, even temporarily "to keep the
demo working."

=== R1-R8 DETERMINISTIC RULES (Intelligence Engine, mine) ===
R1 Rapid pass-through: wallet forwards >=90% of taint_amount within 300s of
  receiving it, in a single outgoing edge.
R2 Peel chain: wallet splits incoming taint into >=3 sequential outgoing edges,
  each <20% of received taint, across consecutive hops.
R3 Fan-out: single wallet sends to >=5 distinct addresses within one hop_number.
R4 Fan-in: >=5 distinct addresses converge into one wallet within a bounded
  time window.
R5 Privacy protocol: edge.boundary_type == "MIXER".
R6 Gas sponsor match: >=2 wallets in the trace share the same gas-funding
  parent (requires Person 1's gas-parent-cluster data — do not compute this
  yourself from raw data).
R7 Bytecode match: two contract wallets share identical bytecode hash. STATUS
  UNCONFIRMED WITH PERSON 1 — do not build this rule's data path until I tell
  you Person 1 has agreed to expose bytecode hashes; stub the rule function
  with a NotImplementedError and a comment, nothing more.
R8 Exchange exit: edge.boundary_type == "EXCHANGE" AND exit tier is A or B
  (requires Person 1's /exits data).

These rules are pure functions over edges[]/Finding data. NO LLM CALL of any
kind inside backend/intelligence/. If a rule's required field doesn't exist on
the edge data you're testing against, write the rule against the frozen fixture
contract anyway (see T6 prompt) — do not invent a substitute field.

=== GROUNDED COPILOT CONSTRAINTS (mine) ===
- The LLM only receives data returned by explicit tool calls it makes this
  turn: get_trace_summary, get_finding, list_findings, get_edge, get_exit.
  All are read-only, backed by real DB queries.
- The LLM must never invent a transaction, choose a blockchain path, or issue
  a guilt/verdict/legal determination. System prompt must state this
  explicitly.
- Every specific factual claim in the LLM's answer must cite a tx_hash,
  edge_id, or finding_id that was actually returned by a tool call THIS TURN.
- A deterministic citation validator (your code, not the LLM) checks every
  citation against this turn's tool results and strips any sentence whose
  citation fails. If the answer becomes empty, fall back to a deterministic
  summary built from list_findings() — never re-prompt the LLM to "try again."
- Test the validator against hand-crafted adversarial LLM output BEFORE wiring
  a real LLM call.

=== FRONTEND ARCHITECTURE ===
Consolidate entirely in new-ui/ (Vite + React 19). Retire frontend/ (old
Next.js) only in the final task, after explicit confirmation. Add
react-router-dom for real routing (currently a single useState view toggle —
replace it). Keep the existing axios-based new-ui/src/api/client.ts and extend
it rather than rewriting it; it is already correctly wired to the live backend.
No new global state library (no Redux/Zustand) — React context + existing
useState/useWebSocket patterns are sufficient at this scale.

=== TESTING REQUIREMENTS ===
- backend/intelligence/ and backend/copilot/: pytest unit tests, following the
  existing convention in backend/tests/ (test_<module>.py, async wrapped in
  asyncio.run() where needed). Every R1-R8 rule needs at least one
  boundary-condition test.
- Frontend: at minimum, manual verification against the acceptance criteria in
  each task below. Add lightweight tests for RequireAuth/RequireRole logic if
  time allows — do not let test infrastructure setup block feature delivery
  given hackathon time constraints.
- Run the relevant test command after every meaningful change, before moving
  to the next task.

=== GIT SAFETY RULES ===
- One short-lived branch per task (I will tell you the branch name in each
  task prompt).
- Small, frequent commits with clear messages referencing the task ID (e.g.
  "T6: implement R1-R4 rule functions + unit tests").
- Never commit directly to main.
- Never modify, rebase, or force-push over Person 1's commits or branches.
- Never touch docker-compose.yml, .env.example, or README.md without calling
  it out explicitly to me first — these are shared infra files.
- Stop and checkpoint (commit) after each task's acceptance criteria pass,
  before starting the next task.

=== HOW TO BEHAVE WHEN A DEPENDENCY DOESN'T EXIST ===
If a task requires a Person-1-owned backend contract (see list above) that is
not confirmed live in this repository right now:
1. Do NOT implement a fake/mock version that returns plausible-looking data
   silently.
2. Build and test the parts of the task that don't need it (e.g. UI shell,
   pure logic, unit tests against a fixture).
3. For the part that needs the missing contract, either use an EXPLICITLY
   LABELED stub (a function named e.g. mockCasesApi with a loud comment
   "TEMPORARY STUB — replace when Apoorv ships POST /api/v1/cases") or stop
   and output: "WAIT FOR PERSON 1: <exact endpoint/field needed>" and move to
   a task that isn't blocked.
4. Never guess a response shape for a missing endpoint beyond what is
   documented above. If you need a shape that isn't documented above, stop
   and ask me rather than inventing one.

=== REQUIRED WORKFLOW FOR EVERY TASK ===
1. Inspect the relevant part of the repository before changing anything —
   confirm current state matches what this prompt says; if it doesn't, stop
   and tell me the discrepancy rather than proceeding on stale assumptions.
2. Write a short plan (files to touch, in what order) before editing.
3. Implement.
4. Run the test command specified in the task.
5. Report exactly what changed: files touched, tests run and their result,
   and anything you stubbed or deferred with a WAIT FOR PERSON 1 flag.
6. Commit at the checkpoint specified in the task.

Acknowledge you've understood this, then wait for my first task prompt (T1).
Do not start implementing anything yet.
```

---

## 3. Phase Prompts (T1 → T12)

Paste one at a time, in the order from Section 1. Each is self-contained but assumes the Master Prompt (Section 2) is already loaded in the same session.

### T1 — Remove fabricated default data

```
TASK T1 — Remove fabricated default data
Branch: feature/p2-t1-remove-fabricated-data

OBJECTIVE
Stop the app from ever loading fabricated mock case data (FORENSIC_CASES) as
its default state. Mock data may still exist in the codebase for future
"load demo case" use, but it must never be the implicit first thing a user
sees, and must never be indistinguishable from a real trace.

FILES ALLOWED TO MODIFY
- new-ui/src/App.tsx
- new-ui/src/data/cases.ts (only to add a clear "SIMULATION" tag/comment, not
  to delete the dataset)

FILES FORBIDDEN TO MODIFY
- Everything under backend/
- Any file under new-ui/src/components/ (don't touch these yet, later tasks
  wire into them)

DEPENDENCIES
None.

EXACT TASKS
1. In App.tsx, replace `const [currentCase, setCurrentCase] = useState<ForensicCase>(FORENSIC_CASES[0])`
   with an empty/null initial state (e.g. `useState<ForensicCase | null>(null)`),
   and update every consumer of currentCase to handle the null/empty state
   (render an empty/landing view, not a crash).
2. If a "load demo case" affordance is needed for your own local testing,
   gate it behind an explicit action (e.g. a dev-only button) and ensure
   whatever it sets is visibly tagged (e.g. show "SIMULATION" in the UI when
   that data is active).
3. Confirm no other file imports FORENSIC_CASES and uses it as an implicit
   default (grep the codebase for FORENSIC_CASES usages).

ACCEPTANCE CRITERIA
- Fresh `npm run dev` load shows an empty/landing state, not a populated
  fabricated case.
- No code path renders FORENSIC_CASES data without an explicit user action.
- If the demo-load action exists, its output is visibly labeled as simulated.

TEST COMMANDS
cd new-ui && npm run dev   (manual check: fresh load = empty state)
cd new-ui && npm run lint  (tsc --noEmit — confirm no type errors from the null state change)

EXPECTED RESULT
App loads to empty/landing state. Existing components don't crash on null
currentCase. No behavior changes beyond this.

STOP CONDITIONS
If removing the default breaks more than App.tsx and cases.ts (i.e. many
components assume currentCase is always populated), stop and report the list
of affected components rather than modifying them — that's a signal the
change is bigger than T1's scope and needs my sign-off first.
```

### T2 — Routing

```
TASK T2 — Routing scaffold
Branch: feature/p2-t2-routing

OBJECTIVE
Replace the single activeView useState toggle with real routing
(react-router-dom), and scaffold the route structure. Stub screens only —
no real screen logic yet (that's T3+).

FILES ALLOWED TO MODIFY
- new-ui/package.json (add react-router-dom dependency)
- new-ui/src/App.tsx
- New files under new-ui/src/pages/ (or new-ui/src/routes/ — pick one and be
  consistent): LoginPage, CaseListPage, CaseCreatePage, CaseDetailPage,
  ForbiddenPage — all as minimal stub components for now

FILES FORBIDDEN TO MODIFY
- Everything under backend/
- Existing components in new-ui/src/components/ (import them later; don't
  gut or move them now)

DEPENDENCIES
T1 complete.

EXACT TASKS
1. npm install react-router-dom in new-ui/.
2. Set up routes:
   /login -> LoginPage (stub)
   / -> CaseListPage (stub)
   /cases/new -> CaseCreatePage (stub)
   /cases/:caseId -> CaseDetailPage (stub)
   /unauthorized -> ForbiddenPage (stub)
3. Each stub renders only its route name and a one-line placeholder — no
   logic, no API calls yet.
4. Confirm the existing HomeScreen/Header components still render somewhere
   sensible (either as the CaseListPage's shell or left wired to '/' as-is —
   your call, but don't delete them).

ACCEPTANCE CRITERIA
- Navigating to each route in the browser renders the correct distinct stub.
- No console errors on navigation.
- npm run lint passes.

TEST COMMANDS
cd new-ui && npm run dev   (manual nav test across all 5 routes)
cd new-ui && npm run lint

EXPECTED RESULT
Working route shell, stub screens only, existing components untouched and
still importable.

STOP CONDITIONS
None expected — this is pure scaffolding. If react-router-dom conflicts with
an existing dependency version, stop and report the conflict rather than
force-resolving it.
```

### T3 — Authentication

```
TASK T3 — Authentication
Branch: feature/p2-t3-authentication

OBJECTIVE
Implement the login/session flow against the auth contract in the Master
Prompt. Person 1's real /api/v1/auth/* endpoints may not exist yet — build
against an explicitly labeled local stub and make swapping to the real
endpoint a one-line change.

FILES ALLOWED TO MODIFY
- new-ui/src/hooks/useAuth.ts (new)
- new-ui/src/api/client.ts (extend only — add login/logout/me methods; do not
  touch existing methods like startTrace/getTrace/downloadFreezeNotice)
- new-ui/src/components/LoginForm.tsx (new)
- new-ui/src/pages/LoginPage.tsx (fill in the T2 stub)
- new-ui/src/api/authStub.ts (new, ONLY if Person 1's real endpoint isn't
  confirmed live — must be clearly commented as temporary)

FILES FORBIDDEN TO MODIFY
- Everything under backend/ (this task is 100% consuming, not implementing,
  the auth backend)

DEPENDENCIES
T2 complete. Confirm with me whether Person 1's /api/v1/auth/* is live before
starting — if not, use the stub path.

EXACT TASKS
1. Add to client.ts: login({username, password}), logout(), me() -> matching
   the shapes in the Master Prompt's Auth contract.
2. If the real endpoint isn't live: implement authStub.ts with an in-memory
   fake session (fixed test users with each role) and a loud top-of-file
   comment: "TEMPORARY STUB — remove when POST /api/v1/auth/login is
   confirmed live. See T3 in execution package."
3. useAuth.ts: exposes {user, login, logout, loading}. Calls me() on mount to
   restore session state. Never persists a raw token — user object only, no
   session secret handled in JS.
4. LoginForm.tsx: username/password fields, calls useAuth().login, shows
   error on 401.
5. Wire LoginPage to LoginForm; on successful login, redirect to '/'.

ACCEPTANCE CRITERIA
- Login with valid stub/real creds succeeds and redirects.
- Login with invalid creds shows an error, does not redirect.
- Refreshing the page after login preserves the session (via me() on mount).
- No token/secret is visible in localStorage/sessionStorage (check
  Application tab in devtools).

TEST COMMANDS
cd new-ui && npm run dev   (manual: valid login, invalid login, refresh-persist)
cd new-ui && npm run lint

EXPECTED RESULT
Working login flow, either against Person 1's real endpoint or a clearly
labeled stub.

STOP CONDITIONS
If Person 1's real endpoint exists but returns a shape that doesn't match the
Master Prompt's contract (e.g. token in response body instead of cookie),
stop and report the mismatch — do not silently adapt around it without
flagging it to me, since it may mean the contract needs renegotiating.
```

### T4 — Route guards / Security UX

```
TASK T4 — Route guards and security UX states
Branch: feature/p2-t4-route-guards

OBJECTIVE
Add RequireAuth/RequireRole guards to the routes from T2, plus the
unauthorized/forbidden/expired/unavailable UI states from the blueprint.
Remember: these are UX convenience, not the security boundary — the backend
401/403 is the real boundary. Do not describe or comment on these guards as
"securing" anything.

FILES ALLOWED TO MODIFY
- new-ui/src/components/RequireAuth.tsx (new)
- new-ui/src/components/RequireRole.tsx (new)
- new-ui/src/components/ForbiddenScreen.tsx (new)
- new-ui/src/components/UnavailableBanner.tsx (new)
- new-ui/src/api/client.ts (add a response interceptor for 401/403/5xx —
  extend only)
- new-ui/src/App.tsx (wrap the T2 routes with the new guards)

FILES FORBIDDEN TO MODIFY
- Everything under backend/

DEPENDENCIES
T3 complete (useAuth must exist).

EXACT TASKS
1. RequireAuth: if useAuth().user is null after loading resolves, redirect to
   /login, preserving the intended destination for post-login redirect.
2. RequireRole({roles}): if user.role not in roles, render ForbiddenScreen
   in-place (not a redirect — the user IS authenticated, just not authorized
   for this).
3. Axios response interceptor in client.ts: on 401 -> trigger a redirect-to-
   login event/callback; on 403 -> trigger a forbidden-screen event/callback;
   on 5xx or network error -> trigger an "unavailable" banner event. Use a
   simple event emitter or React context, not a hard window.location redirect
   inside the interceptor itself (keeps it testable).
4. Wrap CaseListPage, CaseCreatePage, CaseDetailPage with RequireAuth in
   App.tsx.

ACCEPTANCE CRITERIA
- Logged-out user hitting /cases/anything is redirected to /login.
- Logged-in user with wrong role (once role-gating is applied to a route)
  sees ForbiddenScreen in place, no redirect, no blank/broken render.
- Simulating a 403 from the API (mock it in a quick test) shows
  ForbiddenScreen, not a generic error.
- Simulating a 5xx shows UnavailableBanner, not a frozen/blank UI.

TEST COMMANDS
cd new-ui && npm run dev   (manual: logged-out nav, forced 401/403/5xx via
  devtools network throttling or a temporary test route)
cd new-ui && npm run lint

EXPECTED RESULT
All four states (unauthorized/forbidden/expired/unavailable) are visibly
distinct and correct.

STOP CONDITIONS
If RBAC role rules aren't yet defined by Person 1 (i.e. you don't know which
roles should see which routes), stop and flag "WAIT FOR PERSON 1: RBAC role-
to-route mapping" rather than guessing a mapping.
```

### T5 — Case workspace

```
TASK T5 — Case workspace (list / create / detail / trace launch)
Branch: feature/p2-t5-case-workspace

OBJECTIVE
Build case list, case creation, case detail shell, fraud-transaction picker,
trace launch, and the data_mode banner. Build against Person 1's real
/api/v1/cases/* and reworked /api/v1/trace if confirmed live; otherwise
against an explicitly labeled stub, same pattern as T3.

FILES ALLOWED TO MODIFY
- new-ui/src/components/CaseList.tsx (new)
- new-ui/src/components/CaseCreateForm.tsx (new)
- new-ui/src/components/FraudTxPicker.tsx (new)
- new-ui/src/components/DataModeBanner.tsx (new)
- new-ui/src/pages/CaseListPage.tsx, CaseCreatePage.tsx, CaseDetailPage.tsx
  (fill in T2 stubs)
- new-ui/src/api/client.ts (extend: listCases, createCase, getCase,
  startCaseTrace)
- new-ui/src/api/casesStub.ts (new, ONLY if needed, same labeling rule as T3)
- new-ui/src/hooks/useCase.ts (new)

FILES FORBIDDEN TO MODIFY
- Everything under backend/
- new-ui/src/components/HeroGraph.tsx, HeroEmblemNetwork.tsx (later task
  extends these, not this one)

DEPENDENCIES
T4 complete. Confirm with me whether Person 1's /api/v1/cases/* and reworked
/api/v1/trace are live before starting.

EXACT TASKS
1. client.ts additions per the Master Prompt's Cases contract.
2. CaseList: GET /api/v1/cases?mine=true, render list, link each to
   /cases/:caseId.
3. CaseCreateForm: POST /api/v1/cases with {complaint_source, complaint_ref,
   fraud_tx_hash, chain}, navigate to the new case on success.
4. FraudTxPicker: input for a transaction hash (NOT a wallet address — this
   replaces the old victim-wallet flow), basic format validation, wired to
   POST /api/v1/cases/{case_id}/trace.
5. DataModeBanner: reads data_mode from the active trace response, renders
   LIVE/CACHED/UNAVAILABLE distinctly and visibly (not a subtle corner icon).
6. CaseDetailPage: renders case metadata + FraudTxPicker + DataModeBanner as
   the shell; leave graph/findings/copilot/evidence tabs as placeholders for
   later tasks (T7/T9/T10/T11 fill them in).

ACCEPTANCE CRITERIA
- Case list renders only cases the logged-in user is authorized for (per
  backend response — do not client-side filter a broader list).
- Create flow works end-to-end and lands on the new case's detail page.
- Fraud-tx picker rejects an obviously malformed hash before submitting.
- data_mode is visible on the case detail page whenever a trace is active.

TEST COMMANDS
cd new-ui && npm run dev   (manual: list -> create -> detail -> launch trace)
cd new-ui && npm run lint

EXPECTED RESULT
Working case CRUD + trace launch shell, ready for T7/T9/T10/T11 to plug into.

STOP CONDITIONS
If /api/v1/cases/* isn't live, build the UI and stub, then STOP and report
"WAIT FOR PERSON 1: /api/v1/cases/* not confirmed live" rather than treating
the stub as done. If the reworked /api/v1/trace still expects victim_wallet
instead of fraud_tx_hash, stop and report the mismatch — do not silently
adapt the picker to send a wallet address, since that's the exact bug the
locked spec asks to remove.
```

### T6 — R1–R8 Intelligence Engine

```
TASK T6 — R1-R8 Intelligence Engine (backend, deterministic)
Branch: feature/p2-t6-intelligence-engine

OBJECTIVE
Implement R1-R8 (per the Master Prompt's rule definitions) as pure,
deterministic functions over edges[] data, fully unit-tested against a
hand-written fixture. No live Person 1 data required for this task.

FILES ALLOWED TO MODIFY
- backend/intelligence/__init__.py (new package)
- backend/intelligence/rules.py (new — R1-R8 as pure functions)
- backend/intelligence/orchestrator.py (new — runs all rules, assembles
  Finding[] output)
- backend/api/routes_intelligence.py (new)
- backend/tests/test_intelligence_rules.py (new)
- backend/tests/fixtures/edges_fixture.py (new — the hand-written fixture
  matching the frozen edges[] contract)

FILES FORBIDDEN TO MODIFY
- backend/blockchain/, backend/database/schemas.py (read-only import if
  needed, no writes/no schema changes), backend/legal/, backend/neo4j/,
  backend/ml/, backend/scraper/

DEPENDENCIES
The edges[] contract fields (taint_amount, taint_source_tx, evidence_id,
boundary_type) must be agreed with Person 1 in principle (even if not
implemented yet) before writing the fixture — confirm with me if unsure of
current field names/shapes.

EXACT TASKS
1. Write edges_fixture.py: a small, realistic edges[] list exercising each
   rule's boundary condition (e.g. exactly 5 fan-out targets AND exactly 4,
   to prove the >=5 threshold is exact).
2. Implement R1 (rapid pass-through), R2 (peel chain), R3 (fan-out), R4
   (fan-in), R5 (privacy protocol), R8 (exchange exit) as pure functions in
   rules.py, each returning Finding objects per the schema in the Master
   Prompt / Blueprint Section 4.
3. R6 (gas sponsor match): implement the function signature taking
   pre-computed gas-parent-cluster data as an input parameter (do not compute
   clustering yourself) — stub its body to accept the parameter and return
   findings if given cluster data, empty list if not.
4. R7 (bytecode match): implement ONLY the function stub with
   NotImplementedError and a comment referencing this task — do not build
   real logic for it.
5. orchestrator.py: runs R1-R6+R8 (skip R7) over a given trace's edges[],
   returns the combined Finding[] list. Must be deterministic — same input,
   same output, every time (no randomness, no wall-clock-dependent behavior
   beyond what's in the input timestamps).
6. routes_intelligence.py: GET /api/v1/intelligence/findings/{trace_id} and
   POST /api/v1/intelligence/recompute/{trace_id}, reading edges via a
   read-only SQLAlchemy query against Person 1's Trace/Edge model (or, if
   that model doesn't exist yet, against the fixture data with a loud
   TEMPORARY comment, and flag it to me).
7. Unit tests: one boundary-condition test per implemented rule (R1-R6, R8).

ACCEPTANCE CRITERIA
- pytest backend/tests/test_intelligence_rules.py -v passes, one test per
  rule at minimum, each proving the exact threshold (e.g. 5 vs 4).
- Running the orchestrator twice on the same fixture produces byte-identical
  Finding[] output.
- Every Finding's explanation is built from an f-string/template using real
  fixture values — grep the code to confirm no hardcoded prose masquerading
  as a real explanation.

TEST COMMANDS
cd <repo root> && pytest backend/tests/test_intelligence_rules.py -v

EXPECTED RESULT
Working, tested, deterministic rule engine against fixture data, exposed via
its own endpoint.

STOP CONDITIONS
If Person 1's real Edge/Finding persistence model doesn't exist yet when you
reach step 6, implement the endpoint against the fixture, clearly comment it
as temporary, and report "WAIT FOR PERSON 1: Edge/Finding persistence model"
— do not invent a schema for it yourself.
```

### T7 — Findings UI

```
TASK T7 — Findings drawer UI
Branch: feature/p2-t7-findings-ui

OBJECTIVE
Build the findings drawer consuming T6's endpoint, with graph highlighting.

FILES ALLOWED TO MODIFY
- new-ui/src/components/FindingsDrawer.tsx (new)
- new-ui/src/components/FindingCard.tsx (new)
- new-ui/src/api/client.ts (extend: getFindings(traceId))
- new-ui/src/hooks/useFindings.ts (new)
- new-ui/src/components/HeroGraph.tsx — ADDITIVE ONLY: add a new optional
  prop (e.g. highlightedEdgeIds?: string[]) and the rendering logic to apply
  a highlight style when an edge's id is in that array. Do not restructure,
  rename, or remove any existing prop, state, or rendering path in this file.
- new-ui/src/pages/CaseDetailPage.tsx (wire FindingsDrawer into the findings
  tab placeholder from T5)

FILES FORBIDDEN TO MODIFY
- Everything under backend/
- new-ui/src/components/HeroEmblemNetwork.tsx

DEPENDENCIES
T6 complete (endpoint exists and returns real fixture-backed findings). T5
complete (CaseDetailPage shell exists).

EXACT TASKS
1. useFindings(traceId): calls GET /api/v1/intelligence/findings/{trace_id},
   returns {findings, loading, error}.
2. FindingCard: renders rule name, severity, explanation, and a "highlight in
   graph" action.
3. FindingsDrawer: lists FindingCards, manages which finding is currently
   highlighted (local state), passes highlightedEdgeIds down to HeroGraph via
   its new prop.
4. Severity should be visually distinct (e.g. color-coded chip: high/medium/
   low) — reuse existing risk-badge styling patterns already in the codebase
   (check RiskBadge.tsx in the old frontend/ for a visual reference only, do
   not import from frontend/).

ACCEPTANCE CRITERIA
- Selecting a finding in the drawer visibly highlights the correct edges in
  HeroGraph.
- Findings list matches exactly what T6's endpoint returns for the fixture
  trace (no client-side re-deriving or re-computing of findings).
- Existing HeroGraph behavior (pan/zoom/click/whatever it currently supports)
  is unaffected when highlightedEdgeIds is not passed.

TEST COMMANDS
cd new-ui && npm run dev   (manual, against T6's fixture-backed endpoint)
cd new-ui && npm run lint

EXPECTED RESULT
Working findings drawer with graph highlighting, no regression to existing
graph behavior.

STOP CONDITIONS
If HeroGraph.tsx's existing structure makes an additive highlightedEdgeIds
prop genuinely awkward (e.g. it doesn't currently track edges by a stable id
at all), stop and report the specific obstacle rather than restructuring the
file — that decision needs my sign-off since HeroGraph is central and risky
to touch broadly.
```

### T8 — Grounded Copilot backend

```
TASK T8 — Grounded Copilot backend (tools + validator)
Branch: feature/p2-t8-copilot-backend

OBJECTIVE
Implement the Copilot's tool functions, LLM tool-calling loop, and the
citation validator. Test the validator against hand-crafted adversarial LLM
output BEFORE wiring any real LLM call.

FILES ALLOWED TO MODIFY
- backend/copilot/__init__.py (new package)
- backend/copilot/tools.py (new — get_trace_summary, get_finding,
  list_findings, get_edge, get_exit; all read-only DB queries)
- backend/copilot/prompt.py (new — system prompt text per Master Prompt
  constraints)
- backend/copilot/validator.py (new — citation validator)
- backend/copilot/llm_client.py (new — wraps the actual LLM API call; your
  own API key, server-side only, never in any frontend file)
- backend/api/routes_copilot.py (new)
- backend/tests/test_copilot_validator.py (new)
- backend/tests/fixtures/copilot_fixtures.py (new)

FILES FORBIDDEN TO MODIFY
- backend/blockchain/, backend/database/schemas.py (read-only import only),
  backend/legal/, backend/neo4j/, backend/ml/, backend/scraper/,
  backend/intelligence/ (read from it, don't modify its files)

DEPENDENCIES
T6 complete (list_findings/get_finding need real or fixture-backed finding
data to query).

EXACT TASKS
1. tools.py: implement the 5 tools exactly as scoped in the Master Prompt,
   each a plain read-only query function, no LLM involvement.
2. prompt.py: system prompt stating explicitly — only state facts returned by
   a tool call this turn; cite tx_hash/edge_id/finding_id for every specific
   claim; never determine guilt, intent, or legal conclusions.
3. validator.py: given (draft_answer: str, tool_results_this_turn: list) ->
   sanitized_answer. Parses cited IDs from draft_answer, checks each against
   IDs present in tool_results_this_turn, strips any sentence whose citation
   fails. If nothing survives, return None (caller falls back to
   deterministic summary — do not have the validator itself call
   list_findings; keep it a pure string-in/string-out function).
4. Write test_copilot_validator.py FIRST, with hand-crafted adversarial
   inputs: (a) a draft citing a real ID from this turn's results — should
   survive; (b) a draft citing a plausible-looking but absent ID — should be
   stripped; (c) a draft with no citations at all making a specific factual
   claim — should be stripped; (d) a draft that's entirely uncited opinion/
   refusal language (e.g. "I can't determine guilt") — should survive as-is
   since it makes no uncited factual claim.
5. Only after step 4's tests pass, implement llm_client.py and
   routes_copilot.py: POST /api/v1/copilot/query per the Master Prompt's
   contract, GET /api/v1/copilot/health.
6. Explicit test case: prompt "is this wallet owner guilty?" (or equivalent)
   must produce the scoped refusal, not an answer. Add this as its own test.

ACCEPTANCE CRITERIA
- pytest backend/tests/test_copilot_validator.py -v passes, all 4+ adversarial
  cases behave as specified above.
- The guilt-question test case passes.
- grep confirms no API key or secret is hardcoded anywhere in backend/copilot/
  (must come from environment variable only).

TEST COMMANDS
cd <repo root> && pytest backend/tests/test_copilot_validator.py -v

EXPECTED RESULT
Working, validator-tested Copilot backend, safe against citation fabrication.

STOP CONDITIONS
If get_finding/list_findings need a Finding persistence model that doesn't
exist yet beyond T6's fixture, use the same fixture T6 used and report
"WAIT FOR PERSON 1: Finding persistence model" rather than inventing a
different one. If you don't have an LLM API key configured, stop before step
5 and tell me — do not proceed with a hardcoded/placeholder key "to keep
testing."
```

### T9 — Copilot UI

```
TASK T9 — Copilot chat UI
Branch: feature/p2-t9-copilot-ui

OBJECTIVE
Build the Copilot chat panel consuming T8's endpoint, with citation chips and
all fallback states.

FILES ALLOWED TO MODIFY
- new-ui/src/components/CopilotChat.tsx (new)
- new-ui/src/components/CitationChip.tsx (new)
- new-ui/src/hooks/useCopilot.ts (new)
- new-ui/src/api/client.ts (extend: copilotQuery, copilotHealth)
- new-ui/src/pages/CaseDetailPage.tsx (wire CopilotChat into the copilot tab
  placeholder from T5)

FILES FORBIDDEN TO MODIFY
- Everything under backend/

DEPENDENCIES
T8 complete.

EXACT TASKS
1. useCopilot(caseId, traceId): manages conversation state, calls
   copilotQuery, tracks copilotHealth on mount/interval.
2. CopilotChat: message list, input box, disabled state when
   llm_reachable === false with the exact banner text from the Blueprint
   ("Copilot is unavailable. Deterministic findings below are unaffected.").
3. CitationChip: renders each citation from a response, clicking one
   navigates to / highlights the corresponding graph edge or finding (reuse
   T7's highlight mechanism if applicable).
4. When grounded === false / fallback_used === true, visibly tag the message
   as "answered from findings, not AI" per the Blueprint — do not hide this
   distinction.
5. Manually run the guilt-question test case from T8 through this UI end-to-
   end and confirm the refusal renders correctly.

ACCEPTANCE CRITERIA
- Chat works end-to-end against T8's real endpoint.
- llm_reachable: false cleanly disables chat without breaking the rest of the
  case workspace.
- Every citation chip navigates to something real (no dead/no-op chips).
- Fallback-used responses are visibly distinguished from grounded ones.

TEST COMMANDS
cd new-ui && npm run dev   (manual: normal query, guilt-question refusal,
  forced llm_reachable:false state)
cd new-ui && npm run lint

EXPECTED RESULT
Working Copilot chat UI with correct fallback/refusal behavior visible.

STOP CONDITIONS
None expected — this consumes an already-tested backend. If T8's response
shape doesn't match what this task expects, stop and report the mismatch
rather than adapting the UI silently around it.
```

### T10 — Gas-parent / cross-complaint / exit UI

```
TASK T10 — Gas-parent / cross-complaint / exit visualization
Branch: feature/p2-t10-intelligence-visualization

OBJECTIVE
Visualize Person 1's gas-parent-cluster, cross-complaint-match, and exit data.
This task ONLY visualizes — it does not compute any of this data itself.

FILES ALLOWED TO MODIFY
- new-ui/src/components/GasParentClusterView.tsx (new)
- new-ui/src/components/CrossComplaintView.tsx (new)
- new-ui/src/components/ExitCard.tsx (new)
- new-ui/src/api/client.ts (extend: getGasParentClusters,
  getCrossComplaintMatches, getExits)
- new-ui/src/api/intelligenceVizStub.ts (new, ONLY if Person 1's endpoints
  aren't live, same labeling rule as T3)
- new-ui/src/pages/CaseDetailPage.tsx (wire these into their tab placeholders
  from T5)

FILES FORBIDDEN TO MODIFY
- Everything under backend/ (including backend/intelligence/ — R6 in T6 only
  accepts pre-computed cluster data as a parameter, it does not compute
  clustering; this task doesn't touch that either)

DEPENDENCIES
T5 complete. Confirm with me whether Person 1's /gas-parent-clusters,
/cross-complaint-matches, /exits endpoints are live before starting.

EXACT TASKS
1. client.ts additions per the Master Prompt's contract shapes.
2. GasParentClusterView: renders cluster_id, funding_wallet, funded_wallets,
   with a visual grouping (e.g. a halo/border drawn around matched wallets —
   coordinate with T7's highlight mechanism if reusing HeroGraph).
3. CrossComplaintView: renders matched_case_id, shared_wallet_or_parent,
   confidence — a simple list/card view is sufficient, no graph rendering
   required.
4. ExitCard: renders vasp_name, Tier A/B/C badge (visually distinct per
   tier), evidence_ids as linkable references.

ACCEPTANCE CRITERIA
- Each view renders real (or clearly stubbed) data matching the documented
  shapes exactly — no invented fields.
- Tier badges are visually distinct (A/B/C should not look the same).

TEST COMMANDS
cd new-ui && npm run dev   (manual, against real or stub endpoints)
cd new-ui && npm run lint

EXPECTED RESULT
Working visualization for all three, ready to swap from stub to real data
with no component changes once Person 1's endpoints are confirmed live.

STOP CONDITIONS
If any of the three endpoints isn't confirmed live, build against the stub,
then STOP and report "WAIT FOR PERSON 1: <endpoint name>" for each missing
one rather than marking the task complete.
```

### T11 — Evidence / verification / notice UI

```
TASK T11 — Evidence export, verification, and notice draft UI
Branch: feature/p2-t11-evidence-ui

OBJECTIVE
Build the evidence export panel, tamper-evident verification panel, and the
neutral notice draft preview (reworking Section91NoticeModal.tsx once Person
1's rework of the legal notice output is confirmed).

FILES ALLOWED TO MODIFY
- new-ui/src/components/EvidenceExportPanel.tsx (new, or extend
  EvidenceExportModal.tsx if its existing structure fits — your call, but
  don't duplicate functionality)
- new-ui/src/components/EvidenceVerifyPanel.tsx (new)
- new-ui/src/components/NoticeDraftPreview.tsx (new — do not delete
  Section91NoticeModal.tsx yet; build the replacement alongside it)
- new-ui/src/api/client.ts (extend: exportEvidence, verifyEvidence — keep
  existing downloadFreezeNotice until NoticeDraftPreview is verified working)
- new-ui/src/api/evidenceStub.ts (new, ONLY if needed, same labeling rule)
- new-ui/src/pages/CaseDetailPage.tsx (wire into the evidence tab placeholder)

FILES FORBIDDEN TO MODIFY
- Everything under backend/ (the neutral-draft rework of notice_generator.py
  is Person 1's, not yours)

DEPENDENCIES
T5 complete. Confirm with me whether Person 1's evidence export/verify
endpoints and the reworked freeze-notice output are live before starting.

EXACT TASKS
1. client.ts additions per the Master Prompt's Evidence contract.
2. EvidenceExportPanel: export button (disabled per role per T4's guard
   pattern), calls exportEvidence, shows resulting bundle_id/download link.
3. EvidenceVerifyPanel: upload/select a bundle, calls verifyEvidence, clearly
   renders {valid, mismatches} — this powers the "flip one byte, watch it
   flag" demo beat, so the mismatch display must be unambiguous (show file
   name + expected vs actual hash, not just a generic "invalid" message).
4. NoticeDraftPreview: renders whatever the reworked neutral draft output is
   — do not write UI copy implying government authority, court-admissibility,
   or automatic legal effect (per the spec's explicit prohibition on this).

ACCEPTANCE CRITERIA
- Export → verify round-trip works against a real (or stub) bundle.
- A deliberately corrupted bundle is flagged with a specific, legible
  mismatch report, not a generic error.
- NoticeDraftPreview's copy contains no claim of court-admissibility,
  government authority, or automatic legal effect.
- Export button is both role-gated in the UI and (per T4's pattern) will
  still be rejected by the backend for unauthorized roles regardless of UI
  state.

TEST COMMANDS
cd new-ui && npm run dev   (manual: export, verify clean bundle, verify
  tampered bundle, notice preview copy review)
cd new-ui && npm run lint

EXPECTED RESULT
Working evidence export/verify loop and a neutral notice preview, old
Section91NoticeModal.tsx still present but unused pending final swap.

STOP CONDITIONS
If Person 1's evidence endpoints or notice rework aren't confirmed live,
build against stub, then STOP and report "WAIT FOR PERSON 1: <specific
endpoint>" rather than marking complete. Do not delete
Section91NoticeModal.tsx in this task — that's T12's job after everything is
verified.
```

### T12 — Retire old frontend

```
TASK T12 — Retire frontend/ (old Next.js app)
Branch: feature/p2-t12-retire-old-frontend

OBJECTIVE
Delete the old frontend/ Next.js app now that new-ui/ covers everything it
did. This is the LAST task — do not run it until I explicitly confirm every
prior task's acceptance criteria have passed and I've coordinated with Person
1 on shared infra changes.

FILES ALLOWED TO MODIFY
- Delete: frontend/ (entire directory)
- docker-compose.yml — ONLY the frontend service entry, and ONLY after
  explicit confirmation from me that Person 1 has agreed to this change
- README.md — update references to the old frontend, same confirmation
  requirement

FILES FORBIDDEN TO MODIFY
- Everything under backend/
- Any other shared infra file not explicitly listed above

DEPENDENCIES
ALL of T1-T11 complete and their acceptance criteria verified. Explicit
go-ahead from me. Explicit confirmation that Person 1 has no remaining
dependency on frontend/ (e.g. deployment scripts, docs, CI references).

EXACT TASKS
1. Grep the entire repo for any reference to frontend/ (imports, docker
   configs, README, scripts/) outside frontend/ itself, and report the full
   list to me BEFORE deleting anything.
2. Wait for my explicit go-ahead on the list from step 1.
3. Delete frontend/.
4. Update docker-compose.yml and README.md only for the references I
   confirmed in step 2.
5. Full build + smoke test of the consolidated stack (new-ui/ + backend/
   only).

ACCEPTANCE CRITERIA
- Repository builds and runs with only new-ui/ + backend/.
- No dangling reference to frontend/ remains anywhere in configs or docs.
- Nothing outside frontend/ itself was modified beyond what I confirmed.

TEST COMMANDS
Full stack build/run per whatever docker-compose.yml specifies after the
edit, plus cd new-ui && npm run build.

EXPECTED RESULT
Clean, single-frontend repository.

STOP CONDITIONS
Do not proceed past step 1 without my explicit go-ahead, under any
circumstance, even if all other tasks are done. This is a deletion of a
working (if legacy) app and touches shared infra — it is not a task
Antigravity should ever execute autonomously.
```

---

## 4. Person 1 Dependency Checklist

Verify each of these against Apoorv's actual backend before marking the corresponding task complete. "Confirmed" means you've made a real request against his running backend and seen the shape below, not that it's mentioned in a doc.

| Item | Required shape (per Blueprint §3.3/3.4) | Needed by | Status |
|---|---|---|---|
| `edges[]` — `taint_amount` | numeric string, FIFO-attributed to the fraud tx | T6, T7 | ☐ WAIT FOR PERSON 1 |
| `edges[]` — `evidence_id` | `sha256:...` string | T6, T7, T8, T9 | ☐ WAIT FOR PERSON 1 |
| `edges[]` — `boundary_type` | `NONE`\|`EXCHANGE`\|`DEX`\|`MIXER` | T6 (R5, R8) | ☐ WAIT FOR PERSON 1 |
| `Case` model | exists, has `case_id`, authorized-user relationship | T5 | ☐ WAIT FOR PERSON 1 |
| `data_mode` field | `LIVE`\|`CACHED`\|`UNAVAILABLE` on trace/edge responses | T5, T7, T9 | ☐ WAIT FOR PERSON 1 |
| Auth endpoints | `/api/v1/auth/login`, `/logout`, `/me`, httpOnly cookie | T3 | ☐ WAIT FOR PERSON 1 |
| RBAC enforcement | 403 on unauthorized case/role action, role field on `/auth/me` | T3, T4, T11 | ☐ WAIT FOR PERSON 1 |
| `/exits` | `[{exit_id, wallet, vasp_name, tier, evidence_ids, confidence}]` | T6 (R8), T10 | ☐ WAIT FOR PERSON 1 |
| `/gas-parent-clusters` | `[{cluster_id, funding_wallet, funded_wallets, evidence_ids}]` | T6 (R6), T10 | ☐ WAIT FOR PERSON 1 |
| `/cross-complaint-matches` | `[{matched_case_id, shared_wallet_or_parent, confidence}]` | T10 | ☐ WAIT FOR PERSON 1 |
| Evidence export/verify | `POST .../evidence/export`, `GET .../manifest`, `POST .../verify` | T11 | ☐ WAIT FOR PERSON 1 |
| Reworked freeze-notice | neutral draft, no I4C letterhead/"court-admissible" claims | T11 | ☐ WAIT FOR PERSON 1 |
| WS `DATA_MODE_CHANGED` | optional — poll `data_mode` from trace GET if absent | T5, T9 | ☐ Optional |
| Fabrication purge | `exchange_crawler.py`'s 500 hash-generated labels removed, USDT-mislabel fixed | T6 (R8), T9 (exit citations) | ☐ WAIT FOR PERSON 1 — don't demo R8/exit citations until this lands |
| R7 bytecode hash source | confirm in/out of scope | T6 | ☐ Needs explicit decision either way |

---

## 5. Testing Plan

**Frontend**
- Manual acceptance-criteria walkthrough per task (specified in each T-prompt above) — this is the primary testing method given hackathon time constraints and the repo's current lack of any frontend test infra.
- If time allows: lightweight Vitest unit tests for `RequireAuth`/`RequireRole` logic only (pure functions of `{user, roles}` → render decision) — highest safety-per-effort ratio, not full component/E2E coverage.

**Intelligence unit tests** (`backend/tests/test_intelligence_rules.py`)
- One boundary-condition test per rule (R1–R6, R8): the exact threshold value and one-below-threshold, per T6.
- One determinism test: run the orchestrator twice on the same fixture, assert identical output.
- One "no false positive" test per rule: a fixture that should NOT trigger the rule, confirming it doesn't.

**Copilot hallucination/citation tests** (`backend/tests/test_copilot_validator.py`)
- Valid-citation draft → survives unstripped.
- Fabricated-ID draft → stripped.
- Uncited factual claim → stripped.
- Uncited non-factual refusal ("I can't determine guilt...") → survives.
- The explicit guilt-question end-to-end test (T8/T9).
- Empty-after-stripping → deterministic fallback triggers, not a re-prompt.

**Security tests**
- Unauthenticated request to a protected route/endpoint → `401`, frontend redirects to login (not a broken render).
- Authenticated-but-unauthorized-for-this-case request → `403`, frontend shows `ForbiddenScreen`.
- Case-ID tampering in the URL/API call → `403`, never leaks another user's case data.
- Export action by a role without export permission → rejected by backend regardless of whether the UI button was somehow enabled.
- Session expiry → `401` on next protected call, redirect to login, no stale data shown.
- Grep built frontend bundle for any API/LLM key string before shipping.

**Integration tests**
- Each of T5/T8/T10/T11's stub-vs-real swap: once Person 1's endpoint is confirmed live, re-run that task's acceptance criteria against the real endpoint, not just the stub.
- Full WS event flow: launch a trace, confirm `HOP_DISCOVERED` → graph updates live, `TRACE_COMPLETED` → findings/copilot become queryable.

**Final end-to-end demo test** (run this last, on the one shared reproducible demo case per the locked spec's "Shared" rules)
1. Log in as an Investigator.
2. Create a case from a real recorded fraud transaction hash.
3. Launch trace, watch `data_mode` and live graph update via WebSocket.
4. Open Findings drawer, confirm R1–R8 findings cite real edges.
5. Ask the Copilot a grounded question, confirm citations are clickable and correct; ask the guilt-question, confirm refusal.
6. View Gas-Parent/Cross-Complaint/Exit tabs, confirm Tier badges render.
7. Export evidence, then deliberately corrupt the downloaded bundle and re-verify, confirm the mismatch is flagged.
8. Preview the notice draft, confirm no false-authority language.
9. Log out mid-session, confirm redirect; try re-accessing the case URL directly, confirm redirect to login not a stale render.
10. Kill the provider connection (or ask Person 1 to simulate it) mid-trace, confirm the UI shows `UNAVAILABLE` honestly rather than freezing.

---

## 6. Git Workflow

- **Branching:** trunk-based, short-lived feature branches, one per task: `feature/p2-t<N>-<slug>` (already specified in each T-prompt above). Merge to `main` via PR, not direct push.
- **Commit granularity:** one commit per meaningful sub-step within a task (e.g. "add client.ts methods", "implement RequireAuth", "add unit tests") rather than one giant commit per task — makes review and rollback cheap.
- **Before opening a PR:** run the task's test command and confirm acceptance criteria pass; note any `WAIT FOR PERSON 1` flags in the PR description explicitly, don't bury them in code comments only.
- **Shared-file discipline:** `docker-compose.yml`, `.env.example`, `README.md`, and anything under `backend/database/schemas.py` are Person-1-owned or shared. Never edit them in a Person-2 branch without first pinging Apoorv — even a one-line change here can conflict with work he's doing in parallel.
- **Never rebase or force-push over `main` or over Apoorv's branches.** If your branch falls behind `main`, merge `main` into your branch (not the reverse), resolve conflicts locally, and re-run tests before continuing.
- **Review boundary:** either of you should be able to review the other's PR by checking two things — did it touch only files it was allowed to touch (per that task's "files allowed/forbidden" list), and do the tests it claims to run actually exist and pass. A PR that touches a forbidden file is a hard block, not a nitpick.
- **Integration checkpoints:** after T3 (auth), T5 (cases), T6+T8 (intelligence+copilot backends), and before T12 (retirement), do a short live sync with Apoorv rather than relying only on async PR review — these are the points where contract mismatches are most likely to surface.
- **Tagging:** tag a commit right before T12 runs (e.g. `pre-frontend-retirement`) so there's a clean rollback point if the consolidation reveals a missed dependency on the old `frontend/` app.

---

*This document sequences `TraceX_Person2_Engineering_Blueprint.md` — it does not alter its scope, architecture, or contracts. Any conflict between the two should be resolved in the Blueprint's favor; update this document to match, not the other way around.*
