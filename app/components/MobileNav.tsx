'use client';

import { useState } from 'react';

// Client Component — manages hamburger open/close state in the browser.
export default function MobileNav({ active = '/' }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const cls = (href: string) => (href === active ? 'active' : undefined);

  return (
    <>
      <button
        className="hamburger"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>
      <div className={`nav-dropdown${open ? ' open' : ''}`}>
        <a href="/" className={cls('/')} onClick={() => setOpen(false)}>Home</a>
        <a href="/changelog" className={cls('/changelog')} onClick={() => setOpen(false)}>Changelog</a>
        <a href="https://synapse.kevinsundstrom.com" onClick={() => setOpen(false)}>Synapse ↗</a>
        <a href="mailto:kevsundstrom@gmail.com" onClick={() => setOpen(false)}>Contact</a>
      </div>
    </>
  );
}
