"use client"

import * as React from "react"

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
    ({ className, children, open, onOpenChange, ...props }, ref) => {
        const [isOpen, setIsOpen] = React.useState(open ?? false)

        React.useEffect(() => {
            if (open !== undefined) {
                setIsOpen(open)
            }
        }, [open])

        const handleToggle = () => {
            const newState = !isOpen
            setIsOpen(newState)
            onOpenChange?.(newState)
        }

        return (
            <div ref={ref} className={className} {...props}>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        if (child.type === CollapsibleTrigger) {
                            return React.cloneElement(child as React.ReactElement<any>, {
                                onClick: handleToggle,
                            })
                        }
                        if (child.type === CollapsibleContent) {
                            return React.cloneElement(child as React.ReactElement<any>, {
                                isOpen,
                            })
                        }
                    }
                    return child
                })}
            </div>
        )
    }
)
Collapsible.displayName = "Collapsible"

import { Slot } from "@radix-ui/react-slot"

// ... (Collapsible implementation)

const CollapsibleTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            ref={ref}
            type="button"
            className={className}
            {...props}
        >
            {children}
        </Comp>
    )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
    isOpen?: boolean
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
    ({ className, children, isOpen, ...props }, ref) => {
        return isOpen ? (
            <div ref={ref} className={className} {...props}>
                {children}
            </div>
        ) : null
    }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
