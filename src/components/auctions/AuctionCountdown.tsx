'use client'

import { useEffect, useState } from 'react'

interface AuctionCountdownProps {
  endsAt: string
}

function getRemaining(endsAt: string) {
  const difference = new Date(endsAt).getTime() - Date.now()

  if (difference <= 0) {
    return null
  }

  const totalSeconds = Math.floor(difference / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

export default function AuctionCountdown({
  endsAt,
}: AuctionCountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    getRemaining(endsAt)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining(endsAt))
    }, 1000)

    return () => clearInterval(timer)
  }, [endsAt])

  if (!remaining) {
    return (
      <span className="font-semibold text-red-600">
        Ended
      </span>
    )
  }

  if (remaining.days > 0) {
    return (
      <span className="font-semibold text-green-700">
        {remaining.days}d {remaining.hours}h {remaining.minutes}m
      </span>
    )
  }

  return (
    <span className="font-semibold text-green-700">
      {String(remaining.hours).padStart(2, '0')}:
      {String(remaining.minutes).padStart(2, '0')}:
      {String(remaining.seconds).padStart(2, '0')}
    </span>
  )
}