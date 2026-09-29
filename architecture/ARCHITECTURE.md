# TraceX Architecture Blueprint & Forensic Intelligence Engine

> Generated via **Graphify Knowledge Graph Extraction** (`879 nodes`, `2,063 edges`, `55 communities`) and architectural static analysis of the TraceX Autonomous Blockchain Forensics & Fraud Attribution Platform.

---

## 🧭 Visual & Interactive Navigation Hub

| Artifact | File Link | Description |
| :--- | :--- | :--- |
| **Interactive Knowledge Graph** | [graph.html](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/architecture/graph.html) | Full interactive 2D graph with zoom, community clustering, and search |
| **Call-Flow & Component Explorer** | [callflow.html](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/architecture/callflow.html) | Deep Mermaid call-flow sequences and subsystem call tables |
| **Collapsible Hierarchy Tree** | [tree.html](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/architecture/tree.html) | D3 collapsible code tree showing modules and dependency hierarchy |
| **Graphify Technical Report** | [GRAPH_REPORT.md](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/architecture/GRAPH_REPORT.md) | Community metrics, cohesion scores, god nodes, and audit logs |

---

## 1. High-Level System Architecture

TraceX integrates multi-chain RPC telemetry, an OSINT SerpApi crawler, an unsupervised machine learning anomaly scorer, deterministic forensic intelligence rules (R1–R8), a dual-store polyglot persistence layer (SQLite/PostgreSQL + Neo4j), and an interactive React 19 Cytoscape workstation.

```mermaid
graph TB
    subgraph ClientLayer ["Client & Forensic Workstation (React 19 / TypeScript)"]
        UI["Forensic Workstation Dashboard"]
        Cyto["Cytoscape.js Directed Graph Canvas"]
        CopilotUI["AI Copilot Side-Drawer (SSE / WebSockets)"]
        Inspector["Entity & Transaction Inspector"]
        Evidence["Evidence Export & Freeze Notice Modal"]
    end

    subgraph APILayer ["FastAPI Application Gateway (:8000)"]
        Gateway["FastAPI App (backend/main.py)"]
        RouterTrace["Trace Router (/api/v1/trace)"]
        RouterCases["Cases Router (/api/v1/cases)"]
        RouterIntel["Intelligence Router (/api/v1/intelligence)"]
        RouterCopilot["Copilot Router (/api/v1/copilot)"]
        RouterLegal["Legal Freeze Router (/api/v1/freeze-notice)"]
        WSManager["WebSocket Connection Manager"]
    end

    subgraph CoreEngine ["Forensic Intelligence & Attribution Engine"]
        Tracer["BlockchainTracer (BFS Multi-Hop Engine)"]
        IntelPipeline["Intelligence Pipeline (Deterministic Rules R1-R8)"]
        MLCluster["WalletClusterer (K-Means & Feature Extraction)"]
        MLAnomaly["Isolation Forest Risk Scorer"]
        AgentCopilot["GroundedCopilotAgent (Citation-Validated LLM Tool Loop)"]
        LegalGen["ReportLab Statutory Freeze PDF Builder (Sec 91 CrPC)"]
    end

    subgraph DataIngestion ["External Data Ingestion & OSINT"]
        RPC["Multi-Chain RPC Client (Alchemy / Infura / Polygon)"]
        SerpApi["SerpApi OSINT Crawler (Exchange Hot/Deposit Wallets)"]
        CuratedLabels["Curated VASP Database (Binance, CoinDCX, WazirX, etc.)"]
    end

    subgraph StorageLayer ["Polyglot Persistence Layer"]
        RelationalDB[(SQLite / PostgreSQL: Traces, Cases, Complaints, Labels)]
        GraphDB[(Neo4j Graph Database: Wallets, Transactions, Flow Hops)]
        Cache[(Redis: Celery Tasks & Real-time Hop Cache)]
    end

    %% Client to API
    UI -->|REST / HTTP| Gateway
    CopilotUI -->|WebSocket / Streaming| WSManager
    Cyto -.->|Graph Data| RouterTrace

    %% Gateway to Routers
    Gateway --> RouterTrace
    Gateway --> RouterCases
    Gateway --> RouterIntel
    Gateway --> RouterCopilot
    Gateway --> RouterLegal

    %% Routers to Core Engines
    RouterTrace --> Tracer
    RouterIntel --> IntelPipeline
    RouterTrace --> MLCluster
    RouterTrace --> MLAnomaly
    RouterCopilot --> AgentCopilot
    RouterLegal --> LegalGen

    %% Engines to External Ingestion
    Tracer --> RPC
    Tracer --> SerpApi
    Tracer --> CuratedLabels

    %% Engines to Storage
    Tracer --> RelationalDB
    Tracer --> GraphDB
    IntelPipeline --> GraphDB
    AgentCopilot --> GraphDB
    AgentCopilot --> RelationalDB
    WSManager --> Cache
```

