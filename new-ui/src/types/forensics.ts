export type NodeType = 
  | 'victim' 
  | 'culprit' 
  | 'mule' 
  | 'mixer' 
  | 'vasp' 
  | 'gas_sponsor' 
  | 'intermediary';

export type VisMode = 'tree' | 'graph' | 'heat' | 'flow';

export interface ForensicNode {
  id: string;
  label: string;
  address: string;
  type: NodeType;
  hop: number;
  balanceEth: number;
  balanceUsd: number;
  riskScore: number; // 0 - 100
  taintRatio: number; // 0 - 100%
  tags: string[];
  firstSeen: string;
  lastSeen: string;
  txCount: number;
  evidenceId: string;
  x: number;
  y: number;
  tier: number; // 0 to 4
  vaspName?: string;
  sanctionList?: string;
}

export interface ForensicEdge {
  id: string;
  source: string;
  target: string;
  hash: string;
  amountEth: number;
  amountUsd: number;
  timestamp: string;
  blockNumber: number;
  hop: number;
  rulesTriggered: string[];
  gasFeeGwei: number;
  method: string;
  tokenSymbol: string;
  evidenceId: string;
  streamWeight?: number;
}

export interface ForensicFinding {
  id: string;
  code: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  matchedEdgeIds: string[];
  matchedNodeIds: string[];
  description: string;
  indicator: string;
  evidenceRef: string;
  metricsSummary: string;
}

export interface TerminalEntityNode {
  id: string;
  categoryId: 'peel' | 'mixer' | 'gas' | 'vasp';
  name: string;
  subtitle?: string;
  address: string;
  badgeTier: string; // e.g. "TIER_A", "TIER_B", "HOP_02"
  amountEth: number;
  amountInr: string; // e.g. "₹13.58L"
  amountUsd: number;
  status: 'Pending Section 91 Notice' | 'Frozen' | 'Active' | 'Under Review' | 'Flagged';
  statusColor: string;
  riskRating: number; // 0 - 100
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  hops: number;
  flaggedFirsCount: number;
  vaspRegistration?: string;
  patternAnalysisNote: string;
  txHash: string;
  evidenceId: string;
  tags: string[];
  firstSeen: string;
  lastSeen: string;
}

export interface TreeCategoryCard {
  id: 'peel' | 'mixer' | 'gas' | 'vasp';
  title: string;
  badge: string; // "4 Chains", "1 Mixer", "1 Common Funder", "3 Exits"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  severityColor: string;
  accentColor: string;
  borderGlowColor: string;
  description: string;
  terminalNodes: TerminalEntityNode[];
}

export interface CentralAnchorRoot {
  id: string;
  txHash: string;
  address: string;
  label: string;
  stolenEth: number;
  stolenInr: string;
  stolenUsd: number;
  timestamp: string;
  blockNumber: number;
  status: string;
  firNumber: string;
}

export interface ForensicCase {
  id: string;
  title: string;
  firNumber: string;
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW';
  totalStolenEth: number;
  totalStolenUsd: number;
  victimEntity: string;
  chain: string;
  createdAt: string;
  officerName: string;
  officerBadge: string;
  rootAnchor: CentralAnchorRoot;
  categories: TreeCategoryCard[];
  nodes: ForensicNode[];
  edges: ForensicEdge[];
  findings: ForensicFinding[];
}

export interface CopilotCitation {
  type: 'transaction' | 'finding' | 'wallet' | 'evidence' | 'category';
  id: string;
  label: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: CopilotCitation[];
  isDisclaimer?: boolean;
}

export interface EvidenceRecord {
  evidenceId: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  sourceAddress: string;
  targetAddress: string;
  taintAmountEth: number;
  taintRatio: number;
  entityType: string;
  methodCalled: string;
  notes: string;
}
