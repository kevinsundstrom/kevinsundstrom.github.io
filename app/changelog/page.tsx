import type { Metadata } from 'next';
import MobileNav from '../components/MobileNav';
import { getChangelogEntries } from '../../lib/changelog';

export const metadata: Metadata = {
  title: 'Changelog — Kevin Sundstrom',
  description: 'Release notes for projects by Kevin Sundstrom.',
};

export default function Changelog() {
  const entries = getChangelogEntries();

  return (
    <div className="shell">
      <header>
        <a href="/" className="wordmark">Kevin Sundstrom</a>
        <nav>
          <a href="/">Home</a>
          <a href="/changelog" className="active">Changelog</a>
          <a href="https://synapse.kevinsundstrom.com">Synapse ↗</a>
          <a href="mailto:kevsundstrom@gmail.com">Contact</a>
        </nav>
        <MobileNav active="/changelog" />
      </header>

      <main className="changelog">
        <div className="changelog-intro">
          <div className="accent-rule"></div>
          <h1 className="lede">Changelog</h1>
          <p className="bio">
            Release notes for my projects, written and published by agentic
            content tooling. Currently tracking{' '}
            <a href="https://github.com/kevinsundstrom/mdinterface">
              <strong>mdinterface</strong>
            </a>
            .
          </p>
        </div>

        <div className="changelog-entries">
          {entries.map((entry) => (
            <article className="changelog-entry" key={entry.slug} id={entry.slug}>
              <div className="entry-meta">
                <span className="entry-project">{entry.project}</span>
                <span className="entry-version">{entry.version}</span>
                {entry.tag && <span className="entry-tag">{entry.tag}</span>}
                <span className="entry-date">{entry.date}</span>
              </div>
              <div
                className="entry-body"
                dangerouslySetInnerHTML={{ __html: entry.html }}
              />
            </article>
          ))}
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
