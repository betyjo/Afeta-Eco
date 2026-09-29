"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VendorRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Account could not be created");
      }

      // 2. Create vendor record
      const { error: vendorError } = await supabase.from("vendors").insert({
        user_id: authData.user.id,
        name,
        phone,
        product_name: productName,
        category,
        price: Number(price),
        latitude: Number(latitude),
        longitude: Number(longitude),
        is_available: true,
        is_verified: false,
      });

      if (vendorError) {
        throw new Error(vendorError.message);
      }

      setSuccess("Registration successful!");

      // 3. Go to dashboard
      router.push("/vendor/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2">Become an AFTA Vendor</h1>

        <p className="text-gray-600 mb-8">
          Register your business and let customers find you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Vendor / Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            placeholder="Price (ETB)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full border rounded-lg p-3"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              step="any"
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              step="any"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg p-3 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register as Vendor"}
          </button>
        </form>
      </div>
    </main>
  );
}
