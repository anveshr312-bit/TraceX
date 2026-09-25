# TRACEX — PERSON 1 (APOORV) PHASE CHECKLIST
**Role:** Backend, Blockchain Forensics, Data Layer, Taint Attribution, ML/Clustering, Legal Services  
**Branch Convention:** `feature/p1-phase-<number>-<description>`  
**Base Branch:** `main` (or synced feature branch)

---

## Pre-Flight Checklist
- [ ] Working directory: repository root (`TraceX/`)
- [ ] Python virtual environment active: `.\venv\Scripts\activate` or `source venv/bin/activate`
- [ ] Python dependencies installed: `pip install -r backend/requirements.txt`
- [ ] Local tests running cleanly: `pytest backend/tests/`

---

## Phase 0: Baseline & Repository Safety
**Goal:** Confirm clean backend test suite, verify environment configuration, and create safety baseline branch.
- [ ] **Task 0.1:** Pull latest `main` branch:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/p1-phase-0-baseline
  ```
- [ ] **Task 0.2:** Run existing backend test suite to verify baseline:
  ```bash
  pytest backend/tests/
  ```
- [ ] **Task 0.3:** Verify `.env.example` contains required keys (`ALCHEMY_API_KEY`, `ETHERSCAN_API_KEY`, `NEO4J_URI`, `NEO4J_PASSWORD`, `JWT_SECRET`).
- [ ] **Commit & Push:**
  ```bash
  git commit --allow-empty -m "chore(p1-p0): establish person 1 baseline safety branch"
  git push -u origin feature/p1-phase-0-baseline
  ```

---

## Phase 1: Contract Freeze & Contract Alignment
**Goal:** Align backend schemas in `backend/api/` with the unified contracts specified in `TraceX_Person2_Antigravity_Execution_Package.md` §3.
- [ ] **Task 1.1:** Update Pydantic schemas in `backend/api/` (or `backend/schemas/`):
  - [ ] Add `fraud_tx_hash: str` (regex `^0x[a-fA-F0-9]{64}$`) to `TraceRequest`.
  - [ ] Retain `victim_wallet: Optional[str]` for backward compatibility.
  - [ ] Add `data_mode: Literal["LIVE", "CACHED", "SIMULATION", "UNAVAILABLE"]` to all top-level responses.
  - [ ] Add forensic edge fields:
    - `edge_id: str`
    - `taint_amount: float`
    - `taint_source_tx: str`
    - `evidence_id: str` (format: `sha256:...`)
    - `boundary_type: Literal["NONE", "EXCHANGE", "DEX", "MIXER"]`
- [ ] **Task 1.2:** Update `backend/scraper/exchange_crawler.py`:
  - [ ] Remove the 500 fake deterministic generated wallet addresses.
  - [ ] Correct the false label mapping: ensure Tether USDT token contract (`0xdac17f958d2ee523a2206206994597c13d831ec7`) is labeled as `Smart Contract: USDT Token`, NOT `WazirX Hot Wallet`.
  - [ ] Keep only verified public VASP hot wallets (Binance, WazirX, CoinDCX, Kraken, Tornado Cash router).
- [ ] **Task 1.3:** Run contract tests:
  ```bash
  pytest backend/tests/test_api_schemas.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-1-contract-freeze
  git add backend/api/ backend/scraper/
  git commit -m "feat(p1-p1): freeze pydantic schemas and purge fabricated labels"
  git push -u origin feature/p1-phase-1-contract-freeze
  ```
- [ ] **Hand-off to Person 2:** Notify Person 2 that schemas match §3 specifications.

---

## Phase 2: Auth & Case Persistence Backend
**Goal:** Implement database persistence for users and cases with JWT/cookie authentication.
- [ ] **Task 2.1:** Update `backend/database/schemas.py` (SQLAlchemy):
  - [ ] Define `User` model: `id`, `username`, `hashed_password`, `role` (`investigator`, `analyst`, `admin`), `created_at`.
  - [ ] Define `Case` model: `id`, `case_number`, `victim_wallet`, `fraud_tx_hash`, `crime_category`, `status`, `assigned_to`, `created_at`.
- [ ] **Task 2.2:** Implement Auth endpoints in `backend/api/routes_auth.py`:
  - [ ] `POST /api/v1/auth/login` -> returns JWT access token and user role.
  - [ ] `GET /api/v1/auth/me` -> returns current authenticated user profile.
  - [ ] `POST /api/v1/auth/logout` -> invalidates session/cookie.
- [ ] **Task 2.3:** Implement Case endpoints in `backend/api/routes_cases.py`:
  - [ ] `GET /api/v1/cases` -> lists cases filtered by assigned user or role.
  - [ ] `POST /api/v1/cases` -> creates new case with `fraud_tx_hash` validation.
  - [ ] `GET /api/v1/cases/{case_id}` -> retrieves case metadata and trace summary.
- [ ] **Task 2.4:** Write database migration / initialization script in `backend/database/init_db.py` to seed default accounts (`demo_investigator`, `demo_analyst`, `demo_admin`).
- [ ] **Task 2.5:** Run tests:
  ```bash
  pytest backend/tests/test_auth.py backend/tests/test_cases.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-2-auth-cases
  git add backend/database/ backend/api/ backend/tests/
  git commit -m "feat(p1-p2): add User/Case models and auth/case endpoints"
  git push -u origin feature/p1-phase-2-auth-cases
  ```
- [ ] **Hand-off to Person 2:** Person 2 can toggle `USE_AUTH_STUB = false` and `USE_CASES_STUB = false`.

---

## Phase 3: Real Fraud Transaction Tracing Engine
**Goal:** Ingest and trace transactions starting strictly from `fraud_tx_hash` with honest data mode tagging.
- [ ] **Task 3.1:** Update `backend/blockchain/rpc_client.py`:
  - [ ] If Alchemy / RPC responds with live data -> set `data_mode = "LIVE"`.
  - [ ] If falling back to local cache or Blockscout archive -> set `data_mode = "CACHED"`.
  - [ ] If mock/synthetic fallback is active -> strictly set `data_mode = "SIMULATION"`.
  - [ ] Never represent simulated transactions as live on-chain data.
- [ ] **Task 3.2:** Update `backend/blockchain/tracer.py`:
  - [ ] Refactor `trace_transaction(fraud_tx_hash: str, max_depth: int)`:
    - Root node is the transaction recipient (culprit/deposit address).
    - Traverse outgoing transactions forward up to `max_depth` hops (default: 3 to 5).
    - Halt branch expansion when a node matches an exchange deposit address, Tornado Cash pool, or DEX router.
- [ ] **Task 3.3:** Return Cytoscape graph JSON conforming to the contract:
  - Nodes: `id`, `label`, `entity_type`, `risk_score`, `cluster_id`, `data_mode`.
  - Edges: `source`, `target`, `value_eth`, `tx_hash`, `timestamp`, `edge_id`, `boundary_type`.
- [ ] **Task 3.4:** Run tracer tests:
  ```bash
  pytest backend/tests/test_tracer.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-3-tx-tracing
  git add backend/blockchain/ backend/api/
  git commit -m "feat(p1-p3): fraud-tx entrypoint tracing with explicit data_mode"
  git push -u origin feature/p1-phase-3-tx-tracing
  ```

---

## Phase 4: FIFO Taint Attribution Engine
**Goal:** Implement first-in, first-out (FIFO) accounting for stolen fund propagation across hops.
- [ ] **Task 4.1:** Implement `backend/blockchain/taint.py`:
  - [ ] Input: Initial stolen amount \( A_0 \) at `fraud_tx_hash`.
  - [ ] On each hop \( i \), sort outgoing transactions by block number / timestamp (FIFO).
  - [ ] Attribute taint to outgoing transfers up to the received stolen balance.
  - [ ] If transfer exceeds remaining taint, attribute `taint_amount = remaining_taint` and set remaining to 0.
  - [ ] Compute `evidence_id = sha256(tx_hash + str(taint_amount) + str(timestamp))`.
- [ ] **Task 4.2:** Integrate `taint.py` into `tracer.py`:
  - [ ] Attach `taint_amount`, `taint_source_tx`, and `evidence_id` to every edge.
- [ ] **Task 4.3:** Add unit tests verifying:
  - Direct 1:1 forward transfer carries 100% taint.
  - Split transfers (e.g., 60/40) receive correct proportional FIFO taint.
  - Clean funds in target wallet before stolen deposit are excluded from taint.
  ```bash
  pytest backend/tests/test_taint.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-4-taint-attribution
  git add backend/blockchain/ backend/tests/
  git commit -m "feat(p1-p4): add FIFO taint propagation and evidence_id generation"
  git push -u origin feature/p1-phase-4-taint-attribution
  ```

---

## Phase 5: Intelligence Engine R1–R8 Backend Hookup
**Goal:** Connect Person 2's deterministic rule engine (`backend/intelligence/engine.py`) to the trace pipeline.
- [ ] **Task 5.1:** Review Person 2's pure rule definitions in `backend/intelligence/`:
  - `rapid_passthrough.py` (R1)
  - `peel_chain.py` (R2)
  - `fan_out.py` (R3)
  - `fan_in.py` (R4)
  - `mixer_interaction.py` (R5)
  - `gas_sponsor.py` (R6)
  - `exchange_deposit.py` (R8)
- [ ] **Task 5.2:** In `backend/api/routes.py`, call `evaluate_all_rules(graph)` at the conclusion of every trace:
  - Append findings array: `[{"rule_id": "R1", "rule_name": "...", "confidence": 0.95, "matched_edges": [...], "evidence_ids": [...]}]`.
- [ ] **Task 5.3:** Run intelligence tests:
  ```bash
  pytest backend/tests/test_intelligence_engine.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-5-intelligence-hookup
  git add backend/api/ backend/intelligence/
  git commit -m "feat(p1-p5): integrate R1-R8 rule evaluation into trace pipeline"
  git push -u origin feature/p1-phase-5-intelligence-hookup
  ```
- [ ] **Hand-off to Person 2:** Graph response now includes live `findings[]` matching Person 2's schema.

---

## Phase 6: Live Graph Streaming & Performance
**Goal:** Ensure low-latency trace retrieval and optional Server-Sent Events (SSE) for multi-hop graph expansion.
- [ ] **Task 6.1:** Optimize `backend/blockchain/tracer.py` queries:
  - Cache intermediate RPC calls using SQLite or in-memory LRU cache (`@lru_cache(maxsize=1024)`).
  - Ensure graph endpoints respond within `< 2.5s` for 3-hop traces.
- [ ] **Task 6.2:** Ensure Cytoscape response format includes node coordinates or layout-ready structure.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-6-graph-streaming
  git add backend/blockchain/ backend/api/
  git commit -m "perf(p1-p6): optimize tracer response times and add query caching"
  git push -u origin feature/p1-phase-6-graph-streaming
  ```

