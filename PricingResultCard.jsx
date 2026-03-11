import React from "react"
import { Card } from "./card.jsx"
import { Badge } from "./badge.jsx"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  IndianRupee,
  TrendingUp,
  ShoppingCart,
  BarChart3
} from "lucide-react"

export default function PricingResultCard({ result }) {
  const {
    productName,
    currentPrice,
    predictedDemand,
    suggestedPrice,
    expectedDemand,
    revenueBefore,
    revenueAfter
  } = result

  const revenueChange = (
    ((revenueAfter - revenueBefore) / revenueBefore) *
    100
  ).toFixed(1)

  const priceChange = suggestedPrice - currentPrice

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider">
              Product
            </p>
            <h3 className="text-xl font-bold mt-1">
              {productName}
            </h3>
          </div>

          <Badge
            className={`text-sm px-4 py-1.5 ${
              priceChange > 0
                ? "text-green-600"
                : priceChange < 0
                ? "text-red-600"
                : ""
            }`}
          >
            {priceChange > 0 ? (
              <ArrowUp className="h-3.5 w-3.5 mr-1" />
            ) : priceChange < 0 ? (
              <ArrowDown className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Minus className="h-3.5 w-3.5 mr-1" />
            )}

            {priceChange > 0
              ? "Price Increase"
              : priceChange < 0
              ? "Price Decrease"
              : "No Change"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y">
        <MetricCell
          icon={IndianRupee}
          label="Current Price"
          value={`₹${currentPrice.toLocaleString()}`}
        />

        <MetricCell
          icon={IndianRupee}
          label="Suggested Price"
          value={`₹${suggestedPrice.toLocaleString()}`}
          highlight
        />

        <MetricCell
          icon={ShoppingCart}
          label="Predicted Demand"
          value={`${predictedDemand} units`}
        />

        <MetricCell
          icon={ShoppingCart}
          label="Expected Demand"
          value={`${expectedDemand} units`}
        />

        <MetricCell
          icon={BarChart3}
          label="Revenue Before"
          value={`₹${revenueBefore.toLocaleString()}`}
        />

        <MetricCell
          icon={TrendingUp}
          label="Revenue After"
          value={`₹${revenueAfter.toLocaleString()}`}
          highlight
        />
      </div>

      <div className="p-6 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm">Revenue Impact</p>

          <span
            className={`text-2xl font-bold ${
              parseFloat(revenueChange) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {parseFloat(revenueChange) >= 0 ? "+" : ""}
            {revenueChange}%
          </span>
        </div>

        <p className="text-xs mt-2">
          Price adjusts based on predicted demand elasticity.
        </p>
      </div>
    </Card>
  )
}

function MetricCell({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`p-5 ${highlight ? "bg-primary/5" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-xs">{label}</p>
      </div>

      <p className={`text-lg font-bold ${highlight ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  )
}
