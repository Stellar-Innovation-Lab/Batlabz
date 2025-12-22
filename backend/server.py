from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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
import random
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'batlabz_secret_key_2025')
JWT_ALGORITHM = "HS256"

# Create the main app
app = FastAPI(title="Batlabz API", description="Cricket Pay & Play Platform")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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

class TransactionType(str, Enum):
    TOPUP = "topup"
    MATCH_PAYMENT = "match_payment"
    REFUND = "refund"
    GROUND_BOOKING = "ground_booking"
    WITHDRAWAL = "withdrawal"

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
    playing_role: PlayingRole = PlayingRole.ALL_ROUNDER
    preferred_locations: List[str] = []
    availability: Dict[str, bool] = {}

class UserUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    playing_role: Optional[PlayingRole] = None
    preferred_locations: Optional[List[str]] = None
    availability: Optional[Dict[str, bool]] = None
    profile_image: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: str = ""
    nickname: Optional[str] = None
    role: UserRole = UserRole.PLAYER
    playing_role: PlayingRole = PlayingRole.ALL_ROUNDER
    preferred_locations: List[str] = []
    availability: Dict[str, bool] = {}
    team_ids: List[str] = []
    wallet_balance: float = 0.0
    profile_image: Optional[str] = None
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

class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: Optional[str] = None
    home_location: str
    captain_id: str
    vice_captain_id: Optional[str] = None
    player_ids: List[str] = []
    invite_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TeamInvite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    user_id: str
    status: InviteStatus = InviteStatus.PENDING
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
    paid_at: Optional[datetime] = None

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    title: str
    date: datetime
    location: str
    ground_id: Optional[str] = None
    format: MatchFormat
    player_limit: int = 22
    captain_id: str
    total_cost: float = 0.0
    cost_breakdown: MatchCostBreakdown = MatchCostBreakdown()
    per_player_cost: float = 0.0
    extras: List[str] = []
    status: MatchStatus = MatchStatus.DRAFT
    invited_player_ids: List[str] = []
    confirmed_player_ids: List[str] = []
    waiting_list_ids: List[str] = []
    player_payments: List[PlayerPayment] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MatchInviteResponse(BaseModel):
    response: str  # "accept" or "decline"

# Wallet Models
class WalletTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: TransactionType
    amount: float
    balance_after: float
    description: str
    reference_id: Optional[str] = None  # match_id, ground_booking_id, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TopupRequest(BaseModel):
    amount: float
    payment_method: str = "card"  # card, bank_transfer

class PayMatchRequest(BaseModel):
    match_id: str
    use_wallet: bool = True
    amount: Optional[float] = None  # For partial payments

# Ground Models
class GroundSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    start_time: str
    end_time: str
    price: float
    is_available: bool = True
    booked_by: Optional[str] = None
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
    slots: List[GroundSlot] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookSlotRequest(BaseModel):
    ground_id: str
    slot_id: str
    match_id: Optional[str] = None

# Notification Models
class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # match_invite, payment_due, match_reminder, etc.
    reference_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# OTP Storage (in-memory for MVP)
otp_storage: Dict[str, str] = {}

# ==================== HELPERS ====================

def create_token(user_id: str) -> str:
    expiry = datetime.utcnow() + timedelta(days=30)
    payload = {
        "user_id": user_id,
        "exp": expiry
    }
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
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        reference_id=reference_id
    )
    await db.notifications.insert_one(notification.dict())
    return notification

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/request-otp")
async def request_otp(request: OTPRequest):
    """Request OTP for phone login (Mock - always returns 123456)"""
    phone = request.phone.strip()
    # Generate mock OTP (always 123456 for MVP)
    otp = "123456"
    otp_storage[phone] = otp
    logger.info(f"OTP for {phone}: {otp}")
    return {"message": "OTP sent successfully", "otp": otp}  # Return OTP for testing

