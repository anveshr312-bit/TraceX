# TRACEX — INCREMENTAL GITHUB MERGE WORKFLOW & RECOVERY GUIDE
**Integration Coordinator:** Antigravity  
**Authors:** Person 1 (Apoorv) & Person 2 (Anvesh)  
**Target Repository:** `https://github.com/anveshr312-bit/TraceX.git` / `https://github.com/apoorvgarewal07/TraceX.git`

---

## 1. Actual Git State & Remote Configuration

### Local Active Branch:
- `feature/p2-t12-retire-old-frontend` (Commit `90ccc7b` — Contains all Person 2 deliverables T1 through T12).
- Tag: `pre-frontend-retirement` (Preserves legacy code before frontend consolidation).

### Base Branch:
- `main` (Commit `01df260` — Initial commit and documentation base from Person 1).

### Remote Configuration:
To ensure both developers can push, fetch, and coordinate cleanly, run the following setup commands once:

```powershell
# Verify current remotes
git remote -v

# Add personal/shared fork remote (if not already origin)
git remote add anvesh https://github.com/anveshr312-bit/TraceX.git
git remote add apoorv https://github.com/apoorvgarewal07/TraceX.git

# Fetch all branches and tags
git fetch --all --tags
```

---

## 2. Phase-by-Phase Git Execution Commands

Each phase follows a strict, repeatable protocol:
`BRANCH → MERGE P1/P2 WORK → TEST → COMMIT → PUSH → CHECKPOINT TAG`

---

### PHASE 0 — Baseline & Environment Checkpoint

```powershell
# 1. Start from main
git checkout main
git pull origin main

# 2. Create Phase 0 integration branch
git checkout -b integration/phase-0-baseline

# 3. Bring in Person 2's consolidated new-ui
git merge feature/p2-t12-retire-old-frontend -m "merge: bring in consolidated new-ui from Person 2"

# 4. Run verification tests
cd new-ui
npm run build
npm run lint
cd ..

# 5. Push to GitHub and tag checkpoint
git push -u origin integration/phase-0-baseline
git tag -a v0.0-baseline -m "Checkpoint Phase 0: Baseline environment verified"
git push origin v0.0-baseline
```

---

### PHASE 1 — Contract Alignment & Router Mounting

```powershell
# 1. Create Phase 1 integration branch
git checkout -b integration/phase-1-contracts

# 2. Stage contract updates in models.py, exchange_crawler.py, and main.py
git status
git add backend/blockchain/models.py
git add backend/scraper/exchange_crawler.py
git add backend/main.py

# 3. Run contract unit tests
py -m pytest backend/tests/test_intelligence_rules.py backend/tests/test_copilot_validator.py

# 4. Commit and push
git commit -m "feat(integration-p1): mount intelligence/copilot routers and align schemas"
git push -u origin integration/phase-1-contracts
git tag -a v0.1-contracts -m "Checkpoint Phase 1: Schemas aligned and routers mounted"
git push origin v0.1-contracts
```

---

### PHASE 2 — Fraud-Tx Tracing & Graph Visualization

```powershell
# 1. Create Phase 2 integration branch
git checkout -b integration/phase-2-tracing

# 2. Stage Person 1 tracer updates and Person 2 UI client hooks
git add backend/blockchain/tracer.py
git add backend/blockchain/rpc_client.py
git add new-ui/src/api/client.ts
git add new-ui/src/pages/CaseDetailPage.tsx

# 3. Run tests
py -m pytest backend/tests/test_rpc_client.py
cd new-ui; npm run build; cd ..

# 4. Commit and push
git commit -m "feat(integration-p2): wire fraud-tx trace trigger to hero graph canvas"
git push -u origin integration/phase-2-tracing
git tag -a v0.2-tracing -m "Checkpoint Phase 2: Live fraud-tx tracing operational"
git push origin v0.2-tracing
```

---

### PHASE 3 — FIFO Taint Attribution & Flow Thickness

```powershell
# 1. Create Phase 3 integration branch
git checkout -b integration/phase-3-taint

# 2. Stage Person 1 taint logic and Person 2 edge styling
git add backend/blockchain/tracer.py
git add new-ui/src/components/HeroGraph.tsx

# 3. Run tests
py -m pytest backend/tests/test_tracer.py
cd new-ui; npm run build; cd ..

# 4. Commit and push
git commit -m "feat(integration-p3): implement FIFO taint propagation and edge flow thickness"
git push -u origin integration/phase-3-taint
git tag -a v0.3-taint -m "Checkpoint Phase 3: FIFO taint attribution verified"
git push origin v0.3-taint
```

---

### PHASE 4 — Intelligence Engine R1–R8 & Graph Glow

