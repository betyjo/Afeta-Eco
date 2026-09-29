import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Vendor = {
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
  { name: 'Food', icon: '🥬' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Electronics', icon: '📱' },
  { name: 'Furniture', icon: '🛋️' },
  { name: 'Agriculture', icon: '🌾' },
  { name: 'Other', icon: '📦' },
]

export default async function HomePage() {
  const supabase = await createClient()

  let vendors: Vendor[] = []
  let vendorsAvailable = true

  /*
   * Only use columns that already exist in the vendors table.
   * We deliberately do not query future fields such as:
   * ratings, auction_id, location_name, etc.
   */
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'id, name, product_name, category, price, photo_url, is_available, is_verified'
    )
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Failed to load homepage vendors:', error.message)
    vendorsAvailable = false
  } else {
    vendors = (data ?? []) as Vendor[]
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="text-3xl font-black text-green-800"
          >
            AFTA
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/Search"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Marketplace
            </Link>

            <Link
              href="/map"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Map
            </Link>

            <Link
              href="/auctions"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Auctions
            </Link>

            <Link
              href="/vendor/dashboard"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Sell
            </Link>
          </nav>

          <Link
            href="/vendor/login"
            className="rounded-xl bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
          >
            Sign in
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">

          <div className="max-w-3xl">

            <p className="mb-3 font-semibold text-green-200">
              Ethiopia's local marketplace
            </p>

            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              Find what you need.
              <br />
              Buy from people near you.
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-green-100">
              Discover products, local sellers, and auctions around you
              through one simple marketplace.
            </p>

            <form
              action="/Search"
              className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <input
                name="search"
                type="search"
                placeholder="What are you looking for?"
                className="h-14 flex-1 rounded-xl border-0 bg-white px-5 text-gray-900 outline-none"
              />

              <button
                type="submit"
                className="h-14 rounded-xl bg-yellow-400 px-7 font-bold text-green-950 hover:bg-yellow-300"
              >
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                📍 Find sellers near me
              </Link>

              <Link
                href="/auctions"
                className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                🔨 Browse auctions
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-10">

        <div className="flex items-end justify-between">

          <div>
            <p className="font-semibold text-green-700">
              Explore
            </p>

            <h2 className="text-2xl font-bold text-green-950">
              Browse categories
            </h2>
          </div>

          <Link
            href="/Search"
            className="hidden text-sm font-semibold text-green-700 sm:block"
          >
            View all →
          </Link>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">

          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/Search?category=${encodeURIComponent(category.name)}`}
              className="rounded-2xl border border-green-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
            >
              <div className="text-3xl">
                {category.icon}
              </div>

              <p className="mt-3 font-semibold text-gray-800">
                {category.name}
              </p>
            </Link>
          ))}

        </div>
      </section>

      {/* VENDORS */}
      <section className="mx-auto max-w-7xl px-5 pb-12">

        <div className="flex items-end justify-between">

          <div>
            <p className="font-semibold text-green-700">
              Marketplace
            </p>

            <h2 className="text-2xl font-bold text-green-950">
              Local sellers
            </h2>
          </div>

          <Link
            href="/Search"
            className="text-sm font-semibold text-green-700 hover:text-green-900"
          >
            See all →
          </Link>

        </div>

        {!vendorsAvailable ? (

          /* DATABASE ERROR */
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
            <p className="text-3xl">⚠️</p>

            <h3 className="mt-3 font-bold text-yellow-900">
              Marketplace temporarily unavailable
            </h3>

            <p className="mt-1 text-sm text-yellow-800">
              We couldn't load the current seller listings.
              Please try again later.
            </p>

            <Link
              href="/Search"
              className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Open Marketplace
            </Link>
          </div>

        ) : vendors.length === 0 ? (

          /* EMPTY DATABASE */
          <div className="mt-6 rounded-2xl border border-green-100 bg-white p-10 text-center shadow-sm">

            <p className="text-5xl">
              🛍️
            </p>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              No sellers yet
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Be one of the first businesses to list on AFTA.
            </p>

            <Link
              href="/vendor/register"
              className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Start selling
            </Link>

          </div>

        ) : (

          /* REAL VENDORS */
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {vendors.map((vendor) => (

              <Link
                key={vendor.id}
                href={`/vendors/${encodeURIComponent(vendor.id)}`}
                className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* IMAGE */}
                <div className="h-52 bg-green-50">

                  {vendor.photo_url ? (
                    <img
                      src={vendor.photo_url}
                      alt={vendor.product_name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl">
                        📦
                      </span>
                    </div>
                  )}

                </div>

                {/* INFO */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                        {vendor.category}
                      </p>

                      <h3 className="mt-1 truncate text-lg font-bold text-gray-900 group-hover:text-green-700">
                        {vendor.product_name}
                      </h3>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {vendor.name}
                      </p>

                    </div>

                    {vendor.is_verified && (
                      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                        ✓ Verified
                      </span>
                    )}

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-lg font-black text-green-700">
                      {Number(vendor.price).toLocaleString()} ETB
                    </p>

                    <span className="text-sm font-medium text-green-700">
                      View →
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

      {/* AUCTIONS */}
      <section className="bg-green-950">
        <div className="mx-auto max-w-7xl px-5 py-12">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>
              <p className="font-semibold text-yellow-300">
                AFTA Auctions
              </p>

              <h2 className="mt-1 text-3xl font-black text-white">
                Bid on products you want.
              </h2>

              <p className="mt-2 max-w-xl text-green-200">
                Discover products from local sellers and compete
                with other buyers through auctions.
              </p>
            </div>

            <Link
              href="/auctions"
              className="rounded-xl bg-yellow-400 px-6 py-3 text-center font-bold text-green-950 hover:bg-yellow-300"
            >
              Explore Auctions
            </Link>

          </div>

        </div>
      </section>

      {/* SELL CTA */}
      <section className="mx-auto max-w-7xl px-5 py-12">

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-green-100 md:p-12">

          <p className="font-semibold text-green-700">
            Have something to sell?
          </p>

          <h2 className="mt-2 text-3xl font-black text-green-950">
            Turn your products into a business on AFTA.
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Create your seller profile, list your products,
            reach nearby customers, and get verified.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              href="/vendor/register"
              className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
            >
              Become a seller
            </Link>

            <Link
              href="/map"
              className="rounded-xl border border-green-200 px-6 py-3 font-bold text-green-700 hover:bg-green-50"
            >
              Explore the map
            </Link>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-green-100 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            <span className="font-black text-green-800">
              AFTA
            </span>
            {' '}— Local marketplace for Ethiopia
          </p>

          <div className="flex gap-5">

            <Link
              href="/Search"
              className="hover:text-green-700"
            >
              Marketplace
            </Link>

            <Link
              href="/map"
              className="hover:text-green-700"
            >
              Map
            </Link>

            <Link
              href="/auctions"
              className="hover:text-green-700"
            >
              Auctions
            </Link>

          </div>

        </div>
      </footer>

    </main>
  )
}