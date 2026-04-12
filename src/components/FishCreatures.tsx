// SVG creatures used by FishTank and FishOverlay
// 10 types: 7 fish + cat + dog + pig

import type { CreatureId } from '@/types/settings'

interface CreatureProps {
  color?: string
  scale?: number
}

// ── Fish A: Tropical fish (original) ──
export function FishTropical({ color = '#f97316', scale = 1 }: CreatureProps) {
  return (
    <svg width={44 * scale} height={22 * scale} viewBox="0 0 44 22" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6,11 0,3 0,19" fill={color} opacity="0.85" />
      <ellipse cx="24" cy="11" rx="16" ry="8" fill={color} />
      <ellipse cx="24" cy="13" rx="10" ry="4" fill="rgba(255,255,255,0.18)" />
      <path d="M18,3 Q24,0 30,3" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="35" cy="9" r="2.5" fill="white" />
      <circle cx="35.8" cy="9" r="1.2" fill="#1a1a2e" />
      <circle cx="36.2" cy="8.4" r="0.4" fill="white" />
      <line x1="26" y1="3.5" x2="26" y2="18.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </svg>
  )
}

// ── Fish B: Blowfish (original) ──
export function FishBlowfish({ color = '#6366f1', scale = 1 }: CreatureProps) {
  return (
    <svg width={40 * scale} height={28 * scale} viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M6,14 L0,4 L0,24 Z" fill={color} opacity="0.8" />
      <ellipse cx="22" cy="14" rx="16" ry="12" fill={color} />
      <ellipse cx="23" cy="17" rx="10" ry="6" fill="rgba(255,255,255,0.15)" />
      {[14, 18, 22, 26, 30].map((x, i) => (
        <line key={i} x1={x} y1="2" x2={x - 1} y2="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      ))}
      <circle cx="32" cy="10" r="3" fill="white" />
      <circle cx="33" cy="10" r="1.5" fill="#0f172a" />
      <circle cx="33.5" cy="9.2" r="0.5" fill="white" />
      <path d="M37,13 Q38,15 37,17" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ── Fish C: Angel fish ──
export function FishAngel({ color = '#c084fc', scale = 1 }: CreatureProps) {
  return (
    <svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <polygon points="4,18 0,10 0,26" fill={color} opacity="0.7" />
      <ellipse cx="20" cy="18" rx="14" ry="8" fill={color} />
      {/* Tall dorsal fin */}
      <path d="M14,10 Q20,0 26,10" fill={color} opacity="0.6" />
      {/* Ventral fin */}
      <path d="M14,26 Q20,36 26,26" fill={color} opacity="0.6" />
      <ellipse cx="20" cy="20" rx="8" ry="3" fill="rgba(255,255,255,0.12)" />
      {/* Stripes */}
      <line x1="16" y1="10" x2="16" y2="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="22" y1="10" x2="22" y2="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="29" cy="16" r="2" fill="white" />
      <circle cx="29.6" cy="16" r="1" fill="#1a1a2e" />
    </svg>
  )
}

// ── Fish D: Clown fish ──
export function FishClown({ color = '#fb923c', scale = 1 }: CreatureProps) {
  return (
    <svg width={42 * scale} height={24 * scale} viewBox="0 0 42 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,12 0,4 0,20" fill={color} opacity="0.8" />
      <ellipse cx="23" cy="12" rx="16" ry="9" fill={color} />
      {/* White stripes (clown fish pattern) */}
      <rect x="14" y="3" width="3" height="18" rx="1.5" fill="white" opacity="0.6" />
      <rect x="24" y="4" width="2.5" height="16" rx="1.25" fill="white" opacity="0.5" />
      <rect x="32" y="5" width="2" height="14" rx="1" fill="white" opacity="0.4" />
      <ellipse cx="23" cy="14" rx="10" ry="4" fill="rgba(255,255,255,0.1)" />
      <path d="M17,3 Q23,0 29,3" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="35" cy="10" r="2.2" fill="white" />
      <circle cx="35.6" cy="10" r="1.1" fill="#1a1a2e" />
    </svg>
  )
}

// ── Fish E: Betta (fighting fish) ──
export function FishBetta({ color = '#e11d48', scale = 1 }: CreatureProps) {
  return (
    <svg width={50 * scale} height={32 * scale} viewBox="0 0 50 32" xmlns="http://www.w3.org/2000/svg">
      {/* Flowing tail */}
      <path d="M10,16 Q0,6 2,2 Q6,8 10,16 Q6,24 2,30 Q0,26 10,16" fill={color} opacity="0.5" />
      {/* Body */}
      <ellipse cx="26" cy="16" rx="14" ry="7" fill={color} />
      <ellipse cx="26" cy="18" rx="9" ry="3" fill="rgba(255,255,255,0.12)" />
      {/* Flowing dorsal */}
      <path d="M18,9 Q22,0 30,5 Q34,2 38,7" fill={color} opacity="0.45" />
      {/* Flowing ventral */}
      <path d="M20,23 Q24,30 30,26" fill={color} opacity="0.4" />
      <circle cx="36" cy="14" r="2" fill="white" />
      <circle cx="36.5" cy="14" r="1" fill="#1a1a2e" />
      <circle cx="36.8" cy="13.5" r="0.3" fill="white" />
    </svg>
  )
}

// ── Fish F: Goldfish ──
export function FishGoldfish({ color = '#f59e0b', scale = 1 }: CreatureProps) {
  return (
    <svg width={44 * scale} height={28 * scale} viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg">
      {/* Fan tail */}
      <path d="M8,14 Q0,4 2,0 Q4,6 8,14 Q4,22 2,28 Q0,24 8,14" fill={color} opacity="0.6" />
      {/* Body */}
      <ellipse cx="24" cy="14" rx="16" ry="10" fill={color} />
      <ellipse cx="24" cy="16" rx="12" ry="5" fill="rgba(255,255,255,0.15)" />
      {/* Top fin */}
      <path d="M16,4 Q22,1 28,4" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Scales effect */}
      <ellipse cx="20" cy="12" rx="4" ry="3" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="28" cy="12" rx="4" ry="3" fill="rgba(255,255,255,0.08)" />
      {/* Big eye */}
      <circle cx="36" cy="11" r="3" fill="white" />
      <circle cx="36.8" cy="11" r="1.5" fill="#1a1a2e" />
      <circle cx="37.2" cy="10.3" r="0.5" fill="white" />
    </svg>
  )
}

// ── Fish G: Koi ──
export function FishKoi({ color = '#dc2626', scale = 1 }: CreatureProps) {
  return (
    <svg width={52 * scale} height={24 * scale} viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg">
      {/* Tail */}
      <path d="M6,12 Q0,4 2,0 Q5,6 6,12 Q5,18 2,24 Q0,20 6,12" fill={color} opacity="0.7" />
      {/* Body */}
      <ellipse cx="28" cy="12" rx="20" ry="9" fill="white" />
      {/* Koi patches */}
      <ellipse cx="20" cy="10" rx="7" ry="5" fill={color} opacity="0.8" />
      <ellipse cx="32" cy="14" rx="5" ry="4" fill={color} opacity="0.6" />
      <ellipse cx="14" cy="14" rx="4" ry="3" fill={color} opacity="0.5" />
      {/* Outline */}
      <ellipse cx="28" cy="12" rx="20" ry="9" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Whiskers */}
      <line x1="44" y1="10" x2="50" y2="8" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <line x1="44" y1="14" x2="50" y2="16" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      {/* Eye */}
      <circle cx="42" cy="10" r="2.5" fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <circle cx="42.5" cy="10" r="1.2" fill="#1a1a2e" />
    </svg>
  )
}

// ── Cat ──
export function CatCreature({ color = '#f97316', scale = 1 }: CreatureProps) {
  return (
    <svg width={40 * scale} height={28 * scale} viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      {/* Tail */}
      <path d="M5,16 Q0,10 3,6 Q5,10 8,14" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="18" cy="18" rx="12" ry="7" fill={color} />
      {/* Head */}
      <circle cx="32" cy="13" r="7" fill={color} />
      {/* Ears */}
      <polygon points="26,6 28,1 31,7" fill={color} />
      <polygon points="33,7 36,1 38,6" fill={color} />
      <polygon points="27,6.5 28.5,3 30,7" fill="rgba(255,180,180,0.5)" />
      <polygon points="34,7 35.5,3 37,6.5" fill="rgba(255,180,180,0.5)" />
      {/* Belly */}
      <ellipse cx="18" cy="20" rx="8" ry="4" fill="rgba(255,255,255,0.15)" />
      {/* Eyes */}
      <ellipse cx="30" cy="12" rx="1.5" ry="2" fill="#22c55e" />
      <ellipse cx="34" cy="12" rx="1.5" ry="2" fill="#22c55e" />
      <ellipse cx="30" cy="12" rx="0.7" ry="2" fill="#1a1a2e" />
      <ellipse cx="34" cy="12" rx="0.7" ry="2" fill="#1a1a2e" />
      {/* Nose */}
      <polygon points="31.5,14 32.5,14 32,15" fill="#f9a8d4" />
      {/* Whiskers */}
      <line x1="28" y1="14.5" x2="23" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="28" y1="15.5" x2="23" y2="16" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="36" y1="14.5" x2="40" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <line x1="36" y1="15.5" x2="40" y2="16" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      {/* Legs */}
      <rect x="10" y="23" width="3" height="5" rx="1.5" fill={color} />
      <rect x="20" y="23" width="3" height="5" rx="1.5" fill={color} />
    </svg>
  )
}

// ── Dog ──
export function DogCreature({ color = '#a16207', scale = 1 }: CreatureProps) {
  return (
    <svg width={44 * scale} height={28 * scale} viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg">
      {/* Tail (wagging) */}
      <path d="M4,12 Q0,6 3,3" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="18" cy="17" rx="13" ry="8" fill={color} />
      {/* Head */}
      <circle cx="34" cy="12" r="7.5" fill={color} />
      {/* Snout */}
      <ellipse cx="40" cy="14" rx="4" ry="3" fill={color} />
      <ellipse cx="40" cy="14" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.1)" />
      {/* Ears (floppy) */}
      <ellipse cx="28" cy="8" rx="4" ry="6" fill={color} transform="rotate(-20 28 8)" opacity="0.8" />
      <ellipse cx="38" cy="6" rx="3" ry="5" fill={color} transform="rotate(15 38 6)" opacity="0.8" />
      {/* Belly */}
      <ellipse cx="18" cy="20" rx="9" ry="4" fill="rgba(255,255,255,0.12)" />
      {/* Eyes */}
      <circle cx="31.5" cy="10.5" r="2" fill="white" />
      <circle cx="36" cy="10.5" r="2" fill="white" />
      <circle cx="31.8" cy="10.5" r="1.2" fill="#1a1a2e" />
      <circle cx="36.3" cy="10.5" r="1.2" fill="#1a1a2e" />
      <circle cx="32.1" cy="10" r="0.4" fill="white" />
      <circle cx="36.6" cy="10" r="0.4" fill="white" />
      {/* Nose */}
      <ellipse cx="42" cy="13" rx="1.5" ry="1.2" fill="#1a1a2e" />
      {/* Mouth */}
      <path d="M41,15 Q42,16.5 43,15" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" fill="none" />
      {/* Tongue */}
      <ellipse cx="42" cy="16.5" rx="1" ry="1.5" fill="#f9a8d4" />
      {/* Legs */}
      <rect x="9" y="23" width="3" height="5" rx="1.5" fill={color} />
      <rect x="22" y="23" width="3" height="5" rx="1.5" fill={color} />
    </svg>
  )
}

// ── Pig ──
export function PigCreature({ color = '#f9a8d4', scale = 1 }: CreatureProps) {
  return (
    <svg width={42 * scale} height={28 * scale} viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg">
      {/* Curly tail */}
      <path d="M4,14 Q0,10 2,7 Q4,10 5,12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="20" cy="16" rx="14" ry="9" fill={color} />
      <ellipse cx="20" cy="19" rx="10" ry="5" fill="rgba(255,255,255,0.12)" />
      {/* Head */}
      <circle cx="34" cy="13" r="7" fill={color} />
      {/* Ears */}
      <ellipse cx="29" cy="6" rx="3" ry="4" fill={color} transform="rotate(-15 29 6)" />
      <ellipse cx="37" cy="5" rx="3" ry="4" fill={color} transform="rotate(15 37 5)" />
      <ellipse cx="29" cy="6.5" rx="2" ry="2.5" fill="rgba(255,150,180,0.5)" transform="rotate(-15 29 6.5)" />
      <ellipse cx="37" cy="5.5" rx="2" ry="2.5" fill="rgba(255,150,180,0.5)" transform="rotate(15 37 5.5)" />
      {/* Snout */}
      <ellipse cx="38" cy="14" rx="4" ry="3" fill="#f472b6" />
      <circle cx="36.5" cy="14" r="1" fill="#be185d" />
      <circle cx="39.5" cy="14" r="1" fill="#be185d" />
      {/* Eyes */}
      <circle cx="31" cy="11" r="2" fill="white" />
      <circle cx="35.5" cy="11" r="2" fill="white" />
      <circle cx="31.3" cy="11" r="1" fill="#1a1a2e" />
      <circle cx="35.8" cy="11" r="1" fill="#1a1a2e" />
      {/* Rosy cheeks */}
      <circle cx="30" cy="15" r="2" fill="rgba(255,100,150,0.25)" />
      <circle cx="37" cy="15" r="2" fill="rgba(255,100,150,0.25)" />
      {/* Legs */}
      <rect x="10" y="23" width="3" height="5" rx="1.5" fill={color} />
      <rect x="24" y="23" width="3" height="5" rx="1.5" fill={color} />
    </svg>
  )
}

// ── Shrimp (kept from original) ──
export function Shrimp({ scale = 1 }: { scale?: number }) {
  return (
    <svg width={36 * scale} height={28 * scale} viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M28,7 L36,2 M28,7 L33,0" stroke="#ff9a6c" strokeWidth="1" strokeLinecap="round" />
      <circle cx="26" cy="8" r="5" fill="#ff7043" />
      <circle cx="28" cy="6.5" r="1.8" fill="#1a1a2e" />
      <circle cx="28.5" cy="6" r="0.5" fill="white" />
      <path d="M22,10 Q18,12 14,16 Q10,20 6,22 Q3,24 2,26"
        stroke="#ff7043" strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22,10 Q18,12 14,16 Q10,20 6,22 Q3,24 2,26"
        stroke="rgba(255,200,180,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[0, 0.2, 0.4, 0.6, 0.8].map((t, i) => {
        const x = 22 - t * 20
        const y = 10 + t * 16
        return <circle key={i} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.2)" />
      })}
      <path d="M2,26 L-2,22 M2,26 L-1,28 M2,26 L4,30"
        stroke="#ff7043" strokeWidth="2" strokeLinecap="round" />
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

