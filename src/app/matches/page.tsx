import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Factory, Leaf, MapPin, Truck } from "lucide-react"

export default function MatchesPage() {
  return (
    <div className="container p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Matches</h1>
        <p className="text-muted-foreground mt-1">Potential buyers for your listed agricultural residues.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">ABC Biomass Pvt Ltd</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Factory className="h-3 w-3" /> Industry Demand
                </CardDescription>
              </div>
              <div className="text-center bg-white dark:bg-black/40 rounded-lg p-2 border border-green-200 dark:border-green-900/50">
                <span className="text-2xl font-bold text-green-600">87%</span>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Match Score</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2 text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><Leaf className="h-4 w-4"/> Requirement</span>
              <span className="font-medium">Rice Straw (100 tons)</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-2">Match Factors:</p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Material Compatible (Rice Straw)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Quantity contributes to cluster (4.2 tons)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Quality matches (&lt;20% moisture)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Manageable distance (via Collection Hub)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-200">
                <Truck className="h-4 w-4" />
                <span className="font-semibold text-sm">Suggested Logistics</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your quantity (4.2 tons) is part of a potential <strong className="underline decoration-dashed cursor-pointer">12-ton Collection Cluster</strong> with 3 other nearby farmers.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 border-t pt-4">
            <Button className="w-full">Accept Match</Button>
            <Button variant="outline" className="w-full">View Details</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
