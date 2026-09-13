# Balance Hub → Soft Computing Project Conversion Plan

## 1. Existing Project — What Can Be Reused

| Component | Reusability | Notes |
|-----------|-------------|-------|
| **Activity tracking** (work, personal, exercise, hobbies) | ✅ High | Core input variables for Fuzzy Logic (work hours, exercise, personal time) |
| **Work time tracker** (punch in/out, weekly goals) | ✅ High | Provides actual work hours, overtime patterns |
| **Habit planner / Calendar** (FullCalendar) | ✅ High | Schedule representation, constraints, time blocks |
| **Goals** (categories, progress, deadlines) | ✅ Medium | Goal-aware scheduling; priority weights for GA |
| **Journal** (mood, categories, content) | ✅ High | Stress/mood labels → Fuzzy input "stress level" |
| **Stress Hub** (breathing patterns) | ✅ Low | UI only; no quantitative stress metric yet |
| **Static templates** (Morning Routine, Focus Day, Balanced Day) | ✅ High | Baseline schedules for comparison; seed GA population |
| **Dummy data & mock API** | ⚠️ Replace | Current data is synthetic random; need structured dataset |
| **UI framework** (React, Tailwind, Recharts) | ✅ High | Add "Smart Schedule Optimizer" page without rebuild |

---

## 2. Problem — Final Problem Statement

> **Generate an optimized personalized daily schedule that maximizes work-life balance and productivity while minimizing stress and schedule conflicts, given the user's tracked activities, work patterns, goals, and self-reported mood/stress.**

---

## 3. Technique — Why Fuzzy Logic + Genetic Algorithm (Critical Assessment)

| Aspect | Fuzzy Logic | Genetic Algorithm |
|--------|-------------|-------------------|
| **Role** | Evaluate "Work-Life Balance Score" from vague inputs | Optimize schedule (combinatorial search) |
| **Fit** | ✅ Excellent — stress, workload, productivity are linguistic | ✅ Excellent — scheduling = permutation/combinatorial |
| **Interpretability** | ✅ Rules transparent to domain experts | ⚠️ Black-box; mitigate with convergence plots |
| **Experimentation scope** | ✅ Membership functions, rule base, aggregation | ✅ Population size, crossover/mutation rates, elitism |
| **Baseline comparison** | Rule-based scheduler (weighted sum) | Manual / template-based / greedy heuristic |

**Verdict:** **Fuzzy Logic + GA is appropriate and strong** for this problem. It satisfies "at least one Soft Computing technique" with two complementary ones. No better single technique covers both evaluation (FL) and optimization (GA) as cleanly. Alternatives like NSGA-II add complexity without clear benefit for a single-objective fitness (weighted sum).

---

## 4. Inputs

| Category | Variables | Source |
|----------|-----------|--------|
| **Work** | Work hours (today/week), overtime, shift start/end, workload (1–5) | WorkTimeTracker, Activity Tracker |
| **Sleep** | Sleep hours, sleep quality (1–5) | Journal (mood=tired), new input field |
| **Exercise** | Exercise hours, intensity (1–5) | Activity Tracker (type=exercise) |
| **Personal** | Personal/hobby hours, social time | Activity Tracker (type=personal/hobbies) |
| **Stress/Mood** | Stress level (1–5), mood (productive/happy/stressed/tired) | Journal mood, Stress Hub (new self-assessment) |
| **Productivity** | Self-rated productivity (1–5), goal progress % | Journal, Goals page |
| **Goals** | Active goals count, deadlines urgency, category weights | Goals page |
| **Constraints** | Fixed meetings, preferred hours, max work hours, min sleep | Habit Planner calendar, user preferences |

---

## 5. Outputs

| Output | Description |
|--------|-------------|
| **Fuzzy Output** | Work-Life Balance Score (0–100) + Stress Score (0–100) |
| **GA Output** | Optimized daily schedule: ordered time-blocks with activity type, start/end, duration |
| **Diagnostics** | Constraint violations list, fitness convergence curve, Pareto trade-offs (if multi-objective) |

---

## 6. Dataset

