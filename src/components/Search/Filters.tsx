'use client'

interface FiltersProps {
  category: string
  minPrice: string
  maxPrice: string
  onCategoryChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
}

export default function Filters({
  category,
  minPrice,
  maxPrice,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
}: FiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-green-100 bg-white p-5 md:grid-cols-3">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Category
        </label>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
        >
          <option value="">All categories</option>
          <option value="Food">Food</option>
          <option value="Clothing">Clothing</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Construction">Construction</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Minimum price
        </label>

        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          placeholder="0 ETB"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Maximum price
        </label>

        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          placeholder="Any price"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
        />
      </div>
    </div>
  )
}