---

## 2. Multi-Hop BFS Blockchain Forensic Tracing Engine

The tracing engine identifies laundering flows (peeling chains, transit splitters, mixer exit pools) by executing a bounded breadth-first search (BFS) across blockchain transactions.

```mermaid
sequenceDiagram
    autonumber
    actor Investigator as Law Enforcement Analyst
    participant UI as Forensic Dashboard
    participant API as FastAPI Router
    participant Tracer as BlockchainTracer (BFS)
    participant RPC as Blockchain RPC (Alchemy/QuickNode)
    participant Neo4j as Neo4j Graph DB
    participant Intel as Intelligence Engine (R1-R8)
    participant Legal as Section 91 CrPC PDF Builder

    Investigator->>UI: Input Fraud Tx Hash or Victim Address + Max Hops
    UI->>API: POST /api/v1/trace/start
    API->>Tracer: Initiate Multi-Hop BFS Trace
    
    loop Each Hop (Depth <= Max Hops)
        Tracer->>RPC: Fetch outgoing transactions & token transfers
        RPC-->>Tracer: Raw transaction logs & address balances
        Tracer->>Tracer: Apply Peeling Chain & Splitter Heuristics
        Tracer->>Neo4j: Upsert Wallet nodes & TRANSFERRED edges
        Tracer->>UI: Stream HOP_DISCOVERED event via WebSocket
        
        alt Identified Exchange Deposit (VASP)
            Tracer->>Tracer: Match against Curated DB & SerpApi OSINT
            Tracer->>Neo4j: Tag node as VASP (e.g. Binance Deposit)
        end
    end

    Tracer->>Intel: Execute run_intelligence_pipeline()
    Intel-->>Tracer: Synthesize Findings (Mixer, Sybil, Peeling, Fast Exit)
    Tracer->>API: Complete Trace & Return Full Subgraph
    API-->>UI: Render Cytoscape Graph & Risk Breakdown
    
    opt 1-Click Court-Admissible Freeze Notice
        Investigator->>UI: Request Statutory Freeze Notice
        UI->>API: POST /api/v1/freeze-notice/generate
        API->>Legal: Build Section 91 CrPC PDF with on-chain evidence
        Legal-->>UI: Download Signed Court-Admissible Freeze Document
    end
```

---

## 3. Intelligence Pipeline & Deterministic Rules (R1–R8)

TraceX avoids LLM hallucination in criminal evidence by enforcing strict deterministic rules R1 through R8 before any narrative synthesis:

