import { dayName, todayIndex } from '../../lib/format.ts'
import type { Hours } from '../../types/place.ts'

export function HoursList({ hours }: { hours: Hours[] }) {
  const today = todayIndex()
  if (hours.length === 0) {
    return <p>Hours vary. Confirm them before you go.</p>
  }

  return (
    <table className="w-full text-left text-sm">
      <caption className="mb-2 text-left text-lg font-semibold text-ink">Visiting hours</caption>
      <thead className="sr-only">
        <tr>
          <th>Day</th>
          <th>Hours</th>
        </tr>
      </thead>
      <tbody>
        {hours.map((row) => {
          const isToday = row.day_of_week === today
          const label = row.is_closed ? 'Closed' : `${row.opens_at} – ${row.closes_at}`
          return (
            <tr key={row.day_of_week} className={isToday ? 'bg-sand-100' : undefined}>
              <th scope="row" className="px-3 py-2 font-medium">
                {dayName(row.day_of_week)}
                {isToday ? <span className="ml-2 text-xs text-lagoon-800">Today</span> : null}
              </th>
              <td className="px-3 py-2">{label}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
