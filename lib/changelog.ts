import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export interface ChangelogEntry {
  slug: string;
  project: string;
  version: string;
  date: string; // ISO yyyy-mm-dd
  tag?: string; // optional badge, e.g. "Initial release"
  html: string; // rendered markdown body
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'changelog');

// Publishing a new entry = dropping a markdown file in content/changelog/
// with `project`, `version`, and `date` frontmatter. No registry to update.
export function getChangelogEntries(): ChangelogEntry[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const entries = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug: file.replace(/\.md$/, ''),
        project: meta.project ?? 'unknown',
        version: meta.version ?? '',
        date: meta.date ?? '',
        tag: meta.tag,
        html: marked.parse(body, { async: false }),
      };
    });

  // Newest first; the filename's date prefix breaks same-day ties.
  return entries.sort(
    (a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug)
  );
}

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(match[0].length) };
}
