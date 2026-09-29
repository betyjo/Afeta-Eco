'use client'

import { useEffect, useState } from 'react'
import SearchBar from '@/components/Search/SearchBar'
import Filters from '@/components/Search/Filters'
import VendorList from '@/components/vendors/VendorList'
import { searchVendors } from '@/services/search'

export default function SearchPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadVendors() {
    setLoading(true)
    setError('')

    try {
      const data = await searchVendors({
        search,
        category,
        minPrice,
        maxPrice,
      })

      setVendors(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load vendors.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, category, minPrice, maxPrice])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-2xl font-black tracking-tight text-green-800">
              AFTA
            </p>
            <p className="text-xs text-gray-500">
              Find it. Buy it. Sell it.
            </p>
          </div>

          <a
            href="/vendor/dashboard"
            className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Sell on AFTA
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <p className="font-semibold text-green-700">
            AFTA Marketplace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-green-950 sm:text-4xl">
            Find what you need
          </h1>

          <p className="mt-2 text-gray-600">
            Discover products and sellers near you.
          </p>
        </div>

        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
        />

        {/* Filters */}
        <div className="mt-5">
          <Filters
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={setCategory}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-green-950">
              Available products
            </h2>

            {!loading && (
              <span className="text-sm text-gray-500">
                {vendors.length} result
                {vendors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-green-100 bg-white p-12 text-center">
              <p className="font-semibold text-green-700">
                Finding products...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : (
            <VendorList vendors={vendors} />
          )}
        </div>
      </div>
    </main>
  )
}