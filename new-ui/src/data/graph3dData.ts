import { GraphNodeData, GraphEdgeData, ForensicFindingItem } from '../types/graph3d';

export const SAMPLE_NODES: GraphNodeData[] = [
  { 
    id: 'fraud-origin', 
    type: 'FRAUD_ORIGIN', 
    address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97', 
    label: 'Fraud Origin', 
    balance: '142.5 ETH', 
    balanceEth: 142.5,
    balanceUsd: 498750,
    riskScore: 98,
    tags: ['Known Phisher', 'OFAC Sanctioned', 'Malicious Drainer'],
    firstSeen: '24-Sep 14:28 UTC',
    lastSeen: '24-Sep 14:30 UTC',
    txHistory: [
      { direction: 'IN', amount: '142.5 ETH', counterparty: '0x9f8e...3b2a', block: 18234001 },
      { direction: 'OUT', amount: '45.2 ETH', counterparty: '0x7a25...488D', block: 18234012 },
      { direction: 'OUT', amount: '32.8 ETH', counterparty: '0xdAC1...1ec7', block: 18234015 },
      { direction: 'OUT', amount: '12.4 ETH', counterparty: '0xA0b8...eB48', block: 18234018 },
    ],
    evidenceIds: ['EVD-001', 'EVD-002', 'EVD-003', 'EVD-004'],
    connectedFindings: ['R1', 'R5', 'R6', 'R8']
  },
  { 
    id: 'peel-1', 
    type: 'PEEL_CHAIN', 
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 
    label: 'Peel Chain 1', 
    balance: '45.2 ETH', 
    balanceEth: 45.2,
    balanceUsd: 158200,
    riskScore: 85,
    tags: ['Peel Spigot', 'Sub-minute Dwell'],
    firstSeen: '24-Sep 14:31 UTC',
    lastSeen: '24-Sep 14:35 UTC',
    txHistory: [
      { direction: 'IN', amount: '45.2 ETH', counterparty: '0x4838...5f97', block: 18234012 },
      { direction: 'OUT', amount: '18.1 ETH', counterparty: '0x6B17...1d0F', block: 18234025 },
      { direction: 'OUT', amount: '27.1 ETH', counterparty: '0xD4e9...E2a9', block: 18234028 },
    ],
    evidenceIds: ['EVD-001', 'EVD-005', 'EVD-006'],
    connectedFindings: ['R1', 'R2', 'R6']
  },
  { 
    id: 'peel-2', 
    type: 'PEEL_CHAIN', 
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
    label: 'Peel Chain 2', 
    balance: '32.8 ETH', 
    balanceEth: 32.8,
    balanceUsd: 114800,
    riskScore: 82,
    tags: ['Layering Node', 'High Velocity'],
    firstSeen: '24-Sep 14:32 UTC',
    lastSeen: '24-Sep 14:36 UTC',
    txHistory: [
      { direction: 'IN', amount: '32.8 ETH', counterparty: '0x4838...5f97', block: 18234015 },
      { direction: 'OUT', amount: '8.7 ETH', counterparty: '0x2260...C599', block: 18234030 },
      { direction: 'OUT', amount: '24.1 ETH', counterparty: '0x7221...6967', block: 18234033 },
    ],
    evidenceIds: ['EVD-002', 'EVD-007', 'EVD-008'],
    connectedFindings: ['R1', 'R2', 'R6']
  },
  { 
    id: 'peel-3', 
    type: 'PEEL_CHAIN', 
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
    label: 'Peel Chain 3', 
    balance: '18.1 ETH', 
    balanceEth: 18.1,
    balanceUsd: 63350,
    riskScore: 78,
    tags: ['Sub-Mule', 'Structuring'],
    firstSeen: '24-Sep 14:35 UTC',
    lastSeen: '24-Sep 14:40 UTC',
    txHistory: [
      { direction: 'IN', amount: '18.1 ETH', counterparty: '0x7a25...488D', block: 18234025 },
      { direction: 'OUT', amount: '18.1 ETH', counterparty: '0x28C6...1d60', block: 18234045 },
    ],
    evidenceIds: ['EVD-005', 'EVD-009'],
    connectedFindings: ['R1', 'R4']
  },
  { 
    id: 'mixer-1', 
    type: 'MIXER', 
    address: '0xD4e96eF8eee8678dBFf4d535E033Ed1a71F7E2a9', 
    label: 'Tornado Cash Router', 
    balance: '???', 
    balanceEth: 0,
    balanceUsd: 0,
    riskScore: 95,
    tags: ['Tornado Cash User', 'OFAC Sanctioned', 'ZK Pool'],
    firstSeen: '24-Sep 14:36 UTC',
    lastSeen: '24-Sep 14:42 UTC',
    txHistory: [
      { direction: 'IN', amount: '27.1 ETH', counterparty: '0x7a25...488D', block: 18234028 },
      { direction: 'OUT', amount: '27.1 ETH', counterparty: '0x28C6...1d60', block: 18234050 },
    ],
    evidenceIds: ['EVD-006', 'EVD-010', 'EVD-016'],
    connectedFindings: ['R2', 'R4']
  },
  { 
    id: 'mixer-2', 
    type: 'MIXER', 
    address: '0x722122dF12D4e14e13Ac3b6895a86e84145b6967', 
    label: 'Tornado Cash Proxy', 
    balance: '???', 
    balanceEth: 0,
    balanceUsd: 0,
    riskScore: 95,
    tags: ['Tornado Cash User', 'Anonymization Relay'],
    firstSeen: '24-Sep 14:38 UTC',
    lastSeen: '24-Sep 14:44 UTC',
    txHistory: [
      { direction: 'IN', amount: '24.1 ETH', counterparty: '0xdAC1...1ec7', block: 18234033 },
      { direction: 'OUT', amount: '24.1 ETH', counterparty: '0x21a3...5549', block: 18234055 },
    ],
    evidenceIds: ['EVD-008', 'EVD-011'],
    connectedFindings: ['R2', 'R4']
  },
  { 
    id: 'exit-1', 
    type: 'EXCHANGE_EXIT', 
    address: '0x28C6c06298d514Db089934071355E5743bf21d60', 
    label: 'Binance Hot Wallet', 
    balance: '67.3 ETH', 
    balanceEth: 67.3,
    balanceUsd: 235550,
    riskScore: 40,
    tags: ['FIU-IND Tier A', 'Custodial Exit', 'Sec 91 Candidate'],
    firstSeen: '24-Sep 14:45 UTC',
    lastSeen: '24-Sep 15:05 UTC',
    txHistory: [
      { direction: 'IN', amount: '18.1 ETH', counterparty: '0x6B17...1d0F', block: 18234045 },
      { direction: 'IN', amount: '27.1 ETH', counterparty: '0xD4e9...E2a9', block: 18234050 },
      { direction: 'IN', amount: '6.1 ETH', counterparty: '0xC02a...56Cc2', block: 18234062 },
    ],
    evidenceIds: ['EVD-009', 'EVD-010', 'EVD-014'],
    connectedFindings: ['R4']
  },
  { 
    id: 'exit-2', 
    type: 'EXCHANGE_EXIT', 
    address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', 
    label: 'Binance Cold Wallet', 
    balance: '23.1 ETH', 
    balanceEth: 23.1,
    balanceUsd: 80850,
    riskScore: 35,
    tags: ['Exchange Custody', 'Target for Freezing'],
    firstSeen: '24-Sep 14:48 UTC',
    lastSeen: '24-Sep 15:10 UTC',
    txHistory: [
      { direction: 'IN', amount: '24.1 ETH', counterparty: '0x7221...6967', block: 18234055 },
      { direction: 'IN', amount: '8.7 ETH', counterparty: '0x2260...C599', block: 18234058 },
    ],
    evidenceIds: ['EVD-011', 'EVD-013'],
    connectedFindings: ['R4']
  },
  { 
    id: 'gas-1', 
    type: 'GAS_SPONSOR', 
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', 
    label: 'Gas Funder A', 
    balance: '5.2 ETH', 
    balanceEth: 5.2,
    balanceUsd: 18200,
    riskScore: 70,
    tags: ['Pre-Attack Gas Seed', 'MEV Relayer'],
    firstSeen: '24-Sep 14:15 UTC',
    lastSeen: '24-Sep 14:26 UTC',
    txHistory: [
      { direction: 'OUT', amount: '0.05 ETH', counterparty: '0x4838...5f97', block: 18233995 },
      { direction: 'OUT', amount: '0.02 ETH', counterparty: '0xD4e9...E2a9', block: 18234020 },
    ],
    evidenceIds: ['EVD-004', 'EVD-016'],
    connectedFindings: ['R5']
  },
  { 
    id: 'gas-2', 
    type: 'GAS_SPONSOR', 
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 
    label: 'Gas Funder B', 
    balance: '3.8 ETH', 
    balanceEth: 3.8,
    balanceUsd: 13300,
    riskScore: 65,
    tags: ['Secondary Funder', 'Relayer Cluster'],
    firstSeen: '24-Sep 14:20 UTC',
    lastSeen: '24-Sep 14:28 UTC',
    txHistory: [
      { direction: 'OUT', amount: '0.03 ETH', counterparty: '0xdAC1...1ec7', block: 18234010 },
    ],
    evidenceIds: ['EVD-015'],
    connectedFindings: ['R5']
  },
  { 
    id: 'inter-1', 
    type: 'INTERMEDIATE', 
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
    label: 'Hop Wallet', 
    balance: '12.4 ETH', 
    balanceEth: 12.4,
    balanceUsd: 43400,
    riskScore: 55,
    tags: ['Single Hop', 'Passthrough'],
    firstSeen: '24-Sep 14:32 UTC',
    lastSeen: '24-Sep 14:38 UTC',
    txHistory: [
      { direction: 'IN', amount: '12.4 ETH', counterparty: '0x4838...5f97', block: 18234018 },
      { direction: 'OUT', amount: '6.1 ETH', counterparty: '0xC02a...56Cc2', block: 18234035 },
    ],
    evidenceIds: ['EVD-003', 'EVD-012'],
    connectedFindings: ['R8']
  },
  { 
    id: 'inter-2', 
    type: 'INTERMEDIATE', 
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 
    label: 'Relay Wallet', 
    balance: '8.7 ETH', 
    balanceEth: 8.7,
    balanceUsd: 30450,
    riskScore: 50,
    tags: ['Rapid Transit', 'Mule Buffer'],
    firstSeen: '24-Sep 14:35 UTC',
    lastSeen: '24-Sep 14:45 UTC',
    txHistory: [
      { direction: 'IN', amount: '8.7 ETH', counterparty: '0xdAC1...1ec7', block: 18234030 },
      { direction: 'OUT', amount: '8.7 ETH', counterparty: '0x21a3...5549', block: 18234058 },
    ],
    evidenceIds: ['EVD-007', 'EVD-013'],
    connectedFindings: ['R8']
  },
  { 
    id: 'inter-3', 
    type: 'INTERMEDIATE', 
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
    label: 'Staging Wallet', 
    balance: '6.1 ETH', 
    balanceEth: 6.1,
    balanceUsd: 21350,
    riskScore: 48,
    tags: ['Pre-Deposit Staging'],
    firstSeen: '24-Sep 14:38 UTC',
    lastSeen: '24-Sep 14:50 UTC',
    txHistory: [
      { direction: 'IN', amount: '6.1 ETH', counterparty: '0xA0b8...eB48', block: 18234035 },
      { direction: 'OUT', amount: '6.1 ETH', counterparty: '0x28C6...1d60', block: 18234062 },
    ],
    evidenceIds: ['EVD-012', 'EVD-014'],
    connectedFindings: ['R8']
  },
];

