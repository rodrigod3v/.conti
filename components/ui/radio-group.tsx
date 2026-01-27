"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("grid gap-2", className)}
                role="radiogroup"
                {...props}
            >
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        const element = child as React.ReactElement<{
                            value: string
                            checked?: boolean
                            onClick?: (value: string) => void
                        }>
                        return React.cloneElement(element, {
                            checked: element.props.value === value,
                            onClick: () => onValueChange?.(element.props.value),
                        })
                    }
                    return child
                })}
            </div>
        )
    }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
    checked?: boolean
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
    ({ className, checked, value, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                role="radio"
                aria-checked={checked}
                className={cn(
                    "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
                    checked && "bg-primary",
                    className
                )}
                {...props}
            >
                {checked && (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
            </button>
        )
    }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
