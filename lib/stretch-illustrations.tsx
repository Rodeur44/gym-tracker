'use client'

import type { FC } from 'react'

type P = { color: string }

// Filled capsule (limb) between two points — the building block of every figure
function Limb({ x1, y1, x2, y2, w = 7 }: { x1: number | string; y1: number | string; x2: number | string; y2: number | string; w?: number }) {
  const [_x1, _y1, _x2, _y2] = [Number(x1), Number(y1), Number(x2), Number(y2)]
  const dx = _x2 - _x1, dy = _y2 - _y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const cx = (_x1 + _x2) / 2, cy = (_y1 + _y2) / 2
  return (
    <rect
      x={cx - len / 2} y={cy - w / 2}
      width={len} height={w} rx={w / 2}
      transform={`rotate(${angle},${cx},${cy})`}
    />
  )
}

// Ground line for floor poses
function Floor({ color }: { color: string }) {
  return <line x1="8" y1="93" x2="92" y2="93" stroke={color} strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
}

// Reusable standing base: head + torso
function StandHead() { return <circle cx="50" cy="10" r="7" /> }
function StandTorso() { return <Limb x1="50" y1="17" x2="50" y2="58" w={14} /> }
function StandLegs() {
  return (
    <>
      <Limb x1="46" y1="58" x2="40" y2="76" w={8} />
      <Limb x1="40" y1="76" x2="37" y2="92" w={6} />
      <Limb x1="54" y1="58" x2="60" y2="76" w={8} />
      <Limb x1="60" y1="76" x2="63" y2="92" w={6} />
    </>
  )
}

function Svg({ color, children }: P & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" fill={color} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  )
}

// ── 1. Doorway pec stretch ────────────────────────────────────────
export const PecDoor: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* door frames */}
    <line x1="10" y1="2" x2="10" y2="95" stroke={color} strokeWidth="3" strokeOpacity="0.2" strokeLinecap="round" />
    <line x1="90" y1="2" x2="90" y2="95" stroke={color} strokeWidth="3" strokeOpacity="0.2" strokeLinecap="round" />
    <StandHead />
    <StandTorso />
    {/* upper arms horizontal */}
    <Limb x1="43" y1="25" x2="13" y2="25" w={6} />
    <Limb x1="57" y1="25" x2="87" y2="25" w={6} />
    {/* forearms vertical (against door) */}
    <Limb x1="13" y1="25" x2="13" y2="10" w={5} />
    <Limb x1="87" y1="25" x2="87" y2="10" w={5} />
    <StandLegs />
  </Svg>
)

// ── 2. Lying arms cross (croix au sol) ───────────────────────────
export const LyingCross: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* lying horizontally, head left */}
    <circle cx="9" cy="64" r="6" />
    <Limb x1="15" y1="64" x2="75" y2="64" w={13} />
    {/* arms spread perpendicular upward/downward */}
    <Limb x1="35" y1="64" x2="30" y2="40" w={6} />
    <Limb x1="35" y1="64" x2="30" y2="88" w={5} />
    {/* legs slightly apart */}
    <Limb x1="75" y1="64" x2="83" y2="52" w={7} />
    <Limb x1="75" y1="64" x2="83" y2="76" w={7} />
  </Svg>
)

// ── 3. Cross-body shoulder ────────────────────────────────────────
export const CrossArm: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* right arm crossing to the left */}
    <Limb x1="57" y1="26" x2="72" y2="26" w={6} />
    <Limb x1="72" y1="26" x2="24" y2="34" w={5} />
    {/* left forearm holding the right arm */}
    <Limb x1="43" y1="26" x2="30" y2="26" w={6} />
    <Limb x1="30" y1="26" x2="32" y2="40" w={5} />
    <StandLegs />
  </Svg>
)

// ── 4. Hands clasped behind back ─────────────────────────────────
export const HandsBehind: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* both arms swept behind and down, hands meeting at lower back */}
    <Limb x1="43" y1="26" x2="28" y2="30" w={6} />
    <Limb x1="28" y1="30" x2="42" y2="55" w={5} />
    <Limb x1="57" y1="26" x2="72" y2="30" w={6} />
    <Limb x1="72" y1="30" x2="58" y2="55" w={5} />
    {/* clasped hands */}
    <circle cx="50" cy="57" r="4" />
    <StandLegs />
  </Svg>
)

