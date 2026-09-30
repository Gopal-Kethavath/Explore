import { apiGet } from './client.ts'
import type { Category, PlaceDetail, PlaceFilters, PlaceList } from '../types/place.ts'

export function fetchCategories() {
  return apiGet<Category[]>('/api/v1/categories')
}

export function fetchPlace(slug: string) {
  return apiGet<PlaceDetail>(`/api/v1/places/${slug}`)
}

export function fetchPlaces(filters: PlaceFilters = {}) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.region) params.set('region', filters.region)
  if (filters.maxDistance != null) params.set('max_distance_km', String(filters.maxDistance))
  if (filters.maxDrive != null) params.set('max_drive_minutes', String(filters.maxDrive))
  if (filters.ticketed != null) params.set('ticketed', String(filters.ticketed))
  filters.tag?.forEach((tag) => params.append('tag', tag))
  if (filters.featured != null) params.set('featured', String(filters.featured))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('page_size', String(filters.pageSize))
  const query = params.toString()
  return apiGet<PlaceList>(`/api/v1/places${query ? `?${query}` : ''}`)
}
