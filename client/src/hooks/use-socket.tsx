import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./use-auth";
import { Message, User } from "@shared/schema";
import { useNotification, showProfileViewNotification, showMessageNotification, showProfileLikeNotification } from "./use-notification";

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (receiverId: string, content?: string, imageUrl?: string) => void;
  sendTyping: (receiverId: string, isTyping: boolean) => void;
  openChatWindow: (otherUserId: string) => void;
  closeChatWindow: (otherUserId: string) => void;
  onlineUsers: User[];
  typingUsers: Record<string, boolean>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { showNotification } = useNotification();

  const connect = () => {
    if (!user || socket?.readyState === WebSocket.CONNECTING) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setIsConnected(true);
      setSocket(newSocket);
      
      // Authentication now happens automatically on connection via session cookie
      // No need to send auth message - user identity is verified server-side
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'newMessage':
            // Handle new message - parent component should listen for this
            console.log('Received newMessage:', data);
            window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
            break;
            
          case 'messageConfirmed':
            // Handle message confirmation
            console.log('Received messageConfirmed:', data);
            window.dispatchEvent(new CustomEvent('messageConfirmed', { detail: data }));
            break;
            
          case 'userTyping':
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: data.isTyping,
            }));
            
            // Clear typing indicator after 3 seconds
            if (data.isTyping) {
              setTimeout(() => {
                setTypingUsers(prev => ({
                  ...prev,
                  [data.userId]: false,
                }));
              }, 3000);
            }
            break;
            
          case 'userOnline':
          case 'userOffline':
            // Update online users list and pass userId information
            console.log(`[WebSocket] User ${data.userId} is now ${data.type === 'userOnline' ? 'ONLINE' : 'OFFLINE'}`);
            window.dispatchEvent(new CustomEvent('onlineStatusChanged', { 
              detail: { 
                userId: data.userId, 
                isOnline: data.type === 'userOnline' 
              } 
            }));
            break;
            
          case 'newNotification':
            // Handle real-time notifications
            const { notification } = data;
            console.log('Received notification:', notification);
            
            if (notification.type === 'profile_view') {
              showProfileViewNotification(
                notification.fromUserName,
                notification.fromUserPhoto,
                notification.fromUserId,
                notification.id
              );
            } else if (notification.type === 'message_received') {
              showMessageNotification(
                notification.fromUserName,
                notification.fromUserPhoto,
                notification.fromUserId,
                notification.id
              );
            } else if (notification.type === 'profile_like') {
              showProfileLikeNotification(
                notification.fromUserName,
                notification.fromUserPhoto,
                notification.fromUserId,
                notification.id
              );
            }
            
            // Invalidate notification count query to update navbar counter
            window.dispatchEvent(new CustomEvent('notificationReceived'));
            break;
            
          case 'consentRequest':
            // Handle consent request from another user
            console.log('Received consent request:', data);
            window.dispatchEvent(new CustomEvent('consentRequest', { detail: data }));
            break;
            
          case 'consentPending':
            // Handle pending consent status
            console.log('Received consent pending:', data);
            window.dispatchEvent(new CustomEvent('consentPending', { detail: data }));
            break;
            
          case 'consentAccepted':
            // Handle consent accepted
            console.log('Received consent accepted:', data);
            window.dispatchEvent(new CustomEvent('consentAccepted', { detail: data }));
            break;
            
          case 'consentRejected':
            // Handle consent rejected
            console.log('Received consent rejected:', data);
            window.dispatchEvent(new CustomEvent('consentRejected', { detail: data }));
            break;
            
          case 'messageNotificationsRead':
            // Handle message notifications marked as read when chat is opened
            console.log('Message notifications marked as read from user:', data.fromUserId);
            window.dispatchEvent(new CustomEvent('messageRead'));
            break;
            
          case 'messageCountUpdate':
            // Handle real-time message counter updates
            console.log('Message count update:', data.action);
            if (data.action === 'increment') {
              window.dispatchEvent(new CustomEvent('messageReceived'));
            }
            break;
            
          case 'notificationCountUpdate':
            // Handle real-time notification counter updates
            console.log('Notification count update:', data.action);
            if (data.action === 'increment') {
              window.dispatchEvent(new CustomEvent('notificationReceived'));
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newSocket.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      
      // Attempt to reconnect after 3 seconds
      if (user) {
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    if (user && !socket) {
      connect();
    } else if (!user && socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [user]);

  const sendMessage = (receiverId: string, content?: string, imageUrl?: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'sendMessage',
        receiverId,
        content,
        imageUrl,
      }));
    }
  };

  const sendTyping = (receiverId: string, isTyping: boolean) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        receiverId,
        isTyping,
      }));
    }
  };

  const openChatWindow = (otherUserId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'openChatWindow',
        otherUserId,
      }));
    }
  };

  const closeChatWindow = (otherUserId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'closeChatWindow',
        otherUserId,
      }));
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      sendMessage,
      sendTyping,
      openChatWindow,
      closeChatWindow,
      onlineUsers,
      typingUsers,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
