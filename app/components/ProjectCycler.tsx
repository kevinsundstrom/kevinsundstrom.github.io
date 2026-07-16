'use client';

import { useState, type ReactNode } from 'react';

// Client Component — cycles the featured side-project card with manual
// controls. Renders the .col-project column itself so it can suppress the
// entrance animation once the visitor starts flipping: the rise plays on
// page load only, and card switches just show the next card.
export default function ProjectCycler({
  cards,
  initialIndex = 0,
}: {
  cards: ReactNode[];
  initialIndex?: number;
}) {
  const [i, setI] = useState(initialIndex);
  const [interacted, setInteracted] = useState(false);
  const n = cards.length;
  const go = (step: number) => {
    setInteracted(true);
    setI((prev) => (prev + step + n) % n);
  };

  return (
    <div className={`col-project${interacted ? ' no-anim' : ''}`}>
      <div className="cycler-head">
        <p className="project-eyebrow">Side projects</p>
        <div className="cycler-nav">
          <button type="button" aria-label="Previous project" onClick={() => go(-1)}>
            ←
          </button>
          <span className="cycler-count">{i + 1} / {n}</span>
          <button type="button" aria-label="Next project" onClick={() => go(1)}>
            →
          </button>
        </div>
      </div>
      {cards[i]}
    </div>
  );
}
