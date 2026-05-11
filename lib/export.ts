import type { Session } from '@/types'

export function exportSessionsCSV(sessions: Session[]) {
  const rows: string[] = [
    'Date,Groupe musculaire,Exercice,Série,Poids (kg),Répétitions',
  ]

  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

  for (const session of sorted) {
    for (const exo of session.exos) {
      exo.sets.forEach((set, i) => {
        rows.push(
          [
            session.date,
            session.type,
            `"${exo.name.replace(/"/g, '""')}"`,
            i + 1,
            set.weight ?? 0,
            set.reps ?? 0,
          ].join(',')
        )
      })
    }
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gymlog_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
