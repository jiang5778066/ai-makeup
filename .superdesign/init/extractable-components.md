# Extractable Components

## SiteShell
- Source: `src/components/site-shell.tsx`
- Category: layout
- Description: Shared boutique navigation, language switcher, CTA, and footer.
- Extractable props: `locale`, `currentPath`
- Hardcoded: brand mark, nav labels, login CTA, footer copy.

## LandingPage
- Source: `src/components/landing-page.tsx`
- Category: layout
- Description: Shared localized marketing and tool page structure.
- Extractable props: `locale`, `currentPath`, `page`
- Hardcoded: section order, trust proof, style library, pricing, FAQ layout.

## MakeupTool
- Source: `src/components/makeup-tool.tsx`
- Category: basic
- Description: Upload, style selection, intensity, generation CTA, and result notes.
- Extractable props: `locale`, `styles`, `cta`
- Hardcoded: API endpoint, upload instructions, privacy note.

## Dashboard Cards
- Source: `src/app/dashboard/page.tsx`
- Category: basic
- Description: Studio workspace metrics and saved project cards.
- Extractable props: none in current implementation.
