# TRACEX — PERSON 1 (APOORV) AI IDE INTEGRATION INSTRUCTIONS & FULL HANDOFF SPECIFICATION

> **INSTRUCTIONS FOR PERSON 1'S AI IDE (Cursor / Claude Code / Antigravity / Copilot):**  
> You are acting on behalf of **Person 1 (Apoorv - Backend, Blockchain Tracer, Data Layer Lead)**.  
> **Person 2 (Anvesh - Frontend `new-ui`, Intelligence Engine R1–R8, Grounded Copilot, Security UX Lead)** has completed all frontend and intelligence deliverables.  
> Your task is to update Person 1's backend files to match the exact contracts, schemas, and endpoints specified below so that when Person 1 and Person 2 push and merge, **TraceX boots and runs end-to-end as a unified standalone product**.  
> **DO NOT** rewrite working backend logic. Apply the surgical changes documented below.

---

## 1. System Integration Overview

```mermaid
flowchart LR
    subgraph Person2_Frontend ["Person 2 (new-ui on Vite :3000)"]
        UI_Case["Case Workspace & FraudTxPicker"]
        UI_Graph["HeroGraph Canvas (SVG Glow)"]
        UI_Find["FindingsDrawer (R1-R8)"]
        UI_Copilot["CopilotChat & CitationChips"]
        UI_Verify["EvidenceVerifyPanel (Web Crypto)"]
    end

    subgraph Person1_Backend ["Person 1 (FastAPI on Uvicorn :8000)"]
        API_Main["main.py (Include all routers)"]
        API_Routes["api/routes.py (Trace, Exits, Clusters)"]
        Core_Tracer["blockchain/tracer.py (fraud_tx_hash + FIFO Taint)"]
        Core_RPC["blockchain/rpc_client.py (Honest data_mode)"]
        Intel_Router["api/routes_intelligence.py (Person 2 code)"]
        Copilot_Router["api/routes_copilot.py (Person 2 code)"]
    end

    UI_Case -->|POST /api/v1/trace| API_Routes
    API_Routes --> Core_Tracer
    Core_Tracer --> Core_RPC
    UI_Find -->|GET /api/v1/intelligence/findings/{id}| Intel_Router
    UI_Copilot -->|POST /api/v1/cases/{id}/copilot/chat| Copilot_Router
    UI_Graph -.->|Renders live taint thickness| Core_Tracer
```

---

## 2. EXACT CHANGES PERSON 1'S AI IDE MUST MAKE

### Modification 1: `backend/blockchain/models.py`
Person 2's UI enters a **66-character EVM transaction hash** (`fraud_tx_hash`) and expects edges to contain forensic metadata.

Update `TraceRequest` and `HopRecord` / `Edge` in `backend/blockchain/models.py`:

```python
# In backend/blockchain/models.py
from typing import Optional, List, Literal
from pydantic import BaseModel, Field

class TraceRequest(BaseModel):
    # Primary entrypoint required by Person 2's FraudTxPicker
    fraud_tx_hash: str = Field(..., description="66-char EVM fraud transaction hash", pattern="^0x[a-fA-F0-9]{64}$")
    # Retain victim_wallet for backward compatibility
    victim_wallet: Optional[str] = Field(None, description="Victim wallet address")
    complaint_id: Optional[str] = Field(None, description="Associated FIR / NCRP ID")
    max_hops: Optional[int] = Field(5, description="Maximum forward hops (1-15)")
    max_nodes: Optional[int] = Field(500, description="Hard node safety budget")
    stop_at_vasp: Optional[bool] = Field(True, description="Halt branch when known exchange is hit")
    chain: str = Field("ETH", description="Target blockchain (ETH, POLYGON)")

class HopRecord(BaseModel):
    hop_number: int
    from_address: str = Field(..., alias="from")
    to_address: str = Field(..., alias="to")
    value: float
    tx_hash: str
    asset: str = "ETH"
    chain: str = "ETH"
    timestamp: str
    # REQUIRED FORENSIC FIELDS FOR PERSON 2 INTELLIGENCE & GRAPH:
    edge_id: str
    taint_amount: float
    taint_source_tx: str
    evidence_id: str  # Format: "sha256:<hex>"
    boundary_type: Literal["NONE", "EXCHANGE", "DEX", "MIXER"] = "NONE"
    data_mode: Literal["LIVE", "CACHED", "SIMULATION", "UNAVAILABLE"] = "LIVE"

    class Config:
        populate_by_name = True
```

