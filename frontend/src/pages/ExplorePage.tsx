import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterBar } from '../components/places/FilterBar.tsx'
import { PlaceGrid } from '../components/places/PlaceGrid.tsx'
import { ErrorNote } from '../components/ui/ErrorNote.tsx'
import { Skeleton } from '../components/ui/Skeleton.tsx'
import { useCategories, usePlaces } from '../hooks/usePlaces.ts'
import { isRegion, TAG_LABEL } from '../lib/format.ts'
import type { PlaceFilters, SortKey } from '../types/place.ts'

function readSort(value: string | null): SortKey {
  if (value === 'distance' || value === 'rating' || value === 'name' || value === 'featured') {
    return value
  }
  return 'featured'
}

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const regionParam = params.get('region')
  const region = isRegion(regionParam) ? regionParam : ''
  const maxDistance = params.get('max_distance_km') ?? ''
  const maxDrive = params.get('max_drive_minutes') ?? ''
  const entry = params.get('entry') === 'free' || params.get('entry') === 'ticket' ? params.get('entry')! : ''
  const tags = params.getAll('tag').filter((tag) => tag in TAG_LABEL)
  const sort = readSort(params.get('sort'))
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const parsedDistance = Number(maxDistance)
  const parsedDrive = Number(maxDrive)
  const featured = params.get('featured') === 'true'

  const filters: PlaceFilters = {
    q: q || undefined,
    category: category || undefined,
    region: region || undefined,
    maxDistance: maxDistance && Number.isFinite(parsedDistance) ? parsedDistance : undefined,
    maxDrive: maxDrive && Number.isFinite(parsedDrive) ? parsedDrive : undefined,
    ticketed: entry === 'ticket' ? true : entry === 'free' ? false : undefined,
    tag: tags,
    featured: featured || undefined,
    sort,
    page,
    pageSize: 12,
  }

  const places = usePlaces(filters)
  const categories = useCategories()
  const categoryName = categories.data?.find((item) => item.slug === category)?.name

  useEffect(() => {
    document.title = 'Explore · Hyderabad Weekends'
  }, [])

  function update(changes: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (resetPage) next.delete('page')
    setParams(next)
  }

  function toggleTag(tag: string) {
    const next = new URLSearchParams(params)
    const current = next.getAll('tag').filter((item) => item in TAG_LABEL && item !== tag)
    next.delete('tag')
    const selected = tags.includes(tag) ? current : [...current, tag]
    selected.forEach((item) => next.append('tag', item))
    next.delete('page')
    setParams(next)
  }

  const total = places.data?.total ?? 0
  const pageSize = places.data?.page_size ?? 12
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canClear = Boolean(
    q || category || region || maxDistance || maxDrive || entry || tags.length || featured || (params.get('sort') && params.get('sort') !== 'featured'),
  )

  const chips: { label: string; onRemove: () => void }[] = []
  if (q) chips.push({ label: `"${q}"`, onRemove: () => update({ q: null }) })
  if (categoryName) chips.push({ label: categoryName, onRemove: () => update({ category: null }) })
  if (region === 'in-city') chips.push({ label: 'In the city', onRemove: () => update({ region: null }) })
  if (region === 'half-day') chips.push({ label: 'Half-day', onRemove: () => update({ region: null }) })
  if (region === 'weekend') chips.push({ label: 'Overnight', onRemove: () => update({ region: null }) })
  if (maxDistance) chips.push({ label: `Within ${maxDistance} km`, onRemove: () => update({ max_distance_km: null }) })
  if (maxDrive) chips.push({ label: `Under ${maxDrive} min`, onRemove: () => update({ max_drive_minutes: null }) })
  if (entry === 'free') chips.push({ label: 'Free entry', onRemove: () => update({ entry: null }) })
  if (entry === 'ticket') chips.push({ label: 'Ticketed', onRemove: () => update({ entry: null }) })
  if (featured) chips.push({ label: 'Featured', onRemove: () => update({ featured: null }) })
  tags.forEach((tag) => chips.push({ label: TAG_LABEL[tag] ?? tag, onRemove: () => toggleTag(tag) }))

  const filterBar = categories.isError ? (
    <ErrorNote message="We could not load categories." onRetry={() => void categories.refetch()} />
  ) : (
    <FilterBar
      categories={categories.data ?? []}
      category={category}
      region={region}
      maxDistance={maxDistance}
      maxDrive={maxDrive}
      entry={entry}
      tags={tags}
      sort={sort}
      onCategory={(value) => update({ category: value || null })}
      onRegion={(value) => update({ region: value || null })}
      onDistance={(value) => update({ max_distance_km: value || null })}
      onDrive={(value) => update({ max_drive_minutes: value || null })}
      onEntry={(value) => update({ entry: value || null })}
      onToggleTag={toggleTag}
      onSort={(value) => update({ sort: value === 'featured' ? null : value })}
      onClear={() => setParams(new URLSearchParams())}
      canClear={canClear}
    />
  )

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          className="min-h-11 w-full rounded-2xl bg-lagoon-800 px-4 text-sm font-medium text-sand-50"
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
        </button>
        {filtersOpen ? <div className="mt-4">{filterBar}</div> : null}
      </div>
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{filterBar}</aside>
      <div>
        <h1 className="font-display text-4xl">Explore</h1>
        <p className="mt-2 max-w-2xl text-sand-800">
          {places.isSuccess ? `${total} ${total === 1 ? 'place' : 'places'}` : 'Loading places'}
          {q ? ` for "${q}"` : ''}. Narrow by drive, ticket, and what the day is for.
        </p>
        {chips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="min-h-11 rounded-full bg-sand-100 px-3 text-sm"
              >
                {chip.label} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {chip.label}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-6">
          {places.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          ) : null}
          {places.isError ? (
            <ErrorNote message="We could not load places." onRetry={() => void places.refetch()} />
          ) : null}
          {places.isSuccess && places.data.items.length === 0 ? (
            <div className="rounded-2xl border border-sand-200 bg-white p-6">
              <p>No places match these filters.</p>
              {canClear ? (
                <button
                  type="button"
                  className="mt-3 min-h-11 text-lagoon-800 underline"
                  onClick={() => setParams(new URLSearchParams())}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : null}
          {places.isSuccess && places.data.items.length > 0 ? <PlaceGrid places={places.data.items} /> : null}
        </div>
        {places.isSuccess && totalPages > 1 ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="min-h-11 rounded-full border border-sand-200 bg-white px-4 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => update({ page: page - 1 <= 1 ? null : String(page - 1) }, false)}
            >
              Previous
            </button>
            <p className="text-sm">
              Page {page} of {totalPages}
            </p>
            <button
              type="button"
              className="min-h-11 rounded-full border border-sand-200 bg-white px-4 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => update({ page: String(page + 1) }, false)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
