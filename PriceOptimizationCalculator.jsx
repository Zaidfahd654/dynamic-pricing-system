import React, { useState } from "react"
import { Card } from "./card.jsx"
import { Input } from "./input.jsx"
import { Label } from "./label.jsx"
import { Button } from "./button.jsx"
import { Calculator, TrendingUp, IndianRupee, ShoppingCart, BarChart3 } from "lucide-react"

export default function PriceOptimizationCalculator() {
  const [form, setForm] = useState({ currentPrice: "", unitsSold: "", costPrice: "" })
  const [result, setResult] = useState(null)

  const calculate = () => {
    const currentPrice = parseFloat(form.currentPrice)
    const unitsSold = parseInt(form.unitsSold)
    const costPrice = parseFloat(form.costPrice)

    if (!currentPrice || !unitsSold || !costPrice) return

    const elasticity = -1.2
    const margin = (currentPrice - costPrice) / currentPrice
    const optimalMargin = -1 / elasticity

    const recommendedPrice = Math.round(
      costPrice / (1 - Math.min(optimalMargin, margin + 0.15))
    )

    const pricePctChange = (recommendedPrice - currentPrice) / currentPrice
    const demandPctChange = pricePctChange * elasticity

    const predictedDemand = Math.max(
      1,
      Math.round(unitsSold * (1 + demandPctChange))
    )

    const revenueBefore = currentPrice * unitsSold
    const revenueAfter = recommendedPrice * predictedDemand
    const profitBefore = (currentPrice - costPrice) * unitsSold
    const profitAfter = (recommendedPrice - costPrice) * predictedDemand

    const revenueChange = (
      ((revenueAfter - revenueBefore) / revenueBefore) *
      100
    ).toFixed(1)

    const profitChange = (
      ((profitAfter - profitBefore) / profitBefore) *
      100
    ).toFixed(1)

    setResult({
      recommendedPrice,
      predictedDemand,
      revenueBefore,
      revenueAfter,
      profitBefore,
      profitAfter,
      revenueChange,
      profitChange
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-bold">Price Optimization Calculator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <Label className="text-xs mb-1.5 block">Current Price (₹)</Label>
          <Input
            type="number"
            placeholder="1000"
            value={form.currentPrice}
            onChange={(e) =>
              setForm({ ...form, currentPrice: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">Units Sold</Label>
          <Input
            type="number"
            placeholder="50"
            value={form.unitsSold}
            onChange={(e) =>
              setForm({ ...form, unitsSold: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">Cost Price (₹)</Label>
          <Input
            type="number"
            placeholder="700"
            value={form.costPrice}
            onChange={(e) =>
              setForm({ ...form, costPrice: e.target.value })
            }
          />
        </div>
      </div>

      <Button onClick={calculate} className="gap-2">
        <TrendingUp className="h-4 w-4" />
        Calculate Optimal Price
      </Button>

      {result && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <ResultMetric
            icon={IndianRupee}
            label="Recommended Price"
            value={`₹${result.recommendedPrice.toLocaleString()}`}
            highlight
          />

          <ResultMetric
            icon={ShoppingCart}
            label="Predicted Demand"
            value={`${result.predictedDemand} units`}
          />

          <ResultMetric
            icon={BarChart3}
            label="Revenue Change"
            value={`${parseFloat(result.revenueChange) >= 0 ? "+" : ""}${result.revenueChange}%`}
            positive={parseFloat(result.revenueChange) >= 0}
          />

          <ResultMetric
            icon={IndianRupee}
            label="Revenue Before"
            value={`₹${result.revenueBefore.toLocaleString()}`}
          />

          <ResultMetric
            icon={IndianRupee}
            label="Revenue After"
            value={`₹${result.revenueAfter.toLocaleString()}`}
          />

          <ResultMetric
            icon={TrendingUp}
            label="Profit Change"
            value={`${parseFloat(result.profitChange) >= 0 ? "+" : ""}${result.profitChange}%`}
            positive={parseFloat(result.profitChange) >= 0}
          />
        </div>
      )}
    </Card>
  )
}

function ResultMetric({ icon: Icon, label, value, highlight, positive }) {
  let textColor = "text-foreground"

  if (highlight) textColor = "text-primary"
  else if (positive !== undefined)
    textColor = positive ? "text-green-600" : "text-red-600"

  return (
    <div className="p-4 rounded-xl border">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-xs">{label}</p>
      </div>

      <p className={`text-lg font-bold ${textColor}`}>{value}</p>
    </div>
  )
}
