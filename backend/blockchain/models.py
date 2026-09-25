from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Union, Literal

class TransactionDetail(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    hash: str
    from_address: str = Field(..., alias="from")
    to_address: Optional[str] = Field(None, alias="to")
    value: str = "0"
    gas_used: Optional[str] = "21000"
    block_number: Optional[int] = 0
    timestamp: Optional[str] = None
    asset: Optional[str] = "ETH"
    chain: Optional[str] = "ETH"


class HopRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    hop_number: int
    from_address: str = Field(..., alias="from")
    to_address: str = Field(..., alias="to")
    value: Union[float, str]
    tx_hash: str
    asset: str = "ETH"
    chain: str = "ETH"
    timestamp: Optional[str] = None
    # REQUIRED FORENSIC FIELDS FOR PERSON 2 INTELLIGENCE & GRAPH:
    edge_id: Optional[str] = None
    taint_amount: Optional[float] = 0.0
    taint_source_tx: Optional[str] = None
    evidence_id: Optional[str] = None  # Format: "sha256:<hex>"
    boundary_type: Literal["NONE", "EXCHANGE", "DEX", "MIXER"] = "NONE"
    data_mode: Literal["LIVE", "CACHED", "SIMULATION", "UNAVAILABLE"] = "LIVE"


class ExchangeMatch(BaseModel):
    address: str
    name: str
    confidence: float
    source: str = "Internal"
    entity_type: str = "EXCHANGE"


class TraceRequest(BaseModel):
    # Primary entrypoint required by Person 2's FraudTxPicker
    fraud_tx_hash: Optional[str] = Field(None, description="66-char EVM fraud transaction hash", pattern="^0x[a-fA-F0-9]{64}$")
    # Retain victim_wallet for backward compatibility
    victim_wallet: Optional[str] = Field(None, description="Victim wallet address")
    tx_hashes: List[str] = []
    complaint_id: Optional[str] = Field(None, description="Associated FIR / NCRP ID")
    max_hops: Optional[int] = Field(15, description="Maximum forward hops (1-15)")
    max_nodes: Optional[int] = Field(5000, description="Hard node safety budget")
    stop_at_vasp: Optional[bool] = Field(True, description="Halt branch when known exchange is hit")
    chain: str = Field("ETH", description="Target blockchain (ETH, POLYGON)")
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    from_block: Optional[str] = None
    to_block: Optional[str] = None


class TraceResponse(BaseModel):
    trace_id: str
    status: str
    message: Optional[str] = "Trace initiated successfully"


class TraceResult(BaseModel):
    trace_id: str
    complaint_id: Optional[str] = None
    source: str
    hops: List[Dict[str, Any]]
    hops_count: int
    risk_scores: Dict[str, float] = {}
    aggregate_risk_score: float = 0.0
    identified_exchanges: List[Dict[str, Any]] = []
    target_vasp: Optional[str] = None
    timestamp: str


class FreezeNoticeRequest(BaseModel):
    trace_id: str
    exchange_name: str
    confidence_level: Optional[str] = "HIGH"
    investigator_name: Optional[str] = "Officer Cyber Cell (I4C)"
    fir_number: Optional[str] = None
