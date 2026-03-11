import React, { useMemo, useState } from "react"
import { Card } from "./card.jsx"
import { Badge } from "./badge.jsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.jsx"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, addDays } from "date-fns"
import { TrendingUp, DollarSign } from "lucide-react"

function linearRegression(data) {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0 }
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  data.forEach((d, i) => {
    sumX += i
    sumY += d.y
    sumXY += i * d.y
    sumX2 += i * i
  })
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0
  const intercept = (sumY - slope * sumX) / n || 0
  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept }
}

export default function UploadAnalysis({ data, fileName }) {
  const products = useMemo(() => [...new Set(data.map((d) => d.product_name))], [data])
  const [selectedProduct, setSelectedProduct] = useState(products[0] || "")

  const { chartData, forecastData, pricing } = useMemo(() => {
    if (!selectedProduct) return { chartData: [], forecastData: [], pricing: null }

    const productData = data
      .filter((d) => d.product_name === selectedProduct)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    if (productData.length === 0) return { chartData: [], forecastData: [], pricing: null }

    const chartData = productData.map((d) => ({
      dateLabel: d.date,
      price: d.price,
      units: d.units_sold,
      revenue: d.price * d.units_sold
    }))

    const regData = productData.map((d, i) => ({ x: i, y: d.units_sold }))
    const { slope, intercept } = linearRegression(regData)
    const avgSold = regData.reduce((s, d) => s + d.y, 0) / regData.length
    const lastDate = new Date(productData[productData.length - 1].date)
    const n = productData.length

    const forecastData = Array.from({ length: 7 }, (_, i) => {
      const predicted = Math.max(
        1,
        Math.round(intercept + slope * (n + i) + Math.sin((n + i) / 3) * avgSold * 0.1)
      )
      return {
        day: `Day ${i + 1}`,
        dateLabel: format(addDays(lastDate, i + 1), "MMM d"),
        predicted
      }
    })

    const currentPrice = productData[productData.length - 1].price
    const recent = productData.slice(-Math.min(7, n))
    const older = productData.slice(0, Math.max(1, n - 7))
    const recentAvg = recent.reduce((s, d) => s + d.units_sold, 0) / recent.length
    const olderAvg = older.reduce((s, d) => s + d.units_sold, 0) / (older.length || 1)
    const demandRatio = recentAvg / (olderAvg || 1)

    let mult = 1
    if (demandRatio > 1.15) mult = 1.12
    else if (demandRatio > 1.05) mult = 1.06
    else if (demandRatio < 0.85) mult = 0.88
    else if (demandRatio < 0.95) mult = 0.94

    const suggestedPrice = Math.round(currentPrice * mult)
    const predictedDemand = Math.round(recentAvg)
    const elasticity = -1.2
    const pricePct = (suggestedPrice - currentPrice) / currentPrice
    const expectedDemand = Math.max(1, Math.round(predictedDemand * (1 + pricePct * elasticity)))
    const revenueBefore = currentPrice * predictedDemand
    const revenueAfter = suggestedPrice * expectedDemand
    const revenueChange = ((revenueAfter - revenueBefore) / revenueBefore * 100).toFixed(1)

    return {
      chartData,
      forecastData,
      pricing: {
        currentPrice,
        suggestedPrice,
        predictedDemand,
        expectedDemand,
        revenueBefore,
        revenueAfter,
        revenueChange,
        priceChange: suggestedPrice - currentPrice
      }
    }
  }, [selectedProduct, data])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Badge className="gap-2 text-sm px-4 py-2">
          📄 {fileName} — {data.length} records
        </Badge>

        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-1">Price History</h3>
          <p className="text-xs mb-4">Price over time from your data</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip formatter={(v) => [`₹${v}`, "Price"]} />
                <Area type="monotone" dataKey="price" stroke="#6366f1" fillOpacity={0.2} fill="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-1">Demand Trend</h3>
          <p className="text-xs mb-4">Units sold over time</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip formatter={(v) => [v, "Units Sold"]} />
                <Area type="monotone" dataKey="units" stroke="#22c55e" fillOpacity={0.2} fill="#22c55e" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {pricing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-semibold">Demand Forecast — Next 7 Days</h3>
            </div>

            <div className="space-y-2">
              {forecastData.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="text-sm font-medium">{d.day}</span>
                    <span className="text-xs ml-2">{d.dateLabel}</span>
                  </div>
                  <Badge>{d.predicted} units</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4" />
                <h3 className="font-semibold">Suggested Price — {selectedProduct}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <Row label="Current Price" value={`₹${pricing.currentPrice.toLocaleString()}`} />
              <Row label="Predicted Demand" value={`${pricing.predictedDemand} units`} />
              <Row label="Suggested Price" value={`₹${pricing.suggestedPrice.toLocaleString()}`} highlight />
              <Row label="Expected Demand" value={`${pricing.expectedDemand} units`} />
              <Row label="Revenue Before" value={`₹${pricing.revenueBefore.toLocaleString()}`} />
              <Row label="Revenue After" value={`₹${pricing.revenueAfter.toLocaleString()}`} />

              <div className="flex items-center justify-between rounded-xl px-4 py-3">
                <span className="text-sm">Revenue Impact</span>
                <span className="text-xl font-bold">
                  {parseFloat(pricing.revenueChange) >= 0 ? "+" : ""}
                  {pricing.revenueChange}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-indigo-600" : ""}`}>{value}</span>
    </div>
  )
}
