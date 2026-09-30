import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from '../components/places/SearchBar.tsx'
import { PlaceSection } from '../components/places/PlaceSection.tsx'
import { ErrorNote } from '../components/ui/ErrorNote.tsx'
import { Skeleton } from '../components/ui/Skeleton.tsx'
import { useCategories, usePlaces } from '../hooks/usePlaces.ts'

const HERO_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Golconda_Fort_005.jpg/1280px-Golconda_Fort_005.jpg'

export function HomePage() {
  const categories = useCategories()
  const featured = usePlaces({ featured: true, sort: 'featured', pageSize: 6 })
  const near = usePlaces({ sort: 'distance', pageSize: 24 })
  const weekend = usePlaces({ region: 'weekend', sort: 'distance', pageSize: 6 })
  const quick = (near.data?.items ?? []).filter((place) => place.drive_time_minutes <= 120).slice(0, 6)

  useEffect(() => {
    document.title = 'Hyderabad Weekends'
  }, [])

  return (
    <>
      <section className="relative min-h-[32rem] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Ramparts of Golconda Fort"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/75 to-ink/35" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-end px-4 py-12 text-sand-50">
          <p className="text-sm tracking-wide">From Tank Bund</p>
          <h1 className="mt-2 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            Weekend trips around Hyderabad
          </h1>
          <p className="mt-4 max-w-xl text-sand-100">
            Forts, lakes, and hill roads you can reach from the city, with drive times and what to know before you leave.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBar id="hero-search" size="hero" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-3xl">Browse by kind of place</h2>
        <p className="mt-2 max-w-2xl text-sand-800">Start with a category, then narrow by distance.</p>
        {categories.isLoading ? <Skeleton className="mt-4 h-11 w-full max-w-xl" /> : null}
        {categories.isError ? (
          <div className="mt-4">
            <ErrorNote message="We could not load categories." onRetry={() => void categories.refetch()} />
          </div>
        ) : null}
        {categories.data ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.data.map((category) => (
              <Link
                key={category.slug}
                to={`/explore?category=${category.slug}`}
                className="rounded-3xl border border-sand-200 bg-white p-4 shadow-sm"
              >
                <span className="font-display text-2xl">{category.name}</span>
                <span className="mt-2 block text-sm text-sand-800">{category.description}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <PlaceSection
        title="Featured this weekend"
        lede="A short list worth planning around, ordered with the nearer ones first."
        places={featured.data?.items ?? []}
        isLoading={featured.isLoading}
        isError={featured.isError}
        onRetry={() => void featured.refetch()}
        href="/explore?featured=true"
        linkLabel="All featured places"
      />
      <PlaceSection
        title="Under two hours"
        lede="Places you can reach from Tank Bund and still have the afternoon."
        places={quick}
        isLoading={near.isLoading}
        isError={near.isError}
        onRetry={() => void near.refetch()}
        href="/explore?sort=distance"
        linkLabel="Sort by distance"
      />
      <PlaceSection
        title="Stay the night"
        lede="Farther trips that make more sense with a night away."
        places={weekend.data?.items ?? []}
        isLoading={weekend.isLoading}
        isError={weekend.isError}
        onRetry={() => void weekend.refetch()}
        href="/explore?region=weekend"
        linkLabel="All weekend getaways"
      />
    </>
  )
}
