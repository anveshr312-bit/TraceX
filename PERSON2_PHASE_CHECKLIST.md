# TRACEX — PERSON 2 (ANVESH) PHASE CHECKLIST
**Role:** Frontend (`new-ui`), Routing & Layout, Security & RBAC UX, Intelligence Engine R1–R8, Grounded Copilot, Evidence Verification  
**Branch Convention:** `feature/p2-phase-<number>-<description>`  
**Base Branch:** `feature/p2-t12-retire-old-frontend` or `main`

---

## Pre-Flight Checklist
- [ ] Working directory: `new-ui/`
- [ ] Node environment active: Node 20+
- [ ] Build test: `npm run build` passes in `< 10s` with 0 TypeScript/Vite errors.
- [ ] Lint test: `npm run lint` passes with 0 ESLint errors.
- [ ] Person 2 foundational tasks T1–T12 are completed in local repository.

---

## Phase 0: Baseline & Repository Safety
**Goal:** Confirm clean UI compilation, lock `new-ui` baseline, and preserve tag.
- [ ] **Task 0.1:** Verify current branch and tag:
  ```bash
  git status
  git tag -l
  # Verify 'pre-frontend-retirement' tag exists
  ```
- [ ] **Task 0.2:** Run UI build & lint:
  ```bash
  cd new-ui
  npm run build
  npm run lint
  cd ..
  ```
- [ ] **Commit & Push:**
  ```bash
  git checkout -b feature/p2-phase-0-baseline
  git commit --allow-empty -m "chore(p2-p0): establish person 2 baseline verification branch"
  git push -u origin feature/p2-phase-0-baseline
  ```

---

## Phase 1: Contract Freeze & API Client Types
**Goal:** Verify TypeScript interfaces in `new-ui/src/types/` match Pydantic schemas frozen by Person 1.
- [ ] **Task 1.1:** Inspect `new-ui/src/types/intelligence.ts`, `new-ui/src/types/case.ts`, and `new-ui/src/types/api.ts`:
  - [ ] Ensure `TraceRequest` requires `fraud_tx_hash: string` (66-char EVM hex).
  - [ ] Ensure `EdgeData` includes:
    - `edge_id: string`
    - `taint_amount: number`
    - `taint_source_tx: string`
    - `evidence_id: string`
    - `boundary_type: 'NONE' | 'EXCHANGE' | 'DEX' | 'MIXER'`
  - [ ] Ensure top-level responses contain `data_mode: 'LIVE' | 'CACHED' | 'SIMULATION' | 'UNAVAILABLE'`.
- [ ] **Task 1.2:** Run TypeScript typecheck:
  ```bash
  cd new-ui && npm run build
  ```
- [ ] **Commit & Push:**
  ```bash
  git checkout -b feature/p2-phase-1-contract-freeze
  git add new-ui/src/types/
  git commit -m "chore(p2-p1): verify typescript contract alignment with backend pydantic schemas"
  git push -u origin feature/p2-phase-1-contract-freeze
  ```

---

## Phase 2: Auth & Case Persistence UI Integration
**Goal:** Connect UI authentication and case management to Person 1's live endpoints when available.
- [ ] **Task 2.1:** Inspect `new-ui/src/api/client.ts`:
  - Locate `USE_AUTH_STUB` and `USE_CASES_STUB`.
  - When Person 1 completes Phase 2: toggle `USE_AUTH_STUB = false` and `USE_CASES_STUB = false`.
- [ ] **Task 2.2:** Verify Auth flow in UI:
  - Login as `investigator`, `analyst`, and `admin` via `/login`.
  - Verify access token stored in memory / secure cookie.
  - Verify role-based redirection to `/cases`.
- [ ] **Task 2.3:** Verify Case Workspace:
  - Submit new case with valid `0x...` 66-character fraud transaction hash.
  - Ensure case appears in `/cases` list.
- [ ] **Task 2.4:** Build check:
  ```bash
  cd new-ui && npm run build
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-2-auth-cases-ui
  git add new-ui/src/api/client.ts new-ui/src/pages/
  git commit -m "feat(p2-p2): connect auth and case management to live backend endpoints"
  git push -u origin feature/p2-phase-2-auth-cases-ui
  ```

---

## Phase 3: Real Fraud Transaction Tracing UI
**Goal:** Hook `CaseDetailPage.tsx` and `FraudTxPicker.tsx` to live backend trace generation.
- [ ] **Task 3.1:** In `new-ui/src/api/client.ts`, configure `api.startTrace(caseId, fraudTxHash)`:
  - Point to `POST /api/v1/trace` or `POST /api/v1/cases/{case_id}/trace`.
- [ ] **Task 3.2:** Verify `DataModeBanner.tsx`:
  - If backend returns `data_mode: "LIVE"` -> show subtle green badge.
  - If backend returns `data_mode: "CACHED"` -> show amber banner with cache timestamp.
  - If backend returns `data_mode: "SIMULATION"` -> show prominent warning banner.
  - If backend is offline -> show red fallback banner with manual cache loader.
