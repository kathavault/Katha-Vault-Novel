
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bot, Send, UserCog, ImagePlus, MessageCircle, CircleUserRound, Palette } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Placeholder data
const aiChatUser = {
  name: "Katha Vault AI",
  avatarFallback: "AI",
  avatarUrl: "https://placehold.co/40x40.png?text=AI", // Placeholder AI avatar
  nickname: "Katha AI (Default)", // Default nickname
};

const placeholderUserChats = [
  { id: 'user1', name: 'Elara Reads', username: '@elara', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER', lastMessage: 'Hey, did you read that new chapter yet?', timestamp: '10:30 AM', unreadCount: 2, isOnline: true },
  { id: 'user2', name: 'Marcus Writes', username: '@marcus_w', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW', lastMessage: 'Sure, I can give you feedback on that.', timestamp: 'Yesterday', unreadCount: 0, isOnline: false },
  { id: 'user3', name: 'SciFiFanatic', username: '@scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SF', lastMessage: 'That plot twist was insane!', timestamp: 'Mon', unreadCount: 0, isOnline: true },
];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function ChatPage() {
  const { toast } = useToast();
  const [aiNickname, setAiNickname] = useState(aiChatUser.nickname);
  const [aiAvatar, setAiAvatar] = useState(aiChatUser.avatarUrl);
  const [currentMessage, setCurrentMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<Message[]>([]); // Initialize empty
  const [selectedChatUser, setSelectedChatUser] = useState<typeof placeholderUserChats[0] | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);

  const aiAvatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set the initial AI message only on the client-side after mount
    // to avoid hydration mismatch for the timestamp.
    setAiMessages([
      { 
        id: 'initial-ai-message', 
        text: 'Hello! How can I help you with your stories today?', 
        sender: 'ai', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSendAiMessage = () => {
    if (!currentMessage.trim()) return;
    const newMessage: Message = {
      id: String(Date.now()), // Use a more unique ID like Date.now() or a UUID
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    // Simulate AI response
    const aiResponse: Message = {
      id: String(Date.now() + 1), // Use a more unique ID
      text: `I've received: "${currentMessage}". As an AI, I'm still learning!`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setAiMessages(prev => [...prev, newMessage, aiResponse]);
    setCurrentMessage("");
  };
  
  const handleSendUserMessage = () => {
    if (!currentMessage.trim() || !selectedChatUser) return;
     const newMessage: Message = {
      id: String(Date.now()), // Use a more unique ID
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    // Simulate response from the other user for demo
    const otherUserResponse: Message = {
      id: String(Date.now() + 1), // Use a more unique ID
      text: `This is a simulated reply to: "${currentMessage}".`,
      sender: 'ai', // Simulating other user as 'ai' for simplicity in this placeholder
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setUserMessages(prev => [...prev, newMessage, otherUserResponse]);
    setCurrentMessage("");
  }

  const handleNicknameChange = () => {
    const newNick = prompt("Enter new nickname for AI:", aiNickname);
    if (newNick) {
      setAiNickname(newNick);
      // In real app, save to local storage: localStorage.setItem('aiNickname', newNick);
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
        // In real app, save to local storage: localStorage.setItem('aiAvatarUrl', newAvatarUrl);
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
  }: {
    chatPartnerName: string;
    chatPartnerAvatar: string;
    chatPartnerFallback: string;
    messages: Message[];
    onSendMessage: () => void;
  }) => (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center space-x-3 border-b p-4">
        <Avatar>
          <AvatarImage src={chatPartnerAvatar} alt={chatPartnerName} data-ai-hint="person avatar" />
          <AvatarFallback>{chatPartnerFallback}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-headline">{chatPartnerName}</CardTitle>
          {selectedChatUser?.isOnline && <CardDescription className="text-xs text-green-500">Online</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[calc(100vh-380px)] sm:h-[calc(100vh-350px)] p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                <p className="text-sm font-body">{msg.text}</p>
                {msg.timestamp && <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp}</p>}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <div className="border-t p-4 flex items-center space-x-2">
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
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <MessageCircle className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Direct Messages</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Connect and chat with the community and our AI.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)] sm:h-[calc(100vh-250px)]">
        {/* Chat List & AI Section */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-xl">My Chats</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <ScrollArea className="h-full">
              {/* Katha Vault AI Chat Item */}
              <div 
                className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer ${!selectedChatUser ? 'bg-muted' : ''}`}
                onClick={() => setSelectedChatUser(null)}
              >
                <Avatar>
                  <AvatarImage src={aiAvatar} alt={aiChatUser.name} data-ai-hint="robot ai" />
                  <AvatarFallback>{aiChatUser.avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold text-sm text-foreground">{aiNickname}</p>
                  <p className="text-xs text-muted-foreground truncate">AI Assistant ready to help...</p>
                </div>
                 <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleNicknameChange(); }}>
                        <Palette size={16} />
                        <span className="sr-only">Change Nickname</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleAvatarChangeClick(); }}>
                        <CircleUserRound size={16} />
                         <span className="sr-only">Change AI Avatar</span>
                    </Button>
                    <input type="file" accept="image/*" ref={aiAvatarInputRef} onChange={handleAvatarFileChange} className="hidden" />
                </div>
              </div>
              <Separator />
              {/* User Chat List */}
              {placeholderUserChats.map(chat => (
                <div key={chat.id} 
                  className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer ${selectedChatUser?.id === chat.id ? 'bg-muted': ''}`}
                  onClick={() => { setSelectedChatUser(chat); setUserMessages([]); setCurrentMessage(''); }}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.avatarUrl} alt={chat.name} data-ai-hint="person avatar"/>
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
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <div className="md:col-span-2 h-full">
          {!selectedChatUser ? (
            <CurrentChatInterface
              chatPartnerName={aiNickname}
              chatPartnerAvatar={aiAvatar}
              chatPartnerFallback={aiChatUser.avatarFallback}
              messages={aiMessages}
              onSendMessage={handleSendAiMessage}
            />
          ) : (
            <CurrentChatInterface
              chatPartnerName={selectedChatUser.name}
              chatPartnerAvatar={selectedChatUser.avatarUrl}
              chatPartnerFallback={selectedChatUser.avatarFallback}
              messages={userMessages}
              onSendMessage={handleSendUserMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