---

## Phase 7: Exits, Gas Clusters & Cross-Complaints Data
**Goal:** Deliver backend aggregation for off-ramps, gas sponsors, and multi-case correlation.
- [ ] **Task 7.1:** Add endpoint `GET /api/v1/cases/{case_id}/exits`:
  - Identify terminal nodes categorized as Exchanges (`boundary_type == "EXCHANGE"`).
  - Return `exchange_name`, `tier` (`TIER_A`, `TIER_B`, `TIER_C`), `deposit_address`, `amount_eth`, `estimated_inr`, `status` (`FROZEN`, `PENDING_NOTICE`, `SETTLED`).
- [ ] **Task 7.2:** Add endpoint `GET /api/v1/cases/{case_id}/gas-clusters`:
  - Correlate addresses sharing the same first-in funding transaction or gas sponsor (`rule_id == "R6"`).
  - Return clusters: `sponsor_address`, `funded_addresses`, `total_sponsored_eth`.
- [ ] **Task 7.3:** Add endpoint `GET /api/v1/cases/{case_id}/cross-complaints`:
  - Query DB for other complaints containing any overlapping wallet address or transaction hash.
  - Return matching FIR numbers, dates, police stations, and shared entities.
- [ ] **Task 7.4:** Run tests:
  ```bash
  pytest backend/tests/test_exits.py backend/tests/test_cross_complaints.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-7-exits-clusters
  git add backend/api/ backend/database/
  git commit -m "feat(p1-p7): add exits, gas clusters, and cross-complaints endpoints"
  git push -u origin feature/p1-phase-7-exits-clusters
  ```
