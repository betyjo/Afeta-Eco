import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Vendor {
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
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      id,
      user_id,
      name,
      phone,
      product_name,
      category,
      price,
      photo_url,
      latitude,
      longitude,
      is_available,
      is_verified,
      created_at
    `)
    .eq('id', id)
    .eq('is_available', true)
    .single()

  if (error || !vendor) {
    notFound()
  }

  const seller = vendor as Vendor

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-black text-green-700"
          >
            AFTA
          </Link>

          <div className="flex gap-2">
            <Link
              href="/Search"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Marketplace
            </Link>

            <Link
              href="/auctions"
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              Auctions
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/Search"
          className="text-sm font-medium text-green-700 hover:text-green-800"
        >
          ← Back to Marketplace
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          {/* Product image */}
          <div className="grid md:grid-cols-2">
            <div className="bg-green-50">
              {seller.photo_url ? (
                <img
                  src={seller.photo_url}
                  alt={seller.product_name}
                  className="h-[420px] w-full object-cover md:h-full"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-7xl md:h-full">
                  📦
                </div>
              )}
            </div>

            {/* Product information */}
            <div className="p-6 md:p-10">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700">
                  {seller.category}
                </span>

                {seller.is_verified && (
                  <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">
                    ✓ Verified Seller
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-black text-gray-900 md:text-4xl">
                {seller.product_name}
              </h1>

              <p className="mt-4 text-3xl font-black text-green-700">
                {Number(seller.price).toLocaleString()} ETB
              </p>

              <div className="mt-8 border-t pt-6">
                <p className="text-sm text-gray-500">
                  Seller
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {seller.name}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      seller.is_available
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  />

                  <span className="text-gray-600">
                    {seller.is_available
                      ? 'Currently available'
                      : 'Currently unavailable'}
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-6">
                <a
                  href={`tel:${seller.phone}`}
                  className="block w-full rounded-xl bg-green-700 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-green-800"
                >
                  Contact Seller
                </a>
              </div>

              {/* Location */}
              <div className="mt-6 rounded-2xl bg-green-50 p-5">
                <h2 className="font-bold text-gray-900">
                  Seller Location
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Latitude: {seller.latitude}
                </p>

                <p className="text-sm text-gray-600">
                  Longitude: {seller.longitude}
                </p>

                <Link
                  href={`/map?vendor=${seller.id}`}
                  className="mt-4 inline-block font-semibold text-green-700 hover:text-green-800"
                >
                  View on map →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}