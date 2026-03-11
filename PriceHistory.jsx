import React, { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "./card.jsx"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import ProductSelector from "./ProductSelector.jsx"

export default function PriceHistory() {
  const [selectedProduct, setSelectedProduct] = useState("")

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => []
  })

  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ["salesData"],
    queryFn: async () => []
  })

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0].name)
    }
  }, [products, selectedProduct])

  const filteredData = useMemo(() => {
    return salesData
      .filter((s) => s.product_name === selectedProduct)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((s) => ({
        ...s,
        dateLabel: format(new Date(s.date), "MMM d"),
        revenue: s.price * s.units_sold
      }))
  }, [salesData, selectedProduct])

  if (productsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Price History</h1>
      </div>

      <ProductSelector
        products={products}
        selectedProduct={selectedProduct}
        onSelect={setSelectedProduct}
      />

      {filteredData.length === 0 ? (
        <Card className="p-12 text-center">
          <p>No sales data available for this product.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Price Over Time</h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, "Price"]} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-6">Units Sold Over Time</h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Units Sold"]} />
                  <Area
                    type="monotone"
                    dataKey="units_sold"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold mb-6">Revenue Over Time</h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
