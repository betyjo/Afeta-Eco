"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditVendorPage() {
  const router = useRouter();
  const supabase = createClient();

  const [vendorId, setVendorId] = useState("");
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadVendor() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/vendor/login");
        return;
      }

      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setError("Could not load your vendor listing.");
        setLoading(false);
        return;
      }

      setVendorId(data.id);
      setName(data.name);
      setPhone(data.phone);
      setProductName(data.product_name);
      setCategory(data.category);
      setPrice(String(data.price));
      setLatitude(String(data.latitude));
      setLongitude(String(data.longitude));
      setIsAvailable(data.is_available);
      setCurrentPhotoUrl(data.photo_url ?? "");

      setLoading(false);
    }

    loadVendor();
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  function removeSelectedImage() {
    setSelectedFile(null);
    setPreviewUrl("");
  }

  async function uploadPhoto(userId: string) {
    if (!selectedFile) {
      return null;
    }

    const extension =
      selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("vendor-images")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedFile.type,
      });

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    const { data } = supabase.storage
      .from("vendor-images")
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
    };
  }

  function getOldPhotoPath(url: string) {
    const marker = "/storage/v1/object/public/vendor-images/";

    const index = url.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.substring(index + marker.length));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    let newPhotoPath: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/vendor/login");
        return;
      }

      let photoUrl = currentPhotoUrl;

      /*
       * Upload the new image first.
       */
      if (selectedFile) {
        const uploaded = await uploadPhoto(user.id);

        if (!uploaded) {
          throw new Error("Could not upload image.");
        }

        photoUrl = uploaded.url;
        newPhotoPath = uploaded.path;
      }

      /*
       * Update the vendor record.
       */
      const { error: updateError } = await supabase
        .from("vendors")
        .update({
          name,
          phone,
          product_name: productName,
          category,
          price: Number(price),
          latitude: Number(latitude),
          longitude: Number(longitude),
          is_available: isAvailable,
          photo_url: photoUrl || null,
        })
        .eq("id", vendorId)
        .eq("user_id", user.id);

      if (updateError) {
        /*
         * If database update fails, remove the newly
         * uploaded image so we don't leave an orphan.
         */
        if (newPhotoPath) {
          await supabase.storage.from("vendor-images").remove([newPhotoPath]);
        }

        throw new Error(updateError.message);
      }

      /*
       * Delete the old image only after the database
       * successfully points to the new one.
       */
      if (selectedFile && currentPhotoUrl && currentPhotoUrl !== photoUrl) {
        const oldPath = getOldPhotoPath(currentPhotoUrl);

        if (oldPath) {
          await supabase.storage.from("vendor-images").remove([oldPath]);
        }
      }

      setCurrentPhotoUrl(photoUrl);
      setSelectedFile(null);
      setPreviewUrl("");

      setSuccess("Listing updated successfully.");

      setTimeout(() => {
        router.push("/vendor/dashboard");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-green-700">Loading your listing...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/vendor/dashboard")}
          className="mb-6 font-semibold text-green-700 hover:text-green-900"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="font-semibold text-green-700">AFTA</p>

            <h1 className="mt-1 text-3xl font-bold text-green-950">
              Edit Listing
            </h1>

            <p className="mt-2 text-gray-600">
              Update the information customers see.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Photo */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Vendor Photo
              </label>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {(previewUrl || currentPhotoUrl) && (
                    <img
                      src={previewUrl || currentPhotoUrl}
                      alt="Vendor preview"
                      className="h-32 w-32 rounded-xl object-cover shadow-sm"
                    />
                  )}

                  {!previewUrl && !currentPhotoUrl && (
                    <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-green-100 text-4xl font-bold text-green-700">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <label
                      htmlFor="vendor-photo"
                      className="inline-block cursor-pointer rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
                    >
                      {currentPhotoUrl || previewUrl
                        ? "Choose New Photo"
                        : "Upload Photo"}
                    </label>

                    <input
                      id="vendor-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <p className="mt-2 text-xs text-gray-600">
                      JPG, PNG, or WebP · Maximum 5 MB
                    </p>

                    {selectedFile && (
                      <p className="mt-2 text-sm font-medium text-green-700">
                        Selected: {selectedFile.name}
                      </p>
                    )}

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove selected photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Business Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Product Name
              </label>

              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Price (ETB)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-green-950">
                    Listing Availability
                  </p>

                  <p className="text-sm text-gray-600">
                    Customers can find you when available.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative h-7 w-12 rounded-full transition ${
                    isAvailable ? "bg-green-600" : "bg-gray-300"
                  }`}
                  aria-label="Toggle availability"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      isAvailable ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <p className="mt-2 text-sm font-semibold text-green-700">
                {isAvailable ? "Currently available" : "Currently unavailable"}
              </p>
            </div>

            {/* Messages */}
            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {success}
              </p>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {saving
                ? selectedFile
                  ? "Uploading & Saving..."
                  : "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
