# AI Makeup Studio Design System: Beauty Counter OS

## Product Context
AI Makeup Studio is an international AI makeup generator, virtual try-on, and personalized makeup advisor. The UI must feel like a premium beauty counter and editorial makeup workstation, not a generic AI SaaS page.

## Visual Direction
- Direction: Beauty Counter OS.
- Emotional tone: premium, tactile, direct, editorial, product-led.
- Avoid: purple/blue AI gradients, glowing orbs, soft pink SaaS palettes, generic card piles, oversized rounded blobs.
- Competitor lesson: keep Lanta/Fotor/GoStudio's direct tool access, but make the brand feel more like a beauty product and less like an image tool.

## Palette
- `--ivory`: #f4efe7
- `--paper`: #fbf7ef
- `--lacquer`: #11100e
- `--charcoal`: #25211e
- `--taupe`: #b7aa9a
- `--warm-gray`: #ded5c9
- `--tray`: #e8ded1
- `--chrome`: #c8c2b8
- `--cherry`: #9d1f32
- `--lipstick`: #c93445
- `--oxide`: #7c3f2c
- `--olive`: #6d7459
- `--line`: rgba(17, 16, 14, 0.16)
- `--line-strong`: rgba(17, 16, 14, 0.34)

## Typography
- Use system sans for reliability and i18n.
- Display headings: very large, compressed-feeling layout, strong black contrast.
- Letter spacing must stay 0.
- Chinese uses the same system stack with PingFang SC / Microsoft YaHei fallback.

## Layout
- Hero is a full beauty counter/mirror surface, not a split SaaS hero.
- Primary tool must be visible in the first viewport on desktop and mobile.
- Use editorial rails, thin rules, numbered labels, makeup tray panels, swatches, and before/after proof.
- Sections are full-width bands or unframed layouts; cards only for repeated items, pricing plans, dashboard items, and tool surfaces.

## Components
- Buttons: squared 4-6px radius, black/cherry fills, compact but strong.
- Chips: cosmetic swatches with small color marks, not generic pills.
- Upload zone: mirror/dropzone surface with thin border and direct instructions.
- Result panel: verdict/notes panel, not a soft SaaS notification card.
- Navigation: boutique brand bar, compact mark, restrained links.

## Motion
- Use subtle transform on controls only. No decorative animated glows.

## Implementation Constraints
- Replace current rose/purple-ish AI visual language entirely.
- Keep existing routes, SEO, i18n, APIs, and tests intact.
- Do not introduce a UI framework or Tailwind.
