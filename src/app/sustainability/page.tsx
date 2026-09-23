import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecoveryChart } from "@/components/SustainabilityCharts"
import { Leaf, Sprout, TrendingUp, Truck, Wind } from "lucide-react"

export default function SustainabilityPage() {
  return (
    <div className="container p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AgroSetu Impact</h1>
        <p className="text-muted-foreground mt-1">Measurable environmental and economic indicators for your region.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produce Saved</CardTitle>
            <Sprout className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240 kg</div>
            <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residue Recovered</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5 tons</div>
            <p className="text-xs text-muted-foreground mt-1">Primarily Rice Straw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emissions Avoided</CardTitle>
            <Wind className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">420 kg CO₂e</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated vs baseline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transport Optimized</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145 km</div>
            <p className="text-xs text-muted-foreground mt-1">Reduced via clustering</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-full md:col-span-4">
          <CardHeader>
            <CardTitle>Resource Recovery Trend</CardTitle>
            <CardDescription>Volume of agricultural residue recovered over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecoveryChart />
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-3">
          <CardHeader>
            <CardTitle>Economic Value Generated</CardTitle>
            <CardDescription>Estimated potential farmer revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">₹42,500</div>
              <p className="text-sm text-muted-foreground">Total value realized by farmers through residue sales.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Industry Demand Fulfilled</h4>
                  <p className="text-xs text-muted-foreground">72% match rate this quarter</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sprout className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Cooling Capacity Utilized</h4>
                  <p className="text-xs text-muted-foreground">85% average utilization</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground italic">
              * Environmental values are presented as estimates based on stated assumptions, not as independently verified measurements.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
