export interface Vendor {
  id: string
  user_id: string
  name: string
  phone: string
  product_name: string
  category: string
  price: number
  photo_url: string | null
  latitude: number
  longitude: number
  is_available: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}