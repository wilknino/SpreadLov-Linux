import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, Send, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { User, Conversation, Message } from "@shared/schema";

interface ConversationWithDetails extends Conversation {
  otherUser: User;
  lastMessage?: Message;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Listen for real-time WebSocket events
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      // Refresh conversations when new message arrives
      fetchConversations();
    };

    const handleOnlineStatusChanged = () => {
      // Refresh conversations to update online status
      fetchConversations();
    };

    window.addEventListener('newMessage', handleNewMessage as EventListener);
    window.addEventListener('onlineStatusChanged', handleOnlineStatusChanged as EventListener);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
      window.removeEventListener('onlineStatusChanged', handleOnlineStatusChanged as EventListener);
    };
  }, []);

  if (!user) return null;

  const ConversationCard = ({ conversation }: { conversation: ConversationWithDetails }) => {
    // Check if there's an unread message
    const hasUnread = conversation.lastMessage && 
                     conversation.lastMessage.senderId !== user.id && 
                     !conversation.lastMessage.isRead;

    return (
      <Link href={`/chat/${conversation.otherUser.id}`} className="block">
        <div 
          className={`group relative rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
            hasUnread 
              ? "bg-primary/5 border-primary/20" 
              : "bg-card/50 border-border/50 hover:bg-card/80"
          }`}
        >
          {/* Unread indicator badge */}
          {hasUnread && (
            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
          )}

          <div className="p-3 sm:p-4">
            <div className="flex gap-3 items-start">
              {/* Avatar with online status */}
              <div className="flex-shrink-0 relative">
                <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-background shadow-sm">
                  <AvatarImage src={conversation.otherUser.profilePhoto || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {conversation.otherUser.firstName[0]}{conversation.otherUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {conversation.otherUser.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1 flex-1">
                    {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                  </h3>
                </div>
                {conversation.lastMessage ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    {conversation.lastMessage.senderId === user.id ? (
                      <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    ) : (
                      <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    )}
                    <p className="line-clamp-1 flex-1">
                      {conversation.lastMessage.imageUrl ? (
                        <span className="italic">📷 Photo</span>
                      ) : (
                        conversation.lastMessage.content
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">No messages yet</p>
                )}
              </div>

              {/* Timestamp - Right side below unread indicator */}
              {conversation.lastMessage && (
                <div className="absolute top-9 sm:top-10 right-3">
                  <span className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.lastMessage.timestamp!), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    );
  }

  // Filter conversations for tabs
  const allConversations = conversations;
  const unreadConversations = conversations.filter(conv => 
    conv.lastMessage && 
    conv.lastMessage.senderId !== user.id && 
    !conv.lastMessage.isRead
  );
  const sentConversations = conversations.filter(conv => 
    conv.lastMessage && conv.lastMessage.senderId === user.id
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{conversations.length} conversations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Content with Tabs */}
      <div className="flex-1 overflow-hidden pb-20">
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto h-full">
            <Tabs defaultValue="all" className="h-full flex flex-col pt-4 sm:pt-6">
              <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
                <TabsTrigger value="all" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">All </span>({allConversations.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Unread </span>({unreadConversations.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Sent </span>({sentConversations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-4">
                    {allConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                          <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-2">No conversations yet</h2>
                        <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
                          Start discovering people and begin chatting!
                        </p>
                      </div>
                    ) : (
                      allConversations.map((conversation) => (
                        <ConversationCard key={conversation.id} conversation={conversation} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="unread" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-4">
                    {unreadConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                          <CheckCheck className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-2">All caught up!</h2>
                        <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
                          No unread messages
                        </p>
                      </div>
                    ) : (
                      unreadConversations.map((conversation) => (
                        <ConversationCard key={conversation.id} conversation={conversation} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="sent" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-4">
                    {sentConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                          <Send className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-2">No sent messages</h2>
                        <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
                          Start a conversation!
                        </p>
                      </div>
                    ) : (
                      sentConversations.map((conversation) => (
                        <ConversationCard key={conversation.id} conversation={conversation} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
