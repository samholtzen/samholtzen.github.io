---
title: How to write a post
date: 2026-11-20
description: A template for new posts. It is a draft, so it only appears in `npm run dev`.
draft: true
---

Copy this file to `src/content/posts/my-post-title.md`, edit the front matter
above, and write in Markdown below it. The file name becomes the URL:
`/writing/my-post-title/`.

Set `draft: false` (or delete the line) to publish. The "Writing" link appears
in the navigation once at least one post is published.

## Margin notes and figures

Footnotes become margin notes.[^note] On wide screens they sit beside the text;
on narrow screens they appear inline.

[^note]: Write them as normal Markdown footnotes. Inline *formatting* and [links](https://example.com) work.

An image with a title becomes a numbered figure, and the title is the caption:

![Portrait, used here only to demonstrate figures](../../assets/profile.jpg "Captions are plain text. Numbering (Fig. 1, Fig. 2, ...) is automatic.")

Math still works too: $e^{i\pi} + 1 = 0$.
