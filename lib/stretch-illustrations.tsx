'use client'

import type { FC, ReactNode } from 'react'

type P = { color: string }

function Svg({ color, children }: P & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="100%" height="100%">
      <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

// ── Shared sub-components (inherit stroke from parent <g>) ────────

function StdHead() { return <circle cx="50" cy="12" r="7" /> }
function StdBody() { return <line x1="50" y1="19" x2="50" y2="60" /> }
function StdLegs() {
  return (
    <>
      <line x1="50" y1="60" x2="41" y2="88" />
      <line x1="50" y1="60" x2="59" y2="88" />
    </>
  )
}
function Ground() {
  return <line x1="8" y1="91" x2="92" y2="91" strokeOpacity="0.2" />
}

// ── 1. Pec doorway stretch ────────────────────────────────────────
export const PecDoor: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* door frames */}
    <line x1="10" y1="0" x2="10" y2="95" strokeOpacity="0.2" strokeDasharray="3,3" />
    <line x1="90" y1="0" x2="90" y2="95" strokeOpacity="0.2" strokeDasharray="3,3" />
    <StdHead />
    <StdBody />
    {/* arms: upper arm horizontal, forearm up against door */}
    <line x1="50" y1="27" x2="13" y2="27" />
    <line x1="13" y1="27" x2="13" y2="10" />
    <line x1="50" y1="27" x2="87" y2="27" />
    <line x1="87" y1="27" x2="87" y2="10" />
    <StdLegs />
  </Svg>
)

// ── 2. Lying arms cross (croix au sol) ───────────────────────────
export const LyingCross: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* body horizontal, head on left */}
    <circle cx="10" cy="64" r="6" />
    <line x1="16" y1="64" x2="80" y2="64" />
    {/* arms spread perpendicular from shoulders (x≈30) */}
    <line x1="32" y1="64" x2="28" y2="38" />
    <line x1="32" y1="64" x2="28" y2="90" />
    {/* legs spread from hips (x≈72) */}
    <line x1="72" y1="64" x2="80" y2="50" />
    <line x1="72" y1="64" x2="80" y2="78" />
  </Svg>
)

// ── 3. Cross-body shoulder stretch ───────────────────────────────
export const CrossArm: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* right arm crossing chest to left */}
    <line x1="50" y1="27" x2="68" y2="27" />
    <line x1="68" y1="27" x2="22" y2="36" />
    {/* left arm bent, hand holding right arm at elbow */}
    <line x1="50" y1="27" x2="32" y2="30" />
    <line x1="32" y1="30" x2="28" y2="42" />
    <StdLegs />
  </Svg>
)

// ── 4. Hands clasped behind back ─────────────────────────────────
export const HandsBehind: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* arms going behind lower back, hands meeting */}
    <line x1="50" y1="27" x2="30" y2="32" />
    <line x1="30" y1="32" x2="38" y2="58" />
    <line x1="50" y1="27" x2="70" y2="32" />
    <line x1="70" y1="32" x2="62" y2="58" />
    {/* clasped hands indicator */}
    <circle cx="50" cy="60" r="3" />
    <StdLegs />
  </Svg>
)

// ── 5. Child's pose ───────────────────────────────────────────────
export const ChildPose: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* side view facing right: butt left, head right */}
    {/* heels/feet on left */}
    <line x1="18" y1="78" x2="22" y2="68" />
    <line x1="22" y1="68" x2="28" y2="58" />
    {/* spine goes forward-right */}
    <line x1="28" y1="58" x2="65" y2="50" />
    {/* arms extended right */}
    <line x1="60" y1="51" x2="80" y2="49" />
    <line x1="60" y1="53" x2="80" y2="56" />
    {/* head resting forward */}
    <circle cx="83" cy="56" r="6" />
    {/* knees on floor */}
    <line x1="28" y1="58" x2="32" y2="75" />
    <line x1="22" y1="68" x2="35" y2="78" />
  </Svg>
)

