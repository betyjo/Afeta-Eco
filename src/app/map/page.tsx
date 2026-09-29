import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VendorMap from '@/components/map/map'

interface Vendor {
  id: string
  name: string
  product_name: string
  category: string
  price: number
  photo_url: string | null
  latitude: number | null
  longitude: number | null
  is_available: boolean
  is_verified: boolean
}

export default async function MapPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vendors')
    .select(`
      id,
      name,
      product_name,
      category,
      price,
      photo_url,
      latitude,
      longitude,
      is_available,
      is_verified
    `)
    .eq('is_available', true)
    .order('created_at', {
      ascending: false,
    })

  const vendors = (data ?? []) as Vendor[]

  const vendorsWithLocation = vendors.filter(
    (vendor) =>
      typeof vendor.latitude === 'number' &&
      typeof vendor.longitude === 'number' &&
      Number.isFinite(vendor.latitude) &&
      Number.isFinite(vendor.longitude) &&
      vendor.latitude >= -90 &&
      vendor.latitude <= 90 &&
      vendor.longitude >= -180 &&
      vendor.longitude <= 180
  )

  const vendorsWithoutLocation = vendors.filter(
    (vendor) => !vendorsWithLocation.some((v) => v.id === vendor.id)
  )

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

          <div className="flex gap-2">
            <Link
              href="/Search"
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Marketplace
            </Link>

            <Link
              href="/auctions"
              className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              Auctions
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Find nearby sellers
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Vendor Map
          </h1>

          <p className="mt-2 text-gray-500">
            Explore available sellers and open their profiles
            directly from the map.
          </p>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            We couldn't load the vendor locations right now.
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              {vendorsWithLocation.length > 0 ? (
                <VendorMap vendors={vendorsWithLocation} />
              ) : (
                <div className="flex h-[500px] flex-col items-center justify-center px-6 text-center">
                  <div className="text-5xl">📍</div>

                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    No vendor locations available
                  </h2>

                  <p className="mt-2 max-w-md text-gray-500">
                    Vendors will appear on the map after they
                    provide a valid location.
                  </p>
                </div>
              )}
            </div>

            {/* Vendors without location */}
            {vendorsWithoutLocation.length > 0 && (
              <section className="mt-10">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    Sellers without map location
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    You can still view their product and seller
                    information.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vendorsWithoutLocation.map((vendor) => (
                    <Link
                      key={vendor.id}
                      href={`/vendors/${vendor.id}`}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {vendor.photo_url ? (
                        <img
                          src={vendor.photo_url}
                          alt={vendor.product_name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-green-50 text-3xl">
                          📦
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase text-green-700">
                          {vendor.category}
                        </p>

                        <h3 className="truncate font-bold text-gray-900">
                          {vendor.product_name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {vendor.name}
                        </p>

                        <p className="mt-1 font-bold text-green-700">
                          {Number(
                            vendor.price
                          ).toLocaleString()}{' '}
                          ETB
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* All vendors */}
            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    All sellers
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {vendors.length} available seller
                    {vendors.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {vendors.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                  <p className="text-gray-500">
                    No available sellers yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-green-50 text-5xl">
                          📦
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase text-green-700">
                              {vendor.category}
                            </p>

                            <h3 className="mt-1 font-bold text-gray-900">
                              {vendor.product_name}
                            </h3>
                          </div>

                          {vendor.is_verified && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                              ✓
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {vendor.name}
                        </p>

                        <p className="mt-2 font-bold text-green-700">
                          {Number(
                            vendor.price
                          ).toLocaleString()}{' '}
                          ETB
                        </p>

                        <div className="mt-3 text-sm font-semibold text-green-700">
                          View seller →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}