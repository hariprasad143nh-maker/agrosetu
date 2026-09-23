"use client";

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Factory, TrendingUp, Truck, FileText, CheckCircle2, Factory as FactoryIcon, MapPin, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"

export default function IndustryDashboard() {
  const [matches, setMatches] = useState<any[]>([])
  const [myDemands, setMyDemands] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    let currentUserId: string | null = null;

    const fetchData = async () => {
      if (!currentUserId) return;
      try {
        setIsLoading(true);
        // Fetch Demands
        const demandsRes = await api.get('/demands');
        const userDemands = demandsRes.filter((d: any) => d.industry_id === currentUserId);
        setMyDemands(userDemands);
        
        // Fetch Matches
        const matchesRes = await api.get('/matches');
        const myMatches = matchesRes.filter((m: any) => m.industry_demand.industry_id === currentUserId);
        setMatches(myMatches);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        currentUserId = data.user.id;
        if (data.user.user_metadata?.full_name) {
          setUserName(data.user.user_metadata.full_name);
        }
        fetchData();
      }
    });
  }, [])

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="container p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{greeting}, {userName || 'Industry'}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage biomass demands, view smart matches, and track logistics.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
          <Link href="/industry/demand">
            <FileText className="mr-2 h-4 w-4" /> Post New Material Demand
          </Link>
        </Button>
      </motion.div>

      {/* KPI Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Demands</CardTitle>
              <FactoryIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-1">2 expiring soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Biomass Secured</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,240 Tons</div>
              <p className="text-xs text-muted-foreground mt-1">This quarter</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Inbound Logistics</CardTitle>
              <Truck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Trucks</div>
              <p className="text-xs text-muted-foreground mt-1">ETA: 4 Hours</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Energy Equivalent</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">4,800 MWh</div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400 mt-1">Generated from waste</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Active Demands List */}
        <Card className="col-span-full md:col-span-4 border-slate-200 dark:border-zinc-800 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              My Material Demands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : myDemands.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
                You have no active demands. Post one to start receiving matches.
              </div>
            ) : (
              myDemands.map((demand, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl border-slate-200 dark:border-zinc-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{demand.material_type}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Requires: {demand.required_quantity} {demand.unit} | Max Moisture: {demand.moisture_requirement}%</p>
                  </div>
                  <Button variant="destructive" size="sm" className="mt-4 sm:mt-0" onClick={async () => {
                    if (confirm("Are you sure you want to delete this demand?")) {
                      try {
                        await api.delete(`/demands/${demand.id}`);
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
          </CardContent>
        </Card>

        {/* Smart Matches / Offers */}
        <Card className="col-span-full md:col-span-4 border-slate-200 dark:border-zinc-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Live Match Proposals
            </CardTitle>
            <CardDescription>
              Real-time algorithm scanning database for residues matching your active demands.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                <p>Running Matching Algorithm...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
                <p>No active matches found. Try posting a new demand, or waiting for farmers to list residue.</p>
              </div>
            ) : (
              matches.map((match, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl ${match.match_score > 80 ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10' : 'border-slate-200 dark:border-zinc-800'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Clustered Deal (Fulfillment)</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${match.match_score > 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                        {Math.round(match.match_score)}% Match
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                      <span><strong>Material:</strong> {match.industry_demand.material_type}</span>
                      <span><strong>Cluster Vol:</strong> {match.total_fulfilled} {match.industry_demand.unit || 'kg'}</span>
                      {match.avg_price_per_unit && <span><strong>Avg Price:</strong> ₹{match.avg_price_per_unit}/unit</span>}
                      {match.is_clustered && <span><strong>Farms:</strong> {match.residue_listings?.length}</span>}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">View Details</Button>
                    <Button 
                      size="sm" 
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          await api.post('/procure', {
                            industry_id: match.industry_demand.industry_id,
                            residue_ids: match.residue_listings.map((r: any) => r.id)
                          });
                          alert("Match procured successfully! Notifications sent to farmers.");
                          window.location.reload();
                        } catch (e) {
                          console.error(e);
                          alert("Failed to procure match.");
                        }
                      }}
                    >
                      Procure
                    </Button>
                  </div>
                </div>
              ))
            )}

          </CardContent>
        </Card>

        {/* Live Logistics */}
        <Card className="col-span-full md:col-span-3 border-slate-200 dark:border-zinc-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-slate-600" />
              Inbound Deliveries
            </CardTitle>
            <CardDescription>Real-time cluster collection routes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800 space-y-6">
              
              <div className="relative">
                <span className="absolute -left-[35px] bg-green-500 rounded-full h-4 w-4 border-4 border-white dark:border-zinc-950"></span>
                <h5 className="font-medium text-sm">Convoy #302 - 150 Tons (Bagasse)</h5>
                <p className="text-xs text-muted-foreground">Departed Collection Centre</p>
                <p className="text-xs font-semibold text-green-600 mt-1">Status: On Route (ETA 2:00 PM)</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[35px] bg-amber-500 rounded-full h-4 w-4 border-4 border-white dark:border-zinc-950"></span>
                <h5 className="font-medium text-sm">Convoy #304 - 80 Tons (Rice Straw)</h5>
                <p className="text-xs text-muted-foreground">Loading at Guntur Cluster</p>
                <p className="text-xs font-semibold text-amber-600 mt-1">Status: Delayed (ETA 6:30 PM)</p>
              </div>

            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/industry/map">View Fleet on Map</Link>
            </Button>
            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
