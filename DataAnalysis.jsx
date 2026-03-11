import React, { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "./card.jsx"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

export default function DataAnalysis() {
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ["salesData"],
    queryFn: async () => []
  })

  const { demandTrend, priceVsDemand, revenueByProduct, monthlyDemand } =
    useMemo(() => {
      if (salesData.length === 0)
        return {
          demandTrend: [],
          priceVsDemand: [],
          revenueByProduct: [],
          monthlyDemand: []
        }

      const sorted = [...salesData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      )

      const dailyMap = {}

      sorted.forEach((s) => {
        const day = s.date
        if (!dailyMap[day]) dailyMap[day] = { date: day, units: 0, revenue: 0 }

        dailyMap[day].units += s.units_sold || 0
        dailyMap[day].revenue += (s.price || 0) * (s.units_sold || 0)
      })

      const demandTrend = Object.values(dailyMap).map((d) => ({
        dateLabel: format(new Date(d.date), "MMM d"),
        units: d.units,
        revenue: d.revenue
      }))

      const priceVsDemand = sorted.map((s) => ({
        price: s.price,
        demand: s.units_sold,
        product: s.product_name
      }))

      const productMap = {}

      sorted.forEach((s) => {
        if (!productMap[s.product_name])
          productMap[s.product_name] = {
            product: s.product_name,
            revenue: 0,
            units: 0
          }

        productMap[s.product_name].revenue +=
          (s.price || 0) * (s.units_sold || 0)

        productMap[s.product_name].units += s.units_sold || 0
      })

      const revenueByProduct = Object.values(productMap).sort(
        (a, b) => b.revenue - a.revenue
      )

      const monthMap = {}

      sorted.forEach((s) => {
        const month = format(new Date(s.date), "MMM yyyy")

        if (!monthMap[month]) monthMap[month] = { month, units: 0 }

        monthMap[month].units += s.units_sold || 0
      })

      const monthlyDemand = Object.values(monthMap)

      return {
        demandTrend,
        priceVsDemand,
        revenueByProduct,
        monthlyDemand
      }
    }, [salesData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exploratory data analysis and visualization of sales patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">
            Demand Over Time
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="units"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">
            Price vs Demand
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="price" />
                <YAxis dataKey="demand" />
                <Tooltip />
                <Scatter data={priceVsDemand} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">
            Revenue by Product
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">
            Seasonal Demand
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDemand}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="units" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
