import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Home,
  LineChart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Menu,
  Activity,
  Upload
} from "lucide-react"
import { Button } from "./button.jsx"

const navItems = [
  { name: "Home", icon: Home, page: "/" },
  { name: "Price History", icon: LineChart, page: "/PriceHistory" },
  { name: "Demand Forecast", icon: TrendingUp, page: "/DemandForecast" },
  { name: "Dynamic Pricing", icon: DollarSign, page: "/DynamicPricing" },
  { name: "Data Analysis", icon: BarChart3, page: "/DataAnalysis" },
  { name: "Upload Sales Data", icon: Upload, page: "/UploadSalesData" }
]

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 border-r flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-bold text-lg leading-tight">
                Dynamic Pricing
              </h1>
              <p className="text-xs">Demand Forecasting System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page

            return (
              <Link
                key={item.page}
                to={item.page}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive ? "bg-primary text-white" : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="px-4 py-3 rounded-xl">
            <p className="text-xs">Built with</p>
            <p className="text-sm font-semibold mt-0.5">
              ML + Rule-Based Engine
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 border-b px-6 py-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
