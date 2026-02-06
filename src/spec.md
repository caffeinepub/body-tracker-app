# Specification

## Summary
**Goal:** Make the selected login button’s border/glow more prominent with a thicker, brighter, animated rainbow spectrum effect without changing its behavior or layout.

**Planned changes:**
- Apply a thicker/brighter rainbow gradient glow styling only to the specific button at `/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[2]/div[1]/button[1]`, keeping its size/layout unchanged.
- Add a visible glow animation for normal motion settings while preserving existing click/disabled behavior.
- Ensure the glow becomes subdued and non-animated when the button is disabled, and disable animation (but keep a static rainbow glow) when `prefers-reduced-motion` is enabled.

**User-visible outcome:** The targeted button shows a clearly thicker, brighter rainbow glow that animates smoothly (unless reduced-motion is enabled), remains fully clickable, and appears subdued/non-animated when disabled.
