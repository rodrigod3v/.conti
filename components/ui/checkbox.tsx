"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean | "indeterminate") => void }
>(({ className, checked, onCheckedChange, ...props }, ref) => {

    // Handle change to match Radix UI API
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(e.target.checked);
        props.onChange?.(e);
    };

    return (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                ref={ref}
                className="peer h-4 w-4 shrink-0 opacity-0 absolute z-10 cursor-pointer"
                checked={checked === true}
                onChange={handleChange}
                {...props}
            />
            <div className={cn(
                "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked === true ? "bg-primary text-primary-foreground" : "bg-transparent",
                className
            )}>
                {checked === true && (
                    <span className="flex items-center justify-center text-current pointer-events-none">
                        <Check className="h-3 w-3" />
                    </span>
                )}
            </div>
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