// ── 5. Child's pose ───────────────────────────────────────────────
export const ChildPose: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* kneeling: butt on heels (right), torso forward (left), arms extended */}
    {/* heels & shins */}
    <Limb x1="22" y1="80" x2="30" y2="66" w={7} />
    <Limb x1="30" y1="66" x2="42" y2="56" w={8} />
    {/* torso going forward-left */}
    <Limb x1="42" y1="56" x2="72" y2="49" w={13} />
    {/* arms extended forward */}
    <Limb x1="66" y1="47" x2="86" y2="44" w={5} />
    <Limb x1="66" y1="51" x2="86" y2="54" w={5} />
    {/* head resting low */}
    <circle cx="88" cy="49" r="6" />
  </Svg>
)

// ── 6. Cat stretch (all fours, rounded back) ─────────────────────
export const CatStretch: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* front arms */}
    <Limb x1="22" y1="60" x2="22" y2="80" w={6} />
    {/* back legs */}
    <Limb x1="78" y1="60" x2="78" y2="80" w={6} />
    {/* arched spine as a wide limb with curve approximated */}
    <Limb x1="22" y1="60" x2="38" y2="50" w={12} />
    <Limb x1="38" y1="50" x2="62" y2="50" w={12} />
    <Limb x1="62" y1="50" x2="78" y2="60" w={12} />
    {/* head down */}
    <circle cx="17" cy="57" r="6" />
    <Limb x1="17" y1="63" x2="22" y2="66" w={5} />
  </Svg>
)

// ── 7. Lateral bend / lat stretch standing ───────────────────────
export const SideBend: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* body leaning right */}
    <circle cx="54" cy="10" r="7" />
    <Limb x1="54" y1="17" x2="56" y2="58" w={14} />
    {/* right arm raised up and over toward left */}
    <Limb x1="63" y1="24" x2="74" y2="24" w={6} />
    <Limb x1="74" y1="24" x2="68" y2="8"  w={5} />
    {/* left arm relaxed along body */}
    <Limb x1="47" y1="26" x2="36" y2="28" w={6} />
    <Limb x1="36" y1="28" x2="30" y2="44" w={5} />
    {/* legs */}
    <Limb x1="52" y1="58" x2="44" y2="77" w={8} />
    <Limb x1="44" y1="77" x2="40" y2="93" w={6} />
    <Limb x1="60" y1="58" x2="66" y2="77" w={8} />
    <Limb x1="66" y1="77" x2="68" y2="93" w={6} />
  </Svg>
)

// ── 8. Seated spinal twist ───────────────────────────────────────
export const SeatedTwist: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    <circle cx="50" cy="10" r="7" />
    <Limb x1="50" y1="17" x2="50" y2="56" w={14} />
    {/* right arm crossing over to push left knee */}
    <Limb x1="57" y1="25" x2="68" y2="26" w={6} />
    <Limb x1="68" y1="26" x2="30" y2="45" w={5} />
    {/* left arm behind for support */}
    <Limb x1="43" y1="25" x2="28" y2="26" w={6} />
    <Limb x1="28" y1="26" x2="18" y2="46" w={5} />
    {/* legs: one extended left, one bent right */}
    <Limb x1="44" y1="56" x2="22" y2="65" w={8} />
    <Limb x1="22" y1="65" x2="14" y2="80" w={6} />
    <Limb x1="56" y1="56" x2="70" y2="65" w={8} />
    <Limb x1="70" y1="65" x2="74" y2="80" w={6} />
  </Svg>
)

// ── 9. Knees to chest (lying) ────────────────────────────────────
export const KneesChest: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* lying on back, head left */}
    <circle cx="9" cy="68" r="6" />
    <Limb x1="15" y1="68" x2="65" y2="68" w={13} />
    {/* both knees pulled up toward chest */}
    <Limb x1="65" y1="68" x2="54" y2="50" w={8} />
    <Limb x1="54" y1="50" x2="40" y2="48" w={6} />
    <Limb x1="65" y1="68" x2="58" y2="48" w={8} />
    <Limb x1="58" y1="48" x2="44" y2="44" w={6} />
    {/* arms hugging knees */}
    <Limb x1="25" y1="64" x2="42" y2="50" w={5} />
    <Limb x1="25" y1="72" x2="42" y2="58" w={5} />
  </Svg>
)

