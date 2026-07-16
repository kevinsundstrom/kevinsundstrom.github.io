'use client';

import { useState, type ReactNode } from 'react';

// Client Component — cycles the featured side-project card with manual
// controls. Cards are server-rendered JSX; fragments land as direct children
// of .col-project so the existing column layout applies unchanged.
export default function ProjectCycler({
  cards,
  initialIndex = 0,
}: {
  cards: ReactNode[];
  initialIndex?: number;
}) {
  const [i, setI] = useState(initialIndex);
  const n = cards.length;

  return (
    <>
      <div className="cycler-head">
        <p className="project-eyebrow">Side projects</p>
        <div className="cycler-nav">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => setI((i + n - 1) % n)}
          >
            ←
          </button>
          <span className="cycler-count">{i + 1} / {n}</span>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => setI((i + 1) % n)}
          >
            →
          </button>
        </div>
      </div>
      {cards[i]}
    </>
  );
}