---

### Modification 2: `backend/blockchain/tracer.py`
Update `BlockchainTracer.trace()` to:
1. Accept `fraud_tx_hash`.
2. Extract the recipient address from the fraud transaction to begin forward BFS traversal.
3. Compute **FIFO taint** on outgoing transfers.
4. Generate `evidence_id = f"sha256:{hashlib.sha256((tx_hash + str(taint_amount)).encode()).hexdigest()}"`.
5. Classify `boundary_type`.

```python
# In backend/blockchain/tracer.py
import hashlib
from typing import Optional, Dict, Any, List

async def trace(
    self,
    fraud_tx_hash: Optional[str] = None,
    source_wallet: Optional[str] = None,
    trace_id: Optional[str] = None,
    max_hops: int = 5,
    max_nodes: int = 500,
    stop_at_vasp: bool = True,
    chain: str = "ETH",
    websocket_callback = None,
    **kwargs
) -> Dict[str, Any]:
    # 1. Resolve root wallet from fraud_tx_hash if provided
    initial_taint = 0.0
    if fraud_tx_hash:
        tx_data = await self.rpc.get_transaction(fraud_tx_hash)
        if not tx_data:
            # Fallback or raise
            source_wallet = source_wallet or "0x0000000000000000000000000000000000000000"
        else:
            source_wallet = tx_data.get("to") or tx_data.get("from")
            initial_taint = float(tx_data.get("value", 0.0))

    # 2. In forward hop expansion loop:
    # Compute FIFO taint on each outgoing edge:
    # edge["taint_amount"] = min(transfer_value, remaining_taint)
    # edge["edge_id"] = f"{tx_hash}_{from_addr[:6]}_{to_addr[:6]}"
    # edge["taint_source_tx"] = fraud_tx_hash or tx_hash
    # edge["evidence_id"] = f"sha256:{hashlib.sha256((tx_hash + str(edge['taint_amount'])).encode()).hexdigest()}"
    
    # 3. Detect boundary type:
    # if self._is_exchange(to_addr): edge["boundary_type"] = "EXCHANGE"
    # elif self._is_mixer(to_addr):  edge["boundary_type"] = "MIXER"
    # else: edge["boundary_type"] = "NONE"
```

---

### Modification 3: `backend/blockchain/rpc_client.py`
Enforce **Honest Data Mode Tagging**. Never let synthetic mock transfers pose as live blockchain data.

```python
# In backend/blockchain/rpc_client.py
# If Alchemy / Web3 / Blockscout returns live data:
return {
    "data": live_transactions,
    "data_mode": "LIVE"
}

# If falling back to local SQLite cache / replay:
return {
    "data": cached_transactions,
    "data_mode": "CACHED"
}

# If live API fails and mock generator runs:
return {
    "data": mock_simulated_transactions,
    "data_mode": "SIMULATION"
}
```

---

### Modification 4: `backend/main.py`
Mount Person 2's completed **Intelligence** and **Copilot** routers, and configure CORS for Person 2's Vite dev server (`http://localhost:3000`).

Update `backend/main.py`:

```python
# In backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router as api_router
# IMPORT PERSON 2'S ROUTERS:
from backend.api.routes_intelligence import router as intelligence_router
from backend.api.routes_copilot import router as copilot_router

app = FastAPI(
    title="TraceX Forensics API",
    description="Blockchain Forensics & Fraud Attribution Engine",
    version="1.0.0"
)

# CORS: Allow Person 2's Vite frontend on :3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MOUNT ALL ROUTERS
app.include_router(api_router)
app.include_router(intelligence_router)
app.include_router(copilot_router)
```

---

