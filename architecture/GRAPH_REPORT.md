# Graph Report - Trace X dehradun  (2026-09-26)

## Corpus Check
- 137 files · ~92,559 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: .example 2, (none) 2, .backend 1)

## Summary
- 879 nodes · 2063 edges · 55 communities (51 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AI Forensics Copilot Agent
- Deterministic Intelligence Engine
- AI Forensics Copilot Agent
- Authentication & RBAC System
- App Router & Shell Views
- OSINT Crawler & VASP Seeding
- ML Behavioral Clustering
- Blockchain BFS Tracing Engine
- Evidence & Entity Inspection UI
- AI Forensics Copilot Agent
- Case Management & Complaints
- AI Forensics Copilot Agent
- Case Management & Complaints
- ML Behavioral Clustering
- ML Behavioral Clustering
- Subsystem dependencies
- UI Component Module 16
- ML Behavioral Clustering
- OSINT Crawler & VASP Seeding
- ML Behavioral Clustering
- Blockchain BFS Tracing Engine
- Deterministic Intelligence Engine
- Subsystem tsconfig.json
- Authentication & RBAC System
- Deterministic Intelligence Engine
- OSINT Crawler & VASP Seeding
- Evidence & Entity Inspection UI
- AI Forensics Copilot Agent
- Blockchain BFS Tracing Engine
- Deterministic Intelligence Engine
- Subsystem test_rpc_client.py
- Blockchain BFS Tracing Engine
- AI Forensics Copilot Agent
- Cytoscape Graph Visualizer
- Deterministic Intelligence Engine
- ML Behavioral Clustering
- UI Component Module 36
- AI Forensics Copilot Agent
- ML Behavioral Clustering
- AI Forensics Copilot Agent
- Case Management & Complaints
- Deterministic Intelligence Engine
- Subsystem ConnectionManager
- UI Component Module 43
- Deterministic Intelligence Engine
- UI Component Module 45
- UI Component Module 46
- Subsystem edges_fixture.py
- Case Management & Complaints
- Subsystem InvestigationTimeline.tsx
- Subsystem vite.config.ts
- Subsystem HeroEmblemNetwork.tsx
- Trace & Freeze Notice API
- Subsystem init-db.sh

## God Nodes (most connected - your core abstractions)
1. `react` - 62 edges
2. `lucide-react` - 48 edges
3. `Trace` - 31 edges
4. `BlockchainClient` - 24 edges
5. `BlockchainTracer` - 22 edges
6. `run_intelligence_pipeline()` - 22 edges
7. `Neo4jClient` - 21 edges
8. `validate_citations()` - 20 edges
9. `ForensicCase` - 20 edges
10. `TurnExecutionContext` - 17 edges

## Surprising Connections (you probably didn't know these)
- `benchmark_tracer()` --calls--> `BlockchainClient`  [EXTRACTED]
  scripts/benchmark.py → backend/blockchain/rpc_client.py
- `benchmark_tracer()` --calls--> `BlockchainTracer`  [EXTRACTED]
  scripts/benchmark.py → backend/blockchain/tracer.py
- `main()` --calls--> `init_db()`  [EXTRACTED]
  scripts/seed_demo_scenarios.py → backend/database/db.py
- `benchmark_tracer()` --calls--> `Neo4jClient`  [EXTRACTED]
  scripts/benchmark.py → backend/neo4j/client.py
- `main()` --calls--> `ExchangeCrawler`  [EXTRACTED]
  scripts/seed_demo_scenarios.py → backend/scraper/exchange_crawler.py

## Import Cycles
- None detected.

## Communities (55 total, 4 thin omitted)

### Community 0 - "AI Forensics Copilot Agent"
Cohesion: 0.07
Nodes (49): GroundedCopilotAgent, Any, Grounded Copilot Agent for TraceX Cryptographic Forensics. Implements tool-…, Optional external LLM invocation loop using function calling if configured.…, Processes an investigator message for a case. Executes forensic tools,…, Synthesizes a strictly grounded response using real tool results when running…, TraceX Grounded AI Copilot Deterministic tool calling, citation validation, and…, get_edge() (+41 more)

### Community 1 - "Deterministic Intelligence Engine"
Cohesion: 0.10
Nodes (52): TraceX Intelligence Engine Pure deterministic rules R1-R8 for cryptocurrency…, Finding, BaseModel, Finding data model matching Blueprint Section 4. All findings emitted by R1-R8…, Any, Orchestrator for TraceX Intelligence Engine. Executes deterministic rules R1-R6…, Executes all active deterministic rules (R1-R6, R8; skips R7 stub) over a given…, run_intelligence_pipeline() (+44 more)

### Community 2 - "AI Forensics Copilot Agent"
Cohesion: 0.11
Nodes (32): EntityInspector(), EntityInspectorProps, EvidencePanel(), EvidencePanelProps, FindingList(), FindingListProps, FloatingGraphToolbar(), FloatingGraphToolbarProps (+24 more)

### Community 3 - "Authentication & RBAC System"
Cohesion: 0.13
Nodes (22): UserRole, new_ui_src_api_client_loginpayload, new_ui_src_api_client_user, new_ui_src_api_client_userrole, ForbiddenScreen(), ForbiddenScreenProps, LoginForm(), LoginFormProps (+14 more)

### Community 4 - "App Router & Shell Views"
Cohesion: 0.11
Nodes (21): api, BackendTraceDetail, App(), AppRoutes(), HeroGraph(), HeroGraphProps, UnavailableBanner(), UnavailableBannerProps (+13 more)

### Community 5 - "OSINT Crawler & VASP Seeding"
Cohesion: 0.09
Nodes (17): init_db(), on_startup(), ExchangeCrawler, Validate Ethereum address format., Use SerpAPI or web search to find exchange deposit wallet addresses., Crawl and seed database with verified and discovered exchange wallet addresses., test_address_validation(), test_crawler_initialization() (+9 more)

### Community 6 - "ML Behavioral Clustering"
Cohesion: 0.12
Nodes (17): Any, Groups wallets based on transaction features and behavioral patterns using…, Group wallets by similarity using K-Means. Returns: { "clusters": {cluster_id:…, WalletClusterer, Any, Train on synthetic typical crypto transaction patterns so predict() works out…, Extract normalized ML features from wallet transaction data. Features: 1.…, Predict risk score between 0.0 (safe/normal) and 1.0 (high-risk/anomalous). (+9 more)

### Community 7 - "Blockchain BFS Tracing Engine"
Cohesion: 0.12
Nodes (13): BlockchainTracer, Any, Asynchronously insert all edges into Neo4j graph in a single batch., Score risk of all wallets using ML Isolation Forest model with in-memory graph…, Check if an address belongs to a known VASP / CEX / Mixer with in-memory…, Identify known VASP exchanges and mixers from cache and database., BFS multi-hop graph traversal starting from victim source wallet or fraud…, Neo4jClient (+5 more)

### Community 8 - "Evidence & Entity Inspection UI"
Cohesion: 0.16
Nodes (17): EvidenceExportModal(), EvidenceExportModalProps, FraudTxPicker(), FraudTxPickerProps, Header(), HeaderProps, HomeScreenProps, LeftPanel() (+9 more)

### Community 9 - "AI Forensics Copilot Agent"
Cohesion: 0.09
Nodes (21): API_BASE_URL, apiClient, BackendGraphEdge, BackendGraphNode, CopilotChatPayload, FreezeNoticePayload, SecurityEventDetail, SecurityEventListener (+13 more)

### Community 10 - "Case Management & Complaints"
Cohesion: 0.14
Nodes (20): CaseItem, CreateCasePayload, DataMode, StartCaseTracePayload, new_ui_src_api_client_caseitem, new_ui_src_api_client_complaintsource, createCase(), new_ui_src_api_client_createcasepayload (+12 more)

### Community 11 - "AI Forensics Copilot Agent"
Cohesion: 0.19
Nodes (14): Background execution runner for traces., run_trace_task(), get_db(), get_db_engine(), ClusteringResult, websocket, websocket_notifications(), websocket_trace() (+6 more)

### Community 12 - "Case Management & Complaints"
Cohesion: 0.12
Nodes (15): ErrorBoundaryProps, ErrorBoundaryState, ForensicWorkstation(), BottomStatusBar(), BottomStatusBarProps, CanvasOverlayControls(), CanvasOverlayControlsProps, PlaybackControlBar() (+7 more)

### Community 13 - "ML Behavioral Clustering"
Cohesion: 0.19
Nodes (17): cluster_trace_wallets(), generate_freeze_notice_endpoint(), post, Start a blockchain forensics trace from a victim wallet address or fraud…, Run K-Means clustering algorithm on wallets involved in the trace., Generate and return a court-admissible PDF Freeze Notice under Section 91 CrPC., start_trace(), ExchangeMatch (+9 more)

### Community 14 - "ML Behavioral Clustering"
Cohesion: 0.23
Nodes (18): create_clustering_result(), create_complaint(), create_freeze_notice(), create_trace(), get_all_wallet_labels(), get_complaint(), get_complaints(), get_freeze_notice() (+10 more)

### Community 15 - "Subsystem dependencies"
Cohesion: 0.11
Nodes (19): dependencies, axios, dotenv, express, framer-motion, @google/genai, lucide-react, motion (+11 more)

### Community 16 - "UI Component Module 16"
Cohesion: 0.11
Nodes (17): name, private, type, version, autoprefixer, axios, dotenv, esbuild (+9 more)

### Community 17 - "ML Behavioral Clustering"
Cohesion: 0.18
Nodes (13): CHROMATIC_OFFSET, ForensicCanvas3D(), ARCHITECTURAL_POSITIONS, calculateRequiredCameraDistance(), computeBasePositions(), getHopClusterCenter(), getNodeHop(), GraphVisualizer() (+5 more)

### Community 18 - "OSINT Crawler & VASP Seeding"
Cohesion: 0.31
Nodes (9): asyncio, celery, collections, hashlib, logging, os, requests, time (+1 more)

### Community 19 - "ML Behavioral Clustering"
Cohesion: 0.17
Nodes (16): get_case_exits(), get_cross_complaints(), get_cytoscape_graph(), get_gas_parent_clusters(), get_trace_result(), get_wallet_labels(), list_recent_traces(), get (+8 more)

### Community 20 - "Blockchain BFS Tracing Engine"
Cohesion: 0.17
Nodes (11): NoticeGenerator, Generate formal legal freeze notice PDF for serving to Crypto Exchanges /…, io, reportlab_lib, reportlab_lib_pagesizes, reportlab_lib_styles, reportlab_platypus, benchmark_pdf_generation() (+3 more)

### Community 21 - "Deterministic Intelligence Engine"
Cohesion: 0.23
Nodes (13): Finding, FindingSeverity, getFindings(), recomputeFindings(), FindingCard(), FindingCardProps, formatRuleName(), getSeverityBadge() (+5 more)

### Community 22 - "Subsystem tsconfig.json"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+7 more)

### Community 23 - "Authentication & RBAC System"
Cohesion: 0.15
Nodes (10): authStub, LoginPayload, STUB_USERS, User, casesStore, casesStub, CaseStatus, ComplaintSource (+2 more)

### Community 24 - "Deterministic Intelligence Engine"
Cohesion: 0.20
Nodes (13): getCase(), ForensicWorkstationInner(), FORENSIC_FINDINGS, generateDynamicTraceData(), generateHexAddress(), SAMPLE_EDGES, SAMPLE_NODES, stringToSeed() (+5 more)

### Community 25 - "OSINT Crawler & VASP Seeding"
Cohesion: 0.29
Nodes (13): Complaint, Trace, Base, main(), Romance Scam with Privacy Mixer Hop: 8 hops through Tornado.Cash to CoinDCX, Ransomware Extortion: 15 hops peeling chain cashout into Kraken & Coinbase, Pre-seed database with 3 realistic, high-impact cryptocurrency fraud scenarios:…, Investment Ponzi Scheme: 12 hops ending at Binance KYC deposit wallet (+5 more)

### Community 26 - "Evidence & Entity Inspection UI"
Cohesion: 0.20
Nodes (12): new_ui_src_api_client_evidencebundle, new_ui_src_api_client_evidencemismatch, new_ui_src_api_client_evidenceverificationresult, exportEvidence(), verifyEvidence(), EvidenceBundle, EvidenceMismatch, EvidenceVerificationResult (+4 more)

### Community 27 - "AI Forensics Copilot Agent"
Cohesion: 0.26
Nodes (11): CopilotDrawerProps, ForensicCanvas3DProps, RightDossierPanel(), RightDossierPanelProps, Scene3DProps, Section91NoticeModal(), Section91NoticeModalProps, GraphEdgeData (+3 more)

### Community 28 - "Blockchain BFS Tracing Engine"
Cohesion: 0.26
Nodes (5): BlockchainClient, Get outgoing ERC-20 / ETH transfers for a real or synthetic address., Generates realistic synthetic outgoing transfers for continuous BFS traversal., Fetch balance in ETH/Tokens., Fetch transaction details with caching and RPC/mock fallback.

### Community 29 - "Deterministic Intelligence Engine"
Cohesion: 0.17
Nodes (10): test_case_intelligence_endpoints(), httpx, json, pathlib, main(), run_server(), Server, uuid (+2 more)

### Community 30 - "Subsystem test_rpc_client.py"
Cohesion: 0.15
Nodes (7): client(), fixture, test_cache_hit_speed(), test_get_balance(), test_get_transaction(), test_get_transfers(), pytest

### Community 31 - "Blockchain BFS Tracing Engine"
Cohesion: 0.22
Nodes (11): new_ui_src_api_client_exitdetail, generateNoticeDraft(), new_ui_src_api_client_noticedraftresult, new_ui_src_api_client_vasptier, NoticeDraftResult, ExitDetail, ExitCard(), ExitCardProps (+3 more)

### Community 32 - "AI Forensics Copilot Agent"
Cohesion: 0.24
Nodes (10): CopilotChatResponse, copilotHealth(), CopilotHealthResponse, copilotQuery(), CopilotChat(), CopilotChatProps, QUICK_PROMPTS, ChatMessage (+2 more)

### Community 33 - "Cytoscape Graph Visualizer"
Cohesion: 0.24
Nodes (5): Any, Representation of a fund transfer relationship in Neo4j. MATCH…, Representation of a wallet node in the Neo4j graph. MATCH (w:Wallet {address:…, TransferEdge, WalletNode

### Community 34 - "Deterministic Intelligence Engine"
Cohesion: 0.22
Nodes (10): _extract_edges_from_trace(), get_findings(), Any, get, post, Session, Extracts edges from Trace.hops_data if available; falls back to…, Retrieve findings for a trace. TEMPORARY STUB: If findings were recomputed in… (+2 more)

### Community 35 - "ML Behavioral Clustering"
Cohesion: 0.27
Nodes (8): new_ui_src_api_client_gasparentcluster, getGasParentClusters(), GasParentCluster, CitationChip(), CitationChipProps, GasParentClusterView(), fetchClusters(), GasParentClusterViewProps

### Community 36 - "UI Component Module 36"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express, @types/node, typescript (+1 more)

### Community 37 - "AI Forensics Copilot Agent"
Cohesion: 0.42
Nodes (8): answerQuery(), CopilotDrawer(), fmt(), getExits(), getHighRisk(), getTotalEth(), toEth(), CopilotMessage

### Community 38 - "ML Behavioral Clustering"
Cohesion: 0.32
Nodes (7): cluster_wallets(), generate_freeze_notice_task(), Celery task: Build statutory freeze PDF and save record., Main async Celery task: 1. Traverses blockchain transaction graph via BFS 2.…, Celery task: Run K-Means ML clustering on wallets in a trace., trace_blockchain(), task

### Community 39 - "AI Forensics Copilot Agent"
Cohesion: 0.33
Nodes (7): ChatMessagePayload, ChatResponse, copilot_chat(), BaseModel, post, Session, POST /api/v1/cases/{case_id}/copilot/chat Executes grounded forensic copilot…

### Community 40 - "Case Management & Complaints"
Cohesion: 0.43
Nodes (6): new_ui_src_api_client_crosscomplaintmatch, getCrossComplaintMatches(), CrossComplaintMatch, CrossComplaintView(), fetchMatches(), CrossComplaintViewProps

### Community 41 - "Deterministic Intelligence Engine"
Cohesion: 0.33
Nodes (6): LeftSidebar(), LeftSidebarProps, SEVERITY_COLORS, NODE_CONFIG, PRESET_TRACES, ForensicFindingItem

### Community 43 - "UI Component Module 43"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

### Community 44 - "Deterministic Intelligence Engine"
Cohesion: 0.33
Nodes (5): intelligenceVizStub, STUB_CROSS_COMPLAINT_MATCHES, STUB_EXITS, STUB_GAS_CLUSTERS, VaspTier

### Community 46 - "UI Component Module 46"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 47 - "Subsystem edges_fixture.py"
Cohesion: 0.50
Nodes (4): make_fan_in_edges(), make_fan_out_edges(), Any, Hand-written edges[] fixture matching the frozen contract in Blueprint Section…

### Community 48 - "Case Management & Complaints"
Cohesion: 0.50
Nodes (5): getExits(), startCaseTrace(), useCaseDetail(), CaseDetailPage(), fetchExits()

### Community 49 - "Subsystem InvestigationTimeline.tsx"
Cohesion: 0.40
Nodes (3): InvestigationTimelineProps, TIMELINE_HOPS, TimelineHop

### Community 50 - "Subsystem vite.config.ts"
Cohesion: 0.40
Nodes (4): ref_path, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 51 - "Subsystem HeroEmblemNetwork.tsx"
Cohesion: 0.50
Nodes (3): EdgeConnection, HeroEmblemNetwork(), NodePoint

### Community 52 - "Trace & Freeze Notice API"
Cohesion: 0.67
Nodes (3): health_check(), get, Service health and uptime endpoint.

## Knowledge Gaps
- **125 isolated node(s):** `init-db.sh script`, `name`, `private`, `version`, `type` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 297 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Authentication & RBAC System` to `AI Forensics Copilot Agent`, `AI Forensics Copilot Agent`, `ML Behavioral Clustering`, `App Router & Shell Views`, `AI Forensics Copilot Agent`, `Case Management & Complaints`, `Evidence & Entity Inspection UI`, `Case Management & Complaints`, `Deterministic Intelligence Engine`, `Case Management & Complaints`, `UI Component Module 16`, `ML Behavioral Clustering`, `Subsystem InvestigationTimeline.tsx`, `Subsystem HeroEmblemNetwork.tsx`, `Deterministic Intelligence Engine`, `Evidence & Entity Inspection UI`, `AI Forensics Copilot Agent`, `Blockchain BFS Tracing Engine`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Evidence & Entity Inspection UI` to `AI Forensics Copilot Agent`, `AI Forensics Copilot Agent`, `ML Behavioral Clustering`, `Authentication & RBAC System`, `App Router & Shell Views`, `AI Forensics Copilot Agent`, `Case Management & Complaints`, `Deterministic Intelligence Engine`, `Case Management & Complaints`, `Case Management & Complaints`, `UI Component Module 16`, `Subsystem InvestigationTimeline.tsx`, `Deterministic Intelligence Engine`, `Evidence & Entity Inspection UI`, `AI Forensics Copilot Agent`, `Blockchain BFS Tracing Engine`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Trace` connect `OSINT Crawler & VASP Seeding` to `AI Forensics Copilot Agent`, `Deterministic Intelligence Engine`, `ML Behavioral Clustering`, `AI Forensics Copilot Agent`, `ML Behavioral Clustering`, `ML Behavioral Clustering`, `OSINT Crawler & VASP Seeding`, `ML Behavioral Clustering`, `Blockchain BFS Tracing Engine`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `Trace` (e.g. with `cluster_trace_wallets()` and `generate_freeze_notice_endpoint()`) actually correct?**
  _`Trace` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `BlockchainClient` (e.g. with `BlockchainTracer` and `client()`) actually correct?**
  _`BlockchainClient` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `BlockchainTracer` (e.g. with `BlockchainClient` and `WalletLabel`) actually correct?**
  _`BlockchainTracer` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `init-db.sh script`, `name`, `private` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._