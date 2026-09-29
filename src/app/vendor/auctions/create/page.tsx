'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const categories = [
  'Agriculture',
  'Electronics',
  'Home',
  'Vehicles',
  'Clothing',
  'Machinery',
  'Other',
]

export default function CreateAuctionPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [duration, setDuration] = useState('24')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleImageChange(file: File | null) {
    setError('')

    if (!file) {
      setImage(null)
      setPreview(null)
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.')
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to create an auction.')
      }

      if (!title.trim()) {
        throw new Error('Auction title is required.')
      }

      if (!category) {
        throw new Error('Please select a category.')
      }

      const startingPrice = Number(startingBid)

      if (!Number.isFinite(startingPrice) || startingPrice <= 0) {
        throw new Error('Starting bid must be greater than zero.')
      }

      const hours = Number(duration)

      if (!Number.isFinite(hours) || hours <= 0) {
        throw new Error('Auction duration must be greater than zero.')
      }

      let imageUrl: string | null = null

      // Upload image first
      if (image) {
        const extension =
          image.name.split('.').pop()?.toLowerCase() || 'jpg'

        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('auction-images')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false,
            contentType: image.type,
          })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        const { data } = supabase.storage
          .from('auction-images')
          .getPublicUrl(filePath)

        imageUrl = data.publicUrl
      }

      const startsAt = new Date()
      const endsAt = new Date(
        startsAt.getTime() + hours * 60 * 60 * 1000
      )

      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .insert({
          seller_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category,
          starting_bid: startingPrice,
          current_bid: startingPrice,
          image_url: imageUrl,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'active',
        })
        .select('id')
        .single()

      if (auctionError) {
        throw new Error(auctionError.message)
      }

      router.push(`/auctions/${auction.id}`)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create auction.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/vendor/auctions"
          className="text-sm font-medium text-green-700 hover:text-green-800"
        >
          ← Back to My Auctions
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              AFTA Auctions
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Create an Auction
            </h1>

            <p className="mt-2 text-gray-600">
              List your product and let buyers compete for it.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Product Image
              </label>

              {preview ? (
                <div className="relative overflow-hidden rounded-2xl border">
                  <img
                    src={preview}
                    alt="Product preview"
                    className="h-72 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleImageChange(null)}
                    className="absolute right-3 top-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow hover:bg-gray-100"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-green-50/50 transition hover:border-green-400 hover:bg-green-50">
                  <div className="text-4xl">📷</div>

                  <p className="mt-3 font-semibold text-gray-800">
                    Add product photo
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    JPG, PNG or WebP · Max 5MB
                  </p>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Product / Auction Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Samsung Galaxy S24"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the product, condition, location, etc."
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="">Select category</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Starting bid */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Starting Bid (ETB)
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                placeholder="1000"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Auction Duration
              </label>

              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">2 days</option>
                <option value="72">3 days</option>
                <option value="168">7 days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 px-6 py-3.5 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Auction...' : 'Create Auction'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}