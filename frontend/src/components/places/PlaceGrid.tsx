import type { PlaceCard as PlaceCardType } from '../../types/place.ts'
import { PlaceCard } from './PlaceCard.tsx'

export function PlaceGrid({ places }: { places: PlaceCardType[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <li key={place.slug}>
          <PlaceCard place={place} />
        </li>
      ))}
    </ul>
  )
}
