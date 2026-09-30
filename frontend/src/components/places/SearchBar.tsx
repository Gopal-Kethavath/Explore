import { type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export function SearchBar({ id, size = 'compact' }: { id: string; size?: 'compact' | 'hero' }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const query = params.get('q') ?? ''

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const trimmed = String(data.get('q') ?? '').trim()
    const next = location.pathname === '/explore' ? new URLSearchParams(params) : new URLSearchParams()
    if (trimmed) next.set('q', trimmed)
    else next.delete('q')
    next.delete('page')
    const search = next.toString()
    navigate({ pathname: '/explore', search: search ? `?${search}` : '' })
  }

  const hero = size === 'hero'

  return (
    <form onSubmit={onSubmit} role="search" className={hero ? 'flex flex-col gap-3 sm:flex-row' : 'flex gap-2'}>
      <label htmlFor={id} className="sr-only">
        Search places
      </label>
      <input
        key={query}
        id={id}
        name="q"
        defaultValue={query}
        placeholder="Search forts, lakes, Warangal"
        className={`min-h-11 w-full rounded-full border border-sand-200 bg-white px-4 text-ink placeholder:text-sand-800 ${
          hero ? 'sm:flex-1' : 'min-w-0 flex-1'
        }`}
      />
      <button
        type="submit"
        className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-medium ${
          hero ? 'bg-sand-50 text-ink' : 'bg-lagoon-800 text-sand-50'
        }`}
      >
        Search
      </button>
    </form>
  )
}
