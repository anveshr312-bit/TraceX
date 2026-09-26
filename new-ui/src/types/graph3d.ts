export type NodeType = 
  | 'FRAUD_ORIGIN'
  | 'PEEL_CHAIN'
  | 'MIXER'
  | 'EXCHANGE_EXIT'
  | 'GAS_SPONSOR'
  | 'INTERMEDIATE';

export interface GraphNodeData {
  id: string;
  type: NodeType;
  address: string;
  label: string;
  balance: string;
  balanceEth: number;
  balanceUsd: number;
  riskScore: number;
  tags?: string[];
  firstSeen?: string;
  lastSeen?: string;
  txHistory?: {
    direction: 'IN' | 'OUT';
    amount: string;
    counterparty: string;
    block: number;
  }[];
  evidenceIds?: string[];
  connectedFindings?: string[];
  position?: [number, number, number];
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  taintAmount: number;
  evidenceId: string;
  hopIndex: number;
  blockNumber: number;
  timestamp?: string;
}

export interface ForensicFindingItem {
  id: string;
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  matchedNodeIds: string[];
}