@api_router.post("/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerify):
    """Verify OTP and return JWT token"""
    phone = request.phone.strip()
    otp = request.otp.strip()
    
    # For MVP, accept 123456 as valid OTP
    stored_otp = otp_storage.get(phone, "123456")
    if otp != stored_otp and otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check if user exists
    user_data = await db.users.find_one({"phone": phone})
    is_new_user = False
    
    if not user_data:
        # Create new user
        user = User(phone=phone)
        await db.users.insert_one(user.dict())
        user_data = user.dict()
        is_new_user = True
    
    token = create_token(user_data["id"])
    return TokenResponse(
        access_token=token,
        user_id=user_data["id"],
        is_new_user=is_new_user
    )

# ==================== USER ROUTES ====================

@api_router.get("/users/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@api_router.put("/users/me", response_model=User)
async def update_me(update: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update current user profile"""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    user_data = await db.users.find_one({"id": current_user.id})
    return User(**user_data)

@api_router.post("/users/complete-profile", response_model=User)
async def complete_profile(profile: UserCreate, current_user: User = Depends(get_current_user)):
    """Complete user profile after signup"""
    update_data = profile.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    user_data = await db.users.find_one({"id": current_user.id})
    return User(**user_data)

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Get user by ID"""
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_data)

@api_router.get("/users/search/{query}")
async def search_users(query: str, current_user: User = Depends(get_current_user)):
    """Search users by name or phone"""
    users = await db.users.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"phone": {"$regex": query}}
        ]
    }).to_list(20)
    return [User(**u) for u in users]

# ==================== TEAM ROUTES ====================

@api_router.post("/teams", response_model=Team)
async def create_team(team_data: TeamCreate, current_user: User = Depends(get_current_user)):
    """Create a new team"""
    team = Team(
        **team_data.dict(),
        captain_id=current_user.id,
        player_ids=[current_user.id]
    )
    await db.teams.insert_one(team.dict())
    
    # Update user role to captain and add team
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {"role": UserRole.CAPTAIN},
            "$push": {"team_ids": team.id}
        }
    )
    
    return team

@api_router.get("/teams", response_model=List[Team])
async def get_my_teams(current_user: User = Depends(get_current_user)):
    """Get all teams user belongs to"""
    teams = await db.teams.find({
        "$or": [
            {"player_ids": current_user.id},
            {"captain_id": current_user.id}
        ]
    }).to_list(100)
    return [Team(**t) for t in teams]

@api_router.get("/teams/{team_id}", response_model=Team)
async def get_team(team_id: str, current_user: User = Depends(get_current_user)):
    """Get team by ID"""
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    return Team(**team_data)

@api_router.put("/teams/{team_id}", response_model=Team)
async def update_team(team_id: str, update: TeamUpdate, current_user: User = Depends(get_current_user)):
    """Update team (captain only)"""
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
    """Join team using invite code"""
    team_data = await db.teams.find_one({"invite_code": invite_code.upper()})
    if not team_data:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    if current_user.id in team_data.get("player_ids", []):
        raise HTTPException(status_code=400, detail="Already a member of this team")
    
    # Add player to team
    await db.teams.update_one(
        {"id": team_data["id"]},
        {"$push": {"player_ids": current_user.id}}
    )
    
    # Add team to user
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"team_ids": team_data["id"]}}
    )
    
    # Notify captain
    await create_notification(
        team_data["captain_id"],
        "New Team Member",
        f"{current_user.name or 'A player'} has joined your team {team_data['name']}",
        "team_join",
        team_data["id"]
    )
    
    return {"message": "Successfully joined team", "team_id": team_data["id"]}

@api_router.get("/teams/{team_id}/players")
async def get_team_players(team_id: str, current_user: User = Depends(get_current_user)):
    """Get all players in a team"""
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    players = await db.users.find({"id": {"$in": team_data.get("player_ids", [])}}).to_list(100)
    return [User(**p) for p in players]

@api_router.delete("/teams/{team_id}/players/{player_id}")
async def remove_player(team_id: str, player_id: str, current_user: User = Depends(get_current_user)):
    """Remove player from team (captain only)"""
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can remove players")
    if player_id == team_data["captain_id"]:
        raise HTTPException(status_code=400, detail="Captain cannot be removed")
    
    await db.teams.update_one(
        {"id": team_id},
        {"$pull": {"player_ids": player_id}}
    )
    await db.users.update_one(
        {"id": player_id},
        {"$pull": {"team_ids": team_id}}
    )
    
    return {"message": "Player removed successfully"}

