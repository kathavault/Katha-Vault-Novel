
"use client";

import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Send, UserCog, ImagePlus, MessageCircle, CircleUserRound, Palette, MoreVertical, Smile, Loader2, Trash2, Users, MessageSquareQuote, ListFilter, ExternalLink, LogIn, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { chatWithKathaVaultAI, type KathaVaultAIChatInput } from '@/ai/flows/katha-vault-chat-flow';
import Link from 'next/link';
import { allMockUsers, isUserLoggedIn, getKathaExplorerUser, type MockUser, KRITIKA_USER_ID, KATHAVAULT_OWNER_USER_ID, isUserActive } from '@/lib/mock-data';

const JOINED_DISCUSSIONS_STORAGE_KEY = 'joinedKathaVaultDiscussions';

const aiChatUser = {
  id: 'ai_assistant',
  name: "Katha Vault AI",
  avatarFallback: "AI",
  avatarUrl: "https://placehold.co/40x40.png?text=AI",
  username: "katha_ai",
  nickname: "Katha AI (Default)",
  email: "ai@kathavault.com"
};

const EMOJIS = ['😊', '😂', '❤️', '👍', '🤔', '🎉', '📚', '✨', '✍️', '👀', '👋', '🙏'];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'discussion';
  timestamp: string;
  userName?: string;
  userId?: string;
  userAvatarUrl?: string;
  userAvatarFallback?: string;
}

interface JoinedDiscussion {
  id: string;
  name: string;
  postId: string;
}

interface OnlineFriend {
  id: string;
  name: string;
  avatarUrl: string;
  avatarFallback: string;
  dataAiHint: string;
  email?: string;
}

