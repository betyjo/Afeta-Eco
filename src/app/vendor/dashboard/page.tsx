import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SignOutButton from '@/components/auth/SignOutButton'
import RequestVerificationButton from '@/components/vendors/RequestVerificationButton'

export default async function VendorDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-50 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Not logged in
          </h1>

          <p className="mt-2 text-gray-600">
            Please log in to access your vendor dashboard.
          </p>

          <Link
            href="/vendor/login"
            className="mt-5 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  // ----------------------------------------------------------
  // Load vendor
  // ----------------------------------------------------------

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !vendor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-50 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Vendor not found
          </h1>

          <p className="mt-2 text-gray-600">
            We couldn't find your vendor listing.
          </p>
        </div>
      </main>
    )
  }

  // ----------------------------------------------------------
  // Load current pending verification request
  // ----------------------------------------------------------

  const { data: verification } = await supabase
    .from('vendor_verifications')
    .select('status, notes, created_at')
    .eq('vendor_id', vendor.id)
    .eq('status', 'pending')
    .maybeSingle()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-2xl font-black text-green-800">
              AFTA
            </p>

            <p className="text-sm text-gray-500">
              Vendor Dashboard
            </p>
          </div>

          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Page heading */}
        <div className="mb-8">
          <p className="font-semibold text-green-700">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold text-green-950">
            {vendor.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your AFTA listing and verification.
          </p>
        </div>

        {/* Vendor profile */}
        <section className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">

          <div className="grid md:grid-cols-[240px_1fr]">

            {/* Vendor image */}
            <div className="h-64 bg-green-50 md:h-full">
              {vendor.photo_url ? (
                <img
                  src={vendor.photo_url}
                  alt={vendor.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-black text-green-700">
                  {vendor.name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Vendor details */}
            <div className="p-7">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {vendor.name}
                  </h2>

                  <p className="mt-1 text-gray-600">
                    {vendor.product_name}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    vendor.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {vendor.is_available
                    ? 'Available'
                    : 'Unavailable'}
                </span>

              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {vendor.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Product
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {vendor.product_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {vendor.category}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Price
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {Number(
                      vendor.price
                    ).toLocaleString()}{' '}
                    ETB
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Verification
                  </p>

                  <p
                    className={`mt-1 font-semibold ${
                      vendor.is_verified
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {vendor.is_verified
                      ? '✓ Verified'
                      : 'Not verified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Account email
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>

              </div>

              {/* Edit button */}
              <div className="mt-7">
                <Link
                  href="/vendor/edit"
                  className="inline-block rounded-xl border border-green-200 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-50"
                >
                  Edit Listing
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* Verification section */}
        <section className="mt-8">
          <RequestVerificationButton
            vendorId={vendor.id}
            initialStatus={
              vendor.is_verified
                ? 'approved'
                : verification?.status ?? null
            }
          />
        </section>

        {/* Pending request information */}
        {verification?.status === 'pending' && (
          <section className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

            <div className="flex items-start gap-3">

              <div className="text-xl">
                ⏳
              </div>

              <div>
                <h3 className="font-bold text-yellow-900">
                  Verification under review
                </h3>

                <p className="mt-1 text-sm text-yellow-800">
                  Your verification request was submitted
                  successfully and is waiting for an
                  administrator or agent to review it.
                </p>

                {verification.created_at && (
                  <p className="mt-2 text-xs text-yellow-700">
                    Submitted{' '}
                    {new Date(
                      verification.created_at
                    ).toLocaleString()}
                  </p>
                )}
              </div>

            </div>
          </section>
        )}

        {/* Quick actions */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <Link
            href="/Search"
            className="rounded-2xl border border-green-100 bg-white p-6 transition hover:border-green-300 hover:shadow-sm"
          >
            <p className="text-2xl">🛍️</p>

            <h3 className="mt-3 font-bold text-green-950">
              Marketplace
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View the AFTA marketplace.
            </p>
          </Link>

          <Link
            href="/map"
            className="rounded-2xl border border-green-100 bg-white p-6 transition hover:border-green-300 hover:shadow-sm"
          >
            <p className="text-2xl">📍</p>

            <h3 className="mt-3 font-bold text-green-950">
              Vendor Map
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              See sellers on the map.
            </p>
          </Link>

          <Link
            href="/vendor/edit"
            className="rounded-2xl border border-green-100 bg-white p-6 transition hover:border-green-300 hover:shadow-sm"
          >
            <p className="text-2xl">⚙️</p>

            <h3 className="mt-3 font-bold text-green-950">
              Manage Listing
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Update your business information.
            </p>
          </Link>

        </section>

      </div>
    </main>
  )
}