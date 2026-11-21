// A small BibTeX parser and formatter for the publications list.
// Handles the entries Google Scholar exports: braced or quoted values,
// nested braces, and common LaTeX accents.

export interface BibEntry {
  type: string;
  key: string;
  fields: Record<string, string>;
}

export interface Author {
  display: string; // e.g. "S. E. Holtzen"
  isSelf: boolean;
}

export interface Publication {
  key: string;
  type: string;
  year: number;
  titleHtml: string;
  authors: Author[];
  etAl: boolean;
  venue: string;
  links: { label: string; href: string }[];
}

// ---------- Parsing ----------

function readBraced(src: string, start: number): [string, number] {
  // src[start] === '{'
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return [src.slice(start + 1, i), i + 1];
    }
  }
  throw new Error(`Unbalanced braces in BibTeX near position ${start}`);
}

function readQuoted(src: string, start: number): [string, number] {
  // src[start] === '"'
  let depth = 0;
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    else if (src[i] === '"' && depth === 0) return [src.slice(start + 1, i), i + 1];
  }
  throw new Error(`Unterminated quoted value in BibTeX near position ${start}`);
}

export function parseBibtex(src: string): BibEntry[] {
  const entries: BibEntry[] = [];
  const header = /@(\w+)\s*\{/g;
  let m: RegExpExecArray | null;

  while ((m = header.exec(src))) {
    const type = m[1].toLowerCase();
    const open = header.lastIndex - 1;

    if (type === 'comment' || type === 'string' || type === 'preamble') {
      header.lastIndex = readBraced(src, open)[1];
      continue;
    }

    let i = header.lastIndex;
    const comma = src.indexOf(',', i);
    const key = src.slice(i, comma).trim();
    i = comma + 1;

    const fields: Record<string, string> = {};
    for (;;) {
      while (i < src.length && /[\s,]/.test(src[i])) i++;
      if (i >= src.length || src[i] === '}') { i++; break; }

      const eq = src.indexOf('=', i);
      const name = src.slice(i, eq).trim().toLowerCase();
      i = eq + 1;
      while (/\s/.test(src[i])) i++;

      let value: string;
      if (src[i] === '{') [value, i] = readBraced(src, i);
      else if (src[i] === '"') [value, i] = readQuoted(src, i);
      else {
        const end = src.slice(i).search(/[,}]/);
        value = src.slice(i, i + end).trim();
        i += end;
      }
      fields[name] = value.replace(/\s+/g, ' ').trim();
    }

    entries.push({ type, key, fields });
    header.lastIndex = i;
  }
  return entries;
}

// ---------- LaTeX cleanup ----------

const COMBINING: Record<string, string> = {
  '"': '̈', "'": '́', '`': '̀', '^': '̂',
  '~': '̃', '=': '̄', '.': '̇', c: '̧', v: '̌', u: '̆',
};

const SPECIAL: Record<string, string> = {
  ae: 'æ', AE: 'Æ', oe: 'œ', OE: 'Œ', o: 'ø', O: 'Ø',
  aa: 'å', AA: 'Å', ss: 'ß', l: 'ł', L: 'Ł', i: 'ı',
};

export function cleanLatex(s: string): string {
  return s
    // \"{o}, \"o, {\"o}
    .replace(/\\(["'`^~=.])\s*\{?([A-Za-z])\}?/g, (_, a, ch) => ch + COMBINING[a])
    .replace(/\\([cvu])\s*\{([A-Za-z])\}/g, (_, a, ch) => ch + COMBINING[a])
    // {\ae}, \ae, \o
    .replace(/\\(ae|AE|oe|OE|aa|AA|ss|o|O|l|L|i)(?![A-Za-z])\s?/g, (_, c) => SPECIAL[c])
    .replace(/\\(textit|emph|textbf|textrm|mathrm|textsc)\s*/g, '')
    .replace(/\\([&%$#_])/g, '$1')
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .replace(/~/g, ' ')
    .replace(/[{}]/g, '')
    .normalize('NFC')
    .trim();
}

// ---------- Formatting ----------

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Escape a title but keep the small set of inline tags used in titles. */
function titleToHtml(raw: string): string {
  return escapeHtml(cleanLatex(raw)).replace(/&lt;(\/?)(sup|sub|i|em)&gt;/g, '<$1$2>');
}

function formatAuthor(raw: string, selfLastName: string): Author {
  const name = cleanLatex(raw);
  let last: string, first: string;
  if (name.includes(',')) {
    [last, first] = name.split(',').map((p) => p.trim());
  } else {
    // "FELDSPAR Team" or "First Last": keep as written.
    return { display: name, isSelf: name.endsWith(selfLastName) };
  }
  const initials = first
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.split('-').map((p) => p[0].toUpperCase() + '.').join('-'))
    .join(' ');
  return {
    display: initials ? `${initials} ${last}` : last,
    isSelf: last === selfLastName,
  };
}

function formatVenue(e: BibEntry): string {
  const f = Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k, cleanLatex(v)]));
  if (e.type === 'phdthesis') return ['Ph.D. dissertation', f.school].filter(Boolean).join(', ');
  if (e.type === 'mastersthesis') return ['Master’s thesis', f.school].filter(Boolean).join(', ');

  const container = f.journal || f.booktitle || f.publisher || '';
  let vol = f.volume ?? '';
  if (vol && f.number) vol += `(${f.number})`;
  return [container, vol, f.pages].filter(Boolean).join(', ');
}

function formatLinks(f: Record<string, string>): Publication['links'] {
  const links: Publication['links'] = [];
  if (f.doi) links.push({ label: 'DOI', href: `https://doi.org/${f.doi.replace(/^https?:\/\/doi\.org\//, '')}` });
  if (f.url) links.push({ label: 'Link', href: f.url });
  if (f.pdf) links.push({ label: 'PDF', href: f.pdf });
  if (f.preprint) links.push({ label: 'Preprint', href: f.preprint });
  if (f.code) links.push({ label: 'Code', href: f.code });
  return links;
}

export function toPublications(entries: BibEntry[], selfLastName: string): Publication[] {
  return entries
    .map((e) => {
      const names = (e.fields.author ?? '').split(/\s+and\s+/).filter(Boolean);
      const etAl = names.some((n) => n.trim().toLowerCase() === 'others');
      return {
        key: e.key,
        type: e.type,
        year: Number.parseInt(e.fields.year ?? '0', 10),
        titleHtml: titleToHtml(e.fields.title ?? ''),
        authors: names
          .filter((n) => n.trim().toLowerCase() !== 'others')
          .map((n) => formatAuthor(n, selfLastName)),
        etAl,
        venue: formatVenue(e),
        links: formatLinks(e.fields),
      };
    })
    .sort((a, b) => b.year - a.year || a.key.localeCompare(b.key));
}
