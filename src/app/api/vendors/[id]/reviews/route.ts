import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiUser } from '@/lib/api/auth'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review_text: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional(),
})

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: Request,
  { params }: Params
) {
  const { supabase } = await requireApiUser()
  const { id } = await params

  const { data, error } = await supabase
    .from('vendor_reviews')
    .select(
      'id, vendor_id, reviewer_id, rating, review_text, created_at, updated_at'
    )
    .eq('vendor_id', id)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    reviews: data ?? [],
  })
}

export async function POST(
  request: Request,
  { params }: Params
) {
  const { supabase, user, error } =
    await requireApiUser()

  if (!user) {
    return NextResponse.json(
      { error },
      { status: 401 }
    )
  }

  const { id } = await params

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor not found.' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid review.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { data, error: reviewError } =
      await supabase
        .from('vendor_reviews')
        .insert({
          vendor_id: id,
          reviewer_id: user.id,
          rating: parsed.data.rating,
          review_text:
            parsed.data.review_text || null,
        })
        .select()
        .single()

    if (reviewError) {
      if (reviewError.code === '23505') {
        return NextResponse.json(
          {
            error:
              'You have already reviewed this vendor.',
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: reviewError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { review: data },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}