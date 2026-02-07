# Specification

## Summary
**Goal:** Replace the 2nd image in the initial signup (login) page gallery with the uploaded `cal.png` screenshot.

**Planned changes:**
- Add `cal.png` to `frontend/public/assets/` so it is served at `/assets/cal.png` without any resizing/cropping/styling changes.
- Update `frontend/src/pages/LoginPage.tsx` to replace only the 2nd entry in the `PREVIEW_IMAGES` array (currently `'/assets/main2a.png'`) with `'/assets/cal.png'`, keeping 4 images total and leaving the other 3 unchanged.

**User-visible outcome:** On the initial signup/login page carousel, navigating to the 2nd image shows the new calendar screenshot (`cal.png`) while the other three gallery images remain the same.
