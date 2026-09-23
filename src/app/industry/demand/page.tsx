"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Factory, Loader2, MapPin, Map } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import MapPickerModal from "@/components/MapPickerModal"

export default function IndustryDemandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [materialType, setMaterialType] = useState("rice_straw")
  const [quantity, setQuantity] = useState("100")
  const [unit, setUnit] = useState("tons")
  const [moistureReq, setMoistureReq] = useState("20")
  const [locationName, setLocationName] = useState("")

  // GPS State
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        setLocationName(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`)
        toast.success("Location acquired!")
        setGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("Unable to retrieve your location")
        setGettingLocation(false)
      }
    )
  }

  const handleMapSelect = (selectedLat: number, selectedLng: number) => {
    setLat(selectedLat)
    setLng(selectedLng)
    setLocationName(`Lat: ${selectedLat.toFixed(4)}, Lng: ${selectedLng.toFixed(4)} (Manual)`)
    toast.success("Location set from map!")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      toast.error("Please login first")
      return
    }

    if (!lat || !lng) {
      toast.error("Please provide your industry location")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        industry_id: userId,
        material_type: materialType,
        required_quantity: parseFloat(quantity),
        unit: unit,
        moisture_requirement: moistureReq ? parseFloat(moistureReq) : null,
        latitude: lat,
        longitude: lng
      }

      await api.post('/demands', payload)
      
      toast.success("Demand posted successfully!")
      router.push("/industry/dashboard")
      
    } catch (error) {
      console.error(error)
      toast.error("Failed to post demand")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post Material Requirement</h1>
        <p className="text-muted-foreground mt-1">Specify the agricultural residue your industry needs.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" />
              Requirement Details
            </CardTitle>
            <CardDescription>What kind of material are you looking for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="material">Required Material</Label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger id="material">
                  <SelectValue placeholder="Select material type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice_straw">Rice Straw</SelectItem>
                  <SelectItem value="wheat_straw">Wheat Straw</SelectItem>
                  <SelectItem value="maize_stalks">Maize Stalks</SelectItem>
                  <SelectItem value="sugarcane_bagasse">Sugarcane Bagasse</SelectItem>
                  <SelectItem value="biomass_mixed">Mixed Biomass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Required Quantity</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tons">Tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Max Acceptable Moisture (%)</Label>
              <Input id="quality" type="number" value={moistureReq} onChange={(e) => setMoistureReq(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Industry Location (Required)</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    id="location" 
                    placeholder="Click to detect or pick location" 
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    readOnly
                    required 
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                      {gettingLocation ? "" : "Get GPS"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setMapOpen(true)}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      Pick on Map
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="required-by">Required By Date</Label>
                <Input id="required-by" type="date" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t p-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Requirement"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <MapPickerModal 
        open={mapOpen} 
        onOpenChange={setMapOpen} 
        onLocationSelect={handleMapSelect}
        initialLat={lat || undefined}
        initialLng={lng || undefined}
      />
    </div>
  )
}
