import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VerificationActions from '../VerificationActions'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VendorVerificationDetail({
  params,
}: PageProps) {
  const { id } = await params

  const supabase = await createClient()

  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/vendor/login')
  }

  // ----------------------------------------------------------
  // Role check
  // ----------------------------------------------------------

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (
    !roleData ||
    !['admin', 'agent'].includes(roleData.role)
  ) {
    redirect('/')
  }

  // ----------------------------------------------------------
  // Vendor
  // ----------------------------------------------------------

  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select(`
      id,
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
      created_at,
      updated_at
    `)
    .eq('id', id)
    .single()

  if (vendorError || !vendor) {
    notFound()
  }

  // ----------------------------------------------------------
  // Verification history
  // ----------------------------------------------------------

  const { data: history } = await supabase
    .from('vendor_verifications')
    .select(`
      id,
      status,
      notes,
      reviewed_by,
      verified_at,
      created_at,
      updated_at
    `)
    .eq('vendor_id', id)
    .order('created_at', {
      ascending: false,
    })

  const currentVerification = history?.[0] ?? null

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-2xl font-black text-green-800">
              AFTA
            </p>

            <p className="text-sm text-gray-500">
              Vendor Verification
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold capitalize text-green-800">
            {roleData.role}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Back */}
        <Link
          href="/admin/vendors"
          className="text-sm font-semibold text-green-700 hover:text-green-900"
        >
          ← Back to vendor verification
        </Link>

        {/* Vendor header */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
          <div className="grid md:grid-cols-[280px_1fr]">
            {/* Image */}
            <div className="h-72 bg-green-50 md:h-full">
              {vendor.photo_url ? (
                <img
                  src={vendor.photo_url}
                  alt={vendor.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-black text-green-700">
                  {vendor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-green-700">
                    Vendor profile
                  </p>

                  <h1 className="mt-1 text-3xl font-bold text-green-950">
                    {vendor.name}
                  </h1>

                  <p className="mt-1 text-gray-600">
                    {vendor.product_name}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    vendor.is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {vendor.is_verified
                    ? '✓ Verified'
                    : 'Not verified'}
                </span>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Info
                  label="Product"
                  value={vendor.product_name}
                />

                <Info
                  label="Category"
                  value={vendor.category}
                />

                <Info
                  label="Price"
                  value={`${vendor.price} ETB`}
                />

                <Info
                  label="Phone"
                  value={vendor.phone}
                />

                <Info
                  label="Availability"
                  value={
                    vendor.is_available
                      ? 'Available'
                      : 'Unavailable'
                  }
                />

                <Info
                  label="Location"
                  value={`${vendor.latitude}, ${vendor.longitude}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current review */}
        <section className="mt-8 rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="font-semibold text-green-700">
              Verification
            </p>

            <h2 className="mt-1 text-2xl font-bold text-green-950">
              Review vendor
            </h2>
          </div>

          {currentVerification ? (
            <VerificationActions
              verificationId={currentVerification.id}
              status={currentVerification.status}
              existingNotes={currentVerification.notes}
            />
          ) : (
            <p className="text-gray-500">
              No verification request has been submitted yet.
            </p>
          )}
        </section>

        {/* Verification history */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="font-semibold text-green-700">
              Audit trail
            </p>

            <h2 className="mt-1 text-2xl font-bold text-green-950">
              Verification history
            </h2>
          </div>

          {history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-green-100 bg-white p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        item.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="text-sm text-gray-500">
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </span>
                  </div>

                  {item.notes && (
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Review notes
                      </p>

                      <p className="mt-1 text-sm text-gray-800">
                        {item.notes}
                      </p>
                    </div>
                  )}

                  {item.reviewed_by && (
                    <p className="mt-4 text-xs text-gray-500">
                      Reviewed by: {item.reviewed_by}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-white p-8 text-center text-gray-500">
              No verification history yet.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>
    </div>
  )
}