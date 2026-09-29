import { NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(
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

  const { id } = await params

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, user_id, is_verified')
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

  if (vendor.is_verified) {
    return NextResponse.json(
      { error: 'Vendor is already verified.' },
      { status: 409 }
    )
  }

  const { data: existing } = await supabase
    .from('vendor_verifications')
    .select('id, status')
    .eq('vendor_id', id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      {
        verification: existing,
        message: 'Verification is already pending.',
      },
      { status: 200 }
    )
  }

  const { data, error: insertError } = await supabase
    .from('vendor_verifications')
    .insert({
      vendor_id: id,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Verification is already pending.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: insertError.message },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { verification: data },
    { status: 201 }
  )
}