// ── 6. Cat stretch (all fours, back rounded) ─────────────────────
export const CatStretch: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* side view — on all fours */}
    {/* back arched upward (cat shape) */}
    <path d="M 20,60 Q 50,30 80,60" fill="none" />
    {/* head down */}
    <circle cx="18" cy="66" r="6" />
    <line x1="18" y1="60" x2="20" y2="60" />
    {/* arms (front) */}
    <line x1="22" y1="60" x2="22" y2="80" />
    {/* legs (back) */}
    <line x1="78" y1="60" x2="78" y2="80" />
    {/* indicate back knee */}
    <line x1="62" y1="60" x2="62" y2="78" />
  </Svg>
)

// ── 7. Lateral bend / lat stretch standing ───────────────────────
export const SideBend: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* body leaning left */}
    <circle cx="52" cy="12" r="7" />
    <path d="M 52,19 Q 50,40 44,60" fill="none" />
    {/* right arm raised up and over */}
    <line x1="59" y1="26" x2="68" y2="27" />
    <line x1="68" y1="27" x2="60" y2="10" />
    {/* left arm down along side */}
    <line x1="47" y1="26" x2="36" y2="28" />
    <line x1="36" y1="28" x2="30" y2="42" />
    {/* legs */}
    <line x1="44" y1="60" x2="36" y2="88" />
    <line x1="44" y1="60" x2="54" y2="88" />
  </Svg>
)

// ── 8. Seated spinal twist ───────────────────────────────────────
export const SeatedTwist: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    <StdHead />
    <StdBody />
    {/* right arm crossing over to left side */}
    <line x1="50" y1="27" x2="68" y2="28" />
    <line x1="68" y1="28" x2="28" y2="45" />
    {/* left arm behind for support */}
    <line x1="50" y1="27" x2="32" y2="28" />
    <line x1="32" y1="28" x2="22" y2="44" />
    {/* legs: one extended, one bent */}
    <line x1="50" y1="60" x2="30" y2="65" />
    <line x1="30" y1="65" x2="15" y2="78" />
    <line x1="50" y1="60" x2="68" y2="65" />
    <line x1="68" y1="65" x2="72" y2="80" />
  </Svg>
)

// ── 9. Knees to chest (lying) ────────────────────────────────────
export const KneesChest: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* lying on back, head on left */}
    <circle cx="10" cy="68" r="6" />
    <line x1="16" y1="68" x2="60" y2="68" />
    {/* both knees pulled to chest */}
    <line x1="60" y1="68" x2="52" y2="50" />
    <line x1="52" y1="50" x2="38" y2="50" />
    <line x1="60" y1="68" x2="56" y2="48" />
    <line x1="56" y1="48" x2="42" y2="48" />
    {/* arms holding knees */}
    <line x1="28" y1="65" x2="40" y2="52" />
    <line x1="28" y1="71" x2="40" y2="58" />
  </Svg>
)

// ── 10. Tricep overhead stretch ───────────────────────────────────
export const TricepStretch: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* right arm bent overhead: upper arm up, forearm behind head */}
    <line x1="50" y1="27" x2="58" y2="28" />
    <line x1="58" y1="28" x2="62" y2="10" />
    <line x1="62" y1="10" x2="54" y2="22" />
    {/* left arm reaching up to push right elbow */}
    <line x1="50" y1="27" x2="35" y2="25" />
    <line x1="35" y1="25" x2="40" y2="12" />
    <StdLegs />
  </Svg>
)

// ── 11. Bicep wall stretch ────────────────────────────────────────
export const BicepWall: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* wall on right */}
    <line x1="88" y1="0" x2="88" y2="100" strokeOpacity="0.25" strokeDasharray="3,3" />
    <StdHead />
    <StdBody />
    {/* right arm straight back onto wall, hand at wall */}
    <line x1="50" y1="27" x2="70" y2="28" />
    <line x1="70" y1="28" x2="85" y2="28" />
    {/* left arm relaxed */}
    <line x1="50" y1="27" x2="32" y2="28" />
    <line x1="32" y1="28" x2="24" y2="42" />
    <StdLegs />
  </Svg>
)

