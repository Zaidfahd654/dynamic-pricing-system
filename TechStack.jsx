import React from "react";
import { Cpu, BarChart3, Globe, Database } from "lucide-react";

const techs = [
  { icon: Database, name: "Data Collection", desc: "Historical sales data with date, price, and units sold" },
  { icon: Cpu, name: "ML Forecasting", desc: "Regression-based demand prediction model" },
  { icon: BarChart3, name: "Rule-Based Engine", desc: "Dynamic pricing based on demand elasticity" },
  { icon: Globe, name: "Web Dashboard", desc: "Interactive visualization and analytics" },
];

export default function TechStack() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {techs.map((tech, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
        >
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <tech.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">{tech.name}</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tech.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}