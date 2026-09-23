"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Button } from "@/components/ui/button"

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  onClose: () => void
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function MapPicker({ onLocationSelect, initialLat, initialLng, onClose }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  )
  const defaultCenter: [number, number] = [20.5937, 78.9629] // India center

  return (
    <div className="flex flex-col space-y-4">
      <div className="h-[400px] w-full rounded-md border overflow-hidden relative z-0">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={position ? 13 : 5} 
          scrollWheelZoom={true} 
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {position ? `Selected: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Click on the map to place a pin"}
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            disabled={!position}
            onClick={() => {
              if (position) {
                onLocationSelect(position.lat, position.lng)
              }
            }}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  )
}
