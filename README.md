# News Junkie

News Junkie is a minimalist social news app where you can **share links**, **tag** them, and **follow** other users—no likes, no comments, no drama.

## Features

- **Auth + profiles** (name, description, profile photo)
- **Create / edit / delete posts** (description, link, tags)
- **Follow / unfollow users**
- **Post search** (text + tags, union/intersection tag matching)
- **Usually viewed tags** (toggle pills + clear)

## Tech stack

- **Vite + React + TypeScript** (SPA)
- **shadcn/ui** (Radix + Tailwind)
- **Supabase** (Auth, Postgres, Storage)

## Local development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Archiving links (Wayback / Archive.org)

When creating a post you can optionally save the article to the Internet Archive (Wayback Machine) and store the resulting URL in `posts.archive_link`.

### Why there’s “Deno” code in this repo

The archiving request is implemented as a **Supabase Edge Function** (`supabase/functions/archive-link`). Supabase Edge Functions run on **Deno in Supabase’s runtime**—you do **not** need to install Deno on your machine to use them in production.

### Deploy the Edge Function

If you use the Supabase CLI, deploy the function:

```bash
supabase functions deploy archive-link
```

Then, if your project requires it, enable function invocation for your app (Supabase Dashboard → Edge Functions).