import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Package, ShoppingCart, IndianRupee, TrendingUp } from "lucide-react"
import ArchitectureDiagram from "./ArchitectureDiagram.jsx"
import TechStack from "./TechStack.jsx"
import StatCard from "./StatCard.jsx"

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => []
  })

  const { data: salesData = [] } = useQuery({
    queryKey: ["salesData"],
    queryFn: async () => []
  })

  const totalProducts = products.length
  const totalSales = salesData.reduce((sum, s) => sum + (s.units_sold || 0), 0)

  const totalRevenue = salesData.reduce(
    (sum, s) => sum + (s.price || 0) * (s.units_sold || 0),
    0
  )

  const avgPrice =
    salesData.length > 0
      ? salesData.reduce((sum, s) => sum + (s.price || 0), 0) /
        salesData.length
      : 0

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            ML-Powered System
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Dynamic Pricing System Using{" "}
            <span className="text-primary">Demand Forecasting</span>
          </h1>

          <p className="mt-4 text-base leading-relaxed max-w-xl">
            This system predicts product demand using historical sales data and
            adjusts prices to maximize revenue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Products"
          value={totalProducts}
          icon={Package}
          color="primary"
        />

        <StatCard
          title="Total Units Sold"
          value={totalSales.toLocaleString()}
          icon={ShoppingCart}
          color="accent"
        />

        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="chart3"
        />

        <StatCard
          title="Avg. Price"
          value={`₹${Math.round(avgPrice).toLocaleString()}`}
          icon={TrendingUp}
          color="chart5"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">System Architecture</h2>
        <ArchitectureDiagram />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Technologies Used</h2>
        <TechStack />
      </div>
    </div>
  )
}
