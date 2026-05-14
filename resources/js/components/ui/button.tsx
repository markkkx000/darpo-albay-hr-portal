import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] spring-press",
  {
    variants: {
      variant: {
        default:
          "btn-specular",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border-2 bg-background shadow-xs hover:item-hover-gradient hover:border-transparent hover:text-black",
        "outline-primary":
          "border border-primary/30 bg-transparent text-primary font-semibold hover:item-hover-gradient hover:border-transparent hover:text-black hover:shadow-[0_8px_24px_rgba(34,197,94,0.35)] transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:item-hover-gradient hover:text-black",
        ghost: "hover:item-hover-gradient hover:text-black",
        link: "text-primary underline-offset-4 hover:underline",
        warning:
          "btn-warning-specular",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-8 has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
