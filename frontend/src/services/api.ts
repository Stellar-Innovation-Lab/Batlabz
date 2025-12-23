import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      AsyncStorage.removeItem('auth_token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to make authenticated request with specific token
export const getMeWithToken = async (token: string) => {
  return api.get('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Auth APIs
export const authAPI = {
  requestOTP: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// User APIs
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  completeProfile: (data: any) => api.post('/users/complete-profile', data),
  getUser: (userId: string) => api.get(`/users/${userId}`),
  searchUsers: (query: string) => api.get(`/users/search/${query}`),
};

// Team APIs
export const teamAPI = {
  create: (data: any) => api.post('/teams', data),
  getMyTeams: () => api.get('/teams'),
  getTeam: (teamId: string) => api.get(`/teams/${teamId}`),
  updateTeam: (teamId: string, data: any) => api.put(`/teams/${teamId}`, data),
  joinByCode: (inviteCode: string) => api.post(`/teams/join/${inviteCode}`),
  getPlayers: (teamId: string) => api.get(`/teams/${teamId}/players`),
  removePlayer: (teamId: string, playerId: string) => api.delete(`/teams/${teamId}/players/${playerId}`),
  blockPlayer: (teamId: string, playerId: string) => api.post(`/teams/${teamId}/block/${playerId}`),
  // Announcements
  createAnnouncement: (teamId: string, title: string, message: string) => 
    api.post(`/teams/${teamId}/announcements?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`),
  getAnnouncements: (teamId: string) => api.get(`/teams/${teamId}/announcements`),
  // Messages/Chat
  sendMessage: (teamId: string, message: string, matchId?: string) => 
    api.post(`/teams/${teamId}/messages?message=${encodeURIComponent(message)}${matchId ? `&match_id=${matchId}` : ''}`),
  getMessages: (teamId: string, matchId?: string) => 
    api.get(`/teams/${teamId}/messages${matchId ? `?match_id=${matchId}` : ''}`),
  // Pool
  managePool: (teamId: string, amount: number, action: 'deposit' | 'withdraw') =>
    api.post(`/teams/${teamId}/pool`, { team_id: teamId, amount, action }),
};

// Match APIs
export const matchAPI = {
  create: (teamId: string, data: any) => api.post(`/matches?team_id=${teamId}`, data),
  getMyMatches: () => api.get('/matches'),
  getTeamMatches: (teamId: string) => api.get(`/matches/team/${teamId}`),
  getMatch: (matchId: string) => api.get(`/matches/${matchId}`),
  updateMatch: (matchId: string, data: any) => api.put(`/matches/${matchId}`, data),
  invitePlayers: (matchId: string, playerIds: string[]) => api.post(`/matches/${matchId}/invite`, playerIds),
  respond: (matchId: string, response: string) => api.post(`/matches/${matchId}/respond`, { response }),
  calculateFees: (matchId: string) => api.post(`/matches/${matchId}/calculate-fees`),
  addExpense: (matchId: string, description: string, amount: number) => 
    api.post(`/matches/${matchId}/add-expense`, { description, amount }),
  complete: (matchId: string) => api.post(`/matches/${matchId}/complete`),
  cancel: (matchId: string) => api.post(`/matches/${matchId}/cancel`),
  getSummary: (matchId: string) => api.get(`/matches/${matchId}/summary`),
  // Ride coordination
  updateRide: (matchId: string, status: string, seats?: number, pickupLocation?: string) =>
    api.post(`/matches/${matchId}/ride`, { match_id: matchId, status, seats_available: seats, pickup_location: pickupLocation }),
  getRides: (matchId: string) => api.get(`/matches/${matchId}/rides`),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  topup: (amount: number, paymentMethod: string) => api.post('/wallet/topup', { amount, payment_method: paymentMethod }),
  payMatch: (matchId: string, useWallet: boolean, amount?: number) => 
    api.post('/wallet/pay-match', { match_id: matchId, use_wallet: useWallet, amount }),
};

// Ground APIs
export const groundAPI = {
  create: (data: any) => api.post('/grounds', data),
  getAll: (params?: any) => api.get('/grounds', { params }),
  getGround: (groundId: string) => api.get(`/grounds/${groundId}`),
  updateGround: (groundId: string, data: any) => api.put(`/grounds/${groundId}`, data),
  addSlots: (groundId: string, slots: any[]) => api.post(`/grounds/${groundId}/slots`, slots),
  removeSlot: (groundId: string, slotId: string) => api.delete(`/grounds/${groundId}/slots/${slotId}`),
  bookSlot: (groundId: string, slotId: string, matchId?: string) => 
    api.post('/grounds/book', { ground_id: groundId, slot_id: slotId, match_id: matchId }),
  getMyBookings: () => api.get('/grounds/bookings/my'),
  cancelBooking: (bookingId: string, reason?: string) => 
    api.post('/grounds/bookings/cancel', { booking_id: bookingId, reason }),
  getMyGrounds: () => api.get('/grounds/my-grounds'),
  getAnalytics: (groundId: string) => api.get(`/grounds/${groundId}/analytics`),
};

// Dashboard APIs
export const dashboardAPI = {
  getPlayerDashboard: () => api.get('/dashboard/player'),
  getCaptainDashboard: (teamId: string) => api.get(`/dashboard/captain/${teamId}`),
  getGroundOwnerDashboard: () => api.get('/dashboard/ground-owner'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
};

// Wallet APIs (Extended)
export const walletExtendedAPI = {
  exportTransactions: (startDate?: string, endDate?: string) => {
    let url = '/wallet/export';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const queryString = params.toString();
    return api.get(queryString ? `${url}?${queryString}` : url);
  },
};

// Admin APIs
export const adminAPI = {
  getUsers: (skip?: number, limit?: number) => 
    api.get(`/admin/users?skip=${skip || 0}&limit=${limit || 50}`),
  updateUserRole: (userId: string, role: string) => 
    api.put(`/admin/users/${userId}/role?role=${role}`),
  getTransactions: (skip?: number, limit?: number) => 
    api.get(`/admin/transactions?skip=${skip || 0}&limit=${limit || 50}`),
};

// AI & Analytics APIs
export const aiAPI = {
  findOpponents: (teamId: string, format?: string, skillRange?: string) => 
    api.post('/ai/matchmaking', { team_id: teamId, format: format || 'T20', skill_range: skillRange || 'similar' }),
  predictMatch: (team1Id: string, team2Id: string, format?: string, groundId?: string) =>
    api.post('/ai/predict-match', { team1_id: team1Id, team2_id: team2Id, format: format || 'T20', ground_id: groundId }),
  getPlayerRecommendations: (teamId: string) =>
    api.get(`/ai/player-recommendations/${teamId}`),
};

// Player Stats APIs
export const statsAPI = {
  getPlayerStats: (userId: string) => api.get(`/players/${userId}/stats`),
  getMyStats: () => api.get('/my-stats'),
};

// Captain Financial APIs
export const captainAPI = {
  getFinancialSummary: (teamId: string) => api.get(`/captain/financial-summary/${teamId}`),
  getMatchFinancials: (matchId: string) => api.get(`/captain/match-financials/${matchId}`),
  withdrawFromTeamWallet: (teamId: string, amount: number) => 
    api.post(`/team/${teamId}/wallet/withdraw?amount=${amount}`),
};

// Audit & Ledger APIs
export const auditAPI = {
  getUserAuditLog: (userId: string) => api.get(`/audit/transactions/${userId}`),
  getWalletLedger: () => api.get('/wallet/ledger'),
};

// Enhanced Booking APIs
export const bookingAPI = {
  bookGroundForMatch: (matchId: string, groundId: string, slotId: string) =>
    api.post(`/matches/${matchId}/book-ground?ground_id=${groundId}&slot_id=${slotId}`),
  refundBooking: (bookingId: string) => api.post(`/bookings/${bookingId}/refund`),
};

// Seed API (for testing)
export const seedAPI = {
  seedData: () => api.post('/seed'),
};
