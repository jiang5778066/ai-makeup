# Competitor-Style UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the marketing UI around the competitor's mature dark tool-site structure without changing product behavior.

**Architecture:** `SiteShell` becomes a top bar plus desktop sidebar and content rail. `LandingPage` keeps the existing product components but changes the hero proof and section presentation. `globals.css` applies one coherent dark visual system across marketing, try-on, generator, pricing, footer, login, and dashboard surfaces.

**Tech Stack:** Next.js 16, React 19, TypeScript, plain CSS, lucide-react, Vitest, Testing Library.

---

### Task 1: Lock the shell contract with a smoke test

**Files:**
- Create: `src/components/site-shell.test.tsx`
- Test: `src/components/site-shell.test.tsx`

- [x] Render the Chinese shell with an active AI Makeup route and assert the brand, top actions, labelled primary sidebar navigation, pricing link, and child content.
- [x] Run `npx vitest run src/components/site-shell.test.tsx` and verify the pre-refactor shell fails the sidebar-navigation assertion.

### Task 2: Rebuild the application shell

**Files:**
- Modify: `src/components/site-shell.tsx`
- Test: `src/components/site-shell.test.tsx`

- [x] Move primary product links and the nine makeup tools into a desktop `<aside>` below the top bar.
- [x] Keep language, creations, and sign-in actions in the compact top bar.
- [x] Wrap page children and footer in the content rail so the sidebar remains fixed on desktop.
- [x] Run `npx vitest run src/components/site-shell.test.tsx` and verify it passes.

### Task 3: Recompose the marketing hero and cards

**Files:**
- Modify: `src/components/landing-page.tsx`
- Create: `public/images/makeup-hero-portrait.jpg`

- [x] Replace the abstract proof block with a two-panel before/after portrait using one local licensed image and a visibly enhanced after treatment.
- [x] Keep truthful product facts and the existing CTA destinations.
- [x] Remove magazine numbering from section and style cards while preserving their content and links.
- [x] Keep `VirtualTryOn` or `MakeupTool` as the first working section after the hero.

### Task 4: Apply the competitor-style dark visual system

**Files:**
- Modify: `src/app/globals.css`

- [x] Replace ivory, serif, cherry-red marketing tokens with near-black surfaces, neutral text, blue-purple-pink accents, and dark borders.
- [x] Style the top bar, fixed sidebar, gridded content rail, hero proof, tool studio, repeated cards, pricing, FAQ, footer, login, and dashboard consistently.
- [x] Add desktop, tablet, and mobile layout rules; collapse the sidebar below 1024px.
- [x] Keep focus-visible and prefers-reduced-motion behavior.

### Task 5: Verify the redesign

**Files:**
- Verify all modified files and routes.

- [x] Run `npm test` and require all Vitest suites to pass.
- [x] Run `npm run typecheck` and require exit code 0.
- [x] Run `npm run lint` and require exit code 0.
- [x] Run `npm run build` and require a successful Next.js production build.
- [ ] Inspect `/virtual-makeup-try-on` and `/zh-CN/ai-makeup` at desktop and mobile widths, checking sidebar visibility, tool usability, overflow, focus states, and the absence of the rejected light editorial style.
