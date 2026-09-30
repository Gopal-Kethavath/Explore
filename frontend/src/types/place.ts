export type Category = {
  slug: string
  name: string
  description: string
}

export type Photo = {
  url: string
  alt_text: string
  sort_order: number
  is_cover: boolean
}

export type Hours = {
  day_of_week: number
  opens_at: string | null
  closes_at: string | null
  is_closed: boolean
}

export type PlaceCard = {
  slug: string
  name: string
  summary: string
  locality: string
  region: string
  distance_km: number
  drive_time_minutes: number
  rating: number
  is_featured: boolean
  category: Category
  cover_photo: Photo | null
  tags: string[]
  visit_duration: string
  ticketed: boolean
}

export type PlaceDetail = PlaceCard & {
  description: string
  address: string
  latitude: number
  longitude: number
  best_time: string
  entry_fee_note: string
  tips: string
  ticket_indian: string
  ticket_foreign: string
  getting_there: string
  stay_nearby: string
  what_to_pack: string
  highlights: string[]
  photos: Photo[]
  hours: Hours[]
}

export type PlaceList = {
  items: PlaceCard[]
  total: number
  page: number
  page_size: number
}

export type Region = 'in-city' | 'half-day' | 'weekend'
export type SortKey = 'featured' | 'distance' | 'rating' | 'name'

export type PlaceFilters = {
  q?: string
  category?: string
  region?: Region
  maxDistance?: number
  maxDrive?: number
  ticketed?: boolean
  tag?: string[]
  featured?: boolean
  sort?: SortKey
  page?: number
  pageSize?: number
}
