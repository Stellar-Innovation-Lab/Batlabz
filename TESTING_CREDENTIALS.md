# 🧪 BATLABZ - Complete Testing Credentials & Data

## 🔐 **TEST USER ACCOUNTS**

### **Universal OTP for ALL Numbers**
```
OTP: 123456
```
*Works for any phone number in the system*

---

## 👥 **DEMO USER ACCOUNTS** (After Seeding)

### **To Seed Demo Data:**
1. Login with any account
2. Call: `POST https://cricket-payments-1.preview.emergentagent.com/api/demo/seed`
   (Requires auth token in header)

OR use this quick command:
```bash
# From your device after login, call the seed endpoint through the app or via curl
curl -X POST "https://cricket-payments-1.preview.emergentagent.com/api/demo/seed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### **CAPTAIN ACCOUNT** 👨‍✈️
```
Phone: +971501234567
OTP: 123456
Name: Ahmed Al Maktoum
Role: Captain
Team: Dubai Warriors
Wallet Balance: AED 5,000
Total Spent: AED 3,200
```

**Use this to test:**
- Captain dashboard
- Match creation
- Player invitations
- Ground booking for matches
- Payment collection tracking
- Team pool management
- Payout to bank

---

### **PLAYER ACCOUNTS** 🏏

#### **Player 1: Rashid Khan**
```
Phone: +971501111000
OTP: 123456
Role: Bowler
Wallet: AED 2,500
Team: Dubai Warriors
```

#### **Player 2: Virat Sharma**
```
Phone: +971501111001
OTP: 123456
Role: Batsman
Wallet: AED 3,200
Team: Dubai Warriors
```

#### **Player 3: Jos Butler**
```
Phone: +971501111002
OTP: 123456
Role: Wicket Keeper
Wallet: AED 2,800
Team: Dubai Warriors
```

#### **Player 4: Jasprit Singh**
```
Phone: +971501111003
OTP: 123456
Role: Bowler
Wallet: AED 2,100
Team: Dubai Warriors
```

#### **Player 5: Mohammed Ali**
```
Phone: +971501111004
OTP: 123456
Role: All Rounder
Wallet: AED 3,500
Team: Dubai Warriors
```

#### **Player 6: David Warner**
```
Phone: +971501111005
OTP: 123456
Role: Batsman
Wallet: AED 4,200
Team: Sharjah Strikers (Captain)
```

#### **Player 7: Chris Gayle**
```
Phone: +971501111006
OTP: 123456
Role: All Rounder
Wallet: AED 3,800
Team: Sharjah Strikers
```

#### **Player 8: Lasith Kumar**
```
Phone: +971501111007
OTP: 123456
Role: Bowler
Wallet: AED 1,900
Team: Sharjah Strikers
```

#### **Player 9: Kane Smith**
```
Phone: +971501111008
OTP: 123456
Role: Batsman
Wallet: AED 2,600
Team: Sharjah Strikers
```

#### **Player 10: Ben Stokes**
```
Phone: +971501111009
OTP: 123456
Role: All Rounder
Wallet: AED 3,100
Team: Sharjah Strikers
```

#### **Player 11: Quinton Hassan**
```
Phone: +971501111010
OTP: 123456
Role: Wicket Keeper
Wallet: AED 2,400
```

#### **Player 12: Shakib Rahman**
```
Phone: +971501111011
OTP: 123456
Role: All Rounder
Wallet: AED 2,900
```

---

## 🏏 **DEMO TEAMS**

### **Team 1: Dubai Warriors**
```
Team ID: demo-team-1
Captain: Ahmed Al Maktoum (+971501234567)
Players: 6 members
Pool Balance: AED 800
Record: 7 wins, 5 losses (12 matches)
```

### **Team 2: Sharjah Strikers**
```
Team ID: demo-team-2
Captain: David Warner (+971501111005)
Players: 5 members
Pool Balance: AED 450
Record: 4 wins, 4 losses (8 matches)
```

---

## 🏆 **DEMO MATCHES**

### **Match 1: Friday Night Derby (COMPLETED)**
```
Match ID: demo-match-past
Team: Dubai Warriors
Opponent: Abu Dhabi Champions
Date: 7 days ago
Format: T20
Status: COMPLETED
Result: WON
Location: Al Wasl Cricket Ground
Total Cost: AED 880
Per Player: AED 80
Ground Fee: AED 500
Confirmed Players: 4
```

### **Match 2: Weekend Warriors Match (LIVE - PAYMENTS PENDING)**
```
Match ID: demo-match-live
Team: Dubai Warriors
Opponent: Ajman Eagles
Date: TODAY
Format: T20
Status: PAYMENTS_PENDING
Location: ICC Academy
Total Cost: AED 750
Per Player: AED 75
Ground Fee: AED 450

