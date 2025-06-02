
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bot, Send, UserCog, ImagePlus, MessageCircle, CircleUserRound, Palette, MoreVertical } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Placeholder data
const aiChatUser = {
  name: "Katha Vault AI",
  avatarFallback: "AI",
  avatarUrl: "https://placehold.co/40x40.png?text=AI",
  nickname: "Katha AI (Default)",
};

const placeholderUserChats = [
  { id: 'user1', name: 'Elara Reads', username: '@elara', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER', lastMessage: 'Hey, did you read that new chapter yet?', timestamp: '10:30 AM', unreadCount: 2, isOnline: true },
  { id: 'user2', name: 'Marcus Writes', username: '@marcus_w', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW', lastMessage: 'Sure, I can give you feedback on that.', timestamp: 'Yesterday', unreadCount: 0, isOnline: false },
  { id: 'user3', name: 'SciFiFanatic', username: '@scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SF', lastMessage: 'That plot twist was insane!', timestamp: 'Mon', unreadCount: 0, isOnline: true },
];

const placeholderOnlineFriends = [
  { id: 'online1', name: 'Elara Reads', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'ER', dataAiHint: 'person reading' },
  { id: 'online2', name: 'Marcus Writes', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'MW', dataAiHint: 'person writing' },
  { id: 'online3', name: 'SciFiFanatic', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'SF', dataAiHint: 'person space' },
  { id: 'online4', name: 'Katha Explorer', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'KE', dataAiHint: 'person map' },
  { id: 'online5', name: 'PixelPioneer', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'PP', dataAiHint: 'person computer' },
  { id: 'online6', name: 'Reader Digest', avatarUrl: 'https://placehold.co/48x48.png', avatarFallback: 'RD', dataAiHint: 'person book' },
];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
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


export default function ChatPage() {
  const { toast } = useToast();
  const [aiNickname, setAiNickname] = useState(aiChatUser.nickname);
  const [aiAvatar, setAiAvatar] = useState(aiChatUser.avatarUrl);
  const [currentMessage, setCurrentMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<typeof placeholderUserChats[0] | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);

  const aiAvatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Client-side effect to set initial message, avoiding hydration mismatch for timestamp
    const initialTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setAiMessages([
      {
        id: 'initial-ai-message-' + Date.now(),
        text: 'Hello! How can I help you with your stories today?',
        sender: 'ai',
        timestamp: initialTimestamp
      }
    ]);
  }, []);

  const handleSendAiMessage = () => {
    if (!currentMessage.trim()) return;
    const newMessage: Message = {
      id: 'user-msg-' + Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    const aiResponse: Message = {
      id: 'ai-resp-' + Date.now(),
      text: `I've received: "${currentMessage}". As an AI, I'm still learning! How can I assist you further?`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setAiMessages(prev => [...prev, newMessage, aiResponse]);
    setCurrentMessage("");
  };

  const handleSendUserMessage = () => {
    if (!currentMessage.trim() || !selectedChatUser) return;
     const newMessage: Message = {
      id: 'user-chat-msg-' + Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    const otherUserResponse: Message = {
      id: 'other-user-resp-' + Date.now(),
      text: `This is a simulated reply to: "${currentMessage}".`,
      sender: 'ai', // Simulating reply from the other user
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setUserMessages(prev => [...prev, newMessage, otherUserResponse]);
    setCurrentMessage("");
  }

  const handleNicknameChange = () => {
    const newNick = prompt("Enter new nickname for AI:", aiNickname);
    if (newNick) {
      setAiNickname(newNick);
      toast({ title: "AI Nickname Updated", description: `Katha Vault AI will now be called "${newNick}" for you.` });
    }
  };

  const handleAvatarChangeClick = () => {
    aiAvatarInputRef.current?.click();
  };

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

  const CurrentChatInterface = ({
    chatPartnerName,
    chatPartnerAvatar,
    chatPartnerFallback,
    messages,
    onSendMessage,
    isUserChat,
  }: {
    chatPartnerName: string;
    chatPartnerAvatar: string;
    chatPartnerFallback: string;
    messages: Message[];
    onSendMessage: () => void;
    isUserChat: boolean;
  }) => (
    <Card className="flex flex-col h-full shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-x-3 border-b p-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={chatPartnerAvatar} alt={chatPartnerName} data-ai-hint={isUserChat ? "person avatar" : "robot ai"} />
            <AvatarFallback>{chatPartnerFallback}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-headline">{chatPartnerName}</CardTitle>
            {selectedChatUser?.isOnline && isUserChat && <CardDescription className="text-xs text-green-500">Online</CardDescription>}
          </div>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isUserChat ? (
                <>
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Block User</DropdownMenuItem>
                  <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                  <DropdownMenuItem>Report User</DropdownMenuItem>
                </>
              ) : (
                 <>
                  <DropdownMenuItem onClick={handleNicknameChange}>Change AI Nickname</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAvatarChangeClick}>Change AI Avatar</DropdownMenuItem>
                  <DropdownMenuItem>Clear Chat History</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg shadow ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                <p className="text-sm font-body">{msg.text}</p>
                {msg.timestamp && <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp}</p>}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <div className="border-t p-4 flex items-center space-x-2 bg-background flex-shrink-0">
        <Input
          type="text"
          placeholder="Type a message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          className="flex-grow font-body"
        />
        <Button onClick={onSendMessage} size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );


  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="text-center space-y-2 flex-shrink-0">
        <MessageCircle className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Direct Messages</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Connect and chat with the community and our AI.
        </p>
      </header>

      <OnlineFriendsBar />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-grow min-h-0">
        <Card className="md:col-span-1 flex flex-col h-full">
          <CardHeader className="p-4 flex-shrink-0">
            <CardTitle className="font-headline text-xl">My Chats</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <div
                className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${!selectedChatUser ? 'bg-muted' : ''}`}
                onClick={() => {setSelectedChatUser(null); setUserMessages([]); setCurrentMessage(''); }}
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
                  className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer border-b ${selectedChatUser?.id === chat.id ? 'bg-muted': ''}`}
                  onClick={() => { setSelectedChatUser(chat); setUserMessages([]); setCurrentMessage(''); }}
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

        <div className="md:col-span-3 h-full">
          {!selectedChatUser ? (
            <CurrentChatInterface
              chatPartnerName={aiNickname}
              chatPartnerAvatar={aiAvatar}
              chatPartnerFallback={aiChatUser.avatarFallback}
              messages={aiMessages}
              onSendMessage={handleSendAiMessage}
              isUserChat={false}
            />
          ) : (
            <CurrentChatInterface
              chatPartnerName={selectedChatUser.name}
              chatPartnerAvatar={selectedChatUser.avatarUrl}
              chatPartnerFallback={selectedChatUser.avatarFallback}
              messages={userMessages}
              onSendMessage={handleSendUserMessage}
              isUserChat={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

    