// ── 10. Tricep overhead stretch ───────────────────────────────────
export const TricepStretch: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* right arm: upper arm goes up, forearm bends behind head */}
    <Limb x1="57" y1="26" x2="64" y2="26" w={6} />
    <Limb x1="64" y1="26" x2="66" y2="9"  w={5} />
    <Limb x1="66" y1="9"  x2="54" y2="20" w={5} />
    {/* left arm reaching up to push right elbow */}
    <Limb x1="43" y1="26" x2="32" y2="24" w={6} />
    <Limb x1="32" y1="24" x2="42" y2="10" w={5} />
    <StandLegs />
  </Svg>
)

// ── 11. Bicep wall stretch ────────────────────────────────────────
export const BicepWall: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* wall */}
    <line x1="88" y1="0" x2="88" y2="100" stroke={color} strokeWidth="3" strokeOpacity="0.2" strokeLinecap="round" />
    <StandHead />
    <StandTorso />
    {/* right arm fully extended back onto wall */}
    <Limb x1="57" y1="26" x2="72" y2="26" w={6} />
    <Limb x1="72" y1="26" x2="85" y2="26" w={5} />
    {/* left arm relaxed */}
    <Limb x1="43" y1="26" x2="30" y2="26" w={6} />
    <Limb x1="30" y1="26" x2="22" y2="42" w={5} />
    <StandLegs />
  </Svg>
)

// ── 12. Wrist extension (forearm) ────────────────────────────────
export const WristExtension: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* right arm extended forward */}
    <Limb x1="57" y1="26" x2="70" y2="26" w={6} />
    <Limb x1="70" y1="26" x2="84" y2="26" w={5} />
    {/* wrist bent upward */}
    <Limb x1="84" y1="26" x2="88" y2="15" w={4} />
    {/* left arm reaching to push right wrist */}
    <Limb x1="43" y1="26" x2="30" y2="24" w={6} />
    <Limb x1="30" y1="24" x2="80" y2="20" w={4} />
    <StandLegs />
  </Svg>
)

// ── 13. Low lunge (hip flexor) ───────────────────────────────────
export const LowLunge: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* torso upright, centered between legs */}
    <circle cx="46" cy="13" r="7" />
    <Limb x1="46" y1="20" x2="46" y2="52" w={13} />
    {/* arms on thighs / relaxed */}
    <Limb x1="52" y1="28" x2="62" y2="42" w={5} />
    <Limb x1="40" y1="28" x2="32" y2="42" w={5} />
    {/* front leg (right): thigh forward, shin vertical */}
    <Limb x1="52" y1="52" x2="63" y2="65" w={8} />
    <Limb x1="63" y1="65" x2="63" y2="90" w={6} />
    {/* back leg (left): thigh back, knee on floor */}
    <Limb x1="40" y1="52" x2="26" y2="65" w={8} />
    <Limb x1="26" y1="65" x2="22" y2="88" w={6} />
  </Svg>
)

// ── 14. Standing forward bend (hamstrings) ───────────────────────
export const ForwardBend: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* straight legs standing */}
    <Limb x1="36" y1="90" x2="38" y2="72" w={7} />
    <Limb x1="38" y1="72" x2="42" y2="56" w={8} />
    <Limb x1="52" y1="90" x2="54" y2="72" w={7} />
    <Limb x1="54" y1="72" x2="58" y2="56" w={8} />
    {/* torso bent forward (horizontal toward right) */}
    <Limb x1="50" y1="56" x2="76" y2="52" w={13} />
    {/* arms hanging toward floor */}
    <Limb x1="72" y1="52" x2="68" y2="74" w={5} />
    <Limb x1="72" y1="52" x2="78" y2="74" w={5} />
    {/* head hanging down */}
    <circle cx="80" cy="48" r="6" />
  </Svg>
)