Payment Status:
✅ Captain (Ahmed): PAID - AED 75
✅ Player 1 (Rashid): PAID - AED 75
⚠️ Player 2 (Virat): PARTIAL - AED 40/75
❌ Player 4 (Jasprit): PENDING - AED 0/75
```

**Use this to test:**
- Captain viewing payment status
- Viewing participants screen
- Collecting pending payments
- Payment reminders

### **Match 3: Friday Night Clash (UPCOMING)**
```
Match ID: demo-match-upcoming
Team: Dubai Warriors
Opponent: Ras Al Khaimah Royals
Date: 5 days from now
Format: T20
Status: CONFIRMED
Location: Dubai Sports City
Total Cost: AED 920
Per Player: AED 92
Ground Fee: AED 550
Confirmed Players: 4
```

---

## 💰 **TEST PAYMENT SCENARIOS**

### **Scenario 1: Player Pays for Match**
```
Login as: +971501111003 (Jasprit Singh)
Match: demo-match-live
Amount Due: AED 75
Fees Applied:
  - Platform Fee: AED 1
  - Gateway Fee: AED 5
  - Total Charge: AED 81
Expected Result: Wallet deducted AED 81, match payment AED 75
```

### **Scenario 2: e& Money Top-Up**
```
Login as: Any user
Amount: AED 100
PIN: 1234 (IMPORTANT - must be exactly this)
Fees Applied:
  - Gateway Fee: AED 5
  - Total Charge: AED 105
Expected Result: Wallet credited AED 100
```

### **Scenario 3: Captain Payout**
```
Login as: +971501234567 (Captain)
Navigate to: Wallet → Payout
Amount: AED 500
Bank Details:
  - Bank Name: Emirates NBD
  - Account Name: Ahmed Al Maktoum
  - IBAN: AE070331234567890123456
Fees Applied:
  - Payout Fee: AED 7.5 (1.5% of 500)
  - Total Deducted: AED 507.5
Expected Result: Wallet debited AED 507.5
```

---

## 🏟️ **TEST GROUND BOOKING**

### **Available Demo Grounds** (After seed)
```
Ground 1: Al Wasl Cricket Ground
Ground 2: ICC Academy  
Ground 3: Dubai Sports City
Ground 4: Sharjah Cricket Stadium
Ground 5: Abu Dhabi Cricket Club
```

**To Book:**
1. Login as Captain
2. Go to Match Detail
3. Click "Book Ground for This Match"
4. Select ground and time slot
5. Validate: Time must match match time
6. Confirm booking
7. Verify: Ground fee added to match cost

---

## 🧪 **VALIDATION TESTING**

### **Test 1: Time Mismatch Validation**
```
1. Create match for 6:00 PM
2. Try to book ground slot for 8:00 PM
Expected: ERROR - "Time conflict: Match at 6:00 PM but ground slot is 8:00 PM - 10:00 PM"
```

### **Test 2: Double Booking Prevention**
```
1. Book a ground slot
2. Try to book same slot again (different user or same)
Expected: ERROR - "Slot already booked (Booking #XXXXX)"
```

### **Test 3: Insufficient Balance**
```
1. User with AED 50 balance
2. Try to pay AED 75 match fee (+ AED 6 fees = AED 81 total)
Expected: ERROR - "Insufficient balance. Required: AED 81.00 (Payment: 75.00 + Fees: 6.00)"
```

---

## 🔍 **FLOW TESTING CHECKLIST**

### **✅ Authentication Flow**
- [ ] Open app → See splash screen (3 seconds)
- [ ] Auto-navigate to login
- [ ] Enter phone: +971501234567
- [ ] Click "Get Started"
- [ ] See OTP screen
- [ ] Enter OTP: 123456
- [ ] See home dashboard

### **✅ Captain Workflow**
- [ ] Login as captain (+971501234567)
- [ ] View dashboard
- [ ] See team: Dubai Warriors
- [ ] View match: "Weekend Warriors Match"
- [ ] Click "View Participants"
- [ ] See payment status (2 paid, 1 partial, 1 pending)
- [ ] Click "Book Ground" (if not booked)
- [ ] Select ground matching match time
- [ ] Confirm booking
- [ ] Verify ground fee added to match

### **✅ Player Workflow**
- [ ] Login as player (+971501111003)
- [ ] View matches
- [ ] See pending payment
- [ ] Click "Pay Now"
- [ ] Confirm amount (AED 75 + fees)
- [ ] Payment processed
- [ ] See success message

### **✅ Wallet Workflow**
- [ ] Go to Wallet tab
- [ ] See current balance
- [ ] Click "Top Up"
- [ ] Select "e& Money Top-up"
- [ ] Enter amount: 100
- [ ] Select account type
- [ ] Enter PIN: 1234
- [ ] Authorize
- [ ] See success with reference number
- [ ] Check transaction history
- [ ] See fee breakdown

### **✅ New Features**
- [ ] Navigate to Players (from home new features card)
- [ ] Search for "Ahmed"
- [ ] Filter by role
- [ ] View player details
- [ ] Check transactions tab

---

## 📞 **QUICK REFERENCE**

**App URLs:**
- Web: https://cricket-payments-1.preview.emergentagent.com
- Expo Go: `exp://cricket-payments-1.preview.emergentagent.com`

**Universal Credentials:**
- Any Phone: +971501XXXXXX
- OTP: Always 123456
- e& Money PIN: Always 1234

**Demo Accounts:**
- Captain: +971501234567
- Player: +971501111003
- New User: +97150 + any 7 digits

**Backend:**
- Health Check: http://localhost:8001/api/health
- API Docs: http://localhost:8001/docs
- Seed Demo: POST /api/demo/seed (requires auth)

---

**Ready for comprehensive testing!** 🚀
