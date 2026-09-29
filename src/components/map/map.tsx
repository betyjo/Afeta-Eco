'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

interface Vendor {
  id: string
  name: string
  product_name: string
  category: string
  price: number
  photo_url: string | null
  latitude: number | null
  longitude: number | null
  is_verified: boolean
}

interface VendorMapProps {
  vendors: Vendor[]
}

const defaultCenter: [number, number] = [9.03, 38.74]

function LocationButton() {
  const map = useMap()

  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  function findMyLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        'Location is not supported by your browser.'
      )
      return
    }

    setLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView(
          [position.coords.latitude, position.coords.longitude],
          14
        )
        setLocating(false)
      },
      () => {
        setLocationError(
          'We could not access your location.'
        )
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <button
        type="button"
        onClick={findMyLocation}
        disabled={locating}
        className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-lg hover:bg-gray-50 disabled:opacity-60"
      >
        {locating ? 'Finding you...' : '📍 Find me'}
      </button>

      {locationError && (
        <div className="mt-2 max-w-xs rounded-xl bg-white p-3 text-xs text-red-600 shadow-lg">
          {locationError}
        </div>
      )}
    </div>
  )
}

function createVendorIcon(isVerified: boolean) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: #15803d;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: ${isVerified ? '18px' : '16px'};
          font-weight: bold;
        ">
          ${isVerified ? '✓' : '•'}
        </span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  })
}

function createClusterIcon(cluster: { getChildCount(): number }) {
  const count = cluster.getChildCount()

  return L.divIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #166534;
        border: 4px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 15px;
        font-weight: 800;
      ">
        ${count}
      </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

export default function VendorMap({
  vendors,
}: VendorMapProps) {
  const validVendors = vendors.filter(
    (vendor) =>
      typeof vendor.latitude === 'number' &&
      typeof vendor.longitude === 'number' &&
      Number.isFinite(vendor.latitude) &&
      Number.isFinite(vendor.longitude)
  )

  const [center] = useState<[number, number]>(() => {
    if (validVendors.length > 0) {
      return [
        validVendors[0].latitude!,
        validVendors[0].longitude!,
      ]
    }

    return defaultCenter
  })

  useEffect(() => {
    delete (
      L.Icon.Default.prototype as unknown as {
        _getIconUrl?: unknown
      }
    )._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <div className="relative h-[500px] w-full">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationButton />

        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={50}
        >
          {validVendors.map((vendor) => (
            <Marker
              key={vendor.id}
              position={[
                vendor.latitude!,
                vendor.longitude!,
              ]}
              icon={createVendorIcon(vendor.is_verified)}
            >
              <Popup>
                <div className="w-56">
                  {vendor.photo_url && (
                    <img
                      src={vendor.photo_url}
                      alt={vendor.product_name}
                      className="h-28 w-full rounded-lg object-cover"
                    />
                  )}

                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-green-700">
                      {vendor.category}
                    </p>

                    <h3 className="mt-1 font-bold text-gray-900">
                      {vendor.product_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {vendor.name}
                    </p>

                    <p className="mt-2 font-bold text-green-700">
                      {Number(
                        vendor.price
                      ).toLocaleString()}{' '}
                      ETB
                    </p>

                    {vendor.is_verified && (
                      <p className="mt-1 text-xs font-semibold text-green-700">
                        ✓ Verified seller
                      </p>
                    )}

                    <Link
                      href={`/vendors/${vendor.id}`}
                      className="mt-3 block rounded-lg bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-800"
                    >
                      View Seller
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}