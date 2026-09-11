import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,opacity,color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dollar-bill",
  {
    variants: {
      variant: {
        solid:
          "bg-walnut text-felt shadow-[0_1px_0_rgb(255_255_255/0.08)_inset] hover:bg-walnut-light",
        dollarBill: "bg-dollar-bill text-felt hover:bg-dollar-bill-deep",
        ghost: "bg-transparent text-felt-ink hover:bg-ink/6",
        velvet: "bg-velvet text-felt hover:bg-velvet-deep",
        outline:
          "bg-transparent text-felt-ink ring-1 ring-ink/15 hover:bg-ink/5",
      },
      size: {
        sm: "h-9 rounded-sm px-3 text-sm",
        md: "h-11 rounded-md px-4 text-sm",
        lg: "h-12 rounded-md px-5 text-base",
        icon: "size-11 rounded-md",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