# ==================== MATCH ROUTES ====================

@api_router.post("/matches", response_model=Match)
async def create_match(match_data: MatchCreate, team_id: str, current_user: User = Depends(get_current_user)):
    """Create a new match (captain only)"""
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can create matches")
    
    match = Match(
        **match_data.dict(),
        team_id=team_id,
        captain_id=current_user.id
    )
    await db.matches.insert_one(match.dict())
    
    return match

@api_router.get("/matches")
async def get_my_matches(current_user: User = Depends(get_current_user)):
    """Get all matches for current user"""
    # Get matches where user is invited or confirmed
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
    """Get all matches for a team"""
    matches = await db.matches.find({"team_id": team_id}).sort("date", -1).to_list(100)
    return [Match(**m) for m in matches]

@api_router.get("/matches/{match_id}", response_model=Match)
async def get_match(match_id: str, current_user: User = Depends(get_current_user)):
    """Get match by ID"""
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    return Match(**match_data)

@api_router.put("/matches/{match_id}", response_model=Match)
async def update_match(match_id: str, update: MatchUpdate, current_user: User = Depends(get_current_user)):
    """Update match (captain only)"""
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can update match")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if "cost_breakdown" in update_data:
        update_data["cost_breakdown"] = update_data["cost_breakdown"].dict() if hasattr(update_data["cost_breakdown"], 'dict') else update_data["cost_breakdown"]
    update_data["updated_at"] = datetime.utcnow()
    
    await db.matches.update_one({"id": match_id}, {"$set": update_data})
    
    match_data = await db.matches.find_one({"id": match_id})
    return Match(**match_data)

@api_router.post("/matches/{match_id}/invite")
async def invite_players(match_id: str, player_ids: List[str], current_user: User = Depends(get_current_user)):
    """Invite players to match (captain only)"""
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can invite players")
    
    # Add players to invited list
    await db.matches.update_one(
        {"id": match_id},
        {
            "$addToSet": {"invited_player_ids": {"$each": player_ids}},
            "$set": {"status": MatchStatus.PLAYERS_INVITED, "updated_at": datetime.utcnow()}
        }
    )
    
    # Send notifications
    for player_id in player_ids:
        await create_notification(
            player_id,
            "Match Invitation",
            f"You've been invited to {match_data['title']}",
            "match_invite",
            match_id
        )
    
    return {"message": f"Invited {len(player_ids)} players"}

@api_router.post("/matches/{match_id}/respond")
async def respond_to_invite(match_id: str, response: MatchInviteResponse, current_user: User = Depends(get_current_user)):
    """Respond to match invitation"""
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if current_user.id not in match_data.get("invited_player_ids", []):
        raise HTTPException(status_code=400, detail="You were not invited to this match")
    
    if response.response == "accept":
        confirmed = match_data.get("confirmed_player_ids", [])
        if len(confirmed) >= match_data["player_limit"]:
            # Add to waiting list
            await db.matches.update_one(
                {"id": match_id},
                {"$addToSet": {"waiting_list_ids": current_user.id}}
            )
            return {"message": "Added to waiting list - match is full"}
        
        # Calculate per player cost
        match_obj = Match(**match_data)
        per_player = match_obj.total_cost / match_obj.player_limit if match_obj.player_limit > 0 else 0
        
        # Create payment record
        payment = PlayerPayment(
            user_id=current_user.id,
            user_name=current_user.name or "Player",
            amount_due=per_player,
            status=PaymentStatus.PENDING
        )
        
        await db.matches.update_one(
            {"id": match_id},
            {
                "$addToSet": {"confirmed_player_ids": current_user.id},
                "$push": {"player_payments": payment.dict()},
                "$set": {"per_player_cost": per_player, "updated_at": datetime.utcnow()}
            }
        )
        
        # Notify captain
        await create_notification(
            match_data["captain_id"],
            "Player Confirmed",
            f"{current_user.name or 'A player'} confirmed for {match_data['title']}",
            "player_confirmed",
            match_id
        )
        
        return {"message": "Successfully confirmed for match", "amount_due": per_player}
    else:
        await db.matches.update_one(
            {"id": match_id},
            {"$pull": {"invited_player_ids": current_user.id}}
        )
        return {"message": "Invitation declined"}

