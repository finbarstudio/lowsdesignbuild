# Lows Design & Build — POC setup

A tiny Next.js + Sanity site to learn how a headless CMS works.

## The mental model (read this first)

Three pieces talk to each other:

1. **Sanity Studio** — the admin screen at `/studio`. This is where content is added/edited/deleted.
2. **Sanity Content Lake** — Sanity's hosted database + API where that content actually lives (in the cloud, free).
3. **This Next.js site** — fetches the content from the Content Lake and renders the pages.

The loop: **edit in Studio → Publish → it's saved in the Content Lake → the site fetches it → it appears.** Nothing is hard-coded.

```
You (or your friend)
      │  edit & publish
      ▼
┌──────────────┐      GROQ query      ┌──────────────┐
│ Sanity Studio│ ───► Content Lake ◄─── │  Next.js site │
│   /studio    │       (cloud DB)      │   /  & /projects │
└──────────────┘                       └──────────────┘
```

## One-time setup

You need a free Sanity account + project. This is the only step that needs you to log in.

```bash
cd lows-site

# 1. Log in (opens your browser). Create a free Sanity account if you don't have one.
npx sanity login

# 2. Create a project + a "production" dataset, and write the IDs into .env.local.
npx sanity init --env
```

When `init` asks:
- **Create new project** → yes, name it "Lows Design & Build".
- **Use the default dataset configuration (production)** → yes.
- It writes `NEXT_PUBLIC_SANITY_PROJECT_ID` + `NEXT_PUBLIC_SANITY_DATASET` into `.env.local`.

> Prefer clicking? Go to **sanity.io/manage**, create a free project, copy the **Project ID**, and paste it into `.env.local` (keep dataset = `production`).

## Run it

```bash
npm run dev
```

- Site: http://localhost:3000
- Studio: http://localhost:3000/studio  (log in with the same Sanity account)

## Try the loop

1. Open `/studio` → **Project** → **Create new**.
2. Fill in a Title, upload a Main image (grab one from `../site_mirror/instagram/images/`), add a description → **Publish**.
3. Refresh `http://localhost:3000` → your project appears in the grid. Click it → detail page.
4. Edit the title in the Studio → refresh the site → it changes. Delete it → it's gone.

That's headless CMS. 🎉

## Where things live

| File | What it is |
|---|---|
| `sanity/schemaTypes/project.ts` | The fields a Project has (edit to add/remove fields) |
| `sanity.config.ts` | Studio configuration |
| `sanity/lib/queries.ts` | The GROQ queries that fetch content |
| `app/page.tsx` | The project grid (home) |
| `app/projects/[slug]/page.tsx` | A single project page |
| `.env.local` | Your Sanity project ID (gitignored) |
