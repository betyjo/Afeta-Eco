'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function checkRecoverySession() {
      const { data, error } =
        await supabase.auth.getSession()

      if (error || !data.session) {
        setError(
          'This password reset link is invalid or has expired. Please request a new reset link.'
        )
        setLoading(false)
        return
      }

      setLoading(false)
    }

    checkRecoverySession()
  }, [supabase])

  async function handleUpdatePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters long.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setUpdating(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
      setUpdating(false)
      return
    }

    setSuccess(
      'Your password has been updated successfully.'
    )

    setPassword('')
    setConfirmPassword('')

    setTimeout(() => {
      router.replace('/vendor/login')
      router.refresh()
    }, 1500)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />

          <p className="font-semibold text-gray-700">
            Verifying password reset link...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-green-800">
            AFTA
          </h1>

          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Reset Password
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create a new password for your AFTA account.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            {success}
            <p className="mt-1 text-xs">
              Redirecting you to login...
            </p>
          </div>
        )}

        {!success && !error && (
          <form
            onSubmit={handleUpdatePassword}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                New password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm new password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating
                ? 'Updating password...'
                : 'Update password'}
            </button>
          </form>
        )}

        {error && (
          <button
            type="button"
            onClick={() =>
              router.replace('/vendor/login')
            }
            className="mt-4 w-full rounded-xl border border-green-200 px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
          >
            Back to login
          </button>
        )}
      </div>
    </main>
  )
}