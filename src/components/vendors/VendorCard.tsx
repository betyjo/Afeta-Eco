import Link from 'next/link'

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

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-52 bg-green-50">
        {vendor.photo_url ? (
          <img
            src={vendor.photo_url}
            alt={vendor.product_name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-bold text-green-200">
            {vendor.product_name.charAt(0).toUpperCase()}
          </div>
        )}

        {vendor.is_verified && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700 shadow">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-green-950">
              {vendor.product_name}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {vendor.name}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              vendor.is_available
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {vendor.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-green-700">
            {Number(vendor.price).toLocaleString()} ETB
          </p>

          <span className="text-sm text-gray-400">
            {vendor.category}
          </span>
        </div>
      </div>
    </Link>
  )
}