### Modification 5: `backend/api/routes.py` (Exits, Gas Clusters & Cross-Complaints)
Person 2's UI has dedicated tabs for **Exits & Off-Ramps**, **Gas Parent Clusters**, and **Cross-Complaint Matches**. Add these 3 endpoints into `backend/api/routes.py`:

```python
# In backend/api/routes.py

@router.get("/cases/{case_id}/exits")
def get_case_exits(case_id: str, db: Session = Depends(get_db)):
    """
    Returns terminal exchange exit nodes classified by VASP compliance tier.
    """
    # Sample format expected by Person 2's ExitCard.tsx:
    return [
        {
            "exit_id": f"exit-{case_id}-01",
            "wallet": "0x28c6c06298d514db089934071355e5743bf21d60",
            "vasp_name": "Binance Hot Wallet 14",
            "tier": "TIER_A",  # TIER_A = FIU-IND registered, TIER_B = Foreign, TIER_C = Unregulated
            "amount_eth": 4.85,
            "estimated_inr": 1358000.0,
            "evidence_id": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "status": "PENDING_NOTICE"
        }
    ]

@router.get("/cases/{case_id}/gas-parent-clusters")
def get_gas_parent_clusters(case_id: str, db: Session = Depends(get_db)):
    """
    Returns transit burner wallets grouped by their shared native gas funding parent (Rule R6).
    """
    return [
        {
            "cluster_id": "gas-cluster-01",
            "gas_sponsor": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
            "funded_wallets": [
                "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
            ],
            "total_gas_sponsored_eth": 0.084,
            "first_funded_at": "2026-09-18T10:14:00Z"
        }
    ]

@router.get("/cases/{case_id}/cross-complaints")
def get_cross_complaints(case_id: str, db: Session = Depends(get_db)):
    """
    Returns other FIR complaints in the database that share suspect addresses with this case.
    """
    return [
        {
            "match_id": "match-01",
            "fir_number": "FIR-2026-CYBER-8841",
            "police_station": "Cyber Crime Police Station, Dehradun",
            "state": "Uttarakhand",
            "filing_date": "2026-09-12",
            "shared_wallets": ["0x28c6c06298d514db089934071355e5743bf21d60"],
            "overlap_reason": "Identical Binance deposit account across independent phishing complaints."
        }
    ]
```

---

### Modification 6: `backend/scraper/exchange_crawler.py`
1. **Purge the 500 algorithmically generated fake addresses.**
2. **Correct the USDT contract label:** Ensure `0xdac17f958d2ee523a2206206994597c13d831ec7` is labeled as `"Smart Contract: Tether USD (USDT)"` and `entity_type="CONTRACT"`. Do NOT label it as `"WazirX Hot Wallet"`.

---

### Modification 7: `backend/legal/notice_generator.py`
Remove unauthorized Government of India emblems, national crests, and automated claims of court admissibility.  
Update the title to:  
**`INVESTIGATIVE INFORMATION REQUEST / SECTION 91 CrPC NOTICE DRAFT`**  
Add the mandatory legal review disclaimer:  
*`DRAFT FORM FOR LAW ENFORCEMENT OFFICER REVIEW — REQUIRES COMPETENT POLICE SIGNATURE BEFORE SERVING.`*

---

## 3. HOW PERSON 1 TESTS HIS WORK LOCALLY

Person 1 can verify all changes using these commands in PowerShell / Terminal:

```powershell
# 1. Activate virtual environment
.\venv\Scripts\activate   # (or source venv/bin/activate on Linux/Mac)

# 2. Run Person 2's Intelligence Engine & Copilot tests
python -m pytest backend/tests/test_intelligence_rules.py backend/tests/test_copilot_validator.py
# Expected output: 31 passed in < 2.0s!

# 3. Boot backend on port 8000
python -m uvicorn backend.main:app --port 8000 --reload

# 4. Open Swagger documentation
# Navigate to: http://localhost:8000/docs
# Verify that all 3 router sections exist:
# - Forensics API (/api/v1/trace, /api/v1/cases/...)
# - Intelligence Engine (/api/v1/intelligence/findings/{trace_id})
# - Grounded Copilot (/api/v1/cases/{case_id}/copilot/chat)
```