@api_router.post("/matches/{match_id}/calculate-fees")
async def calculate_fees(match_id: str, current_user: User = Depends(get_current_user)):
    """Recalculate fees for all confirmed players"""
    match_data = await db.matches.find_one({"id": match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    if match_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only captain can calculate fees")
    
    confirmed_count = len(match_data.get("confirmed_player_ids", []))
    if confirmed_count == 0:
        raise HTTPException(status_code=400, detail="No confirmed players")
    
    per_player = match_data["total_cost"] / confirmed_count
    
    # Update all payment records
    updated_payments = []
    for payment in match_data.get("player_payments", []):
        payment["amount_due"] = per_player
        updated_payments.append(payment)
    
    await db.matches.update_one(
        {"id": match_id},
        {"$set": {
            "per_player_cost": per_player,
            "player_payments": updated_payments,
            "status": MatchStatus.PAYMENTS_PENDING,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Notify all players
    for player_id in match_data.get("confirmed_player_ids", []):
        await create_notification(
            player_id,
            "Payment Due",
            f"Payment of AED {per_player:.2f} due for {match_data['title']}",
            "payment_due",
            match_id
        )
    
    return {"per_player_cost": per_player, "total_players": confirmed_count}

# ==================== WALLET ROUTES ====================

@api_router.get("/wallet/balance")
async def get_wallet_balance(current_user: User = Depends(get_current_user)):
    """Get current wallet balance"""
    return {"balance": current_user.wallet_balance}

@api_router.get("/wallet/transactions")
async def get_wallet_transactions(current_user: User = Depends(get_current_user)):
    """Get wallet transaction history"""
    transactions = await db.wallet_transactions.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(100)
    return [WalletTransaction(**t) for t in transactions]

@api_router.post("/wallet/topup")
async def topup_wallet(request: TopupRequest, current_user: User = Depends(get_current_user)):
    """Top up wallet (Mock payment for MVP)"""
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Mock payment success
    new_balance = current_user.wallet_balance + request.amount
    
    # Create transaction record
    transaction = WalletTransaction(
        user_id=current_user.id,
        type=TransactionType.TOPUP,
        amount=request.amount,
        balance_after=new_balance,
        description=f"Wallet top-up via {request.payment_method}"
    )
    await db.wallet_transactions.insert_one(transaction.dict())
    
    # Update user balance
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"wallet_balance": new_balance}}
    )
    
    return {"message": "Top-up successful", "new_balance": new_balance, "transaction_id": transaction.id}

@api_router.post("/wallet/pay-match")
async def pay_for_match(request: PayMatchRequest, current_user: User = Depends(get_current_user)):
    """Pay for match from wallet"""
    match_data = await db.matches.find_one({"id": request.match_id})
    if not match_data:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Find player's payment record
    player_payment = None
    payment_index = -1
    for i, p in enumerate(match_data.get("player_payments", [])):
        if p["user_id"] == current_user.id:
            player_payment = p
            payment_index = i
            break
    
    if not player_payment:
        raise HTTPException(status_code=400, detail="No payment record found for you")
    
    amount_remaining = player_payment["amount_due"] - player_payment.get("amount_paid", 0)
    payment_amount = request.amount if request.amount else amount_remaining
    
    if payment_amount > amount_remaining:
        payment_amount = amount_remaining
    
    if request.use_wallet:
        if current_user.wallet_balance < payment_amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        new_balance = current_user.wallet_balance - payment_amount
        
        # Create transaction
        transaction = WalletTransaction(
            user_id=current_user.id,
            type=TransactionType.MATCH_PAYMENT,
            amount=-payment_amount,
            balance_after=new_balance,
            description=f"Payment for match: {match_data['title']}",
            reference_id=request.match_id
        )
        await db.wallet_transactions.insert_one(transaction.dict())
        
        # Update user balance
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"wallet_balance": new_balance}}
        )
    
    # Update payment record
    new_paid = player_payment.get("amount_paid", 0) + payment_amount
    new_status = PaymentStatus.PAID if new_paid >= player_payment["amount_due"] else PaymentStatus.PENDING
    
    await db.matches.update_one(
        {"id": request.match_id, f"player_payments.{payment_index}.user_id": current_user.id},
        {"$set": {
            f"player_payments.{payment_index}.amount_paid": new_paid,
            f"player_payments.{payment_index}.status": new_status,
            f"player_payments.{payment_index}.paid_at": datetime.utcnow() if new_status == PaymentStatus.PAID else None
        }}
    )
    
    # Notify captain if fully paid
    if new_status == PaymentStatus.PAID:
        await create_notification(
            match_data["captain_id"],
            "Payment Received",
            f"{current_user.name or 'A player'} has paid for {match_data['title']}",
            "payment_received",
            request.match_id
        )
    
    return {
        "message": "Payment successful",
        "amount_paid": payment_amount,
        "total_paid": new_paid,
        "amount_remaining": player_payment["amount_due"] - new_paid,
        "status": new_status
    }