- [ ] **Task 3.3:** Run build and manual test:
  ```bash
  cd new-ui && npm run build
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-3-tx-tracing-ui
  git add new-ui/src/
  git commit -m "feat(p2-p3): wire live fraud-tx trace triggers and honest data mode banners"
  git push -u origin feature/p2-phase-3-tx-tracing-ui
  ```

---

## Phase 4: FIFO Taint Attribution Visualization
**Goal:** Display taint proportions and hop-level attribution on graph edges and node detail cards.
- [ ] **Task 4.1:** Update `new-ui/src/components/graph/HeroGraph.tsx`:
  - Render edge thickness / color saturation proportional to `taint_amount / original_amount`.
  - Add hover tooltip on edge displaying: `Tainted Amount: X ETH`, `Source Tx: 0x...`, `Evidence: sha256:...`.
- [ ] **Task 4.2:** Update `NodeDetailCard.tsx`:
  - Display cumulative tainted balance vs clean balance if mixed.
  - Show boundary badge (`EXCHANGE`, `DEX`, `MIXER`, `NONE`).
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-4-taint-ui
  git add new-ui/src/components/graph/
  git commit -m "feat(p2-p4): render FIFO taint flow thickness and boundary badges on graph"
  git push -u origin feature/p2-phase-4-taint-ui
  ```

---

## Phase 5: Intelligence Engine R1–R8 UI & Highlighting
**Goal:** Connect `FindingsDrawer.tsx` to live findings and verify graph edge glow highlighting.
- [ ] **Task 5.1:** Verify `new-ui/src/components/findings/FindingsDrawer.tsx`:
  - Clicking any finding (R1–R8) dispatches `selectedFindingId` to state.
  - `HeroGraph.tsx` applies SVG `#highlightGlow` filter and gold pulse animation to all `matched_edges` in that finding.
- [ ] **Task 5.2:** Ensure all 7 implemented rules render proper metadata:
  - R1: Rapid Passthrough (duration `< 10m`)
  - R2: Peel Chain (repeating split outputs)
  - R3: Fan-Out (distribution to multiple hops)
  - R4: Fan-In (aggregation into single collector)
  - R5: Mixer Interaction (Tornado Cash pool)
  - R6: Gas Sponsor (common funding origin)
  - R8: Exchange Deposit (known VASP hot wallet)
- [ ] **Task 5.3:** Build & test:
  ```bash
  cd new-ui && npm run build
  ```
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-5-findings-ui
  git add new-ui/src/components/
  git commit -m "feat(p2-p5): live findings drawer with svg gold edge glow highlighting"
  git push -u origin feature/p2-phase-5-findings-ui
  ```

---

## Phase 6: Live Graph Streaming & Cytoscape Ergonomics
**Goal:** Polish graph layout, pan/zoom, auto-fit, and physics stabilization.
- [ ] **Task 6.1:** Inspect `new-ui/src/components/graph/HeroGraph.tsx`:
  - Ensure hierarchical / Dagre or Cola layout stabilizes within 1 second.
  - Verify smooth zoom controls (+, -, reset view, auto-fit).
  - Verify selection click opens `NodeDetailCard` without layout jump.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-6-graph-ergonomics
  git add new-ui/src/components/graph/
  git commit -m "perf(p2-p6): refine cytoscape layout stability and smooth zoom ergonomics"
  git push -u origin feature/p2-phase-6-graph-ergonomics
  ```

---

## Phase 7: Exits, Gas Clusters & Cross-Complaints UI
**Goal:** Hook UI components to Person 1's Phase 7 live endpoints.
- [ ] **Task 7.1:** In `new-ui/src/api/client.ts`, configure:
  - `api.getExits(caseId)` -> connects to `/api/v1/cases/{case_id}/exits`.
  - `api.getGasClusters(caseId)` -> connects to `/api/v1/cases/{case_id}/gas-clusters`.
  - `api.getCrossComplaints(caseId)` -> connects to `/api/v1/cases/{case_id}/cross-complaints`.
- [ ] **Task 7.2:** Verify `ExitCard.tsx`:
  - Renders Tier A/B/C badge, freeze request button, and estimated INR conversion.
- [ ] **Task 7.3:** Verify `GasParentClusterView.tsx`:
  - Highlights shared funding roots across suspect wallets.
