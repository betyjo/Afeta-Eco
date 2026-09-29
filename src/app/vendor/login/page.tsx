'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VendorLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Login failed. Please try again.')
      setLoading(false)
      return
    }

    // Refresh the auth/session state before entering
    // the protected dashboard.
    router.replace('/vendor/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-4xl font-black text-green-800"
          >
            AFTA
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Vendor Login
          </h1>

          <p className="mt-2 text-gray-600">
            Sign in to manage your AFTA listing.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <Link
                  href="/vendor/forgot-password"
                  className="text-sm font-semibold text-green-700 hover:text-green-800"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </button>

          </form>

          {/* Register */}
          <div className="mt-7 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a vendor account?
            </p>

            <Link
              href="/vendor/register"
              className="mt-2 inline-block font-bold text-green-700 hover:text-green-800"
            >
              Create Vendor Account →
            </Link>
          </div>

        </div>

        {/* Marketplace */}
        <div className="mt-6 text-center">
          <Link
            href="/Search"
            className="text-sm font-semibold text-gray-500 hover:text-green-700"
          >
            ← Continue to marketplace
          </Link>
        </div>

      </div>
    </main>
  )
}