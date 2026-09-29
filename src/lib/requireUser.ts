import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/vendor/login')
  }

  return user
}

export async function getUserRole(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.role ?? 'customer'
}