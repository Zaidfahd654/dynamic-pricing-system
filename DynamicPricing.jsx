const db = globalThis.__B44_DB__ || {
  auth: { isAuthenticated: async () => false, me: async () => null },
  entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }),
  integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } }
};

import React, { useState, useMemo, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign } from "lucide-react";
import ProductSelector from "../components/shared/ProductSelector";
import PricingResultCard from "../components/pricing/PricingResultCard";
import PriceOptimizationCalculator from "../components/pricing/PriceOptimizationCalculator";
import DemandPredictionTool from "../components/forecast/DemandPredictionTool";

function computePricing(productSales, currentPrice) {
  if (productSales.length < 3) return null;

  const n = productSales.length;
  const recentSales = productSales.slice(-Math.min(14, n));
  const avgDemand = recentSales.reduce((s, d) => s + d.units_sold, 0) / recentSales.length;

  const olderSales = productSales.slice(0, Math.max(1, n - 14));
  const olderAvg = olderSales.reduce((s, d) => s + d.units_sold, 0) / olderSales.length;

  // Demand trend ratio
  const demandRatio = avgDemand / (olderAvg || 1);

  // Rule-based pricing
  let priceMultiplier = 1;
  if (demandRatio > 1.2) priceMultiplier = 1.12;
  else if (demandRatio > 1.05) priceMultiplier = 1.06;
  else if (demandRatio < 0.8) priceMultiplier = 0.88;
  else if (demandRatio < 0.95) priceMultiplier = 0.94;

  const suggestedPrice = Math.round(currentPrice * priceMultiplier);

  // Price elasticity estimation
  const elasticity = -1.2;
  const pricePctChange = (suggestedPrice - currentPrice) / currentPrice;
  const demandPctChange = pricePctChange * elasticity;
  const expectedDemand = Math.max(1, Math.round(avgDemand * (1 + demandPctChange)));

  const predictedDemand = Math.round(avgDemand);
  const revenueBefore = currentPrice * predictedDemand;
  const revenueAfter = suggestedPrice * expectedDemand;

  return {
    currentPrice,
    predictedDemand,
    suggestedPrice,
    expectedDemand,
    revenueBefore,
    revenueAfter,
  };
}

export default function DynamicPricing() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showResult, setShowResult] = useState(false);

  const { data: products = [], isLoading: pl } = useQuery({
    queryKey: ["products"],
    queryFn: () => db.entities.Product.list(),
  });

  const { data: salesData = [], isLoading: sl } = useQuery({
    queryKey: ["salesData"],
    queryFn: () => db.entities.SalesData.list("date", 1000),
  });

  React.useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].name);
    }
  }, [products, selectedProduct]);

  const result = useMemo(() => {
    if (!showResult || !selectedProduct) return null;

    const product = products.find((p) => p.name === selectedProduct);
    if (!product) return null;

    const productSales = salesData
      .filter((s) => s.product_name === selectedProduct)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const pricing = computePricing(productSales, product.current_price || product.base_price);
    if (!pricing) return null;

    return { productName: selectedProduct, ...pricing };
  }, [showResult, selectedProduct, products, salesData]);

  if (pl || sl) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dynamic Pricing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rule-based pricing engine calculates optimal price based on predicted demand
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Select Product</h3>
        <div className="flex flex-wrap items-end gap-4">
          <ProductSelector
            products={products}
            selectedProduct={selectedProduct}
            onSelect={(v) => { setSelectedProduct(v); setShowResult(false); }}
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
          <p className="text-muted-foreground">Not enough sales data to calculate pricing for this product (need at least 3 records).</p>
        </Card>
      )}

      <Card className="p-6 border-l-4 border-l-primary">
        <h3 className="font-semibold text-foreground mb-2">How It Works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Compares recent demand (last 14 days) against older demand trends</li>
          <li>• If demand is rising ({">"}20%), price increases by ~12%</li>
          <li>• If demand is falling ({"<"}80%), price decreases by ~12%</li>
          <li>• Price elasticity of demand (ε = -1.2) estimates new demand at suggested price</li>
          <li>• Revenue impact is calculated: suggested price × expected demand</li>
        </ul>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Price Optimization Calculator</h2>
        <p className="text-sm text-muted-foreground mb-4">Enter any product's details manually to get a pricing recommendation</p>
        <PriceOptimizationCalculator />
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Demand Prediction Tool</h2>
        <p className="text-sm text-muted-foreground mb-4">Predict future demand by specifying price, month, and season</p>
        <DemandPredictionTool products={products} />
      </div>
    </div>
  );
}