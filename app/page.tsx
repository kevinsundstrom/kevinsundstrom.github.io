import { cookies } from 'next/headers';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import ProjectCycler from './components/ProjectCycler';

const projectCards = [
  // Synapse
  <>
    <div className="status-pill">
      <span className="status-dot"></span>
      Personal project
    </div>

    <h2 className="project-name">
      Synapse
      <svg className="synapse-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" aria-hidden="true">
        <polygon fill="currentColor" points="52,4 28,42 40,42 36,76 60,34 44,34" />
        <polygon fill="#c8411a" points="36,76 60,34 44,34 46,42" />
      </svg>
    </h2>
    <p className="project-desc">
      A <strong>multi-agent content production system</strong> built on GitHub Agentic Workflows. Planning, knowledge, assembly, and draft agents work in sequence, turning structured briefs and SME interviews into publication-ready content without the typical editorial bottlenecks.
    </p>

    <ul className="feature-list">
      <li>Agentic pipeline with human review gates</li>
      <li>First-party knowledge store built from real interviews</li>
      <li>Standardized outline and prose quality controls</li>
      <li>Runs on GitHub Agentic Workflows with Claude models</li>
      <li>Delivered as a Next.js app on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a></li>
    </ul>
  </>,

  // mdinterface
  <>
    <div className="status-pill">
      <span className="status-dot"></span>
      Open source
    </div>

    <h2 className="project-name">mdinterface</h2>
    <p className="project-name-sub">npx mdinterface doc.md</p>
    <p className="project-desc">
      A <strong>live markdown canvas wired to Claude Code</strong>, bridged only by the file on disk. Highlight a passage to set both what Claude sees and what it&apos;s allowed to change — ask, and just that block changes and re-renders.
    </p>

    <ul className="feature-list">
      <li>Selection-scoped edits via hooks and an MCP tool</li>
      <li>Git-native, three-way Notion sync</li>
      <li>Background poller surfaces Notion comments to Claude</li>
      <li>Runs from npm, no install — Node 18+ and the claude CLI</li>
    </ul>

    <div className="cta-block">
      <a href="/mdinterface" className="btn-primary">
        About mdinterface <span className="arrow">→</span>
      </a>
      <span className="cta-note">MIT · on npm · <a href="https://github.com/kevinsundstrom/mdinterface">GitHub</a></span>
    </div>
  </>,

  // blueberry
  <>
    <div className="status-pill">
      <span className="status-dot"></span>
      Open source
    </div>

    <h2 className="project-name">blueberry <span className="name-emoji" aria-hidden="true">🫐</span></h2>
    <p className="project-name-sub">two phones, one list</p>
    <p className="project-desc">
      A <strong>shared grocery list for a household</strong>. I didn&apos;t like the grocery apps I tried, so I built one that works the way I like — installed like an app, synced between phones, sorted in the order you walk the store.
    </p>

    <ul className="feature-list">
      <li>Aisle-order sorting you configure once</li>
      <li>Recipe import with review before anything is added</li>
      <li>Availability dots via the Kroger API</li>
      <li>Weekly meal plan exposed as an iCal feed</li>
    </ul>

    <div className="cta-block">
      <a href="/blueberry" className="btn-primary">
        About blueberry <span className="arrow">→</span>
      </a>
      <span className="cta-note">MIT · in daily household use · <a href="https://github.com/kevinsundstrom/blueberry">GitHub</a></span>
    </div>
  </>,
];

// Server Component — reads the greeting cookie set by middleware at request time.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const cookieStore = await cookies();
  const greeting = cookieStore.get('ks_greeting')?.value ?? 'Hello';

  // Lead card rotates daily so no project is always the face of the page;
  // ?p=1..3 deep-links a specific card.
  const { p } = await searchParams;
  const requested = Number(p) - 1;
  const initialIndex =
    Number.isInteger(requested) && requested >= 0 && requested < projectCards.length
      ? requested
      : Math.floor(Date.now() / 86_400_000) % projectCards.length;

  return (
    <div className="shell">
      <SiteHeader active="/" />

      <main>
        <div className="col-identity">
          <div>
            <div className="accent-rule"></div>
            <h1 className="lede">Content strategy,<br /><em>engineered.</em></h1>
            {/* Greeting prepended to bio — value comes from middleware via cookie */}
            <p className="bio">
              {greeting}! I build <strong>content systems</strong> — the infrastructure that turns subject-matter expertise into structured, scalable output. Currently a Senior Content Engineer at <strong>Vercel</strong>.
            </p>
          </div>
          <div className="meta-strip">
            <div className="meta-row">
              <span className="meta-label">Role</span>
              <span className="meta-val">Senior Content Engineer, Vercel</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Focus</span>
              <span className="meta-val">Content strategy · Agentic workflows · Systems design</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Location</span>
              <span className="meta-val">Vancouver, WA</span>
            </div>
          </div>
        </div>

        <div className="col-project">
          <ProjectCycler cards={projectCards} initialIndex={initialIndex} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
