import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuctionCountdown from '@/components/auctions/AuctionCountdown'

interface Auction {
  id: string
  seller_id: string
  title: string
  description: string | null
  category: string
  starting_bid: number
  current_bid: number
  image_url: string | null
  starts_at: string
  ends_at: string
  status: string
}

interface Vendor {
  user_id: string
  name: string
  is_verified: boolean
}

export default async function AuctionsPage() {
  const supabase = await createClient()

  const { data: auctions, error } = await supabase
    .from('auctions')
    .select(`
      id,
      seller_id,
      title,
      description,
      category,
      starting_bid,
      current_bid,
      image_url,
      starts_at,
      ends_at,
      status
    `)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: true })

  if (error) {
    console.error('Failed to load auctions:', error)
  }

  const auctionList = (auctions ?? []) as Auction[]

  // Get seller information from vendors
  const sellerIds = [
    ...new Set(auctionList.map((auction) => auction.seller_id)),
  ]

  let vendors: Vendor[] = []

  if (sellerIds.length > 0) {
    const { data } = await supabase
      .from('vendors')
      .select('user_id, name, is_verified')
      .in('user_id', sellerIds)

    vendors = (data ?? []) as Vendor[]
  }

  const sellerMap = new Map(
    vendors.map((vendor) => [vendor.user_id, vendor])
  )

  // Get bid counts
  const auctionIds = auctionList.map((auction) => auction.id)

  let bidCounts: Record<string, number> = {}

  if (auctionIds.length > 0) {
    const { data: bids } = await supabase
      .from('auction_bids')
      .select('auction_id')
      .in('auction_id', auctionIds)

    if (bids) {
      bidCounts = bids.reduce<Record<string, number>>(
        (counts, bid) => {
          counts[bid.auction_id] =
            (counts[bid.auction_id] ?? 0) + 1

          return counts
        },
        {}
      )
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-green-700"
          >
            AFTA
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/Search"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Marketplace
            </Link>

            <Link
              href="/vendor/auctions/create"
              className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              Sell by Auction
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-800">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-green-200">
            AFTA Auctions
          </p>

          <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">
            Bid. Compete. Own it.
          </h1>

          <p className="mt-4 max-w-2xl text-green-100">
            Discover products from local sellers and place your
            bid before the auction ends.
          </p>
        </div>
      </section>

      {/* Auctions */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Live Auctions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {auctionList.length} auction
              {auctionList.length !== 1 ? 's' : ''} currently live
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            We couldn't load the auctions right now.
          </div>
        ) : auctionList.length === 0 ? (
          <div className="rounded-2xl border border-green-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl">🔨</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No live auctions yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              New auctions will appear here when sellers list
              their products.
            </p>

            <Link
              href="/vendor/auctions/create"
              className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Create an Auction
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {auctionList.map((auction) => {
              const seller = sellerMap.get(auction.seller_id)
              const bidCount = bidCounts[auction.id] ?? 0

              return (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative">
                    {auction.image_url ? (
                      <img
                        src={auction.image_url}
                        alt={auction.title}
                        className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-64 w-full items-center justify-center bg-green-50 text-6xl">
                        📦
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-green-700 px-3 py-1.5 text-xs font-bold text-white shadow">
                      LIVE
                    </div>

                    {seller?.is_verified && (
                      <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                      {auction.category}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-xl font-bold text-gray-900">
                      {auction.title}
                    </h3>

                    {/* Seller */}
                    <p className="mt-2 text-sm text-gray-500">
                      Seller:{' '}
                      <span className="font-medium text-gray-700">
                        {seller?.name ?? 'AFTA Seller'}
                      </span>
                    </p>

                    {/* Bid */}
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          Current bid
                        </p>

                        <p className="text-2xl font-black text-green-700">
                          {Number(
                            auction.current_bid
                          ).toLocaleString()}{' '}
                          <span className="text-sm font-semibold">
                            ETB
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Bids
                        </p>

                        <p className="font-bold text-gray-900">
                          {bidCount}
                        </p>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className="mt-5 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                      <span className="text-sm text-gray-600">
                        Ends in
                      </span>

                      <AuctionCountdown
                        endsAt={auction.ends_at}
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-green-700 py-3 text-center font-semibold text-white transition group-hover:bg-green-800">
                      View & Bid
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}