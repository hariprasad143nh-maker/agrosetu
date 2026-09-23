"use client"

import MapWrapper from "@/components/MapWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function MapPage() {
  const [role, setRole] = useState<string>("farmer")
  const [items, setItems] = useState<any[]>([])
  const [coolingHubs, setCoolingHubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedHubIndex, setSelectedHubIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.user_metadata?.role) {
          const userRole = data.user.user_metadata.role;
          setRole(userRole);
          
          if (userRole === "industry") {
            const matchesRes = await api.get('/matches');
            const myMatches = matchesRes.filter((m: any) => m.industry_demand.industry_id === data.user?.id);
            setItems(myMatches);
          } else {
            const matchesRes = await api.get('/matches');
            // Filter matches where this farmer is part of the cluster
            const myMatches = matchesRes.filter((m: any) => 
               m.residue_listings && m.residue_listings.some((r: any) => r.farmer_id === data.user?.id)
            );
            setItems(myMatches);
          }
        } else {
          // Fetch fallback if not logged in
          setRole("unauthenticated");
          const residues = await api.get('/residues');
          setItems(residues);
        }

        // Fetch cooling hubs for the sidebar
        const fetchNearbyHubs = (lat: number, lng: number) => {
          api.get(`/cooling-hubs/nearby?lat=${lat}&lng=${lng}&radius_km=50`)
             .then(hubsRes => setCoolingHubs(hubsRes))
             .catch(e => console.error("Error fetching nearby hubs", e));
        };

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => fetchNearbyHubs(pos.coords.latitude, pos.coords.longitude),
            () => fetchNearbyHubs(16.5, 80.6) // fallback
          );
        } else {
          fetchNearbyHubs(16.5, 80.6); // fallback
        }
      } catch (error) {
        console.error("Error fetching map sidebar data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (role === "unauthenticated") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">Your session has expired.</h2>
        <p className="text-muted-foreground">Please click the Log Out button in the top right and Sign In again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-none p-4 sm:px-8 border-b bg-background">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-500">Live Map</h1>
            <p className="text-sm text-muted-foreground">
              {role === 'industry' ? 'Find matching agricultural residues near you' : 'Find industry demand for your residues'}
            </p>
          </div>
          <Badge variant="outline" className="capitalize px-3 py-1">
            {role} View
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row relative">
        <div className="w-full md:w-80 border-r bg-muted/20 p-4 overflow-y-auto space-y-4">
          <h2 className="font-semibold text-lg">{role === 'industry' ? 'AI Matched Residues' : 'AI Matched Demands'}</h2>
          
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data found.</p>
          ) : (
            items.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              
              // Handle unauthenticated fallback (raw residues instead of matches)
              const isRawResidue = !item.industry_demand;
              
              let title = "";
              let quantity = 0;
              let unit = "";
              let moisture = 0;
              let clusterText = "";
              let priceText = "";
              
              if (isRawResidue) {
                 title = item.residue_type;
                 quantity = item.quantity;
                 unit = item.unit;
                 moisture = item.moisture;
                 if (item.expected_price) priceText = `₹${item.expected_price}/${unit}`;
              } else {
                 title = item.industry_demand.material_type;
                 quantity = role === 'industry' ? item.total_fulfilled : item.industry_demand.required_quantity;
                 unit = item.industry_demand.unit || "kg";
                 moisture = item.industry_demand.moisture_requirement;
                 if (role === 'industry' && item.is_clustered) {
                    clusterText = `(From ${item.residue_listings?.length || 1} Farms)`;
                 }
                 if (item.avg_price_per_unit) {
                    priceText = `Est. ₹${item.avg_price_per_unit}/${unit}`;
                 }
              }
              
              return (
              <Card 
                key={idx} 
                className={`cursor-pointer transition-colors hover:border-blue-400 ${isSelected ? 'border-blue-600 shadow-sm ring-1 ring-blue-600' : ''} ${item.match_score > 80 ? 'bg-green-50/50' : ''}`}
                onClick={() => {
                  setSelectedHubIndex(null);
                  setSelectedIndex(isSelected ? null : idx);
                }}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-blue-700">
                    {title}
                  </CardTitle>
                  {!isRawResidue && (
                    <Badge variant="outline" className={item.match_score > 80 ? "bg-green-100 text-green-700 border-green-200" : ""}>
                      {Math.round(item.match_score)}% Match
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm space-y-1">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 mb-1 border-b pb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{role === 'industry' ? 'Clustered Deal' : 'Demand Details'}</span>
                    {priceText && <span className="text-green-700 font-semibold">{priceText}</span>}
                  </div>
                  <p>{role === 'industry' ? 'Total Available' : 'Requires'}: {quantity} {unit} <span className="text-xs text-blue-600">{clusterText}</span></p>
                  {moisture && <p>{role === 'industry' ? 'Max Moisture Allowed' : 'Max Moisture'}: {moisture}%</p>}
                </CardContent>
              </Card>
            )})
          )}

          {coolingHubs.length > 0 && (
            <>
              <div className="border-t my-6 pt-4">
                <h2 className="font-semibold text-lg text-blue-800 dark:text-blue-400 mb-4">Nearby Cooling Hubs</h2>
              </div>
              {coolingHubs.map((hub, idx) => {
                const isSelected = selectedHubIndex === idx;
                return (
                  <Card 
                    key={hub.id} 
                    className={`cursor-pointer transition-colors hover:border-blue-400 border-blue-200 ${isSelected ? 'bg-blue-100 shadow-sm ring-1 ring-blue-600' : 'bg-blue-50/30'}`}
                    onClick={() => {
                      setSelectedIndex(null); // clear match selection
                      setSelectedHubIndex(isSelected ? null : idx);
                    }}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-blue-700">
                        ❄️ {hub.name}
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                        {hub.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm space-y-1">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 mb-1">
                        <span>Distance:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{hub.distance_km} km</span>
                      </div>
                      <p>Capacity: {hub.capacity} tons</p>
                    </CardContent>
                  </Card>
                )
              })}
            </>
          )}

        </div>
        <div className="flex-1 bg-muted relative z-0">
          <MapWrapper items={items} coolingHubs={coolingHubs} role={role} selectedIndex={selectedIndex} selectedHubIndex={selectedHubIndex} />
        </div>
      </div>
    </div>
  )
}
