from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'batlabz_secret_key_2025')
JWT_ALGORITHM = "HS256"

app = FastAPI(title="Batlabz API", description="Cricket Pay & Play Platform")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== ENUMS ====================
class UserRole(str, Enum):
    PLAYER = "player"
    CAPTAIN = "captain"
    GROUND_OWNER = "ground_owner"
    ADMIN = "admin"

class PlayingRole(str, Enum):
    BATSMAN = "batsman"
    BOWLER = "bowler"
    ALL_ROUNDER = "all_rounder"
    WICKET_KEEPER = "wicket_keeper"

class MatchFormat(str, Enum):
    T10 = "T10"
    T20 = "T20"
    NETS = "nets"
    FRIENDLY = "friendly"

class MatchStatus(str, Enum):
    DRAFT = "draft"
    PLAYERS_INVITED = "players_invited"
    CONFIRMED = "confirmed"
    PAYMENTS_PENDING = "payments_pending"
    READY_TO_PLAY = "ready_to_play"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    REFUNDED = "refunded"
    PARTIAL = "partial"

class TransactionType(str, Enum):
    TOPUP = "topup"
    MATCH_PAYMENT = "match_payment"
    REFUND = "refund"
    GROUND_BOOKING = "ground_booking"
    WITHDRAWAL = "withdrawal"
    TEAM_POOL = "team_pool"

class InviteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class GroundType(str, Enum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"

class TurfType(str, Enum):
    NATURAL = "natural"
    ARTIFICIAL = "artificial"
    MATTING = "matting"

class RideStatus(str, Enum):
    NEED_RIDE = "need_ride"
    OFFERING_RIDE = "offering_ride"
    MATCHED = "matched"
    NONE = "none"

class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

# ==================== MODELS ====================

# Auth Models
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    is_new_user: bool

# User Models
class UserCreate(BaseModel):
    name: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    playing_role: PlayingRole = PlayingRole.ALL_ROUNDER
    preferred_locations: List[str] = []
    availability: Dict[str, bool] = {}

class UserUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    email: Optional[str] = None
    playing_role: Optional[PlayingRole] = None
    preferred_locations: Optional[List[str]] = None
    availability: Optional[Dict[str, bool]] = None
    profile_image: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: str = ""
    nickname: Optional[str] = None
    email: Optional[str] = None
    role: UserRole = UserRole.PLAYER
    playing_role: PlayingRole = PlayingRole.ALL_ROUNDER
    preferred_locations: List[str] = []
    availability: Dict[str, bool] = {}
    team_ids: List[str] = []
    wallet_balance: float = 0.0
    profile_image: Optional[str] = None
    matches_played: int = 0
    total_spent: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Team Models
class TeamCreate(BaseModel):
    name: str
    logo: Optional[str] = None
    home_location: str

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    home_location: Optional[str] = None
    vice_captain_id: Optional[str] = None

class TeamAnnouncement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    title: str
    message: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TeamMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    match_id: Optional[str] = None
    user_id: str
    user_name: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: Optional[str] = None
    home_location: str
    captain_id: str
    vice_captain_id: Optional[str] = None
    player_ids: List[str] = []
    blocked_ids: List[str] = []
    invite_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    pool_balance: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Match Models
class MatchCostBreakdown(BaseModel):
    ground_fee: float = 0.0
    umpire_fee: float = 0.0
    balls_equipment: float = 0.0
    miscellaneous: float = 0.0

class MatchCreate(BaseModel):
    title: str
    date: datetime
    location: str
    ground_id: Optional[str] = None
    format: MatchFormat = MatchFormat.T20
    player_limit: int = 22
    total_cost: float = 0.0
    cost_breakdown: MatchCostBreakdown = MatchCostBreakdown()
    extras: List[str] = []
    captain_discount: float = 0.0
    guest_surcharge: float = 0.0

class MatchUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    ground_id: Optional[str] = None
    format: Optional[MatchFormat] = None
    player_limit: Optional[int] = None
    total_cost: Optional[float] = None
    cost_breakdown: Optional[MatchCostBreakdown] = None
    extras: Optional[List[str]] = None
    status: Optional[MatchStatus] = None

class PlayerPayment(BaseModel):
    user_id: str
    user_name: str
    amount_due: float
    amount_paid: float = 0.0
    status: PaymentStatus = PaymentStatus.PENDING
    is_guest: bool = False
    paid_at: Optional[datetime] = None

class PlayerRide(BaseModel):
    user_id: str
    user_name: str
    status: RideStatus = RideStatus.NONE
    seats_available: int = 0
    pickup_location: Optional[str] = None
    matched_with: Optional[str] = None

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    title: str
    date: datetime
    location: str
    ground_id: Optional[str] = None
    ground_booking_id: Optional[str] = None
    format: MatchFormat
    player_limit: int = 22
    captain_id: str
    total_cost: float = 0.0
    cost_breakdown: MatchCostBreakdown = MatchCostBreakdown()
    per_player_cost: float = 0.0
    captain_discount: float = 0.0
    guest_surcharge: float = 0.0
    extras: List[str] = []
    status: MatchStatus = MatchStatus.DRAFT
    invited_player_ids: List[str] = []
    confirmed_player_ids: List[str] = []
    waiting_list_ids: List[str] = []
    player_payments: List[PlayerPayment] = []
    player_rides: List[PlayerRide] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MatchInviteResponse(BaseModel):
    response: str

class AddExpenseRequest(BaseModel):
    description: str
    amount: float

# Wallet Models
class WalletTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: TransactionType
    amount: float
    balance_after: float
    description: str
    reference_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TopupRequest(BaseModel):
    amount: float
    payment_method: str = "card"

class PayMatchRequest(BaseModel):
    match_id: str
    use_wallet: bool = True
    amount: Optional[float] = None

class TeamPoolRequest(BaseModel):
    team_id: str
    amount: float
    action: str  # "deposit" or "withdraw"

# Ground Models
class GroundSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    start_time: str
    end_time: str
    price: float
    is_available: bool = True
    booked_by: Optional[str] = None
    booking_id: Optional[str] = None
    match_id: Optional[str] = None

class GroundCreate(BaseModel):
    name: str
    location: str
    type: GroundType = GroundType.OUTDOOR
    turf_type: TurfType = TurfType.NATURAL
    has_lighting: bool = False
    has_parking: bool = True
    price_per_hour: float
    description: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []
    cancellation_hours: int = 24
    cancellation_fee_percent: float = 20.0

class GroundUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    type: Optional[GroundType] = None
    turf_type: Optional[TurfType] = None
    has_lighting: Optional[bool] = None
    has_parking: Optional[bool] = None
    price_per_hour: Optional[float] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None

class Ground(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    name: str
    location: str
    type: GroundType
    turf_type: TurfType
    has_lighting: bool = False
    has_parking: bool = True
    price_per_hour: float
    description: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []
    rating: float = 0.0
    total_bookings: int = 0
    total_earnings: float = 0.0
    slots: List[GroundSlot] = []
    cancellation_hours: int = 24
    cancellation_fee_percent: float = 20.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GroundBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ground_id: str
    ground_name: str
    slot_id: str
    user_id: str
    match_id: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    price: float
    status: BookingStatus = BookingStatus.CONFIRMED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookSlotRequest(BaseModel):
    ground_id: str
    slot_id: str
    match_id: Optional[str] = None

class CancelBookingRequest(BaseModel):
    booking_id: str
    reason: Optional[str] = None

# Ride Models
class RideUpdate(BaseModel):
    match_id: str
    status: RideStatus
    seats_available: Optional[int] = 0
    pickup_location: Optional[str] = None

# Notification Models
class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str
    reference_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# OTP Storage
otp_storage: Dict[str, str] = {}

# ==================== HELPERS ====================

def create_token(user_id: str) -> str:
    expiry = datetime.utcnow() + timedelta(days=30)
    payload = {"user_id": user_id, "exp": expiry}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_data = await db.users.find_one({"id": user_id})
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user_data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def create_notification(user_id: str, title: str, message: str, notif_type: str, reference_id: str = None):
    notification = Notification(user_id=user_id, title=title, message=message, type=notif_type, reference_id=reference_id)
    await db.notifications.insert_one(notification.dict())
    return notification

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def require_ground_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.GROUND_OWNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Ground owner access required")
    return current_user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/request-otp")
async def request_otp(request: OTPRequest):
    phone = request.phone.strip()
    otp = "123456"  # Mock OTP
    otp_storage[phone] = otp
    logger.info(f"OTP for {phone}: {otp}")
    return {"message": "OTP sent successfully", "otp": otp}

@api_router.post("/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerify):
    phone = request.phone.strip()
    otp = request.otp.strip()
    stored_otp = otp_storage.get(phone, "123456")
    if otp != stored_otp and otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user_data = await db.users.find_one({"phone": phone})
    is_new_user = False
    
    if not user_data:
        user = User(phone=phone)
        await db.users.insert_one(user.dict())
        user_data = user.dict()
        is_new_user = True
    
    token = create_token(user_data["id"])
    return TokenResponse(access_token=token, user_id=user_data["id"], is_new_user=is_new_user)

# ==================== USER ROUTES ====================

@api_router.get("/users/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/users/me")
async def update_me(update: UserUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    user_data = await db.users.find_one({"id": current_user.id})
    return User(**user_data)

@api_router.post("/users/complete-profile")
async def complete_profile(profile: UserCreate, current_user: User = Depends(get_current_user)):
    update_data = profile.dict()
    update_data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    user_data = await db.users.find_one({"id": current_user.id})
    return User(**user_data)

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_data)

@api_router.get("/users/search/{query}")
async def search_users(query: str, current_user: User = Depends(get_current_user)):
    users = await db.users.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"phone": {"$regex": query}}
        ]
    }).to_list(20)
    return [User(**u) for u in users]

@api_router.get("/users/me/match-history")
async def get_match_history(current_user: User = Depends(get_current_user)):
    matches = await db.matches.find({
        "$or": [
            {"confirmed_player_ids": current_user.id},
            {"captain_id": current_user.id}
        ],
        "status": MatchStatus.COMPLETED
    }).sort("date", -1).to_list(50)
    return [Match(**m) for m in matches]

@api_router.get("/users/me/payment-history")
async def get_payment_history(current_user: User = Depends(get_current_user)):
    transactions = await db.wallet_transactions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [WalletTransaction(**t) for t in transactions]

# ==================== TEAM ROUTES ====================

@api_router.post("/teams")
async def create_team(team_data: TeamCreate, current_user: User = Depends(get_current_user)):
    team = Team(**team_data.dict(), captain_id=current_user.id, player_ids=[current_user.id])
    await db.teams.insert_one(team.dict())
    await db.users.update_one({"id": current_user.id}, {"$set": {"role": UserRole.CAPTAIN}, "$push": {"team_ids": team.id}})
    return team

@api_router.get("/teams")
async def get_my_teams(current_user: User = Depends(get_current_user)):
    teams = await db.teams.find({
        "$or": [{"player_ids": current_user.id}, {"captain_id": current_user.id}]
    }).to_list(100)
    return [Team(**t) for t in teams]

