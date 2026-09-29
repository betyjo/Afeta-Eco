import Link from 'next/link'
import { notFound } from 'next/navigation'

const auctions = [
  {
    id: '1',
    title: 'Samsung Galaxy S24',
    seller: 'Tech Market Addis',
    category: 'Electronics',
    description:
      'Samsung Galaxy S24 in excellent condition. Includes the original charger and box.',
    currentBid: 42000,
    startingBid: 35000,
    endsAt: '2026-09-29T18:30:00',
    bids: [
      { bidder: 'Buyer••42', amount: 42000, time: '8 min ago' },
      { bidder: 'Buyer••17', amount: 41000, time: '21 min ago' },
      { bidder: 'Buyer••08', amount: 40000, time: '35 min ago' },
      { bidder: 'Buyer••31', amount: 38000, time: '52 min ago' },
    ],
  },
  {
    id: '2',
    title: 'Traditional Ethiopian Coffee Set',
    seller: 'Habesha Crafts',
    category: 'Home & Craft',
    description:
      'Handcrafted Ethiopian coffee set made for traditional coffee ceremonies.',
    currentBid: 3200,
    startingBid: 2000,
    endsAt: '2026-09-29T21:15:00',
    bids: [
      { bidder: 'Buyer••12', amount: 3200, time: '12 min ago' },
      { bidder: 'Buyer••44', amount: 3000, time: '28 min ago' },
      { bidder: 'Buyer••19', amount: 2600, time: '44 min ago' },
    ],
  },
  {
    id: '3',
    title: 'Solar Panel 550W',
    seller: 'Green Energy Ethiopia',
    category: 'Energy',
    description:
      '550W solar panel suitable for residential and small commercial solar systems.',
    currentBid: 18500,
    startingBid: 15000,
    endsAt: '2026-09-29T23:00:00',
    bids: [
      { bidder: 'Buyer••51', amount: 18500, time: '5 min ago' },
      { bidder: 'Buyer••26', amount: 17500, time: '17 min ago' },
      { bidder: 'Buyer••07', amount: 16500, time: '31 min ago' },
    ],
  },
  {
    id: '4',
    title: 'Handmade Leather Bag',
    seller: 'Addis Leather',
    category: 'Fashion',
    description:
      'Handmade Ethiopian leather bag with a durable design and spacious interior.',
    currentBid: 2800,
    startingBid: 1800,
    endsAt: '2026-09-30T13:00:00',
    bids: [
      { bidder: 'Buyer••33', amount: 2800, time: '18 min ago' },
      { bidder: 'Buyer••11', amount: 2500, time: '41 min ago' },
      { bidder: 'Buyer••22', amount: 2200, time: '1 hr ago' },
    ],
  },
  {
    id: '5',
    title: 'Office Desk',
    seller: 'Addis Furniture',
    category: 'Furniture',
    description:
      'Solid office desk suitable for a home office, business, or study space.',
    currentBid: 7500,
    startingBid: 5000,
    endsAt: '2026-09-30T18:00:00',
    bids: [
      { bidder: 'Buyer••15', amount: 7500, time: '7 min ago' },
      { bidder: 'Buyer••38', amount: 7000, time: '24 min ago' },
      { bidder: 'Buyer••04', amount: 6500, time: '49 min ago' },
    ],
  },
  {
    id: '6',
    title: 'Professional Camera',
    seller: 'Photo Hub Ethiopia',
    category: 'Electronics',
    description:
      'Professional digital camera suitable for photography and content creation.',
    currentBid: 27000,
    startingBid: 22000,
    endsAt: '2026-10-01T14:00:00',
    bids: [
      { bidder: 'Buyer••64', amount: 27000, time: '4 min ago' },
      { bidder: 'Buyer••25', amount: 26000, time: '16 min ago' },
      { bidder: 'Buyer••48', amount: 24500, time: '32 min ago' },
    ],
  },
]

function getAuction(id: string) {
  return auctions.find((auction) => auction.id === id)
}

