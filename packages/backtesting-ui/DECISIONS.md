# Architecture Decisions

This document records key architectural decisions made during the development of the backtesting UI.

## Question 11: Strategy Comparison (2026-01-02)

**Decision:** Option A - No Comparison (Single Strategy Focus)

**Context:**
Should users be able to run multiple strategies simultaneously on the same data for comparison?

**Options Considered:**
- A. No comparison - one at a time ✅ **SELECTED**
- B. Sequential comparison - run multiple, wait for all
- C. Parallel comparison - run multiple simultaneously
- D. Batch with saved results - save results for later comparison
- E. Hybrid sequential + caching - sequential with foundation for parallel

**Rationale:**
- **Simplicity:** Single-strategy focus keeps UI clean and mental model clear
- **MVP Speed:** No comparison infrastructure needed (tables, overlays, result storage)
- **Performance:** No parallel execution complexity or resource contention
- **Future-Proof:** Can add comparison later without breaking single-strategy workflow

**Implementation:**
- Single backtest execution at a time
- No comparison UI components
- No result storage beyond data caching (Question 6)
- Clear workflow: Select strategy → Configure → Run → Analyze

**Future Considerations:**
If comparison is needed later:
1. Add result storage layer (extend data cache)
2. Add comparison table component
3. Add chart overlay support
4. Add "Compare with..." button to results
5. Consider Option E (Hybrid) as next evolution

**Trade-offs Accepted:**
- ❌ Cannot compare strategies side-by-side without manual note-taking
- ❌ Must re-run strategies to compare (but data cache helps)
- ✅ Simpler codebase and faster development
- ✅ Lower cognitive load for users
- ✅ Easier to debug and maintain

---

## Question 10: Custom Strategies (2026-01-02)

**Decision:** Option B - Code-Based Extension (with Web Worker sandboxing)

See: `/packages/backtesting-ui/src/lib/custom-strategies/`

**Rationale:**
- Maximum flexibility for power users
- Web Worker provides isolation
- Templates lower barrier to entry
- Comprehensive security documentation addresses risks

**Security:**
- Arbitrary code execution in Web Worker
- 30-second timeout protection
- Pattern validation for dangerous APIs
- See SECURITY.md for complete threat model

---

## Question 9: Parameter Presets (2026-01-02)

**Decision:** Option B - Single "Recommended" Preset

See: `/packages/backtesting-ui/src/lib/strategies/types.ts` (PresetInfo interface)

**Rationale:**
- Strategy defaults ARE the recommended preset
- Rich metadata explains rationale and suitability
- Avoids preset proliferation and maintenance
- Clear "Reset to Recommended" action

---

## Question 7: Strategy Descriptions Source (2026-01-02)

**Decision:** Option C - Separate Markdown Files

See: `/packages/backtesting-ui/src/lib/strategies/docs/`

**Rationale:**
- Complete documentation with examples
- YAML frontmatter + structured sections
- Dynamic import with `?raw` suffix
- In-memory caching for performance

---

## Question 6: Data Caching (2026-01-02)

**Decision:** Option C + D - Hybrid Memory + localStorage

See: `/packages/backtesting-ui/src/lib/cache/`

**Rationale:**
- LRU memory cache for fast repeat access
- TTL-based localStorage for persistence
- Promotion pattern: storage hits → memory
- Different TTLs per interval (daily: 24h, weekly: 7d, monthly: 30d)

---

## Question 5: Parameter Validation Timing (2026-01-02)

**Decision:** Option C - Hybrid Validation

See: `/packages/backtesting-ui/src/lib/validation/`

**Rationale:**
- Realtime warnings (300ms debounced) during editing
- Hard errors on submit prevent invalid backtests
- Different severity levels per validation mode
- Doesn't block experimentation, prevents submission of invalid params
