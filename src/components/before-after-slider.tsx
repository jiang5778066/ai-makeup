"use client";

import { useState } from "react";

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel,
  afterLabel
}: {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  const [position, setPosition] = useState(50);
  return (
    <div className="comparison-slider">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="comparison-image" src={afterUrl} alt={afterLabel} />
      <div className="comparison-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="comparison-image" src={beforeUrl} alt={beforeLabel} />
      </div>
      <span className="comparison-label before">{beforeLabel}</span>
      <span className="comparison-label after">{afterLabel}</span>
      <span className="comparison-divider" style={{ left: `${position}%` }} aria-hidden="true"><i>↔</i></span>
      <input
        className="comparison-range"
        type="range"
        min="0"
        max="100"
        value={position}
        aria-label="Before and after comparison"
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
}
