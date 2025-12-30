# 📱 Batlabz - Expo Go Setup Guide

## 🎯 Quick Access URLs

### Web Preview (Desktop/Mobile Browser)
```
https://cricket-payments-1.preview.emergentagent.com
```

### Expo Go Mobile App Connection
```
exp://cricket-payments-1.preview.emergentagent.com
```

---

## 📲 How to Test on Your Mobile Device (Expo Go)

### Step 1: Install Expo Go
- **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 2: Scan the QR Code
1. Open the Expo Go app on your phone
2. For the QR code, open this file in a browser:
   ```
   file:///app/frontend/qr-display.html
   ```
   Or use the QR code URL:
   ```
   exp://cricket-payments-1.preview.emergentagent.com
   ```

### Step 3: App Will Load
- The Batlabz app will download and run on your device
- You can test all features including:
  - ✅ Login/OTP authentication
  - ✅ Match creation and management
  - ✅ Team management
  - ✅ Wallet operations
  - ✅ Ground booking
  - ✅ Payment flows
  - ✅ Captain dashboard
  - ✅ AI features (matchmaking, predictions, stats)

---

## 🔧 Technical Details

### Current Configuration
- **Expo SDK**: 54.0.30
- **React Native**: 0.79.5
- **Expo Router**: 5.1.4 (File-based routing)
- **Backend**: FastAPI on port 8001
- **Database**: MongoDB

### Tunnel Configuration
The app uses Expo's tunnel service for external access:
- Tunnel subdomain: `cricket-payments`
- Full tunnel URL: `cricket-payments-1.preview.emergentagent.com`

### Environment Variables
Located in `/app/frontend/.env`:
```bash
EXPO_TUNNEL_SUBDOMAIN=cricket-payments
EXPO_PACKAGER_HOSTNAME=https://cricket-payments-1.preview.emergentagent.com
EXPO_PUBLIC_BACKEND_URL=https://cricket-payments-1.preview.emergentagent.com
```

---

## 🎨 Current App Features

### ✅ Implemented & Working
1. **Authentication System**
   - Phone-based OTP login
   - JWT token management
   - Secure session handling

2. **User Management**
   - Profile creation/editing
   - Role-based access (Player, Captain, Admin)

3. **Team Features**
   - Create and manage teams
   - Invite players
   - Team wallet management

4. **Match Management**
   - Create matches
   - Invite opposing teams
   - Fee calculation and splitting
   - Payment tracking

5. **Wallet System**
   - Top-up functionality (simulated)
   - Transaction history
   - Audit logging
   - Withdrawal for captains

6. **Ground Booking**
   - Browse available grounds
   - View time slots
   - Book and pay for grounds
   - Cancellation with refunds

7. **AI Features**
   - Smart matchmaking (opponent recommendations)
   - Match outcome predictions
   - Player scouting/recommendations
   - Performance stats tracking

8. **Captain Dashboard**
   - Financial overview
   - Team payment tracking
   - Match financial details
   - Fund withdrawal

### 🔄 Pending Features
1. **Payment System Enhancement** (Priority P0)
   - 1 AED platform fee implementation
   - 5 AED / 1.5% gateway fee
   - Detailed fee breakdowns

2. **UX Improvements** (Priority P1)
   - Keyboard behavior fix on login/OTP screens
   - Button should move up with keyboard

3. **Payment History Screen** (Priority P2)
   - Detailed transaction history
   - Fee itemization
   - Clear credit/debit tracking

4. **UI Consistency** (Priority P3)
   - Apply premium theme to all screens
   - Consistent design language

---

## 🧪 Testing Credentials

Use the demo data seeder first:
```bash
curl -X POST http://localhost:8001/api/seed-demo
```

Then login with these accounts (OTP is always `123456`):

### Admin Account
- Phone: `+971509999999`
- Role: Administrator
- Access: Full platform access

### Captain Account (Dubai Warriors)
- Phone: `+971501234567`
- Role: Team Captain
- Access: Team management, financial dashboard

### Player Account
- Phone: `+971501111111`
- Role: Player
- Access: Basic player features

### New User
- Phone: Any 8-digit number (e.g., `+971501234567`)
- Will create a new account

---

## 🐛 Known Issues

1. **Package Version Warnings** (Non-critical)
   - Some Expo packages have version mismatches
   - App still functions correctly
   - Can be upgraded if needed

2. **Keyboard Behavior**
   - Current implementation uses KeyboardAvoidingView
   - User reported it's not satisfactory
   - Needs enhancement with keyboard-aware scroll view

3. **OTP Input for Automation**
   - Automation tools struggle with OTP input
   - Needs stable testID props

---

## 🔄 Service Management

### Restart Services
```bash
# Restart backend
sudo supervisorctl restart backend

# Restart frontend
sudo supervisorctl restart expo

# Restart both
sudo supervisorctl restart backend expo
```

### Check Service Status
```bash
sudo supervisorctl status
```

### View Logs
```bash
# Frontend logs
tail -f /var/log/supervisor/expo.out.log
tail -f /var/log/supervisor/expo.err.log

# Backend logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

---

## 📝 Notes

- The app is currently running in **tunnel mode** which allows external access
- Metro bundler is in CI mode (reloads disabled by default)
- All backend API routes are prefixed with `/api`
- Wallet top-up is currently simulated (no real payment gateway)
- AI features use mock data for demonstrations

---

## 🚀 Next Steps

Ready to proceed with development! Current priorities:
1. ✅ App verified and running on Expo Go
2. 🔄 Implement payment fee structure (1 AED + gateway fee)
3. 🔄 Fix keyboard behavior on auth screens
4. 🔄 Create detailed payment history screen
5. 🔄 Apply premium UI theme consistently

**The app is now ready for testing on Expo Go mobile app!** 📱🏏