// ── 12. Wrist extension (forearm stretch) ────────────────────────
export const WristExtension: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* right arm extended forward */}
    <line x1="50" y1="27" x2="66" y2="27" />
    <line x1="66" y1="27" x2="82" y2="27" />
    {/* wrist bent back: hand goes up */}
    <line x1="82" y1="27" x2="86" y2="16" />
    {/* left arm bent, pushing right wrist */}
    <line x1="50" y1="27" x2="34" y2="27" />
    <line x1="34" y1="27" x2="76" y2="22" />
    <StdLegs />
  </Svg>
)

// ── 13. Low lunge (hip flexor) ───────────────────────────────────
export const LowLunge: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* side view, facing right */}
    <circle cx="45" cy="13" r="7" />
    <line x1="45" y1="20" x2="45" y2="52" />
    {/* right arm on front knee */}
    <line x1="52" y1="28" x2="62" y2="68" />
    {/* left arm on back side */}
    <line x1="38" y1="28" x2="30" y2="42" />
    {/* front leg (right): knee bent 90° */}
    <line x1="45" y1="52" x2="60" y2="65" />
    <line x1="60" y1="65" x2="60" y2="88" />
    {/* back leg: knee on floor */}
    <line x1="45" y1="52" x2="28" y2="65" />
    <line x1="28" y1="65" x2="24" y2="88" />
  </Svg>
)

// ── 14. Standing forward bend (hamstrings) ───────────────────────
export const ForwardBend: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* side view: legs straight, bending forward */}
    {/* feet and straight legs */}
    <line x1="38" y1="90" x2="42" y2="58" />
    <line x1="52" y1="90" x2="56" y2="58" />
    {/* hips */}
    <line x1="42" y1="58" x2="56" y2="58" />
    {/* torso bent forward to the right */}
    <line x1="49" y1="58" x2="78" y2="55" />
    {/* arms hanging down */}
    <line x1="74" y1="56" x2="68" y2="80" />
    <line x1="74" y1="56" x2="80" y2="80" />
    {/* head hanging */}
    <circle cx="82" cy="52" r="6" />
  </Svg>
)

// ── 15. Pigeon pose ───────────────────────────────────────────────
export const PigeonPose: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* front leg bent on floor */}
    <line x1="30" y1="82" x2="40" y2="65" />
    <line x1="40" y1="65" x2="50" y2="52" />
    {/* back leg extended behind */}
    <line x1="50" y1="52" x2="65" y2="65" />
    <line x1="65" y1="65" x2="78" y2="82" />
    {/* torso upright */}
    <line x1="50" y1="52" x2="48" y2="22" />
    {/* head */}
    <circle cx="48" cy="15" r="7" />
    {/* arms forward/supporting */}
    <line x1="48" y1="28" x2="34" y2="30" />
    <line x1="34" y1="30" x2="26" y2="46" />
    <line x1="48" y1="28" x2="62" y2="30" />
    <line x1="62" y1="30" x2="68" y2="46" />
  </Svg>
)

// ── 16. Standing quad stretch ────────────────────────────────────
export const QuadStretch: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* one arm out for balance */}
    <line x1="50" y1="27" x2="32" y2="28" />
    <line x1="32" y1="28" x2="18" y2="40" />
    {/* other arm reaching back to hold raised foot */}
    <line x1="50" y1="27" x2="68" y2="27" />
    <line x1="68" y1="27" x2="74" y2="55" />
    {/* standing leg */}
    <line x1="50" y1="60" x2="44" y2="90" />
    {/* raised leg bent behind: thigh down, shin up */}
    <line x1="50" y1="60" x2="60" y2="72" />
    <line x1="60" y1="72" x2="66" y2="52" />
    {/* hand touching raised foot */}
    <line x1="74" y1="55" x2="67" y2="52" />
  </Svg>
)

// ── 17. Calf stretch against wall ────────────────────────────────
export const CalfWall: FC<P> = ({ color }) => (
  <Svg color={color}>
    {/* wall */}
    <line x1="88" y1="0" x2="88" y2="100" strokeOpacity="0.25" strokeDasharray="3,3" />
    <Ground />
    {/* body leaning into wall */}
    <circle cx="50" cy="14" r="7" />
    <line x1="52" y1="21" x2="62" y2="50" />
    {/* arms on wall */}
    <line x1="58" y1="30" x2="78" y2="38" />
    <line x1="58" y1="30" x2="82" y2="30" />
    {/* front leg bent */}
    <line x1="62" y1="50" x2="68" y2="65" />
    <line x1="68" y1="65" x2="66" y2="88" />
    {/* back leg straight, heel down */}
    <line x1="62" y1="50" x2="48" y2="60" />
    <line x1="48" y1="60" x2="40" y2="88" />
  </Svg>
)

