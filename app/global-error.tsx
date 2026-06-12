'use client'

// Filet de sécurité ultime : erreur dans le layout racine lui-même.
// Doit rendre son propre <html> — pas de Framer Motion ni de classes
// Tailwind garanties ici, styles inline uniquement.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#0A0A0A', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '0 32px' }}>
          <h2 style={{ color: '#e4e4e7', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            L&apos;application a rencontré une erreur
          </h2>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24 }}>
            Tes données sont en sécurité.
          </p>
          <button
            onClick={reset}
            style={{
              minHeight: 44, padding: '0 24px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}
          >
            Recharger
          </button>
          {error.digest && (
            <p style={{ color: '#71717a', fontSize: 11, fontFamily: 'monospace', marginTop: 24 }}>Code : {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  )
}
