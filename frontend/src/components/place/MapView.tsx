import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function MapView({
  latitude,
  longitude,
  name,
}: {
  latitude: number
  longitude: number
  name: string
}) {
  const node = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = node.current
    if (!element) return
    const map = L.map(element).setView([latitude, longitude], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(name)
    const frame = window.requestAnimationFrame(() => map.invalidateSize())
    return () => {
      window.cancelAnimationFrame(frame)
      map.remove()
    }
  }, [latitude, longitude, name])

  return <div ref={node} className="z-0 h-72 w-full rounded-2xl" role="region" aria-label={`Map of ${name}`} />
}
