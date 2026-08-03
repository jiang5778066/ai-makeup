# Page Dependency Trees

## `/` Home
Entry: `src/app/page.tsx`
Dependencies:
- `src/components/landing-page.tsx`
  - `src/components/makeup-tool.tsx`
  - `src/components/site-shell.tsx`
  - `src/lib/content.ts`
  - `src/lib/i18n.ts`
- `src/lib/seo.ts`
- `src/app/globals.css`

## `/ai-makeup` and English marketing pages
Entry: `src/app/(marketing)/[...slug]/page.tsx`
Dependencies:
- `src/components/landing-page.tsx`
  - `src/components/makeup-tool.tsx`
  - `src/components/site-shell.tsx`
  - `src/lib/content.ts`
  - `src/lib/i18n.ts`
- `src/lib/seo.ts`
- `src/app/globals.css`

## `/zh-CN/ai-makeup` and Chinese marketing pages
Entry: `src/app/zh-CN/[...slug]/page.tsx`
Dependencies:
- `src/components/landing-page.tsx`
  - `src/components/makeup-tool.tsx`
  - `src/components/site-shell.tsx`
  - `src/lib/content.ts`
  - `src/lib/i18n.ts`
- `src/lib/seo.ts`
- `src/app/globals.css`

## `/dashboard`
Entry: `src/app/dashboard/page.tsx`
Dependencies:
- `src/app/globals.css`

## `/login`
Entry: `src/app/login/page.tsx`
Dependencies:
- `src/app/globals.css`
