import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchPlace } from '../../api/places.ts'
import { formatDistance, formatDrive, REGION_LABEL } from '../../lib/format.ts'
import type { PlaceCard as PlaceCardType, Region } from '../../types/place.ts'
import { Badge } from '../ui/Badge.tsx'
import { Rating } from '../ui/Rating.tsx'
import { PlaceImage } from './PlaceImage.tsx'

export function PlaceCard({ place }: { place: PlaceCardType }) {
  const queryClient = useQueryClient()
  const region = REGION_LABEL[place.region as Region] ?? place.region

  function prefetch() {
    void queryClient.prefetchQuery({
      queryKey: ['place', place.slug],
      queryFn: () => fetchPlace(place.slug),
      staleTime: 60_000,
    })
  }

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-sand-200 bg-white">
      <Link
        to={`/places/${place.slug}`}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        className="flex h-full flex-col"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <PlaceImage photo={place.cover_photo} name={place.name} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge>{place.category.name}</Badge>
            <Rating value={place.rating} />
          </div>
          <h3 className="text-lg font-semibold">{place.name}</h3>
          <p className="text-sm text-sand-800">
            {formatDrive(place.drive_time_minutes)} · {formatDistance(place.distance_km)}
          </p>
          <p className="text-sm text-sand-800">
            {region}
            {place.visit_duration ? ` · ${place.visit_duration}` : ''}
            {place.ticketed ? ' · Ticketed' : ' · Free entry'}
          </p>
          <p className="line-clamp-2 text-sm">{place.summary}</p>
        </div>
      </Link>
    </article>
  )
}
