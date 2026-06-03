// Skeleton de chargement initial — reproduit la forme de l'écran d'accueil
// (header + carte hero + sections) pour un lancement perçu instantané et
// premium, au lieu d'un simple spinner.
export default function AppSkeleton() {
  return (
    <div className="flex flex-col min-h-screen" aria-hidden="true">
      {/* Header */}
      <header
        className="glass-strong flex items-center justify-between px-5 border-b border-white/[0.06]"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))', paddingBottom: '16px' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[8px] shimmer-block" />
          <div className="h-5 w-24 rounded-md shimmer-block" />
        </div>
        <div className="w-8 h-8 rounded-full shimmer-block" />
      </header>

      {/* Contenu */}
      <div className="flex-1 px-5 pt-5 flex flex-col gap-6">
        {/* Carte hero — prochaine séance */}
        <div
          className="rounded-[28px] p-5 border border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.10),rgba(99,102,241,0.04))' }}
        >
          <div className="h-3 w-28 rounded-full shimmer-block mb-3" />
          <div className="h-9 w-52 rounded-lg shimmer-block mb-3" />
          <div className="h-3 w-44 rounded-full shimmer-block mb-5" />
          <div className="h-px bg-white/[0.06] mb-4" />
          <div className="flex justify-between">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-6 w-8 rounded shimmer-block" />
                <div className="h-2 w-12 rounded-full shimmer-block" />
              </div>
            ))}
          </div>
        </div>

        {/* Section — dernière séance */}
        <div className="flex flex-col gap-3">
          <div className="h-2.5 w-32 rounded-full shimmer-block" />
          <div className="rounded-2xl p-4 border border-white/[0.06] card-glass flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="h-5 w-16 rounded-full shimmer-block" />
              <div className="h-3 w-20 rounded-full shimmer-block" />
            </div>
            <div className="h-4 w-full rounded shimmer-block" />
            <div className="h-4 w-2/3 rounded shimmer-block" />
          </div>
        </div>

        {/* Section — cette semaine (pastilles jours) */}
        <div className="flex flex-col gap-3">
          <div className="h-2.5 w-28 rounded-full shimmer-block" />
          <div className="flex gap-2 justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-11 h-11 rounded-full shimmer-block" />
            ))}
          </div>
        </div>

        {/* Lignes d'action */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 border border-white/[0.06] card-glass flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shimmer-block" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-40 rounded shimmer-block" />
              <div className="h-2.5 w-28 rounded-full shimmer-block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
