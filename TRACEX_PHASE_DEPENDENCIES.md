# TRACEX — PHASE DEPENDENCY GRAPH & CRITICAL PATH ANALYSIS
**Forensics Attribution & Graph Intelligence Engine**  
**Engineering Leads:** Person 1 (Apoorv) & Person 2 (Anvesh)

---

## 1. Visual Dependency Graph

```mermaid
flowchart TD
    subgraph P0_Setup ["Phase 0: Safety & Baseline"]
        P0_P1["P1: Verify Pytest Baseline"]
        P0_P2["P2: Verify Vite Build & Tag"]
    end

    subgraph P1_Contract ["Phase 1: Contract Freeze"]
        P1_P1["P1: Update Pydantic Schemas<br/>& Purge Fake Labels"]
        P1_P2["P2: Align TypeScript Types<br/>in new-ui/src/types/"]
    end

    subgraph P2_Auth ["Phase 2: Auth & Cases"]
        P2_P1["P1: User & Case DB Models<br/>+ Auth/Case Endpoints"]
        P2_P2["P2: Auth & Case Workspace UI<br/>(Toggle USE_AUTH_STUB)"]
    end

    subgraph P3_Tracing ["Phase 3: Real Tx Tracing"]
        P3_P1["P1: Tracer with fraud_tx_hash<br/>+ Honest Data Mode"]
        P3_P2["P2: CaseDetailPage +<br/>FraudTxPicker UI"]
    end

    subgraph P4_Taint ["Phase 4: FIFO Taint"]
        P4_P1["P1: FIFO Taint Engine<br/>+ evidence_id Generation"]
        P4_P2["P2: Edge Taint Thickness &<br/>Hover Tooltips in HeroGraph"]
    end

    subgraph P5_Intelligence ["Phase 5: Intelligence Engine R1-R8"]
        P5_P1["P1: Call evaluate_all_rules()<br/>in Trace Pipeline"]
        P5_P2["P2: FindingsDrawer.tsx +<br/>SVG Edge Glow Highlighting"]
    end

    subgraph P6_Graph ["Phase 6: Graph Ergonomics"]
        P6_P1["P1: RPC Query Caching &<br/>Latency Optimization"]
        P6_P2["P2: Dagre Layout Stabilization<br/>& Pan/Zoom Controls"]
    end

    subgraph P7_Clusters ["Phase 7: Exits & Gas Clusters"]
        P7_P1["P1: Endpoints for Exits,<br/>Gas Roots, Cross-FIR"]
        P7_P2["P2: ExitCard, GasClusterView,<br/>CrossComplaintView UI"]
    end

    subgraph P8_Copilot ["Phase 8: Grounded AI Copilot"]
        P8_P1["P1: Backend Copilot Route +<br/>Citation Stripping & Guilt Refusal"]
        P8_P2["P2: CopilotChat Drawer +<br/>Interactive CitationChips"]
    end

    subgraph P9_Legal ["Phase 9: Evidence & Legal Notice"]
        P9_P1["P1: Evidence JSON Hasher +<br/>Neutral Sec 91 Notice PDF"]
        P9_P2["P2: EvidenceVerifyPanel +<br/>'Flip 1 Byte' Tamper Demo UI"]
    end

    subgraph P10_RBAC ["Phase 10: Security & RBAC"]
        P10_P1["P1: FastAPI Role Middleware<br/>+ Forensic AuditLog DB"]
        P10_P2["P2: Header Role Switcher +<br/>ForbiddenScreen UX"]
    end

    subgraph P11_Resilience ["Phase 11: Resilience & Offline Mode"]
        P11_P1["P1: Offline Cached Fixtures<br/>with data_mode=CACHED"]
        P11_P2["P2: Offline Cache Loader<br/>in DataModeBanner"]
    end

    subgraph P12_Freeze ["Phase 12: Final Release Freeze"]
        P12_Both["Joint End-to-End Rehearsal<br/>Tag v1.0.0-final"]
    end

    %% Dependencies
    P0_P1 --> P1_P1
    P0_P2 --> P1_P2
    
    P1_P1 --> P1_P2
    P1_P1 --> P2_P1
    P1_P2 --> P2_P2
    
    P2_P1 --> P2_P2
    P2_P1 --> P3_P1
    P2_P2 --> P3_P2
    
    P3_P1 --> P3_P2
    P3_P1 --> P4_P1
    
    P4_P1 --> P4_P2
    P4_P1 --> P5_P1
    
    P5_P1 --> P5_P2
    P5_P2 --> P6_P2
    P3_P1 --> P6_P1
    
    P4_P1 --> P7_P1
    P7_P1 --> P7_P2
    
    P5_P1 --> P8_P1
    P8_P1 --> P8_P2
    
    P4_P1 --> P9_P1
    P9_P1 --> P9_P2
    
    P2_P1 --> P10_P1
    P10_P1 --> P10_P2
    
    P3_P1 --> P11_P1
    P11_P1 --> P11_P2
    
    P6_P2 --> P12_Both
    P7_P2 --> P12_Both
    P8_P2 --> P12_Both
    P9_P2 --> P12_Both
    P10_P2 --> P12_Both
    P11_P2 --> P12_Both
```