```mermaid
graph TD
    SubGraphInput["Raw Multi-Hop Graph Subgraph"] --> RuleEngine["Deterministic Intelligence Engine (backend/intelligence/pipeline.py)"]

    subgraph Rules ["Deterministic Rules Suite"]
        R1["R1: Rapid Peeling Chain Detection<br/><i>(Tiny value peel off + large forward transfer)</i>"]
        R2["R2: High-Volume Mixer Interaction<br/><i>(Tornado Cash / Railgun contract interactions)</i>"]
        R3["R3: Velocity Anomaly<br/><i>(Hop transit time < 60 seconds across multiple hops)</i>"]
        R4["R4: Split-and-Merge Sybil Pattern<br/><i>(One-to-many fan out followed by fan-in consolidation)</i>"]
        R5["R5: VASP Off-Ramp Endpoint Attribution<br/><i>(Destination address identified as exchange deposit vault)</i>"]
        R6["R6: Temporal Dormancy Surge<br/><i>(Address inactive for >180 days suddenly transacts)</i>"]
        R7["R7: Round-Amount Structured Transfers<br/><i>(Layering under reporting thresholds)</i>"]
        R8["R8: Circular Flow & Self-Churn Detection<br/><i>(Funds cycle back to ancestral controller)</i>"]
    end

    RuleEngine --> R1
    RuleEngine --> R2
    RuleEngine --> R3
    RuleEngine --> R4
    RuleEngine --> R5
    RuleEngine --> R6
    RuleEngine --> R7
    RuleEngine --> R8

    R1 --> Synthesizer["Evidence Finding Aggregator"]
    R2 --> Synthesizer
    R3 --> Synthesizer
    R4 --> Synthesizer
    R5 --> Synthesizer
    R6 --> Synthesizer
    R7 --> Synthesizer
    R8 --> Synthesizer

    Synthesizer --> RiskScore["Composite Risk Score (0 - 100%)"]
    Synthesizer --> AuditTrail["Court-Verifiable Evidentiary Proofs"]
```

---

## 4. Grounded AI Copilot Architecture

The AI Copilot operates with deterministic tool validation and strict citation checking against the actual graph:

```mermaid
flowchart LR
    UserQuery["Investigator Chat Message"] --> Agent["GroundedCopilotAgent (backend/copilot/agent.py)"]
    
    subgraph ExecutionLoop ["Tool Calling & Verification Loop"]
        Agent --> Context["TurnExecutionContext"]
        Context --> ToolRunner["Forensic Tool Invocation"]
        
        subgraph Tools ["Forensic Tool Registry"]
            T1["get_wallet_details()"]
            T2["explain_cluster()"]
            T3["get_vasp_attribution()"]
            T4["calculate_flow_metrics()"]
        end
        
        ToolRunner --> T1
        ToolRunner --> T2
        ToolRunner --> T3
        ToolRunner --> T4
        
        T1 --> Facts["Ground Truth Facts"]
        T2 --> Facts
        T3 --> Facts
        T4 --> Facts
        
        Facts --> CitationValidator["Citation Validator (validate_citations)"]
    end

    CitationValidator --> FilteredFacts["Verified Grounded Output"]
    FilteredFacts --> StreamResponse["Server-Sent Events / WebSocket to UI"]
```

---

## 5. Architectural God Nodes (Extracted by Graphify)

The static analysis identified the following primary structural hubs across the repository:

