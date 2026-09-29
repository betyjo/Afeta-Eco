"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  verificationId: string;
  status: string;
  existingNotes: string | null;
}

export default function VerificationActions({
  verificationId,
  status,
  existingNotes,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [notes, setNotes] = useState(existingNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reviewVendor(newStatus: "approved" | "rejected") {
    setLoading(true);
    setError("");

    const { error } = await supabase.rpc("review_vendor_verification", {
      p_verification_id: verificationId,
      p_status: newStatus,
      p_notes: notes || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700">
        Review notes
      </label>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this verification..."
        rows={4}
        className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600"
      />

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reviewVendor("approved")}
          disabled={loading}
          className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Processing..." : "✓ Approve Vendor"}
        </button>

        <button
          type="button"
          onClick={() => reviewVendor("rejected")}
          disabled={loading}
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "✕ Reject Vendor"}
        </button>
      </div>

      {status !== "pending" && (
        <p className="mt-4 text-sm text-gray-500">
          Current status: <strong>{status}</strong>
        </p>
      )}
    </div>
  );
}