- [ ] **Task 7.4:** Verify `CrossComplaintView.tsx`:
  - Displays multi-FIR matches with police station names and overlapping entities.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-7-exits-clusters-ui
  git add new-ui/src/components/
  git commit -m "feat(p2-p7): wire exit cards, gas cluster view, and cross-complaint correlation"
  git push -u origin feature/p2-phase-7-exits-clusters-ui
  ```

---

## Phase 8: Grounded AI Copilot UI Integration
**Goal:** Connect `CopilotChat.tsx` to backend copilot endpoint with interactive citation chips.
- [ ] **Task 8.1:** In `new-ui/src/components/copilot/CopilotChat.tsx`:
  - Connect message submission to `POST /api/v1/cases/{case_id}/copilot/chat`.
  - Parse response citations: `[tx:...]`, `[edge:...]`, `[finding:...]`.
  - Render interactive `<CitationChip>` components:
    - Clicking `[tx:0x...]` centers graph on that transaction edge.
    - Clicking `[finding:R...]` opens Findings Drawer and activates gold edge glow.
- [ ] **Task 8.2:** Test edge cases:
  - Submit guilt prompt: "Is suspect 0xabc guilty of fraud?"
  - Verify assistant renders standard non-judicial disclaimer.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-8-copilot-ui
  git add new-ui/src/components/copilot/
  git commit -m "feat(p2-p8): interactive copilot chat with clickable citation chips and graph focus"
  git push -u origin feature/p2-phase-8-copilot-ui
  ```

---

## Phase 9: Evidence Export, Tamper Verification & Legal Preview
**Goal:** Deliver the end-to-end Section 65B/63 BSA evidence lifecycle in the UI.
- [ ] **Task 9.1:** Verify `EvidenceExportPanel.tsx`:
  - Role-gated: only Investigator and Admin can download bundle.
  - Downloads canonical JSON package and displays computed SHA-256 hash.
- [ ] **Task 9.2:** Verify `EvidenceVerifyPanel.tsx`:
  - Drag-and-drop or select bundle file.
  - Browser calculates Web Crypto API SHA-256 in real time.
  - Match -> Green verified badge.
  - Test "Deliberately Corrupt 1 Byte" button:
    - Flips a single byte in the payload.
    - Re-hash immediately detects mismatch and turns RED ("TAMPER DETECTED").
- [ ] **Task 9.3:** Verify `NoticeDraftPreview.tsx`:
  - Form fields for Section 91 CrPC notice (Investigating Officer name, Police Station, Court Reference).
  - Clean printable / exportable PDF draft preview with mandatory disclaimer watermark.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-9-evidence-ui
  git add new-ui/src/components/evidence/
  git commit -m "feat(p2-p9): evidence export, bitwise tamper verification, and notice preview"
  git push -u origin feature/p2-phase-9-evidence-ui
  ```

---

## Phase 10: Security, RBAC & Role Switching UX
**Goal:** Polish role guard UX and security boundary notifications.
- [ ] **Task 10.1:** Verify `RequireRole.tsx` and `ForbiddenScreen.tsx`:
  - Role switch menu in header allows rapid switching between `Investigator`, `Analyst`, and `Admin` for demonstration.
  - Attempting to access `/admin/audit` as Analyst smoothly redirects to `ForbiddenScreen` with explanation.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-10-rbac-ux
  git add new-ui/src/
  git commit -m "feat(p2-p10): smooth role-based access control transitions and forbidden screens"
  git push -u origin feature/p2-phase-10-rbac-ux
  ```

---

## Phase 11: Demo Data Fallbacks & Offline Resilience
**Goal:** Ensure UI functions completely offline using pre-cached case datasets if RPC/server is unavailable.
- [ ] **Task 11.1:** Verify fallback dataset in `new-ui/src/api/mockData.ts`:
  - Contains full 3-hop trace, 7 intelligence findings, 3 exchange exits, 2 gas clusters, and 1 cross-complaint match.
  - If backend is offline, user can click "Load Cached Demo Dossier" in `DataModeBanner`.
- [ ] **Commit & PR:**
  ```bash
  git checkout -b feature/p2-phase-11-offline-resilience
  git add new-ui/src/api/
  git commit -m "chore(p2-p11): ensure robust offline demo fallback data and cache loaders"
  git push -u origin feature/p2-phase-11-offline-resilience
  ```

---

## Phase 12: Final Integration & Demo Freeze
**Goal:** Final full build, end-to-end rehearsal with Person 1, and release freeze.
- [ ] **Task 12.1:** Execute full production build:
  ```bash
  cd new-ui
  npm run build
  npm run lint
  cd ..
  ```
- [ ] **Task 12.2:** Verify all 5 demo beats work sequentially:
  1. Login & Case Creation with 66-char fraud tx hash
  2. Live Graph rendering with FIFO taint propagation
  3. Findings drawer with gold edge glow highlighting
  4. Copilot grounded queries with citation chips and guilt refusal
  5. Evidence bundle export, SHA-256 hash match, and "Flip 1 Byte" tamper demo
- [ ] **Commit & Merge:**
  ```bash
  git checkout main
  git merge feature/p2-phase-12-demo-freeze
  git push origin main
  ```
