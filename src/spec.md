# Specification

## Summary
**Goal:** Add a subtle animated glowing border that rotates around the selected button to make it feel “live / waiting to be pressed,” without changing its layout or behavior.

**Planned changes:**
- Add a button-specific styling hook (e.g., a dedicated class) to target only the specified button.
- Implement a subtle rotating border/glow effect via CSS (e.g., pseudo-element + conic-gradient/mask) that preserves the button’s existing size and click behavior.
- Ensure the effect respects hover/active/disabled states, is visible but subtle in light/dark themes, and is disabled when `prefers-reduced-motion` is enabled.

**User-visible outcome:** The targeted button shows a subtle rotating glowing border highlight indicating it’s ready to be pressed, while all other buttons remain unchanged and the UI layout stays stable.
