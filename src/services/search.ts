import { createClient } from '@/lib/supabase/client'

export interface SearchFilters {
  search?: string
  category?: string
  minPrice?: string
  maxPrice?: string
}

export async function searchVendors(filters: SearchFilters) {
  const supabase = createClient()

  let query = supabase
    .from('vendors')
    .select(
      'id, name, product_name, category, price, photo_url, is_available, is_verified'
    )
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (filters.search?.trim()) {
    const search = filters.search.trim()

    query = query.or(
      `product_name.ilike.%${search}%,name.ilike.%${search}%,category.ilike.%${search}%`
    )
  }

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.minPrice) {
    query = query.gte('price', Number(filters.minPrice))
  }

  if (filters.maxPrice) {
    query = query.lte('price', Number(filters.maxPrice))
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}