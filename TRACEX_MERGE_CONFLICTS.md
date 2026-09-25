# TRACEX — MERGE CONFLICTS & CONTRACT ALIGNMENT MANUAL
**Integration Coordinator:** Antigravity  
**Authors:** Person 1 (Apoorv) & Person 2 (Anvesh)  
**Rule:** DO NOT resolve conflicts automatically. Review each discrepancy, assign ownership, and resolve during the designated integration phase.

---

## 1. Summary of Identified Conflicts

A total of **9 architectural, schema, and configuration conflicts** were detected between Person 1's backend/data implementation and Person 2's frontend/intelligence implementation. None of these require rewriting completed code; all require targeted **INTEGRATION FIXES** at module boundaries.

---

## 2. Detailed Conflict Registry

### CONFLICT 1: Trace Entry Point Schema (`victim_wallet` vs `fraud_tx_hash`)
- **PERSON 1 VERSION:**  
  `backend/blockchain/models.py` (`TraceRequest`) requires `victim_wallet: str`.  
  `backend/blockchain/tracer.py` traces forward from `source_wallet`.
- **PERSON 2 VERSION:**  
  `new-ui/src/components/FraudTxPicker.tsx` and execution contract require `fraud_tx_hash: str` (regex `^0x[a-fA-F0-9]{64}$`).
- **RECOMMENDED INTEGRATION:**  
  Add `fraud_tx_hash: str` to `TraceRequest`. Keep `victim_wallet: Optional[str] = None` for backward compatibility. In `tracer.py`, resolve the transaction via RPC to extract the culprit/recipient address, and begin forward tracing from there.
- **WHY:**  
  A victim's wallet contains numerous unrelated benign transfers. Forensic investigations must anchor on the specific reported fraud transaction hash.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv) in `backend/blockchain/models.py` and `tracer.py`.
- **BLOCKING?** **YES** (Blocks live trace triggering from UI).

---

### CONFLICT 2: Edge Forensic Metadata Fields
- **PERSON 1 VERSION:**  
  `backend/blockchain/models.py` (`HopRecord`) returns `{from, to, value, tx_hash, asset, chain, timestamp, hop_number}`.
- **PERSON 2 VERSION:**  
  `new-ui/src/types.ts` and `backend/intelligence/rules.py` expect edges to contain:  
  `{edge_id, from, to, value, asset, timestamp, hop_number, taint_amount, taint_source_tx, evidence_id, boundary_type, data_mode}`.
- **RECOMMENDED INTEGRATION:**  
  In `backend/blockchain/tracer.py`, ensure every generated edge dictionary includes:
  - `edge_id: str` (UUID or `tx_hash:from:to`)
  - `taint_amount: float` (populated by FIFO taint engine or fallback to `value`)
  - `taint_source_tx: str` (originating fraud tx hash)
  - `evidence_id: str` (`sha256(tx_hash + str(taint_amount))`)
  - `boundary_type: str` (`"NONE" | "EXCHANGE" | "DEX" | "MIXER"`)
- **WHY:**  
  Person 2's R1–R8 Intelligence Engine and evidence export cannot highlight edges or compute cryptographic hashes without these fields.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv) in `backend/blockchain/tracer.py`.
- **BLOCKING?** **YES** (Blocks live R1–R8 findings on real traces).

---

### CONFLICT 3: Data Mode Transparency & Honesty
- **PERSON 1 VERSION:**  
  `backend/blockchain/rpc_client.py` silently returns synthetic mock transfers when live Alchemy or Blockscout APIs are unavailable, without flagging the response.
- **PERSON 2 VERSION:**  
  `new-ui/src/components/DataModeBanner.tsx` demands explicit top-level `data_mode: "LIVE" | "CACHED" | "SIMULATION" | "UNAVAILABLE"`.
- **RECOMMENDED INTEGRATION:**  
  Update `rpc_client.py` to flag return payloads with `data_mode`. If mock data is used, set `data_mode = "SIMULATION"`. Propagate this field to all API responses.
- **WHY:**  
  Product integrity and hackathon anti-hallucination requirement: the UI must honestly disclose whether data is live, cached, or simulated.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv) in `backend/blockchain/rpc_client.py` and `backend/api/routes.py`.
- **BLOCKING?** **YES** (Demo compliance requirement).

---

### CONFLICT 4: Database Entities — User & Case Tables
- **PERSON 1 VERSION:**  
  `backend/database/schemas.py` only defines `Complaint`, `Trace`, `WalletLabel`, `ClusteringResult`, `FreezeNotice`. There are no `User` or `Case` tables.
- **PERSON 2 VERSION:**  
  `new-ui/` implements a complete case workspace (`CaseListPage`, `CaseDetailPage`, `CaseCreatePage`) expecting case metadata (`id`, `case_number`, `crime_category`, `fraud_tx_hash`, `status`, `assigned_to`).
- **RECOMMENDED INTEGRATION:**  
  Add `User` and `Case` models to `backend/database/schemas.py` and expose `/api/v1/cases` endpoints. Existing `Complaint` records can be mapped 1:1 to `Case`.
