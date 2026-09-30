import { REGION_LABEL, TAG_LABEL } from '../../lib/format.ts'
import type { PlaceDetail, Region } from '../../types/place.ts'

export function Facts({ place }: { place: PlaceDetail }) {
  const region = REGION_LABEL[place.region as Region] ?? place.region
  const rows = [
    ['Trip', region],
    ['On site', place.visit_duration || 'See the notes'],
    ['Entry', place.ticketed ? 'Ticketed' : 'Free to enter'],
    ['Address', place.address],
  ]

  return (
    <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-2xl">At a glance</h2>
      <dl className="mt-4 grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-sand-800">{label}</dt>
            <dd className="mt-1 text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      {place.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-sand-100 px-3 py-1 text-xs">
              {TAG_LABEL[tag] ?? tag}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
