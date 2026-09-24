"use client";

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, ArrowRight, ThermometerSun, MapPin, Route, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function FreshnessResultPage() {
  const params = useParams()
  const [produce, setProduce] = useState<any>(null)
  const [prediction, setPrediction] = useState<any>(null)
  const [nearbyHub, setNearbyHub] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const batchId = params.id as string
        
        // Fetch Produce Batch
        let produceData = await api.get(`/produce/${batchId}`)
        
        // Fetch Nearby Hubs and calculate real OSRM routing time
        const lat = produceData.latitude || 16.5;
        const lng = produceData.longitude || 80.6;
        const hubsData = await api.get(`/cooling-hubs/nearby?lat=${lat}&lng=${lng}&radius_km=50`).catch(() => []);
        
        let osrmTravelTime = produceData.transport_time || 0;
        let hubToSet = null;

        if (hubsData && hubsData.length > 0) {
          hubToSet = hubsData[0];
          try {
            const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lng},${lat};${hubToSet.longitude},${hubToSet.latitude}?overview=false`);
            const osrmData = await osrmRes.json();
            if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
              const durationSeconds = osrmData.routes[0].duration;
              const hours = (durationSeconds / 3600).toFixed(1);
              osrmTravelTime = parseFloat(hours);
              // Save it to display on the Hub card
              hubToSet.osrm_hours = hours;
            }
          } catch (e) {
            console.error("OSRM routing failed", e);
          }
          setNearbyHub(hubToSet);
        }

        // Override produce transport_time with real OSRM time for the AI prediction
        produceData = { ...produceData, transport_time: osrmTravelTime };
        setProduce(produceData)
        
        // Predict Freshness
        const freshnessReq = {
          produce_type: produceData.produce_type,
          temperature: produceData.temperature || 30,
          humidity: produceData.humidity || 60,
          transport_time: osrmTravelTime,
          storage_type: produceData.storage_type || "open"
        }
        const predictionData = await api.post('/freshness/predict', freshnessReq)
        setPrediction(predictionData)

      } catch (error) {
        console.error("Failed to fetch freshness data:", error)
        toast.error("Failed to load freshness analysis")
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-slate-500">Analyzing freshness risk...</p>
      </div>
    )
  }

  if (!produce || !prediction) {
    return (
      <div className="container p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Batch Not Found</h2>
        <p className="mt-2 text-slate-500">Could not retrieve the analysis for this batch.</p>
        <Button className="mt-4" asChild><Link href="/dashboard">Return Home</Link></Button>
      </div>
    )
  }

  // Determine badge colors based on risk
  const isHighRisk = prediction.risk_level.toUpperCase() === "HIGH"
  const isLowRisk = prediction.risk_level.toUpperCase() === "LOW"
  const badgeColor = isHighRisk ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300" : 
                    isLowRisk ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300" :
                    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-300"
                    
  const iconColor = isHighRisk ? "text-red-500" : isLowRisk ? "text-green-500" : "text-amber-500"
  const textColor = isHighRisk ? "text-red-700 dark:text-red-400" : isLowRisk ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
  
  const factors = prediction.factors || [
    `Temperature exposure: ${produce.temperature}°C`,
    `Transportation time: ${produce.transport_time} hours`,
    `Storage type: ${produce.storage_type.replace('_', ' ')}`
  ]

  return (
    <div className="container p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Freshness Analysis</h1>
          <p className="text-muted-foreground mt-1">AI-Assisted Shelf-Life Estimator Result</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className={`border ${isHighRisk ? 'border-red-200 bg-red-50/30' : isLowRisk ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2 capitalize">
                  {produce.produce_type} Batch #{produce.id.toString().substring(0,6)}
                </CardTitle>
                <Badge variant="outline" className={badgeColor}>
                  {prediction.risk_level.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 p-4 bg-white dark:bg-black/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Estimated Remaining Usable Period</p>
                  <p className={`text-3xl font-bold ${textColor}`}>{prediction.estimated_days}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Spoilage Risk</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
                    <span className={`text-xl font-semibold ${textColor}`}>{prediction.risk_level.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Main Factors Influencing Estimate
                </h3>
                <ul className="space-y-2">
                  {factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className={`${iconColor} mt-1`}>•</span>
                      <span className="capitalize">{factor}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  * Note: Estimates are based on stated conditions and historical models. Actual shelf life may vary.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action Recommendation</CardTitle>
              <CardDescription>Smart Decision Engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50 mb-4">
                <p className="font-medium text-blue-900 dark:text-blue-100 text-lg mb-2">Priority: {prediction.risk_level.toUpperCase()}</p>
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Recommended:</strong> {prediction.recommended_action}
                </p>
                {nearbyHub && (
                  <p className="text-blue-800 dark:text-blue-200 mt-2">
                    <strong>Alternative:</strong> Move to {nearbyHub.name}.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button className="w-full">
                Mark for Sale
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/map">View on Map</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Cooling</CardTitle>
              <CardDescription>Extend shelf life</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nearbyHub ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                      <ThermometerSun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{nearbyHub.name}</h4>
                      <p className="text-xs text-muted-foreground">Solar Powered Cold Room</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Route className="h-3 w-3"/> Distance</span>
                      <span className="font-medium">
                        {nearbyHub.distance_km} km
                      </span>
                    </div>
                    {nearbyHub.osrm_hours && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Travel Time (OSRM)</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {nearbyHub.osrm_hours} hours
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium text-green-600 dark:text-green-500">{nearbyHub.capacity} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                        {nearbyHub.status === "active" ? "Available" : "Full"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-slate-500">No cooling hubs nearby.</div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled={!nearbyHub} asChild>
                {nearbyHub ? <Link href="/map">Book Space</Link> : <span>Book Space</span>}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resource Recovery</CardTitle>
              <CardDescription>If material becomes unusable</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="capitalize">{produce.produce_type}</span> waste can be utilized for composting or biogas if it exceeds safe consumption limits.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/residues/add">List as Residue</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
