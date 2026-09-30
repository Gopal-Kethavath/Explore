import type { Region } from '../types/place.ts'

export const REGION_LABEL: Record<Region, string> = {
  'in-city': 'In the city',
  'half-day': 'Half-day trip',
  weekend: 'Weekend getaway',
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function formatDrive(minutes: number) {
  if (minutes < 60) return `${minutes} min drive`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (rest === 0) return `${hours} hr drive`
  return `${hours} hr ${rest} min drive`
}

export function formatDistance(km: number) {
  const value = Number.isInteger(km) ? String(km) : km.toFixed(1)
  return `${value} km from Tank Bund`
}

export function dayName(day: number) {
  return DAY_NAMES[day] ?? 'Day'
}

/** API days are Monday = 0. JavaScript's getDay() is Sunday = 0. */
export function todayIndex() {
  return (new Date().getDay() + 6) % 7
}

export const TAG_LABEL: Record<string, string> = {
  family: 'Family',
  photography: 'Photography',
  architecture: 'Architecture',
  quiet: 'Quiet',
  sunset: 'Sunset',
  wildlife: 'Wildlife',
  food: 'Markets',
  'heritage-walk': 'Walking',
  monsoon: 'Monsoon',
}

export function isRegion(value: string | null): value is Region {
  return value === 'in-city' || value === 'half-day' || value === 'weekend'
}
