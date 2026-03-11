const db = globalThis.__B44_DB__ || {
  auth: { isAuthenticated: async () => false, me: async () => null },
  entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }),
  integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } }
};

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, IndianRupee, TrendingUp } from "lucide-react";
import ArchitectureDiagram from "../components/home/ArchitectureDiagram";
import TechStack from "../components/home/TechStack";
import StatCard from "../components/shared/StatCard";

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => db.entities.Product.list(),
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ["salesData"],
    queryFn: () => db.entities.SalesData.list("-date", 500),
  });

  const totalProducts = products.length;
  const totalSales = salesData.reduce((sum, s) => sum + (s.units_sold || 0), 0);
  const totalRevenue = salesData.reduce((sum, s) => sum + (s.price || 0) * (s.units_sold || 0), 0);
  const avgPrice = salesData.length > 0
    ? salesData.reduce((sum, s) => sum + (s.price || 0), 0) / salesData.length
    : 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-chart-5/10 p-8 md:p-12 border border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            ML-Powered System
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            Dynamic Pricing System Using{" "}
            <span className="text-primary">Demand Forecasting</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-xl">
            This system predicts product demand using historical sales data and
            automatically adjusts prices to maximize revenue through regression
            forecasting and rule-based pricing.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Products" value={totalProducts} icon={Package} color="primary" />
        <StatCard title="Total Units Sold" value={totalSales.toLocaleString()} icon={ShoppingCart} color="accent" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={IndianRupee} color="chart3" />
        <StatCard title="Avg. Price" value={`₹${Math.round(avgPrice).toLocaleString()}`} icon={TrendingUp} color="chart5" />
      </div>

      {/* Architecture */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">System Architecture</h2>
        <p className="text-sm text-muted-foreground mb-6">How the pricing pipeline works end-to-end</p>
        <ArchitectureDiagram />
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Technologies Used</h2>
        <p className="text-sm text-muted-foreground mb-6">Core components powering the system</p>
        <TechStack />
      </div>
    </div>
  );
}