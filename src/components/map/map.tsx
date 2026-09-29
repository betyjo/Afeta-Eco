'use client'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { useEffect } from 'react'

interface Vendor {
  id: string
  name: string
  product_name: string
  price: number
  latitude: number
  longitude: number
  photo_url: string | null
  is_verified: boolean
}

interface MapProps {
  vendors: Vendor[]
  userLocation?: [number, number] | null
}

const vendorIcon = new L.Icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="
      width:18px;
      height:18px;
      background:#15803d;
      border:4px solid white;
      border-radius:50%;
      box-shadow:0 1px 6px rgba(0,0,0,.4);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function MapCenter({
  location,
}: {
  location: [number, number] | null
}) {
  const map = useMap()

  useEffect(() => {
    if (location) {
      map.setView(location, 13)
    }
  }, [location, map])

  return null
}

export default function VendorMap({
  vendors,
  userLocation = null,
}: MapProps) {
  const defaultCenter: [number, number] =
    userLocation ?? [9.03, 38.74]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapCenter location={userLocation} />

      {userLocation && (
        <Marker
          position={userLocation}
          icon={userIcon}
        >
          <Popup>
            <strong>You are here</strong>
          </Popup>
        </Marker>
      )}

      {vendors.map((vendor) => (
        <Marker
          key={vendor.id}
          position={[vendor.latitude, vendor.longitude]}
          icon={vendorIcon}
        >
          <Popup>
            <div className="min-w-[190px]">
              {vendor.photo_url && (
                <img
                  src={vendor.photo_url}
                  alt={vendor.product_name}
                  className="mb-3 h-24 w-full rounded-lg object-cover"
                />
              )}

              <h3 className="font-bold text-green-950">
                {vendor.product_name}
              </h3>

              <p className="text-sm text-gray-500">
                {vendor.name}
              </p>

              <p className="mt-2 font-bold text-green-700">
                {Number(vendor.price).toLocaleString()} ETB
              </p>

              {vendor.is_verified && (
                <p className="mt-1 text-xs font-semibold text-green-600">
                  ✓ Verified seller
                </p>
              )}

              <Link
                href={`/vendors/${vendor.id}`}
                className="mt-3 block rounded-lg bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white"
              >
                View seller
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}