# SVG Recruitment

Recruitment website for Sree Vijeyaganapathi & Co., built with Next.js, Tailwind CSS v4, GSAP and Supabase.

- [Supabase bucket setup, step by step](./SUPABASE_BUCKET_STEPS.md)
- [Full setup, admin access and scheduled resume deletion](./SETUP.md)
- [Environment template](./.env.example)
- [Recruitment database migration](./supabase/migrations/202611020001_recruitment.sql)

Public pages: `/`, `/careers`, `/privacy`, `/terms`. Staff pages: `/admin/login`, `/admin`, `/admin/applications`, `/admin/jobs`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses Plus Jakarta Sans and Noto Sans Tamil through `next/font`. Add your logo using `NEXT_PUBLIC_LOGO_PATH`. Hiring locations remain placeholders until entered in Admin.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`. Browser tests use an isolated local server with Supabase credentials disabled; the success-flow test mocks the API. Live upload/download/deletion checks still require your configured Supabase project.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
