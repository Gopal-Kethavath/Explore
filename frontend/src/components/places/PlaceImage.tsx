import { useState } from 'react'
import type { Photo } from '../../types/place.ts'

export function PlaceImage({
  photo,
  name,
  eager = false,
}: {
  photo: Photo | null
  name: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)

  if (!photo || failed) {
    return (
      <div
        className="flex h-full w-full items-end bg-lagoon-800 p-4 text-sand-50"
        role="img"
        aria-label={name}
      >
        <span className="font-display text-2xl leading-tight">{name}</span>
      </div>
    )
  }

  return (
    <img
      src={photo.url}
      alt={photo.alt_text}
      loading={eager ? 'eager' : 'lazy'}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}
