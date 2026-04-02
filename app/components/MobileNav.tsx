'use client';

import { useState } from 'react';

// Client Component — manages hamburger open/close state in the browser.
export default function MobileNav() {
  const [open, setOpen] = useState(false);

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
        <a href="/" className="active" onClick={() => setOpen(false)}>Home</a>
        <a href="https://synapse.kevinsundstrom.com" onClick={() => setOpen(false)}>Synapse ↗</a>
        <a href="mailto:kevsundstrom@gmail.com" onClick={() => setOpen(false)}>Contact</a>
      </div>
    </>
  );
}
