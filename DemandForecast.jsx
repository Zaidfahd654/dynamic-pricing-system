import React, { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "./card.jsx"
import { Button } from "./button.jsx"
import { Input } from "./input.jsx"
import { Label } from "./label.jsx"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format, addDays } from "date-fns"
import { Loader2, TrendingUp } from "lucide-react"
import ProductSelector from "./ProductSelector.jsx"
import ForecastTable from "./ForecastTable.jsx"

function linearRegression(data) {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0 }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += data[i].x
    sumY += data[i].y
    sumXY += data[i].x * data[i].y
    sumX2 += data[i].x * data[i].x
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return {
    slope: isNaN(slope) ? 0 : slope,
    intercept: isNaN(intercept) ? 0 : intercept
  }
}

export default function DemandForecast() {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [futureDays, setFutureDays] = useState(14)
  const [showForecast, setShowForecast] = useState(false)

  const { data: products = [], isLoading: pl } = useQuery({
    queryKey: ["products"],
    queryFn: async () => []
  })

  const { data: salesData = [], isLoading: sl } = useQuery({
    queryKey: ["salesData"],
    queryFn: async () => []
  })

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].name)
    }
  }, [products, selectedProduct])

  const { forecastData, chartData } = useMemo(() => {
    if (!selectedProduct || !showForecast)
      return { forecastData: [], chartData: [] }

    const productSales = salesData
      .filter((s) => s.product_name === selectedProduct)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    if (productSales.length === 0)
      return { forecastData: [], chartData: [] }

    const regData = productSales.map((s, i) => ({
      x: i,
      y: s.units_sold
    }))

    const { slope, intercept } = linearRegression(regData)

    const avgSold =
      regData.reduce((s, d) => s + d.y, 0) / regData.length

    const seasonalAmplitude = avgSold * 0.15

    const lastDate = new Date(productSales[productSales.length - 1].date)
    const n = regData.length

    const historical = productSales.map((s) => ({
      dateLabel: format(new Date(s.date), "MMM d"),
      actual: s.units_sold,
      predicted: null,
      type: "historical"
    }))

    const forecast = []

    for (let i = 1; i <= futureDays; i++) {
      const futureDate = addDays(lastDate, i)
      const basePredict = intercept + slope * (n + i - 1)
      const seasonal = Math.sin(((n + i) / 7) * Math.PI) * seasonalAmplitude
      const noise = (Math.random() - 0.5) * avgSold * 0.08

      const predicted = Math.max(
        1,
        Math.round(basePredict + seasonal + noise)
      )

      forecast.push({
        dateLabel: format(futureDate, "MMM d"),
        actual: null,
        predicted,
        type: "forecast"
      })
    }

    return {
      forecastData: forecast,
      chartData: [...historical, ...forecast]
    }
  }, [salesData, selectedProduct, futureDays, showForecast])

  if (pl || sl) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Demand Forecast
        </h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-xs mb-2 block">Product</Label>
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onSelect={(v) => {
                setSelectedProduct(v)
                setShowForecast(false)
              }}
            />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Future Days</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={futureDays}
              onChange={(e) => {
                setFutureDays(parseInt(e.target.value) || 7)
                setShowForecast(false)
              }}
              className="w-32"
            />
          </div>

          <Button
            onClick={() => setShowForecast(true)}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Generate Forecast
          </Button>
        </div>
      </Card>

      {showForecast && chartData.length > 0 && (
        <>
          <Card className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    strokeDasharray="6 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <ForecastTable forecastData={forecastData} />
        </>
      )}
    </div>
  )
}
