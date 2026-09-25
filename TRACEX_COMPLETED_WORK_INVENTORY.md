# TRACEX — COMPLETED WORK INVENTORY
**Integration Analysis Date:** September 2026  
**Integration Coordinator:** Antigravity  
**Authors:** Person 1 (Apoorv) & Person 2 (Anvesh)  
**Repository:** `https://github.com/anveshr312-bit/TraceX.git` (Fork / Shared Coordination) | `https://github.com/apoorvgarewal07/TraceX.git` (Origin)

---

## 1. Inventory Summary & Categorization Methodology

This inventory catalogs the **exact, existing implementations** completed by Person 1 (Apoorv) and Person 2 (Anvesh).
Every major file, package, component, and configuration has been audited from the filesystem, AST, and git commit history.

### Ownership Key:
- **Person 1 (P1 - Apoorv):** Blockchain ingestion, RPC client, BFS tracer, database models/CRUD, Neo4j, ML risk scorer & clustering, exchange crawler, Celery async tasks, PDF notice generator, initial API router, WebSocket manager.
- **Person 2 (P2 - Anvesh):** Unified frontend (`new-ui`), routing, security & RBAC UX, case workspace, deterministic intelligence engine (R1–R8), grounded copilot & adversarial citation validator, findings UI with graph glow, exits/gas/cross-complaint UI, evidence export & bitwise Web Crypto verification, legacy frontend retirement.
- **Shared:** Root configuration, environment templates (`.env.example`), Docker orchestration, coordination documentation.
- **Legacy:** Retired Next.js frontend (`frontend/` preserved at tag `pre-frontend-retirement` commit `90ccc7b`).
- **Generated:** `.planning/codebase/` architectural maps, cache directories (`__pycache__`, `.pytest_cache`).

---

## 2. File-by-File Implementation Inventory

