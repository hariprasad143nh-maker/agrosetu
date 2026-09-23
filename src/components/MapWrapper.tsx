"use client"

import dynamic from "next/dynamic"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

export default function MapWrapper({ 
  items = [], 
  coolingHubs = [],
  role = "farmer", 
  selectedIndex = null,
  selectedHubIndex = null
}: { 
  items?: any[], 
  coolingHubs?: any[],
  role?: string, 
  selectedIndex?: number | null,
  selectedHubIndex?: number | null
}) {
  return <MapComponent items={items} coolingHubs={coolingHubs} role={role} selectedIndex={selectedIndex} selectedHubIndex={selectedHubIndex} />
}
