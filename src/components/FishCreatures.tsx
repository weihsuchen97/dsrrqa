// SVG fish and shrimp shapes used by both FishTank and FishOverlay

interface FishAProps {
  color?: string
  scale?: number
}

/** Fish A – standard tropical fish shape */
export function FishA({ color = '#f97316', scale = 1 }: FishAProps) {
  return (
    <svg
      width={44 * scale}
      height={22 * scale}
      viewBox="0 0 44 22"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tail */}
      <polygon points="6,11 0,3 0,19" fill={color} opacity="0.85" />
      {/* Body */}
      <ellipse cx="24" cy="11" rx="16" ry="8" fill={color} />
      {/* Belly highlight */}
      <ellipse cx="24" cy="13" rx="10" ry="4" fill="rgba(255,255,255,0.18)" />
      {/* Top fin */}
      <path d="M18,3 Q24,0 30,3" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="35" cy="9" r="2.5" fill="white" />
      <circle cx="35.8" cy="9" r="1.2" fill="#1a1a2e" />
      <circle cx="36.2" cy="8.4" r="0.4" fill="white" />
      {/* Stripe */}
      <line x1="26" y1="3.5" x2="26" y2="18.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </svg>
  )
}

/** Fish B – chubby blowfish shape */
export function FishB({ color = '#6366f1', scale = 1 }: FishAProps) {
  return (
    <svg
      width={40 * scale}
      height={28 * scale}
      viewBox="0 0 40 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tail */}
      <path d="M6,14 L0,4 L0,24 Z" fill={color} opacity="0.8" />
      {/* Body (rounder) */}
      <ellipse cx="22" cy="14" rx="16" ry="12" fill={color} />
      {/* Belly */}
      <ellipse cx="23" cy="17" rx="10" ry="6" fill="rgba(255,255,255,0.15)" />
      {/* Spines */}
      {[14, 18, 22, 26, 30].map((x, i) => (
        <line key={i} x1={x} y1="2" x2={x - 1} y2="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      ))}
      {/* Eye */}
      <circle cx="32" cy="10" r="3" fill="white" />
      <circle cx="33" cy="10" r="1.5" fill="#0f172a" />
      <circle cx="33.5" cy="9.2" r="0.5" fill="white" />
      {/* Mouth */}
      <path d="M37,13 Q38,15 37,17" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Shrimp – curved body with antennae */
export function Shrimp({ scale = 1 }: { scale?: number }) {
  return (
    <svg
      width={36 * scale}
      height={28 * scale}
      viewBox="0 0 36 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Antennae */}
      <path d="M28,7 L36,2 M28,7 L33,0" stroke="#ff9a6c" strokeWidth="1" strokeLinecap="round" />
      {/* Head */}
      <circle cx="26" cy="8" r="5" fill="#ff7043" />
      <circle cx="28" cy="6.5" r="1.8" fill="#1a1a2e" />
      <circle cx="28.5" cy="6" r="0.5" fill="white" />
      {/* Segmented body */}
      <path d="M22,10 Q18,12 14,16 Q10,20 6,22 Q3,24 2,26"
        stroke="#ff7043" strokeWidth="5.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Body highlight */}
      <path d="M22,10 Q18,12 14,16 Q10,20 6,22 Q3,24 2,26"
        stroke="rgba(255,200,180,0.35)" strokeWidth="2" fill="none"
        strokeLinecap="round" />
      {/* Body segments */}
      {[0, 0.2, 0.4, 0.6, 0.8].map((t, i) => {
        const x = 22 - t * 20
        const y = 10 + t * 16
        return <circle key={i} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.2)" />
      })}
      {/* Tail fan */}
      <path d="M2,26 L-2,22 M2,26 L-1,28 M2,26 L4,30"
        stroke="#ff7043" strokeWidth="2" strokeLinecap="round" />
      {/* Legs */}
      {[0, 1, 2].map((i) => {
        const x = 18 - i * 4
        const y = 14 + i * 2.5
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x - 3} y2={y + 4} stroke="#ff9a6c" strokeWidth="1" strokeLinecap="round" />
            <line x1={x} y1={y} x2={x + 2} y2={y + 4} stroke="#ff9a6c" strokeWidth="1" strokeLinecap="round" />
          </g>
        )
      })}
    </svg>
  )
}

/** Seaweed – animated via CSS */
export function Seaweed({ height = 40, color = '#15803d' }: { height?: number; color?: string }) {
  return (
    <svg
      width={18}
      height={height}
      viewBox={`0 0 18 ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="seaweed"
    >
      <path
        d={`M9,${height} Q14,${height * 0.8} 9,${height * 0.6} Q4,${height * 0.4} 9,${height * 0.2} Q12,${height * 0.1} 9,0`}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
