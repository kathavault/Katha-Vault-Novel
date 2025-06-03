"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Send, UserCog, ImagePlus, MessageCircle, CircleUserRound, Palette, MoreVertical, Smile, Loader2, Trash2, Users, MessageSquareQuote, ListFilter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { chatWithKathaVaultAI, type KathaVaultAIChatInput } from '@/ai/flows/katha-vault-chat-flow';

const JOINED_DISCUSSIONS_STORAGE_KEY = 'joinedKathaVaultDiscussions';

// Placeholder data
const aiChatUser = {
  name: "Katha Vault AI",
  avatarFallback: "AI",
  avatarUrl: "https://placehold.co/40x40.png?text=AI",
  nickname: "Katha AI (Default)",
};

const placeholderUserChats = [
  { id: 'user1', name: 'Elara Reads', username: '@elara', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER', lastMessage: 'Hey, did you read that new chapter yet?', timestamp: '10:30 AM', unreadCount: 2, isOnline: true, dataAiHint: 'person reading' },
  { id: 'user2', name: 'Marcus Writes', username: '@marcus_w', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW', lastMessage: 'Sure, I can give you feedback on that.', timestamp: 'Yesterday', unreadCount: 0, isOnline: false, dataAiHint: 'person writing' },
  { id: 'user3', name: 'SciFiFanatic', username: '@scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SF', lastMessage: 'That plot twist was insane!', timestamp: 'Mon', unreadCount: 0, isOnline: true, dataAiHint: 'person space' },
];

const placeholderOnlineFriends = [
  { id: 'online1', name: 'Elara Reads', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'ER', dataAiHint: 'person reading' },
  { id: 'online2', name: 'Marcus Writes', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'MW', dataAiHint: 'person writing' },
  { id: 'online3', name: 'SciFiFanatic', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'SF', dataAiHint: 'person space' },
  { id: 'online4', name: 'Katha Explorer', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'KE', dataAiHint: 'person map' },
  { id: 'online5', name: 'PixelPioneer', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'PP', dataAiHint: 'person computer' },
  { id: 'online6', name: 'Reader Digest', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'RD', dataAiHint: 'person book' },
];

const EMOJIS = ['😊', '😂', '❤️', '👍', '🤔', '🎉', '📚', '✨', '✍️', '👀', '👋', '🙏'];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'discussion'; // Added 'discussion' sender type
  timestamp: string;
  userName?: string; // Optional for discussion messages
}

interface JoinedDiscussion {
  id: string; // Corresponds to postId
  name: string; // Group name or post title
  postId: string;
}

const OnlineFriendsBar = () => (
  <Card className="mb-6 flex-shrink-0">
    <CardHeader>
      <CardTitle className="text-lg font-headline text-primary">Online Now</CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-2">
          {placeholderOnlineFriends.map(friend => (
            <TooltipProvider key={friend.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative cursor-pointer flex flex-col items-center w-16">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint={friend.dataAiHint} />
                      <AvatarFallback>{friend.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="absolute top-0 right-2 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card ring-1 ring-green-500" />
                    <p className="text-xs mt-1 text-muted-foreground truncate w-full text-center">{friend.name.split(' ')[0]}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{friend.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </CardContent>
  </Card>
);

function ChatPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') === 'discussions' ? 'discussions' : 'direct';

  const [activeMainTab, setActiveMainTab] = useState<'direct' | 'discussions'>(initialSection);
  
  const [aiNickname, setAiNickname] = useState(aiChatUser.nickname);
  const [aiAvatar, setAiAvatar] = useState(aiChatUser.avatarUrl);
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Consolidated messages state. Context will determine if it's AI, user-to-user, or discussion.
  const [messages, setMessages] = useState<Message[]>([]); 
  
  const [selectedDirectChatUser, setSelectedDirectChatUser] = useState<typeof placeholderUserChats[0] | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [joinedDiscussions, setJoinedDiscussions] = useState<JoinedDiscussion[]>([]);
  const [selectedDiscussionGroup, setSelectedDiscussionGroup] = useState<JoinedDiscussion | null>(null);

  const aiAvatarInputRef = useRef<HTMLInputElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load joined discussions from localStorage
    try {
      const storedDiscussionsRaw = localStorage.getItem(JOINED_DISCUSSIONS_STORAGE_KEY);
      if (storedDiscussionsRaw) {
        setJoinedDiscussions(JSON.parse(storedDiscussionsRaw));
      }
    } catch (error) {
      console.error("Error loading joined discussions from localStorage:", error);
      toast({ title: "Error", description: "Could not load your joined discussions.", variant: "destructive"});
    }
  }, []);
  
  useEffect(() => {
    // Initial message based on context
    if (activeMainTab === 'direct' && !selectedDirectChatUser) { // AI chat
      setMessages([
          {
              id: 'initial-ai-' + Date.now(),
              text: 'Hello! How can I help you with your stories today? 😊',
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }
      ]);
    } else if (activeMainTab === 'direct' && selectedDirectChatUser) { // User-to-user chat
        setMessages([
            {
                id: 'initial-user-chat-' + Date.now(),
                text: `You are now chatting with ${selectedDirectChatUser.name}. Say hello!`,
                sender: 'ai', // System message style
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            }
        ]);
    } else if (activeMainTab === 'discussions' && selectedDiscussionGroup) { // Discussion group chat
        setMessages([
            {
                id: 'initial-discussion-' + Date.now(),
                text: `Welcome to the discussion: "${selectedDiscussionGroup.name}". Start chatting!`,
                sender: 'ai', // System message style
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            }
        ]);
    } else if (activeMainTab === 'discussions' && !selectedDiscussionGroup) {
        setMessages([]); // Clear messages if no discussion is selected
    }
  }, [activeMainTab, selectedDirectChatUser, selectedDiscussionGroup]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      const scrollViewport = chatScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    const userMessageText = currentMessage;
    
    const newMessage: Message = {
      id: 'msg-' + Date.now(),
      text: userMessageText,
      sender: 'user',
      userName: "You", // Or current user's name
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage("");

    if (activeMainTab === 'direct' && !selectedDirectChatUser) { // AI Chat
      setIsAiResponding(true);
      try {
        const input: KathaVaultAIChatInput = { userInput: userMessageText };
        const result = await chatWithKathaVaultAI(input);
        const aiResponse: Message = {
          id: 'ai-resp-' + Date.now(),
          text: result.aiResponse,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        };
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error("Error getting AI response:", error);
        const errorResponse: Message = {
          id: 'ai-err-' + Date.now(),
          text: "Sorry, I couldn't process that. Please try again. 😟",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        };
        setMessages(prev => [...prev, errorResponse]);
        toast({ title: "AI Error", description: "There was an issue connecting to the AI.", variant: "destructive" });
      } finally {
        setIsAiResponding(false);
      }
    } else if (activeMainTab === 'direct' && selectedDirectChatUser) { // User-to-User Chat
      const otherUserResponse: Message = {
        id: 'other-user-resp-' + Date.now(),
        text: `This is a simulated reply to: "${userMessageText}". Simulating as if I am ${selectedDirectChatUser.name}.`,
        sender: 'ai', // Simulating as other user
        userName: selectedDirectChatUser.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setTimeout(() => setMessages(prev => [...prev, otherUserResponse]), 500); // Simulate delay
    } else if (activeMainTab === 'discussions' && selectedDiscussionGroup) { // Discussion Group Chat
      // Simulate other users' replies in discussion, or just log the message
      const discussionReply: Message = {
        id: 'discussion-reply-' + Date.now(),
        text: `Someone in "${selectedDiscussionGroup.name}" might reply to: "${userMessageText}". (Simulated)`,
        sender: 'discussion', 
        userName: 'Another User',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setTimeout(() => setMessages(prev => [...prev, discussionReply]), 700); // Simulate delay
    }
  };
  
  const handleNicknameChange = () => {
    const newNick = prompt("Enter new nickname for AI:", aiNickname);
    if (newNick && newNick.trim() !== "") {
      setAiNickname(newNick.trim());
      toast({ title: "AI Nickname Updated", description: `Katha Vault AI will now be called "${newNick.trim()}" for you.` });
    } else if (newNick !== null) {
       toast({ title: "Invalid Nickname", description: "Nickname cannot be empty.", variant: "destructive" });
    }
  };

  const handleAvatarChangeClick = () => aiAvatarInputRef.current?.click();

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarUrl = reader.result as string;
        setAiAvatar(newAvatarUrl);
        toast({ title: "AI Avatar Updated", description: "New avatar applied locally." });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setCurrentMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({ title: "Message Deleted", description: "The message has been removed from your view." });
  };

  const handleClearChat = () => {
    if (activeMainTab === 'direct' && !selectedDirectChatUser) { // AI chat
        setMessages([{
            id: 'initial-ai-cleared-' + Date.now(),
            text: 'Hello! How can I help you with your stories today? 😊',
            sender: 'ai' as 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }]);
        toast({ title: "AI Chat Cleared", description: "Your conversation with the AI has been reset." });
    } else if (activeMainTab === 'direct' && selectedDirectChatUser) { // User chat
        setMessages([{
            id: 'cleared-user-chat-' + Date.now(),
            text: `Chat with ${selectedDirectChatUser.name} cleared.`,
            sender: 'ai', // System message
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }]);
        toast({ title: "Chat Cleared", description: "The conversation has been cleared." });
    } else if (activeMainTab === 'discussions' && selectedDiscussionGroup) { // Discussion
         setMessages([{
            id: 'cleared-discussion-' + Date.now(),
            text: `Discussion in "${selectedDiscussionGroup.name}" cleared.`,
            sender: 'ai', // System message
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }]);
        toast({ title: "Discussion Cleared", description: `The discussion in "${selectedDiscussionGroup.name}" has been cleared.` });
    }
  };
  
  const ChatPartnerDetails = () => {
    if (activeMainTab === 'direct' && !selectedDirectChatUser) {
      return { name: aiNickname, avatar: aiAvatar, fallback: aiChatUser.avatarFallback, isOnline: undefined, context: 'ai' as const };
    }
    if (activeMainTab === 'direct' && selectedDirectChatUser) {
      return { name: selectedDirectChatUser.name, avatar: selectedDirectChatUser.avatarUrl, fallback: selectedDirectChatUser.avatarFallback, isOnline: selectedDirectChatUser.isOnline, context: 'user' as const };
    }
    if (activeMainTab === 'discussions' && selectedDiscussionGroup) {
      return { name: selectedDiscussionGroup.name, avatar: "https://placehold.co/40x40.png?text=DG", fallback: "DG", isOnline: undefined, context: 'discussion' as const };
    }
    return { name: "Select a chat or discussion", avatar: "", fallback: "?", isOnline: undefined, context: 'none' as const };
  };
  const { name: chatPartnerName, avatar: chatPartnerAvatar, fallback: chatPartnerFallback, isOnline: chatPartnerIsOnline, context: chatContext } = ChatPartnerDetails();

  const CurrentChatInterface = () => (
    <Card className="flex flex-col h-full shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-x-3 border-b p-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={chatPartnerAvatar} alt={chatPartnerName} data-ai-hint={chatContext === 'ai' ? "robot ai" : chatContext === 'user' ? "person avatar" : "group discussion"} />
            <AvatarFallback>{chatPartnerFallback}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-headline">{chatPartnerName}</CardTitle>
            {chatContext === 'user' && chatPartnerIsOnline && <CardDescription className="text-xs text-green-500">Online</CardDescription>}
            {chatContext === 'discussion' && <CardDescription className="text-xs text-blue-500">Discussion Group</CardDescription>}
          </div>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={chatContext === 'none'}>
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {chatContext === 'user' ? (
                <>
                  <DropdownMenuItem onSelect={() => toast({ title: "View Profile", description: "This feature is coming soon!"})}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast({ title: "Block User", description: "This feature is coming soon!"})}>Block User</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleClearChat}>Clear Chat</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast({ title: "Report User", description: "This feature is coming soon!"})}>Report User</DropdownMenuItem>
                </>
              ) : chatContext === 'ai' ? (
                 <>
                  <DropdownMenuItem onSelect={handleNicknameChange}>Change AI Nickname</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleAvatarChangeClick}>Change AI Avatar</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleClearChat}>Clear Chat History</DropdownMenuItem>
                </>
              ) : chatContext === 'discussion' ? (
                <>
                  <DropdownMenuItem onSelect={() => toast({title: "Discussion Info", description: "Feature coming soon!"})}>View Discussion Info</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleClearChat}>Clear Discussion History</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setJoinedDiscussions(prev => prev.filter(d => d.id !== selectedDiscussionGroup?.id));
                    localStorage.setItem(JOINED_DISCUSSIONS_STORAGE_KEY, JSON.stringify(joinedDiscussions.filter(d => d.id !== selectedDiscussionGroup?.id)));
                    setSelectedDiscussionGroup(null);
                    setMessages([]);
                    toast({title: "Left Discussion", description: `You have left "${selectedDiscussionGroup?.name}".`});
                  }}>Leave Discussion</DropdownMenuItem>
                </>
              ) : null }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden" ref={chatScrollAreaRef}>
        <ScrollArea className="h-full p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg shadow relative ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {msg.sender !== 'user' && msg.userName && chatContext === 'discussion' && <p className="text-xs font-semibold mb-1 text-primary">{msg.userName}</p>}
                <p className="text-sm font-body whitespace-pre-wrap">{msg.text}</p>
                {msg.timestamp && <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp}</p>}
                {msg.sender === 'user' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleDeleteMessage(msg.id)}
                        className="text-red-500 hover:!text-red-500 focus:!text-red-500 focus:!bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
           {isAiResponding && chatContext === 'ai' && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <div className="border-t p-4 flex items-center space-x-2 bg-background flex-shrink-0">
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isAiResponding || chatContext === 'none'}>
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-6 gap-1">
              {EMOJIS.map(emoji => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-xl"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          placeholder={chatContext === 'none' ? "Select a chat or discussion" : "Type a message..."}
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isAiResponding && chatContext !== 'none' && handleSendMessage()}
          className="flex-grow font-body"
          disabled={isAiResponding || chatContext === 'none'}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isAiResponding || chatContext === 'none' || !currentMessage.trim()}>
          {isAiResponding && chatContext === 'ai' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </Card>
  );

  const DirectChatsSidebar = () => (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4 flex-shrink-0">
        <CardTitle className="font-headline text-xl">Direct Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div
            className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${chatContext === 'ai' ? 'bg-muted' : ''}`}
            onClick={() => { setSelectedDirectChatUser(null); setSelectedDiscussionGroup(null); setCurrentMessage(''); setActiveMainTab('direct'); }}
          >
            <Avatar>
              <AvatarImage src={aiAvatar} alt={aiChatUser.name} data-ai-hint="robot ai" />
              <AvatarFallback>{aiChatUser.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
              <p className="font-semibold text-sm text-foreground">{aiNickname}</p>
              <p className="text-xs text-muted-foreground truncate">AI Assistant for stories...</p>
            </div>
          </div>
          {placeholderUserChats.map(chat => (
            <div key={chat.id}
              className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${selectedDirectChatUser?.id === chat.id ? 'bg-muted': ''}`}
              onClick={() => { setSelectedDirectChatUser(chat); setSelectedDiscussionGroup(null); setCurrentMessage(''); setActiveMainTab('direct');}}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={chat.avatarUrl} alt={chat.name} data-ai-hint="person chat"/>
                  <AvatarFallback>{chat.avatarFallback}</AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-500" />
                )}
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold text-sm text-foreground truncate">{chat.name}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end text-xs text-muted-foreground">
                <span>{chat.timestamp}</span>
                {chat.unreadCount > 0 && (
                  <span className="mt-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">{chat.unreadCount}</span>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
        <input type="file" accept="image/*" ref={aiAvatarInputRef} onChange={handleAvatarFileChange} className="hidden" />
      </CardContent>
    </Card>
  );

  const JoinedDiscussionsSidebar = () => (
     <Card className="flex flex-col h-full">
        <CardHeader className="p-4 flex-shrink-0">
            <CardTitle className="font-headline text-xl">Joined Discussions</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                {joinedDiscussions.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">You haven't joined any discussions yet. Join one from a post!</p>
                )}
                {joinedDiscussions.map(discussion => (
                    <div key={discussion.id}
                        className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${selectedDiscussionGroup?.id === discussion.id ? 'bg-muted' : ''}`}
                        onClick={() => { setSelectedDiscussionGroup(discussion); setSelectedDirectChatUser(null); setCurrentMessage(''); setActiveMainTab('discussions');}}
                    >
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png?text=DG" alt={discussion.name} data-ai-hint="group discussion icon" />
                            <AvatarFallback>{discussion.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold text-sm text-foreground truncate">{discussion.name}</p>
                            <p className="text-xs text-muted-foreground truncate">Post ID: {discussion.postId}</p>
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </CardContent>
    </Card>
  );


  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="text-center space-y-2 flex-shrink-0">
        <MessageCircle className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">KathaConnect</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Engage in direct messages and group discussions.
        </p>
      </header>
      
      <Tabs value={activeMainTab} onValueChange={(value) => setActiveMainTab(value as 'direct' | 'discussions')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="direct"><CircleUserRound className="mr-2 h-5 w-5" />Direct Chats</TabsTrigger>
          <TabsTrigger value="discussions"><MessageSquareQuote className="mr-2 h-5 w-5" />Joined Discussions</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeMainTab === 'direct' && <OnlineFriendsBar />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-grow min-h-0">
        <div className="md:col-span-1 flex flex-col h-full">
          {activeMainTab === 'direct' ? <DirectChatsSidebar /> : <JoinedDiscussionsSidebar />}
        </div>

        <div className="md:col-span-3 h-full">
          <CurrentChatInterface />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading Chat...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}