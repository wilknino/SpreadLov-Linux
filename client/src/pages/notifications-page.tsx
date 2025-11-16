import { useState, useEffect } from "react"
import { Bell, Eye, Trash2, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useLocation } from "wouter"
import type { Notification } from "@shared/schema"

type NotificationWithUser = Notification & {
  fromUser: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

async function fetchNotifications(): Promise<NotificationWithUser[]> {
  const response = await fetch('/api/notifications', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

async function markNotificationAsRead(id: string) {
  const response = await fetch(`/api/notifications/mark-read/${id}`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
}

async function markAllNotificationsAsRead() {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to mark all notifications as read');
}

async function deleteNotification(id: string) {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete notification');
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()
  
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    const handleNotificationUpdate = () => {
      // Force immediate refetch instead of just invalidating
      queryClient.refetchQueries({ queryKey: ['notifications'] })
      queryClient.refetchQueries({ queryKey: ['/api/notifications/unread-count'] })
    }

    window.addEventListener('notificationReceived', handleNotificationUpdate)
    window.addEventListener('notificationRead', handleNotificationUpdate)
    
    return () => {
      window.removeEventListener('notificationReceived', handleNotificationUpdate)
      window.removeEventListener('notificationRead', handleNotificationUpdate)
    }
  }, [queryClient])

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] })
    },
  })

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }
  
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }
  
  const deleteNotificationHandler = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }
  
  const clearAll = () => {
    notifications.forEach(notification => {
      deleteNotificationMutation.mutate(notification.id)
    })
  }
  
  const handleNotificationClick = (notification: NotificationWithUser) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'profile_view':
        // Navigate to user profile
        setLocation(`/profile/${notification.fromUserId}`)
        break
      case 'message_received':
        // Navigate to chat with user
        setLocation(`/chat/${notification.fromUserId}`)
        break
      case 'profile_like':
        // Navigate to user profile
        setLocation(`/profile/${notification.fromUserId}`)
        break
      default:
        break
    }
  }
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  const getNotificationDescription = (notification: NotificationWithUser) => {
    switch (notification.type) {
      case 'profile_view':
        return `${notification.fromUser.firstName} viewed your profile.`
      case 'message_received':
        return `${notification.fromUser.firstName} sent you a message.`
      case 'profile_like':
        return `${notification.fromUser.firstName} liked your profile.`
      default:
        return 'New notification'
    }
  }

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'profile_view':
        return 'Profile View'
      case 'message_received':
        return 'New Message'
      case 'profile_like':
        return 'Profile Like'
      default:
        return 'Notification'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Notifications
              </h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <Bell className="h-16 w-16 text-muted-foreground/50 mb-4 mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Notifications
              </h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <Bell className="h-16 w-16 text-muted-foreground/50 mb-4 mx-auto" />
            <p className="text-red-500 font-medium">Failed to load notifications</p>
            <p className="text-muted-foreground text-sm mt-1">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="rounded-full hover:bg-primary/10 hover:border-primary transition-all duration-200"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAll}
                  className="rounded-full hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clear all</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto py-4 sm:py-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">No notifications</h2>
              <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    !notification.isRead 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-card/50 border-border/50 hover:bg-card/80"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator badge */}
                  {!notification.isRead && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
                  )}

                  <div className="p-3 sm:p-4">
                    <div className="flex gap-3 items-start">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-background shadow-sm">
                          <AvatarImage src={notification.fromUser.profilePhoto || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {notification.fromUser.firstName[0]}{notification.fromUser.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1 pr-16 sm:pr-20 mb-1">
                          {getNotificationTitle(notification.type)}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {getNotificationDescription(notification)}
                        </p>
                      </div>

                      {/* Timestamp - Right side below action buttons */}
                      <div className="absolute top-9 sm:top-10 right-3">
                        <span className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
                          {formatTimeAgo(new Date(notification.createdAt!))}
                        </span>
                      </div>

                      {/* Action Buttons - Right Side Icon Buttons */}
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
                            title="Mark as read"
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotificationHandler(notification.id)
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