@api_router.get("/teams/{team_id}")
async def get_team(team_id: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    return Team(**team_data)

@api_router.put("/teams/{team_id}")
async def update_team(team_id: str, update: TeamUpdate, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can update team")
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    await db.teams.update_one({"id": team_id}, {"$set": update_data})
    team_data = await db.teams.find_one({"id": team_id})
    return Team(**team_data)

@api_router.post("/teams/join/{invite_code}")
async def join_team_by_code(invite_code: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"invite_code": invite_code.upper()})
    if not team_data:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    if current_user.id in team_data.get("player_ids", []):
        raise HTTPException(status_code=400, detail="Already a member")
    if current_user.id in team_data.get("blocked_ids", []):
        raise HTTPException(status_code=403, detail="You have been blocked from this team")
    
    await db.teams.update_one({"id": team_data["id"]}, {"$push": {"player_ids": current_user.id}})
    await db.users.update_one({"id": current_user.id}, {"$push": {"team_ids": team_data["id"]}})
    await create_notification(team_data["captain_id"], "New Team Member", f"{current_user.name or 'A player'} joined {team_data['name']}", "team_join", team_data["id"])
    return {"message": "Successfully joined team", "team_id": team_data["id"]}

@api_router.get("/teams/{team_id}/players")
async def get_team_players(team_id: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    players = await db.users.find({"id": {"$in": team_data.get("player_ids", [])}}).to_list(100)
    return [User(**p) for p in players]

@api_router.delete("/teams/{team_id}/players/{player_id}")
async def remove_player(team_id: str, player_id: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can remove players")
    if player_id == team_data["captain_id"]:
        raise HTTPException(status_code=400, detail="Captain cannot be removed")
    
    await db.teams.update_one({"id": team_id}, {"$pull": {"player_ids": player_id}})
    await db.users.update_one({"id": player_id}, {"$pull": {"team_ids": team_id}})
    await create_notification(player_id, "Removed from Team", f"You have been removed from {team_data['name']}", "team_removed", team_id)
    return {"message": "Player removed"}

@api_router.post("/teams/{team_id}/block/{player_id}")
async def block_player(team_id: str, player_id: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can block players")
    
    await db.teams.update_one({"id": team_id}, {"$pull": {"player_ids": player_id}, "$addToSet": {"blocked_ids": player_id}})
    await db.users.update_one({"id": player_id}, {"$pull": {"team_ids": team_id}})
    return {"message": "Player blocked"}

@api_router.post("/teams/{team_id}/announcements")
async def create_announcement(team_id: str, title: str, message: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can create announcements")
    
    announcement = TeamAnnouncement(team_id=team_id, title=title, message=message, created_by=current_user.id)
    await db.team_announcements.insert_one(announcement.dict())
    
    for player_id in team_data.get("player_ids", []):
        if player_id != current_user.id:
            await create_notification(player_id, f"Team Announcement: {title}", message, "team_announcement", team_id)
    
    return announcement

@api_router.get("/teams/{team_id}/announcements")
async def get_announcements(team_id: str, current_user: User = Depends(get_current_user)):
    announcements = await db.team_announcements.find({"team_id": team_id}).sort("created_at", -1).to_list(50)
    return [TeamAnnouncement(**a) for a in announcements]

@api_router.post("/teams/{team_id}/messages")
async def send_message(team_id: str, message: str, match_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if current_user.id not in team_data.get("player_ids", []):
        raise HTTPException(status_code=403, detail="Not a team member")
    
    msg = TeamMessage(team_id=team_id, match_id=match_id, user_id=current_user.id, user_name=current_user.name or "Player", message=message)
    await db.team_messages.insert_one(msg.dict())
    return msg

@api_router.get("/teams/{team_id}/messages")
async def get_messages(team_id: str, match_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"team_id": team_id}
    if match_id:
        query["match_id"] = match_id
    messages = await db.team_messages.find(query).sort("created_at", -1).to_list(100)
    return [TeamMessage(**m) for m in messages]

@api_router.post("/teams/{team_id}/pool")
async def manage_team_pool(team_id: str, request: TeamPoolRequest, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can manage pool")
    
    current_pool = team_data.get("pool_balance", 0)
    
    if request.action == "deposit":
        if current_user.wallet_balance < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        new_pool = current_pool + request.amount
        new_wallet = current_user.wallet_balance - request.amount
        
        await db.users.update_one({"id": current_user.id}, {"$set": {"wallet_balance": new_wallet}})
        await db.teams.update_one({"id": team_id}, {"$set": {"pool_balance": new_pool}})
        
        transaction = WalletTransaction(user_id=current_user.id, type=TransactionType.TEAM_POOL, amount=-request.amount, balance_after=new_wallet, description=f"Team pool deposit: {team_data['name']}", reference_id=team_id)
        await db.wallet_transactions.insert_one(transaction.dict())
        
        return {"message": "Deposited to team pool", "new_pool_balance": new_pool}
    
    elif request.action == "withdraw":
        if current_pool < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient pool balance")
        new_pool = current_pool - request.amount
        new_wallet = current_user.wallet_balance + request.amount
        
        await db.users.update_one({"id": current_user.id}, {"$set": {"wallet_balance": new_wallet}})
        await db.teams.update_one({"id": team_id}, {"$set": {"pool_balance": new_pool}})
        
        transaction = WalletTransaction(user_id=current_user.id, type=TransactionType.TEAM_POOL, amount=request.amount, balance_after=new_wallet, description=f"Team pool withdrawal: {team_data['name']}", reference_id=team_id)
        await db.wallet_transactions.insert_one(transaction.dict())
        
        return {"message": "Withdrawn from team pool", "new_pool_balance": new_pool}

# ==================== MATCH ROUTES ====================

@api_router.post("/matches")
async def create_match(match_data: MatchCreate, team_id: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can create matches")
    
    match_dict = match_data.dict()
    match_dict["team_id"] = team_id
    match_dict["captain_id"] = current_user.id
    match = Match(**match_dict)
    await db.matches.insert_one(match.dict())
    return match

@api_router.get("/matches")
async def get_my_matches(current_user: User = Depends(get_current_user)):
    matches = await db.matches.find({
        "$or": [
            {"captain_id": current_user.id},
            {"invited_player_ids": current_user.id},
            {"confirmed_player_ids": current_user.id}
        ]
    }).sort("date", -1).to_list(100)
    return [Match(**m) for m in matches]

@api_router.get("/matches/team/{team_id}")
async def get_team_matches(team_id: str, current_user: User = Depends(get_current_user)):
    matches = await db.matches.find({"team_id": team_id}).sort("date", -1).to_list(100)
    return [Match(**m) for m in matches]

@api_router.get("/matches/{match_id}")
async def get_match(match_id: str, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    return Match(**match_data)

@api_router.put("/matches/{match_id}")
async def update_match(match_id: str, update: MatchUpdate, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can update match")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if "cost_breakdown" in update_data and hasattr(update_data["cost_breakdown"], 'dict'):
        update_data["cost_breakdown"] = update_data["cost_breakdown"].dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.matches.update_one({"id": match_id}, {"$set": update_data})
    match_data = await db.matches.find_one({"id": match_id})
    return Match(**match_data)

@api_router.post("/matches/{match_id}/invite")
async def invite_players(match_id: str, player_ids: List[str], current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can invite")
    
    await db.matches.update_one({"id": match_id}, {
        "$addToSet": {"invited_player_ids": {"$each": player_ids}},
        "$set": {"status": MatchStatus.PLAYERS_INVITED, "updated_at": datetime.utcnow()}
    })
    
    for player_id in player_ids:
        await create_notification(player_id, "Match Invitation", f"You've been invited to {match_data['title']}", "match_invite", match_id)
    
    return {"message": f"Invited {len(player_ids)} players"}

@api_router.post("/matches/{match_id}/respond")
async def respond_to_invite(match_id: str, response: MatchInviteResponse, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if response.response == "accept":
        confirmed = match_data.get("confirmed_player_ids", [])
        if len(confirmed) >= match_data["player_limit"]:
            await db.matches.update_one({"id": match_id}, {"$addToSet": {"waiting_list_ids": current_user.id}})
            return {"message": "Added to waiting list - match is full"}
        
        match_obj = Match(**match_data)
        per_player = match_obj.total_cost / match_obj.player_limit if match_obj.player_limit > 0 else 0
        
        payment = PlayerPayment(user_id=current_user.id, user_name=current_user.name or "Player", amount_due=per_player, status=PaymentStatus.PENDING)
        ride = PlayerRide(user_id=current_user.id, user_name=current_user.name or "Player")
        
        await db.matches.update_one({"id": match_id}, {
            "$addToSet": {"confirmed_player_ids": current_user.id},
            "$push": {"player_payments": payment.dict(), "player_rides": ride.dict()},
            "$set": {"per_player_cost": per_player, "updated_at": datetime.utcnow()}
        })
        
        await create_notification(match_data["captain_id"], "Player Confirmed", f"{current_user.name or 'A player'} confirmed for {match_data['title']}", "player_confirmed", match_id)
        return {"message": "Confirmed for match", "amount_due": per_player}
    else:
        await db.matches.update_one({"id": match_id}, {"$pull": {"invited_player_ids": current_user.id}})
        return {"message": "Invitation declined"}

@api_router.post("/matches/{match_id}/calculate-fees")
async def calculate_fees(match_id: str, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can calculate fees")
    
    confirmed_count = len(match_data.get("confirmed_player_ids", []))
    if confirmed_count == 0:
        raise HTTPException(status_code=400, detail="No confirmed players")
    
    per_player = match_data["total_cost"] / confirmed_count
    captain_discount = match_data.get("captain_discount", 0)
    guest_surcharge = match_data.get("guest_surcharge", 0)
    
    updated_payments = []
    for payment in match_data.get("player_payments", []):
        amount = per_player
        if payment["user_id"] == match_data["captain_id"] and captain_discount > 0:
            amount = per_player - captain_discount
        if payment.get("is_guest", False) and guest_surcharge > 0:
            amount = per_player + guest_surcharge
        
        payment["amount_due"] = amount
        if payment["amount_paid"] >= amount:
            payment["status"] = PaymentStatus.PAID
        elif payment["amount_paid"] > 0:
            payment["status"] = PaymentStatus.PARTIAL
        updated_payments.append(payment)
    
    await db.matches.update_one({"id": match_id}, {"$set": {
        "per_player_cost": per_player,
        "player_payments": updated_payments,
        "status": MatchStatus.PAYMENTS_PENDING,
        "updated_at": datetime.utcnow()
    }})
    
    for player_id in match_data.get("confirmed_player_ids", []):
        await create_notification(player_id, "Payment Due", f"Payment of AED {per_player:.2f} due for {match_data['title']}", "payment_due", match_id)
    
    return {"per_player_cost": per_player, "total_players": confirmed_count}

@api_router.post("/matches/{match_id}/add-expense")
async def add_expense(match_id: str, expense: AddExpenseRequest, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can add expenses")
    
    new_total = match_data["total_cost"] + expense.amount
    cost_breakdown = match_data.get("cost_breakdown", {})
    cost_breakdown["miscellaneous"] = cost_breakdown.get("miscellaneous", 0) + expense.amount
    
    await db.matches.update_one({"id": match_id}, {"$set": {
        "total_cost": new_total,
        "cost_breakdown": cost_breakdown,
        "updated_at": datetime.utcnow()
    }, "$push": {"extras": expense.description}})
    
    return {"message": "Expense added", "new_total": new_total}

@api_router.post("/matches/{match_id}/complete")
async def complete_match(match_id: str, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can complete match")
    
    await db.matches.update_one({"id": match_id}, {"$set": {"status": MatchStatus.COMPLETED, "updated_at": datetime.utcnow()}})
    
    for player_id in match_data.get("confirmed_player_ids", []):
        await db.users.update_one({"id": player_id}, {"$inc": {"matches_played": 1}})
    
    return {"message": "Match completed"}

@api_router.post("/matches/{match_id}/cancel")
async def cancel_match(match_id: str, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can cancel match")
    
    # Refund all payments
    for payment in match_data.get("player_payments", []):
        if payment["amount_paid"] > 0:
            user_data = await db.users.find_one({"id": payment["user_id"]})
            if user_data:
                new_balance = user_data["wallet_balance"] + payment["amount_paid"]
                await db.users.update_one({"id": payment["user_id"]}, {"$set": {"wallet_balance": new_balance}})
                
                transaction = WalletTransaction(user_id=payment["user_id"], type=TransactionType.REFUND, amount=payment["amount_paid"], balance_after=new_balance, description=f"Refund for cancelled match: {match_data['title']}", reference_id=match_id)
                await db.wallet_transactions.insert_one(transaction.dict())
                
                await create_notification(payment["user_id"], "Match Cancelled", f"{match_data['title']} has been cancelled. AED {payment['amount_paid']:.2f} refunded.", "match_cancelled", match_id)
    
    await db.matches.update_one({"id": match_id}, {"$set": {"status": MatchStatus.CANCELLED, "updated_at": datetime.utcnow()}})
    return {"message": "Match cancelled and refunds processed"}

@api_router.post("/matches/{match_id}/ride")
async def update_ride_status(match_id: str, ride: RideUpdate, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    player_rides = match_data.get("player_rides", [])
    for i, r in enumerate(player_rides):
        if r["user_id"] == current_user.id:
            player_rides[i]["status"] = ride.status
            player_rides[i]["seats_available"] = ride.seats_available or 0
            player_rides[i]["pickup_location"] = ride.pickup_location
            break
    
    await db.matches.update_one({"id": match_id}, {"$set": {"player_rides": player_rides}})
    return {"message": "Ride status updated"}

@api_router.get("/matches/{match_id}/rides")
async def get_ride_status(match_id: str, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    need_ride = [r for r in match_data.get("player_rides", []) if r["status"] == RideStatus.NEED_RIDE]
    offering_ride = [r for r in match_data.get("player_rides", []) if r["status"] == RideStatus.OFFERING_RIDE]
    
    return {"need_ride": need_ride, "offering_ride": offering_ride}

@api_router.get("/matches/{match_id}/summary")
async def get_match_summary(match_id: str, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    total_collected = sum(p["amount_paid"] for p in match_data.get("player_payments", []))
    total_due = sum(p["amount_due"] for p in match_data.get("player_payments", []))
    outstanding = total_due - total_collected
    
    paid_count = len([p for p in match_data.get("player_payments", []) if p["status"] == PaymentStatus.PAID])
    pending_count = len([p for p in match_data.get("player_payments", []) if p["status"] in [PaymentStatus.PENDING, PaymentStatus.PARTIAL]])
    
    return {
        "match": Match(**match_data),
        "total_collected": total_collected,
        "total_due": total_due,
        "outstanding": outstanding,
        "paid_count": paid_count,
        "pending_count": pending_count,
        "confirmed_count": len(match_data.get("confirmed_player_ids", [])),
        "waiting_count": len(match_data.get("waiting_list_ids", []))
    }

# ==================== WALLET ROUTES ====================

@api_router.get("/wallet/balance")
async def get_wallet_balance(current_user: User = Depends(get_current_user)):
    return {"balance": current_user.wallet_balance}

@api_router.get("/wallet/transactions")
async def get_wallet_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.wallet_transactions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [WalletTransaction(**t) for t in transactions]

@api_router.post("/wallet/topup")
async def topup_wallet(request: TopupRequest, current_user: User = Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    new_balance = current_user.wallet_balance + request.amount
    transaction = WalletTransaction(user_id=current_user.id, type=TransactionType.TOPUP, amount=request.amount, balance_after=new_balance, description=f"Wallet top-up via {request.payment_method}")
    await db.wallet_transactions.insert_one(transaction.dict())
    await db.users.update_one({"id": current_user.id}, {"$set": {"wallet_balance": new_balance}, "$inc": {"total_spent": 0}})
    
    return {"message": "Top-up successful", "new_balance": new_balance, "transaction_id": transaction.id}

@api_router.post("/wallet/pay-match")
async def pay_for_match(request: PayMatchRequest, current_user: User = Depends(get_current_user)):
    match_data = await db.matches.find_one({"id": request.match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    player_payment = None
    payment_index = -1
    for i, p in enumerate(match_data.get("player_payments", [])):
        if p["user_id"] == current_user.id:
            player_payment = p
            payment_index = i
            break
    
    if not player_payment:
        raise HTTPException(status_code=400, detail="No payment record found")
    
    amount_remaining = player_payment["amount_due"] - player_payment.get("amount_paid", 0)
    payment_amount = request.amount if request.amount else amount_remaining
    
    if payment_amount > amount_remaining:
        payment_amount = amount_remaining
    
    if request.use_wallet:
        if current_user.wallet_balance < payment_amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        new_balance = current_user.wallet_balance - payment_amount
        transaction = WalletTransaction(user_id=current_user.id, type=TransactionType.MATCH_PAYMENT, amount=-payment_amount, balance_after=new_balance, description=f"Payment for match: {match_data['title']}", reference_id=request.match_id)
        await db.wallet_transactions.insert_one(transaction.dict())
        await db.users.update_one({"id": current_user.id}, {"$set": {"wallet_balance": new_balance}, "$inc": {"total_spent": payment_amount}})
    
    new_paid = player_payment.get("amount_paid", 0) + payment_amount
    new_status = PaymentStatus.PAID if new_paid >= player_payment["amount_due"] else PaymentStatus.PARTIAL
    
    await db.matches.update_one(
        {"id": request.match_id},
        {"$set": {
            f"player_payments.{payment_index}.amount_paid": new_paid,
            f"player_payments.{payment_index}.status": new_status,
            f"player_payments.{payment_index}.paid_at": datetime.utcnow() if new_status == PaymentStatus.PAID else None
        }}
    )
    
    if new_status == PaymentStatus.PAID:
        await create_notification(match_data["captain_id"], "Payment Received", f"{current_user.name or 'A player'} paid for {match_data['title']}", "payment_received", request.match_id)
    
    # Check if all paid
    match_data = await db.matches.find_one({"id": request.match_id})
    all_paid = all(p["status"] == PaymentStatus.PAID for p in match_data.get("player_payments", []))
    if all_paid and match_data.get("player_payments"):
        await db.matches.update_one({"id": request.match_id}, {"$set": {"status": MatchStatus.READY_TO_PLAY}})
    
    return {"message": "Payment successful", "amount_paid": payment_amount, "total_paid": new_paid, "amount_remaining": player_payment["amount_due"] - new_paid, "status": new_status}

@api_router.get("/wallet/export")
async def export_transactions(start_date: Optional[str] = None, end_date: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if start_date:
        query["created_at"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "created_at" not in query:
            query["created_at"] = {}
        query["created_at"]["$lte"] = datetime.fromisoformat(end_date)
    
    transactions = await db.wallet_transactions.find(query).sort("created_at", -1).to_list(1000)
    
    total_credit = sum(t["amount"] for t in transactions if t["amount"] > 0)
    total_debit = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)
    
    return {
        "transactions": [WalletTransaction(**t) for t in transactions],
        "summary": {
            "total_credit": total_credit,
            "total_debit": total_debit,
            "net": total_credit - total_debit,
            "count": len(transactions)
        }
    }

# ==================== GROUND ROUTES ====================

@api_router.post("/grounds")
async def create_ground(ground_data: GroundCreate, current_user: User = Depends(get_current_user)):
    ground = Ground(**ground_data.dict(), owner_id=current_user.id)
    await db.grounds.insert_one(ground.dict())
    await db.users.update_one({"id": current_user.id}, {"$set": {"role": UserRole.GROUND_OWNER}})
    return ground

@api_router.get("/grounds")
async def get_grounds(
    location: Optional[str] = None,
    ground_type: Optional[GroundType] = None,
    turf_type: Optional[TurfType] = None,
    has_lighting: Optional[bool] = None,
    has_parking: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if ground_type:
        query["type"] = ground_type
    if turf_type:
        query["turf_type"] = turf_type
    if has_lighting is not None:
        query["has_lighting"] = has_lighting
    if has_parking is not None:
        query["has_parking"] = has_parking
    if min_price is not None:
        query["price_per_hour"] = {"$gte": min_price}
    if max_price is not None:
        if "price_per_hour" not in query:
            query["price_per_hour"] = {}
        query["price_per_hour"]["$lte"] = max_price
    
    grounds = await db.grounds.find(query).to_list(100)
    return [Ground(**g) for g in grounds]

@api_router.get("/grounds/{ground_id}")
async def get_ground(ground_id: str, current_user: User = Depends(get_current_user)):
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    return Ground(**ground_data)

@api_router.put("/grounds/{ground_id}")
async def update_ground(ground_id: str, update: GroundUpdate, current_user: User = Depends(get_current_user)):
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    if ground_data["owner_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    await db.grounds.update_one({"id": ground_id}, {"$set": update_data})
    ground_data = await db.grounds.find_one({"id": ground_id})
    return Ground(**ground_data)

@api_router.post("/grounds/{ground_id}/slots")
async def add_slots(ground_id: str, slots: List[GroundSlot], current_user: User = Depends(get_current_user)):
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    if ground_data["owner_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    slot_dicts = [s.dict() for s in slots]
    await db.grounds.update_one({"id": ground_id}, {"$push": {"slots": {"$each": slot_dicts}}})
    return {"message": f"Added {len(slots)} slots"}

@api_router.delete("/grounds/{ground_id}/slots/{slot_id}")
async def remove_slot(ground_id: str, slot_id: str, current_user: User = Depends(get_current_user)):
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    if ground_data["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.grounds.update_one({"id": ground_id}, {"$pull": {"slots": {"id": slot_id}}})
    return {"message": "Slot removed"}

@api_router.post("/grounds/book")
async def book_slot(request: BookSlotRequest, current_user: User = Depends(get_current_user)):
    ground_data = await db.grounds.find_one({"id": request.ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    slot = None
    slot_index = -1
    for i, s in enumerate(ground_data.get("slots", [])):
        if s["id"] == request.slot_id:
            slot = s
            slot_index = i
            break
    
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if not slot["is_available"]:
        raise HTTPException(status_code=400, detail="Slot not available")
    
    if current_user.wallet_balance < slot["price"]:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    new_balance = current_user.wallet_balance - slot["price"]
    
    booking = GroundBooking(
        ground_id=request.ground_id,
        ground_name=ground_data["name"],
        slot_id=request.slot_id,
        user_id=current_user.id,
        match_id=request.match_id,
        date=slot["date"],
        start_time=slot["start_time"],
        end_time=slot["end_time"],
        price=slot["price"]
    )
    await db.ground_bookings.insert_one(booking.dict())
    
    transaction = WalletTransaction(user_id=current_user.id, type=TransactionType.GROUND_BOOKING, amount=-slot["price"], balance_after=new_balance, description=f"Ground booking: {ground_data['name']}", reference_id=booking.id)
    await db.wallet_transactions.insert_one(transaction.dict())
    await db.users.update_one({"id": current_user.id}, {"$set": {"wallet_balance": new_balance}, "$inc": {"total_spent": slot["price"]}})
    
    await db.grounds.update_one({"id": request.ground_id}, {
        "$set": {
            f"slots.{slot_index}.is_available": False,
            f"slots.{slot_index}.booked_by": current_user.id,
            f"slots.{slot_index}.booking_id": booking.id,
            f"slots.{slot_index}.match_id": request.match_id
        },
        "$inc": {"total_bookings": 1, "total_earnings": slot["price"]}
    })
    
    await create_notification(ground_data["owner_id"], "New Booking", f"{ground_data['name']} booked for {slot['date']} {slot['start_time']}", "ground_booking", booking.id)
    
    return {"message": "Booking successful", "booking_id": booking.id, "transaction_id": transaction.id}

@api_router.get("/grounds/bookings/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)):
    bookings = await db.ground_bookings.find({"user_id": current_user.id}).sort("created_at", -1).to_list(50)
    return [GroundBooking(**b) for b in bookings]

@api_router.post("/grounds/bookings/cancel")
async def cancel_booking(request: CancelBookingRequest, current_user: User = Depends(get_current_user)):
    booking_data = await db.ground_bookings.find_one({"id": request.booking_id})
    if not booking_data:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking_data["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if booking_data["status"] != BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    ground_data = await db.grounds.find_one({"id": booking_data["ground_id"]})
    cancellation_fee = booking_data["price"] * (ground_data.get("cancellation_fee_percent", 20) / 100)
    refund_amount = booking_data["price"] - cancellation_fee
    
    new_balance = current_user.wallet_balance + refund_amount
    
    transaction = WalletTransaction(user_id=current_user.id, type=TransactionType.REFUND, amount=refund_amount, balance_after=new_balance, description=f"Booking cancellation refund (fee: AED {cancellation_fee:.2f})", reference_id=request.booking_id)
    await db.wallet_transactions.insert_one(transaction.dict())
    await db.users.update_one({"id": current_user.id}, {"$set": {"wallet_balance": new_balance}})
    
    await db.ground_bookings.update_one({"id": request.booking_id}, {"$set": {"status": BookingStatus.CANCELLED}})
    
    # Make slot available again
    for i, s in enumerate(ground_data.get("slots", [])):
        if s.get("booking_id") == request.booking_id:
            await db.grounds.update_one({"id": booking_data["ground_id"]}, {"$set": {
                f"slots.{i}.is_available": True,
                f"slots.{i}.booked_by": None,
                f"slots.{i}.booking_id": None
            }})
            break
    
    return {"message": "Booking cancelled", "refund_amount": refund_amount, "cancellation_fee": cancellation_fee}

@api_router.get("/grounds/my-grounds")
async def get_my_grounds(current_user: User = Depends(get_current_user)):
    grounds = await db.grounds.find({"owner_id": current_user.id}).to_list(100)
    return [Ground(**g) for g in grounds]

@api_router.get("/grounds/{ground_id}/analytics")
async def get_ground_analytics(ground_id: str, current_user: User = Depends(get_current_user)):
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    if ground_data["owner_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    bookings = await db.ground_bookings.find({"ground_id": ground_id}).to_list(1000)
    
    total_slots = len(ground_data.get("slots", []))
    booked_slots = len([s for s in ground_data.get("slots", []) if not s["is_available"]])
    utilization = (booked_slots / total_slots * 100) if total_slots > 0 else 0
    
    return {
        "ground": Ground(**ground_data),
        "total_bookings": ground_data.get("total_bookings", 0),
        "total_earnings": ground_data.get("total_earnings", 0),
        "total_slots": total_slots,
        "booked_slots": booked_slots,
        "utilization_percent": utilization,
        "average_rating": ground_data.get("rating", 0)
    }

# ==================== NOTIFICATION ROUTES ====================

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(50)
    return [Notification(**n) for n in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one({"id": notification_id, "user_id": current_user.id}, {"$set": {"is_read": True}})
    return {"message": "Marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_read(current_user: User = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": current_user.id}, {"$set": {"is_read": True}})
    return {"message": "All marked as read"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    count = await db.notifications.count_documents({"user_id": current_user.id, "is_read": False})
    return {"count": count}

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/player")
async def get_player_dashboard(current_user: User = Depends(get_current_user)):
    upcoming = await db.matches.find({
        "$or": [
            {"confirmed_player_ids": current_user.id},
            {"invited_player_ids": current_user.id},
            {"captain_id": current_user.id}
        ],
        "date": {"$gte": datetime.utcnow()},
        "status": {"$nin": [MatchStatus.CANCELLED, MatchStatus.COMPLETED]}
    }).sort("date", 1).to_list(10)
    
    past = await db.matches.find({
        "$or": [{"confirmed_player_ids": current_user.id}, {"captain_id": current_user.id}],
        "status": MatchStatus.COMPLETED
    }).sort("date", -1).to_list(10)
    
    transactions = await db.wallet_transactions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(5)
    
    pending_matches = await db.matches.find({
        "player_payments.user_id": current_user.id,
        "player_payments.status": {"$in": [PaymentStatus.PENDING, PaymentStatus.PARTIAL]}
    }).to_list(10)
    
    pending_amount = 0
    for match in pending_matches:
        for payment in match.get("player_payments", []):
            if payment["user_id"] == current_user.id and payment["status"] in [PaymentStatus.PENDING, PaymentStatus.PARTIAL]:
                pending_amount += payment["amount_due"] - payment.get("amount_paid", 0)
    
    return {
        "wallet_balance": current_user.wallet_balance,
        "upcoming_matches": [Match(**m) for m in upcoming],
        "past_matches": [Match(**m) for m in past],
        "recent_transactions": [WalletTransaction(**t) for t in transactions],
        "pending_payment_amount": pending_amount,
        "teams_count": len(current_user.team_ids),
        "matches_played": current_user.matches_played,
        "total_spent": current_user.total_spent
    }

@api_router.get("/dashboard/captain/{team_id}")
async def get_captain_dashboard(team_id: str, current_user: User = Depends(get_current_user)):
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not captain")
    
    matches = await db.matches.find({"team_id": team_id}).sort("date", -1).to_list(100)
    
    total_matches = len(matches)
    total_collected = 0
    total_outstanding = 0
    
    for match in matches:
        for payment in match.get("player_payments", []):
            total_collected += payment.get("amount_paid", 0)
            if payment["status"] in [PaymentStatus.PENDING, PaymentStatus.PARTIAL]:
                total_outstanding += payment["amount_due"] - payment.get("amount_paid", 0)
    
    upcoming = [m for m in matches if m["status"] not in [MatchStatus.COMPLETED, MatchStatus.CANCELLED]]
    
    return {
        "team": Team(**team_data),
        "total_matches": total_matches,
        "total_collected": total_collected,
        "total_outstanding": total_outstanding,
        "player_count": len(team_data.get("player_ids", [])),
        "pool_balance": team_data.get("pool_balance", 0),
        "upcoming_matches": [Match(**m) for m in upcoming[:5]],
        "recent_matches": [Match(**m) for m in matches[:10]]
    }

@api_router.get("/dashboard/ground-owner")
async def get_ground_owner_dashboard(current_user: User = Depends(require_ground_owner)):
    grounds = await db.grounds.find({"owner_id": current_user.id}).to_list(100)
    
    total_earnings = sum(g.get("total_earnings", 0) for g in grounds)
    total_bookings = sum(g.get("total_bookings", 0) for g in grounds)
    
    recent_bookings = await db.ground_bookings.find({
        "ground_id": {"$in": [g["id"] for g in grounds]}
    }).sort("created_at", -1).to_list(20)
    
    return {
        "grounds": [Ground(**g) for g in grounds],
        "total_earnings": total_earnings,
        "total_bookings": total_bookings,
        "recent_bookings": [GroundBooking(**b) for b in recent_bookings]
    }

@api_router.get("/dashboard/admin")
async def get_admin_dashboard(current_user: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_teams = await db.teams.count_documents({})
    total_matches = await db.matches.count_documents({})
    total_grounds = await db.grounds.count_documents({})
    
    completed_matches = await db.matches.count_documents({"status": MatchStatus.COMPLETED})
    
    transactions = await db.wallet_transactions.find({}).to_list(1000)
    total_transaction_volume = sum(abs(t["amount"]) for t in transactions)
    
    grounds = await db.grounds.find({}).to_list(100)
    total_ground_earnings = sum(g.get("total_earnings", 0) for g in grounds)
    
    recent_users = await db.users.find({}).sort("created_at", -1).to_list(10)
    recent_matches = await db.matches.find({}).sort("created_at", -1).to_list(10)
    
    return {
        "total_users": total_users,
        "total_teams": total_teams,
        "total_matches": total_matches,
        "completed_matches": completed_matches,
        "total_grounds": total_grounds,
        "total_transaction_volume": total_transaction_volume,
        "total_ground_earnings": total_ground_earnings,
        "recent_users": [User(**u) for u in recent_users],
        "recent_matches": [Match(**m) for m in recent_matches]
    }

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users")
async def admin_get_users(skip: int = 0, limit: int = 50, current_user: User = Depends(require_admin)):
    users = await db.users.find({}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": [User(**u) for u in users], "total": total}

@api_router.put("/admin/users/{user_id}/role")
async def admin_update_user_role(user_id: str, role: UserRole, current_user: User = Depends(require_admin)):
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"message": "Role updated"}

@api_router.get("/admin/transactions")
async def admin_get_transactions(skip: int = 0, limit: int = 50, current_user: User = Depends(require_admin)):
    transactions = await db.wallet_transactions.find({}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.wallet_transactions.count_documents({})
    return {"transactions": [WalletTransaction(**t) for t in transactions], "total": total}

# ==================== HEALTH & SEED ====================

@api_router.get("/")
async def root():
    return {"message": "Batlabz API is running", "version": "2.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.post("/seed")
async def seed_data():
    # Sample Grounds
    grounds_data = [
        {"id": "ground-1", "owner_id": "system", "name": "Dubai Sports City Cricket Ground", "location": "Dubai Sports City, Dubai", "type": "outdoor", "turf_type": "natural", "has_lighting": True, "has_parking": True, "price_per_hour": 800, "description": "Professional cricket ground with world-class facilities.", "images": [], "amenities": ["Changing Rooms", "Scoreboard", "Practice Nets", "Parking", "Floodlights", "Pavilion"], "rating": 4.8, "total_bookings": 156, "total_earnings": 0, "slots": [
            {"id": "slot-1-1", "date": "2025-01-15", "start_time": "06:00", "end_time": "09:00", "price": 2400, "is_available": True},
            {"id": "slot-1-2", "date": "2025-01-15", "start_time": "09:00", "end_time": "12:00", "price": 2400, "is_available": True},
            {"id": "slot-1-3", "date": "2025-01-15", "start_time": "16:00", "end_time": "19:00", "price": 2800, "is_available": True},
            {"id": "slot-1-4", "date": "2025-01-15", "start_time": "19:00", "end_time": "22:00", "price": 3200, "is_available": True},
            {"id": "slot-1-5", "date": "2025-01-16", "start_time": "06:00", "end_time": "09:00", "price": 2400, "is_available": True},
            {"id": "slot-1-6", "date": "2025-01-16", "start_time": "16:00", "end_time": "19:00", "price": 2800, "is_available": True},
        ], "created_at": datetime.utcnow()},
        {"id": "ground-2", "owner_id": "system", "name": "Sharjah Cricket Stadium - Practice", "location": "Sharjah", "type": "outdoor", "turf_type": "artificial", "has_lighting": True, "has_parking": True, "price_per_hour": 600, "description": "Practice ground near famous stadium.", "images": [], "amenities": ["Changing Rooms", "Practice Nets", "Parking", "Floodlights"], "rating": 4.5, "total_bookings": 89, "total_earnings": 0, "slots": [
            {"id": "slot-2-1", "date": "2025-01-15", "start_time": "06:00", "end_time": "09:00", "price": 1800, "is_available": True},
            {"id": "slot-2-2", "date": "2025-01-15", "start_time": "16:00", "end_time": "19:00", "price": 2000, "is_available": True},
        ], "created_at": datetime.utcnow()},
        {"id": "ground-3", "owner_id": "system", "name": "ICC Academy Ground", "location": "ICC Academy, Dubai", "type": "outdoor", "turf_type": "natural", "has_lighting": True, "has_parking": True, "price_per_hour": 1000, "description": "Premium facility used by international teams.", "images": [], "amenities": ["Changing Rooms", "Gym", "Pool", "Practice Nets", "Video Analysis"], "rating": 4.9, "total_bookings": 234, "total_earnings": 0, "slots": [
            {"id": "slot-3-1", "date": "2025-01-15", "start_time": "06:00", "end_time": "09:00", "price": 3000, "is_available": True},
            {"id": "slot-3-2", "date": "2025-01-15", "start_time": "16:00", "end_time": "19:00", "price": 3500, "is_available": True},
        ], "created_at": datetime.utcnow()},
        {"id": "ground-4", "owner_id": "system", "name": "Al Ain Cricket Ground", "location": "Al Ain, Abu Dhabi", "type": "outdoor", "turf_type": "matting", "has_lighting": False, "has_parking": True, "price_per_hour": 400, "description": "Budget-friendly option.", "images": [], "amenities": ["Parking", "Basic Facilities"], "rating": 4.0, "total_bookings": 45, "total_earnings": 0, "slots": [
            {"id": "slot-4-1", "date": "2025-01-15", "start_time": "06:00", "end_time": "09:00", "price": 1200, "is_available": True},
            {"id": "slot-4-2", "date": "2025-01-15", "start_time": "09:00", "end_time": "12:00", "price": 1200, "is_available": True},
        ], "created_at": datetime.utcnow()},
        {"id": "ground-5", "owner_id": "system", "name": "Cricket World Indoor", "location": "Al Quoz, Dubai", "type": "indoor", "turf_type": "artificial", "has_lighting": True, "has_parking": True, "price_per_hour": 500, "description": "Climate-controlled indoor facility.", "images": [], "amenities": ["AC", "Bowling Machine", "Video Recording", "Cafe"], "rating": 4.6, "total_bookings": 178, "total_earnings": 0, "slots": [
            {"id": "slot-5-1", "date": "2025-01-15", "start_time": "10:00", "end_time": "12:00", "price": 1000, "is_available": True},
            {"id": "slot-5-2", "date": "2025-01-15", "start_time": "18:00", "end_time": "20:00", "price": 1200, "is_available": True},
        ], "created_at": datetime.utcnow()},
    ]
    
    await db.grounds.delete_many({})
    await db.grounds.insert_many(grounds_data)
    
    # Create admin user
    admin_exists = await db.users.find_one({"phone": "+971000000000"})
    if not admin_exists:
        admin = User(phone="+971000000000", name="Admin", role=UserRole.ADMIN)
        await db.users.insert_one(admin.dict())
    
    return {"message": "Seed data created", "grounds_created": len(grounds_data)}

@api_router.post("/seed/demo")
async def seed_demo_data():
    """Create comprehensive demo data for testing all flows"""
    from datetime import timedelta
    
    # Clear existing demo data
    await db.users.delete_many({"phone": {"$regex": "^\\+97150"}})
    await db.teams.delete_many({"name": {"$regex": "Demo"}})
    await db.matches.delete_many({"title": {"$regex": "Demo"}})
    
    # ===================== DEMO USERS =====================
    demo_users = [
        {"id": "demo-captain-1", "phone": "+971501111111", "name": "Ahmed Khan (Captain)", "playing_role": "batsman", "preferred_locations": ["Dubai"], "wallet_balance": 5000, "role": "player", "is_profile_complete": True, "matches_played": 45, "total_spent": 4500, "created_at": datetime.utcnow()},
        {"id": "demo-player-2", "phone": "+971502222222", "name": "Ravi Sharma", "playing_role": "bowler", "preferred_locations": ["Dubai"], "wallet_balance": 1500, "role": "player", "is_profile_complete": True, "matches_played": 32, "total_spent": 3200, "created_at": datetime.utcnow()},
        {"id": "demo-player-3", "phone": "+971503333333", "name": "Faisal Ali", "playing_role": "all_rounder", "preferred_locations": ["Sharjah"], "wallet_balance": 2000, "role": "player", "is_profile_complete": True, "matches_played": 28, "total_spent": 2800, "created_at": datetime.utcnow()},
        {"id": "demo-player-4", "phone": "+971504444444", "name": "Mohammed Rashid", "playing_role": "wicket_keeper", "preferred_locations": ["Dubai"], "wallet_balance": 800, "role": "player", "is_profile_complete": True, "matches_played": 22, "total_spent": 2200, "created_at": datetime.utcnow()},
        {"id": "demo-player-5", "phone": "+971505555555", "name": "Amit Patel", "playing_role": "batsman", "preferred_locations": ["Abu Dhabi"], "wallet_balance": 3000, "role": "player", "is_profile_complete": True, "matches_played": 35, "total_spent": 3500, "created_at": datetime.utcnow()},
        {"id": "demo-player-6", "phone": "+971506666666", "name": "Khalid Omar", "playing_role": "bowler", "preferred_locations": ["Dubai"], "wallet_balance": 1200, "role": "player", "is_profile_complete": True, "matches_played": 18, "total_spent": 1800, "created_at": datetime.utcnow()},
        {"id": "demo-player-7", "phone": "+971507777777", "name": "Suresh Kumar", "playing_role": "all_rounder", "preferred_locations": ["Dubai"], "wallet_balance": 2500, "role": "player", "is_profile_complete": True, "matches_played": 40, "total_spent": 4000, "created_at": datetime.utcnow()},
        {"id": "demo-player-8", "phone": "+971508888888", "name": "Hassan Malik", "playing_role": "batsman", "preferred_locations": ["Sharjah"], "wallet_balance": 500, "role": "player", "is_profile_complete": True, "matches_played": 15, "total_spent": 1500, "created_at": datetime.utcnow()},
        {"id": "demo-captain-2", "phone": "+971509999999", "name": "Imran Sheikh (Captain)", "playing_role": "all_rounder", "preferred_locations": ["Dubai"], "wallet_balance": 4000, "role": "player", "is_profile_complete": True, "matches_played": 50, "total_spent": 5000, "created_at": datetime.utcnow()},
        {"id": "demo-player-10", "phone": "+971500000001", "name": "Vikram Singh", "playing_role": "bowler", "preferred_locations": ["Dubai"], "wallet_balance": 1800, "role": "player", "is_profile_complete": True, "matches_played": 25, "total_spent": 2500, "created_at": datetime.utcnow()},
        {"id": "demo-player-11", "phone": "+971500000002", "name": "Omar Farooq", "playing_role": "batsman", "preferred_locations": ["Abu Dhabi"], "wallet_balance": 2200, "role": "player", "is_profile_complete": True, "matches_played": 30, "total_spent": 3000, "created_at": datetime.utcnow()},
    ]
    
    for user in demo_users:
        await db.users.insert_one(user)
    
    # ===================== DEMO TEAMS =====================
    demo_teams = [
        {
            "id": "demo-team-1",
            "name": "Demo Dubai Warriors",
            "captain_id": "demo-captain-1",
            "home_location": "Dubai",
            "invite_code": "DEMOWAR123",
            "player_ids": ["demo-captain-1", "demo-player-2", "demo-player-3", "demo-player-4", "demo-player-5", "demo-player-6"],
            "pool_balance": 2400,  # Team has collected funds
            "created_at": datetime.utcnow()
        },
        {
            "id": "demo-team-2", 
            "name": "Demo Sharjah Strikers",
            "captain_id": "demo-captain-2",
            "home_location": "Sharjah",
            "invite_code": "DEMOSTR456",
            "player_ids": ["demo-captain-2", "demo-player-7", "demo-player-8", "demo-player-10", "demo-player-11"],
            "pool_balance": 1500,
            "created_at": datetime.utcnow()
        }
    ]
    
    for team in demo_teams:
        await db.teams.insert_one(team)
    
    # ===================== DEMO MATCHES =====================
    match_date = datetime.utcnow() + timedelta(days=7)
    past_match_date = datetime.utcnow() - timedelta(days=3)
    
    demo_matches = [
        {
            "id": "demo-match-1",
            "team_id": "demo-team-1",
            "captain_id": "demo-captain-1",
            "title": "Demo Friday Night T20",
            "date": match_date,
            "location": "Dubai Sports City",
            "ground_id": "ground-1",
            "format": "T20",
            "player_limit": 22,
            "status": "payments_pending",
            "invited_player_ids": ["demo-player-2", "demo-player-3", "demo-player-4", "demo-player-5", "demo-player-6"],
            "confirmed_player_ids": ["demo-captain-1", "demo-player-2", "demo-player-3", "demo-player-4", "demo-player-5"],
            "declined_player_ids": [],
            "total_cost": 2400,  # Ground fee
            "per_player_cost": 400,  # 2400 / 6 players
            "cost_breakdown": {"ground_fee": 2400, "umpire_fee": 0, "balls_equip": 0, "refreshments": 0, "miscellaneous": 0},
            "player_payments": [
                {"user_id": "demo-captain-1", "amount_due": 400, "amount_paid": 400, "status": "paid", "paid_at": datetime.utcnow()},
                {"user_id": "demo-player-2", "amount_due": 400, "amount_paid": 400, "status": "paid", "paid_at": datetime.utcnow()},
                {"user_id": "demo-player-3", "amount_due": 400, "amount_paid": 200, "status": "partial", "paid_at": None},
                {"user_id": "demo-player-4", "amount_due": 400, "amount_paid": 0, "status": "pending", "paid_at": None},
                {"user_id": "demo-player-5", "amount_due": 400, "amount_paid": 400, "status": "paid", "paid_at": datetime.utcnow()},
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "demo-match-2",
            "team_id": "demo-team-1",
            "captain_id": "demo-captain-1", 
            "title": "Demo Completed Match",
            "date": past_match_date,
            "location": "Sharjah Cricket Stadium",
            "ground_id": "ground-2",
            "format": "T20",
            "player_limit": 22,
            "status": "completed",
            "invited_player_ids": ["demo-player-2", "demo-player-3", "demo-player-4"],
            "confirmed_player_ids": ["demo-captain-1", "demo-player-2", "demo-player-3", "demo-player-4"],
            "declined_player_ids": [],
            "total_cost": 1800,
            "per_player_cost": 450,
            "cost_breakdown": {"ground_fee": 1800},
            "player_payments": [
                {"user_id": "demo-captain-1", "amount_due": 450, "amount_paid": 450, "status": "paid", "paid_at": past_match_date},
                {"user_id": "demo-player-2", "amount_due": 450, "amount_paid": 450, "status": "paid", "paid_at": past_match_date},
                {"user_id": "demo-player-3", "amount_due": 450, "amount_paid": 450, "status": "paid", "paid_at": past_match_date},
                {"user_id": "demo-player-4", "amount_due": 450, "amount_paid": 450, "status": "paid", "paid_at": past_match_date},
            ],
            "created_at": past_match_date,
            "updated_at": past_match_date
        },
        {
            "id": "demo-match-3",
            "team_id": "demo-team-2",
            "captain_id": "demo-captain-2",
            "title": "Demo Sharjah Derby",
            "date": match_date + timedelta(days=3),
            "location": "ICC Academy",
            "ground_id": "ground-3",
            "format": "ODI",
            "player_limit": 22,
            "status": "confirmed",
            "invited_player_ids": ["demo-player-7", "demo-player-8", "demo-player-10", "demo-player-11"],
            "confirmed_player_ids": ["demo-captain-2", "demo-player-7", "demo-player-8", "demo-player-10"],
            "declined_player_ids": [],
            "total_cost": 3500,
            "per_player_cost": 700,
            "cost_breakdown": {"ground_fee": 3000, "umpire_fee": 300, "refreshments": 200},
            "player_payments": [
                {"user_id": "demo-captain-2", "amount_due": 700, "amount_paid": 0, "status": "pending", "paid_at": None},
                {"user_id": "demo-player-7", "amount_due": 700, "amount_paid": 0, "status": "pending", "paid_at": None},
                {"user_id": "demo-player-8", "amount_due": 700, "amount_paid": 0, "status": "pending", "paid_at": None},
                {"user_id": "demo-player-10", "amount_due": 700, "amount_paid": 0, "status": "pending", "paid_at": None},
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    for match in demo_matches:
        await db.matches.insert_one(match)
    
    # ===================== DEMO PLAYER STATS =====================
    for user in demo_users:
        stats = {
            "id": f"stats-{user['id']}",
            "user_id": user["id"],
            "total_matches": user.get("matches_played", 0),
            "matches_won": int(user.get("matches_played", 0) * 0.55),
            "matches_lost": int(user.get("matches_played", 0) * 0.45),
            "win_rate": 55.0,
            "attendance_rate": 92.0,
            "on_time_payments": int(user.get("matches_played", 0) * 0.85),
            "late_payments": int(user.get("matches_played", 0) * 0.15),
            "payment_reliability": 85.0,
            "no_shows": 1 if user.get("matches_played", 0) > 20 else 0,
            "impact_score": 50 + (user.get("matches_played", 0) * 0.5),
            "reliability_score": 88.0,
            "overall_rating": 50 + (user.get("matches_played", 0) * 0.4),
            "recent_results": ["W", "L", "W", "W", "L", "W", "W", "W", "L", "W"][:min(user.get("matches_played", 0), 10)],
            "form_score": 65.0,
            "format_stats": {"T20": {"matches": int(user.get("matches_played", 0) * 0.6), "wins": int(user.get("matches_played", 0) * 0.35)}},
            "updated_at": datetime.utcnow()
        }
        await db.player_stats.update_one({"user_id": user["id"]}, {"$set": stats}, upsert=True)
    
    # ===================== DEMO TRANSACTIONS =====================
    demo_transactions = [
        {"id": "txn-demo-1", "user_id": "demo-captain-1", "type": "topup", "amount": 3000, "balance_after": 5000, "description": "Card top-up", "created_at": datetime.utcnow() - timedelta(days=10)},
        {"id": "txn-demo-2", "user_id": "demo-captain-1", "type": "match_payment", "amount": -400, "balance_after": 4600, "description": "Payment for Demo Friday Night T20", "reference_id": "demo-match-1", "created_at": datetime.utcnow() - timedelta(days=5)},
        {"id": "txn-demo-3", "user_id": "demo-player-2", "type": "topup", "amount": 1000, "balance_after": 1500, "description": "Card top-up", "created_at": datetime.utcnow() - timedelta(days=8)},
        {"id": "txn-demo-4", "user_id": "demo-player-2", "type": "match_payment", "amount": -400, "balance_after": 1100, "description": "Payment for Demo Friday Night T20", "reference_id": "demo-match-1", "created_at": datetime.utcnow() - timedelta(days=4)},
        {"id": "txn-demo-5", "user_id": "demo-player-3", "type": "match_payment", "amount": -200, "balance_after": 1800, "description": "Partial payment for Demo Friday Night T20", "reference_id": "demo-match-1", "created_at": datetime.utcnow() - timedelta(days=3)},
    ]
    
    for txn in demo_transactions:
        await db.wallet_transactions.insert_one(txn)
    
    return {
        "message": "Demo data created successfully",
        "demo_users_created": len(demo_users),
        "demo_teams_created": len(demo_teams),
        "demo_matches_created": len(demo_matches),
        "demo_captain_credentials": {
            "captain_1": {"phone": "501111111", "name": "Ahmed Khan (Captain)", "team": "Demo Dubai Warriors"},
            "captain_2": {"phone": "509999999", "name": "Imran Sheikh (Captain)", "team": "Demo Sharjah Strikers"}
        },
        "demo_player_credentials": {
            "player": {"phone": "502222222", "name": "Ravi Sharma"},
        },
        "otp_for_all": "123456",
        "instructions": {
            "step_1": "Login with phone 501111111 and OTP 123456 to access Captain Ahmed's account",
            "step_2": "Go to Team > Demo Dubai Warriors to see team dashboard",
            "step_3": "Go to Captain Financial Dashboard to see collection status",
            "step_4": "Demo match shows 3/5 players paid (AED 1200 of 2000 collected)"
        }
    }

# ==================== AUDIT LOGGING SYSTEM ====================

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

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str
    user_id: str
    entity_type: str
    entity_id: str
    amount: Optional[float] = None
    balance_before: Optional[float] = None
    balance_after: Optional[float] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

async def create_audit_log(action: str, user_id: str, entity_type: str, entity_id: str, 
                           amount: float = None, balance_before: float = None, 
                           balance_after: float = None, metadata: dict = {}):
    """Create an audit log entry for financial transactions"""
    audit = AuditLog(
        action=action,
        user_id=user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
        metadata=metadata
    )
    await db.audit_logs.insert_one(audit.dict())
    return audit

# ==================== SAFE WALLET OPERATIONS ====================

async def safe_wallet_credit(user_id: str, amount: float, transaction_type: TransactionType, 
                             description: str, reference_id: str = None, idempotency_key: str = None) -> bool:
    """Safely credit wallet with duplicate protection and audit logging"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Check for duplicate transaction using idempotency key
    if idempotency_key:
        existing = await db.wallet_ledger.find_one({"idempotency_key": idempotency_key})
        if existing:
            logger.warning(f"Duplicate transaction blocked: {idempotency_key}")
            return False
    
    # Get current balance
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    balance_before = user.get("wallet_balance", 0)
    balance_after = balance_before + amount
    
    # Update wallet balance atomically
    result = await db.users.update_one(
        {"id": user_id},
        {"$inc": {"wallet_balance": amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update wallet")
    
    # Create transaction record
    transaction = WalletTransaction(
        user_id=user_id,
        type=transaction_type,
        amount=amount,
        balance_after=balance_after,
        description=description,
        reference_id=reference_id
    )
    await db.wallet_transactions.insert_one(transaction.dict())
    
    # Create ledger entry
    ledger_entry = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "transaction_id": transaction.id,
        "debit": 0,
        "credit": amount,
        "balance": balance_after,
        "description": description,
        "reference_type": transaction_type,
        "reference_id": reference_id,
        "idempotency_key": idempotency_key,
        "created_at": datetime.utcnow()
    }
    await db.wallet_ledger.insert_one(ledger_entry)
    
    # Create audit log
    await create_audit_log(
        action="wallet_credit",
        user_id=user_id,
        entity_type="wallet",
        entity_id=user_id,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
        metadata={"transaction_type": transaction_type, "reference_id": reference_id}
    )
    
    return True

async def safe_wallet_debit(user_id: str, amount: float, transaction_type: TransactionType,
                            description: str, reference_id: str = None, idempotency_key: str = None) -> bool:
    """Safely debit wallet with negative balance protection and audit logging"""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Check for duplicate transaction
    if idempotency_key:
        existing = await db.wallet_ledger.find_one({"idempotency_key": idempotency_key})
        if existing:
            logger.warning(f"Duplicate transaction blocked: {idempotency_key}")
            return False
    
    # Get current balance and check sufficient funds
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    balance_before = user.get("wallet_balance", 0)
    
    # Prevent negative balance
    if balance_before < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient wallet balance. Available: {balance_before}, Required: {amount}")
    
    balance_after = balance_before - amount
    
    # Update wallet balance atomically with balance check
    result = await db.users.update_one(
        {"id": user_id, "wallet_balance": {"$gte": amount}},
        {"$inc": {"wallet_balance": -amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Insufficient balance or concurrent modification")
    
    # Create transaction record
    transaction = WalletTransaction(
        user_id=user_id,
        type=transaction_type,
        amount=-amount,
        balance_after=balance_after,
        description=description,
        reference_id=reference_id
    )
    await db.wallet_transactions.insert_one(transaction.dict())
    
    # Create ledger entry
    ledger_entry = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "transaction_id": transaction.id,
        "debit": amount,
        "credit": 0,
        "balance": balance_after,
        "description": description,
        "reference_type": transaction_type,
        "reference_id": reference_id,
        "idempotency_key": idempotency_key,
        "created_at": datetime.utcnow()
    }
    await db.wallet_ledger.insert_one(ledger_entry)
    
    # Create audit log
    await create_audit_log(
        action="wallet_debit",
        user_id=user_id,
        entity_type="wallet",
        entity_id=user_id,
        amount=-amount,
        balance_before=balance_before,
        balance_after=balance_after,
        metadata={"transaction_type": transaction_type, "reference_id": reference_id}
    )
    
    return True

# ==================== PLAYER STATS MODEL ====================

class PlayerStats(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    total_matches: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    win_rate: float = 0.0
    matches_confirmed: int = 0
    matches_attended: int = 0
    attendance_rate: float = 100.0
    on_time_payments: int = 0
    late_payments: int = 0
    payment_reliability: float = 100.0
    no_shows: int = 0
    ground_stats: Dict[str, Dict[str, Any]] = {}
    format_stats: Dict[str, Dict[str, Any]] = {}
    impact_score: float = 50.0
    reliability_score: float = 100.0
    overall_rating: float = 50.0
    teammates_played_with: Dict[str, int] = {}
    recent_results: List[str] = []
    form_score: float = 50.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

async def get_or_create_player_stats(user_id: str) -> dict:
    """Get or create player statistics"""
    stats = await db.player_stats.find_one({"user_id": user_id})
    if not stats:
        new_stats = PlayerStats(user_id=user_id)
        await db.player_stats.insert_one(new_stats.dict())
        return new_stats.dict()
    return stats

async def update_player_stats_after_match(user_id: str, match_data: dict, won: bool = None, attended: bool = True):
    """Update player statistics after a match"""
    stats = await get_or_create_player_stats(user_id)
    
    updates = {
        "total_matches": stats.get("total_matches", 0) + 1,
        "updated_at": datetime.utcnow()
    }
    
    if won is True:
        updates["matches_won"] = stats.get("matches_won", 0) + 1
        recent = stats.get("recent_results", [])[-9:] + ["W"]
        updates["recent_results"] = recent
    elif won is False:
        updates["matches_lost"] = stats.get("matches_lost", 0) + 1
        recent = stats.get("recent_results", [])[-9:] + ["L"]
        updates["recent_results"] = recent
    
    if attended:
        updates["matches_attended"] = stats.get("matches_attended", 0) + 1
    else:
        updates["no_shows"] = stats.get("no_shows", 0) + 1
    
    # Update ground stats
    ground_id = match_data.get("ground_id")
    if ground_id:
        ground_stats = stats.get("ground_stats", {})
        if ground_id not in ground_stats:
            ground_stats[ground_id] = {"matches": 0, "wins": 0}
        ground_stats[ground_id]["matches"] += 1
        if won:
            ground_stats[ground_id]["wins"] += 1
        updates["ground_stats"] = ground_stats
    
    # Update format stats
    match_format = match_data.get("format", "T20")
    format_stats = stats.get("format_stats", {})
    if match_format not in format_stats:
        format_stats[match_format] = {"matches": 0, "wins": 0}
    format_stats[match_format]["matches"] += 1
    if won:
        format_stats[match_format]["wins"] += 1
    updates["format_stats"] = format_stats
    
    # Calculate win rate
    total = updates.get("total_matches", stats.get("total_matches", 0))
    wins = updates.get("matches_won", stats.get("matches_won", 0))
    updates["win_rate"] = (wins / total * 100) if total > 0 else 0
    
    # Calculate attendance rate
    confirmed = stats.get("matches_confirmed", 0)
    attended_count = updates.get("matches_attended", stats.get("matches_attended", 0))
    updates["attendance_rate"] = (attended_count / confirmed * 100) if confirmed > 0 else 100
    
    # Calculate form score (last 10 matches)
    recent_results = updates.get("recent_results", stats.get("recent_results", []))
    form_wins = recent_results.count("W")
    updates["form_score"] = (form_wins / len(recent_results) * 100) if recent_results else 50
    
    # Calculate overall rating (weighted average)
    reliability = stats.get("reliability_score", 100)
    impact = stats.get("impact_score", 50)
    form = updates.get("form_score", 50)
    updates["overall_rating"] = (reliability * 0.3 + impact * 0.4 + form * 0.3)
    
    await db.player_stats.update_one({"user_id": user_id}, {"$set": updates})

# ==================== AI MATCHMAKING & PREDICTIONS ====================

class MatchmakingRequest(BaseModel):
    team_id: str
    preferred_date: Optional[datetime] = None
    format: MatchFormat = MatchFormat.T20
    skill_range: str = "similar"  # "similar", "higher", "lower", "any"

class TeamPredictionRequest(BaseModel):
    team1_id: str
    team2_id: str
    format: MatchFormat = MatchFormat.T20
    ground_id: Optional[str] = None

@api_router.post("/ai/matchmaking")
async def find_opponent_teams(request: MatchmakingRequest, current_user: User = Depends(get_current_user)):
    """AI-powered matchmaking to find suitable opponent teams"""
    team = await db.teams.find_one({"id": request.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get team stats
    team_stats = await db.team_stats.find_one({"team_id": request.team_id}) or {}
    team_win_rate = team_stats.get("win_rate", 50)
    
    # Find potential opponents
    all_teams = await db.teams.find({"id": {"$ne": request.team_id}}).to_list(100)
    
    recommendations = []
    for opponent in all_teams:
        opponent_stats = await db.team_stats.find_one({"team_id": opponent["id"]}) or {}
        opponent_win_rate = opponent_stats.get("win_rate", 50)
        
        # Calculate compatibility score
        skill_diff = abs(team_win_rate - opponent_win_rate)
        
        if request.skill_range == "similar":
            if skill_diff > 20:
                continue
            compatibility = 100 - (skill_diff * 2)
        elif request.skill_range == "higher":
            if opponent_win_rate <= team_win_rate:
                continue
            compatibility = 80 + (skill_diff / 2)
        elif request.skill_range == "lower":
            if opponent_win_rate >= team_win_rate:
                continue
            compatibility = 80 + (skill_diff / 2)
        else:
            compatibility = 70
        
        # Check head-to-head history
        head_to_head = opponent_stats.get("head_to_head", {}).get(request.team_id, {})
        
        # Get suggested grounds
        suggested_grounds = await db.grounds.find({"slots.is_available": True}).to_list(3)
        
        recommendations.append({
            "opponent_team": {
                "id": opponent["id"],
                "name": opponent["name"],
                "location": opponent.get("home_location", ""),
                "player_count": len(opponent.get("player_ids", [])),
                "win_rate": opponent_win_rate
            },
            "compatibility_score": round(compatibility, 1),
            "predicted_match_quality": round((100 - skill_diff) * 0.8 + 20, 1),
            "head_to_head": head_to_head if head_to_head else None,
            "suggested_grounds": [{
                "id": g["id"],
                "name": g["name"],
                "location": g["location"],
                "price_per_hour": g["price_per_hour"]
            } for g in suggested_grounds],
            "recommendation_reason": f"Similar skill level (Win rate diff: {skill_diff:.0f}%)" if skill_diff < 15 else "Good challenge opportunity"
        })
    
    # Sort by compatibility
    recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)
    
    return {"recommendations": recommendations[:10]}

@api_router.post("/ai/predict-match")
async def predict_match_outcome(request: TeamPredictionRequest, current_user: User = Depends(get_current_user)):
    """AI-powered match outcome prediction"""
    team1_stats = await db.team_stats.find_one({"team_id": request.team1_id}) or {}
    team2_stats = await db.team_stats.find_one({"team_id": request.team2_id}) or {}
    
    team1 = await db.teams.find_one({"id": request.team1_id})
    team2 = await db.teams.find_one({"id": request.team2_id})
    
    if not team1 or not team2:
        raise HTTPException(status_code=404, detail="Team not found")
    
    factors = []
    
    # Base win rates
    t1_wr = team1_stats.get("win_rate", 50)
    t2_wr = team2_stats.get("win_rate", 50)
    
    factors.append({
        "factor": "Overall Win Rate",
        "team1_value": f"{t1_wr:.1f}%",
        "team2_value": f"{t2_wr:.1f}%",
        "advantage": "team1" if t1_wr > t2_wr else "team2" if t2_wr > t1_wr else "neutral"
    })
    
    # Ground performance (if ground specified)
    if request.ground_id:
        t1_ground = team1_stats.get("ground_performance", {}).get(request.ground_id, {})
        t2_ground = team2_stats.get("ground_performance", {}).get(request.ground_id, {})
        
        t1_ground_wr = (t1_ground.get("wins", 0) / t1_ground.get("matches", 1) * 100) if t1_ground.get("matches", 0) > 0 else 50
        t2_ground_wr = (t2_ground.get("wins", 0) / t2_ground.get("matches", 1) * 100) if t2_ground.get("matches", 0) > 0 else 50
        
        factors.append({
            "factor": "Ground Performance",
            "team1_value": f"{t1_ground_wr:.1f}%",
            "team2_value": f"{t2_ground_wr:.1f}%",
            "advantage": "team1" if t1_ground_wr > t2_ground_wr else "team2" if t2_ground_wr > t1_ground_wr else "neutral"
        })
    
    # Head to head
    h2h = team1_stats.get("head_to_head", {}).get(request.team2_id, {})
    if h2h:
        t1_h2h_wins = h2h.get("won", 0)
        t2_h2h_wins = h2h.get("lost", 0)
        factors.append({
            "factor": "Head to Head",
            "team1_value": f"{t1_h2h_wins} wins",
            "team2_value": f"{t2_h2h_wins} wins",
            "advantage": "team1" if t1_h2h_wins > t2_h2h_wins else "team2" if t2_h2h_wins > t1_h2h_wins else "neutral"
        })
    
    # Recent form (current streak)
    t1_streak = team1_stats.get("current_streak", 0)
    t2_streak = team2_stats.get("current_streak", 0)
    factors.append({
        "factor": "Current Form",
        "team1_value": f"{'+' if t1_streak > 0 else ''}{t1_streak}",
        "team2_value": f"{'+' if t2_streak > 0 else ''}{t2_streak}",
        "advantage": "team1" if t1_streak > t2_streak else "team2" if t2_streak > t1_streak else "neutral"
    })
    
    # Calculate probabilities
    t1_score = t1_wr * 0.4
    t2_score = t2_wr * 0.4
    
    # Add form bonus
    t1_score += max(0, t1_streak * 2)
    t2_score += max(0, t2_streak * 2)
    
    # Normalize
    total = t1_score + t2_score
    if total > 0:
        t1_prob = (t1_score / total) * 100
        t2_prob = (t2_score / total) * 100
    else:
        t1_prob = t2_prob = 50
    
    draw_prob = max(5, 15 - abs(t1_prob - t2_prob) / 5)
    t1_prob = t1_prob * (100 - draw_prob) / 100
    t2_prob = t2_prob * (100 - draw_prob) / 100
    
    return {
        "team1": {"id": team1["id"], "name": team1["name"]},
        "team2": {"id": team2["id"], "name": team2["name"]},
        "team1_win_probability": round(t1_prob, 1),
        "team2_win_probability": round(t2_prob, 1),
        "draw_probability": round(draw_prob, 1),
        "factors": factors,
        "confidence": round(70 + abs(t1_prob - t2_prob) / 3, 1),
        "prediction": team1["name"] if t1_prob > t2_prob else team2["name"]
    }

@api_router.get("/ai/player-recommendations/{team_id}")
async def get_player_recommendations(team_id: str, current_user: User = Depends(get_current_user)):
    """AI-powered player recommendations for a team"""
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get current team players
    current_players = set(team.get("player_ids", []))
    
    # Get all other players
    all_users = await db.users.find({
        "id": {"$nin": list(current_players)},
        "role": {"$in": ["player", "captain"]}
    }).to_list(100)
    
    recommendations = []
    
    for user in all_users:
        stats = await db.player_stats.find_one({"user_id": user["id"]}) or {}
        
        # Calculate compatibility
        reliability = stats.get("reliability_score", 80)
        impact = stats.get("impact_score", 50)
        form = stats.get("form_score", 50)
        
        # Check if played with team members before
        teammates_played = stats.get("teammates_played_with", {})
        team_chemistry = sum(teammates_played.get(pid, 0) for pid in current_players)
        
        # Location match bonus
        location_bonus = 20 if team.get("home_location", "").lower() in [loc.lower() for loc in user.get("preferred_locations", [])] else 0
        
        compatibility = (reliability * 0.3 + impact * 0.4 + form * 0.2 + (team_chemistry * 2) + location_bonus)
        
        strengths = []
        if reliability > 85:
            strengths.append("Highly reliable")
        if impact > 70:
            strengths.append("High impact player")
        if form > 70:
            strengths.append("In great form")
        if team_chemistry > 5:
            strengths.append(f"Chemistry with {team_chemistry} teammates")
        
        role_str = user.get("playing_role", "all_rounder").replace("_", " ").title()
        strengths.append(role_str)
        
        recommendations.append({
            "player": {
                "id": user["id"],
                "name": user.get("name", "Unknown"),
                "playing_role": user.get("playing_role", "all_rounder"),
                "matches_played": user.get("matches_played", 0),
                "overall_rating": stats.get("overall_rating", 50)
            },
            "compatibility_score": round(min(100, compatibility), 1),
            "strengths": strengths[:4],
            "impact_prediction": round(impact, 1),
            "recommendation_reason": f"{role_str} with {reliability:.0f}% reliability"
        })
    
    # Sort by compatibility
    recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)
    
    return {"recommendations": recommendations[:15]}

# ==================== ENHANCED CAPTAIN DASHBOARD ====================

@api_router.get("/captain/financial-summary/{team_id}")
async def get_captain_financial_summary(team_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed financial summary for captain"""
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can view this")
    
    # Get all matches for this team
    matches = await db.matches.find({"team_id": team_id}).to_list(100)
    
    total_due = 0
    total_collected = 0
    total_pending = 0
    total_refunded = 0
    players_paid = set()
    players_pending = set()
    
    for match in matches:
        for payment in match.get("player_payments", []):
            total_due += payment.get("amount_due", 0)
            total_collected += payment.get("amount_paid", 0)
            
            if payment.get("status") == "paid":
                players_paid.add(payment.get("user_id"))
            elif payment.get("status") == "pending":
                total_pending += payment.get("amount_due", 0) - payment.get("amount_paid", 0)
                players_pending.add(payment.get("user_id"))
            elif payment.get("status") == "refunded":
                total_refunded += payment.get("amount_paid", 0)
    
    # Get recent transactions
    player_ids = list(players_paid | players_pending)
    recent_txns = await db.wallet_transactions.find({
        "user_id": {"$in": player_ids},
        "reference_id": {"$in": [m["id"] for m in matches]}
    }).sort("created_at", -1).to_list(20)
    
    collection_rate = (total_collected / total_due * 100) if total_due > 0 else 0
    
    return {
        "total_due": round(total_due, 2),
        "total_collected": round(total_collected, 2),
        "total_pending": round(total_pending, 2),
        "total_refunded": round(total_refunded, 2),
        "collection_rate": round(collection_rate, 1),
        "players_paid": len(players_paid),
        "players_pending": len(players_pending),
        "team_wallet_balance": team.get("pool_balance", 0),
        "recent_transactions": [{
            "id": t["id"],
            "user_id": t["user_id"],
            "amount": t["amount"],
            "type": t["type"],
            "description": t["description"],
            "created_at": t["created_at"].isoformat() if isinstance(t["created_at"], datetime) else t["created_at"]
        } for t in recent_txns]
    }

@api_router.get("/captain/match-financials/{match_id}")
async def get_match_financial_details(match_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed financial breakdown for a specific match"""
    match = await db.matches.find_one({"id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    team = await db.teams.find_one({"id": match["team_id"]})
    if team["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can view this")
    
    # Calculate totals
    total_collected = sum(p.get("amount_paid", 0) for p in match.get("player_payments", []))
    total_pending = sum(
        p.get("amount_due", 0) - p.get("amount_paid", 0) 
        for p in match.get("player_payments", []) 
        if p.get("status") in ["pending", "partial"]
    )
    refunded_amount = sum(
        p.get("amount_paid", 0) 
        for p in match.get("player_payments", []) 
        if p.get("status") == "refunded"
    )
    
    # Get ground booking details
    ground_booking = None
    if match.get("ground_booking_id"):
        booking = await db.ground_bookings.find_one({"id": match["ground_booking_id"]})
        if booking:
            ground_booking = {
                "id": booking["id"],
                "ground_name": booking.get("ground_name"),
                "date": booking.get("date"),
                "time": f"{booking.get('start_time')} - {booking.get('end_time')}",
                "price": booking.get("price"),
                "status": booking.get("status")
            }
    
    cost_breakdown = match.get("cost_breakdown", {})
    ground_cost = cost_breakdown.get("ground_fee", 0)
    other_costs = cost_breakdown.get("umpire_fee", 0) + cost_breakdown.get("balls_equipment", 0) + cost_breakdown.get("miscellaneous", 0)
    
    return {
        "match_id": match["id"],
        "match_title": match["title"],
        "match_date": match["date"].isoformat() if isinstance(match["date"], datetime) else match["date"],
        "total_cost": match.get("total_cost", 0),
        "ground_booking_cost": ground_cost,
        "other_costs": other_costs,
        "total_collected": total_collected,
        "total_pending": total_pending,
        "refunded_amount": refunded_amount,
        "player_payments": [{
            "user_id": p.get("user_id"),
            "user_name": p.get("user_name"),
            "amount_due": p.get("amount_due"),
            "amount_paid": p.get("amount_paid"),
            "status": p.get("status"),
            "is_guest": p.get("is_guest", False),
            "paid_at": p.get("paid_at").isoformat() if p.get("paid_at") else None
        } for p in match.get("player_payments", [])],
        "ground_booking": ground_booking
    }

# ==================== ENHANCED TEAM WALLET ====================

@api_router.post("/team/{team_id}/wallet/withdraw")
async def withdraw_from_team_wallet(team_id: str, request: TeamPoolRequest, current_user: User = Depends(get_current_user)):
    """Withdraw from team pool wallet to captain's personal wallet"""
    amount = request.amount
    
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can withdraw")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    pool_balance = team.get("pool_balance", 0)
    if pool_balance < amount:
        raise HTTPException(status_code=400, detail=f"Insufficient pool balance. Available: {pool_balance}")
    
    idempotency_key = f"team_withdraw_{team_id}_{current_user.id}_{datetime.utcnow().isoformat()}"
    
    # Deduct from team pool
    result = await db.teams.update_one(
        {"id": team_id, "pool_balance": {"$gte": amount}},
        {"$inc": {"pool_balance": -amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to withdraw - insufficient balance")
    
    # Credit to captain's wallet
    await safe_wallet_credit(
        user_id=current_user.id,
        amount=amount,
        transaction_type=TransactionType.TEAM_POOL,
        description=f"Withdrawal from {team['name']} team pool",
        reference_id=team_id,
        idempotency_key=idempotency_key
    )
    
    # Audit log
    await create_audit_log(
        action="team_pool_withdraw",
        user_id=current_user.id,
        entity_type="team",
        entity_id=team_id,
        amount=amount,
        balance_before=pool_balance,
        balance_after=pool_balance - amount,
        metadata={"team_name": team["name"]}
    )
    
    return {
        "message": f"Successfully withdrew AED {amount}",
        "team_balance": pool_balance - amount,
        "transferred_to_wallet": True
    }

# ==================== PLAYER STATS ENDPOINTS ====================

@api_router.get("/players/{user_id}/stats")
async def get_player_stats(user_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed player statistics"""
    stats = await get_or_create_player_stats(user_id)
    user = await db.users.find_one({"id": user_id})
    
    return {
        "user": {
            "id": user["id"],
            "name": user.get("name", "Unknown"),
            "playing_role": user.get("playing_role"),
            "matches_played": user.get("matches_played", 0)
        } if user else None,
        "stats": stats
    }

@api_router.get("/my-stats")
async def get_my_stats(current_user: User = Depends(get_current_user)):
    """Get current user's statistics"""
    stats = await get_or_create_player_stats(current_user.id)
    return stats

# ==================== AUDIT LOG ENDPOINTS ====================

@api_router.get("/audit/transactions/{user_id}")
async def get_user_audit_log(user_id: str, current_user: User = Depends(get_current_user)):
    """Get audit log for a user (admin or self only)"""
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    logs = await db.audit_logs.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    # Convert to JSON-serializable format
    return {"audit_logs": [{
        "id": log.get("id"),
        "action": log.get("action"),
        "user_id": log.get("user_id"),
        "entity_type": log.get("entity_type"),
        "entity_id": log.get("entity_id"),
        "amount": log.get("amount"),
        "balance_before": log.get("balance_before"),
        "balance_after": log.get("balance_after"),
        "metadata": log.get("metadata", {}),
        "created_at": log.get("created_at").isoformat() if log.get("created_at") else None
    } for log in logs]}

@api_router.get("/wallet/ledger")
async def get_wallet_ledger(current_user: User = Depends(get_current_user)):
    """Get detailed wallet ledger for current user"""
    ledger = await db.wallet_ledger.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    
    return {
        "ledger": [{
            "id": l["id"],
            "debit": l.get("debit", 0),
            "credit": l.get("credit", 0),
            "balance": l.get("balance", 0),
            "description": l.get("description"),
            "reference_type": l.get("reference_type"),
            "created_at": l.get("created_at")
        } for l in ledger],
        "current_balance": current_user.wallet_balance
    }

# ==================== GROUND BOOKING LINKED TO MATCH ====================

@api_router.post("/matches/{match_id}/book-ground")
async def book_ground_for_match(match_id: str, ground_id: str, slot_id: str, current_user: User = Depends(get_current_user)):
    """Book a ground slot and link it to a match"""
    match = await db.matches.find_one({"id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can book ground")
    
    ground = await db.grounds.find_one({"id": ground_id})
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    # Find the slot
    slot = None
    for s in ground.get("slots", []):
        if s["id"] == slot_id:
            slot = s
            break
    
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if not slot.get("is_available", False):
        raise HTTPException(status_code=400, detail="Slot is not available")
    
    # Check wallet balance
    if current_user.wallet_balance < slot["price"]:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Required: {slot['price']}")
    
    idempotency_key = f"ground_booking_{match_id}_{slot_id}"
    
    # Create booking
    booking = GroundBooking(
        ground_id=ground_id,
        ground_name=ground["name"],
        slot_id=slot_id,
        user_id=current_user.id,
        match_id=match_id,
        date=slot["date"],
        start_time=slot["start_time"],
        end_time=slot["end_time"],
        price=slot["price"]
    )
    
    # Debit wallet
    await safe_wallet_debit(
        user_id=current_user.id,
        amount=slot["price"],
        transaction_type=TransactionType.GROUND_BOOKING,
        description=f"Ground booking: {ground['name']} on {slot['date']}",
        reference_id=booking.id,
        idempotency_key=idempotency_key
    )
    
    # Update slot availability
    await db.grounds.update_one(
        {"id": ground_id, "slots.id": slot_id},
        {"$set": {
            "slots.$.is_available": False,
            "slots.$.booked_by": current_user.id,
            "slots.$.booking_id": booking.id,
            "slots.$.match_id": match_id
        }}
    )
    
    # Update ground stats
    await db.grounds.update_one(
        {"id": ground_id},
        {"$inc": {"total_bookings": 1, "total_earnings": slot["price"]}}
    )
    
    # Save booking
    await db.ground_bookings.insert_one(booking.dict())
    
    # Link to match
    await db.matches.update_one(
        {"id": match_id},
        {"$set": {
            "ground_id": ground_id,
            "ground_booking_id": booking.id,
            "location": ground["name"],
            "cost_breakdown.ground_fee": slot["price"]
        }}
    )
    
    # Audit log
    await create_audit_log(
        action="ground_booking",
        user_id=current_user.id,
        entity_type="booking",
        entity_id=booking.id,
        amount=slot["price"],
        metadata={
            "ground_id": ground_id,
            "ground_name": ground["name"],
            "match_id": match_id,
            "slot": slot
        }
    )
    
    # Send notification to ground owner
    if ground.get("owner_id") and ground["owner_id"] != "system":
        notification = Notification(
            user_id=ground["owner_id"],
            title="New Booking!",
            message=f"Your ground {ground['name']} has been booked for {slot['date']} ({slot['start_time']} - {slot['end_time']})",
            type="ground_booking",
            reference_id=booking.id
        )
        await db.notifications.insert_one(notification.dict())
    
    return {
        "booking": booking,
        "message": "Ground booked successfully and linked to match"
    }

@api_router.post("/bookings/{booking_id}/refund")
async def refund_ground_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    """Cancel booking and process refund with ledger entries"""
    booking = await db.ground_bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    ground = await db.grounds.find_one({"id": booking["ground_id"]})
    
    # Calculate refund based on cancellation policy
    hours_until = 48  # Simplified - would calculate actual hours
    cancellation_hours = ground.get("cancellation_hours", 24) if ground else 24
    cancellation_fee_percent = ground.get("cancellation_fee_percent", 20) if ground else 20
    
    if hours_until < cancellation_hours:
        refund_percent = 100 - cancellation_fee_percent
    else:
        refund_percent = 100
    
    refund_amount = booking["price"] * (refund_percent / 100)
    
    idempotency_key = f"booking_refund_{booking_id}"
    
    # Credit refund to wallet
    await safe_wallet_credit(
        user_id=current_user.id,
        amount=refund_amount,
        transaction_type=TransactionType.REFUND,
        description=f"Refund: {booking['ground_name']} booking ({refund_percent}%)",
        reference_id=booking_id,
        idempotency_key=idempotency_key
    )
    
    # Update booking status
    await db.ground_bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled"}}
    )
    
    # Release slot
    if ground:
        await db.grounds.update_one(
            {"id": booking["ground_id"], "slots.id": booking["slot_id"]},
            {"$set": {
                "slots.$.is_available": True,
                "slots.$.booked_by": None,
                "slots.$.booking_id": None,
                "slots.$.match_id": None
            }}
        )
    
    # Update match if linked
    if booking.get("match_id"):
        await db.matches.update_one(
            {"id": booking["match_id"]},
            {"$set": {
                "ground_id": None,
                "ground_booking_id": None,
                "cost_breakdown.ground_fee": 0
            }}
        )
    
    # Audit log
    await create_audit_log(
        action="ground_booking_cancel",
        user_id=current_user.id,
        entity_type="booking",
        entity_id=booking_id,
        amount=refund_amount,
        metadata={
            "original_price": booking["price"],
            "refund_percent": refund_percent,
            "cancellation_fee": booking["price"] - refund_amount
        }
    )
    
    return {
        "message": "Booking cancelled",
        "refund_amount": refund_amount,
        "refund_percent": refund_percent,
        "cancellation_fee": booking["price"] - refund_amount
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
