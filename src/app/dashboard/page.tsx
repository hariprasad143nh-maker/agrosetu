"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ThermometerSun, Leaf, Sprout, ArrowRight, Zap, Factory, Droplets } from "lucide-react"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"

export default function FarmerDashboard() {
  const [userName, setUserName] = useState("Farmer")
  const [userId, setUserId] = useState<string | null>(null)
  const [produceCount, setProduceCount] = useState(0)
  const [myProduce, setMyProduce] = useState<any[]>([])
  const [residueTotal, setResidueTotal] = useState(0)
  const [matchesCount, setMatchesCount] = useState(0)
  const [matches, setMatches] = useState<any[]>([])
  const [myResidueListings, setMyResidueListings] = useState<any[]>([])

  useEffect(() => {
    // 1. Get logged in user name & ID
    let currentUserId: string | null = null;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        currentUserId = data.user.id;
        setUserId(currentUserId);
        if (data.user.user_metadata?.full_name) {
          setUserName(data.user.user_metadata.full_name.split(" ")[0]);
        }
        fetchData();
      }
    });

    // 2. Fetch real data from FastAPI
    const fetchData = async () => {
      if (!currentUserId) return;
      try {
        // Fetch Produce
        const produceRes = await api.get('/produce')
        const userProduce = produceRes.filter((p: any) => p.farmer_id === currentUserId)
        setProduceCount(userProduce.length)
        setMyProduce(userProduce)

        const residueRes = await api.get('/residues')
        const myResidues = residueRes.filter((r: any) => r.farmer_id === currentUserId)
        const totalTons = myResidues.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
        setResidueTotal(totalTons)
        setMyResidueListings(myResidues)

        const matchesRes = await api.get('/matches')
        const myMatches = matchesRes.filter((m: any) => 
          m.residue_listings && m.residue_listings.some((r: any) => r.farmer_id === currentUserId)
        )
        setMatchesCount(myMatches.length)
        setMatches(myMatches)
      } catch (e) {
        console.error("Error fetching dashboard data", e)
      }
    }
  }, [])

  return (
    <div className="container p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good Morning, {userName} 👋</h1>
          <p className="text-muted-foreground text-lg mt-1">Here is your farm overview for today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/produce/add">Add Produce</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/residues/add">List Residue</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fresh Produce</CardTitle>
            <Sprout className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produceCount} Batches</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">0 Batches</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">Action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residue Available</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residueTotal} Tons</div>
            <p className="text-xs text-muted-foreground mt-1">Total listed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Buyers</CardTitle>
            <Factory className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesCount} Matches</div>
            <p className="text-xs text-muted-foreground mt-1">For your listed residues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4 space-y-4">
          
          <h2 className="text-xl font-semibold mt-8 mb-4">My Produce Batches</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {produceCount === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    You have not registered any produce yet. Add some to get freshness analysis!
                  </div>
                ) : (
                  myProduce.map((prod: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mt-0.5">
                          <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm capitalize">{prod.produce_type} {prod.variety ? `(${prod.variety})` : ''} - #{prod.id.toString().substring(0,6)}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Quantity: {prod.quantity} {prod.unit} | Storage: {prod.storage_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                          <Link href={`/produce/${prod.id}/freshness`}>Analysis</Link>
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 sm:flex-none" onClick={async () => {
                          if (confirm("Are you sure you want to delete this produce batch?")) {
                            try {
                              await api.delete(`/produce/${prod.id}`);
                              window.location.reload();
                            } catch (e) {
                              console.error("Failed to delete", e);
                              alert("Failed to delete");
                            }
                          }
                        }}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mt-8 mb-4">My Residue Listings</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {residueTotal === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    You have no active residue listings. Add some to find buyers!
                  </div>
                ) : (
                  myResidueListings.map((res: any, idx: number) => (
                    <div key={idx} className="p-4 flex gap-4 items-center justify-between">
                      <div className="flex gap-4 items-start">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-0.5">
                          <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{res.residue_type}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Quantity: {res.quantity} {res.unit} | Moisture: {res.moisture}%</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={async () => {
                        if (confirm("Are you sure you want to delete this listing?")) {
                          try {
                            await api.delete(`/residues/${res.id}`);
                            window.location.reload();
                          } catch (e) {
                            console.error("Failed to delete", e);
                            alert("Failed to delete");
                          }
                        }
                      }}>
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mt-8 mb-4">AI Match Suggestions</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y p-4">
                {matches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matches found for your residues yet. Keep an eye out!</p>
                ) : (
                  matches.map((match, idx) => {
                    const myRes = match.residue_listings?.find((r: any) => r.farmer_id === userId) || {};
                    return (
                    <div key={idx} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 pt-4 first:pt-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200">Industry Match!</h4>
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">{Math.round(match.match_score)}% Match</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">An industry requires <strong>{match.industry_demand.required_quantity} {match.industry_demand.unit}</strong> of {match.industry_demand.material_type}. They match your listing #{myRes.id}!</p>
                        {match.is_clustered && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                            You are part of a {match.residue_listings.length}-farm supply cluster to fulfill this demand.
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">Review Offer</Button>
                    </div>
                  )})
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-full lg:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold">Impact & Recovered Value</h2>
          <Card>
            <CardHeader>
              <CardTitle>Estimated Value</CardTitle>
              <CardDescription>Value recovered from agricultural residues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">₹12,450</div>
              <p className="text-sm text-muted-foreground mt-2">Potential earnings from active residue listings</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Produce Saved</span>
                  <span className="font-medium">1,240 kg</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary w-[70%] h-full"></div>
                </div>
                
                <div className="flex justify-between items-center text-sm mt-4">
                  <span className="text-muted-foreground">Residue Recovered</span>
                  <span className="font-medium">18.5 tons</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary w-[85%] h-full"></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary" asChild>
                <Link href="/sustainability">
                  View full sustainability report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nearby Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Cooling Hubs</span>
                </div>
                <Badge variant="secondary">3 Nearby</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Collection Centres</span>
                </div>
                <Badge variant="secondary">2 Nearby</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/map">View on Map</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