export const SAMPLE_EDGES: GraphEdgeData[] = [
  { id: 'e-1', source: 'fraud-origin', target: 'peel-1', taintAmount: 45.2, evidenceId: 'EVD-001', hopIndex: 1, blockNumber: 18234012 },
  { id: 'e-2', source: 'fraud-origin', target: 'peel-2', taintAmount: 32.8, evidenceId: 'EVD-002', hopIndex: 1, blockNumber: 18234015 },
  { id: 'e-3', source: 'fraud-origin', target: 'inter-1', taintAmount: 12.4, evidenceId: 'EVD-003', hopIndex: 1, blockNumber: 18234018 },
  { id: 'e-4', source: 'fraud-origin', target: 'gas-1', taintAmount: 0.05, evidenceId: 'EVD-004', hopIndex: 0, blockNumber: 18234005 },
  { id: 'e-5', source: 'peel-1', target: 'peel-3', taintAmount: 18.1, evidenceId: 'EVD-005', hopIndex: 2, blockNumber: 18234025 },
  { id: 'e-6', source: 'peel-1', target: 'mixer-1', taintAmount: 27.1, evidenceId: 'EVD-006', hopIndex: 2, blockNumber: 18234028 },
  { id: 'e-7', source: 'peel-2', target: 'inter-2', taintAmount: 8.7, evidenceId: 'EVD-007', hopIndex: 2, blockNumber: 18234030 },
  { id: 'e-8', source: 'peel-2', target: 'mixer-2', taintAmount: 24.1, evidenceId: 'EVD-008', hopIndex: 2, blockNumber: 18234033 },
  { id: 'e-9', source: 'peel-3', target: 'exit-1', taintAmount: 18.1, evidenceId: 'EVD-009', hopIndex: 3, blockNumber: 18234045 },
  { id: 'e-10', source: 'mixer-1', target: 'exit-1', taintAmount: 27.1, evidenceId: 'EVD-010', hopIndex: 3, blockNumber: 18234050 },
  { id: 'e-11', source: 'mixer-2', target: 'exit-2', taintAmount: 24.1, evidenceId: 'EVD-011', hopIndex: 3, blockNumber: 18234055 },
  { id: 'e-12', source: 'inter-1', target: 'inter-3', taintAmount: 6.1, evidenceId: 'EVD-012', hopIndex: 2, blockNumber: 18234035 },
  { id: 'e-13', source: 'inter-2', target: 'exit-2', taintAmount: 8.7, evidenceId: 'EVD-013', hopIndex: 3, blockNumber: 18234058 },
  { id: 'e-14', source: 'inter-3', target: 'exit-1', taintAmount: 6.1, evidenceId: 'EVD-014', hopIndex: 3, blockNumber: 18234062 },
  { id: 'e-15', source: 'gas-2', target: 'peel-2', taintAmount: 0.03, evidenceId: 'EVD-015', hopIndex: 0, blockNumber: 18234010 },
  { id: 'e-16', source: 'gas-1', target: 'mixer-1', taintAmount: 0.02, evidenceId: 'EVD-016', hopIndex: 0, blockNumber: 18234020 },
];

