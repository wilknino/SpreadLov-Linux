import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { User, Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/chat/emoji-picker";
import { PhotoViewer } from "@/components/ui/photo-viewer";

interface ChatContentProps {
  chatUser: User;
}

function ChatContent({ chatUser }: ChatContentProps) {
  const { user: currentUser } = useAuth();
  const { sendMessage, sendTyping, typingUsers, isConnected, openChatWindow, closeChatWindow } = useSocket();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [consentStatus, setConsentStatus] = useState<string | null>(null);
  const [consentRequest, setConsentRequest] = useState<any>(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  console.log('[ChatPage] ChatContent render - consentStatus:', consentStatus, 'chatUser:', chatUser?.id);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", chatUser.id, "messages"],
    enabled: !!chatUser.id,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (chatUser.id) {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", chatUser.id, "messages"] 
      });
      
      openChatWindow(chatUser.id);
    }
    
    return () => {
      if (chatUser.id) {
        closeChatWindow(chatUser.id);
      }
    };
  }, [chatUser.id, queryClient, openChatWindow, closeChatWindow]);

  // Fetch consent status when chat loads
  useEffect(() => {
    const fetchConsentStatus = async () => {
      if (!chatUser?.id) {
        console.log('[ChatPage] Consent fetch skipped: chatUser is null/undefined');
        return;
      }
      
      console.log(`[ChatPage] ===== FETCHING CONSENT STATUS for user ${chatUser.id} (${chatUser.firstName}) =====`);
      try {
        const response = await fetch(`/api/consent/${chatUser.id}`, {
          credentials: 'include',
        });
        console.log(`[ChatPage] Consent API response status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[ChatPage] Fetched consent status:', JSON.stringify(data, null, 2));
          
          if (data.status === 'pending' && data.consent && data.requester) {
            console.log('[ChatPage] ✅ Setting consent request from API (we are responder)');
            setConsentStatus('pending');
            setConsentRequest({
              consent: data.consent,
              requester: data.requester
            });
          } else if (data.status === 'waiting') {
            console.log('[ChatPage] ⏳ We are waiting for consent');
            setConsentStatus('waiting');
            setConsentRequest(null);
          } else {
            console.log('[ChatPage] Other status:', data.status || 'null');
            setConsentStatus(data.status || null);
            setConsentRequest(null);
          }
        } else {
          console.error('[ChatPage] ❌ Consent API failed with status:', response.status);
        }
      } catch (error) {
        console.error('[ChatPage] ❌ Failed to fetch consent status:', error);
      }
    };

    console.log('[ChatPage] useEffect triggered for consent fetch, chatUser:', chatUser?.id);
    fetchConsentStatus();
  }, [chatUser?.id]);

  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { message } = event.detail;
      
      const isRelevantMessage = (
        (message.senderId === chatUser.id && message.receiverId === currentUser?.id) ||
        (message.senderId === currentUser?.id && message.receiverId === chatUser.id)
      );
      
      if (isRelevantMessage) {
        queryClient.setQueryData(
          ["/api/conversations", chatUser.id, "messages"],
          (oldMessages: Message[] = []) => {
            const messageExists = oldMessages.some(m => m.id === message.id);
            if (messageExists) return oldMessages;
            
            return [...oldMessages, message];
          }
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    };

    const handleMessageConfirmed = (event: CustomEvent) => {
      const { message } = event.detail;
      
      const isRelevantMessage = (
        (message.senderId === chatUser.id && message.receiverId === currentUser?.id) ||
        (message.senderId === currentUser?.id && message.receiverId === chatUser.id)
      );
      
      if (isRelevantMessage) {
        queryClient.setQueryData(
          ["/api/conversations", chatUser.id, "messages"],
          (oldMessages: Message[] = []) => {
            const messageExists = oldMessages.some(m => m.id === message.id);
            if (messageExists) return oldMessages;
            
            return [...oldMessages, message];
          }
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    };

    window.addEventListener('newMessage', handleNewMessage as EventListener);
    window.addEventListener('messageConfirmed', handleMessageConfirmed as EventListener);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
      window.removeEventListener('messageConfirmed', handleMessageConfirmed as EventListener);
    };
  }, [chatUser.id, currentUser?.id, queryClient]);

  // Listen for consent WebSocket events
  useEffect(() => {
    const handleConsentRequest = (event: CustomEvent) => {
      const { consent, requester } = event.detail;
      console.log('[ChatPage] 📨 Received consent request event');
      console.log('[ChatPage] Requester:', requester?.firstName, requester?.id);
      console.log('[ChatPage] Chat User:', chatUser?.firstName, chatUser?.id);
      
      if (chatUser && requester && requester.id === chatUser.id) {
        console.log('[ChatPage] ✅ Setting consent request for current chat - MATCH!');
        setConsentRequest({ consent, requester });
        setConsentStatus('pending');
      } else {
        console.log('[ChatPage] ❌ Consent request NOT for current chat');
      }
    };

    const handleConsentPending = (event: CustomEvent) => {
      const { receiverId } = event.detail;
      console.log('[ChatPage] Received consent pending event:', { receiverId, chatUserId: chatUser?.id });
      
      if (chatUser && receiverId === chatUser.id) {
        console.log('[ChatPage] Setting consent status to waiting (we sent request)');
        setConsentStatus('waiting');
        setConsentRequest(null);
      }
    };

    const handleConsentAccepted = (event: CustomEvent) => {
      const { responderId } = event.detail;
      if (chatUser && responderId === chatUser.id) {
        console.log('[ChatPage] Consent accepted!');
        setConsentStatus('accepted');
        setConsentRequest(null);
        toast({
          title: "Request accepted!",
          description: `${chatUser.firstName} accepted your chat request.`,
        });
      }
    };

    const handleConsentRejected = (event: CustomEvent) => {
      const { responderId } = event.detail;
      if (chatUser && responderId === chatUser.id) {
        console.log('[ChatPage] Consent rejected');
        setConsentStatus('rejected');
        setConsentRequest(null);
      }
    };

    window.addEventListener('consentRequest', handleConsentRequest as EventListener);
    window.addEventListener('consentPending', handleConsentPending as EventListener);
    window.addEventListener('consentAccepted', handleConsentAccepted as EventListener);
    window.addEventListener('consentRejected', handleConsentRejected as EventListener);

    return () => {
      window.removeEventListener('consentRequest', handleConsentRequest as EventListener);
      window.removeEventListener('consentPending', handleConsentPending as EventListener);
      window.removeEventListener('consentAccepted', handleConsentAccepted as EventListener);
      window.removeEventListener('consentRejected', handleConsentRejected as EventListener);
    };
  }, [chatUser?.id, chatUser?.firstName, toast]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !isConnected) return;

    sendMessage(chatUser.id, messageText.trim());
    setMessageText("");
    
    if (isTyping) {
      sendTyping(chatUser.id, false);
      setIsTyping(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (!isConnected) return;

    if (!isTyping && text.trim()) {
      sendTyping(chatUser.id, true);
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        sendTyping(chatUser.id, false);
        setIsTyping(false);
      }
    }, 2000);
  };

  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('messageImage', file);
      const res = await fetch('/api/upload/message', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    onSuccess: (data) => {
      sendMessage(chatUser.id, undefined, data.imageUrl);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      imageUploadMutation.mutate(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const acceptConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/consent/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consentId: consentRequest?.consent?.id,
          requesterId: consentRequest?.requester?.id 
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to accept consent');
      return res.json();
    },
    onSuccess: () => {
      console.log('[ChatPage] Consent accepted successfully');
      setConsentStatus('accepted');
      setConsentRequest(null);
      toast({
        title: "Request accepted!",
        description: `You can now chat with ${chatUser.firstName}.`,
      });
    },
    onError: (error) => {
      console.error('[ChatPage] Failed to accept consent:', error);
      toast({
        title: "Failed to accept",
        description: "Could not accept the chat request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectConsentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/consent/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consentId: consentRequest?.consent?.id,
          requesterId: consentRequest?.requester?.id 
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to reject consent');
      return res.json();
    },
    onSuccess: () => {
      console.log('[ChatPage] Consent rejected successfully');
      setConsentStatus('rejected');
      setConsentRequest(null);
      toast({
        title: "Request declined",
        description: `You declined the chat request from ${chatUser.firstName}.`,
      });
    },
    onError: (error) => {
      console.error('[ChatPage] Failed to reject consent:', error);
      toast({
        title: "Failed to decline",
        description: "Could not decline the chat request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = formatDate(message.timestamp!);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-8" ref={scrollAreaRef}>
        <div className="w-full max-w-full lg:max-w-6xl mx-auto space-y-2 pb-8">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex items-center justify-center my-8">
                <div className="bg-card/90 backdrop-blur-md border border-border/50 shadow-md text-muted-foreground px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {date}
                </div>
              </div>

              <div className="space-y-4">
                {dateMessages.map((message, index) => {
                  const isOwn = message.senderId === currentUser?.id;
                  const showAvatar = !isOwn && (
                    index === dateMessages.length - 1 || 
                    dateMessages[index + 1]?.senderId !== message.senderId
                  );

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-end gap-2 sm:gap-2.5 max-w-[85%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
                        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {!isOwn && (
                        <div className="flex-shrink-0 mb-1">
                          {showAvatar ? (
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-background shadow-md ring-1 ring-primary/10">
                              <AvatarImage src={chatUser.profilePhoto || ""} />
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/30">
                                {chatUser.firstName[0]}{chatUser.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 sm:h-9 sm:w-9" />
                          )}
                        </div>
                      )}

                      <div className={cn(
                        "flex flex-col gap-1.5 min-w-0",
                        isOwn ? "items-end" : "items-start"
                      )}>
                        <div
                          className={cn(
                            "group relative rounded-2xl px-4 py-3 break-words shadow-md transition-all duration-200 hover:shadow-lg",
                            isOwn 
                              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md" 
                              : "bg-card text-card-foreground border border-border/60 rounded-bl-md backdrop-blur-sm"
                          )}
                        >
                          {message.imageUrl ? (
                            <div className="space-y-2">
                              <div 
                                className="relative overflow-hidden rounded-xl group/image cursor-pointer"
                                onClick={() => {
                                  setSelectedPhotoUrl(message.imageUrl!);
                                  setPhotoViewerOpen(true);
                                }}
                              >
                                <div className="relative">
                                  <img 
                                    src={message.imageUrl} 
                                    alt="Shared image"
                                    loading="lazy"
                                    className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] h-auto max-h-[200px] sm:max-h-[240px] md:max-h-[280px] object-cover rounded-lg transition-all duration-300 group-hover/image:brightness-90"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center">
                                    <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                                      <ImageIcon className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {message.content && (
                                <p className="text-sm leading-relaxed mt-2">{message.content}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        <span className={cn(
                          "text-xs text-muted-foreground/70 px-1 font-medium",
                          isOwn ? "text-right" : "text-left"
                        )}>
                          {formatTime(message.timestamp!)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {typingUsers[chatUser.id] && (
            <div className="flex items-end gap-2 sm:gap-2.5 max-w-[75%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 mb-1 border-2 border-background shadow-md ring-1 ring-primary/10">
                <AvatarImage src={chatUser.profilePhoto || ""} />
                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/30">
                  {chatUser.firstName[0]}{chatUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-6 py-3.5 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-duration:1s]"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-duration:1s]" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-duration:1s]" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Consent Request UI - Show when user needs to respond */}
      {consentStatus === 'pending' && consentRequest && (
        <div className="border-t border-border/40 bg-card/60 dark:bg-card/40 backdrop-blur-lg p-4 sm:p-5 md:p-6 shadow-lg flex-shrink-0 animate-in slide-in-from-bottom-5 duration-500">
          <div className="w-full max-w-full lg:max-w-6xl mx-auto">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full xs:w-auto">
                <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                  <span className="text-xl sm:text-2xl">💬</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base md:text-lg text-foreground leading-snug">
                    {consentRequest.requester?.firstName} wants to chat
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-normal">
                    Do you want to accept this request?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full xs:w-auto flex-shrink-0">
                <Button
                  onClick={() => rejectConsentMutation.mutate()}
                  disabled={rejectConsentMutation.isPending || acceptConsentMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="flex-1 xs:flex-none xs:min-w-[100px] sm:min-w-[110px] rounded-lg text-xs sm:text-sm font-medium h-9 sm:h-10 px-4 sm:px-5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all duration-200"
                >
                  {rejectConsentMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                  )}
                  Decline
                </Button>
                <Button
                  onClick={() => acceptConsentMutation.mutate()}
                  disabled={acceptConsentMutation.isPending || rejectConsentMutation.isPending}
                  size="sm"
                  className="flex-1 xs:flex-none xs:min-w-[100px] sm:min-w-[110px] rounded-lg text-xs sm:text-sm font-medium h-9 sm:h-10 px-4 sm:px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {acceptConsentMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                  )}
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiting for Consent UI - Show when user sent request and waiting */}
      {consentStatus === 'waiting' && (
        <div className="border-t border-border/40 bg-card/60 dark:bg-card/40 backdrop-blur-lg p-4 sm:p-5 md:p-6 shadow-lg flex-shrink-0 animate-in slide-in-from-bottom-5 duration-500">
          <div className="w-full max-w-full lg:max-w-6xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center border border-amber-500/20 dark:border-amber-500/30">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-amber-600 dark:text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base md:text-lg text-foreground font-semibold leading-snug">
                  Waiting for {chatUser.firstName} to accept...
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-normal">
                  You can send messages once they respond
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border/30 bg-background p-3 sm:p-4 md:p-5 flex-shrink-0">
        <div className="w-full max-w-full lg:max-w-6xl mx-auto">
          <div className="relative group">
            <div className="relative flex items-center bg-muted/40 dark:bg-muted/20 rounded-xl transition-all duration-200">
              <textarea
                value={messageText}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  consentStatus === 'waiting' 
                    ? "Waiting for chat permission..." 
                    : consentStatus === 'pending' 
                    ? "Please respond to the chat request above..." 
                    : consentStatus === 'rejected'
                    ? "Chat request was declined"
                    : "Type a message"
                }
                className="flex-1 min-h-[40px] max-h-32 resize-none py-2.5 px-4 sm:px-5 bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-0 rounded-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60"
                disabled={!isConnected || consentStatus === 'waiting' || consentStatus === 'pending' || consentStatus === 'rejected'}
              />
              
              <div className="flex items-center gap-1 sm:gap-1.5 pr-2 sm:pr-2.5 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={!isConnected || consentStatus === 'waiting' || consentStatus === 'pending' || consentStatus === 'rejected'}
                  title="Add emoji"
                >
                  <Smile className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-muted-foreground" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isConnected || imageUploadMutation.isPending}
                  title="Attach image"
                >
                  {imageUploadMutation.isPending ? (
                    <Loader2 className="h-[18px] w-[18px] sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Paperclip className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-muted-foreground" />
                  )}
                </Button>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !isConnected || consentStatus === 'waiting' || consentStatus === 'pending' || consentStatus === 'rejected'}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-40"
                  title="Send message"
                >
                  <Send className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </div>
            </div>
            
            {/* Blue underline on focus - only at bottom */}
            <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>
          
          {showEmojiPicker && (
            <div className="mt-2">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          {!isConnected && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground/70 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Connecting to chat...</span>
            </div>
          )}
        </div>
      </div>

      <PhotoViewer
        imageUrl={selectedPhotoUrl}
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
      />
    </div>
  );
}

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatUser = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setChatUser(userData);
        } else {
          console.error("Failed to fetch chat user");
        }
      } catch (error) {
        console.error("Error fetching chat user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatUser();
  }, [userId]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <h3 className="text-lg font-semibold">User not found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">This user could not be loaded. They may have been removed or the link is incorrect.</p>
          <Button onClick={() => setLocation("/discover")} className="mt-4 rounded-full shadow-md hover:shadow-lg transition-all">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-background via-background to-muted/30 pb-16">
      <div className="border-b bg-card/95 backdrop-blur-md shadow-md flex-shrink-0">
        <div className="w-full max-w-full px-3 py-3 sm:px-4 sm:py-3.5 lg:max-w-6xl lg:mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation(`/profile/${chatUser.id}`)}>
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-background shadow-md">
                  <AvatarImage src={chatUser.profilePhoto || ""} />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/30">
                    {chatUser.firstName[0]}{chatUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {chatUser.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full ring-2 ring-background animate-pulse"></div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base truncate leading-tight">
                  {chatUser.firstName} {chatUser.lastName}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {chatUser.isOnline ? (
                    <span className="text-green-600 dark:text-green-500 font-medium">Online</span>
                  ) : (
                    <span>{chatUser.age} · {chatUser.location || 'Location not set'}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-colors">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-colors">
              <Video className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-colors">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <ChatContent chatUser={chatUser} />
      </div>
    </div>
  );
}
