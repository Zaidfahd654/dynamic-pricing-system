import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, IndianRupee, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";

export default function PricingResultCard({ result }) {
  const {
    productName,
    currentPrice,
    predictedDemand,
    suggestedPrice,
    expectedDemand,
    revenueBefore,
    revenueAfter,
  } = result;

  const revenueChange = ((revenueAfter - revenueBefore) / revenueBefore * 100).toFixed(1);
  const priceChange = suggestedPrice - currentPrice;

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product</p>
            <h3 className="text-xl font-bold text-foreground mt-1">{productName}</h3>
          </div>
          <Badge
            className={`text-sm px-4 py-1.5 ${
              priceChange > 0
                ? "bg-accent/10 text-accent border-accent/20"
                : priceChange < 0
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {priceChange > 0 ? <ArrowUp className="h-3.5 w-3.5 mr-1" /> :
             priceChange < 0 ? <ArrowDown className="h-3.5 w-3.5 mr-1" /> :
             <Minus className="h-3.5 w-3.5 mr-1" />}
            {priceChange > 0 ? "Price Increase" : priceChange < 0 ? "Price Decrease" : "No Change"}
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-border">
        <MetricCell icon={IndianRupee} label="Current Price" value={`₹${currentPrice.toLocaleString()}`} />
        <MetricCell icon={IndianRupee} label="Suggested Price" value={`₹${suggestedPrice.toLocaleString()}`} highlight />
        <MetricCell icon={ShoppingCart} label="Predicted Demand" value={`${predictedDemand} units`} />
        <MetricCell icon={ShoppingCart} label="Expected Demand" value={`${expectedDemand} units`} />
        <MetricCell icon={BarChart3} label="Revenue Before" value={`₹${revenueBefore.toLocaleString()}`} />
        <MetricCell icon={TrendingUp} label="Revenue After" value={`₹${revenueAfter.toLocaleString()}`} highlight />
      </div>

      {/* Revenue Impact */}
      <div className="p-6 bg-muted/30 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Revenue Impact</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${parseFloat(revenueChange) >= 0 ? "text-accent" : "text-destructive"}`}>
              {parseFloat(revenueChange) >= 0 ? "+" : ""}{revenueChange}%
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          System adjusts price based on predicted demand elasticity. Higher demand → higher price, lower demand → lower price.
        </p>
      </div>
    </Card>
  );
}

function MetricCell({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`p-5 ${highlight ? "bg-primary/5" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}