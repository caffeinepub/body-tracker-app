# Specification

## Summary
**Goal:** Refresh the Progress Comparison compare-slot header UI to use an “Option X” top banner and a more compact inline date + variance + Change layout that fits the forced dark theme.

**Planned changes:**
- Update each compare slot header to start with a full-width top banner reading exactly “Option 1”, “Option 2”, or “Option 3”, using an outline-only style with distinct but harmonious outline colors per option, aligned to existing dark-theme tokens.
- Redesign the header’s second line to show the selected date with an inline, clock-icon-first variance indicator styled as a compact badge/pill; keep the variance value secondary (via tooltip or clearly secondary text styling).
- Move the “Change” button onto the same row as the date and variance indicator, ensuring stable, readable layout with sensible wrapping across common viewport sizes.

**User-visible outcome:** Each of the three comparison slots shows a clear “Option 1/2/3” banner at the top, with the date, a compact clock variance badge, and the Change button aligned inline on the next row without hurting dark-theme readability.
