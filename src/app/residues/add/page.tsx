"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Leaf, Loader2, MapPin, Map } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import MapPickerModal from "@/components/MapPickerModal"

export default function AddResiduePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Form State
  const [residueType, setResidueType] = useState("rice_straw")
  const [quantity, setQuantity] = useState("4")
  const [unit, setUnit] = useState("tons")
  const [moisture, setMoisture] = useState("18")
  const [availableDate, setAvailableDate] = useState("")
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
      toast.error("Please provide your farm location")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        farmer_id: userId,
        residue_type: residueType,
        quantity: parseFloat(quantity),
        unit: unit,
        moisture: moisture ? parseFloat(moisture) : null,
        availability_date: availableDate || null,
        latitude: lat,
        longitude: lng
      }

      await api.post('/residues', payload)
      
      toast.success("Residue listed successfully!")
      router.push("/dashboard")
      
    } catch (error) {
      console.error(error)
      toast.error("Failed to list residue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List Agricultural Residue</h1>
          <p className="text-muted-foreground mt-1">Register your farm waste or residue to find buyers or recovery pathways.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Material Details
            </CardTitle>
            <CardDescription>Specify the type and quantity of residue available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="residue-type">Residue Type</Label>
              <Select value={residueType} onValueChange={(val) => setResidueType(val || "")}>
                <SelectTrigger id="residue-type">
                  <SelectValue placeholder="Select material type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice_straw">Rice Straw</SelectItem>
                  <SelectItem value="wheat_straw">Wheat Straw</SelectItem>
                  <SelectItem value="maize_stalks">Maize Stalks</SelectItem>
                  <SelectItem value="coconut_husks">Coconut Husks</SelectItem>
                  <SelectItem value="sugarcane_bagasse">Sugarcane Bagasse</SelectItem>
                  <SelectItem value="banana_residue">Banana Residue</SelectItem>
                  <SelectItem value="spoiled_produce">Spoiled Produce (Compostable)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={(val) => setUnit(val || "kg")}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moisture">Estimated Moisture (%)</Label>
                <Input id="moisture" type="number" value={moisture} onChange={(e) => setMoisture(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Quality / Condition</Label>
                <Select defaultValue="dry">
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">Dry & Clean</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="wet">Wet / High Moisture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability & Logistics</CardTitle>
            <CardDescription>When and where can this be collected?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available-date">Available From</Label>
                <Input id="available-date" type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Expected Price (₹ / unit) - Optional</Label>
                <Input id="price" type="number" placeholder="Leave blank to negotiate" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Farm Location (Required)</Label>
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
              <p className="text-xs text-muted-foreground mt-1">This will be used to calculate transport distance for buyers and show your pin on the map.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t p-6">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "List Material & Find Buyers"}
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
