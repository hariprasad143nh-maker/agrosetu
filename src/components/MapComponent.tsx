"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { api } from "@/lib/api"

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const IndustryIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const FarmIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

// Helper component to programmatically pan and zoom the map
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Component to dynamically fetch and draw real road routes using OSRM
const OsrmRoute = ({ waypoints }: { waypoints: [number, number][] }) => {
  const [positions, setPositions] = useState<[number, number][] | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRoute = async () => {
      if (!waypoints || waypoints.length < 2) return;
      try {
        // OSRM expects longitude,latitude format
        const coordsStr = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (active && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;
          const distKm = (data.routes[0].distance / 1000).toFixed(1);
          setDistance(distKm);
          // GeoJSON returns [lon, lat], Leaflet needs [lat, lon]
          setPositions(coords.map((c: any) => [c[1], c[0]]));
        } else if (active) {
          setPositions(waypoints); // Fallback
        }
      } catch (e) {
        console.error("Failed to fetch optimized route", e);
        if (active) setPositions(waypoints);
      }
    };
    fetchRoute();
    return () => { active = false; };
  }, [waypoints]);

  if (!positions) return null;

  return (
    <React.Fragment>
      <Polyline 
        positions={positions} 
        pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
      />
      {distance && positions.length > 0 && (
        <Marker position={positions[Math.floor(positions.length / 2)]} opacity={0.01}>
          <Tooltip permanent direction="top" className="bg-white text-blue-700 font-bold px-2 py-1 rounded shadow border border-blue-200">
            {distance} km
          </Tooltip>
        </Marker>
      )}
    </React.Fragment>
  );
};

const CoolingIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function MapComponent({ 
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
  const defaultCenter: [number, number] = [16.5, 80.6] // Vijayawada
  const [center, setCenter] = useState<[number, number]>(defaultCenter)
  const [zoom, setZoom] = useState<number>(10)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    // Try to get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          if (items.length === 0 || (selectedIndex === null && selectedHubIndex === null)) {
            setCenter([pos.coords.latitude, pos.coords.longitude]);
          }
        },
        (err) => {
          console.warn("Could not get location:", err.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Center map based on selected AI Match
    if (items.length > 0 && selectedIndex !== null) {
      const match = items[selectedIndex];
      
      let targetItem = null;
      if (role === 'industry') {
        // Center on the first farm in the cluster
        if (match.residue_listings && match.residue_listings.length > 0) {
          targetItem = match.residue_listings[0];
        } else if (match.residue_listing) {
          targetItem = match.residue_listing;
        }
      } else {
        // Center on the industry
        targetItem = match.industry_demand;
      }
      
      if (targetItem && targetItem.latitude && targetItem.longitude) {
        setCenter([targetItem.latitude, targetItem.longitude]);
        setZoom(12);
      } else if (match.latitude && match.longitude) {
        setCenter([match.latitude, match.longitude]);
        setZoom(12);
      }
    }
    
    // Center map based on selected Cooling Hub
    if (coolingHubs.length > 0 && selectedHubIndex !== null) {
      const hub = coolingHubs[selectedHubIndex];
      if (hub && hub.latitude && hub.longitude) {
        setCenter([hub.latitude, hub.longitude]);
        setZoom(13);
      }
    }
  }, [items, role, selectedIndex, coolingHubs, selectedHubIndex]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full z-0">
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {items.map((match, idx) => {
          // Handle unauthenticated fallback (raw residues instead of matches)
          const isRawResidue = !match.industry_demand;
          const isSelected = selectedIndex === idx;

          if (isRawResidue) {
            return (
              <React.Fragment key={`match-group-${idx}`}>
                {match.latitude && match.longitude && (
                  <Marker position={[match.latitude, match.longitude]} icon={FarmIcon}>
                    <Popup>
                      <div className="font-semibold text-green-700">Farm Listing</div>
                      <div className="text-sm"><strong>Material:</strong> {match.residue_type}</div>
                      <div className="text-sm"><strong>Available:</strong> {match.quantity} {match.unit}</div>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          }

          // Authenticated matches (Clustered)
          const dem = match.industry_demand;
          const residues = match.residue_listings || [match.residue_listing].filter(Boolean);
          
          const hasIndustryLoc = dem?.latitude && dem?.longitude;
          
          // Build waypoints for the clustered route
          const waypoints: [number, number][] = [];
          if (role === 'industry') {
            // Industry collects from multiple farms, ending at industry
            residues.forEach((r: any) => {
              if (r.latitude && r.longitude) waypoints.push([r.latitude, r.longitude]);
            });
            if (hasIndustryLoc) waypoints.push([dem.latitude, dem.longitude]);
          } else {
            // Farmer delivers to industry
            const myResidue = residues.find((r: any) => r.latitude && r.longitude); // Just finding their own
            if (myResidue) waypoints.push([myResidue.latitude, myResidue.longitude]);
            if (hasIndustryLoc) waypoints.push([dem.latitude, dem.longitude]);
          }

          return (
            <React.Fragment key={`match-group-${idx}`}>
              {/* Render ALL Farm Residue Pins in this cluster */}
              {residues.map((res: any, rIdx: number) => (
                res?.latitude && res?.longitude && (
                  <Marker key={`farm-${idx}-${rIdx}`} position={[res.latitude, res.longitude]} icon={FarmIcon}>
                    <Popup>
                      <div className="font-semibold text-green-700">{role === 'farmer' ? 'Your Farm' : `Farm Partner ${rIdx + 1}`}</div>
                      <div className="text-sm"><strong>Match Score:</strong> {Math.round(match.match_score)}%</div>
                      <div className="text-sm"><strong>Material:</strong> {res.residue_type}</div>
                      <div className="text-sm"><strong>Available:</strong> {res.quantity} {res.unit}</div>
                    </Popup>
                  </Marker>
                )
              ))}
              
              {/* Render the Industry Location Pin */}
              {hasIndustryLoc && (
                <Marker position={[dem.latitude, dem.longitude]} icon={IndustryIcon}>
                  <Popup>
                    <div className="font-semibold text-purple-700">{role === 'industry' ? 'Your Industry Location' : 'Matched Industry'}</div>
                    <div className="text-sm"><strong>Demanding:</strong> {dem.material_type}</div>
                    <div className="text-sm"><strong>Requires:</strong> {dem.required_quantity} {dem.unit}</div>
                  </Popup>
                </Marker>
              )}

              {/* Render the Clustered Route line ONLY if this match is selected */}
              {isSelected && waypoints.length >= 2 && (
                <OsrmRoute waypoints={waypoints} />
              )}
            </React.Fragment>
          );
        })}

        {/* Render Cooling Hubs */}
        {coolingHubs.map((hub, idx) => (
          <React.Fragment key={`hub-${hub.id}`}>
            <Marker position={[hub.latitude, hub.longitude]} icon={CoolingIcon}>
              <Popup>
                <div className="font-semibold text-blue-700">❄️ {hub.name}</div>
                <div className="text-sm"><strong>Capacity:</strong> {hub.capacity} tons</div>
                <div className="text-sm capitalize"><strong>Status:</strong> {hub.status}</div>
              </Popup>
            </Marker>
            
            {/* Draw route to Cooling Hub if selected */}
            {selectedHubIndex === idx && userLocation && hub.latitude && hub.longitude && (
              <OsrmRoute 
                waypoints={[
                  [userLocation[0], userLocation[1]],
                  [hub.latitude, hub.longitude]
                ]}
              />
            )}
          </React.Fragment>
        ))}

        {/* Render User Location */}
        {userLocation && (
          <Marker position={userLocation} icon={DefaultIcon}>
            <Popup>
              <div className="font-semibold">📍 You are here</div>
            </Popup>
          </Marker>
        )}
        
      </MapContainer>
    </div>
  )
}
