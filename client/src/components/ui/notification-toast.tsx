import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, User, MessageCircle, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const NotificationProvider = ToastPrimitives.Provider

const NotificationViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex max-h-screen w-full max-w-sm flex-col gap-2 p-4",
      className
    )}
    {...props}
  />
))
NotificationViewport.displayName = "NotificationViewport"

const notificationVariants = cva(
  "group pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-2xl border-2 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:shadow-3xl active:scale-[0.97] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
  {
    variants: {
      variant: {
        default: "border-border bg-background/95 text-foreground",
        profile_view: "border-blue-400/50 bg-gradient-to-r from-blue-950/90 to-blue-900/80 backdrop-blur-xl shadow-blue-500/20",
        message_received: "border-green-400/50 bg-gradient-to-r from-green-950/90 to-green-900/80 backdrop-blur-xl shadow-green-500/20",
        profile_like: "border-red-400/50 bg-gradient-to-r from-red-950/90 to-red-900/80 backdrop-blur-xl shadow-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const NotificationToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof notificationVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(notificationVariants({ variant }), className)}
      {...props}
    />
  )
})
NotificationToast.displayName = "NotificationToast"

const NotificationAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
NotificationAction.displayName = "NotificationAction"

const NotificationClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1.5 text-foreground/50 opacity-0 transition-all hover:text-foreground hover:bg-background/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitives.Close>
))
NotificationClose.displayName = "NotificationClose"

const NotificationIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: "profile_view" | "message_received" | "profile_like"
    fromUserPhoto?: string
    fromUserName: string
  }
>(({ className, type, fromUserPhoto, fromUserName, ...props }, ref) => {
  const IconComponent = type === "profile_view" ? User : type === "message_received" ? MessageCircle : Heart
  
  // Generate initials from name for fallback
  const initials = fromUserName.split(' ').map(n => n[0]).join('').toUpperCase()
  
  console.log('NotificationIcon render:', { type, fromUserName, fromUserPhoto, initials });
  
  const getBgColor = () => {
    if (type === "profile_view") return "bg-gradient-to-br from-blue-500 to-blue-600"
    if (type === "message_received") return "bg-gradient-to-br from-green-500 to-green-600"
    return "bg-gradient-to-br from-red-500 to-red-600"
  }
  
  const getBorderColor = () => {
    if (type === "profile_view") return "border-blue-300 shadow-lg shadow-blue-500/30"
    if (type === "message_received") return "border-green-300 shadow-lg shadow-green-500/30"
    return "border-red-300 shadow-lg shadow-red-500/30"
  }
  
  return (
    <div
      ref={ref}
      className={cn("flex h-10 w-10 shrink-0", className)}
      {...props}
    >
      {fromUserPhoto ? (
        <Avatar className="h-10 w-10">
          <AvatarImage src={fromUserPhoto} alt={fromUserName} />
          <AvatarFallback className={cn(
            "text-white font-semibold",
            getBgColor()
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            getBgColor(),
            `border-2 ${getBorderColor()}`
          )}
        >
          <IconComponent 
            className="h-5 w-5 text-white" 
          />
        </div>
      )}
    </div>
  )
})
NotificationIcon.displayName = "NotificationIcon"

const NotificationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 space-y-1", className)}
    {...props}
  />
))
NotificationContent.displayName = "NotificationContent"

const NotificationTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base font-bold leading-none text-white tracking-wide", className)}
    {...props}
  />
))
NotificationTitle.displayName = "NotificationTitle"

const NotificationDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-200/90 mt-1.5", className)}
    {...props}
  />
))
NotificationDescription.displayName = "NotificationDescription"

type NotificationToastProps = React.ComponentPropsWithoutRef<typeof NotificationToast>

export {
  type NotificationToastProps,
  NotificationProvider,
  NotificationViewport,
  NotificationToast,
  NotificationAction,
  NotificationClose,
  NotificationIcon,
  NotificationContent,
  NotificationTitle,
  NotificationDescription,
}