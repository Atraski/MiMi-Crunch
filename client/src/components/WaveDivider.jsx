import React from 'react'

const PATHS = [
  'M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z',
  'M0,40 C360,0 1080,60 1440,20 L1440,60 L0,60 Z',
  'M0,20 C300,60 900,0 1440,40 L1440,60 L0,60 Z',
  'M0,60 C480,0 960,60 1440,0 L1440,60 L0,60 Z',
]

const WaveDivider = ({ fromColor, toColor, shape = 0 }) => {
  const d = PATHS[shape % PATHS.length]
  return (
    <div
      style={{
        background: toColor,
        display: 'block',
        lineHeight: 0,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="home-wave-divider-svg w-full"
        aria-hidden="true"
      >
        <path fill={fromColor} d={d} />
      </svg>
    </div>
  )
}

export default WaveDivider
