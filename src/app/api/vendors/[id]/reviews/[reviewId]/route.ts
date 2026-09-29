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
  params: Promise<{
    id: string
    reviewId: string
  }>
}

export async function PATCH(
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

  const { id, reviewId } = await params

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

  const { data, error: updateError } =
    await supabase
      .from('vendor_reviews')
      .update({
        rating: parsed.data.rating,
        review_text:
          parsed.data.review_text || null,
      })
      .eq('id', reviewId)
      .eq('vendor_id', id)
      .eq('reviewer_id', user.id)
      .select()
      .single()

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ review: data })
}

export async function DELETE(
  _request: Request,
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

  const { id, reviewId } = await params

  const { error: deleteError } =
    await supabase
      .from('vendor_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('vendor_id', id)
      .eq('reviewer_id', user.id)

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}