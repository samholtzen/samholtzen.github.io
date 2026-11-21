# AGENTS.md

Guidance for anyone (human or AI agent) working on this repository. It records the decisions behind the site and the conventions to follow. Update it when a decision changes.

## Purpose

This is Sam Holtzen's personal academic website, served at <https://samholtzen.github.io>.

- **Primary audience:** academics, especially faculty search committees. Sam plans to go on the job market in 2027.
- **Goal:** a clear, current, professional calling card that shows who Sam is, what the research is about, and what has been published. Sam updates it regularly.
- **Voice:** professional with some personality. The tagline "Known to dabble." stays.

## Decisions

| Topic | Decision | Notes |
| --- | --- | --- |
| Framework | [Astro](https://astro.build), static output | Replaces the Jekyll al-folio theme. Rebuild from scratch rather than port. |
| Hosting | GitHub Pages, deployed by a GitHub Action on push to `main` | Uses the official `withastro/action`. |
| Pages | Home, Research, Publications, CV, Writing | Drop news, repositories, GitHub trophies, and the al-folio extras. |
| Publications | Generated at build time from a BibTeX file | BibTeX is what Google Scholar exports, so adding a paper means pasting an entry. |
| Writing | Markdown posts in an Astro content collection | Hide the Writing link in the nav until at least one real post exists. |
| Client-side JS | None by default | Add it only for a specific feature that needs it. |
| Design | Classic: serif type, warm off-white background, one muted accent color | See "Design". |
| Home vs. Research | Separate pages | Research can grow to hold themes and figures. |
| CV page | Full HTML CV, no PDF download | Rendered from `src/data/cv.yaml`. The page is the single source of truth, so there is no PDF to keep in sync. |

## Structure

```text
src/
  content/
    pages/
      home.md         # Home page text (bio)
      research.md     # Research page text
    posts/            # Writing: one .md file per post
  data/
    site.ts           # Name, tagline, position, links, nav items
    publications.bib  # All publications
    cv.yaml           # CV sections (positions, education, awards, ...)
  assets/
    profile.jpg       # Portrait (optimized to WebP at build time)
  lib/
    bibtex.ts         # Small BibTeX parser and formatter (no dependency)
    content.ts        # Loads publications, CV, and posts for pages
  pages/              # One file per route: index, research, publications, cv, writing/, 404
  layouts/
    Base.astro        # <head>, header nav, footer
  components/
    PublicationList.astro
  styles/
    global.css        # Design tokens (CSS custom properties) and base styles
  content.config.ts   # Content collection schemas
public/               # Copied as-is: favicon.svg, robots.txt
.github/workflows/deploy.yml
```

**Principle:** routine updates touch only `src/content/`, `src/data/`, and `public/`, never component or layout code. If a common update needs a code change, fix the structure.

## How to update content

- **Edit the home or research text:** `src/content/pages/home.md` or `research.md` (Markdown).
- **Add a publication:** paste a BibTeX entry into `src/data/publications.bib`. Entries are grouped by year, and your name is bolded. Optional extra fields become links: `doi`, `url`, `pdf`, `preprint`, `code`. Every entry needs a unique key.
- **Write a post:** copy `src/content/posts/example-post.md` to a new file. The file name becomes the URL (`/writing/<file-name>/`). Posts with `draft: true` appear only in `npm run dev`.
- **Update the CV:** edit `src/data/cv.yaml`. The CV page adds publications automatically.
- **Change name, tagline, position, or links:** edit `src/data/site.ts`.
- **Change the portrait:** replace `src/assets/profile.jpg` (square works best).
- **Preview locally:** `npm install` once, then `npm run dev` and open <http://localhost:4321>.
- **Publish:** merge or push to `main`. The GitHub Action builds and deploys the site.

## Design

- Classic academic look: serif body and headings, warm off-white page, dark ink text, one muted accent color for links and small details.
- Single readable column (about 40rem for prose). Generous whitespace. Mobile first.
- Colors and type set as CSS custom properties in `global.css`. Accent: muted teal (`#2c5f66` light, `#8cc0c6` dark).
- Light and dark themes that follow `prefers-color-scheme`.
- System serif stack (Iowan Old Style / Palatino / Georgia). No web fonts yet. No tracking or analytics scripts.
- Accessible: semantic HTML, sufficient contrast, visible focus states, alt text on all images.
- Keep the ☀️ emoji favicon unless replaced.

## Migration status

Done on branch `astro-rebuild`: the al-folio/Jekyll files are removed, the Astro site is scaffolded, and the publications, photo, CV PDF, CV data, and links are migrated. Placeholder content (lorem-ipsum news, the 2015 test post) was not carried over. The al-folio MIT `LICENSE` was removed with the theme code.

Remaining before merging to `main`:

1. In the GitHub repo settings, set Pages → Source to "GitHub Actions".
2. Replace the `TODO(sam):` placeholders (search the repo for `TODO(sam)`).

## Content still needed from Sam

- About/bio text for the home page, including the research summary.
- Research page content: themes, questions, and possibly figures.
- Recent publications or preprints since the last `.bib` update.
- The Divisional Postdoctoral Fellowship details and any other awards.
- New interests to mention.

Use clearly marked placeholders (`TODO(sam): ...`) until this content arrives. Do not invent biographical or research details.

## Open questions

- Exact typeface (a self-hosted web font would look identical on every platform) and accent color.
- Custom domain, or stay on `samholtzen.github.io`?

## Conventions for agents

- Read this file before making changes. Update it when a decision is made or changed.
- Never commit to `main` directly. Work on a branch and let Sam review.
- Prefer few dependencies and plain CSS. Do not add a UI framework (React, Tailwind, etc.) without discussing it first.
- Run `npm run build` before you report work as done. It must succeed with no errors.
- Do not fabricate content about Sam. Use `TODO(sam):` placeholders.
