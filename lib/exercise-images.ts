// Auto-généré par scripts/fetch-exercise-images.mjs — photos de démo (free-exercise-db, domaine public).
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const EXERCISE_IMAGES: Record<string, string> = {
  "Développé couché": "/exercises/developpe-couche.jpg",
  "Développé incliné": "/exercises/developpe-incline.jpg",
  "Développé décliné": "/exercises/developpe-decline.jpg",
  "Écarté haltères": "/exercises/ecarte-halteres.jpg",
  "Écarté câble": "/exercises/ecarte-cable.jpg",
  "Pec deck": "/exercises/pec-deck.jpg",
  "Dips": "/exercises/dips.jpg",
  "Push-up": "/exercises/push-up.jpg",
  "Développé haltères couché": "/exercises/developpe-halteres-couche.jpg",
  "Tractions": "/exercises/tractions.jpg",
  "Tirage vertical": "/exercises/tirage-vertical.jpg",
  "Rowing barre": "/exercises/rowing-barre.jpg",
  "Rowing haltère": "/exercises/rowing-haltere.jpg",
  "Deadlift": "/exercises/deadlift.jpg",
  "Soulevé de terre": "/exercises/souleve-de-terre.jpg",
  "Tirage câble bas": "/exercises/tirage-cable-bas.jpg",
  "Pull-over": "/exercises/pull-over.jpg",
  "Shrug": "/exercises/shrug.jpg",
  "Face pull": "/exercises/face-pull.jpg",
  "Curl haltères": "/exercises/curl-halteres.jpg",
  "Curl barre": "/exercises/curl-barre.jpg",
  "Curl marteau": "/exercises/curl-marteau.jpg",
  "Triceps corde": "/exercises/triceps-corde.jpg",
  "Triceps barre": "/exercises/triceps-barre.jpg",
  "Skullcrusher": "/exercises/skullcrusher.jpg",
  "Overhead press": "/exercises/overhead-press.jpg",
  "Développé militaire": "/exercises/developpe-militaire.jpg",
  "Élévation latérale": "/exercises/elevation-laterale.jpg",
  "Élévation frontale": "/exercises/elevation-frontale.jpg",
  "Squat": "/exercises/squat.jpg",
  "Leg press": "/exercises/leg-press.jpg",
  "Fentes": "/exercises/fentes.jpg",
  "Romanian deadlift": "/exercises/romanian-deadlift.jpg",
  "Leg curl": "/exercises/leg-curl.jpg",
  "Leg extension": "/exercises/leg-extension.jpg",
  "Mollets debout": "/exercises/mollets-debout.jpg",
  "Mollets assis": "/exercises/mollets-assis.jpg",
  "Hip thrust": "/exercises/hip-thrust.jpg",
  "Bulgarian split squat": "/exercises/bulgarian-split-squat.jpg",
  "Course à pied": "/exercises/course-a-pied.jpg",
  "Vélo": "/exercises/velo.jpg",
  "Rameur": "/exercises/rameur.jpg",
  "Corde à sauter": "/exercises/corde-a-sauter.jpg",
  "Elliptique": "/exercises/elliptique.jpg"
}

const BY_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(EXERCISE_IMAGES).map(([k, v]) => [norm(k), v]),
)

/** Photo de démo d'un exercice (match normalisé + repli par inclusion). null si aucune. */
export function exerciseImage(name: string): string | null {
  const n = norm(name)
  if (BY_NORM[n]) return BY_NORM[n]
  for (const [k, v] of Object.entries(BY_NORM)) if (n.includes(k) || k.includes(n)) return v
  return null
}