# ==================== GROUND ROUTES ====================

@api_router.post("/grounds", response_model=Ground)
async def create_ground(ground_data: GroundCreate, current_user: User = Depends(get_current_user)):
    """Create a new ground (ground owner)"""
    ground = Ground(
        **ground_data.dict(),
        owner_id=current_user.id
    )
    await db.grounds.insert_one(ground.dict())
    
    # Update user role
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"role": UserRole.GROUND_OWNER}}
    )
    
    return ground

@api_router.get("/grounds")
async def get_grounds(
    location: Optional[str] = None,
    ground_type: Optional[GroundType] = None,
    has_lighting: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all grounds with optional filters"""
    query = {}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if ground_type:
        query["type"] = ground_type
    if has_lighting is not None:
        query["has_lighting"] = has_lighting
    
    grounds = await db.grounds.find(query).to_list(100)
    return [Ground(**g) for g in grounds]

@api_router.get("/grounds/{ground_id}", response_model=Ground)
async def get_ground(ground_id: str, current_user: User = Depends(get_current_user)):
    """Get ground by ID"""
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    return Ground(**ground_data)

@api_router.post("/grounds/{ground_id}/slots")
async def add_slots(ground_id: str, slots: List[GroundSlot], current_user: User = Depends(get_current_user)):
    """Add available slots to ground (owner only)"""
    ground_data = await db.grounds.find_one({"id": ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    if ground_data["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can manage slots")
    
    slot_dicts = [s.dict() for s in slots]
    await db.grounds.update_one(
        {"id": ground_id},
        {"$push": {"slots": {"$each": slot_dicts}}}
    )
    
    return {"message": f"Added {len(slots)} slots"}

@api_router.post("/grounds/book")
async def book_slot(request: BookSlotRequest, current_user: User = Depends(get_current_user)):
    """Book a ground slot"""
    ground_data = await db.grounds.find_one({"id": request.ground_id})
    if not ground_data:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    # Find the slot
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
        raise HTTPException(status_code=400, detail="Slot is not available")
    
    # Check wallet balance
    if current_user.wallet_balance < slot["price"]:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    # Deduct from wallet
    new_balance = current_user.wallet_balance - slot["price"]
    transaction = WalletTransaction(
        user_id=current_user.id,
        type=TransactionType.GROUND_BOOKING,
        amount=-slot["price"],
        balance_after=new_balance,
        description=f"Ground booking: {ground_data['name']}",
        reference_id=request.ground_id
    )
    await db.wallet_transactions.insert_one(transaction.dict())
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"wallet_balance": new_balance}}
    )
    
    # Update slot
    await db.grounds.update_one(
        {"id": request.ground_id},
        {"$set": {
            f"slots.{slot_index}.is_available": False,
            f"slots.{slot_index}.booked_by": current_user.id,
            f"slots.{slot_index}.match_id": request.match_id
        },
        "$inc": {"total_bookings": 1}}
    )
    
    # Notify ground owner
    await create_notification(
        ground_data["owner_id"],
        "New Booking",
        f"Your ground {ground_data['name']} has been booked",
        "ground_booking",
        request.ground_id
    )
    
    return {"message": "Booking successful", "transaction_id": transaction.id}

@api_router.get("/grounds/my-grounds")
async def get_my_grounds(current_user: User = Depends(get_current_user)):
    """Get grounds owned by current user"""
    grounds = await db.grounds.find({"owner_id": current_user.id}).to_list(100)
    return [Ground(**g) for g in grounds]

# ==================== NOTIFICATION ROUTES ====================

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Get all notifications for current user"""
    notifications = await db.notifications.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(50)
    return [Notification(**n) for n in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    return {"message": "Marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    return {"message": "All marked as read"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({"user_id": current_user.id, "is_read": False})
    return {"count": count}

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/player")
async def get_player_dashboard(current_user: User = Depends(get_current_user)):
    """Get player dashboard data"""
    # Upcoming matches
    upcoming = await db.matches.find({
        "$or": [
            {"confirmed_player_ids": current_user.id},
            {"invited_player_ids": current_user.id}
        ],
        "date": {"$gte": datetime.utcnow()},
        "status": {"$nin": [MatchStatus.CANCELLED, MatchStatus.COMPLETED]}
    }).sort("date", 1).to_list(10)
    
    # Past matches
    past = await db.matches.find({
        "confirmed_player_ids": current_user.id,
        "status": MatchStatus.COMPLETED
    }).sort("date", -1).to_list(10)
    
    # Recent transactions
    transactions = await db.wallet_transactions.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(5)
    
    # Pending payments
    pending_matches = await db.matches.find({
        "player_payments.user_id": current_user.id,
        "player_payments.status": PaymentStatus.PENDING
    }).to_list(10)
    
    pending_amount = 0
    for match in pending_matches:
        for payment in match.get("player_payments", []):
            if payment["user_id"] == current_user.id and payment["status"] == PaymentStatus.PENDING:
                pending_amount += payment["amount_due"] - payment.get("amount_paid", 0)
    
    return {
        "wallet_balance": current_user.wallet_balance,
        "upcoming_matches": [Match(**m) for m in upcoming],
        "past_matches": [Match(**m) for m in past],
        "recent_transactions": [WalletTransaction(**t) for t in transactions],
        "pending_payment_amount": pending_amount,
        "teams_count": len(current_user.team_ids)
    }

@api_router.get("/dashboard/captain/{team_id}")
async def get_captain_dashboard(team_id: str, current_user: User = Depends(get_current_user)):
    """Get captain dashboard for a team"""
    team_data = await db.teams.find_one({"id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_data["captain_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not captain of this team")
    
    # Get all matches for team
    matches = await db.matches.find({"team_id": team_id}).sort("date", -1).to_list(100)
    
    # Calculate stats
    total_matches = len(matches)
    total_collected = 0
    total_outstanding = 0
    
    for match in matches:
        for payment in match.get("player_payments", []):
            total_collected += payment.get("amount_paid", 0)
            if payment["status"] == PaymentStatus.PENDING:
                total_outstanding += payment["amount_due"] - payment.get("amount_paid", 0)
    
    # Upcoming matches with payment status
    upcoming = [m for m in matches if m["status"] not in [MatchStatus.COMPLETED, MatchStatus.CANCELLED]]
    
    return {
        "team": Team(**team_data),
        "total_matches": total_matches,
        "total_collected": total_collected,
        "total_outstanding": total_outstanding,
        "player_count": len(team_data.get("player_ids", [])),
        "upcoming_matches": [Match(**m) for m in upcoming[:5]],
        "recent_matches": [Match(**m) for m in matches[:10]]
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Batlabz API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS middleware
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