export const FORENSIC_FINDINGS: ForensicFindingItem[] = [
  {
    id: 'R1',
    code: 'R1',
    severity: 'CRITICAL',
    title: 'Peel-chain detected',
    description: '3 sequential split hops with sub-minute dwell times',
    matchedNodeIds: ['peel-1', 'peel-2', 'peel-3'],
  },
  {
    id: 'R2',
    code: 'R2',
    severity: 'HIGH',
    title: 'Mixer boundary',
    description: 'Tornado Cash interaction at hop 2 diverting 51.2 ETH',
    matchedNodeIds: ['mixer-1', 'mixer-2'],
  },
  {
    id: 'R4',
    code: 'R4',
    severity: 'HIGH',
    title: 'Exchange exit cluster',
    description: '67.3 ETH landed at Binance KYC Hot/Cold Wallets',
    matchedNodeIds: ['exit-1', 'exit-2'],
  },
  {
    id: 'R5',
    code: 'R5',
    severity: 'MEDIUM',
    title: 'Gas sponsor cluster',
    description: '2 wallets funded multi-sig and contract deployment gas',
    matchedNodeIds: ['gas-1', 'gas-2'],
  },
  {
    id: 'R6',
    code: 'R6',
    severity: 'MEDIUM',
    title: 'Round-amount structuring',
    description: '45.2, 32.8 ETH tranches evading immediate reporting thresholds',
    matchedNodeIds: ['peel-1', 'peel-2'],
  },
  {
    id: 'R8',
    code: 'R8',
    severity: 'LOW',
    title: 'Timing anomaly',
    description: '3 txns executed synchronously within 12-second window',
    matchedNodeIds: ['inter-1', 'inter-2', 'inter-3'],
  },
];

