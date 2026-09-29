import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiUser } from '@/lib/api/auth'

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional(),
})

type Params = {
  params: Promise<{ id: string }>
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

  try {
    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid review data.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { data, error: rpcError } =
      await supabase.rpc(
        'review_vendor_verification',
        {
          p_verification_id: id,
          p_status: parsed.data.status,
          p_notes: parsed.data.notes || null,
        }
      )

    if (rpcError) {
      const message = rpcError.message

      if (
        message.includes('not authorized')
      ) {
        return NextResponse.json(
          { error: 'Admin or agent access required.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      verification: data,
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}