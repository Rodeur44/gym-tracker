import type { MuscleGroup } from '@/types'

export interface ExerciseInfo {
  muscles: MuscleGroup[]
  description: string
  tips: string[]
}

const INFO: Record<string, ExerciseInfo> = {
  // PEC
  'Développé couché': {
    muscles: ['pec'],
    description: 'Allongé sur un banc plat, descends la barre jusqu\'à effleurer la poitrine puis pousse explosif vers le haut.',
    tips: ['Pieds à plat au sol', 'Omoplates serrées et enfoncées dans le banc', 'Prise légèrement plus large que les épaules'],
  },
  'Développé incliné': {
    muscles: ['pec'],
    description: 'Banc incliné à 30-45°, pousse la barre vers le haut en ciblant le haut du pec.',
    tips: ['Inclinaison max 45° pour rester sur le pec', 'Contrôle la descente sur 2-3 secondes', 'Pousse légèrement vers l\'arrière'],
  },
  'Développé décliné': {
    muscles: ['pec'],
    description: 'Banc décliné, barre descend vers le bas du sternum pour cibler le pec inférieur.',
    tips: ['Pieds bien accrochés', 'Amplitude complète', 'Resserre les pecs en haut'],
  },
  'Écarté haltères': {
    muscles: ['pec'],
    description: 'Allongé, ouvre les bras en arc de cercle jusqu\'à sentir l\'étirement du pec, puis referme.',
    tips: ['Léger fléchissement des coudes', 'Ne descends pas trop bas', 'Poids modéré, amplitude est clé'],
  },
  'Écarté câble': {
    muscles: ['pec'],
    description: 'Debout entre deux câbles, croise les bras devant toi en arc de cercle.',
    tips: ['Tension constante grâce aux câbles', 'Légère inclinaison vers l\'avant', 'Varie la hauteur des poulies'],
  },
  'Pec deck': {
    muscles: ['pec'],
    description: 'Machine guidée, referme les bras devant la poitrine en contractant les pecs.',
    tips: ['Contrôle le retour', 'Garde les coudes à hauteur des épaules', 'Concentre-toi sur la contraction'],
  },
  'Dips': {
    muscles: ['pec', 'bras'],
    description: 'Suspendu sur des barres parallèles, descends le corps en fléchissant les coudes puis pousse.',
    tips: ['Incline le buste vers l\'avant pour cibler le pec', 'Droit = triceps', 'Amplitude complète'],
  },
  'Push-up': {
    muscles: ['pec', 'bras'],
    description: 'Pompes au sol, corps gainé, descends la poitrine jusqu\'au sol puis pousse.',
    tips: ['Corps rigide comme une planche', 'Mains sous les épaules', 'Coudes à 45° du corps'],
  },
  'Développé haltères couché': {
    muscles: ['pec'],
    description: 'Identique au développé couché mais avec des haltères pour plus d\'amplitude et de stabilité.',
    tips: ['Plus grande amplitude qu\'à la barre', 'Poignets neutres', 'Descends jusqu\'à sentir l\'étirement'],
  },

  // DOS
  'Tractions': {
    muscles: ['dos', 'bras'],
    description: 'Suspendu à la barre, tire ton corps jusqu\'à ce que le menton dépasse la barre.',
    tips: ['Commence bras complètement tendus', 'Engage le dos avant de tirer', 'Évite le balancement'],
  },
  'Tirage vertical': {
    muscles: ['dos', 'bras'],
    description: 'Assis à la machine, tire la barre vers le haut de la poitrine en ramenant les coudes vers le bas.',
    tips: ['Prise large = dos large', 'Tire vers le sternum, pas le cou', 'Étire bien en haut'],
  },
  'Rowing barre': {
    muscles: ['dos'],
    description: 'Penché à 45°, tire la barre vers le nombril en gardant le dos droit.',
    tips: ['Dos plat, jamais arrondi', 'Coudes près du corps', 'Serre les omoplates en haut'],
  },
  'Rowing haltère': {
    muscles: ['dos'],
    description: 'Un genou sur le banc, tire l\'haltère vers la hanche en gardant le dos horizontal.',
    tips: ['Ne tourne pas le buste', 'Tire avec le coude, pas la main', 'Amplitude complète'],
  },
  'Deadlift': {
    muscles: ['dos', 'jambes'],
    description: 'Depuis le sol, soulève la barre en poussant les hanches vers l\'avant, dos droit.',
    tips: ['Barre proche des jambes', 'Regard légèrement vers l\'avant', 'Engage le gainage dès le départ'],
  },
  'Soulevé de terre': {
    muscles: ['dos', 'jambes'],
    description: 'Même mouvement que le deadlift — exercice fondamental pour le dos et les jambes.',
    tips: ['Hanches à hauteur intermédiaire', 'Verrouille les genoux et hanches en même temps', 'Respire avant de tirer'],
  },
  'Tirage câble bas': {
    muscles: ['dos'],
    description: 'Assis face à la machine, tire la poignée vers le ventre en ramenant les coudes vers l\'arrière.',
    tips: ['Prise neutre (paumes face à face)', 'Garde le dos droit', 'Serre les omoplates'],
  },
  'Pull-over': {
    muscles: ['dos', 'pec'],
    description: 'Allongé en travers du banc, descends l\'haltère derrière la tête puis ramène au-dessus de la poitrine.',
    tips: ['Légère flexion des coudes', 'Amplitude maximale', 'Respire en montant'],
  },
  'Shrug': {
    muscles: ['dos'],
    description: 'Debout avec une barre ou haltères, hausse les épaules vers les oreilles pour cibler les trapèzes.',
    tips: ['Pas de rotation des épaules', 'Maintien 1-2s en haut', 'Amplitude maximale'],
  },
  'Face pull': {
    muscles: ['dos', 'bras'],
    description: 'Avec la corde à la poulie haute, tire vers le visage en ouvrant les coudes.',
    tips: ['Coudes à hauteur des yeux', 'Rotation externe des épaules', 'Poids léger, bonne forme'],
  },

  // BRAS
  'Curl haltères': {
    muscles: ['bras'],
    description: 'Debout, fléchis l\'avant-bras vers l\'épaule en gardant le coude fixe le long du corps.',
    tips: ['Coude fixe, pas de balancement', 'Supination en haut', 'Descente contrôlée'],
  },
  'Curl barre': {
    muscles: ['bras'],
    description: 'Même mouvement avec une barre, prise en supination, biceps travaillés bilatéralement.',
    tips: ['Prise légèrement plus large que les hanches', 'Évite de cambrer le dos', 'Contraction maximale en haut'],
  },
  'Curl marteau': {
    muscles: ['bras'],
    description: 'Prise neutre (pouce vers le haut), cible le brachial et le long supinateur.',
    tips: ['Poignets neutres tout au long', 'Coudes fixes', 'Variante: alterné ou simultané'],
  },
  'Triceps corde': {
    muscles: ['bras'],
    description: 'À la poulie haute, pousse la corde vers le bas en séparant les mains en bas.',
    tips: ['Sépare la corde en bas pour maximiser la contraction', 'Coudes contre le corps', 'Buste légèrement penché'],
  },
  'Triceps barre': {
    muscles: ['bras'],
    description: 'Barre à la poulie haute, extension complète des bras vers le bas.',
    tips: ['Prise pronation (paumes vers bas)', 'Coudes fixés', 'Amplitude complète'],
  },
  'Skullcrusher': {
    muscles: ['bras'],
    description: 'Allongé, abaisse la barre EZ vers le front puis étends les bras pour cibler le chef long du triceps.',
    tips: ['Coudes pointés vers le plafond', 'Contrôle la descente', 'Ne verrouille pas complètement en haut'],
  },
  'Overhead press': {
    muscles: ['bras'],
    description: 'Debout ou assis, pousse la barre ou les haltères au-dessus de la tête.',
    tips: ['Engage le core', 'Coudes légèrement devant la barre', 'Descends jusqu\'aux clavicules'],
  },
  'Développé militaire': {
    muscles: ['bras'],
    description: 'Pousse une barre au-dessus de la tête en position debout pour les épaules.',
    tips: ['Gainage strict, pas de cambrure', 'Barre dans le rack à hauteur d\'épaule', 'Explose vers le haut'],
  },
  'Élévation latérale': {
    muscles: ['bras'],
    description: 'Debout, lève les haltères sur les côtés jusqu\'à hauteur des épaules.',
    tips: ['Légère inclinaison vers l\'avant', 'Pouce légèrement vers le bas', 'Poids léger, amplitude'],
  },
  'Élévation frontale': {
    muscles: ['bras'],
    description: 'Lève les haltères devant toi jusqu\'à hauteur des épaules pour cibler le deltoïde antérieur.',
    tips: ['Prise neutre ou pronation', 'Évite le balancement', 'Alternance ou simultané'],
  },

  // JAMBES
  'Squat': {
    muscles: ['jambes'],
    description: 'Barre sur le haut du dos, descends les fesses jusqu\'à ce que les cuisses soient parallèles au sol.',
    tips: ['Genoux dans l\'axe des pieds', 'Dos droit, regard devant', 'Pieds à largeur d\'épaules'],
  },
  'Leg press': {
    muscles: ['jambes'],
    description: 'Assis dans la machine, pousse la plateforme avec les pieds jusqu\'à extension complète.',
    tips: ['Ne verrouille pas complètement les genoux', 'Pieds hauts = fessiers/ischios, bas = quads', 'Amplitude maximale'],
  },
  'Fentes': {
    muscles: ['jambes'],
    description: 'Un pied en avant, descends le genou arrière vers le sol puis remonte.',
    tips: ['Genou avant ne dépasse pas la pointe du pied', 'Dos droit', 'Marcher ou sur place'],
  },
  'Romanian deadlift': {
    muscles: ['jambes', 'dos'],
    description: 'Descends la barre le long des jambes en pliant légèrement les genoux, étire bien les ischios.',
    tips: ['Hanches en arrière, pas genoux en avant', 'Dos droit tout au long', 'Ressens l\'étirement des ischios'],
  },
  'Leg curl': {
    muscles: ['jambes'],
    description: 'Machine de flexion des genoux, cible les ischio-jambiers.',
    tips: ['Amplitude complète', 'Contracte fort en haut', 'Contrôle la descente'],
  },
  'Leg extension': {
    muscles: ['jambes'],
    description: 'Machine d\'extension des genoux, cible les quadriceps.',
    tips: ['Ne verrouille pas brutalement', 'Maintien 1s en haut', 'Poids modéré pour protéger le genou'],
  },
  'Mollets debout': {
    muscles: ['jambes'],
    description: 'Debout sur une marche, monte sur la pointe des pieds puis redescends sous le niveau de la marche.',
    tips: ['Amplitude maximale vers le bas', 'Contracte fort en haut', 'Peut être fait unilatéral'],
  },
  'Mollets assis': {
    muscles: ['jambes'],
    description: 'Assis à la machine, soulève la charge avec la pointe des pieds pour cibler le soléaire.',
    tips: ['Genoux à 90°', 'Étire complètement en bas', 'Tempo lent et contrôlé'],
  },
  'Hip thrust': {
    muscles: ['jambes'],
    description: 'Épaules sur un banc, barre sur les hanches, pousse les hanches vers le plafond.',
    tips: ['Menton vers la poitrine', 'Contracte fort les fessiers en haut', 'Pieds à 90° en haut'],
  },
  'Bulgarian split squat': {
    muscles: ['jambes'],
    description: 'Pied arrière sur un banc, descends le genou avant vers le sol pour cibler quad et fessier.',
    tips: ['Pied avant assez loin devant', 'Dos droit', 'Un des meilleurs exercices unilatéraux'],
  },

  // CARDIO
  'Course à pied': {
    muscles: ['cardio'],
    description: 'Course à allure modérée ou intervalle, développe le système cardio-vasculaire.',
    tips: ['Attéris sur le milieu du pied', 'Cadence ~180 pas/min', 'Respiration nasale si possible'],
  },
  'Vélo': {
    muscles: ['cardio', 'jambes'],
    description: 'Cardio faible impact, idéal pour récupérer tout en restant actif.',
    tips: ['Selle à hauteur des hanches', 'Résistance suffisante', 'Bonne posture dans le dos'],
  },
  'Rameur': {
    muscles: ['cardio', 'dos', 'jambes'],
    description: 'Exercice complet corps entier, pousse avec les jambes puis tire avec le dos et les bras.',
    tips: ['60% jambes, 20% dos, 20% bras', 'Corps légèrement incliné vers l\'arrière en fin de mouvement', 'Respiration régulière'],
  },
  'Corde à sauter': {
    muscles: ['cardio'],
    description: 'Cardio intense et coordination, brûle beaucoup de calories en peu de temps.',
    tips: ['Poignets font le travail, pas les bras', 'Sauts bas et efficaces', 'Commence par intervalles courts'],
  },
  'HIIT': {
    muscles: ['cardio'],
    description: 'Alternance d\'efforts intenses et de récupération pour maximiser la dépense calorique.',
    tips: ['20s effort / 10s repos (Tabata)', 'Effort maximal pendant les phases actives', 'Récup active entre les séries'],
  },
}

export function getExerciseInfo(name: string): ExerciseInfo | null {
  if (INFO[name]) return INFO[name]
  const key = Object.keys(INFO).find(k =>
    k.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(k.toLowerCase())
  )
  return key ? INFO[key] : null
}

export function getMusclesForExercise(name: string, fallback: MuscleGroup): MuscleGroup[] {
  const info = getExerciseInfo(name)
  return info ? info.muscles : [fallback]
}
