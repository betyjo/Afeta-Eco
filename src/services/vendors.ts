import { createClient } from '@/lib/supabase/server'
import type { VendorFormData } from '@/lib/validations/vendor'

export async function createVendor(data: VendorFormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('You must be logged in to create a vendor listing')
  }

  const { data: vendor, error } = await supabase
    .from('vendors')
    .insert({
      user_id: user.id,
      ...data,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return vendor as VendorFormData
}