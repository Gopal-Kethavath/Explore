import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found · Hyderabad Weekends'
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl">This page does not exist</h1>
      <p className="mt-3 text-sand-800">The address may be mistyped, or the page was never added.</p>
      <Link to="/explore" className="mt-4 inline-flex min-h-11 items-center text-lagoon-800 underline">
        Browse places
      </Link>
    </div>
  )
}