// ── 15. Pigeon pose ───────────────────────────────────────────────
export const PigeonPose: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* front leg bent at 90° on floor */}
    <Limb x1="28" y1="82" x2="38" y2="65" w={7} />
    <Limb x1="38" y1="65" x2="50" y2="52" w={8} />
    {/* back leg extended behind */}
    <Limb x1="50" y1="52" x2="66" y2="65" w={8} />
    <Limb x1="66" y1="65" x2="80" y2="82" w={6} />
    {/* upright torso */}
    <Limb x1="50" y1="52" x2="49" y2="22" w={13} />
    <circle cx="49" cy="15" r="7" />
    {/* arms forward/down supporting */}
    <Limb x1="43" y1="28" x2="32" y2="30" w={5} />
    <Limb x1="32" y1="30" x2="24" y2="48" w={5} />
    <Limb x1="55" y1="28" x2="66" y2="30" w={5} />
    <Limb x1="66" y1="30" x2="72" y2="48" w={5} />
  </Svg>
)

// ── 16. Standing quad stretch ────────────────────────────────────
export const QuadStretch: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    <StandHead />
    <StandTorso />
    {/* left arm out for balance */}
    <Limb x1="43" y1="26" x2="28" y2="26" w={6} />
    <Limb x1="28" y1="26" x2="18" y2="40" w={5} />
    {/* right arm reaching back to hold foot */}
    <Limb x1="57" y1="26" x2="70" y2="26" w={6} />
    <Limb x1="70" y1="26" x2="76" y2="52" w={5} />
    {/* standing (left) leg */}
    <Limb x1="46" y1="58" x2="42" y2="78" w={8} />
    <Limb x1="42" y1="78" x2="40" y2="92" w={6} />
    {/* raised (right) leg: thigh going back, shin up */}
    <Limb x1="54" y1="58" x2="64" y2="70" w={8} />
    <Limb x1="64" y1="70" x2="68" y2="50" w={6} />
    {/* hand meeting foot */}
    <circle cx="70" cy="50" r="3" />
  </Svg>
)

// ── 17. Calf stretch against wall ────────────────────────────────
export const CalfWall: FC<P> = ({ color }) => (
  <Svg color={color}>
    <line x1="88" y1="0" x2="88" y2="100" stroke={color} strokeWidth="3" strokeOpacity="0.2" strokeLinecap="round" />
    <Floor color={color} />
    {/* body leaning forward toward wall */}
    <circle cx="48" cy="13" r="7" />
    <Limb x1="50" y1="20" x2="56" y2="52" w={13} />
    {/* arms on wall */}
    <Limb x1="56" y1="28" x2="68" y2="26" w={5} />
    <Limb x1="68" y1="26" x2="84" y2="32" w={5} />
    {/* front leg bent */}
    <Limb x1="58" y1="52" x2="64" y2="68" w={8} />
    <Limb x1="64" y1="68" x2="62" y2="90" w={6} />
    {/* back leg straight, heel down */}
    <Limb x1="50" y1="52" x2="40" y2="65" w={8} />
    <Limb x1="40" y1="65" x2="32" y2="90" w={6} />
  </Svg>
)

// ── 18. Butterfly (adductors) ─────────────────────────────────────
export const Butterfly: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    <circle cx="50" cy="10" r="7" />
    <Limb x1="50" y1="17" x2="50" y2="54" w={13} />
    {/* left leg: thigh out and down, foot toward center */}
    <Limb x1="44" y1="54" x2="20" y2="70" w={8} />
    <Limb x1="20" y1="70" x2="44" y2="83" w={6} />
    {/* right leg: symmetric */}
    <Limb x1="56" y1="54" x2="80" y2="70" w={8} />
    <Limb x1="80" y1="70" x2="56" y2="83" w={6} />
    {/* soles touching */}
    <Limb x1="44" y1="83" x2="56" y2="83" w={5} />
    {/* arms pressing knees down */}
    <Limb x1="43" y1="35" x2="28" y2="38" w={5} />
    <Limb x1="28" y1="38" x2="20" y2="70" w={4} />
    <Limb x1="57" y1="35" x2="72" y2="38" w={5} />
    <Limb x1="72" y1="38" x2="80" y2="70" w={4} />
  </Svg>
)

