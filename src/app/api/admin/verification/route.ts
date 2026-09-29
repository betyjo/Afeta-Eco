import { NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'

export async function GET() {
  const { supabase, user, error } =
    await requireApiUser()

  if (!user) {
    return NextResponse.json(
      { error },
      { status: 401 }
    )
  }

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (
    !role ||
    !['admin', 'agent'].includes(role.role)
  ) {
    return NextResponse.json(
      { error: 'Admin or agent access required.' },
      { status: 403 }
    )
  }

  const { data, error: queryError } =
    await supabase
      .from('vendor_verifications')
      .select(`
        id,
        vendor_id,
        status,
        notes,
        reviewed_by,
        verified_at,
        created_at,
        updated_at,
        vendors (
          id,
          name,
          phone,
          product_name,
          category,
          price,
          photo_url,
          is_available,
          is_verified
        )
      `)
      .order('created_at', {
        ascending: false,
      })

  if (queryError) {
    return NextResponse.json(
      { error: queryError.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    verifications: data ?? [],
  })
}