import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'mdinterface — Kevin Sundstrom',
  description:
    'A live markdown canvas wired to Claude Code. Highlight a passage to set both the context and the scope; Claude edits exactly that.',
};

export default function Mdinterface() {
  return (
    <div className="shell">
      <SiteHeader active="/mdinterface" />

      <main className="project-page">
        <div className="project-intro">
          <div className="accent-rule"></div>
          <h1 className="lede">mdinterface</h1>
          <p className="bio">
            A rendered markdown canvas beside a live Claude Code session,
            bridged only by the file on disk. Highlight a passage and it sets
            both what Claude sees and what it&apos;s allowed to change — ask
            for a fix or a rewrite, and just that block changes and
            re-renders. Open source, on npm: <code>npx mdinterface doc.md</code>
          </p>
        </div>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">How it works</span>
          </aside>
          <div className="entry-body">
            <p>
              The two panes never talk to each other directly. The full
              document loads into Claude&apos;s context at session start, the
              canvas selection rides along with each message via hooks, Claude
              edits the file through a <code>canvas_edit</code> MCP tool, and
              a file watcher re-renders the canvas the instant the file is
              written. The file is the interface.
            </p>
          </div>
        </section>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">Features</span>
          </aside>
          <div className="entry-body">
            <ul>
              <li>Selection-scoped edits — a two-word instruction changes exactly the passage you highlighted and leaves the rest alone</li>
              <li>Git-native Notion sync — a marker on the first line links a document to a Notion page, with three-way pull/push/conflict verdicts computed against the last-synced git tag</li>
              <li>Notion comment awareness — a background poller surfaces new comments on the linked page to Claude proactively</li>
              <li>Launch with no file for an empty canvas and a file picker, or point it at any markdown file</li>
              <li>Runs from npm with no install: <code>npx mdinterface</code></li>
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
                <span className="detail-label">Source</span>
                <span><a href="https://github.com/kevinsundstrom/mdinterface">github.com/kevinsundstrom/mdinterface</a> · MIT</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Install</span>
                <span><code>npx mdinterface doc.md</code> — Node 18+ and the <code>claude</code> CLI</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Stack</span>
                <span>Node · node-pty (optional) · MCP · plain HTML/JS frontend</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span>0.2.1 on npm · release notes on the <a href="/changelog">changelog</a></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
