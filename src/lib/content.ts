import { getCollection } from 'astro:content';
import { parse as parseYaml } from 'yaml';
import bibSource from '../data/publications.bib?raw';
import cvSource from '../data/cv.yaml?raw';
import { site } from '../data/site';
import { parseBibtex, toPublications, type Publication } from './bibtex';

export function getPublications(): Publication[] {
  return toPublications(parseBibtex(bibSource), site.authorLastName);
}

export interface CvItem {
  when?: string | number;
  what: string;
  where?: string;
  details?: string[];
}
export interface CvSection {
  title: string;
  items: CvItem[];
}

export function getCv(): CvSection[] {
  const data = parseYaml(cvSource) as { sections?: CvSection[] };
  return data.sections ?? [];
}

/** Published posts, newest first. Drafts are included only in `npm run dev`. */
export async function getPosts() {
  const posts = await getCollection('posts', (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