- [ ] **Hand-off to Person 2:** Person 2 can connect `ExitCard.tsx`, `GasParentClusterView.tsx`, and `CrossComplaintView.tsx` to live backend endpoints.

---

## Phase 8: Grounded AI Copilot Backend
**Goal:** Implement citation validation, judicial guilt refusal, and deterministic fallback in the Copilot endpoint.
- [ ] **Task 8.1:** Review `backend/copilot/guardrails.py` and `backend/copilot/agent.py`:
  - [ ] Enforce regex citation check: every declarative statement must cite `[tx:0x...]`, `[edge:...]`, or `[finding:R...]`.
  - [ ] Strip or reject any statement lacking verified citations.
  - [ ] Intercept questions asking "Is the suspect guilty?" or "Did X commit the crime?" and return the mandatory judicial disclaimer:
    > "TraceX is an investigative attribution aid and does not make judicial determinations of legal guilt or criminal intent. The evidence indicates funds flowed through address X."
  - [ ] When LLM API key is missing or calls fail, fall back to pure deterministic graph summarizer.
- [ ] **Task 8.2:** Add endpoint `POST /api/v1/cases/{case_id}/copilot/chat`:
  - Body: `{"message": str, "context": {"trace_id": str, "selected_node": Optional[str]}}`.
  - Response: `{"response": str, "citations": [...], "suggested_actions": [...]}`.
