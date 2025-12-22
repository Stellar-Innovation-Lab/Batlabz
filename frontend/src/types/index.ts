// User Types
export enum UserRole {
  PLAYER = 'player',
  CAPTAIN = 'captain',
  GROUND_OWNER = 'ground_owner',
  ADMIN = 'admin',
}

export enum PlayingRole {
  BATSMAN = 'batsman',
  BOWLER = 'bowler',
  ALL_ROUNDER = 'all_rounder',
  WICKET_KEEPER = 'wicket_keeper',
}

export interface User {
  id: string;
  phone: string;
  name: string;
  nickname?: string;
  role: UserRole;
  playing_role: PlayingRole;
  preferred_locations: string[];
  availability: Record<string, boolean>;
  team_ids: string[];
  wallet_balance: number;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  logo?: string;
  home_location: string;
  captain_id: string;
  vice_captain_id?: string;
  player_ids: string[];
  invite_code: string;
  created_at: string;
}

// Match Types
export enum MatchFormat {
  T10 = 'T10',
  T20 = 'T20',
  NETS = 'nets',
  FRIENDLY = 'friendly',
}

export enum MatchStatus {
  DRAFT = 'draft',
  PLAYERS_INVITED = 'players_invited',
  CONFIRMED = 'confirmed',
  PAYMENTS_PENDING = 'payments_pending',
  READY_TO_PLAY = 'ready_to_play',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

export interface MatchCostBreakdown {
  ground_fee: number;
  umpire_fee: number;
  balls_equipment: number;
  miscellaneous: number;
}

export interface PlayerPayment {
  user_id: string;
  user_name: string;
  amount_due: number;
  amount_paid: number;
  status: PaymentStatus;
  paid_at?: string;
}

export interface Match {
  id: string;
  team_id: string;
  title: string;
  date: string;
  location: string;
  ground_id?: string;
  format: MatchFormat;
  player_limit: number;
  captain_id: string;
  total_cost: number;
  cost_breakdown: MatchCostBreakdown;
  per_player_cost: number;
  extras: string[];
  status: MatchStatus;
  invited_player_ids: string[];
  confirmed_player_ids: string[];
  waiting_list_ids: string[];
  player_payments: PlayerPayment[];
  created_at: string;
  updated_at: string;
}

// Wallet Types
export enum TransactionType {
  TOPUP = 'topup',
  MATCH_PAYMENT = 'match_payment',
  REFUND = 'refund',
  GROUND_BOOKING = 'ground_booking',
  WITHDRAWAL = 'withdrawal',
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  created_at: string;
}

// Ground Types
export enum GroundType {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
}

export enum TurfType {
  NATURAL = 'natural',
  ARTIFICIAL = 'artificial',
  MATTING = 'matting',
}

export interface GroundSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  is_available: boolean;
  booked_by?: string;
  match_id?: string;
}

export interface Ground {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  type: GroundType;
  turf_type: TurfType;
  has_lighting: boolean;
  has_parking: boolean;
  price_per_hour: number;
  description?: string;
  images: string[];
  amenities: string[];
  rating: number;
  total_bookings: number;
  slots: GroundSlot[];
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

// Dashboard Types
export interface PlayerDashboard {
  wallet_balance: number;
  upcoming_matches: Match[];
  past_matches: Match[];
  recent_transactions: WalletTransaction[];
  pending_payment_amount: number;
  teams_count: number;
}

export interface CaptainDashboard {
  team: Team;
  total_matches: number;
  total_collected: number;
  total_outstanding: number;
  player_count: number;
  upcoming_matches: Match[];
  recent_matches: Match[];
}
