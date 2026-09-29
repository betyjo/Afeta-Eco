import { createClient } from '@/lib/supabase/server'

export async function getApiUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      supabase,
      user: null,
    }
  }

  return {
    supabase,
    user,
  }
}

export async function requireApiUser() {
  const result = await getApiUser()

  if (!result.user) {
    return {
      ...result,
      error: 'Unauthorized',
    }
  }

  return {
    ...result,
    error: null,
  }
}