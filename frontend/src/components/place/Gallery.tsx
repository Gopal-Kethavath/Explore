import { useState } from 'react'
import type { Photo } from '../../types/place.ts'
import { PlaceImage } from '../places/PlaceImage.tsx'

export function Gallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [index, setIndex] = useState(0)
  const current = photos[index] ?? null

  return (
    <div className="grid gap-3">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-sand-200 sm:aspect-[2/1]">
        <PlaceImage photo={current} name={name} eager />
      </div>
      {photos.length > 1 ? (
        <div className="flex gap-2" role="list">
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.url}
              type="button"
              role="listitem"
              aria-label={`Show photo ${photoIndex + 1}: ${photo.alt_text}`}
              aria-pressed={photoIndex === index}
              onClick={() => setIndex(photoIndex)}
              className={`h-16 w-24 overflow-hidden rounded-xl border ${
                photoIndex === index ? 'border-lagoon-800' : 'border-transparent'
              }`}
            >
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
