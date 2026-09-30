import { Link } from 'react-router-dom'
import type { PlaceCard } from '../../types/place.ts'
import { ErrorNote } from '../ui/ErrorNote.tsx'
import { Skeleton } from '../ui/Skeleton.tsx'
import { PlaceGrid } from './PlaceGrid.tsx'

export function PlaceSection({
  title,
  lede,
  places,
  isLoading,
  isError,
  onRetry,
  href,
  linkLabel,
}: {
  title: string
  lede: string
  places: PlaceCard[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  href?: string
  linkLabel?: string
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-sand-800">{lede}</p>
        </div>
        {href && linkLabel ? (
          <Link to={href} className="inline-flex min-h-11 items-center text-sm text-lagoon-800 underline">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : null}
      {isError ? <ErrorNote message="We could not load these places." onRetry={onRetry} /> : null}
      {!isLoading && !isError && places.length === 0 ? (
        <p className="rounded-2xl border border-sand-200 bg-white p-6">Nothing is listed here yet.</p>
      ) : null}
      {!isLoading && !isError && places.length > 0 ? <PlaceGrid places={places} /> : null}
    </section>
  )
}