// ── 18. Butterfly stretch (seated) ───────────────────────────────
export const Butterfly: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    <circle cx="50" cy="12" r="7" />
    <line x1="50" y1="19" x2="50" y2="55" />
    {/* left knee out and down, foot to center */}
    <line x1="50" y1="55" x2="22" y2="70" />
    <line x1="22" y1="70" x2="45" y2="83" />
    {/* right knee out and down, foot to center */}
    <line x1="50" y1="55" x2="78" y2="70" />
    <line x1="78" y1="70" x2="55" y2="83" />
    {/* soles touching */}
    <line x1="45" y1="83" x2="55" y2="83" />
    {/* arms pressing knees */}
    <line x1="50" y1="35" x2="30" y2="40" />
    <line x1="30" y1="40" x2="22" y2="70" />
    <line x1="50" y1="35" x2="70" y2="40" />
    <line x1="70" y1="40" x2="78" y2="70" />
  </Svg>
)

// ── 19. Lying spinal twist ────────────────────────────────────────
export const LyingTwist: FC<P> = ({ color }) => (
  <Svg color={color}>
    <Ground />
    {/* lying on back, head on left */}
    <circle cx="10" cy="62" r="6" />
    <line x1="16" y1="62" x2="72" y2="62" />
    {/* arms spread: one up, one down */}
    <line x1="30" y1="62" x2="25" y2="42" />
    <line x1="72" y1="62" x2="68" y2="48" />
    {/* right knee crossed over to left side */}
    <line x1="72" y1="62" x2="78" y2="72" />
    <line x1="78" y1="72" x2="60" y2="82" />
    {/* straight left leg */}
    <line x1="72" y1="62" x2="82" y2="56" />
  </Svg>
)

// ── 20. Hip rotation standing ────────────────────────────────────
export const HipCircle: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* hands on hips */}
    <line x1="50" y1="35" x2="34" y2="40" />
    <line x1="34" y1="40" x2="38" y2="52" />
    <line x1="50" y1="35" x2="66" y2="40" />
    <line x1="66" y1="40" x2="62" y2="52" />
    {/* hip rotation arc indicator */}
    <path d="M 38,55 A 14,8 0 0 1 62,55" fill="none" strokeOpacity="0.6" />
    <line x1="62" y1="55" x2="58" y2="50" />
    <StdLegs />
  </Svg>
)

// ── 21. Wrist rotation (poignets) ────────────────────────────────
export const WristRotation: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* arms extended forward */}
    <line x1="50" y1="27" x2="32" y2="28" />
    <line x1="32" y1="28" x2="18" y2="30" />
    <line x1="50" y1="27" x2="68" y2="28" />
    <line x1="68" y1="28" x2="82" y2="30" />
    {/* rotation circles at wrists */}
    <circle cx="15" cy="30" r="5" strokeOpacity="0.5" />
    <circle cx="85" cy="30" r="5" strokeOpacity="0.5" />
    <line x1="15" y1="25" x2="18" y2="22" />
    <line x1="85" y1="25" x2="82" y2="22" />
    <StdLegs />
  </Svg>
)

// ── 22. Overhead arm stretch (bicep raised) ──────────────────────
export const ArmOverhead: FC<P> = ({ color }) => (
  <Svg color={color}>
    <StdHead />
    <StdBody />
    {/* one arm straight overhead */}
    <line x1="50" y1="27" x2="56" y2="28" />
    <line x1="56" y1="28" x2="60" y2="10" />
    {/* other arm relaxed */}
    <line x1="50" y1="27" x2="32" y2="28" />
    <line x1="32" y1="28" x2="24" y2="44" />
    <StdLegs />
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
