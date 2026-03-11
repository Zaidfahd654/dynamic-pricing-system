const db = globalThis.__B44_DB__ || {
  auth: { isAuthenticated: async () => false, me: async () => null },
  entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }),
  integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } }
};

import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function DataAnalysis() {
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ["salesData"],
    queryFn: () => db.entities.SalesData.list("date", 1000),
  });

  const { demandTrend, priceVsDemand, revenueByProduct, monthlyDemand } = useMemo(() => {
    if (salesData.length === 0) return { demandTrend: [], priceVsDemand: [], revenueByProduct: [], monthlyDemand: [] };

    const sorted = [...salesData].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Aggregate daily demand
    const dailyMap = {};
    sorted.forEach((s) => {
      const day = s.date;
      if (!dailyMap[day]) dailyMap[day] = { date: day, units: 0, revenue: 0 };
      dailyMap[day].units += s.units_sold || 0;
      dailyMap[day].revenue += (s.price || 0) * (s.units_sold || 0);
    });
    const demandTrend = Object.values(dailyMap).map((d) => ({
      dateLabel: format(new Date(d.date), "MMM d"),
      units: d.units,
      revenue: d.revenue,
    }));

    // Price vs Demand (scatter)
    const priceVsDemand = sorted.map((s) => ({
      price: s.price,
      demand: s.units_sold,
      product: s.product_name,
    }));

    // Revenue by product
    const productMap = {};
    sorted.forEach((s) => {
      if (!productMap[s.product_name]) productMap[s.product_name] = { product: s.product_name, revenue: 0, units: 0 };
      productMap[s.product_name].revenue += (s.price || 0) * (s.units_sold || 0);
      productMap[s.product_name].units += s.units_sold || 0;
    });
    const revenueByProduct = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    // Monthly seasonal demand
    const monthMap = {};
    sorted.forEach((s) => {
      const month = format(new Date(s.date), "MMM yyyy");
      if (!monthMap[month]) monthMap[month] = { month, units: 0 };
      monthMap[month].units += s.units_sold || 0;
    });
    const monthlyDemand = Object.values(monthMap);

    return { demandTrend, priceVsDemand, revenueByProduct, monthlyDemand };
  }, [salesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
        {/* Demand Trend */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">Demand Over Time</h3>
          <p className="text-xs text-muted-foreground mb-6">Aggregated daily units sold</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandTrend}>
                <defs>
                  <linearGradient id="demGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="units" stroke="hsl(var(--primary))" fill="url(#demGrad)" strokeWidth={2} name="Units Sold" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Price vs Demand */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">Price vs Demand</h3>
          <p className="text-xs text-muted-foreground mb-6">Relationship between price and units sold</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="price" name="Price (₹)" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="demand" name="Units" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value, name) => [name === "price" ? `₹${value}` : value, name === "price" ? "Price" : "Demand"]}
                />
                <Scatter data={priceVsDemand} fill="hsl(var(--primary))" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue by Product */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">Revenue by Product</h3>
          <p className="text-xs text-muted-foreground mb-6">Total revenue contribution per product</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="product" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Seasonal Demand */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-1">Seasonal Demand</h3>
          <p className="text-xs text-muted-foreground mb-6">Monthly aggregated demand</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value) => [value, "Units Sold"]}
                />
                <Bar dataKey="units" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}