export const PRESET_TRACES = [
  {
    label: 'Live On-Chain Tx',
    hash: '0x62bd3d31a7b75c098ccf28bc4d4af8c4a191b4b9e451fab4232258079e8b18c4',
    caseTitle: 'Case #TRX-2024-00847 — Live On-Chain Trace (0x62bd...)',
  },
  {
    label: 'Phishing Drain',
    hash: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
    caseTitle: 'Case #TRX-2024-00847 — Phishing Drain',
  },
  {
    label: 'Rug Pull',
    hash: '0x9b31982c9e7821038471bdf2348c1e89b091f092',
    caseTitle: 'Case #TRX-2024-00912 — DeFi Liquidity Rug Pull',
  },
  {
    label: 'Bridge Exploit',
    hash: '0x202b918239018240918204981204981204981204',
    caseTitle: 'Case #TRX-2024-01044 — Cross-Chain Bridge Exploit',
  },
];

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

function generateHexAddress(seed: number, prefix: string = '0x'): string {
  let hex = '';
  for (let i = 0; i < 40; i++) {
    const val = (seed * (i + 13) * 31 + i * 17) % 16;
    hex += val.toString(16);
  }
  return prefix + hex;
}

export function generateDynamicTraceData(input: string, customTitle?: string) {
  const cleanInput = input.trim();
  const seed = stringToSeed(cleanInput);
  const archetype = Math.abs(seed) % 4; // 0: Wide Fan-Out (13 nodes), 1: Streamlined Direct (7 nodes), 2: DeFi Matrix (10 nodes), 3: Cross-Chain Bridge (12 nodes)

  // Format origin address deterministically
  let originAddress = cleanInput;
  if (!originAddress.startsWith('0x') || originAddress.length < 20) {
    originAddress = generateHexAddress(seed);
  } else if (originAddress.length > 42) {
    originAddress = '0x' + originAddress.slice(2, 42);
  }

  const originLabelDisplay = cleanInput.length <= 14 
    ? `Origin (${cleanInput})` 
    : `Origin (${originAddress.slice(0, 6)}...${originAddress.slice(-4)})`;

  const totalEth = Number((((seed % 280) + 45) * 1.35).toFixed(2));
  const totalUsd = Math.round(totalEth * 3420);
  const startBlock = 18234000 + (seed % 5000);

  let nodes: GraphNodeData[] = [];
  let edges: GraphEdgeData[] = [];

  if (archetype === 0) {
    // -------------------------------------------------------------
    // ARCHETYPE 0: Wide Fan-Out Peel Syndicate (13 Nodes, 4 Hops)
    // -------------------------------------------------------------
    const p1Eth = Number((totalEth * 0.32).toFixed(2));
    const p2Eth = Number((totalEth * 0.28).toFixed(2));
    const p3Eth = Number((totalEth * 0.22).toFixed(2));
    const p4Eth = Number((totalEth - p1Eth - p2Eth - p3Eth).toFixed(2));
    const m1Eth = Number((p1Eth + p2Eth * 0.5).toFixed(2));
    const m2Eth = Number((p3Eth + p4Eth * 0.5).toFixed(2));

    nodes = [
      {
        id: `origin-${seed}`,
        type: 'FRAUD_ORIGIN',
        address: originAddress,
        label: originLabelDisplay,
        balance: `${totalEth} ETH`,
        balanceEth: totalEth,
        balanceUsd: totalUsd,
        riskScore: 98,
        tags: ['Wide Peel Siphon', 'Mempool Drainer'],
        evidenceIds: [`EVD-ROOT-${seed % 999}`],
        position: [-18, 0, 0],
      },
      {
        id: `gas1-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 1),
        label: 'Gas Sponsor Alpha',
        balance: '4.8 ETH',
        balanceEth: 4.8,
        balanceUsd: 16416,
        riskScore: 78,
        position: [-18, 5.8, -3.0],
      },
      {
        id: `gas2-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 2),
        label: 'Gas Sponsor Beta',
        balance: '2.5 ETH',
        balanceEth: 2.5,
        balanceUsd: 8550,
        riskScore: 72,
        position: [-18, -5.8, 3.0],
      },
      {
        id: `peel1-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 11),
        label: 'Peel Mule 01 (Tranche A)',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 89,
        position: [-7, 6.5, 3.5],
      },
      {
        id: `peel2-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 12),
        label: 'Peel Mule 02 (Tranche B)',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 86,
        position: [-7, 2.2, -3.2],
      },
      {
        id: `peel3-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 13),
        label: 'Peel Mule 03 (Tranche C)',
        balance: `${p3Eth} ETH`,
        balanceEth: p3Eth,
        balanceUsd: Math.round(p3Eth * 3420),
        riskScore: 84,
        position: [-7, -2.2, 3.2],
      },
      {
        id: `peel4-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 14),
        label: 'Peel Mule 04 (Tranche D)',
        balance: `${p4Eth} ETH`,
        balanceEth: p4Eth,
        balanceUsd: Math.round(p4Eth * 3420),
        riskScore: 82,
        position: [-7, -6.5, -3.5],
      },
      {
        id: `mix1-${seed}`,
        type: 'MIXER',
        address: generateHexAddress(seed + 21),
        label: 'Tornado Cash Pool (100 ETH)',
        balance: `${m1Eth} ETH`,
        balanceEth: m1Eth,
        balanceUsd: Math.round(m1Eth * 3420),
        riskScore: 97,
        position: [4, 4.8, 2.2],
      },
      {
        id: `mix2-${seed}`,
        type: 'MIXER',
        address: generateHexAddress(seed + 22),
        label: 'Railgun Privacy Relayer',
        balance: `${m2Eth} ETH`,
        balanceEth: m2Eth,
        balanceUsd: Math.round(m2Eth * 3420),
        riskScore: 94,
        position: [4, -4.8, -2.2],
      },
      {
        id: `exit1-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 31),
        label: 'Binance Hot Wallet 14',
        balance: `${(m1Eth * 0.55).toFixed(2)} ETH`,
        balanceEth: Number((m1Eth * 0.55).toFixed(2)),
        balanceUsd: Math.round(m1Eth * 0.55 * 3420),
        riskScore: 99,
        position: [16, 6.2, 2.0],
      },
      {
        id: `exit2-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 32),
        label: 'OKX Custodial Gateway',
        balance: `${(m1Eth * 0.45).toFixed(2)} ETH`,
        balanceEth: Number((m1Eth * 0.45).toFixed(2)),
        balanceUsd: Math.round(m1Eth * 0.45 * 3420),
        riskScore: 96,
        position: [16, 2.2, -1.8],
      },
      {
        id: `exit3-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 33),
        label: 'Bybit Institutional Sweep',
        balance: `${(m2Eth * 0.52).toFixed(2)} ETH`,
        balanceEth: Number((m2Eth * 0.52).toFixed(2)),
        balanceUsd: Math.round(m2Eth * 0.52 * 3420),
        riskScore: 95,
        position: [16, -2.2, 1.8],
      },
      {
        id: `exit4-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 34),
        label: 'Coinbase Prime Vault',
        balance: `${(m2Eth * 0.48).toFixed(2)} ETH`,
        balanceEth: Number((m2Eth * 0.48).toFixed(2)),
        balanceUsd: Math.round(m2Eth * 0.48 * 3420),
        riskScore: 94,
        position: [16, -6.2, -2.0],
      },
    ];

    edges = [
      { id: `e0-1-${seed}`, source: `gas1-${seed}`, target: `origin-${seed}`, taintAmount: 4.8, evidenceId: 'EVD-GAS-1', hopIndex: 0, blockNumber: startBlock },
      { id: `e0-2-${seed}`, source: `gas2-${seed}`, target: `origin-${seed}`, taintAmount: 2.5, evidenceId: 'EVD-GAS-2', hopIndex: 0, blockNumber: startBlock },
      { id: `e1-1-${seed}`, source: `origin-${seed}`, target: `peel1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-P1', hopIndex: 1, blockNumber: startBlock + 1 },
      { id: `e1-2-${seed}`, source: `origin-${seed}`, target: `peel2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-P2', hopIndex: 1, blockNumber: startBlock + 2 },
      { id: `e1-3-${seed}`, source: `origin-${seed}`, target: `peel3-${seed}`, taintAmount: p3Eth, evidenceId: 'EVD-P3', hopIndex: 1, blockNumber: startBlock + 3 },
      { id: `e1-4-${seed}`, source: `origin-${seed}`, target: `peel4-${seed}`, taintAmount: p4Eth, evidenceId: 'EVD-P4', hopIndex: 1, blockNumber: startBlock + 4 },
      { id: `e2-1-${seed}`, source: `peel1-${seed}`, target: `mix1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-M1', hopIndex: 2, blockNumber: startBlock + 8 },
      { id: `e2-2-${seed}`, source: `peel2-${seed}`, target: `mix1-${seed}`, taintAmount: Number((p2Eth * 0.5).toFixed(2)), evidenceId: 'EVD-M2', hopIndex: 2, blockNumber: startBlock + 10 },
      { id: `e2-3-${seed}`, source: `peel3-${seed}`, target: `mix2-${seed}`, taintAmount: p3Eth, evidenceId: 'EVD-M3', hopIndex: 2, blockNumber: startBlock + 12 },
      { id: `e2-4-${seed}`, source: `peel4-${seed}`, target: `mix2-${seed}`, taintAmount: Number((p4Eth * 0.5).toFixed(2)), evidenceId: 'EVD-M4', hopIndex: 2, blockNumber: startBlock + 14 },
      { id: `e3-1-${seed}`, source: `mix1-${seed}`, target: `exit1-${seed}`, taintAmount: Number((m1Eth * 0.55).toFixed(2)), evidenceId: 'EVD-VASP-1', hopIndex: 3, blockNumber: startBlock + 22 },
      { id: `e3-2-${seed}`, source: `mix1-${seed}`, target: `exit2-${seed}`, taintAmount: Number((m1Eth * 0.45).toFixed(2)), evidenceId: 'EVD-VASP-2', hopIndex: 3, blockNumber: startBlock + 24 },
      { id: `e3-3-${seed}`, source: `mix2-${seed}`, target: `exit3-${seed}`, taintAmount: Number((m2Eth * 0.52).toFixed(2)), evidenceId: 'EVD-VASP-3', hopIndex: 3, blockNumber: startBlock + 26 },
      { id: `e3-4-${seed}`, source: `mix2-${seed}`, target: `exit4-${seed}`, taintAmount: Number((m2Eth * 0.48).toFixed(2)), evidenceId: 'EVD-VASP-4', hopIndex: 3, blockNumber: startBlock + 28 },
    ];
  } else if (archetype === 1) {
    // -------------------------------------------------------------
    // ARCHETYPE 1: Rapid Linear Consolidation (7 Nodes, Streamlined)
    // -------------------------------------------------------------
    const p1Eth = Number((totalEth * 0.60).toFixed(2));
    const p2Eth = Number((totalEth - p1Eth).toFixed(2));

    nodes = [
      {
        id: `origin-${seed}`,
        type: 'FRAUD_ORIGIN',
        address: originAddress,
        label: originLabelDisplay,
        balance: `${totalEth} ETH`,
        balanceEth: totalEth,
        balanceUsd: totalUsd,
        riskScore: 94,
        tags: ['Direct Exploit Siphon'],
        position: [-14, 0, 0],
      },
      {
        id: `gas-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 1),
        label: 'Gas Relayer',
        balance: '3.1 ETH',
        balanceEth: 3.1,
        balanceUsd: 10602,
        riskScore: 70,
        position: [-14, 4.2, -2.0],
      },
      {
        id: `peel1-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 11),
        label: 'Fast Transit Mule',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 88,
        position: [-4, 3.2, 1.2],
      },
      {
        id: `peel2-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 12),
        label: 'Secondary Mule',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 85,
        position: [-4, -3.2, -1.2],
      },
      {
        id: `mix-${seed}`,
        type: 'MIXER',
        address: generateHexAddress(seed + 21),
        label: 'Wasabi CoinJoin Vault',
        balance: `${totalEth} ETH`,
        balanceEth: totalEth,
        balanceUsd: totalUsd,
        riskScore: 95,
        position: [5, 0, 0],
      },
      {
        id: `exit1-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 31),
        label: 'WazirX Recovery Desk',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 98,
        position: [15, 3.8, 1.5],
      },
      {
        id: `exit2-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 32),
        label: 'CoinDCX Statutory Custody',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 96,
        position: [15, -3.8, -1.5],
      },
    ];

    edges = [
      { id: `e0-${seed}`, source: `gas-${seed}`, target: `origin-${seed}`, taintAmount: 3.1, evidenceId: 'EVD-GAS', hopIndex: 0, blockNumber: startBlock },
      { id: `e1-1-${seed}`, source: `origin-${seed}`, target: `peel1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-P1', hopIndex: 1, blockNumber: startBlock + 1 },
      { id: `e1-2-${seed}`, source: `origin-${seed}`, target: `peel2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-P2', hopIndex: 1, blockNumber: startBlock + 2 },
      { id: `e2-1-${seed}`, source: `peel1-${seed}`, target: `mix-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-M1', hopIndex: 2, blockNumber: startBlock + 5 },
      { id: `e2-2-${seed}`, source: `peel2-${seed}`, target: `mix-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-M2', hopIndex: 2, blockNumber: startBlock + 6 },
      { id: `e3-1-${seed}`, source: `mix-${seed}`, target: `exit1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-EX1', hopIndex: 3, blockNumber: startBlock + 12 },
      { id: `e3-2-${seed}`, source: `mix-${seed}`, target: `exit2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-EX2', hopIndex: 3, blockNumber: startBlock + 14 },
    ];
  } else if (archetype === 2) {
    // -------------------------------------------------------------
    // ARCHETYPE 2: DeFi Matrix & Wash-Trade Hub (10 Nodes)
    // -------------------------------------------------------------
    const p1Eth = Number((totalEth * 0.55).toFixed(2));
    const p2Eth = Number((totalEth - p1Eth).toFixed(2));
    const routerEth = Number((totalEth * 0.45).toFixed(2));

    nodes = [
      {
        id: `origin-${seed}`,
        type: 'FRAUD_ORIGIN',
        address: originAddress,
        label: originLabelDisplay,
        balance: `${totalEth} ETH`,
        balanceEth: totalEth,
        balanceUsd: totalUsd,
        riskScore: 96,
        tags: ['Smart Contract Reentrancy'],
        position: [-16, 0, 0],
      },
      {
        id: `gas1-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 1),
        label: 'Flash Loan Funder',
        balance: '6.2 ETH',
        balanceEth: 6.2,
        balanceUsd: 21204,
        riskScore: 80,
        position: [-16, 4.5, 2.5],
      },
      {
        id: `gas2-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 2),
        label: 'Contract Deployer',
        balance: '3.4 ETH',
        balanceEth: 3.4,
        balanceUsd: 11628,
        riskScore: 75,
        position: [-16, -4.5, -2.5],
      },
      {
        id: `peel1-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 11),
        label: 'Liquidity Siphon A',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 87,
        position: [-7, 4.2, 0],
      },
      {
        id: `peel2-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 12),
        label: 'Liquidity Siphon B',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 84,
        position: [-7, -4.2, 0],
      },
      {
        id: `router-${seed}`,
        type: 'INTERMEDIATE',
        address: generateHexAddress(seed + 20),
        label: 'Uniswap V3 Pair Relay',
        balance: `${routerEth} ETH`,
        balanceEth: routerEth,
        balanceUsd: Math.round(routerEth * 3420),
        riskScore: 68,
        position: [-1, 0, 4.2],
      },
      {
        id: `mix1-${seed}`,
        type: 'MIXER',
        address: generateHexAddress(seed + 21),
        label: 'Cyclone Protocol',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 95,
        position: [6, 4.0, -2.5],
      },
      {
        id: `mix2-${seed}`,
        type: 'MIXER',
        address: generateHexAddress(seed + 22),
        label: 'Tornado Cash 10 ETH Pool',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 93,
        position: [6, -4.0, 2.5],
      },
      {
        id: `exit1-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 31),
        label: 'Binance Sweeper 9',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 97,
        position: [16, 3.2, 0],
      },
      {
        id: `exit2-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 32),
        label: 'KuCoin Institutional Depot',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 95,
        position: [16, -3.2, 0],
      },
    ];

    edges = [
      { id: `e0-1-${seed}`, source: `gas1-${seed}`, target: `origin-${seed}`, taintAmount: 6.2, evidenceId: 'EVD-G1', hopIndex: 0, blockNumber: startBlock },
      { id: `e0-2-${seed}`, source: `gas2-${seed}`, target: `origin-${seed}`, taintAmount: 3.4, evidenceId: 'EVD-G2', hopIndex: 0, blockNumber: startBlock },
      { id: `e1-1-${seed}`, source: `origin-${seed}`, target: `peel1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-P1', hopIndex: 1, blockNumber: startBlock + 1 },
      { id: `e1-2-${seed}`, source: `origin-${seed}`, target: `peel2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-P2', hopIndex: 1, blockNumber: startBlock + 2 },
      { id: `e2-1-${seed}`, source: `peel1-${seed}`, target: `router-${seed}`, taintAmount: routerEth, evidenceId: 'EVD-ROUTER', hopIndex: 2, blockNumber: startBlock + 6 },
      { id: `e2-2-${seed}`, source: `peel1-${seed}`, target: `mix1-${seed}`, taintAmount: Number((p1Eth - routerEth * 0.5).toFixed(2)), evidenceId: 'EVD-M1', hopIndex: 2, blockNumber: startBlock + 8 },
      { id: `e2-3-${seed}`, source: `peel2-${seed}`, target: `mix2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-M2', hopIndex: 2, blockNumber: startBlock + 10 },
      { id: `e2-4-${seed}`, source: `router-${seed}`, target: `mix1-${seed}`, taintAmount: Number((routerEth * 0.5).toFixed(2)), evidenceId: 'EVD-R1', hopIndex: 2, blockNumber: startBlock + 12 },
      { id: `e3-1-${seed}`, source: `mix1-${seed}`, target: `exit1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-EX1', hopIndex: 3, blockNumber: startBlock + 20 },
      { id: `e3-2-${seed}`, source: `mix2-${seed}`, target: `exit2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-EX2', hopIndex: 3, blockNumber: startBlock + 22 },
    ];
  } else {
    // -------------------------------------------------------------
    // ARCHETYPE 3: Cross-Chain Bridge & Relayer Network (12 Nodes)
    // -------------------------------------------------------------
    const p1Eth = Number((totalEth * 0.38).toFixed(2));
    const p2Eth = Number((totalEth * 0.34).toFixed(2));
    const p3Eth = Number((totalEth - p1Eth - p2Eth).toFixed(2));

    nodes = [
      {
        id: `origin-${seed}`,
        type: 'FRAUD_ORIGIN',
        address: originAddress,
        label: originLabelDisplay,
        balance: `${totalEth} ETH`,
        balanceEth: totalEth,
        balanceUsd: totalUsd,
        riskScore: 97,
        tags: ['Cross-Chain Vault Breach'],
        position: [-18, 0, 0],
      },
      {
        id: `gas1-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 1),
        label: 'Relayer Gas Node 1',
        balance: '5.5 ETH',
        balanceEth: 5.5,
        balanceUsd: 18810,
        riskScore: 76,
        position: [-18, 5.0, -2.5],
      },
      {
        id: `gas2-${seed}`,
        type: 'GAS_SPONSOR',
        address: generateHexAddress(seed + 2),
        label: 'Relayer Gas Node 2',
        balance: '4.1 ETH',
        balanceEth: 4.1,
        balanceUsd: 14022,
        riskScore: 73,
        position: [-18, -5.0, 2.5],
      },
      {
        id: `peel1-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 11),
        label: 'Peel Mule Upper',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 89,
        position: [-8, 5.2, 2.0],
      },
      {
        id: `peel2-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 12),
        label: 'Peel Mule Center',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 86,
        position: [-8, 0, -2.5],
      },
      {
        id: `peel3-${seed}`,
        type: 'PEEL_CHAIN',
        address: generateHexAddress(seed + 13),
        label: 'Peel Mule Lower',
        balance: `${p3Eth} ETH`,
        balanceEth: p3Eth,
        balanceUsd: Math.round(p3Eth * 3420),
        riskScore: 83,
        position: [-8, -5.2, 2.0],
      },
      {
        id: `bridge1-${seed}`,
        type: 'INTERMEDIATE',
        address: generateHexAddress(seed + 21),
        label: 'Portal Bridge Contract',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 70,
        position: [3, 4.8, -2.2],
      },
      {
        id: `mix-${seed}`,
        type: 'MIXER',
        address: generateHexAddress(seed + 22),
        label: 'Railgun Shielded Network',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 94,
        position: [3, 0, 0],
      },
      {
        id: `bridge2-${seed}`,
        type: 'INTERMEDIATE',
        address: generateHexAddress(seed + 23),
        label: 'Arbitrum Gateway Bridge',
        balance: `${p3Eth} ETH`,
        balanceEth: p3Eth,
        balanceUsd: Math.round(p3Eth * 3420),
        riskScore: 69,
        position: [3, -4.8, 2.2],
      },
      {
        id: `exit1-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 31),
        label: 'Kraken Multi-Sig Custody',
        balance: `${p1Eth} ETH`,
        balanceEth: p1Eth,
        balanceUsd: Math.round(p1Eth * 3420),
        riskScore: 97,
        position: [16, 5.0, 1.8],
      },
      {
        id: `exit2-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 32),
        label: 'Bitfinex Cold Storage',
        balance: `${p2Eth} ETH`,
        balanceEth: p2Eth,
        balanceUsd: Math.round(p2Eth * 3420),
        riskScore: 96,
        position: [16, 0, -2.0],
      },
      {
        id: `exit3-${seed}`,
        type: 'EXCHANGE_EXIT',
        address: generateHexAddress(seed + 33),
        label: 'Binance US Institutional',
        balance: `${p3Eth} ETH`,
        balanceEth: p3Eth,
        balanceUsd: Math.round(p3Eth * 3420),
        riskScore: 95,
        position: [16, -5.0, 1.8],
      },
    ];

    edges = [
      { id: `e0-1-${seed}`, source: `gas1-${seed}`, target: `origin-${seed}`, taintAmount: 5.5, evidenceId: 'EVD-G1', hopIndex: 0, blockNumber: startBlock },
      { id: `e0-2-${seed}`, source: `gas2-${seed}`, target: `origin-${seed}`, taintAmount: 4.1, evidenceId: 'EVD-G2', hopIndex: 0, blockNumber: startBlock },
      { id: `e1-1-${seed}`, source: `origin-${seed}`, target: `peel1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-P1', hopIndex: 1, blockNumber: startBlock + 1 },
      { id: `e1-2-${seed}`, source: `origin-${seed}`, target: `peel2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-P2', hopIndex: 1, blockNumber: startBlock + 2 },
      { id: `e1-3-${seed}`, source: `origin-${seed}`, target: `peel3-${seed}`, taintAmount: p3Eth, evidenceId: 'EVD-P3', hopIndex: 1, blockNumber: startBlock + 3 },
      { id: `e2-1-${seed}`, source: `peel1-${seed}`, target: `bridge1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-B1', hopIndex: 2, blockNumber: startBlock + 8 },
      { id: `e2-2-${seed}`, source: `peel2-${seed}`, target: `mix-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-M1', hopIndex: 2, blockNumber: startBlock + 10 },
      { id: `e2-3-${seed}`, source: `peel3-${seed}`, target: `bridge2-${seed}`, taintAmount: p3Eth, evidenceId: 'EVD-B2', hopIndex: 2, blockNumber: startBlock + 12 },
      { id: `e3-1-${seed}`, source: `bridge1-${seed}`, target: `exit1-${seed}`, taintAmount: p1Eth, evidenceId: 'EVD-E1', hopIndex: 3, blockNumber: startBlock + 22 },
      { id: `e3-2-${seed}`, source: `mix-${seed}`, target: `exit2-${seed}`, taintAmount: p2Eth, evidenceId: 'EVD-E2', hopIndex: 3, blockNumber: startBlock + 24 },
      { id: `e3-3-${seed}`, source: `bridge2-${seed}`, target: `exit3-${seed}`, taintAmount: p3Eth, evidenceId: 'EVD-E3', hopIndex: 3, blockNumber: startBlock + 26 },
    ];
  }

  const shortTitleInput = cleanInput.length <= 16 
    ? cleanInput 
    : `${cleanInput.slice(0, 8)}...${cleanInput.slice(-4)}`;
  const title = customTitle || `Case #TRX-2026-${(seed % 900) + 100} — Trace (${shortTitleInput} · ${totalEth} ETH)`;

  return { nodes, edges, title, startBlock };
}
