import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VerificationActions from './VerificationActions'

export default async function AdminVendorsPage() {
  const supabase = await createClient()

  // ----------------------------------------------------------
  // Get current user
  // ----------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/vendor/login')
  }

  // ----------------------------------------------------------
  // Check role
  // ----------------------------------------------------------

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (
    roleError ||
    !roleData ||
    !['admin', 'agent'].includes(roleData.role)
  ) {
    redirect('/')
  }

  // ----------------------------------------------------------
  // Load verification requests
  // ----------------------------------------------------------

  const { data: verifications, error } = await supabase
    .from('vendor_verifications')
    .select(`
      id,
      status,
      notes,
      created_at,
      verified_at,
      vendor:vendors (
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
        is_verified
      )
    `)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Could not load verification requests.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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
        <div className="mb-8">
          <p className="font-semibold text-green-700">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-green-950">
            Vendor Verification
          </h1>

          <p className="mt-2 text-gray-600">
            Review and manage AFTA seller verification requests.
          </p>
        </div>

        {verifications.length === 0 ? (
          <div className="rounded-2xl border border-green-100 bg-white p-12 text-center">
            <p className="font-semibold text-green-800">
              No verification requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {verifications.map((verification: any) => {
              const vendor = verification.vendor

              return (
                <div
                  key={verification.id}
                  className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-6 p-6 md:flex-row">
                    {/* Vendor image */}
                    <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-green-50 md:w-40">
                      {vendor?.photo_url ? (
                        <img
                          src={vendor.photo_url}
                          alt={vendor.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-bold text-green-700">
                          {vendor?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Vendor information */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-green-950">
                            {vendor?.name}
                          </h2>

                          <p className="text-gray-600">
                            {vendor?.product_name}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            verification.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : verification.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {verification.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <span className="text-gray-500">
                            Category
                          </span>

                          <p className="font-semibold text-gray-900">
                            {vendor?.category}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">
                            Price
                          </span>

                          <p className="font-semibold text-green-700">
                            {vendor?.price} ETB
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">
                            Phone
                          </span>

                          <p className="font-semibold text-gray-900">
                            {vendor?.phone}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">
                            Available
                          </span>

                          <p className="font-semibold text-gray-900">
                            {vendor?.is_available
                              ? 'Yes'
                              : 'No'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <VerificationActions
                          verificationId={verification.id}
                          status={verification.status}
                          existingNotes={verification.notes}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}