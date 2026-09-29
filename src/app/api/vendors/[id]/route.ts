import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiUser } from '@/lib/api/auth'

const updateVendorSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(9).max(30).optional(),
  product_name: z.string().trim().min(2).max(150).optional(),
  category: z.string().trim().min(2).max(100).optional(),
  price: z.number().min(0).optional(),
  photo_url: z.string().url().nullable().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  is_available: z.boolean().optional(),
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
    .from('vendors')
    .select('*')
    .eq('id', id)
    .eq('is_available', true)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Vendor not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ vendor: data })
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

  const { id } = await params

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor not found.' },
      { status: 404 }
    )
  }

  if (vendor.user_id !== user.id) {
    return NextResponse.json(
      { error: 'You do not own this vendor listing.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const parsed = updateVendorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid vendor data.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { data, error: updateError } = await supabase
      .from('vendors')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ vendor: data })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}