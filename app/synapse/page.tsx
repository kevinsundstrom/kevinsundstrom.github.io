import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Synapse — Kevin Sundstrom',
  description:
    'A multi-agent content production system built on GitHub Agentic Workflows — briefs and SME interviews in, publication-ready content out.',
};

export default function Synapse() {
  return (
    <div className="shell">
      <SiteHeader active="/synapse" />

      <main className="project-page">
        <div className="project-intro">
          <div className="accent-rule"></div>
          <h1 className="lede">
            Synapse
            <svg className="synapse-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" aria-hidden="true">
              <polygon fill="currentColor" points="52,4 28,42 40,42 36,76 60,34 44,34" />
              <polygon fill="#219ebc" points="36,76 60,34 44,34 46,42" />
            </svg>
          </h1>
          <p className="bio">
            A multi-agent content production system built on GitHub Agentic
            Workflows. Structured briefs and SME interviews go in;
            publication-ready content comes out, without the typical
            editorial bottlenecks.
          </p>
        </div>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">How it works</span>
          </aside>
          <div className="entry-body">
            <p>
              Interview transcripts feed a living knowledge store: an
              ingestion agent summarizes each transcript, and approved
              summaries roll up into persistent topic-level docs. When a
              content brief comes in, an orchestrator maps it against that
              knowledge and produces a coverage map and outline — the first
              human checkpoint. Draft and review agents then write and audit
              the piece — the second checkpoint. Nothing ships without a
              person approving both.
            </p>
          </div>
        </section>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">Features</span>
          </aside>
          <div className="entry-body">
            <ul>
              <li>Agentic pipeline with human review gates</li>
              <li>First-party knowledge store built from real interviews</li>
              <li>Standardized outline and prose quality controls</li>
              <li>Runs on GitHub Agentic Workflows with Claude models</li>
              <li>Delivered as a Next.js app on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a></li>
            </ul>
          </div>
        </section>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">Details</span>
          </aside>
          <div className="entry-body">
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Stack</span>
                <span>Next.js · Vercel · GitHub Agentic Workflows · Claude models</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span>Personal project · private while it&apos;s in active development</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