// ── Seaweed (unchanged) ──
export function Seaweed({ height = 40, color = '#15803d' }: { height?: number; color?: string }) {
  return (
    <svg width={18} height={height} viewBox={`0 0 18 ${height}`} xmlns="http://www.w3.org/2000/svg" className="seaweed">
      <path
        d={`M9,${height} Q14,${height * 0.8} 9,${height * 0.6} Q4,${height * 0.4} 9,${height * 0.2} Q12,${height * 0.1} 9,0`}
        stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"
      />
    </svg>
  )
}

// ── Backward-compatible aliases ──
export const FishA = FishTropical
export const FishB = FishBlowfish

// ── Render any creature by ID ──
const DEFAULT_COLORS: Partial<Record<CreatureId, string>> = {
  'fish-tropical': '#f97316',
  'fish-blowfish': '#6366f1',
  'fish-angel':    '#c084fc',
  'fish-clown':    '#fb923c',
  'fish-betta':    '#e11d48',
  'fish-goldfish': '#f59e0b',
  'fish-koi':      '#dc2626',
  'cat':           '#f97316',
  'dog':           '#a16207',
  'pig':           '#f9a8d4',
}

const COMPONENTS: Record<CreatureId, React.FC<CreatureProps>> = {
  'fish-tropical': FishTropical,
  'fish-blowfish': FishBlowfish,
  'fish-angel':    FishAngel,
  'fish-clown':    FishClown,
  'fish-betta':    FishBetta,
  'fish-goldfish': FishGoldfish,
  'fish-koi':      FishKoi,
  'cat':           CatCreature,
  'dog':           DogCreature,
  'pig':           PigCreature,
}

export function renderCreatureById(
  id: CreatureId,
  scale: number,
  facingRight: boolean,
  color?: string,
) {
  const Comp = COMPONENTS[id]
  if (!Comp) return null
  const c = color ?? DEFAULT_COLORS[id]
  const flip: React.CSSProperties = {
    transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
    display: 'block',
  }
  return <div style={flip}><Comp color={c} scale={scale} /></div>
}