| Data Type | Status | Recommendation |
|-----------|--------|----------------|
| **Activity logs** | Dummy (random) | **Collect real user data** for 2–4 weeks (IRB exempt likely); supplement with synthetic for edge cases |
| **Work time logs** | localStorage (real if used) | Use actual logs if available; else synthetic with realistic distributions |
| **Journal moods** | 5 static entries | **Collect real entries**; map mood→stress numeric (stressed=5, tired=4, neutral=3, happy=2, productive=1) |
| **Goals** | 3 static | Use real user goals; add priority weights |
| **Schedules** | Template-based dummy | Use applied templates as "manual baseline" schedules |
| **Public dataset** | None used | *Optional*: Use [Time Use Survey (ATUS)](https://www.bls.gov/tus/) or [Student Life dataset](https://www.kaggle.com/datasets/arslanali4343/student-lifestyle-dataset) for pretraining/validation |

**Decision:** **Primary = collected user data (2–4 weeks)** + synthetic augmentation for GA training. Public dataset only for validation if needed.

---

## 7. Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART SCHEDULE OPTIMIZER                      │
├─────────────────────────────────────────────────────────────────┤
│  1. DATA INGESTION                                              │
│     ├─ Fetch last 7–30 days: activities, work logs, journal,   │
│     │   goals, calendar events                                  │
│     └─ Compute aggregates: avg work hrs, sleep, exercise,      │
│         stress freq, goal urgency, productivity trend          │
├─────────────────────────────────────────────────────────────────┤
│  2. FUZZY INFERENCE SYSTEM (Evaluation Engine)                 │
│     ├─ Fuzzify inputs → membership functions (tri/trap)        │
│     ├─ Apply rule base (e.g., "IF work_high AND sleep_low      │
│     │   THEN stress_high, balance_low")                        │
│     ├─ Aggregate & defuzzify (centroid) → Balance Score,       │
│     │   Stress Score                                            │
│     └─ Output: Fitness baseline for current schedule           │
├─────────────────────────────────────────────────────────────────┤
│  3. GENETIC ALGORITHM (Optimization Engine)                    │
│     ├─ Chromosome: 24×1 array (30-min slots) = activity type   │
│     ├─ Initial population:                                     │
│     │   ├─ 40%: Template-based (Morning/Focus/Balanced)        │
│     │   ├─ 30%: Current user schedule (if exists)              │
│     │   └─ 30%: Random feasible                                │
│     ├─ Fitness = w1·Balance + w2·Productivity − w3·Stress      │
│     │   − w4·ConstraintViolations                              │
│     ├─ Selection: Tournament (k=3)                             │
│     ├─ Crossover: Two-point (preserves time-block contiguity)  │
│     ├─ Mutation: Swap/insert/delete blocks (prob=0.1)          │
│     ├─ Elitism: Top 5% carried over                            │
│     └─ Termination: 200 gens OR no improvement 20 gens         │
├─────────────────────────────────────────────────────────────────┤
│  4. OUTPUT & EXPLANATION                                        │
│     ├─ Best chromosome → readable schedule                     │
│     ├─ Fuzzy explanation: "High work + low sleep → stress"     │
│     ├─ Comparison: GA vs. Manual vs. Template vs. Greedy       │
│     └─ Export to Habit Planner calendar                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Fitness / Objective Function

```
Fitness = w₁·BalanceScore + w₂·ProductivityScore − w₃·StressScore − w₄·ConstraintPenalty

Where:
- BalanceScore      ∈ [0, 100]  (from Fuzzy output)
- ProductivityScore ∈ [0, 100]  (goal progress rate × work focus blocks)
- StressScore       ∈ [0, 100]  (from Fuzzy output)
- ConstraintPenalty = Σ(violation_weight × violation_degree)

Violations (hard → high weight):
  • Overlap               : w=50
  • Exceeds max work hrs  : w=30
  • < Min sleep (7h)      : w=40
  • No exercise           : w=20
  • Missed fixed meeting  : w=100
  • Goal deadline missed  : w=25

Default weights: w₁=0.35, w₂=0.25, w₃=0.25, w₄=0.15 (tunable)
```

---

## 9. Baseline Comparison

| Baseline | Description | Generation Method |
|----------|-------------|-------------------|
| **Manual** | User's actual logged schedule | From WorkTimeTracker + Activity Tracker |
| **Template** | Best-matching static template | HabitPlanner templates (Morning/Focus/Balanced) |
| **Greedy Heuristic** | Fill highest-priority blocks first | Priority: fixed meetings → work → sleep → exercise → personal |
| **Rule-Based Scheduler** | Weighted scoring per slot (no GA) | Same fitness components, greedy assignment |

---

## 10. Experiments

| Experiment | Independent Variable | Dependent Variables |
|------------|---------------------|---------------------|
| **Exp 1: GA Parameters** | Population size (50, 100, 200), Crossover rate (0.6, 0.8, 0.9), Mutation rate (0.05, 0.1, 0.2) | Fitness, Convergence gen, Execution time |
| **Exp 2: Fuzzy Design** | Membership shape (tri vs trap), Rule count (9, 16, 25), Aggregation (max vs sum) | Balance/Stress score correlation with self-report |
| **Exp 3: Weight Sensitivity** | w₁–w₄ grid search | Pareto front: Balance vs Productivity vs Stress |
| **Exp 4: Baseline Comparison** | Algorithm (GA vs Greedy vs Template vs Manual) | All metrics (see §11) over 30 random user profiles |
| **Exp 5: Ablation** | Remove FL (use crisp), Remove GA (use greedy) | Fitness drop % |

---

## 11. Metrics

| Metric | Target / Interpretation |
|--------|-------------------------|
| **Balance Score** | Higher = better (0–100) |
| **Productivity Score** | Higher = better (0–100) |
| **Stress Score** | Lower = better (0–100) |
| **Constraint Violations** | Count & severity (target: 0 hard violations) |
| **Fitness Score** | Composite; higher = better |
| **Execution Time** | < 5 seconds for 200 generations |
| **Convergence Generation** | When fitness plateaus (Δ < 0.1% for 20 gens) |
| **User Acceptance** | Post-study survey (1–5 Likert) on schedule quality |

---

## 12. Required Project Changes / Files

### New Files (Core Logic)
```
src/
├── soft-computing/
│   ├── fuzzy/
│   │   ├── membership.ts          # MF definitions (tri/trap)
│   │   ├── rules.ts               # IF-THEN rule base
│   │   ├── inference.ts           # Mamdani inference + centroid
│   │   └── index.ts               # Exports: evaluateBalance(inputs)
│   ├── genetic/
│   │   ├── chromosome.ts          # Schedule encoding/decoding
│   │   ├── fitness.ts             # Fitness function (uses fuzzy)
│   │   ├── operators.ts           # Selection, crossover, mutation
│   │   ├── ga.ts                  # Main GA loop
│   │   └── index.ts               # Exports: optimizeSchedule(inputs)
│   ├── data/
│   │   ├── aggregator.ts          # Fetch & aggregate user data
│   │   ├── synthetic.ts           # Synthetic data generator
│   │   └── dataset.ts             # Dataset loader (CSV/JSON)
│   └── types.ts                   # Shared interfaces
├── pages/
│   └── SmartScheduler.tsx         # New page: optimizer UI
├── components/
│   ├── ScheduleView.tsx           # Visualize optimized schedule
│   ├── FitnessChart.tsx           # Convergence plot (Recharts)
│   ├── FuzzyExplanation.tsx       # Rule firing transparency
│   └── ComparisonTable.tsx        # Baseline metrics table
└── hooks/
    └── useSmartScheduler.ts       # React hook for optimizer
```

### Modified Files
| File | Change |
|------|--------|
| `src/App.tsx` | Add `/smart-scheduler` route |
| `src/components/Layout.tsx` | Add "Smart Scheduler" nav link |
| `src/lib/dummyData.ts` | Add `getUserProfile()` aggregator; replace random with structured synthetic |
| `src/pages/HabitPlanner.tsx` | Add "Optimize with AI" button → calls GA |
| `package.json` | Add `mathjs` (fuzzy math), `uuid` (already via crypto) |

---

## 13. How This Satisfies All 6 University Requirements

| # | Requirement | Satisfaction |
|---|-------------|--------------|
| 1 | **Real-world problem** | Personalized daily scheduling for work-life balance — genuine pain point for professionals/students |
| 2 | **Clear inputs/outputs** | §4/§5: 12+ quantified inputs → schedule + scores + diagnostics |
| 3 | **Dataset/experimental data** | §6: Collected user data (2–4 weeks) + synthetic + public dataset option |
| 4 | **Soft Computing core** | **Fuzzy Logic** (evaluation) + **Genetic Algorithm** (optimization) — two classic SC techniques |
| 5 | **Objective/performance measure** | §8: Fitness function; §11: 8 quantitative metrics |
| 6 | **Scope for experimentation** | §10: 5 designed experiments with controlled variables |

---

## 14. Recommended Implementation Order

| Phase | Tasks | Est. Effort |
|-------|-------|-------------|
| **0. Setup** | Create `src/soft-computing/` structure; add types; install `mathjs` | 0.5 day |
| **1. Data Aggregation** | `aggregator.ts`: compute all input features from existing stores | 1 day |
| **2. Fuzzy Logic Core** | Membership functions → rules → inference → unit test with known cases | 2 days |
| **3. GA Core** | Chromosome encoding → fitness (calls fuzzy) → operators → GA loop | 2 days |
| **4. Integration & UI** | `SmartScheduler.tsx` page; `useSmartScheduler` hook; visualization components | 2 days |
| **5. Baselines** | Implement Greedy, Template, Manual schedulers; `ComparisonTable` | 1 day |
| **6. Experiments** | Scripts for Exp 1–5; generate synthetic user profiles (30) | 1.5 days |
| **7. Validation** | Collect 2-week real data; run full pipeline; user study (5–10 users) | 3–5 days |
| **8. Documentation** | Report with methodology, results, discussion, threats to validity | 1 day |

**Total: ~12–14 days** (feasible for semester project)

---

**Critical Note:** The current dummy data is **insufficient** for meaningful experiments. Prioritize **Phase 1 (Data Aggregation)** and **real data collection** immediately — without realistic input distributions, GA/Fuzzy tuning results won't generalize.