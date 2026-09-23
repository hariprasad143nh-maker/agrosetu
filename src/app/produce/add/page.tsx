"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, LeafyGreen, CloudRain, Loader2, MapPin, Map, ThermometerSun, Droplets } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import MapPickerModal from "@/components/MapPickerModal"

export default function AddProducePage() {
  const router = useRouter();
  const [temperature, setTemperature] = useState("31");
  const [humidity, setHumidity] = useState("68");
  const [location, setLocation] = useState("Vijayawada");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherSuccess, setWeatherSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  // Form State
  const [produceName, setProduceName] = useState("tomato");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [travelTime, setTravelTime] = useState("5");
  const [storageType, setStorageType] = useState("open");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })
  }, [])

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please login first");
      return;
    }

    if (!quantity || isNaN(parseFloat(quantity))) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    if (!temperature || !humidity || !travelTime) {
      toast.error("Please fill in all environmental and logistics details");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        farmer_id: userId,
        produce_type: produceName,
        variety: variety || undefined,
        quantity: parseFloat(quantity),
        unit: unit,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        transport_time: parseFloat(travelTime),
        storage_type: storageType,
        location: location,
        latitude: lat || 16.5,
        longitude: lng || 80.6
      };

      // Call FastAPI backend
      const response = await api.post('/produce', payload);
      
      const batchId = response?.id;
      
      toast.success("Produce Batch Registered Successfully!", {
        description: `Batch ID: ${batchId || 'Created'}`
      });
      
      // Auto-navigate to freshness analysis
      if (batchId) {
        router.push(`/produce/${batchId}/freshness`);
      } else {
        router.push(`/dashboard`);
      }
      
    } catch (error) {
      toast.error("Failed to register produce", {
        description: "Please check your network connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchWeatherForCoords = async (latitude: number, longitude: number, isManual = false) => {
    setIsFetchingWeather(true);
    try {
      setLat(latitude);
      setLng(longitude);

      // Using free, no-auth Open-Meteo API for real-time weather data
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`);
      const data = await res.json();
      
      if (data && data.current) {
        setTemperature(data.current.temperature_2m.toString());
        setHumidity(data.current.relative_humidity_2m.toString());
        setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}${isManual ? ' (Manual)' : ''}`);
        setWeatherSuccess(true);
        toast.success(`Live weather & GPS data synced${isManual ? ' for selected location' : ''}!`);
      }
    } catch (error) {
      console.error("Failed to fetch weather", error);
      toast.error("Could not reach weather service. Using default values.");
    } finally {
      setIsFetchingWeather(false);
    }
  }

  const fetchLiveWeather = () => {
    setWeatherSuccess(false);

    if ("geolocation" in navigator) {
      setIsFetchingWeather(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherForCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error", error);
          toast.error("Please allow location access to fetch real-time weather & GPS.");
          setIsFetchingWeather(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleMapSelect = (selectedLat: number, selectedLng: number) => {
    fetchWeatherForCoords(selectedLat, selectedLng, true);
  }

  return (
    <div className="container p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-800" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Register Produce</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Enter details to calculate AI freshness risk and storage recommendations.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-slate-200 shadow-xl shadow-slate-200/40 dark:shadow-none dark:border-zinc-800 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-green-400 to-emerald-600"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                <LeafyGreen className="h-6 w-6" />
              </div>
              Batch Details
            </CardTitle>
            <CardDescription className="text-base">Basic information about the harvested produce.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="produce" className="text-base font-semibold">Produce Name</Label>
                <Select value={produceName} onValueChange={setProduceName}>
                  <SelectTrigger id="produce" className="h-12 text-base">
                    <SelectValue placeholder="Select produce" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomato">🍅 Tomato</SelectItem>
                    <SelectItem value="onion">🧅 Onion</SelectItem>
                    <SelectItem value="potato">🥔 Potato</SelectItem>
                    <SelectItem value="cabbage">🥬 Cabbage</SelectItem>
                    <SelectItem value="spinach">🌿 Spinach / Leafy Greens</SelectItem>
                    <SelectItem value="banana">🍌 Banana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="variety" className="text-base font-semibold">Variety (Optional)</Label>
                <Input id="variety" value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="e.g. Roma" className="h-12 text-base" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-base font-semibold">Quantity</Label>
                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="500" className="h-12 text-base" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="unit" className="text-base font-semibold">Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger id="unit" className="h-12 text-base">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-slate-200 shadow-xl shadow-slate-200/40 dark:shadow-none dark:border-zinc-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <CloudRain className="h-48 w-48" />
          </div>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Environmental & Logistics</CardTitle>
                <CardDescription className="text-base mt-1">Live weather conditions affect shelf life.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={fetchLiveWeather} 
                  disabled={isFetchingWeather}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20"
                >
                  {isFetchingWeather ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                  {isFetchingWeather ? "Fetching..." : "Use Auto GPS"}
                </Button>
                <Button 
                  onClick={() => setMapOpen(true)}
                  variant="outline"
                  className="shadow-sm"
                >
                  <Map className="mr-2 h-4 w-4" />
                  Pick on Map
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {weatherSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center">
                <LeafyGreen className="h-4 w-4 mr-2" /> Live environmental data successfully retrieved for location!
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="temperature" className="text-base font-semibold flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-orange-500" /> Current Temperature (°C)
                </Label>
                <Input id="temperature" type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="h-12 text-base font-medium" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="humidity" className="text-base font-semibold flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" /> Current Humidity (%)
                </Label>
                <Input id="humidity" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} className="h-12 text-base font-medium" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="location" className="text-base font-semibold">Current Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 text-base bg-slate-50 dark:bg-zinc-900" readOnly />
              </div>
              <div className="space-y-3">
                <Label htmlFor="travel-time" className="text-base font-semibold">Est. Travel Time (Hours)</Label>
                <Input id="travel-time" type="number" placeholder="5" value={travelTime} onChange={(e) => setTravelTime(e.target.value)} className="h-12 text-base" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="storage" className="text-base font-semibold">Storage Type</Label>
              <Select value={storageType} onValueChange={setStorageType}>
                <SelectTrigger id="storage" className="h-12 text-base">
                  <SelectValue placeholder="Select storage condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">☀️ Open / No Cooling</SelectItem>
                  <SelectItem value="shade">🌳 Shaded</SelectItem>
                  <SelectItem value="cold_room">❄️ Cold Room (Active Cooling)</SelectItem>
                  <SelectItem value="solar_hub">🔋 Solar Cooling Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-slate-100 dark:border-zinc-800 p-6 bg-slate-50 dark:bg-zinc-900/50">
            <Button variant="outline" className="w-full sm:w-auto h-12 text-base rounded-full" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 text-base px-8 rounded-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering Batch...
                </>
              ) : (
                "Analyze Freshness Risk"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

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
