# BUG TRIAGE - RELEASE FIX SPRINT

## CRITICAL BUGS (Must Fix for Release)

### 1. Race Condition - Multiple Year Advancement
**Classification**: CRITICAL
**Reason**: Input abuse causes state corruption, breaks progress
**Impact**: Players can exploit, game state becomes unreliable

### 2. State Desync - Age Counter vs Player Age  
**Classification**: CRITICAL
**Reason**: State desync breaks game logic, age-gated content fails
**Impact**: Core game mechanics break

### 3. Ad Reward Duplication - No Cooldown Protection
**Classification**: CRITICAL
**Reason**: Ads/IAP rewards duplicate, breaks monetization trust
**Impact**: Exploitable for infinite money, breaks economy

### 4. Death Logic Flaw - Game Continues After Death
**Classification**: CRITICAL
**Reason**: Progress breaks, state corruption after death
**Impact**: Dead player can still act, breaks game reality

### 5. Bankruptcy Inconsistency - Negative Money Allowed
**Classification**: CRITICAL
**Reason**: State desync, UI lies about game state
**Impact**: Economic system breaks, player trust lost

---

## HIGH BUGS (Select Max 2)

### 6. UI Lockout - Age Gates Without Feedback
**Classification**: HIGH
**Reason**: Very annoying UX, confusing but recoverable
**Impact**: Player thinks game is broken, but can continue

### 7. Save State Corruption - Processing Flag Persistence
**Classification**: HIGH
**Reason**: Save/load breaks, progress can be lost
**Impact**: Requires restart, very annoying

---

## MEDIUM BUGS (Deferred to v1.1)

### 8. Event Queue Duplication - Scripted Events
**Classification**: MEDIUM
**Reason**: Annoying but survivable
**Impact**: Narrative flow issues

### 9. Skill Bonus Race - Multiple Applications
**Classification**: MEDIUM
**Reason**: Survivable exploit
**Impact**: Minor stat inflation

---

## LOW BUGS (Deferred to v1.1)

### 10. Text Inconsistency - Button Labels
**Classification**: LOW
**Reason**: Cosmetic issue
**Impact**: Minor confusion

### 11. Memory Leak - Event History Growth
**Classification**: LOW
**Reason**: Performance issue over long play
**Impact**: Minor, long-term only

---

## TRIAGE SUMMARY

**CRITICAL (Must Fix)**: 5 bugs
**HIGH (Select 2 max)**: 2 bugs  
**MEDIUM (Deferred)**: 2 bugs
**LOW (Deferred)**: 2 bugs

**SELECTED FOR FIX**:
- ALL 5 critical bugs
- HIGH: UI Lockout (age gates)
- HIGH: Save State Corruption

**DEFERRED**:
- Event Queue Duplication
- Skill Bonus Race  
- Text Inconsistency
- Memory Leak

**TOTAL FIXES NEEDED**: 7 bugs
