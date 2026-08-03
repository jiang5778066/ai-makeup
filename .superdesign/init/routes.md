# Routes

Framework: Next.js App Router.

## Marketing
- `/` -> `src/app/page.tsx`, renders English home with `LandingPage`.
- `/[...slug]` -> `src/app/(marketing)/[...slug]/page.tsx`, renders English SEO pages.
- `/zh-CN` -> `src/app/zh-CN/page.tsx`, renders Simplified Chinese home.
- `/zh-CN/[...slug]` -> `src/app/zh-CN/[...slug]/page.tsx`, renders Simplified Chinese SEO pages.

## App Surfaces
- `/login` -> `src/app/login/page.tsx`.
- `/dashboard` -> `src/app/dashboard/page.tsx`.

## API
- `/api/makeup/generate`
- `/api/makeup/advice`
- `/api/makeup/transfer`
- `/api/styles`
- `/api/projects`
- `/api/projects/[id]`
- `/api/billing/checkout`
- `/api/webhooks/stripe`

## SEO
- `/robots.txt` -> `src/app/robots.ts`
- `/sitemap.xml` -> `src/app/sitemap.ts`
