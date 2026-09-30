import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client.ts'
import { Facts } from '../components/place/Facts.tsx'
import { Gallery } from '../components/place/Gallery.tsx'
import { HoursList } from '../components/place/HoursList.tsx'
import { PlaceSection } from '../components/places/PlaceSection.tsx'
import { ErrorNote } from '../components/ui/ErrorNote.tsx'
import { Rating } from '../components/ui/Rating.tsx'
import { Skeleton } from '../components/ui/Skeleton.tsx'
import { usePlace, usePlaces } from '../hooks/usePlaces.ts'
import { formatDistance, formatDrive, REGION_LABEL } from '../lib/format.ts'
import type { PlaceDetail, Region } from '../types/place.ts'

const MapView = lazy(() => import('../components/place/MapView.tsx'))

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-sand-800">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  )
}

export function PlaceDetailPage() {
  const { slug = '' } = useParams()
  const placeQuery = usePlace(slug)
  const place = placeQuery.data
  const similar = usePlaces(
    {
      category: place?.category.slug,
      sort: 'distance',
      pageSize: 8,
    },
    Boolean(place),
  )

  useEffect(() => {
    document.title = place ? `${place.name} · Hyderabad Weekends` : 'Hyderabad Weekends'
  }, [place])

  if (placeQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8">
        <Skeleton className="h-80" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (placeQuery.error instanceof ApiError && placeQuery.error.status === 404) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-4xl">We do not have this place</h1>
        <p className="mt-3 text-sand-800">It may be unpublished, or the link is out of date.</p>
        <Link to="/explore" className="mt-4 inline-flex min-h-11 items-center text-lagoon-800 underline">
          Back to explore
        </Link>
      </div>
    )
  }

  if (placeQuery.isError || !place) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorNote message="We could not load this place." onRetry={() => void placeQuery.refetch()} />
      </div>
    )
  }

  return <PlaceArticle place={place} relatedQuery={similar} />
}

function PlaceArticle({
  place,
  relatedQuery,
}: {
  place: PlaceDetail
  relatedQuery: ReturnType<typeof usePlaces>
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
  const staysUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`hotels near ${place.name} Hyderabad`)}`
  const related = (relatedQuery.data?.items ?? []).filter((item) => item.slug !== place.slug).slice(0, 3)
  const region = REGION_LABEL[place.region as Region] ?? place.region
  const showSimilar = relatedQuery.isLoading || relatedQuery.isError || related.length > 0

  return (
    <article>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Gallery photos={place.photos} name={place.name} />
        <header className="mt-6">
          <p className="text-sm text-sand-800">
            {place.category.name} · {place.locality} · {region}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl sm:text-5xl">{place.name}</h1>
            <Rating value={place.rating} />
          </div>
          <p className="mt-3 max-w-3xl text-lg">{place.summary}</p>
        </header>
        <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Drive" value={formatDrive(place.drive_time_minutes)} />
          <Stat label="Distance" value={formatDistance(place.distance_km)} />
          <Stat label="Time there" value={place.visit_duration || 'See the notes'} />
          <Stat label="Entry" value={place.ticketed ? 'Ticketed' : 'Free to enter'} />
        </dl>

        {place.highlights.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-3xl">What to see</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {place.highlights.map((item, index) => (
                <li key={item} className="rounded-3xl border border-sand-200 bg-white p-4">
                  <span className="font-display text-2xl text-lagoon-800">{index + 1}</span>
                  <p className="mt-2 text-sm leading-relaxed">{item}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <Panel title="The place">
              <p>{place.description}</p>
              <p>{place.tips}</p>
              <p>
                <span className="font-medium">Best time. </span>
                {place.best_time}
              </p>
            </Panel>
            <Panel title="Tickets">
              <p>{place.entry_fee_note}</p>
              <p>
                <span className="font-medium">Indian visitors. </span>
                {place.ticket_indian}
              </p>
              <p>
                <span className="font-medium">Foreign visitors. </span>
                {place.ticket_foreign}
              </p>
              <p className="text-sand-800">Prices move. Check the gate or the official booking page the week you go.</p>
            </Panel>
            <Panel title="How to get there">
              <p>{place.getting_there}</p>
              <p>{place.address}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a className="inline-flex min-h-11 items-center rounded-full bg-lagoon-800 px-4 text-sand-50" href={directionsUrl} target="_blank" rel="noreferrer">
                  Directions
                </a>
                <a className="inline-flex min-h-11 items-center rounded-full border border-sand-200 px-4" href={mapsUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              </div>
            </Panel>
            <Panel title="Where to stay">
              <p>{place.stay_nearby}</p>
              <a className="inline-flex min-h-11 items-center text-lagoon-800 underline" href={staysUrl} target="_blank" rel="noreferrer">
                Search stays near {place.name}
              </a>
            </Panel>
            <Panel title="What to pack">
              <p>{place.what_to_pack}</p>
            </Panel>
            <div className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
              <HoursList hours={place.hours} />
              <p className="mt-3 text-sm text-sand-800">These are typical hours. Confirm the weekly holiday before you go.</p>
            </div>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Facts place={place} />
            <Suspense fallback={<Skeleton className="h-72" />}>
              <MapView latitude={place.latitude} longitude={place.longitude} name={place.name} />
            </Suspense>
          </aside>
        </div>
      </div>
      {showSimilar ? (
        <PlaceSection
          title="Build the rest of the day"
          lede={`Other ${place.category.name.toLowerCase()} places you can add without starting from scratch.`}
          places={related}
          isLoading={relatedQuery.isLoading}
          isError={relatedQuery.isError}
          onRetry={() => void relatedQuery.refetch()}
          href={`/explore?category=${place.category.slug}`}
          linkLabel="See the full category"
        />
      ) : null}
    </article>
  )
}
