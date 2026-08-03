# Competitor-Style UI Redesign

## Goal

Replace the rejected light editorial interface with the proven visual structure of the Lanta AI Makeup page while keeping Makeup AI's own branding, copy, features, pricing, and data.

## Approved direction

The user explicitly approved the competitor's UI as the target. The implementation should reproduce its overall product-page grammar:

- a full-width dark top bar with brand, language switch, and sign-in CTA;
- a persistent dark left navigation on desktop;
- a near-black gridded content background;
- a compact label, large sans-serif hero title, and restrained blue-purple-pink gradient accent;
- credible before/after portrait proof beside the hero copy;
- the working upload or live try-on studio immediately after the hero;
- dark, bordered, moderately rounded panels with ordinary product spacing;
- responsive mobile navigation without a persistent sidebar.

This is a structural and visual reference, not a pixel-for-pixel clone. Do not copy Lanta's logo, copy, images, claimed usage numbers, or ratings.

## Content and behavior

- Keep every existing route, locale, SEO schema, form action, upload flow, real-time renderer, Creem checkout, and credit rule unchanged.
- Keep the truthful product facts: three free signup results, nine local effects, and local preview processing.
- Keep the current LandingPage content source and bilingual labels.
- Use a locally stored, licensed portrait for the initial hero proof. Replace it later with original GPT Image 2 campaign assets without changing layout.
- Preserve visible focus states, accessible navigation labels, reduced-motion handling, and mobile usability.

## Component boundaries

- `SiteShell` owns the top bar, desktop sidebar, responsive navigation, content rail, and footer.
- `LandingPage` owns hero composition and marketing section order, but continues to compose existing `MakeupTool`, `VirtualTryOn`, pricing, and FAQ components.
- `globals.css` remains the only styling system and supplies the dark theme to existing controls without changing their behavior.

## Acceptance criteria

1. At 1280px wide, the page visibly matches the competitor's top-bar/sidebar/dark-grid skeleton.
2. The hero and the beginning of the working tool are visible without passing through decorative sections.
3. No Georgia/editorial headline, ivory page background, large abstract diagonal proof block, numbered magazine labels, fake metrics, or glassy floating orbs remain.
4. English and Chinese marketing routes render correctly on desktop and mobile.
5. Existing UI tests, typecheck, lint, and production build pass.

## Repository note

This workspace snapshot has no `.git` directory, so the spec and implementation can be written and verified but cannot be committed from this task.
