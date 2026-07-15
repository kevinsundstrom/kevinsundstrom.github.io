import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getChangelogEntries } from '../../lib/changelog';

export const metadata: Metadata = {
  title: 'Changelog — Kevin Sundstrom',
  description: 'Release notes for projects by Kevin Sundstrom.',
};

export default function Changelog() {
  const entries = getChangelogEntries();

  return (
    <div className="shell">
      <SiteHeader active="/changelog" />

      <main className="changelog">
        <div className="changelog-intro">
          <div className="accent-rule"></div>
          <h1 className="lede">Changelog</h1>
          <p className="bio">
            Release notes for my projects, written and published by agentic
            content tooling. Currently tracking{' '}
            <a href="https://github.com/kevinsundstrom/mdinterface">
              <strong>mdinterface</strong>
            </a>{' '}
            and <a href="/grocery"><strong>grocery</strong></a>.
          </p>
        </div>

        <div className="changelog-entries">
          {entries.map((entry) => (
            <article className="changelog-entry" key={entry.slug} id={entry.slug}>
              <aside className="entry-meta">
                <span className="entry-project">{entry.project}</span>
                <h2 className="entry-version">{entry.version}</h2>
                <time className="entry-date" dateTime={entry.date}>{entry.date}</time>
                {entry.tag && <span className="entry-tag">{entry.tag}</span>}
              </aside>
              <div
                className="entry-body"
                dangerouslySetInnerHTML={{ __html: entry.html }}
              />
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
