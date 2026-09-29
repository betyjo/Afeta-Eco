import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiUser } from '@/lib/api/auth'

const vendorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(9).max(30),
  product_name: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(100),
  price: z.number().min(0),
  photo_url: z.string().url().nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  is_available: z.boolean().optional(),
})

export async function POST(request: Request) {
  const { supabase, user, error } = await requireApiUser()

  if (!user) {
    return NextResponse.json(
      { error },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const parsed = vendorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid vendor data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingVendor) {
      return NextResponse.json(
        {
          error: 'You already have a vendor listing.',
        },
        { status: 409 }
      )
    }

    const { data, error: insertError } = await supabase
      .from('vendors')
      .insert({
        ...parsed.data,
        user_id: user.id,
        is_available: parsed.data.is_available ?? true,
        is_verified: false,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { vendor: data },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}