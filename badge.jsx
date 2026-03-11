import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "./utils.js"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white shadow hover:opacity-80",
        secondary: "border-transparent bg-gray-200 text-black hover:opacity-80",
        destructive: "border-transparent bg-red-600 text-white shadow hover:opacity-80",
        outline: "text-black border"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