| God Node | Edges | Module Location | Architectural Responsibility |
| :--- | :--- | :--- | :--- |
| `react` & `lucide-react` | 110 | `new-ui/src/*` | Frontend Workstation component rendering, iconography & reactive state |
| [`Trace`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/database/models.py) | 31 | `backend/database/models.py` | Canonical forensic trace entity connecting cases, hops, and freeze notices |
| [`BlockchainClient`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/blockchain/rpc_client.py) | 24 | `backend/blockchain/rpc_client.py` | Multi-chain RPC client abstraction with rate-limiting and block caching |
| [`BlockchainTracer`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/blockchain/tracer.py) | 22 | `backend/blockchain/tracer.py` | Core BFS traversal engine for transaction tracing and peeling detection |
| [`run_intelligence_pipeline`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/intelligence/pipeline.py) | 22 | `backend/intelligence/pipeline.py` | Evaluates deterministic forensic rules R1–R8 and outputs structured findings |
| [`Neo4jClient`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/neo4j/client.py) | 21 | `backend/neo4j/client.py` | High-throughput Cypher graph ingestion and multi-hop path query manager |
| [`validate_citations`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/copilot/citation.py) | 20 | `backend/copilot/citation.py` | Enforces evidentiary zero-hallucination verification for AI Copilot answers |
| [`ForensicCase`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/database/models.py) | 20 | `backend/database/models.py` | Root case management entity for law enforcement FIR/crime records |
| [`TurnExecutionContext`](file:///c:/Users/anves/Downloads/Trace%20X%20dehradun/backend/copilot/agent.py) | 17 | `backend/copilot/agent.py` | Manages stateful multi-turn forensic investigation context and tool receipts |

---

## 6. Directory & Module Structural Blueprint

```
Trace X dehradun/
├── architecture/                     <-- Architectural blueprints & Graphify exports
│   ├── ARCHITECTURE.md               <-- System blueprints & Mermaid diagrams (this document)
│   ├── index.html                    <-- Interactive Architecture Dashboard
│   ├── graph.html                    <-- Graphify 2D interactive force-directed graph
│   ├── callflow.html                 <-- Graphify Mermaid call-flow sequences
│   ├── tree.html                     <-- Graphify collapsible codebase tree
│   └── GRAPH_REPORT.md               <-- Graphify clustering and community cohesion report
├── backend/                          <-- FastAPI Backend & Forensic Services
│   ├── main.py                       <-- FastAPI App entrypoint, CORS & middleware
│   ├── api/                          <-- REST API route definitions
│   │   ├── routes.py                 <-- Core trace & health endpoints
│   │   ├── routes_cases.py           <-- Case management & FIR endpoints
│   │   ├── routes_copilot.py         <-- AI copilot chat & SSE streaming
│   │   └── routes_intelligence.py    <-- Rules R1-R8 execution & scoring
│   ├── blockchain/                   <-- Blockchain interaction layer
│   │   ├── tracer.py                 <-- BFS multi-hop traversal engine
│   │   ├── rpc_client.py             <-- Web3 / JSON-RPC node connector
│   │   └── heuristics.py             <-- Peeling chain & splitter heuristics
│   ├── copilot/                      <-- Grounded Forensic AI Assistant
│   │   ├── agent.py                  <-- GroundedCopilotAgent tool loop
│   │   └── citation.py               <-- Evidentiary citation validation
│   ├── database/                     <-- Relational Persistence (SQLite/PostgreSQL)
│   │   ├── db.py                     <-- SQLAlchemy session & engine lifecycle
│   │   ├── models.py                 <-- Case, Trace, WalletLabel, FreezeNotice ORM
│   │   ├── schemas.py                <-- Pydantic request/response DTOs
│   │   └── crud.py                   <-- Query access functions
│   ├── intelligence/                 <-- Forensic Intelligence Pipeline
│   │   ├── pipeline.py               <-- Deterministic Rules R1-R8 execution
│   │   └── rules/                    <-- Individual pattern detection rules
│   ├── legal/                        <-- Statutory Directives Engine
│   │   └── freeze_notice.py          <-- Section 91 CrPC PDF generator (ReportLab)
│   ├── ml/                           <-- Machine Learning Models
│   │   ├── clustering.py             <-- K-Means wallet behavioral clustering
│   │   └── isolation_forest.py       <-- Anomaly & risk scoring model
│   ├── neo4j/                        <-- Graph Database Driver
│   │   └── client.py                 <-- Cypher queries & bulk edge ingestion
│   ├── scraper/                      <-- OSINT Gathering
│   │   └── exchange_crawler.py       <-- SerpApi Google Search VASP crawler
│   └── tasks/                        <-- Background Workers (Celery / Redis)
├── new-ui/                           <-- Forensic Workstation Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── App.tsx                   <-- Root router & application layout
│   │   ├── api/                      <-- Frontend API client & DTO definitions
│   │   ├── components/               <-- Reusable UI component modules
│   │   │   ├── cytoscape/            <-- Interactive canvas graph visualizer
│   │   │   ├── copilot/              <-- Chat assistant side drawer
│   │   │   ├── evidence/             <-- Evidence export & freeze notice modals
│   │   │   └── workstation/          <-- Workstation toolbars & inspector panels
│   │   └── pages/                    <-- Top-level application views
│   └── vite.config.ts                <-- Vite bundler configuration
├── docker/                           <-- Docker containerization & orchestration
│   └── docker-compose.yml            <-- Redis, Neo4j, Backend & Frontend multi-container
└── scripts/                          <-- CLI tooling, seeders & benchmarks
```
