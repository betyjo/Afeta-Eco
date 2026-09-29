'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Vendor {
  id: string
  name: string
  product_name: string
  category: string
  price: number
  photo_url: string | null
  is_available: boolean
  is_verified: boolean
}

const categories = [
  'Food',
  'Agriculture',
  'Electronics',
  'Clothing',
  'Home',
  'Machinery',
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  useEffect(() => {
    async function loadVendors() {
      setLoading(true)

      let query = supabase
        .from('vendors')
        .select(`
          id,
          name,
          product_name,
          category,
          price,
          photo_url,
          is_available,
          is_verified
        `)
        .eq('is_available', true)
        .order('created_at', {
          ascending: false,
        })

      if (search.trim()) {
        query = query.or(
          `product_name.ilike.%${search.trim()}%,name.ilike.%${search.trim()}%,category.ilike.%${search.trim()}%`
        )
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (minPrice) {
        query = query.gte('price', Number(minPrice))
      }

      if (maxPrice) {
        query = query.lte('price', Number(maxPrice))
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        setVendors([])
      } else {
        setVendors((data ?? []) as Vendor[])
      }

      setLoading(false)
    }

    loadVendors()
  }, [search, category, minPrice, maxPrice])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-black text-green-700"
          >
            AFTA
          </Link>

          <Link
            href="/auctions"
            className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            Auctions
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900">
          Marketplace
        </h1>

        <p className="mt-2 text-gray-500">
          Find products from local sellers.
        </p>

        {/* Search */}
        <form
          action="/Search"
          className="mt-6 flex flex-col gap-3 md:flex-row"
        >
          <input
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="flex-1 rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-600"
          />

          {category && (
            <input
              type="hidden"
              name="category"
              value={category}
            />
          )}

          <button
            type="submit"
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
          >
            Search
          </button>
        </form>

        {/* Categories */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/Search"
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              !category
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-700 hover:bg-green-50'
            }`}
          >
            All
          </Link>

          {categories.map((item) => (
            <Link
              key={item}
              href={`/Search?category=${encodeURIComponent(item)}`}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                category === item
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-50'
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading products...
            </div>
          ) : vendors.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <div className="text-5xl">🔎</div>

              <h2 className="mt-4 text-xl font-bold">
                No products found
              </h2>

              <p className="mt-2 text-gray-500">
                Try another search or category.
              </p>

              <Link
                href="/Search"
                className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white"
              >
                View all products
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">
                {vendors.length} product
                {vendors.length !== 1 ? 's' : ''} found
              </p>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vendors.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.id}`}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {vendor.photo_url ? (
                      <img
                        src={vendor.photo_url}
                        alt={vendor.product_name}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-green-50 text-5xl">
                        📦
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase text-green-700">
                            {vendor.category}
                          </p>

                          <h2 className="mt-1 font-bold text-gray-900">
                            {vendor.product_name}
                          </h2>
                        </div>

                        {vendor.is_verified && (
                          <span className="text-sm text-green-700">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xl font-black text-green-700">
                        {Number(vendor.price).toLocaleString()} ETB
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {vendor.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}