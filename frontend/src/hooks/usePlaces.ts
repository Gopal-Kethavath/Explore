import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchPlace, fetchPlaces } from '../api/places.ts'
import type { PlaceFilters } from '../types/place.ts'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}

export function usePlaces(filters: PlaceFilters, enabled = true) {
  return useQuery({
    queryKey: ['places', filters],
    queryFn: () => fetchPlaces(filters),
    enabled,
  })
}

export function usePlace(slug: string) {
  return useQuery({
    queryKey: ['place', slug],
    queryFn: () => fetchPlace(slug),
    enabled: slug.length > 0,
  })
}
