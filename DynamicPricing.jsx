import React, { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "./card.jsx"
import { Button } from "./button.jsx"
import { Loader2, DollarSign } from "lucide-react"
import ProductSelector from "./ProductSelector.jsx"
import PricingResultCard from "./PricingResultCard.jsx"
import PriceOptimizationCalculator from "./PriceOptimizationCalculator.jsx"
import DemandPredictionTool from "./DemandPredictionTool.jsx"

function computePricing(productSales, currentPrice) {
  if (productSales.length < 3) return null

  const n = productSales.length
  const recentSales = productSales.slice(-Math.min(14, n))
  const avgDemand =
    recentSales.reduce((s, d) => s + d.units_sold, 0) / recentSales.length

  const olderSales = productSales.slice(0, Math.max(1, n - 14))
  const olderAvg =
    olderSales.reduce((s, d) => s + d.units_sold, 0) / olderSales.length

  const demandRatio = avgDemand / (olderAvg || 1)

  let priceMultiplier = 1
  if (demandRatio > 1.2) priceMultiplier = 1.12
  else if (demandRatio > 1.05) priceMultiplier = 1.06
  else if (demandRatio < 0.8) priceMultiplier = 0.88
  else if (demandRatio < 0.95) priceMultiplier = 0.94

  const suggestedPrice = Math.round(currentPrice * priceMultiplier)

  const elasticity = -1.2
  const pricePctChange = (suggestedPrice - currentPrice) / currentPrice
  const demandPctChange = pricePctChange * elasticity
  const expectedDemand = Math.max(
    1,
    Math.round(avgDemand * (1 + demandPctChange))
  )

  const predictedDemand = Math.round(avgDemand)
  const revenueBefore = currentPrice * predictedDemand
  const revenueAfter = suggestedPrice * expectedDemand

  return {
    currentPrice,
    predictedDemand,
    suggestedPrice,
    expectedDemand,
    revenueBefore,
    revenueAfter
  }
}

export default function DynamicPricing() {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [showResult, setShowResult] = useState(false)

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

  const result = useMemo(() => {
    if (!showResult || !selectedProduct) return null

    const product = products.find((p) => p.name === selectedProduct)
    if (!product) return null

    const productSales = salesData
      .filter((s) => s.product_name === selectedProduct)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const pricing = computePricing(
      productSales,
      product.current_price || product.base_price
    )

    if (!pricing) return null

    return { productName: selectedProduct, ...pricing }
  }, [showResult, selectedProduct, products, salesData])

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
          Dynamic Pricing
        </h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4">
          <ProductSelector
            products={products}
            selectedProduct={selectedProduct}
            onSelect={(v) => {
              setSelectedProduct(v)
              setShowResult(false)
            }}
          />

          <Button onClick={() => setShowResult(true)} className="gap-2">
            <DollarSign className="h-4 w-4" />
            Calculate Price
          </Button>
        </div>
      </Card>

      {showResult && result && <PricingResultCard result={result} />}

      {showResult && !result && (
        <Card className="p-12 text-center">
          <p>Not enough sales data to calculate pricing.</p>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">
          Price Optimization Calculator
        </h2>
        <PriceOptimizationCalculator />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Demand Prediction Tool
        </h2>
        <DemandPredictionTool products={products} />
      </div>
    </div>
  )
}