// ── 19. Lying spinal twist ────────────────────────────────────────
export const LyingTwist: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Floor color={color} />
    {/* lying on back, head left */}
    <circle cx="9" cy="60" r="6" />
    <Limb x1="15" y1="60" x2="70" y2="60" w={13} />
    {/* top arm spread out */}
    <Limb x1="32" y1="60" x2="28" y2="40" w={5} />
    {/* bottom arm spread out other side */}
    <Limb x1="32" y1="60" x2="28" y2="80" w={5} />
    {/* left leg straight */}
    <Limb x1="70" y1="60" x2="82" y2="52" w={8} />
    <Limb x1="82" y1="52" x2="90" y2="46" w={6} />
    {/* right knee crossed over to left */}
    <Limb x1="70" y1="60" x2="76" y2="74" w={8} />
    <Limb x1="76" y1="74" x2="55" y2="82" w={6} />
  </Svg>
)

// ── 20. Hip rotation standing ────────────────────────────────────
export const HipCircle: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* hands on hips */}
    <Limb x1="43" y1="34" x2="30" y2="38" w={5} />
    <Limb x1="30" y1="38" x2="36" y2="52" w={5} />
    <Limb x1="57" y1="34" x2="70" y2="38" w={5} />
    <Limb x1="70" y1="38" x2="64" y2="52" w={5} />
    {/* hip rotation arc */}
    <path d="M 36,54 A 16,9 0 0 1 64,54" fill="none" stroke={color} strokeWidth="2.5" strokeOpacity="0.5" strokeLinecap="round" />
    <Limb x1="63" y1="54" x2="59" y2="47" w={3} />
    <StandLegs />
  </Svg>
)

// ── 21. Wrist rotation (poignets) ────────────────────────────────
export const WristRotation: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* arms extended forward */}
    <Limb x1="43" y1="26" x2="28" y2="26" w={6} />
    <Limb x1="28" y1="26" x2="14" y2="30" w={5} />
    <Limb x1="57" y1="26" x2="72" y2="26" w={6} />
    <Limb x1="72" y1="26" x2="86" y2="30" w={5} />
    {/* wrist rotation circles */}
    <circle cx="12" cy="30" r="5" fillOpacity="0.3" />
    <circle cx="88" cy="30" r="5" fillOpacity="0.3" />
    <Limb x1="12" y1="25" x2="15" y2="20" w={2.5} />
    <Limb x1="88" y1="25" x2="85" y2="20" w={2.5} />
    <StandLegs />
  </Svg>
)

// ── 22. One arm overhead ──────────────────────────────────────────
export const ArmOverhead: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StandHead />
    <StandTorso />
    {/* right arm straight up overhead */}
    <Limb x1="57" y1="26" x2="64" y2="26" w={6} />
    <Limb x1="64" y1="26" x2="68" y2="8"  w={5} />
    {/* left arm relaxed down */}
    <Limb x1="43" y1="26" x2="30" y2="28" w={6} />
    <Limb x1="30" y1="28" x2="22" y2="44" w={5} />
    <StandLegs />
  </Svg>
)

// ── Illustration map ──────────────────────────────────────────────
export const ILLUSTRATIONS: Record<string, FC<P>> = {
  pec_door: PecDoor,
  pec_lying: LyingCross,
  cross_arm: CrossArm,
  hands_behind: HandsBehind,
  child_pose: ChildPose,
  cat_stretch: CatStretch,
  side_bend: SideBend,
  seat_twist: SeatedTwist,
  knees_chest: KneesChest,
  tricep: TricepStretch,
  bicep_wall: BicepWall,
  wrist_ext: WristExtension,
  low_lunge: LowLunge,
  forward_bend: ForwardBend,
  pigeon: PigeonPose,
  quad_standing: QuadStretch,
  calf_wall: CalfWall,
  butterfly: Butterfly,
  lying_twist: LyingTwist,
  hip_circle: HipCircle,
  wrist_rotation: WristRotation,
  arm_overhead: ArmOverhead,
}
