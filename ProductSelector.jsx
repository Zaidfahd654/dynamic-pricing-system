import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.jsx"

export default function ProductSelector({ products, selectedProduct, onSelect }) {
  return (
    <Select value={selectedProduct} onValueChange={onSelect}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a product" />
      </SelectTrigger>

      <SelectContent>
        {products.map((p) => (
          <SelectItem key={p.name} value={p.name}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
