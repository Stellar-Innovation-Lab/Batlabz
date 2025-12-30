# 🧪 Production-Ready Testing Plan - Batlabz

## ✅ **Testing Checklist - Must All Pass**

### **Phase 1: Core Authentication & Navigation** (PRIORITY 1)
- [ ] Test 1.1: Splash screen → Login navigation
- [ ] Test 1.2: Login → OTP navigation  
- [ ] Test 1.3: OTP → Home navigation
- [ ] Test 1.4: Auth token persistence
- [ ] Test 1.5: Protected routes with valid token
- [ ] Test 1.6: Logout functionality

### **Phase 2: New Features Navigation** (PRIORITY 1)
- [ ] Test 2.1: Home → Players navigation
- [ ] Test 2.2: Home → Enhanced Transactions navigation
- [ ] Test 2.3: Home → e& Money Top-up navigation
- [ ] Test 2.4: Home → AI Hub navigation
- [ ] Test 2.5: Back navigation from all new screens

### **Phase 3: e& Money Flow** (PRIORITY 2)
**Realistic Flow Requirements:**
- [ ] Test 3.1: Wallet → e& Money Top-up
- [ ] Test 3.2: Select account type (Savings/Current)
- [ ] Test 3.3: Enter amount with validation (min/max)
- [ ] Test 3.4: Show fee calculation (gateway fee)
- [ ] Test 3.5: PIN authorization (mock: 1234)
- [ ] Test 3.6: Processing screen with delay
- [ ] Test 3.7: Success screen with transaction details
- [ ] Test 3.8: Wallet balance updated correctly
- [ ] Test 3.9: Transaction recorded with fees
- [ ] Test 3.10: Reference number generated

### **Phase 4: Captain Payout Flow** (PRIORITY 2)
- [ ] Test 4.1: Captain logs in
- [ ] Test 4.2: Navigate to Captain Dashboard
- [ ] Test 4.3: View team pool balance
- [ ] Test 4.4: Initiate withdrawal to bank
- [ ] Test 4.5: Enter bank details (IBAN)
- [ ] Test 4.6: Calculate payout fees (5 AED or 1.5%)
- [ ] Test 4.7: Show fee breakdown
- [ ] Test 4.8: Confirm withdrawal
- [ ] Test 4.9: Wallet balance reduced
- [ ] Test 4.10: Transaction logged
- [ ] Test 4.11: Audit trail created

### **Phase 5: Ground Booking with Wallet** (PRIORITY 1)
- [ ] Test 5.1: Browse grounds
- [ ] Test 5.2: View ground details
- [ ] Test 5.3: View available slots
- [ ] Test 5.4: Select date/time slot
- [ ] Test 5.5: Verify wallet has sufficient balance
- [ ] Test 5.6: Book ground (deduct from wallet)
- [ ] Test 5.7: Booking confirmation
- [ ] Test 5.8: Transaction recorded
- [ ] Test 5.9: Booking appears in user's bookings
- [ ] Test 5.10: Cancel booking → Refund to wallet

### **Phase 6: Match-Ground Integration** (PRIORITY 2)
**Scenario A: Book Ground from Match Page**
- [ ] Test 6.1: Captain creates match
- [ ] Test 6.2: "Book Ground" button visible on match page
- [ ] Test 6.3: Click → Shows available grounds for match date/time
- [ ] Test 6.4: Select ground
- [ ] Test 6.5: Ground fee auto-calculated into match cost
- [ ] Test 6.6: Match cost breakdown includes ground fee
- [ ] Test 6.7: Booking linked to match
- [ ] Test 6.8: Match shows ground location

**Scenario B: Validation - Match Time = Ground Time**
- [ ] Test 6.9: If match time is 6PM-8PM
- [ ] Test 6.10: Only show grounds available at that exact time
- [ ] Test 6.11: Reject booking if time mismatch
- [ ] Test 6.12: Show error message if timing conflict

**Scenario C: Auto-linking Ground Fees**
- [ ] Test 6.13: Ground booking fee = AED 500
- [ ] Test 6.14: Match cost breakdown shows: Ground Fee: AED 500
- [ ] Test 6.15: Per player cost includes ground fee portion
- [ ] Test 6.16: When captain books ground, match cost updates
- [ ] Test 6.17: When ground booking cancelled, match cost updates

### **Phase 7: Complete Player Payment Flow** (PRIORITY 1)
- [ ] Test 7.1: Player joins match
- [ ] Test 7.2: Match fee calculated (includes ground + platform + gateway fees)
- [ ] Test 7.3: Player pays from wallet
- [ ] Test 7.4: Platform fee (1 AED) deducted
- [ ] Test 7.5: Gateway fee (5 AED or 1.5%) deducted
- [ ] Test 7.6: Net amount goes to team pool
- [ ] Test 7.7: Payment status updated to PAID
- [ ] Test 7.8: Captain sees payment received notification
- [ ] Test 7.9: Transaction shows fee breakdown

### **Phase 8: Captain Financial Management** (PRIORITY 2)
- [ ] Test 8.1: Captain collects all player payments
- [ ] Test 8.2: Team pool balance shows correct amount
- [ ] Test 8.3: Captain pays for ground booking from team pool
- [ ] Test 8.4: Remaining balance available for withdrawal
- [ ] Test 8.5: Captain withdraws excess to bank account
- [ ] Test 8.6: Payout fee calculated and shown
- [ ] Test 8.7: Withdrawal processed
- [ ] Test 8.8: All transactions logged with audit trail

### **Phase 9: Data Validation & Business Logic** (PRIORITY 1)
- [ ] Test 9.1: Cannot book ground without sufficient balance
- [ ] Test 9.2: Cannot pay for match without sufficient balance
- [ ] Test 9.3: Cannot withdraw more than available
- [ ] Test 9.4: Ground slot shows as booked after booking
- [ ] Test 9.5: Double booking prevention
- [ ] Test 9.6: Match date must be future date
- [ ] Test 9.7: Player limit validation
- [ ] Test 9.8: Fee calculations always correct
- [ ] Test 9.9: Balance never goes negative
- [ ] Test 9.10: All monetary amounts have 2 decimal places

### **Phase 10: UI/UX Polish** (PRIORITY 3)
- [ ] Test 10.1: All loading states shown
- [ ] Test 10.2: All empty states shown
- [ ] Test 10.3: All error states shown
- [ ] Test 10.4: Success messages clear
- [ ] Test 10.5: Error messages helpful
- [ ] Test 10.6: Navigation always has back button
- [ ] Test 10.7: Buttons have proper disabled states
- [ ] Test 10.8: Forms have validation messages

---

## 📝 **Testing Methodology**

**For Each Test:**
1. Document expected behavior
2. Perform test manually or automated
3. Record actual behavior
4. If failed → Document bug
5. Fix bug
6. Retest
7. Mark as passed only when verified

**No Test Passes Without:**
- Screenshot evidence
- Console log verification
- Network log confirmation
- Database state check (where applicable)

---

## 🎯 **Current Status**

**Tests Passed:** 0/100+
**Tests In Progress:** Phase 1 testing starting
**Bugs Found:** TBD
**Fixes Applied:** TBD

---

**This document will be updated as testing progresses. Only when ALL critical tests pass can we claim production-ready.**
