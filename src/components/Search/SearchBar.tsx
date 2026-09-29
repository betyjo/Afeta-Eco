'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for products..."
        className="w-full rounded-2xl border border-green-100 bg-white px-5 py-4 pl-12 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
      />

      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
        🔍
      </span>
    </div>
  )
}