```powershell
# 1. Create Phase 4 integration branch
git checkout -b integration/phase-4-intelligence

# 2. Stage intelligence route integration
git add backend/api/routes_intelligence.py
git add new-ui/src/components/FindingsDrawer.tsx
git add new-ui/src/components/HeroGraph.tsx

# 3. Run tests
py -m pytest backend/tests/test_intelligence_rules.py
cd new-ui; npm run build; cd ..

# 4. Commit and push
git commit -m "feat(integration-p4): connect R1-R8 findings drawer to graph edge glow"
git push -u origin integration/phase-4-intelligence
git tag -a v0.4-intelligence -m "Checkpoint Phase 4: R1-R8 intelligence and glow integrated"
git push origin v0.4-intelligence
```

---

### PHASE 5 — Grounded AI Copilot & Citation Chips

```powershell
# 1. Create Phase 5 integration branch
git checkout -b integration/phase-5-copilot

# 2. Stage copilot tool integration and chat drawer
git add backend/copilot/agent.py
git add backend/copilot/tools.py
git add new-ui/src/components/CopilotChat.tsx
git add new-ui/src/components/CitationChip.tsx

# 3. Run tests
py -m pytest backend/tests/test_copilot_validator.py
cd new-ui; npm run build; cd ..

# 4. Commit and push
git commit -m "feat(integration-p5): wire grounded copilot chat with interactive citation chips"
git push -u origin integration/phase-5-copilot
git tag -a v0.5-copilot -m "Checkpoint Phase 5: Grounded copilot operational"
git push origin v0.5-copilot
```

---

### PHASE 6 — Exits, Gas Clusters & Cross-Complaints

```powershell
# 1. Create Phase 6 integration branch
git checkout -b integration/phase-6-exits-clusters

# 2. Stage exits and clustering routes and UI components
git add backend/api/routes.py
git add new-ui/src/components/ExitCard.tsx
git add new-ui/src/components/GasParentClusterView.tsx
git add new-ui/src/components/CrossComplaintView.tsx

# 3. Run tests
cd new-ui; npm run build; cd ..

# 4. Commit and push
git commit -m "feat(integration-p6): wire exit cards, gas parent clusters, and cross-complaints"
git push -u origin integration/phase-6-exits-clusters
git tag -a v0.6-clusters -m "Checkpoint Phase 6: Exits and clusters integrated"
git push origin v0.6-clusters
```

---

### PHASE 7 — Evidence Bundle, Verification & Neutral Notice

```powershell
# 1. Create Phase 7 integration branch
git checkout -b integration/phase-7-evidence

# 2. Stage evidence export, verification panel, and neutral notice generator
git add backend/legal/notice_generator.py
git add new-ui/src/components/EvidenceExportPanel.tsx
git add new-ui/src/components/EvidenceVerifyPanel.tsx
git add new-ui/src/components/NoticeDraftPreview.tsx

# 3. Run tests
cd new-ui; npm run build; cd ..

# 4. Commit and push
git commit -m "feat(integration-p7): evidence bundle export, bitwise tamper verification, and notice"
git push -u origin integration/phase-7-evidence
git tag -a v0.7-evidence -m "Checkpoint Phase 7: Section 65B verification complete"
git push origin v0.7-evidence
```

---

### PHASE 8 — Security UX & Final Release Freeze

```powershell
# 1. Create Phase 8 integration branch
git checkout -b integration/phase-8-final-freeze

# 2. Stage final offline demo fallbacks and release assets
git add new-ui/src/components/DataModeBanner.tsx
git add README.md

# 3. Run full verification suite
py -m pytest backend/tests/test_intelligence_rules.py backend/tests/test_copilot_validator.py
cd new-ui; npm run build; npm run lint; cd ..

# 4. Merge integration branch into main
git checkout main
git merge integration/phase-8-final-freeze -m "release: TraceX v1.0.0 final hackathon release"

# 5. Push main and final release tag
git push origin main
git tag -a v1.0.0-final -m "TraceX Final Hackathon Release Freeze"
git push origin v1.0.0-final
```

---

## 3. GitHub Safety & Rollback Procedures

Every phase creates an annotated Git tag (`v0.X-...`). This guarantees that any regression or broken commit can be rolled back instantly without losing completed work.

### Scenario A: Reverting an Unstable Integration Commit on Current Branch
```powershell
# Non-destructive: creates a commit that inverts the bad change
git revert HEAD --no-edit
git push origin <current-branch>
```

### Scenario B: Restoring Working State from a Previous Phase Tag
If an integration branch gets corrupted or conflicting:
```powershell
# Abandon the corrupted branch and create a fresh branch from the last stable tag
git checkout -b integration/phase-recover v0.4-intelligence
```

### Scenario C: Emergency Reset of Local Branch
```powershell
# Stash any uncommitted work safely
git stash save "emergency-backup"

# Hard reset local branch to the last known good commit
git reset --hard v0.3-taint
```

> **SAFETY RULE:** Never run `git push --force` on `main`. All rollbacks on `main` must use `git revert` or explicit forward-fixing merge commits.
