import { cookies } from 'next/headers';
import MobileNav from './components/MobileNav';

// Server Component — reads the greeting cookie set by middleware at request time.
export default async function Home() {
  const cookieStore = await cookies();
  const greeting = cookieStore.get('ks_greeting')?.value ?? 'Hello';

  return (
    <div className="shell">
      <header>
        <a href="/" className="wordmark">Kevin Sundstrom</a>
        <nav>
          <a href="/" className="active">Home</a>
          <a href="https://synapse.kevinsundstrom.com">Synapse ↗</a>
          <a href="mailto:kevsundstrom@gmail.com">Contact</a>
        </nav>
        <MobileNav />
      </header>

      <main>
        <div className="col-identity">
          <div>
            <div className="accent-rule"></div>
            <h1 className="lede">Content strategy,<br /><em>engineered.</em></h1>
            {/* Greeting prepended to bio — value comes from middleware via cookie */}
            <p className="bio">
              {greeting}! I build <strong>content systems</strong> — the infrastructure that turns subject-matter expertise into structured, scalable output. Currently at <strong>GitHub</strong>, where I lead content strategy and run agentic production pipelines on top of Copilot infrastructure.
            </p>
          </div>
          <div className="meta-strip">
            <div className="meta-row">
              <span className="meta-label">Role</span>
              <span className="meta-val">Content Strategist and Team Lead, GitHub</span>
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
          <p className="project-eyebrow">Current project</p>

          <div className="status-pill">
            <span className="status-dot"></span>
            Private beta
          </div>

          <h2 className="project-name">
            Synapse
            <svg className="synapse-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" aria-hidden="true">
              <polygon fill="currentColor" points="52,4 28,42 40,42 36,76 60,34 44,34" />
              <polygon fill="#c8411a" points="36,76 60,34 44,34 46,42" />
            </svg>
          </h2>
          <p className="project-name-sub">synapse.kevinsundstrom.com</p>

          <p className="project-desc">
            A <strong>multi-agent content production system</strong> built on GitHub Agentic Workflows. Planning, knowledge, assembly, and draft agents work in sequence, turning structured briefs and SME interviews into publication-ready content without the typical editorial bottlenecks.
          </p>

          <ul className="feature-list">
            <li>Agentic pipeline with human review gates</li>
            <li>First-party knowledge store built from real interviews</li>
            <li>Standardized outline and prose quality controls</li>
            <li>Runs on Copilot infrastructure with Claude models</li>
          </ul>

          <div className="cta-block">
            <a href="https://synapse.kevinsundstrom.com" className="btn-primary">
              Open Synapse <span className="arrow">→</span>
            </a>
            <span className="cta-note">
              Desktop · Private beta · <a href="https://github.com/kevinsundstrom/synapse">Open source soon ↗</a>
            </span>
          </div>
        </div>
      </main>

      <footer>
        <span className="footer-left">© 2026 Kevin Sundstrom</span>
        <div className="footer-links">
          <a href="https://linkedin.com/in/kevinsundstrom">LinkedIn</a>
          <a href="https://github.com/kevinsundstrom">GitHub</a>
          <a href="mailto:kevsundstrom@gmail.com">Email</a>
        </div>
      </footer>
    </div>
  );
}
