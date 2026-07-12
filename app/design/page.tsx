import Link from 'next/link'

// Index des directions de redesign — page de comparaison pour Enzo.
// L'app actuelle n'est pas touchée : tout vit sous /design.

const DIRECTIONS = [
  {
    href: '/design/v1',
    tag: 'V1',
    name: "L'Affiche",
    pitch: 'Poster athlétique : typo écrasante, encre + volt, traits durs. Zéro flou, zéro dégradé — l\'énergie d\'une affiche de salle de boxe.',
    chips: ['Archivo Black', 'Volt #D8FF3A', 'Bordures 2px', 'Ombres dures'],
    bg: '#0D0D0F',
    accent: '#D8FF3A',
    text: '#F4F2EC',
  },
  {
    href: '/design/v2',
    tag: 'V2',
    name: "L'Instrument",
    pitch: 'Outil de précision : noir OLED, filets d\'un pixel, chiffres mono, anneaux de progression façon montre de sport. Le violet ne décore plus, il signale.',
    chips: ['IBM Plex Mono', 'Violet dosé', 'Anneaux SVG', 'Filets 1px'],
    bg: '#000000',
    accent: '#A78BFA',
    text: '#EDEDEF',
  },
  {
    href: '/design/v3',
    tag: 'V3',
    name: 'Le Club',
    pitch: 'Chaleureux et gamifié : tons chauds, cartes rebondies, carte de membre, XP, tampons de présence. L\'app d\'un club dont on est fier d\'être membre.',
    chips: ['Bricolage Grotesque', 'Mandarine + or', 'XP & niveaux', 'Tampons'],
    bg: '#1A1512',
    accent: '#FF8A3D',
    text: '#F4EAD9',
  },
]

export default function DesignIndex() {
  return (
    <div className="min-h-screen px-5 pt-8 pb-16" style={{ background: '#0A0A0A', color: '#F5F5F4' }}>
      <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-2">Redesign GymLog — 12 juillet 2026</p>
      <h1 className="text-2xl font-semibold tracking-tight mb-3">Trois directions à comparer</h1>
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
        Chaque direction maquette les deux écrans clés — <strong className="text-zinc-200">Accueil</strong> et{' '}
        <strong className="text-zinc-200">Séance</strong> — avec de vraies données de démo.
        Dans chaque maquette, touche « Démarrer » ou l'onglet Séance pour passer d'un écran à l'autre.
      </p>
      <p className="text-sm text-zinc-400 leading-relaxed mb-8">
        Les trois embarquent les mêmes corrections UX issues de l'audit : démarrage de séance en un tap,{' '}
        <strong className="text-zinc-200">séries cochables</strong> avec repos, barre de session (durée + volume),
        accueil recentré sur l'entraînement. Ce qui change, c'est la personnalité.
      </p>

      <div className="flex flex-col gap-4">
        {DIRECTIONS.map(d => (
          <Link key={d.href} href={d.href} className="block rounded-3xl p-6 active:scale-[0.99] transition-transform"
            style={{ background: d.bg, border: `1px solid ${d.accent}44`, color: d.text }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-black px-2 py-0.5 rounded" style={{ background: d.accent, color: d.bg }}>{d.tag}</span>
              <span className="text-[19px] font-bold tracking-tight">{d.name}</span>
            </div>
            <p className="text-[13px] leading-relaxed opacity-70 mb-4">{d.pitch}</p>
            <div className="flex flex-wrap gap-1.5">
              {d.chips.map(c => (
                <span key={c} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ border: `1px solid ${d.accent}55`, color: d.accent }}>
                  {c}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <p className="text-[12px] text-zinc-600 leading-relaxed mt-8">
        L'app actuelle est intacte. Le diagnostic complet est dans <code className="text-zinc-400">design/AUDIT_UX.md</code> du dépôt.
      </p>
    </div>
  )
}