- [ ] **Task 8.3:** Run Copilot tests:
  ```bash
  pytest backend/tests/test_copilot.py
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-8-copilot-backend
  git add backend/copilot/ backend/api/
  git commit -m "feat(p1-p8): implement grounded copilot endpoint with citation guardrails"
  git push -u origin feature/p1-phase-8-copilot-backend
  ```

---

## Phase 9: Evidence Bundle & Legal Notice Backend
**Goal:** Deliver Section 65B/63 BSA cryptographic bundle generation and neutral administrative notice export.
- [ ] **Task 9.1:** Implement `backend/legal/bundle_generator.py`:
  - [ ] Assemble JSON package containing: `case_metadata`, `nodes`, `edges`, `findings`, `taint_graph`, `export_timestamp`, `investigator_id`.
  - [ ] Compute canonical SHA-256 hash of the JSON content.
  - [ ] Return both JSON bundle and hash.
- [ ] **Task 9.2:** Rework `backend/legal/notice_generator.py`:
  - [ ] **REMOVE** unauthorized Government of India letterhead, national emblems, and claims of court admissibility.
  - [ ] Replace with a neutral administrative template:
    - Title: "INVESTIGATIVE INFORMATION REQUEST / SECTION 91 CrPC NOTICE DRAFT"
    - Clear disclaimer: "DRAFT FORM FOR LAW ENFORCEMENT OFFICER REVIEW — REQUIRES COMPETENT POLICE SIGNATURE BEFORE SERVING".
    - Populate recipient exchange compliance contact, flagged wallet address, transaction hashes, and freeze request details.
- [ ] **Task 9.3:** Add endpoint `POST /api/v1/cases/{case_id}/evidence/bundle` and `POST /api/v1/cases/{case_id}/notice/pdf`.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-9-evidence-legal
  git add backend/legal/ backend/api/
  git commit -m "feat(p1-p9): implement evidence bundle hashing and neutral notice draft"
  git push -u origin feature/p1-phase-9-evidence-legal
  ```

---

## Phase 10: Security, RBAC & Audit Logging Backend
**Goal:** Enforce JWT role verification and tamper-evident audit logging for forensic actions.
- [ ] **Task 10.1:** Implement RBAC middleware in `backend/api/deps.py`:
  - `require_role(["investigator", "admin"])` for case creation and notice generation.
  - `require_role(["admin"])` for user management and raw cryptographic bundle signing.
  - `analyst` restricted to read-only queries and Copilot questions.
- [ ] **Task 10.2:** Create `AuditLog` table in `backend/database/schemas.py`:
  - Fields: `id`, `user_id`, `action` (`EXPORT_BUNDLE`, `GENERATE_NOTICE`, `EXECUTE_TRACE`), `case_id`, `ip_address`, `timestamp`.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-10-security-audit
  git add backend/api/ backend/database/
  git commit -m "feat(p1-p10): enforce server-side RBAC and forensic audit logging"
  git push -u origin feature/p1-phase-10-security-audit
  ```

---

## Phase 11: Resilience, Mock Purge & RPC Fallbacks
**Goal:** Finalize safe offline demo modes and eliminate remaining synthetic artifacts.
- [ ] **Task 11.1:** Ensure all offline demo seeds in `backend/data/` or database fixtures are explicitly flagged with `data_mode = "CACHED"` or `data_mode = "SIMULATION"`.
- [ ] **Task 11.2:** Verify system starts cleanly without active internet connection if demo cache is present.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p1-phase-11-resilience
  git add backend/
  git commit -m "chore(p1-p11): configure resilient RPC fallback and offline fixtures"
  git push -u origin feature/p1-phase-11-resilience
  ```

---

## Phase 12: Final Integration & Demo Freeze
**Goal:** Full end-to-end integration pass with Person 2's UI, final code freeze, and tag.
- [ ] **Task 12.1:** Execute end-to-end walkthrough:
  1. Login with demo account.
  2. Input test transaction `0x4e036573a5fa56f70040...`.
  3. Verify live graph generation with FIFO taint on edges.
  4. Verify R1–R8 findings appear.
  5. Ask Copilot guilt question and verify refusal.
  6. Export evidence bundle and verify SHA-256 hash.
- [ ] **Task 12.2:** Tag final release:
  ```bash
  git checkout main
  git merge feature/p1-phase-12-demo-freeze
  git tag -a v1.0.0-final -m "TraceX Final Hackathon Submission"
  git push origin v1.0.0-final
  ```