const OnlineFriendsBar: React.FC<{ onlineFriends: OnlineFriend[] }> = ({ onlineFriends }) => {
 return (
  <Card className="mb-6 flex-shrink-0">
    <CardHeader>
      <CardTitle className="text-lg font-headline text-primary">Online Now</CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-2">
          {onlineFriends.map(friend => (
            <TooltipProvider key={friend.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/profile/${friend.id}`} className="relative cursor-pointer flex flex-col items-center w-16">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint={friend.dataAiHint} />
                      <AvatarFallback>{friend.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="absolute top-0 right-2 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card ring-1 ring-green-500" />
                    <p className="text-xs mt-1 text-muted-foreground truncate w-full text-center flex items-center justify-center">
                      {friend.name.split(' ')[0]}
                      {(friend.id === KRITIKA_USER_ID || friend.id === KATHAVAULT_OWNER_USER_ID) && (
                          <CheckCircle className="ml-1 h-3 w-3 text-blue-500 flex-shrink-0" title="Verified Admin" />
                      )}
                    </p>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center">
                    {friend.name}
                    {(friend.id === KRITIKA_USER_ID || friend.id === KATHAVAULT_OWNER_USER_ID) && (
                        <CheckCircle className="ml-1 h-3.5 w-3.5 text-blue-500 flex-shrink-0" title="Verified Admin" />
                    )}
                  </p>
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
};

interface CurrentChatInterfaceProps {
  chatPartnerDetails: {
    id: string;
    name: string;
    avatar: string;
    fallback: string;
    isOnline?: boolean;
    context: 'ai' | 'user' | 'discussion' | 'none';
    email?: string;
  };
  messages: Message[];
  isAiResponding: boolean;
  aiAvatar: string;
  aiAvatarFallback: string;
  aiNickname: string;
  currentUser: MockUser | null;
  currentMessage: string;
  setCurrentMessage: (value: string) => void;
  isEmojiPickerOpen: boolean;
  setIsEmojiPickerOpen: (value: boolean) => void;
  handleNicknameChange: () => void;
  handleAvatarChangeClick: () => void;
  handleClearChat: () => void;
  handleSendMessage: () => void;
  handleDeleteMessage: (messageId: string) => void;
  authStatus: 'loading' | 'loggedIn' | 'loggedOut';
  joinedDiscussions: JoinedDiscussion[];
  setJoinedDiscussions: (value: JoinedDiscussion[]) => void;
  setSelectedDiscussionGroup: (value: JoinedDiscussion | null) => void;
  setMessages: (value: Message[] | ((prev: Message[]) => Message[])) => void;
  currentUserIsActive: boolean;
}

const CurrentChatInterface: React.FC<CurrentChatInterfaceProps> = ({
  chatPartnerDetails,
  messages,
  isAiResponding,
  aiAvatar,
  aiAvatarFallback,
  aiNickname,
  currentUser,
  currentMessage,
  setCurrentMessage,
  isEmojiPickerOpen,
  setIsEmojiPickerOpen,
  handleNicknameChange,
  handleAvatarChangeClick,
  handleClearChat,
  handleSendMessage,
  handleDeleteMessage,
  authStatus,
  joinedDiscussions,
  setJoinedDiscussions,
  setSelectedDiscussionGroup,
  setMessages,
  currentUserIsActive,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { id: chatPartnerId, name: chatPartnerName, avatar: chatPartnerAvatar, fallback: chatPartnerFallback, isOnline: chatPartnerIsOnline, context: chatContext } = chatPartnerDetails;
  const isChatPartnerSpecialAdmin = chatPartnerId === KRITIKA_USER_ID || chatPartnerId === KATHAVAULT_OWNER_USER_ID;
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      const scrollViewport = chatScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);
  
  const canInteract = authStatus === 'loggedIn' && currentUserIsActive;

  return (
    <Card className="flex flex-col h-full shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-x-3 border-b p-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={chatPartnerAvatar} alt={chatPartnerName} data-ai-hint={chatContext === 'ai' ? "robot ai" : chatContext === 'user' ? "person avatar" : "group discussion"} />
            <AvatarFallback>{chatPartnerFallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
                {chatContext === 'user' ? (
                    <Link href={`/profile/${chatPartnerId}`} className="hover:underline">
                        <CardTitle className="text-lg font-headline">{chatPartnerName}</CardTitle>
                    </Link>
                ) : (
                    <CardTitle className="text-lg font-headline">{chatPartnerName}</CardTitle>
                )}
                {isChatPartnerSpecialAdmin && chatContext === 'user' && (
                    <CheckCircle className="ml-1.5 h-4 w-4 text-blue-500 flex-shrink-0" title="Verified Admin" />
                )}
            </div>
            {chatContext === 'user' && chatPartnerIsOnline && <CardDescription className="text-xs text-green-500">Online</CardDescription>}
            {chatContext === 'discussion' && <CardDescription className="text-xs text-blue-500">Discussion Group</CardDescription>}
          </div>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={chatContext === 'none' || !canInteract}>
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {chatContext === 'user' ? (
                <>
                  <DropdownMenuItem onSelect={() => router.push(`/profile/${chatPartnerId}`)}> <ExternalLink className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
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
                  <DropdownMenuItem onSelect={() => toast({title: "Discussion Info", description: `Post ID: ${chatPartnerId.replace('discussion-', '')}. Feature coming soon!`})}>View Discussion Info</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleClearChat}>Clear Discussion History</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    if (!canInteract || chatContext !== 'discussion') return;
                    const currentSelectedDiscussion = joinedDiscussions.find(d => d.id === chatPartnerId);
                    if (!currentSelectedDiscussion) return;

                    const newJoinedDiscussions = joinedDiscussions.filter(d => d.id !== chatPartnerId);
                    setJoinedDiscussions(newJoinedDiscussions);
                    if (typeof window !== 'undefined') localStorage.setItem(JOINED_DISCUSSIONS_STORAGE_KEY, JSON.stringify(newJoinedDiscussions));
                    
                    setSelectedDiscussionGroup(null);
                    setMessages([]);
                    toast({title: "Left Discussion", description: `You have left "${currentSelectedDiscussion.name}".`});
                  }}>Leave Discussion</DropdownMenuItem>
                </>
              ) : null }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden" ref={chatScrollAreaRef}>
        <ScrollArea className="h-full p-4 space-y-4">
          {messages.map((msg) => {
            const isMsgSenderSpecialAdmin = msg.sender !== 'ai' && (msg.userId === KRITIKA_USER_ID || msg.userId === KATHAVAULT_OWNER_USER_ID);
            return (
            <div key={msg.id} className={`flex group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== 'user' && (msg.sender === 'ai' || msg.sender === 'discussion') && (
                <Link href={msg.userId && msg.sender !== 'ai' ? `/profile/${msg.userId}` : '#'} className="flex-shrink-0 mr-2 mt-1 self-start">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender === 'ai' ? aiAvatar : msg.userAvatarUrl} alt={msg.userName || aiNickname} data-ai-hint="person avatar" />
                        <AvatarFallback>{msg.sender === 'ai' ? aiAvatarFallback : msg.userAvatarFallback}</AvatarFallback>
                    </Avatar>
                </Link>
              )}
              <div className={`max-w-[70%] p-3 rounded-lg shadow relative ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {msg.sender !== 'user' && msg.userName && (
                  <div className="flex items-center mb-1">
                    <Link href={msg.userId && msg.sender !== 'ai' ? `/profile/${msg.userId}`: '#'} className="hover:underline">
                        <p className="text-xs font-semibold text-primary">{msg.userName}</p>
                    </Link>
                    {isMsgSenderSpecialAdmin && (
                        <CheckCircle className="ml-1 h-3 w-3 text-blue-500 flex-shrink-0" title="Verified Admin" />
                    )}
                  </div>
                )}
                <p className="text-sm font-body whitespace-pre-wrap">{msg.text}</p>
                {msg.timestamp && <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp}</p>}
                {msg.sender === 'user' && canInteract && (
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
              {msg.sender === 'user' && currentUser && (
                 <Avatar className="h-8 w-8 ml-2 mt-1 self-start flex-shrink-0">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                </Avatar>
              )}
            </div>
            );
        })}
           {isAiResponding && chatContext === 'ai' && (
            <div className="flex justify-start">
               <Avatar className="h-8 w-8 mr-2 mt-1 self-start flex-shrink-0">
                  <AvatarImage src={aiAvatar} alt={aiNickname} data-ai-hint="robot ai" />
                  <AvatarFallback>{aiAvatarFallback}</AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <div className="border-t p-2 sm:p-4 flex items-center space-x-1 sm:space-x-2 bg-background flex-shrink-0">
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isAiResponding || chatContext === 'none' || !canInteract}>
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
                  onClick={() => {
                     if (!canInteract) return;
                     setCurrentMessage(currentMessage + emoji);
                     setIsEmojiPickerOpen(false);
                  }}
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
          placeholder={!canInteract ? "Login to chat or your account is inactive." : (chatContext === 'none' ? "Select a chat or discussion" : "Type a message...")}
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isAiResponding && chatContext !== 'none' && canInteract && handleSendMessage()}
          className="flex-grow font-body h-10"
          disabled={isAiResponding || chatContext === 'none' || !canInteract}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isAiResponding || chatContext === 'none' || !canInteract || !currentMessage.trim()}>
          {isAiResponding && chatContext === 'ai' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </Card>
  );
}


function ChatPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') === 'discussions' ? 'discussions' : 'direct';
  const userIdToOpen = searchParams.get('userId');
  const discussionIdToOpen = searchParams.get('discussionId');

  const [authStatus, setAuthStatus] = useState<'loading' | 'loggedIn' | 'loggedOut'>('loading');
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [currentUserIsActive, setCurrentUserIsActive] = useState(false);

  const [activeMainTab, setActiveMainTab] = useState<'direct' | 'discussions'>(initialSection);

  const [aiNickname, setAiNickname] = useState(aiChatUser.nickname);
  const [aiAvatar, setAiAvatar] = useState(aiChatUser.avatarUrl);
  const [currentMessage, setCurrentMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [selectedDirectChatUser, setSelectedDirectChatUser] = useState<any | null>(null); // Type will be derived
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [joinedDiscussions, setJoinedDiscussions] = useState<JoinedDiscussion[]>([]);
  const [selectedDiscussionGroup, setSelectedDiscussionGroup] = useState<JoinedDiscussion | null>(null);
  
  const aiAvatarInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const userIsLoggedIn = isUserLoggedIn();
    if (userIsLoggedIn) {
      const user = getKathaExplorerUser();
      setCurrentUser(user);
      setCurrentUserIsActive(isUserActive(user.id));
      setAuthStatus('loggedIn');
    } else {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/chat';
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      setAuthStatus('loggedOut');
    }
  }, [router]);

  const derivedInitialPlaceholderUserChats = useMemo(() => {
    if (!currentUser) return [];
    return allMockUsers
      .filter(user => user.id !== currentUser.id && user.id !== aiChatUser.id)
      .map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl || 'https://placehold.co/40x40.png',
        avatarFallback: user.avatarFallback || user.name.substring(0,2).toUpperCase(),
        lastMessage: `Chat with ${user.name}`,
        timestamp: '10:30 AM', // Placeholder
        unreadCount: 0,
        isOnline: false, // Placeholder
        dataAiHint: user.dataAiHint || 'person chat',
        email: user.email,
      }));
  }, [currentUser]);

  const derivedPlaceholderOnlineFriends = useMemo(() => {
    if (!currentUser) return [];
    return allMockUsers
      .filter(user => user.id !== currentUser.id)
      .slice(0, 6)
      .map(user => ({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl || 'https://placehold.co/48x48.png',
        avatarFallback: user.avatarFallback || user.name.substring(0,2).toUpperCase(),
        dataAiHint: user.dataAiHint || 'person active',
        email: user.email,
    }));
  }, [currentUser]);


  const [displayedUserChats, setDisplayedUserChats] = useState<ReturnType<typeof derivedInitialPlaceholderUserChats>>([]);

  useEffect(() => {
    if (authStatus !== 'loggedIn' || !currentUser) return;

    setDisplayedUserChats(
      derivedInitialPlaceholderUserChats.map(chat => ({
        ...chat,
        unreadCount: (chat.id === 'user_er' || chat.id === 'user_mw') ? Math.floor(Math.random() * 3) + 1 : 0,
        isOnline: Math.random() > 0.5,
      }))
    );
  }, [authStatus, currentUser, derivedInitialPlaceholderUserChats]);

  useEffect(() => {
    if (authStatus !== 'loggedIn') return;
    try {
      const storedDiscussionsRaw = localStorage.getItem(JOINED_DISCUSSIONS_STORAGE_KEY);
      if (storedDiscussionsRaw) {
        const parsedDiscussions: JoinedDiscussion[] = JSON.parse(storedDiscussionsRaw);
        setJoinedDiscussions(parsedDiscussions);
        if (discussionIdToOpen && parsedDiscussions.some(d => d.id === discussionIdToOpen)) {
            const discussionToSelect = parsedDiscussions.find(d => d.id === discussionIdToOpen) || null;
            setSelectedDiscussionGroup(discussionToSelect);
            setActiveMainTab('discussions');
        }
      }
    } catch (error) {
      console.error("Error loading joined discussions from localStorage:", error);
      toast({ title: "Error", description: "Could not load your joined discussions.", variant: "destructive"});
    }
  }, [discussionIdToOpen, toast, authStatus]);

  useEffect(() => {
    if (authStatus !== 'loggedIn' || !currentUser) return;

    if (userIdToOpen) {
      const userToChat = derivedInitialPlaceholderUserChats.find(u => u.id === userIdToOpen);

      if (userToChat) {
        setSelectedDirectChatUser(userToChat);
        setActiveMainTab('direct');
        setMessages([
            {
                id: 'initial-user-chat-' + Date.now(),
                text: `You are now chatting with ${userToChat.name}. Say hello!`,
                sender: 'ai', // System message, styled like AI
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            }
        ]);
        setDisplayedUserChats(prevChats =>
            prevChats.map(chat =>
                chat.id === userIdToOpen ? { ...chat, unreadCount: 0 } : chat
            )
        );
      } else if (userIdToOpen === aiChatUser.id) {
         setSelectedDirectChatUser(null); // Select AI chat
         setActiveMainTab('direct');
      }
    }
  }, [userIdToOpen, authStatus, currentUser, router, derivedInitialPlaceholderUserChats]); 

  useEffect(() => {
    if (authStatus !== 'loggedIn') return;
    if (activeMainTab === 'direct' && !selectedDirectChatUser && !userIdToOpen && !selectedDiscussionGroup && !discussionIdToOpen) {
      // Default to AI chat if no specific user/discussion is selected via URL params
      setMessages([
          {
              id: 'initial-ai-' + Date.now(),
              text: 'Hello! How can I help you with your stories today? 😊',
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }
      ]);
    } else if (activeMainTab === 'direct' && selectedDirectChatUser && !userIdToOpen) {
        // When a user chat is selected from the sidebar (not via URL param)
       setMessages([
           {
               id: 'initial-user-chat-from-selection-' + Date.now(),
               text: `You are now chatting with ${selectedDirectChatUser.name}. Say hello!`,
               sender: 'ai', // System message
               timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
           }
       ]);
    } else if (activeMainTab === 'discussions' && selectedDiscussionGroup && !discussionIdToOpen) {
         // When a discussion is selected from the sidebar
        setMessages([
            {
                id: 'initial-discussion-' + Date.now(),
                text: `Welcome to the discussion: "${selectedDiscussionGroup.name}". Start chatting!`,
                sender: 'ai', // System message
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            }
        ]);
    } else if (activeMainTab === 'discussions' && !selectedDiscussionGroup && !discussionIdToOpen) {
        // When 'Discussions' tab is active but no specific discussion selected
        setMessages([]); 
    }
  }, [activeMainTab, selectedDirectChatUser, selectedDiscussionGroup, authStatus, userIdToOpen, discussionIdToOpen]);


  const handleSendMessage = async () => {
    if (authStatus !== 'loggedIn' || !currentUser || !currentUserIsActive) {
      toast({ title: "Action Denied", description: "Please login or ensure your account is active to send messages.", variant: "destructive"});
      return;
    }
    if (!currentMessage.trim()) return;
    const userMessageText = currentMessage;

    const newMessage: Message = {
      id: 'msg-' + Date.now(),
      text: userMessageText,
      sender: 'user',
      userName: currentUser.name,
      userId: currentUser.id,
      userAvatarUrl: currentUser.avatarUrl,
      userAvatarFallback: currentUser.avatarFallback,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage("");

    if (activeMainTab === 'direct' && !selectedDirectChatUser) { // AI Chat
      setIsAiResponding(true);
      try {
        const input: KathaVaultAIChatInput = { userInput: userMessageText };
        const result = await chatWithKathaVaultAI(input);
        let aiResponseText = "Katha AI had a thought but couldn't quite phrase it. Try again? 🤔";
        if (result && result.aiResponse && result.aiResponse.trim() !== "") {
            aiResponseText = result.aiResponse;
        }
        
        const aiResponse: Message = {
          id: 'ai-resp-' + Date.now(),
          text: aiResponseText,
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
    } else if (activeMainTab === 'direct' && selectedDirectChatUser) { // Direct User Chat (Simulated)
      const otherUserResponse: Message = {
        id: 'other-user-resp-' + Date.now(),
        text: `This is a simulated reply to: "${userMessageText}". Simulating as if I am ${selectedDirectChatUser.name}.`,
        sender: 'ai', // Simulate as AI for styling, but with user's details
        userName: selectedDirectChatUser.name,
        userId: selectedDirectChatUser.id,
        userAvatarUrl: selectedDirectChatUser.avatarUrl,
        userAvatarFallback: selectedDirectChatUser.avatarFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setTimeout(() => setMessages(prev => [...prev, otherUserResponse]), 500);
    } else if (activeMainTab === 'discussions' && selectedDiscussionGroup && currentUser) { // Discussion Group Chat (Simulated)
        const randomUser = allMockUsers.find(u => u.id !== currentUser.id && (u.id === KRITIKA_USER_ID || u.id === KATHAVAULT_OWNER_USER_ID || Math.random() > 0.5 )) || allMockUsers[1];
      const discussionReply: Message = {
        id: 'discussion-reply-' + Date.now(),
        text: `Someone in "${selectedDiscussionGroup.name}" might reply to: "${userMessageText}". (Simulated)`,
        sender: 'discussion',
        userName: randomUser.name,
        userId: randomUser.id,
        userAvatarUrl: randomUser.avatarUrl,
        userAvatarFallback: randomUser.avatarFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setTimeout(() => setMessages(prev => [...prev, discussionReply]), 700);
    }
  };

  const handleNicknameChange = () => {
    if (authStatus !== 'loggedIn' || !currentUserIsActive) {
        toast({title: "Action Denied", description: "Login or ensure your account is active.", variant: "destructive"});
        return;
    }
    const newNick = prompt("Enter new nickname for AI:", aiNickname);
    if (newNick && newNick.trim() !== "") {
      setAiNickname(newNick.trim());
      toast({ title: "AI Nickname Updated", description: `Katha Vault AI will now be called "${newNick.trim()}" for you.` });
    } else if (newNick !== null) { // User didn't cancel but entered empty string
       toast({ title: "Invalid Nickname", description: "Nickname cannot be empty.", variant: "destructive" });
    }
  };

  const handleAvatarChangeClick = () => {
    if (authStatus !== 'loggedIn' || !currentUserIsActive) {
         toast({title: "Action Denied", description: "Login or ensure your account is active.", variant: "destructive"});
        return;
    }
    aiAvatarInputRef.current?.click()
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (authStatus !== 'loggedIn' || !currentUserIsActive) return;
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

  const handleDeleteMessage = (messageId: string) => {
    if (authStatus !== 'loggedIn' || !currentUserIsActive) return;
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({ title: "Message Deleted", description: "The message has been removed from your view." });
  };

  const handleClearChat = () => {
    if (authStatus !== 'loggedIn' || !currentUserIsActive) {
        toast({title: "Action Denied", description: "Login or ensure your account is active.", variant: "destructive"});
        return;
    }
    if (activeMainTab === 'direct' && !selectedDirectChatUser) { // AI Chat
        setMessages([{
            id: 'initial-ai-cleared-' + Date.now(),
            text: 'Hello! How can I help you with your stories today? 😊',
            sender: 'ai' as 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }]);
        toast({ title: "AI Chat Cleared", description: "Your conversation with the AI has been reset." });
    } else if (activeMainTab === 'direct' && selectedDirectChatUser) { // User Chat
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
      return { id: aiChatUser.id, name: aiNickname, avatar: aiAvatar, fallback: aiChatUser.avatarFallback, isOnline: undefined, context: 'ai' as const, email: aiChatUser.email };
    }
    if (activeMainTab === 'direct' && selectedDirectChatUser) {
      return { id: selectedDirectChatUser.id, name: selectedDirectChatUser.name, avatar: selectedDirectChatUser.avatarUrl, fallback: selectedDirectChatUser.avatarFallback, isOnline: selectedDirectChatUser.isOnline, context: 'user' as const, email: selectedDirectChatUser.email };
    }
    if (activeMainTab === 'discussions' && selectedDiscussionGroup) {
      return { id: selectedDiscussionGroup.id, name: selectedDiscussionGroup.name, avatar: "https://placehold.co/40x40.png?text=DG", fallback: selectedDiscussionGroup.name.substring(0,2).toUpperCase(), isOnline: undefined, context: 'discussion' as const, email: undefined };
    }
    return { id: '', name: "Select a chat or discussion", avatar: "", fallback: "?", isOnline: undefined, context: 'none' as const, email: undefined };
  };
  
  const currentChatPartnerDetails = ChatPartnerDetails();

  const handleDirectChatSelection = (chatUser: ReturnType<typeof derivedInitialPlaceholderUserChats>[0]) => {
    setSelectedDirectChatUser(chatUser);
    setSelectedDiscussionGroup(null);
    setCurrentMessage('');
    setActiveMainTab('direct');
    // Update URL without forcing full reload, but allowing history
    router.push(`/chat?section=direct&userId=${chatUser.id}`, { scroll: false });
    setDisplayedUserChats(prevChats => prevChats.map(chat =>
        chat.id === chatUser.id ? { ...chat, unreadCount: 0 } : chat
    ));
  };

  const handleAiChatSelection = () => {
    setSelectedDirectChatUser(null);
    setSelectedDiscussionGroup(null);
    setCurrentMessage('');
    setActiveMainTab('direct');
    router.push('/chat?section=direct', { scroll: false });
  };

  const handleDiscussionSelection = (discussion: JoinedDiscussion) => {
    setSelectedDiscussionGroup(discussion);
    setSelectedDirectChatUser(null);
    setCurrentMessage('');
    setActiveMainTab('discussions');
    router.push(`/chat?section=discussions&discussionId=${discussion.id}`, { scroll: false });
  };


  const DirectChatsSidebar = () => (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4 flex-shrink-0">
        <CardTitle className="font-headline text-xl">Direct Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div
            className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${currentChatPartnerDetails.context === 'ai' && !selectedDirectChatUser ? 'bg-muted' : ''}`}
            onClick={handleAiChatSelection}
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
          {displayedUserChats.map(chat => {
            const isSpecialAdminChat = chat.id === KRITIKA_USER_ID || chat.id === KATHAVAULT_OWNER_USER_ID;
            return (
            <div key={chat.id}
              className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${selectedDirectChatUser?.id === chat.id ? 'bg-muted': ''}`}
              onClick={() => handleDirectChatSelection(chat)}
            >
              <Link href={`/profile/${chat.id}`} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Avatar>
                  <AvatarImage src={chat.avatarUrl} alt={chat.name} data-ai-hint="person chat"/>
                  <AvatarFallback>{chat.avatarFallback}</AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-500" />
                )}
              </Link>
              <div className="flex-grow overflow-hidden">
                <Link href={`/profile/${chat.id}`} className="hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
                  <p className="font-semibold text-sm text-foreground truncate">{chat.name}</p>
                  {isSpecialAdminChat && (
                    <CheckCircle className="ml-1 h-3.5 w-3.5 text-blue-500 flex-shrink-0" title="Verified Admin" />
                  )}
                </Link>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end text-xs text-muted-foreground">
                <span>{chat.timestamp}</span>
                {chat.unreadCount > 0 && (
                  <span className="mt-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">{chat.unreadCount}</span>
                )}
              </div>
            </div>
            );
        })}
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
                        onClick={() => handleDiscussionSelection(discussion)}
                    >
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png?text=DG" alt={discussion.name} data-ai-hint="group discussion icon" />
                            <AvatarFallback>{discussion.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold text-sm text-foreground truncate">{discussion.name}</p>
                            <p className="text-xs text-muted-foreground truncate">Related to Post ID: {discussion.postId.substring(0,10)}...</p>
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </CardContent>
    </Card>
  );

  if (authStatus === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Verifying authentication...</div>;
  }

  if (authStatus === 'loggedOut') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  if (authStatus === 'loggedIn' && !currentUser) {
     return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading user data...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="text-center space-y-2 flex-shrink-0">
        <MessageCircle className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-primary" />
        <h1 className="text-4xl sm:text-5xl font-headline tracking-tight text-primary">KathaConnect</h1>
        <p className="text-lg sm:text-xl text-foreground font-body font-semibold">
          Engage in direct messages and group discussions.
        </p>
      </header>

      <Tabs value={activeMainTab} onValueChange={(value) => {
        const newTab = value as 'direct' | 'discussions';
        setActiveMainTab(newTab);
        if (newTab === 'direct') {
            if (!selectedDirectChatUser) handleAiChatSelection();
            else handleDirectChatSelection(selectedDirectChatUser); 
        } else if (newTab === 'discussions') {
            if (selectedDiscussionGroup) handleDiscussionSelection(selectedDiscussionGroup);
            else {
                setSelectedDiscussionGroup(null);
                setSelectedDirectChatUser(null);
                 router.push('/chat?section=discussions', { scroll: false });
                 setMessages([]); 
            }
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="direct"><CircleUserRound className="mr-2 h-5 w-5" />Direct Chats</TabsTrigger>
          <TabsTrigger value="discussions"><MessageSquareQuote className="mr-2 h-5 w-5" />Joined Discussions</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeMainTab === 'direct' && <OnlineFriendsBar onlineFriends={derivedPlaceholderOnlineFriends} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-grow min-h-0">
        <div className="md:col-span-1 flex flex-col h-full min-h-[300px] md:min-h-0">
          {activeMainTab === 'direct' ? <DirectChatsSidebar /> : <JoinedDiscussionsSidebar />}
        </div>

        <div className="md:col-span-3 h-full min-h-[500px] md:min-h-0">
          <CurrentChatInterface
            chatPartnerDetails={currentChatPartnerDetails}
            messages={messages}
            isAiResponding={isAiResponding}
            aiAvatar={aiAvatar}
            aiAvatarFallback={aiChatUser.avatarFallback}
            aiNickname={aiNickname}
            currentUser={currentUser}
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            isEmojiPickerOpen={isEmojiPickerOpen}
            setIsEmojiPickerOpen={setIsEmojiPickerOpen}
            handleNicknameChange={handleNicknameChange}
            handleAvatarChangeClick={handleAvatarChangeClick}
            handleClearChat={handleClearChat}
            handleSendMessage={handleSendMessage}
            handleDeleteMessage={handleDeleteMessage}
            authStatus={authStatus}
            joinedDiscussions={joinedDiscussions}
            setJoinedDiscussions={setJoinedDiscussions}
            setSelectedDiscussionGroup={setSelectedDiscussionGroup}
            setMessages={setMessages}
            currentUserIsActive={currentUserIsActive}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading Chat...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}