---

## 2. Phase-by-Phase Dependency & Hand-off Matrix

| Phase | Phase Name | Person 1 Deliverable | Person 2 Deliverable | Dependency State | Hand-off Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | Baseline & Safety | Pytest baseline passed | Vite build & tag verified | **PARALLEL** | Verified git branches pushed |
| **1** | Contract Freeze | Updated Pydantic schemas, purged 500 fake labels | Aligned TS types in `new-ui/src/types/` | **P2 BLOCKED BY P1** | Person 1 pushes `backend/api/` schemas |
| **2** | Auth & Cases | `User`/`Case` DB models, JWT routes | Case Workspace UI, auth flow | **P2 BLOCKED BY P1** | Person 2 flips `USE_AUTH_STUB = false` |
| **3** | Real Tx Tracing | Tracer with `fraud_tx_hash` entry point | `CaseDetailPage.tsx` + `FraudTxPicker.tsx` | **P2 BLOCKED BY P1** | Person 2 binds `api.startTrace` |
| **4** | FIFO Taint | `taint.py` FIFO engine + `evidence_id` | Edge thickness & hover tooltip | **P2 BLOCKED BY P1** | Graph edge payload contains `taint_amount` |
| **5** | Intelligence R1–R8 | Calls `evaluate_all_rules()` in pipeline | Findings Drawer + SVG Gold Edge Glow | **P1 BLOCKED BY P2** | Person 1 imports Person 2's `engine.py` |
| **6** | Graph Ergonomics | LRU caching for RPC queries | Smooth pan/zoom & Dagre layout | **PARALLEL** | Graph JSON schema |
| **7** | Exits & Clusters | `/exits`, `/gas-clusters`, `/cross-complaints` | Exit cards, Gas clusters, Cross-FIR UI | **P2 BLOCKED BY P1** | Live REST endpoints |
| **8** | Grounded Copilot | Backend `/copilot/chat` with citation checks | Copilot chat drawer with CitationChips | **P2 BLOCKED BY P1** | Live copilot streaming/REST endpoint |
| **9** | Evidence & Legal | JSON bundle hasher & neutral PDF notice | Bitwise verify panel & "Flip 1 Byte" UI | **P2 BLOCKED BY P1** | Bundle export format |
| **10** | Security & RBAC | Server-side role checks & `AuditLog` table | Header role switcher & forbidden screen | **P2 BLOCKED BY P1** | 403 Forbidden HTTP responses |
| **11** | Resilience | Cached fixtures with `data_mode=CACHED` | Cache loader button in DataModeBanner | **PARALLEL** | Pre-generated `demo_dossier.json` |
| **12** | Final Demo Freeze | Backend test pass & freeze | Frontend build & test pass | **JOINT FREEZE** | Final PR merge & tag `v1.0.0-final` |

---

## 3. Critical Path Analysis

The critical path is the longest sequence of dependent activities that directly determines the earliest possible completion time for the hackathon demo.

### The 5 Core Critical Path Steps:
1. **Phase 1 (Contract Freeze):** Person 1 updates `TraceRequest` and edge fields. Person 2 cannot wire real data until this contract is frozen.
2. **Phase 3 (Tx Tracing Engine):** Person 1 implements tracing from `fraud_tx_hash`. Without this, no real blockchain trace can be visualized.
3. **Phase 4 (FIFO Taint Engine):** Person 1 attaches `taint_amount` and `evidence_id`. This is the forensic backbone of the entire product.
4. **Phase 5 (Intelligence Engine Hookup):** Person 1 connects Person 2's R1–R8 engine into the trace loop.
5. **Phase 9 (Evidence Bundle & Verification):** Person 1 hashes the evidence payload; Person 2 executes the "Flip 1 Byte" tamper demonstration.

**Any delay in Person 1 completing Phase 1, 3, or 4 directly delays Person 2's ability to demonstrate live data.**

---

## 4. Parallelization Opportunities (No Blocking)

While Person 1 is building backend infrastructure, Person 2 is **NOT** idle. Because Person 2 built robust stubs (`USE_AUTH_STUB`, `USE_CASES_STUB`, etc.) during T1–T12:

1. **During Person 1's Phase 2 & 3:**
   - Person 2 can refine graph styling, edge animations (`#highlightGlow`), and layout physics in `HeroGraph.tsx` using cached fixtures.
2. **During Person 1's Phase 4 (FIFO Taint):**
   - Person 2 can build the UI components for Exits, Gas Clusters, and Cross-Complaints (`ExitCard.tsx`, `GasParentClusterView.tsx`, `CrossComplaintView.tsx`).
3. **During Person 1's Phase 7 & 8:**
   - Person 2 can perfect the Web Crypto API bitwise SHA-256 verification and the "Deliberately Corrupt 1 Byte" UI beat in `EvidenceVerifyPanel.tsx`.
4. **During Person 1's Phase 10 (Audit Log):**
   - Person 2 can prepare the offline demo fallback assets and polish the presentation script.