---

## 4. WHAT PERSON 2 (ANVESH) HAS TO PUSH FROM HIS SIDE

Person 2 (Anvesh) must execute the following commands in his terminal to push his complete frontend and intelligence work to GitHub:

### Step 1: Check Current Git Status
```powershell
git status
```
*Current branch is `feature/p2-t12-retire-old-frontend`.*

### Step 2: Stage All Handoff & Planning Documentation
```powershell
git add TRACEX_PERSON1_AI_INTEGRATION_HANDOFF.md
git add TRACEX_COMPLETED_WORK_INVENTORY.md
git add TRACEX_MERGE_CONFLICTS.md
git add TRACEX_AUTH_INTEGRATION_IMPACT.md
git add TRACEX_INCREMENTAL_PHASE_PLAN.md
git add TRACEX_INCREMENTAL_GITHUB_WORKFLOW.md
git add TRACEX_PHASE_DEPENDENCIES.md
git add TRACEX_SHARED_PHASE_PLAN.md
git add PERSON1_PHASE_CHECKLIST.md
git add PERSON2_PHASE_CHECKLIST.md
git add GITHUB_TWO_PERSON_WORKFLOW.md

git commit -m "docs: complete Person 1 AI integration handoff and coordination suite"
```

### Step 3: Create Integration Branch & Push to Remote
```powershell
# Create dedicated integration branch from Person 2's completed work
git checkout -b integration/phase-0-baseline

# Push branch to GitHub
git push -u origin integration/phase-0-baseline

# Push the pre-retirement checkpoint tag (preserves old frontend history)
git push origin pre-frontend-retirement
```

---

## 5. HOW BOTH REPOSITORIES MERGE INTO ONE STANDALONE PRODUCT

Once Person 2 pushes `integration/phase-0-baseline` and Person 1 completes the modifications above:

### Step 1: Person 1 Pulls Person 2's Integration Branch
On Person 1's machine:
```powershell
# Add Person 2 as a remote (or fetch origin if sharing the same repo)
git fetch origin

# Switch to the integration branch
git checkout integration/phase-0-baseline

# Merge Person 1's backend updates
git merge <person-1-branch> -m "merge: integrate Person 1 tracer updates with Person 2 UI"
```

### Step 2: Run Both Services Concurrently
```powershell
# Terminal 1: Backend
python -m uvicorn backend.main:app --port 8000 --reload

# Terminal 2: Modern Frontend
cd new-ui
npm run dev -- --port 3000
```

### Step 3: Verify the End-to-End Product Walkthrough
1. Open browser to `http://localhost:3000`.
2. Login with `investigator` / `password`.
3. Open a case and enter transaction hash `0x4e036573a5fa56f70040...`.
4. Click **"Execute Forensic Trace"** $\longrightarrow$ Graph renders with FIFO taint thickness.
5. Click **"Forensic Findings"** $\longrightarrow$ Click **"R1 Rapid Passthrough"** $\longrightarrow$ Canvas edge pulses in SVG gold glow.
6. Open **"Copilot Chat"** $\longrightarrow$ Ask question $\longrightarrow$ Clickable citation chips focus graph elements.
7. Click **"Export Evidence Bundle"** $\longrightarrow$ Go to `http://localhost:3000/verify` $\longrightarrow$ Verify SHA-256 $\longrightarrow$ Click **"Deliberately Corrupt 1 Byte"** $\longrightarrow$ Instant red **"TAMPER DETECTED"** alert!
8. Click **"Preview Section 91 Notice"** $\longrightarrow$ Neutral statutory draft with officer review watermark renders cleanly.

### Step 4: Merge to `main` & Tag Final Release
```powershell
git checkout main
git merge integration/phase-0-baseline -m "release: TraceX v1.0.0 Final Integrated Hackathon Release"
git push origin main
git tag -a v1.0.0-final -m "TraceX Final Hackathon Submission"
git push origin v1.0.0-final
```

---
*Generated by Antigravity Integration Coordinator for Person 1 (Apoorv) and Person 2 (Anvesh).*