function AuctionCountdown({ endsAt }: { endsAt: string }) {
  return (
    <div
      className="rounded-2xl bg-green-950 p-5 text-white"
      data-end-time={endsAt}
    >
      <p className="text-sm font-semibold text-green-300">
        Auction ends
      </p>

      <div className="mt-2 grid grid-cols-4 gap-2">
        {[
          ['--', 'Days'],
          ['--', 'Hours'],
          ['--', 'Minutes'],
          ['--', 'Seconds'],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-xl bg-green-900 p-3 text-center"
          >
            <p className="text-2xl font-black">
              {value}
            </p>

            <p className="mt-1 text-[10px] uppercase text-green-300">
              {label}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-green-300">
        Countdown will connect to the live auction timer.
      </p>
    </div>
  )
}

export default async function AuctionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const auction = getAuction(id)

  if (!auction) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="text-3xl font-black text-green-800"
          >
            AFTA
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/Search"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Marketplace
            </Link>

            <Link
              href="/map"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Map
            </Link>

            <Link
              href="/auctions"
              className="font-semibold text-green-700"
            >
              Auctions
            </Link>

            <Link
              href="/vendor/dashboard"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Sell
            </Link>
          </nav>

          <Link
            href="/vendor/login"
            className="rounded-xl bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
          >
            Sign in
          </Link>

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-5 py-8">

        <Link
          href="/auctions"
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to auctions
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">

          {/* LEFT */}
          <div>

            {/* PRODUCT IMAGE */}
            <div className="flex h-[420px] items-center justify-center rounded-3xl bg-green-50">
              <span className="text-8xl">
                {auction.category === 'Electronics'
                  ? '📱'
                  : auction.category === 'Furniture'
                    ? '🪑'
                    : auction.category === 'Fashion'
                      ? '👜'
                      : auction.category === 'Energy'
                        ? '☀️'
                        : '☕'}
              </span>
            </div>

            {/* PRODUCT DETAILS */}
            <section className="mt-6 rounded-3xl border border-green-100 bg-white p-7">

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  {auction.category}
                </span>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                  🔨 Live Auction
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black text-green-950">
                {auction.title}
              </h1>

              <p className="mt-4 leading-7 text-gray-600">
                {auction.description}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-green-50 p-5">
                  <p className="text-sm text-gray-500">
                    Starting bid
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-900">
                    {auction.startingBid.toLocaleString()} ETB
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-5">
                  <p className="text-sm text-gray-500">
                    Current highest bid
                  </p>

                  <p className="mt-1 text-xl font-black text-green-700">
                    {auction.currentBid.toLocaleString()} ETB
                  </p>
                </div>

              </div>

            </section>

            {/* BID HISTORY */}
            <section className="mt-6 rounded-3xl border border-green-100 bg-white p-7">

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-700">
                    Activity
                  </p>

                  <h2 className="text-2xl font-bold text-green-950">
                    Bid history
                  </h2>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {auction.bids.length} bids
                </span>
              </div>

              <div className="mt-6 divide-y divide-gray-100">

                {auction.bids.map((bid, index) => (
                  <div
                    key={`${bid.bidder}-${bid.time}`}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {bid.bidder}
                        </p>

                        <p className="text-xs text-gray-500">
                          {bid.time}
                        </p>
                      </div>

                    </div>

                    <p className="font-bold text-green-700">
                      {bid.amount.toLocaleString()} ETB
                    </p>
                  </div>
                ))}

              </div>
            </section>

          </div>

          {/* RIGHT */}
          <aside className="space-y-6">

            <AuctionCountdown endsAt={auction.endsAt} />

            {/* BID BOX */}
            <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold text-gray-500">
                Current highest bid
              </p>

              <p className="mt-1 text-3xl font-black text-green-700">
                {auction.currentBid.toLocaleString()} ETB
              </p>

              <form className="mt-6">

                <label
                  htmlFor="bid"
                  className="text-sm font-semibold text-gray-700"
                >
                  Your bid
                </label>

                <div className="mt-2 flex overflow-hidden rounded-xl border border-green-200 focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    id="bid"
                    name="bid"
                    type="number"
                    min={auction.currentBid + 1}
                    placeholder={`${auction.currentBid + 1}`}
                    className="w-full px-4 py-3 outline-none"
                  />

                  <span className="flex items-center bg-green-50 px-4 font-semibold text-green-700">
                    ETB
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Your bid must be higher than the current bid.
                </p>

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-green-700 py-3.5 font-bold text-white hover:bg-green-800"
                >
                  Place Bid
                </button>

              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                You will need to sign in before placing a bid.
              </p>

            </section>

            {/* SELLER */}
            <section className="rounded-3xl border border-green-100 bg-white p-6">

              <p className="text-sm font-semibold text-green-700">
                Seller
              </p>

              <div className="mt-4 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-black text-green-700">
                  {auction.seller.charAt(0)}
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    {auction.seller}
                  </h2>

                  <p className="mt-1 text-sm text-green-600">
                    ✓ Verified seller
                  </p>
                </div>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Auctions
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    24
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Rating
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    ★ 4.8
                  </p>
                </div>

              </div>

              <Link
                href="/Search"
                className="mt-5 block rounded-xl border border-green-200 py-3 text-center font-semibold text-green-700 hover:bg-green-50"
              >
                View seller's products
              </Link>

            </section>

            {/* SAFETY */}
            <div className="rounded-2xl bg-green-50 p-5">
              <p className="font-bold text-green-900">
                🛡️ Buy safely on AFTA
              </p>

              <p className="mt-2 text-sm leading-6 text-green-800">
                Check seller verification and product information
                before completing a transaction.
              </p>
            </div>

          </aside>

        </div>
      </div>

    </main>
  )
}