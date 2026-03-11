import React from "react"
import { Database, TrendingUp, DollarSign, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Database,
    title: "Historical Sales Data",
    desc: "Collect past sales records including price, units sold, and date",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: TrendingUp,
    title: "Demand Prediction",
    desc: "Regression forecasting model predicts future demand patterns",
    color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  {
    icon: DollarSign,
    title: "Dynamic Pricing Engine",
    desc: "Rule-based pricing adjusts price based on predicted demand",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  {
    icon: CheckCircle,
    title: "Suggested New Price",
    desc: "Optimized price recommendation to maximize revenue",
    color: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
]

export default function ArchitectureDiagram() {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <div className={`rounded-2xl border-2 p-6 ${step.color} h-full`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shadow-sm">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <div className="h-6 w-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">→</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
