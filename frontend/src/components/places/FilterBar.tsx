import type { ReactNode } from 'react'
import { TAG_LABEL } from '../../lib/format.ts'
import type { Category, Region, SortKey } from '../../types/place.ts'

const DISTANCES = [
  { label: 'Any distance', value: '' },
  { label: 'Within 25 km', value: '25' },
  { label: 'Within 50 km', value: '50' },
  { label: 'Within 100 km', value: '100' },
]

const DRIVES = [
  { label: 'Any drive', value: '' },
  { label: 'Under 45 min', value: '45' },
  { label: 'Under 90 min', value: '90' },
  { label: 'Under 3 hours', value: '180' },
]

const REGIONS: { label: string; value: '' | Region }[] = [
  { label: 'Any length', value: '' },
  { label: 'In the city', value: 'in-city' },
  { label: 'Half-day', value: 'half-day' },
  { label: 'Overnight', value: 'weekend' },
]

const ENTRIES = [
  { label: 'Any entry', value: '' },
  { label: 'Free to enter', value: 'free' },
  { label: 'Ticketed', value: 'ticket' },
]

function Choice({
  selected,
  children,
  onClick,
}: {
  selected: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 rounded-xl px-3 text-left text-sm ${
        selected ? 'bg-lagoon-800 text-sand-50' : 'bg-sand-50 text-ink hover:bg-sand-100'
      }`}
    >
      {children}
    </button>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-sand-100 pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-sand-800">{title}</legend>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </fieldset>
  )
}

export function FilterBar({
  categories,
  category,
  region,
  maxDistance,
  maxDrive,
  entry,
  tags,
  sort,
  onCategory,
  onRegion,
  onDistance,
  onDrive,
  onEntry,
  onToggleTag,
  onSort,
  onClear,
  canClear,
}: {
  categories: Category[]
  category: string
  region: string
  maxDistance: string
  maxDrive: string
  entry: string
  tags: string[]
  sort: SortKey
  onCategory: (value: string) => void
  onRegion: (value: string) => void
  onDistance: (value: string) => void
  onDrive: (value: string) => void
  onEntry: (value: string) => void
  onToggleTag: (value: string) => void
  onSort: (value: SortKey) => void
  onClear: () => void
  canClear: boolean
}) {
  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Filters</h2>
        {canClear ? (
          <button type="button" onClick={onClear} className="min-h-11 text-sm text-lagoon-800 underline">
            Clear all
          </button>
        ) : null}
      </div>
      <div className="space-y-4">
        <Group title="Kind of place">
          <Choice selected={category === ''} onClick={() => onCategory('')}>
            All
          </Choice>
          {categories.map((item) => (
            <Choice key={item.slug} selected={category === item.slug} onClick={() => onCategory(item.slug)}>
              {item.name}
            </Choice>
          ))}
        </Group>
        <Group title="Trip length">
          {REGIONS.map((item) => (
            <Choice key={item.label} selected={region === item.value} onClick={() => onRegion(item.value)}>
              {item.label}
            </Choice>
          ))}
        </Group>
        <Group title="Distance from Tank Bund">
          {DISTANCES.map((item) => (
            <Choice key={item.label} selected={maxDistance === item.value} onClick={() => onDistance(item.value)}>
              {item.label}
            </Choice>
          ))}
        </Group>
        <Group title="Drive time">
          {DRIVES.map((item) => (
            <Choice key={item.label} selected={maxDrive === item.value} onClick={() => onDrive(item.value)}>
              {item.label}
            </Choice>
          ))}
        </Group>
        <Group title="Entry">
          {ENTRIES.map((item) => (
            <Choice key={item.label} selected={entry === item.value} onClick={() => onEntry(item.value)}>
              {item.label}
            </Choice>
          ))}
        </Group>
        <fieldset className="border-t border-sand-100 pt-4">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-sand-800">Good for</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TAG_LABEL).map(([value, label]) => {
              const selected = tags.includes(value)
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggleTag(value)}
                  className={`min-h-11 rounded-full px-3 text-sm ${
                    selected ? 'bg-clay text-sand-50' : 'border border-sand-200 bg-white'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-sand-800">Pick more than one to narrow the list.</p>
        </fieldset>
        <label className="grid gap-2 border-t border-sand-100 pt-4 text-xs font-semibold uppercase tracking-wide text-sand-800">
          Sort
          <select
            value={sort}
            onChange={(event) => onSort(event.target.value as SortKey)}
            className="min-h-11 rounded-xl border border-sand-200 bg-sand-50 px-3 text-sm font-normal normal-case tracking-normal text-ink"
          >
            <option value="featured">Featured first</option>
            <option value="distance">Nearest</option>
            <option value="rating">Highest rating</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
    </div>
  )
}
