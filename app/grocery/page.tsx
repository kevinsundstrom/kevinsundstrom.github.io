import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Grocery — Kevin Sundstrom',
  description:
    'A shared grocery list for two people, sorted by aisle order, with recipe import and live availability. Built to never glitch mid-shop.',
};

export default function Grocery() {
  return (
    <div className="shell">
      <SiteHeader active="/grocery" />

      <main>
        <div className="col-identity">
          <div>
            <div className="accent-rule"></div>
            <h1 className="lede">A grocery list,<br /><em>built the way I like.</em></h1>
            <p className="bio">
              I didn&apos;t like the grocery apps I tried, so I built one.
              Every item is its own database row with targeted updates, so one
              person checking something off doesn&apos;t overwrite an item the
              other just added. The UI updates optimistically and reconciles
              against the server on the next poll.
            </p>
          </div>
          <div className="meta-strip">
            <div className="meta-row">
              <span className="meta-label">Status</span>
              <span className="meta-val">Closed source · In daily household use</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Stack</span>
              <span className="meta-val">Next.js · Neon Postgres · Vercel</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Tested</span>
              <span className="meta-val">40 tests against real route handlers + in-process Postgres</span>
            </div>
          </div>
        </div>

        <div className="col-project">
          <p className="project-eyebrow">Side project</p>

          <div className="status-pill">
            <span className="status-dot"></span>
            In daily use
          </div>

          <h2 className="project-name">Grocery <span className="name-emoji" aria-hidden="true">🫐</span></h2>
          <p className="project-name-sub">an installable PWA for two phones, one list</p>

          <p className="project-desc">
            One shared list that both phones see, syncing every few seconds and
            on focus. Items auto-sort into sections matched to the local
            store&apos;s aisle order, so the list reads in the order you walk.
            No webfonts, no framework bloat — it stays fast on store cellular.
          </p>

          <ul className="feature-list">
            <li>Recipe import — paste an ingredient list or a URL, review sections before anything is added</li>
            <li>Quantity parsing that combines fractions and ranges instead of guessing</li>
            <li>Purchase-unit picker with AI suggestions (a recipe&apos;s &ldquo;2 tbsp chipotle in adobo&rdquo; becomes a 7 oz can)</li>
            <li>Live availability checks against the Kroger API</li>
            <li>Stable order while you shop — checking off mutes in place, no reshuffling under your thumb</li>
            <li>Session handling built so you never get logged out standing in an aisle</li>
          </ul>

          <div className="cta-block">
            <a href="/changelog" className="btn-primary">
              Read the changelog <span className="arrow">→</span>
            </a>
            <span className="cta-note">Private household app · release notes are public</span>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
