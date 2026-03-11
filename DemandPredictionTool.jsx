import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, ShoppingCart } from "lucide-react";

const SEASON_FACTORS = { winter: 0.85, spring: 1.05, summer: 1.15, autumn: 0.95 };
const MONTH_FACTORS = { jan: 0.80, feb: 0.85, mar: 0.95, apr: 1.0, may: 1.05, jun: 1.15, jul: 1.2, aug: 1.1, sep: 1.0, oct: 0.95, nov: 1.1, dec: 1.25 };
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const MONTH_LABELS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Simple demand model: base demand for category, adjusted by price elasticity + season + month
const CATEGORY_DEMAND = {
  electronics: 15, footwear: 45, clothing: 90, accessories: 12, home_appliances: 8, default: 30,
};

export default function DemandPredictionTool({ products }) {
  const [form, setForm] = useState({ product: "", price: "", month: "", season: "" });
  const [result, setResult] = useState(null);

  const predict = () => {
    if (!form.product || !form.price || !form.month || !form.season) return;

    const product = products?.find((p) => p.name === form.product);
    const category = product?.category || "default";
    const baseDemand = CATEGORY_DEMAND[category] || CATEGORY_DEMAND.default;
    const basePrice = product?.base_price || parseFloat(form.price);

    // Price elasticity effect
    const priceRatio = parseFloat(form.price) / basePrice;
    const elasticity = -1.2;
    const priceEffect = Math.pow(priceRatio, elasticity);

    // Season + month effect
    const seasonEffect = SEASON_FACTORS[form.season] || 1;
    const monthEffect = MONTH_FACTORS[form.month] || 1;

    const predictedDemand = Math.max(1, Math.round(baseDemand * priceEffect * seasonEffect * monthEffect));

    // Confidence interval
    const low = Math.max(1, Math.round(predictedDemand * 0.85));
    const high = Math.round(predictedDemand * 1.15);

    setResult({ predictedDemand, low, high, category, seasonEffect, monthEffect });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
          <Brain className="h-5 w-5 text-chart-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Demand Prediction Tool</h3>
          <p className="text-xs text-muted-foreground">Predict demand based on price, season, and month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Product</Label>
          <Select value={form.product} onValueChange={(v) => setForm({ ...form, product: v })}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              {products?.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Price (₹)</Label>
          <Input type="number" placeholder="e.g. 50000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Month</Label>
          <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
            <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={m} value={m}>{MONTH_LABELS[i]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Season</Label>
          <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
            <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="winter">Winter</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="autumn">Autumn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={predict} className="gap-2 w-full sm:w-auto bg-chart-5 hover:bg-chart-5/90">
        <Brain className="h-4 w-4" />
        Predict Demand
      </Button>

      {result && (
        <div className="mt-6 p-5 rounded-2xl bg-chart-5/5 border border-chart-5/20">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-5 w-5 text-chart-5" />
            <h4 className="font-bold text-foreground">Prediction Result</h4>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Predicted Demand</p>
              <p className="text-3xl font-extrabold text-chart-5">{result.predictedDemand} <span className="text-base font-normal text-muted-foreground">units</span></p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2">Confidence Range</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{result.low} units</Badge>
                <span className="text-xs text-muted-foreground">to</span>
                <Badge variant="secondary" className="text-xs">{result.high} units</Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>Season factor: <span className="font-semibold text-foreground">{result.seasonEffect}×</span></div>
            <div>Month factor: <span className="font-semibold text-foreground">{result.monthEffect}×</span></div>
          </div>
        </div>
      )}
    </Card>
  );
}