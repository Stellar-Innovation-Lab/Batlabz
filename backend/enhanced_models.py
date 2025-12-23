# ==================== ENHANCED MODELS & AI FEATURES ====================
# Add to server.py after existing models

from typing import Literal
import random
import math

# ==================== NEW ENUMS ====================
class AuditAction(str, Enum):
    WALLET_TOPUP = "wallet_topup"
    WALLET_DEBIT = "wallet_debit"
    WALLET_REFUND = "wallet_refund"
    WALLET_WITHDRAWAL = "wallet_withdrawal"
    MATCH_PAYMENT = "match_payment"
    GROUND_BOOKING = "ground_booking"
    GROUND_BOOKING_CANCEL = "ground_booking_cancel"
    TEAM_POOL_DEPOSIT = "team_pool_deposit"
    TEAM_POOL_WITHDRAW = "team_pool_withdraw"
    MATCH_CREATED = "match_created"
    MATCH_CANCELLED = "match_cancelled"
    MATCH_COMPLETED = "match_completed"

# ==================== AUDIT & LEDGER MODELS ====================
class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: AuditAction
    user_id: str
    entity_type: str  # "wallet", "match", "booking", "team"
    entity_id: str
    amount: Optional[float] = None
    balance_before: Optional[float] = None
    balance_after: Optional[float] = None
    metadata: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WalletLedger(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    transaction_id: str
    debit: float = 0.0
    credit: float = 0.0
    balance: float
    description: str
    reference_type: str  # "match", "booking", "topup", "refund", "withdrawal"
    reference_id: Optional[str] = None
    idempotency_key: Optional[str] = None  # Prevent duplicates
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== PLAYER STATS & SCORING MODELS ====================
class PlayerStats(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    # Match Stats
    total_matches: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    matches_drawn: int = 0
    win_rate: float = 0.0
    # Reliability Metrics
    matches_confirmed: int = 0
    matches_attended: int = 0
    attendance_rate: float = 100.0
    on_time_payments: int = 0
    late_payments: int = 0
    payment_reliability: float = 100.0
    no_shows: int = 0
    cancellations: int = 0
    # Performance by Ground
    ground_stats: Dict[str, Dict[str, Any]] = {}  # ground_id -> {matches, wins, performance}
    # Performance by Format
    format_stats: Dict[str, Dict[str, Any]] = {}  # format -> {matches, wins}
    # Impact Score (0-100)
    impact_score: float = 50.0
    reliability_score: float = 100.0
    overall_rating: float = 50.0
    # Team Chemistry
    teammates_played_with: Dict[str, int] = {}  # user_id -> count
    preferred_teammates: List[str] = []
    # Recent Form (last 10 matches)
    recent_results: List[str] = []  # "W", "L", "D"
    form_score: float = 50.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TeamStats(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    total_matches: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    matches_drawn: int = 0
    win_rate: float = 0.0
    current_streak: int = 0  # positive = wins, negative = losses
    longest_win_streak: int = 0
    # Ground Performance
    ground_performance: Dict[str, Dict[str, Any]] = {}
    # Head to Head
    head_to_head: Dict[str, Dict[str, Any]] = {}  # opponent_team_id -> {played, won, lost}
    # Average Stats
    avg_score: float = 0.0
    avg_players_per_match: float = 0.0
    # Financial
    total_spent: float = 0.0
    avg_match_cost: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== AI MATCHMAKING MODELS ====================
class MatchmakingRequest(BaseModel):
    team_id: str
    preferred_date: Optional[datetime] = None
    format: MatchFormat = MatchFormat.T20
    skill_range: str = "similar"  # "similar", "higher", "lower", "any"
    preferred_grounds: List[str] = []

class MatchmakingResult(BaseModel):
    opponent_team: Dict[str, Any]
    compatibility_score: float  # 0-100
    predicted_match_quality: float
    suggested_grounds: List[Dict[str, Any]]
    head_to_head: Optional[Dict[str, Any]] = None
    recommendation_reason: str

class TeamPrediction(BaseModel):
    team1_id: str
    team2_id: str
    team1_win_probability: float
    team2_win_probability: float
    draw_probability: float
    factors: List[Dict[str, Any]]
    confidence: float
    predicted_score_range: Optional[Dict[str, Any]] = None

class PlayerRecommendation(BaseModel):
    player: Dict[str, Any]
    compatibility_score: float
    strengths: List[str]
    impact_prediction: float
    recommendation_reason: str

# ==================== ENHANCED CAPTAIN DASHBOARD ====================
class CaptainFinancialSummary(BaseModel):
    total_due: float = 0.0
    total_collected: float = 0.0
    total_pending: float = 0.0
    total_refunded: float = 0.0
    collection_rate: float = 0.0
    players_paid: int = 0
    players_pending: int = 0
    team_wallet_balance: float = 0.0
    recent_transactions: List[Dict[str, Any]] = []

class MatchFinancialDetail(BaseModel):
    match_id: str
    match_title: str
    match_date: datetime
    total_cost: float
    ground_booking_cost: float = 0.0
    other_costs: float = 0.0
    total_collected: float = 0.0
    total_pending: float = 0.0
    refunded_amount: float = 0.0
    player_payments: List[Dict[str, Any]] = []
    ground_booking: Optional[Dict[str, Any]] = None
