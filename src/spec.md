# Specification

## Summary
**Goal:** Update the default date targets in the Compare Progress modal so Slot 2 defaults to 30 days back (instead of 90 days back).

**Planned changes:**
- Change Compare Progress modal initialization defaults to Slot 1 = 60 days back, Slot 2 = 30 days back, Slot 3 = Today.
- Ensure the comparison query runs with target dates matching those defaults (using local start-of-day) unless the user changes a slot via the calendar.

**User-visible outcome:** Opening “Compare Progress” now pre-fills the three slots as 60 days back, 30 days back, and today, and the comparison runs against those dates by default.
