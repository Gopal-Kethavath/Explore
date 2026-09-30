import { useEffect } from 'react'

export function AboutPage() {
  useEffect(() => {
    document.title = 'About · Hyderabad Weekends'
  }, [])

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">How this list was chosen</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          Hyderabad Weekends is a curated catalog for trips you can start from the city and finish
          over a Saturday, a Sunday, or one night away. It is a reading and planning site.
        </p>
        <p>
          Distances and drive times are typical estimates from Tank Bund, the road along Hussain
          Sagar. They are stored with each place so the list stays fast, and they are not live
          traffic.
        </p>
        <p>
          Visiting hours are the usual public pattern, including a common weekly holiday where one
          is well known. Gates, last entry, and temple breaks change. Confirm them before you go.
        </p>
        <p>
          Ratings are editorial. They are a guide to how strongly a place earns a weekend slot, not
          a count of visitor reviews.
        </p>
        <p>
          Photographs come from Wikimedia Commons. They remain under the licenses chosen by the
          people who took them.
        </p>
        <p>The site does not sell tickets, hotel rooms, or tours.</p>
      </div>
    </article>
  )
}
