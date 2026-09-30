import { Link } from 'react-router-dom'
import { SearchBar } from '../places/SearchBar.tsx'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl text-ink">
            Hyderabad Weekends
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/explore" className="inline-flex min-h-11 items-center">
              Explore
            </Link>
            <Link to="/about" className="inline-flex min-h-11 items-center">
              About
            </Link>
          </nav>
        </div>
        <div className="sm:ml-auto sm:w-80">
          <SearchBar id="header-search" />
        </div>
      </div>
    </header>
  )
}
