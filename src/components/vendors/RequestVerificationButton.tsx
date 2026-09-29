'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  vendorId: string
  initialStatus: string | null
}

export default function RequestVerificationButton({
  vendorId,
  initialStatus,
}: Props) {
  const supabase = createClient()

  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function requestVerification() {
    setLoading(true)
    setMessage('')
    setError('')

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to request verification.')
      setLoading(false)
      return
    }

    // Check for an existing pending request
    const { data: existingRequest, error: checkError } =
      await supabase
        .from('vendor_verifications')
        .select('id, status')
        .eq('vendor_id', vendorId)
        .eq('status', 'pending')
        .maybeSingle()

    if (checkError) {
      setError(checkError.message)
      setLoading(false)
      return
    }

    if (existingRequest) {
      setStatus('pending')
      setMessage(
        'Your verification request is already pending.'
      )
      setLoading(false)
      return
    }

    // Create verification request
    const { error: insertError } = await supabase
      .from('vendor_verifications')
      .insert({
        vendor_id: vendorId,
        status: 'pending',
      })

    if (insertError) {
      // Database unique index also protects against
      // duplicate requests created at the same time.
      if (insertError.code === '23505') {
        setStatus('pending')
        setMessage(
          'Your verification request is already pending.'
        )
      } else {
        setError(insertError.message)
      }

      setLoading(false)
      return
    }

    setStatus('pending')
    setMessage(
      'Verification request submitted successfully.'
    )

    setLoading(false)
  }

  if (status === 'approved') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="font-bold text-green-800">
          ✓ Your vendor account is verified
        </p>

        <p className="mt-1 text-sm text-green-700">
          Your listing has been approved by AFTA.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-6">
      <div>
        <p className="font-semibold text-green-800">
          Vendor Verification
        </p>

        <h2 className="mt-1 text-xl font-bold text-gray-900">
          Verify your business
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Verification helps customers identify trusted
          sellers on AFTA.
        </p>
      </div>

      {status === 'pending' ? (
        <div className="mt-5 rounded-xl bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-800">
            Verification pending
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            Your request has been submitted and is waiting
            for an administrator to review it.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={requestVerification}
          disabled={loading}
          className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? 'Submitting...'
            : 'Request Verification'}
        </button>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}