# Playful Animated Design Overhaul + Name Fix

## Created By
- csalviati

## Type
- Feature

## Priority
- High

## Description

The app's core functionality is working but the UI is extremely bare — flat green buttons on white, no visual hierarchy, no delight. It needs a full design pass to feel like a real, polished product that matches the organic/community spirit of a plant-trading marketplace.

**Current state:**
- Minimal Tailwind styling with flat green (`green-700/800`) palette
- No animations or transitions beyond simple hover color changes
- Generic layout with no personality
- App name misspelled as "Propogate" — now fixed everywhere as "Propagate"

**Expected outcome:**
- Warm, earthy-but-lively visual language (think: botanical illustration meets playful SaaS)
- Entrance animations on page load (fade-in, slide-up, staggered cards)
- Micro-interactions: button bounces, hover lifts on cards, subtle leaf/sprout motifs
- Richer typography — expressive heading font, comfortable body sizing
- Illustrated or gradient hero section on the landing page
- Consistent, polished component states (loading skeletons, empty states, success feedback)
- Name corrected to **Propagate** everywhere

## Relevant Files
- `web/src/app/page.tsx` — landing page hero (biggest visual impact)
- `web/src/components/Nav.tsx` — name fix + animated nav
- `web/src/app/globals.css` — design tokens, animation utilities

## Notes / Risks
- Consider adding `framer-motion` for declarative animations (already popular in Next.js ecosystem)
- Avoid heavy animation on list pages with many cards — could hurt performance; use `will-change` sparingly
- Typo fix is safe but touches copy in multiple files — worth a quick grep across the whole repo for "propogate" (case-insensitive)
