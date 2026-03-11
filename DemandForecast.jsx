const db = globalThis.__B44_DB__ || {
  auth: { isAuthenticated: async () => false, me: async () => null },
  entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }),
  integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } }
};

import React, { useState, useMemo, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format, addDays } from "date-fns";
import { Loader2, TrendingUp } from "lucide-react";
import ProductSelector from "../components/shared/ProductSelector";
import ForecastTable from "../components/forecast/ForecastTable";

function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumX2 += data[i].x * data[i].x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
}

export default function DemandForecast() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [futureDays, setFutureDays] = useState(14);
  const [showForecast, setShowForecast] = useState(false);

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

  const { forecastData, chartData } = useMemo(() => {
    if (!selectedProduct || !showForecast) return { forecastData: [], chartData: [] };

    const productSales = salesData
      .filter((s) => s.product_name === selectedProduct)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (productSales.length === 0) return { forecastData: [], chartData: [] };

    // Prepare regression data
    const regData = productSales.map((s, i) => ({ x: i, y: s.units_sold }));
    const { slope, intercept } = linearRegression(regData);

    // Add some seasonal variation
    const avgSold = regData.reduce((s, d) => s + d.y, 0) / regData.length;
    const seasonalAmplitude = avgSold * 0.15;

    const lastDate = new Date(productSales[productSales.length - 1].date);
    const n = regData.length;

    // Historical data for chart
    const historical = productSales.map((s, i) => ({
      dateLabel: format(new Date(s.date), "MMM d"),
      actual: s.units_sold,
      predicted: null,
      type: "historical",
    }));

    // Forecast data
    const forecast = [];
    for (let i = 1; i <= futureDays; i++) {
      const futureDate = addDays(lastDate, i);
      const basePredict = intercept + slope * (n + i - 1);
      const seasonal = Math.sin(((n + i) / 7) * Math.PI) * seasonalAmplitude;
      const noise = (Math.random() - 0.5) * avgSold * 0.08;
      const predicted = Math.max(1, Math.round(basePredict + seasonal + noise));

      forecast.push({
        dateLabel: format(futureDate, "MMM d"),
        actual: null,
        predicted,
        type: "forecast",
      });
    }

    return {
      forecastData: forecast,
      chartData: [...historical, ...forecast],
    };
  }, [salesData, selectedProduct, futureDays, showForecast]);

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
        <h1 className="text-2xl font-bold text-foreground">Demand Forecast</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ML regression model predicts future demand based on historical trends
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Configure Forecast</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Product</Label>
            <ProductSelector products={products} selectedProduct={selectedProduct} onSelect={(v) => { setSelectedProduct(v); setShowForecast(false); }} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Future Days</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={futureDays}
              onChange={(e) => { setFutureDays(parseInt(e.target.value) || 7); setShowForecast(false); }}
              className="w-32"
            />
          </div>
          <Button onClick={() => setShowForecast(true)} className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Generate Forecast
          </Button>
        </div>
      </Card>

      {showForecast && chartData.length > 0 && (
        <>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-1">
              Forecast: {selectedProduct} — Next {futureDays} Days
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Blue = Historical actual, Green = Predicted demand
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={Math.floor(chartData.length / 10)} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="url(#actualGrad)" strokeWidth={2} name="Actual" connectNulls={false} />
                  <Area type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" name="Predicted" connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <ForecastTable forecastData={forecastData} />
        </>
      )}
    </div>
  );
}