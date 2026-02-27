# Economy Design: Retention-Focused

## Core Philosophy
- **Money is Survival**: Not a score, but a lifeline.
- **Instability**: Income fluctuates, expenses only rise.
- **Anxiety Loop**: "I'm okay for now" -> "Unexpected Bill" -> "Panic/Grind".

## 1. Income Formulas (Unstable)

Jobs do not pay fixed salaries. They pay a base rate plus a highly volatile "performance" or "market" bonus.

```javascript
// Monthly Income Calculation
const baseSalary = job.baseSalary; // e.g. 1000
const marketFactor = Math.random(); // 0.0 to 1.0 (volatile!)
const performanceBonus = baseSalary * (marketFactor * 2.0 - 0.5); // Range: -0.5x to +1.5x

let totalIncome = baseSalary + performanceBonus;
if (totalIncome < 0) totalIncome = 0; // Bad month = $0 income? (Risk!)
```

*   **Risk**: A bad month means you earn **less than base**.
*   **Hope**: A good month feels like a windfall, encouraging spending (trap).

## 2. Expense Formulas (Growth > Income)

Expenses have three layers that compound.

### Layer 1: Inflation (Time-Based)
Every year, base costs rise. This forces the player to seek better jobs constantly.

```javascript
// Base Cost of Living (Food, Utilities)
const year = player.age - 18;
const inflationRate = 1.05; // 5% annual real inflation
const baseLivingCost = 800 * Math.pow(inflationRate, year);
```

### Layer 2: Asset Maintenance (The "Success" Trap)
Every asset owning implies a liability.

*   **Cars**: 5-20% of value / year.
*   **Houses**: 2-5% of value / year.
*   **Traps**: "Cheap" assets have higher relative maintenance (rusty cars need repairs).

```javascript
const assetMaintenance = vehicles.reduce((sum, v) => sum + v.monthlyCost, 0) + 
                         properties.reduce((sum, p) => sum + p.monthlyCost, 0);
```

### Layer 3: Risk Risks (Random Shocks)
Sudden negative cash flow events.

```javascript
const riskChance = 0.15; // 15% chance per month
if (Math.random() < riskChance) {
    const disasterSeverity = Math.random();
    const shockCost = totalIncome * (disasterSeverity * 4); // Up to 4x monthly income!
    // Examples: Medical emergency, Car crash, Lawsuit, Theft
}
```

## 3. Game Phases

### Early Game (0-3 mins / Ages 18-25)
*   **State**: "Paycheck to Paycheck"
*   **Income**: Low, volatile.
*   **Expense**: High relative rent.
*   **Goal**: Buy a cheap car (freedom) vs. Pay rent (survival).
*   **Anxiety**: "If I miss one shift, I'm homeless."

### Mid Game (3-6 mins / Ages 26-45)
*   **State**: "The Illusion of Stability" (The Trap)
*   **Income**: Medium-High.
*   **Trap**: Player buys a House and Nice Car. Maintenance costs explode.
*   **Risk**: One "Market Crash" month destroys savings because fixed costs (maintenance) remain high.
*   **Anxiety**: "I make $5k/month but I'm losing money?"

### Late Game (6+ mins / Ages 46+)
*   **State**: "Health is Expensive"
*   **Income**: Plateaus or drops (Ageism/Retirement).
*   **Expense**: Health drops naturally. Buying health (Medicine/Surgery) becomes the primary money sink.
*   **Formula**: `HealthCost = 100 * Math.pow(1.1, (Age - 50))`.
*   **Anxiety**: "I literally cannot afford to stay alive."

## 4. Summary of Ranges

| Variable | Early Game | Mid Game | Late Game |
| :--- | :--- | :--- | :--- |
| **Income Volatility** | +/- 20% | +/- 50% | -50% (Decline) |
| **Fixed Costs** | 60% of Income | 90% of Income | 120% of Income |
| **Random Shock** | $500 - $1k | $5k - $20k | $50k - $200k |
| **Primary Risk** | Eviction | Debt Spiral | Organ Failure |

## 5. Playstyles & Balance

To ensure diverse gameplay, three primary distinct playstyles have been balanced to yield similar lifetime net value (~$500k-$1M by age 60) with different risk properties.

| Playstyle | Peak Income/yr | Risk Level | Happiness | Stress | Key Trade-off / Mechanics |
|:---|---:|:---|:---|:---|:---|
| **Career** | $120k-$360k (C-level) | Medium | Low (work stress) | High (60-80) | Burns health, requires continuous education to progress |
| **Social** | $30k-$80k (referrals+content) | Low | High | Low (20-40) | Very slow ramp, strict income ceiling, high maintenance cost |
| **Investor** | $50k-$500k (compound returns) | Very High | Neutral | Medium (40-60) | Can lose completely to market crashes, requires starting capital |
