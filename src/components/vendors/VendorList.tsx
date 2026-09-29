import VendorCard from './VendorCard'

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

export default function VendorList({
  vendors,
}: {
  vendors: Vendor[]
}) {
  if (vendors.length === 0) {
    return (
      <div className="rounded-2xl border border-green-100 bg-white p-12 text-center">
        <div className="text-5xl">🔎</div>

        <h3 className="mt-4 text-xl font-bold text-green-950">
          No vendors found
        </h3>

        <p className="mt-2 text-gray-500">
          Try changing your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  )
}