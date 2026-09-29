'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const VendorMap = dynamic(
  () => import('@/components/map/map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-green-50">
        <p className="font-semibold text-green-700">
          Loading map...
        </p>
      </div>
    ),
  }
)

interface Vendor {
  id: string
  name: string
  product_name: string
  price: number
  latitude: number
  longitude: number
  photo_url: string | null
  is_verified: boolean
}

export default function MapPage() {
  const searchParams = useSearchParams()

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [userLocation, setUserLocation] =
    useState<[number, number] | null>(null)

  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadVendors() {
      setLoading(true)
      setError('')

      const supabase = createClient()

      let query = supabase
        .from('vendors')
        .select(
          'id, name, product_name, price, latitude, longitude, photo_url, is_verified'
        )
        .eq('is_available', true)

      // Search
      if (search.trim()) {
        query = query.or(
          `product_name.ilike.%${search}%,name.ilike.%${search}%,category.ilike.%${search}%`
        )
      }

      // Category
      if (category) {
        query = query.eq('category', category)
      }

      // Minimum price
      if (minPrice) {
        query = query.gte('price', Number(minPrice))
      }

      // Maximum price
      if (maxPrice) {
        query = query.lte('price', Number(maxPrice))
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
      } else {
        setVendors(data ?? [])
      }

      setLoading(false)
    }

    loadVendors()
  }, [search, category, minPrice, maxPrice])

  function findMyLocation() {
    if (!navigator.geolocation) {
      setError('Your browser does not support location services.')
      return
    }

    setLocationLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ])

        setLocationLoading(false)
      },
      () => {
        setError(
          'Could not access your location. Please allow location access in your browser.'
        )

        setLocationLoading(false)
      }
    )
  }

  const hasFilters =
    search || category || minPrice || maxPrice

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/Search"
            className="text-2xl font-black text-green-800"
          >
            AFTA
          </Link>

          <Link
            href="/Search"
            className="rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Search products
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Title */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-green-700">
              AFTA Marketplace
            </p>

            <h1 className="mt-1 text-3xl font-bold text-green-950">
              Find sellers near you
            </h1>

            <p className="mt-2 text-gray-600">
              {hasFilters
                ? 'Showing sellers that match your search.'
                : 'Explore available products around your location.'}
            </p>
          </div>

          <button
            onClick={findMyLocation}
            disabled={locationLoading}
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {locationLoading
              ? 'Finding you...'
              : '📍 Find my location'}
          </button>
        </div>

        {/* Active search */}
        {hasFilters && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-green-900">
                Filters:
              </span>

              {search && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                  Search: {search}
                </span>
              )}

              {category && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                  Category: {category}
                </span>
              )}

              {minPrice && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                  Min: {minPrice} ETB
                </span>
              )}

              {maxPrice && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                  Max: {maxPrice} ETB
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Map */}
        <div className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-green-950">
                Vendor map
              </h2>

              <p className="text-sm text-gray-500">
                {loading
                  ? 'Loading vendors...'
                  : `${vendors.length} matching seller${
                      vendors.length === 1 ? '' : 's'
                    }`}
              </p>
            </div>
          </div>

          <div className="h-[650px]">
            {!loading && (
              <VendorMap
                vendors={vendors}
                userLocation={userLocation}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}