| Area | File/Folder | Owner | Current State | Depends On | Integration Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **API Entry** | `backend/main.py` | **Person 1** | Working FastAPI app with CORS, health check, WebSockets; currently only mounts `api_router` | `backend/api/routes.py` | **Low** — Needs to mount P2's `routes_intelligence` and `routes_copilot` |
| **API Routes** | `backend/api/routes.py` | **Person 1** | Implements `/trace`, `/traces`, `/graph/{id}`, `/cluster/{id}`, `/freeze-notice`, `/labels`, `/ws` | `tracer.py`, `schemas.py`, `crud.py` | **Medium** — Input schema expects `victim_wallet`; P2 case workspace expects `fraud_tx_hash` |
| **API Intelligence** | `backend/api/routes_intelligence.py` | **Person 2** | Implements `/api/v1/intelligence/findings/{id}` and `/recompute/{id}`; uses fixture fallback | `backend/intelligence/orchestrator.py` | **Low** — Working standalone; needs inclusion in `main.py` |
| **API Copilot** | `backend/api/routes_copilot.py` | **Person 2** | Implements `/api/v1/cases/{case_id}/copilot/chat` with citation enforcement | `backend/copilot/agent.py` | **Low** — Working standalone; needs inclusion in `main.py` |
| **WebSocket Hub** | `backend/api/ws_manager.py` | **Person 1** | Connection manager supporting trace room subscriptions and broadcasting | FastAPI `WebSocket` | **Low** — Fully functional; compatible with P2 `useWebSocket` hook |
| **Blockchain RPC** | `backend/blockchain/rpc_client.py` | **Person 1** | Multi-provider client (Alchemy, Blockscout, Etherscan) with local mock simulation | `web3`, `requests` | **Medium** — Fallback produces synthetic transfers without explicit `data_mode = "SIMULATION"` tag |
| **Blockchain Tracer** | `backend/blockchain/tracer.py` | **Person 1** | Multi-hop BFS traversal from wallet, risk score calculation, Neo4j persistence | `rpc_client.py`, `risk_scorer.py` | **High** — Root is `source_wallet`, not `fraud_tx_hash`; edges lack `taint_amount` and `evidence_id` |
| **Blockchain Models** | `backend/blockchain/models.py` | **Person 1** | Pydantic models for `TraceRequest`, `HopRecord`, `TraceResponse`, `Node`, `Edge` | `pydantic` | **Medium** — Missing `fraud_tx_hash`, `taint_amount`, `boundary_type`, `data_mode` on edges |
| **Database Core** | `backend/database/db.py` | **Person 1** | SQLAlchemy engine, session maker, `init_db()` supporting PostgreSQL and SQLite | `sqlalchemy` | **Low** — Fully operational |
| **Database Models** | `backend/database/schemas.py` | **Person 1** | Models for `Complaint`, `Trace`, `WalletLabel`, `ClusteringResult`, `FreezeNotice` | SQLAlchemy `Base` | **High** — Missing `User` table (RBAC) and `Case` table (Dossier workspace) |
| **Database CRUD** | `backend/database/crud.py` | **Person 1** | CRUD helper functions for complaints, traces, labels, and freeze notices | `schemas.py`, `db.py` | **Low** — Functional for existing tables |
| **Intelligence Models** | `backend/intelligence/models.py` | **Person 2** | Pydantic models for `Finding` (rule, severity, evidence_edge_ids, evidence_ids) | `pydantic` | **None** — 100% frozen and tested |
| **Intelligence Rules** | `backend/intelligence/rules.py` | **Person 2** | Pure deterministic rules: R1 (Rapid), R2 (Peel), R3 (Fan-out), R4 (Fan-in), R5 (Mixer), R6 (Gas), R8 (Exit) | Pure Python / math | **None** — 23 unit tests pass; zero LLM dependency |
| **Intelligence Pipeline** | `backend/intelligence/orchestrator.py` | **Person 2** | Runs R1–R8 over graph edges, compiles deduplicated findings list | `rules.py`, `models.py` | **Low** — Needs live edge data from P1 tracer |
| **Copilot Agent** | `backend/copilot/agent.py` | **Person 2** | Grounded agent calling read-only tools, fallback generator, judicial guilt refusal | `tools.py`, `validator.py` | **Low** — Works with Gemini/OpenAI API or deterministic fallback |
| **Copilot Validator** | `backend/copilot/validator.py` | **Person 2** | Regex citation validator (`[tx:...]`, `[edge:...]`, `[finding:...]`), sentence-level stripper | Pure Python | **None** — 8 unit tests pass |
| **Copilot Tools** | `backend/copilot/tools.py` | **Person 2** | Read-only forensic tools: `get_trace_summary`, `get_finding`, `list_findings`, `get_edge` | `schemas.py` | **Medium** — Requires database or hops_data matching schema |
| **ML Risk Scorer** | `backend/ml/risk_scorer.py` | **Person 1** | Isolation Forest + heuristic transaction risk scoring | `sklearn`, `numpy` | **Medium** — `scikit-learn` dependency must be installed in python env |
| **ML Clustering** | `backend/ml/clustering.py` | **Person 1** | K-Means clustering for suspect wallet attribution based on behavioral vectors | `sklearn`, `pandas` | **Medium** — `scikit-learn` dependency required |
| **OSINT Scraper** | `backend/scraper/exchange_crawler.py` | **Person 1** | Seeds known exchange hot wallets; crawls Etherscan/SerpAPI | `requests`, `schemas.py` | **High** — Contains 500 fake generated hashes and USDT mislabeled as WazirX |
| **Legal Generator** | `backend/legal/notice_generator.py` | **Person 1** | ReportLab PDF compiler for Section 91 CrPC freeze requests | `reportlab`, `schemas.py` | **High** — Prints unauthorized Govt of India letterhead and claims court admissibility |
| **Neo4j Client** | `backend/neo4j/client.py` | **Person 1** | Graph store driver for persisting multi-hop wallet transfers and Cypher querying | `neo4j` driver | **Low** — Safe optional fallback if Neo4j is offline |
| **Celery Tasks** | `backend/tasks/celery_tasks.py` | **Person 1** | Asynchronous Celery workers for long-running deep trace jobs | `celery`, `redis` | **Low** — Not strictly needed for synchronous demo traces |
| **Test Suite (P1)** | `backend/tests/test_*.py` | **Person 1** | Tests for tracer, RPC, crawler, risk scorer, integration | `pytest`, `pytest-asyncio` | **Medium** — 3 tests fail collection if `sklearn` missing |
| **Test Suite (P2)** | `backend/tests/test_intelligence_rules.py`, `test_copilot_validator.py` | **Person 2** | 31 unit tests covering all R1–R8 rules, edge cases, citation stripping, guilt refusal | `pytest` | **None** — 31/31 passed in 1.38s |
| **Frontend Shell** | `new-ui/src/App.tsx` | **Person 2** | Central router with 5 guarded routes, responsive layout shell, top nav, role switcher | `react-router-dom` | **None** — Compiles cleanly in Vite |
| **Frontend Auth Hook** | `new-ui/src/hooks/useAuth.tsx` | **Person 2** | Context provider exposing `user`, `role`, `login()`, `logout()`, `switchRole()` | React Context | **None** — Ready to connect to backend auth |
| **Frontend Guards** | `new-ui/src/components/RequireAuth.tsx`, `RequireRole.tsx`, `ForbiddenScreen.tsx` | **Person 2** | Security UX enforcing role access (Investigator, Analyst, Admin) with forbidden screen | React | **None** — 100% verified |
| **Frontend Workspace** | `new-ui/src/pages/CaseDetailPage.tsx`, `CaseListPage.tsx`, `CaseCreatePage.tsx` | **Person 2** | Full investigative case management, dossier intake, and status tracking | `useCase.ts` | **Low** — Currently bound to `casesStub.ts`; toggle ready |
| **Frontend Fraud Picker** | `new-ui/src/components/FraudTxPicker.tsx` | **Person 2** | Strict 66-character EVM regex validator for starting fraud transaction hash | React | **None** — Tested with real Ethereum tx hashes |
| **Frontend Graph** | `new-ui/src/components/HeroGraph.tsx` | **Person 2** | High-performance graph canvas, node badges, zoom/pan controls, `#highlightGlow` edge glow | SVG / Canvas | **None** — Renders live and fixture data |
| **Frontend Findings** | `new-ui/src/components/FindingsDrawer.tsx`, `FindingCard.tsx` | **Person 2** | Side drawer displaying R1–R8 findings; clicking highlights matched edges in gold glow | `useFindings.ts` | **None** — Verified against R1–R8 findings |
| **Frontend Copilot** | `new-ui/src/components/CopilotChat.tsx`, `CitationChip.tsx` | **Person 2** | Interactive chat drawer with clickable citation chips that focus graph nodes/edges | `useCopilot.ts` | **None** — Verified against grounded copilot API |
| **Frontend Exits/Gas** | `new-ui/src/components/ExitCard.tsx`, `GasParentClusterView.tsx`, `CrossComplaintView.tsx` | **Person 2** | Off-ramp cards (Tier A/B/C), gas-parent cluster grouping, multi-FIR cross-case view | React | **None** — Verified with stub; ready for live data |
| **Frontend Evidence** | `new-ui/src/components/EvidenceExportPanel.tsx`, `EvidenceVerifyPanel.tsx` | **Person 2** | Bundle export, Web Crypto SHA-256 verification, and "Deliberately Corrupt 1 Byte" beat | Web Crypto API | **None** — 100% operational in browser |
| **Frontend Legal** | `new-ui/src/components/NoticeDraftPreview.tsx` | **Person 2** | Neutral Section 91 CrPC notice draft preview with disclaimer watermark | React | **None** — Replaces unsafe Govt letterhead |
| **Frontend API Client** | `new-ui/src/api/client.ts` | **Person 2** | Axios client with 4 explicit toggle flags (`USE_AUTH_STUB`, `USE_CASES_STUB`, etc.) | `axios` | **None** — One-line boolean flip per integration phase |
| **Legacy Frontend** | `frontend/` (Next.js) | **Legacy (P1)** | Retired in commit `90ccc7b` to consolidate on `new-ui`; preserved at tag `pre-frontend-retirement` | Next.js 14 | **None** — Safely retired |
| **Demo Seeds** | `scripts/seed_demo_scenarios.py` | **Person 1** | Seeds 3 demo cases (Phishing, Ransomware, Exchange hack) into DB | `schemas.py`, `db.py` | **Low** — Useful for populating SQLite/Postgres for demo |
| **Docker Stack** | `docker-compose.yml`, `docker/` | **Shared** | Defines services: `backend`, `neo4j`, `postgres`, `redis`, `celery` | Docker | **Low** — Legacy frontend service can be removed or swapped to `new-ui` |