- **WHY:**  
  Enables the frontend case workspace to transition from `casesStub.ts` to live database persistence.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv) in `backend/database/schemas.py` and `backend/api/routes.py`.
- **BLOCKING?** **NO** for initial boot (P2 has stub toggle), **YES** for end-to-end case saving.

---

### CONFLICT 5: Fabricated Labels & USDT Mislabeling in OSINT Scraper
- **PERSON 1 VERSION:**  
  `backend/scraper/exchange_crawler.py` seeds 500 algorithmically generated fake wallet addresses and labels the Tether USDT token contract (`0xdac17f958d2ee523a2206206994597c13d831ec7`) as "WazirX Hot Wallet".
- **PERSON 2 VERSION:**  
  `new-ui` enforces strict label accuracy, distinguishing between token smart contracts and actual VASP custodial hot wallets.
- **RECOMMENDED INTEGRATION:**  
  Purge the 500 synthetic generated addresses from `exchange_crawler.py`. Correct the label for `0xdac17f958...` to `Smart Contract: Tether USD (USDT)`. Keep only verified public VASP deposit wallets.
- **WHY:**  
  Mislabeled token contracts and fake wallets destroy forensic credibility during live demonstration.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv) in `backend/scraper/exchange_crawler.py`.
- **BLOCKING?** **YES**.

---

### CONFLICT 6: Legal Notice Copy & Government Emblem Usage
- **PERSON 1 VERSION:**  
  `backend/legal/notice_generator.py` prints unauthorized Government of India / I4C letterhead and claims automated "Section 65B Court Admissibility".
- **PERSON 2 VERSION:**  
  `new-ui/src/components/NoticeDraftPreview.tsx` implements a neutral statutory Section 91 CrPC notice draft with a watermark disclaimer: *"DRAFT FORM FOR LAW ENFORCEMENT REVIEW — REQUIRES COMPETENT POLICE SIGNATURE BEFORE SERVING"*.
- **RECOMMENDED INTEGRATION:**  
  Adopt Person 2's neutral administrative template and disclaimer wording in `backend/legal/notice_generator.py`. Remove unauthorized national emblems.
- **WHY:**  
  Claiming automated court certification or printing unauthorized official state emblems violates Indian statutory evidence standards and hackathon rules.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv) in `backend/legal/notice_generator.py`.
- **BLOCKING?** **YES**.

---

### CONFLICT 7: Router Inclusion in `backend/main.py`
- **PERSON 1 VERSION:**  
  `backend/main.py` only imports and mounts `api_router` from `backend.api.routes`.
- **PERSON 2 VERSION:**  
  Person 2 implemented `backend/api/routes_intelligence.py` and `backend/api/routes_copilot.py`.
- **RECOMMENDED INTEGRATION:**  
  Add `from backend.api.routes_intelligence import router as intelligence_router` and `from backend.api.routes_copilot import router as copilot_router` into `backend/main.py` and call `app.include_router()`.
- **WHY:**  
  Exposes Person 2's R1–R8 Intelligence Engine and Grounded Copilot endpoints over HTTP.
- **WHO SHOULD CHANGE IT:** Person 1 (or Integration Coordinator during Phase 1 merge).
- **BLOCKING?** **YES** (Blocks UI from calling live intelligence and copilot routes).

---

### CONFLICT 8: Python Environment Dependency (`scikit-learn`)
- **PERSON 1 VERSION:**  
  Declared in `backend/requirements.txt`, but not installed in the Windows Python 3.14 global environment, causing test collection errors in `test_tracer.py`, `test_risk_scorer.py`, `test_integration.py`.
- **PERSON 2 VERSION:**  
  Intelligence Engine and Copilot Validator are pure Python (31/31 unit tests pass in 1.38s with zero ML dependencies).
- **RECOMMENDED INTEGRATION:**  
  Install `scikit-learn` in the Python virtual environment (`pip install scikit-learn`), or wrap `sklearn` imports with try/except fallbacks in `risk_scorer.py`.
- **WHY:**  
  Ensures all backend tests collect and execute cleanly.
- **WHO SHOULD CHANGE IT:** Person 1 (Apoorv).
- **BLOCKING?** **NO** for frontend/intelligence; **YES** for backend test suite.

---

### CONFLICT 9: Frontend Architecture — Legacy `frontend/` vs Modern `new-ui/`
- **PERSON 1 VERSION:**  
  Initial commit included Next.js 14 `frontend/` with Cytoscape and WebSocket trace form.
- **PERSON 2 VERSION:**  
  Migrated entire application to Vite 6 + React 19 `new-ui/` and retired `frontend/` in commit `90ccc7b` (tag `pre-frontend-retirement`).
- **RECOMMENDED INTEGRATION:**  
  Retain `new-ui/` as the single canonical frontend. Update `docker-compose.yml` frontend service to build from `new-ui/`.
- **WHY:**  
  Consolidates development on a single, clean, fast frontend with 0 lint errors and instant hot-reloading.
- **WHO SHOULD CHANGE IT:** Person 1 updates `docker-compose.yml` to match Person 2's retirement.
- **BLOCKING?** **NO** (Already executed in git branch `feature/p2-t12-retire-old-frontend`).
