import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'blueberry — Kevin Sundstrom',
  description:
    'A shared grocery list for a household — aisle-order sorting, recipe import, meal plan with a calendar feed.',
};

export default function Blueberry() {
  return (
    <div className="shell">
      <SiteHeader active="/blueberry" />

      <main className="project-page">
        <div className="project-intro">
          <div className="accent-rule"></div>
          <h1 className="lede">blueberry <span className="name-emoji" aria-hidden="true">🫐</span></h1>
          <p className="bio">
            I didn&apos;t like the grocery apps I tried, so I built one that
            works the way I like. A shared list for a household — installed
            like an app, synced between phones, sorted in the order you walk
            the store.
          </p>
        </div>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">How it works</span>
          </aside>
          <div className="entry-body">
            <p>
              Every item is its own database row with targeted updates, so one
              person checking something off doesn&apos;t overwrite an item the
              other just added. The UI updates optimistically and reconciles
              against the server on the next poll. Both phones see the same
              state, syncing every few seconds and on focus.
            </p>
            <p>
              Item order stays stable while you shop — checking something off
              mutes it in place rather than reshuffling the list. Sessions are
              built to not expire mid-shop: one passphrase per phone, then a
              cookie that rolls forward on every real app open.
            </p>
          </div>
        </section>

        <section className="project-section">
          <aside className="section-rail">
            <span className="rail-label">Features</span>
          </aside>
          <div className="entry-body">
            <ul>
              <li>Recipe import — paste an ingredient list or a URL; ingredients are parsed into sections and reviewed before anything is added</li>
              <li>Quantity handling that combines duplicates (½ cup + ½ cup → 1 cup) and shows ambiguous amounts as-is instead of guessing</li>
              <li>Purchase-unit picker that turns recipe amounts into what you buy — &ldquo;2 tbsp chipotle in adobo&rdquo; becomes a 7 oz can</li>
              <li>Availability dots for your store, via the Kroger API</li>
              <li>Weekly meal plan exposed as an iCal feed — ours shows up on a Skylight calendar</li>
              <li>Saved recipes, favorites, and a trash with recovery</li>
              <li>iOS Shortcut for sending a recipe from any app&apos;s share sheet</li>
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
                <span><a href="https://github.com/kevinsundstrom/blueberry">github.com/kevinsundstrom/blueberry</a> · MIT</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Stack</span>
                <span>Next.js · Neon Postgres · Vercel — no webfonts, small bundle, fast on store cellular</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Form</span>
                <span>Installable PWA — manifest, service worker, offline banner</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tests</span>
                <span>40 tests run the real route handlers against an in-process Postgres</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span>Open source · in daily household use · release notes on the <a href="/changelog">changelog</a></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
