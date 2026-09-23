"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThermometerSun, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import LocationPicker from "@/components/LocationPicker";

import { supabase } from "@/lib/supabase";

export default function CoolingHubsManager() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [capacity, setCapacity] = useState("");
  const [providerId, setProviderId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setProviderId(data.user.id);
      }
    });
  }, []);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/cooling-hubs');
      setHubs(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch cooling hubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const handleAddHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lat || !lng || !capacity || !providerId) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      const payload = {
        name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        capacity: parseFloat(capacity),
        operator_id: providerId,
        status: "active"
      };
      
      await api.post('/cooling-hubs', payload);
      toast.success("Cooling hub added successfully");
      
      // Reset form
      setName(""); setLat(""); setLng(""); setCapacity("");
      
      // Refresh list
      fetchHubs();
    } catch (e) {
      console.error(e);
      toast.error("Failed to add cooling hub");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this cooling hub?")) {
      try {
        await api.delete(`/cooling-hubs/${id}`);
        toast.success("Deleted successfully");
        fetchHubs();
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete cooling hub");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
        <div className="container max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-900 dark:text-green-400 flex items-center gap-2">
              <ThermometerSun className="h-8 w-8" />
              Manage Cooling Hubs
            </h1>
            <p className="text-muted-foreground mt-2">Add or remove cold storage facilities to improve routing and freshness predictions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Hub</CardTitle>
                  <CardDescription>Register a new solar or grid-powered cold storage.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddHub} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Hub Name</Label>
                      <Input id="name" placeholder="e.g. SolarCool Vijayawada" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lat">Latitude</Label>
                        <Input id="lat" type="number" step="any" placeholder="16.5062" value={lat} onChange={e => setLat(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lng">Longitude</Label>
                        <Input id="lng" type="number" step="any" placeholder="80.6480" value={lng} onChange={e => setLng(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Or pick a location on the map:</Label>
                      <LocationPicker 
                        lat={parseFloat(lat) || 16.5062} 
                        lng={parseFloat(lng) || 80.6480} 
                        onChange={(newLat, newLng) => {
                          setLat(newLat.toFixed(6));
                          setLng(newLng.toFixed(6));
                        }} 
                      />
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs flex items-center gap-2"
                      onClick={() => {
                        if ("geolocation" in navigator) {
                          toast.info("Fetching location...");
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setLat(position.coords.latitude.toString());
                              setLng(position.coords.longitude.toString());
                              toast.success("Location acquired!");
                            },
                            (error) => {
                              toast.error("Could not get location. Please allow permissions.");
                            }
                          );
                        } else {
                          toast.error("Geolocation is not supported by your browser");
                        }
                      }}
                    >
                      <MapPin className="h-3 w-3" /> Get Current Location
                    </Button>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity (tons)</Label>
                      <Input id="capacity" type="number" step="any" placeholder="5.0" value={capacity} onChange={e => setCapacity(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">Add Cooling Hub</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Active Cooling Hubs</CardTitle>
                  <CardDescription>Currently registered storage facilities.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading hubs...</div>
                  ) : hubs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No cooling hubs registered yet.</div>
                  ) : (
                    <div className="divide-y border rounded-md">
                      {hubs.map((hub) => (
                        <div key={hub.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <div>
                            <h4 className="font-semibold text-lg">{hub.name}</h4>
                            <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {hub.latitude}, {hub.longitude}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Capacity: <span className="font-medium text-slate-900 dark:text-slate-100">{hub.capacity} tons</span> | Status: <span className="text-green-600 capitalize">{hub.status}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleDelete(hub.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
