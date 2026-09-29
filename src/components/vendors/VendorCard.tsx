import Link from 'next/link'

interface VendorCardProps {
  vendor: {
    id: string
    name: string
    product_name: string
    category: string
    price: number
    photo_url: string | null
    latitude?: number | null
    longitude?: number | null
    is_available: boolean
    is_verified: boolean
  }
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const hasLocation =
    typeof vendor.latitude === 'number' &&
    typeof vendor.longitude === 'number' &&
    Number.isFinite(vendor.latitude) &&
    Number.isFinite(vendor.longitude)

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {vendor.photo_url ? (
          <img
            src={vendor.photo_url}
            alt={vendor.product_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            📦
          </div>
        )}

        {/* Verification badge */}
        {vendor.is_verified && (
          <span className="absolute left-3 top-3 rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white shadow">
            ✓ Verified
          </span>
        )}

        {/* Location status badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow ${
            hasLocation
              ? 'bg-white text-green-700'
              : 'bg-white text-orange-600'
          }`}
        >
          {hasLocation ? '📍 On map' : '⚠ Location needed'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
          {vendor.category}
        </p>

        <h3 className="mt-1 text-lg font-bold text-gray-900">
          {vendor.product_name}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Seller: {vendor.name}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-green-700">
            {Number(vendor.price).toLocaleString()} ETB
          </p>

          <span
            className={`text-xs font-medium ${
              vendor.is_available
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            {vendor.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Clear location explanation */}
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            hasLocation
              ? 'bg-green-50 text-green-700'
              : 'bg-orange-50 text-orange-700'
          }`}
        >
          {hasLocation
            ? 'This seller can be found on the AFTA map.'
            : 'This seller does not have a map location yet.'}
        </div>
      </div>
    </Link>
  )
}