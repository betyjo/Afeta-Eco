import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params

    // Validate auction ID
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid auction ID.',
        },
        { status: 400 }
      )
    }

    // Read request body
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid JSON request body.',
        },
        { status: 400 }
      )
    }

    // Validate bid amount
    if (
      typeof body !== 'object' ||
      body === null ||
      !('amount' in body)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bid amount is required.',
        },
        { status: 400 }
      )
    }

    const amount = Number((body as { amount: unknown }).amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bid amount must be a positive number.',
        },
        { status: 400 }
      )
    }

    // Optional: prevent unreasonable decimal precision
    if (Math.round(amount * 100) !== amount * 100) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Bid amount can have at most two decimal places.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You must be logged in to place a bid.',
        },
        { status: 401 }
      )
    }

    // Call the atomic database RPC
    const { data, error } = await supabase.rpc(
      'place_auction_bid',
      {
        p_auction_id: id,
        p_amount: amount,
      }
    )

    if (error) {
      const message = error.message || 'Unable to place bid.'

      // Errors raised by the database validation
      if (message.includes('Auction not found')) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Auction not found.',
          },
          { status: 404 }
        )
      }

      if (message.includes('not active')) {
        return NextResponse.json(
          {
            ok: false,
            error: 'This auction is no longer active.',
          },
          { status: 409 }
        )
      }

      if (message.includes('has ended')) {
        return NextResponse.json(
          {
            ok: false,
            error: 'This auction has ended.',
          },
          { status: 409 }
        )
      }

      if (message.includes('higher than the current bid')) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          ok: false,
          error: message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Bid placed successfully.',
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Place bid API error:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'An unexpected error occurred while placing the bid.',
      },
      { status: 500 }
    )
  }
}