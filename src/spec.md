# Specification

## Summary
**Goal:** Remove the visual gap above the “Option 1/2/3” banners in the Progress Comparison side-by-side view by unifying the banner with its card container.

**Planned changes:**
- Update the Progress Comparison (PhotoComparisonView) slot layout/styling so the Option banner sits at the very top of the same rounded card container (no separate/top gap area).
- Ensure the card’s top-left/top-right rounded corners apply to the unified header/banner area for all three slots (Option 1, Option 2, Option 3).
- Preserve existing slot header content layout (date line, Today-relative variance badge, Change button) and the image area below, avoiding regressions.

**User-visible outcome:** In the Progress Comparison modal side-by-side view, each Option banner is visually integrated into its card and touches the top rounded edge with no awkward empty band above it.
