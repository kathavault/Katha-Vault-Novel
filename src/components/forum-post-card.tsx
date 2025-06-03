
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ThumbsUp, Eye, Send, CornerDownRight, Share2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { SharePostModal, type FriendForModal } from '@/components/share-post-modal';

// For client-side simulation, directly import friends list data
// In a real app, this would come from a shared state/context or API
const placeholderUserChatsForFriendsList = [
  { id: 'user1', name: 'Elara Reads', username: '@elara', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER' },
  { id: 'user2', name: 'Marcus Writes', username: '@marcus_w', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW' },
  { id: 'user3', name: 'SciFiFanatic', username: '@scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SF' },
];


export interface FeedItemComment {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  text: string;
  timestamp: string;
  commentLikes: number;
  isCommentLikedByUser: boolean;
  replies: FeedItemComment[];
}

interface FeedItemCardProps {
  id: string;
  postType: 'forum' | 'social';
  title?: string;
  mainText: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  timestamp: string;
  likesCount: number;
  viewsCount?: number;
  imageUrl?: string;
  aiHint?: string;
  comments: FeedItemComment[];
}

export function FeedItemCard({
  id: postId,
  postType,
  title,
  mainText,
  authorName,
  authorAvatarUrl,
  authorInitials,
  timestamp,
  likesCount: initialLikesCount,
  viewsCount,
  imageUrl,
  aiHint = "feed image",
  comments: initialComments
}: FeedItemCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [currentPostLikes, setCurrentPostLikes] = useState(initialLikesCount);
  const [postComments, setPostComments] = useState<FeedItemComment[]>(initialComments);
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handlePostLike = () => {
    setIsPostLiked(prev => !prev);
    setCurrentPostLikes(prev => isPostLiked ? prev - 1 : prev + 1);
  };

  const handleCommentLike = (targetCommentId: string) => {
    const updateLikesRecursively = (comments: FeedItemComment[]): FeedItemComment[] => {
      return comments.map(comment => {
        if (comment.id === targetCommentId) {
          return {
            ...comment,
            isCommentLikedByUser: !comment.isCommentLikedByUser,
            commentLikes: comment.isCommentLikedByUser ? comment.commentLikes - 1 : comment.commentLikes + 1,
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateLikesRecursively(comment.replies),
          };
        }
        return comment;
      });
    };
    setPostComments(prevComments => updateLikesRecursively(prevComments));
  };
  
  const handleToggleReplyInput = (commentId: string) => {
    setReplyingToCommentId(prevId => (prevId === commentId ? null : commentId));
    setReplyText("");
  };

  const handlePostReply = (e: FormEvent<HTMLFormElement>, targetParentCommentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast({ title: "Empty Reply", description: "Cannot submit an empty reply.", variant: "destructive" });
      return;
    }

    const newReply: FeedItemComment = {
      id: `reply-${targetParentCommentId}-${Date.now()}`,
      authorName: 'CurrentUser', 
      authorInitials: 'CU',
      authorAvatarUrl: 'https://placehold.co/32x32.png?text=CU', 
      text: replyText,
      timestamp: 'Just now',
      commentLikes: 0,
      isCommentLikedByUser: false,
      replies: [],
    };

    const addReplyRecursively = (comments: FeedItemComment[]): FeedItemComment[] => {
      return comments.map(comment => {
        if (comment.id === targetParentCommentId) {
          return {
            ...comment,
            replies: [newReply, ...comment.replies], 
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyRecursively(comment.replies),
          };
        }
        return comment;
      });
    };

    setPostComments(prevComments => addReplyRecursively(prevComments));
    setReplyText("");
    setReplyingToCommentId(null); 
    toast({ title: "Reply Posted", description: "Your reply has been added (client-side)." });
  };

  const commentsToDisplay = showAllComments ? postComments : postComments.slice(0, 2);
  const totalTopLevelComments = postComments.length;

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleJoinDiscussion = () => {
    toast({
        title: "Joining Discussion...",
        description: `Taking you to the chat area for "${title || 'this post'}". Imagine this is the dedicated discussion group!`,
        duration: 4000,
    });
    router.push('/chat');
  };


  const CommentItem = ({ comment }: { comment: FeedItemComment }) => (
    <div className={`flex space-x-3 mt-4 ${comment.id.startsWith('reply-') ? 'ml-6 sm:ml-8' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} data-ai-hint="person avatar" />
        <AvatarFallback>{comment.authorInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div>
          <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
        <div className="flex items-center space-x-2 text-xs">
          <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleCommentLike(comment.id)}>
            <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isCommentLikedByUser ? 'fill-primary text-primary' : ''}`} /> 
            {comment.commentLikes > 0 ? comment.commentLikes : 'Like'}
          </Button>
          <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleToggleReplyInput(comment.id)}>
            <CornerDownRight className="h-3.5 w-3.5 mr-1" /> Reply
          </Button>
        </div>
        {replyingToCommentId === comment.id && (
          <form onSubmit={(e) => handlePostReply(e, comment.id)} className="mt-2 flex items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Write a reply..." 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="h-8 text-sm flex-grow" 
              autoFocus
            />
            <Button type="submit" size="sm" variant="ghost" className="h-8 px-2">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} /> 
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatarUrl} alt={authorName} data-ai-hint="person avatar" />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-foreground">{authorName}</p>
              <CardDescription className="font-body text-xs text-muted-foreground">{timestamp}</CardDescription>
            </div>
          </div>
          {postType === 'forum' && title && (
             // For forum posts, the title itself is the main link, or we navigate via "Join Discussion"
            <CardTitle className="font-headline text-xl mt-1">{title}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <p className={`font-body text-foreground/90 ${postType === 'forum' ? 'line-clamp-4' : 'whitespace-pre-wrap'}`}>
            {mainText}
          </p>
          {postType === 'social' && imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <div className="relative aspect-video w-full">
                <Image
                  src={imageUrl}
                  alt={title || "Post image"}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={aiHint}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start text-muted-foreground text-sm pt-2">
          <div className="w-full flex justify-between items-center mb-3">
              <div className="flex space-x-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={handlePostLike}>
                  <ThumbsUp className={`h-4 w-4 mr-1 ${isPostLiked ? 'fill-primary text-primary' : ''}`} /> {currentPostLikes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={() => setShowAllComments(prev => !prev)}>
                  <MessageSquare className="h-4 w-4 mr-1" /> {totalTopLevelComments}
                </Button>
                {postType === 'forum' && viewsCount !== undefined && (
                  <span className="flex items-center p-1">
                    <Eye className="h-4 w-4 mr-1" /> {viewsCount}
                  </span>
                )}
              </div>
               {postType === 'forum' ? (
                 <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleJoinDiscussion}>Join Discussion</Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" onClick={handleOpenShareModal}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                 </div>
              ) : ( // social post
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" onClick={handleOpenShareModal}>
                   <Share2 className="h-4 w-4" />
                 </Button>
              )}
          </div>
          
          {postComments.length > 0 && (
            <div className="w-full pt-3 mt-2 border-t border-border/50">
              {commentsToDisplay.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
              {!showAllComments && totalTopLevelComments > 2 && (
                <Button variant="link" size="sm" className="text-primary hover:text-primary/80 mt-3 p-0 h-auto" onClick={() => setShowAllComments(true)}>
                  View all {totalTopLevelComments} comments
                </Button>
              )}
               {showAllComments && totalTopLevelComments > 2 && (
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary/80 mt-3 p-0 h-auto" onClick={() => setShowAllComments(false)}>
                  Show fewer comments
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
      {isShareModalOpen && (
        <SharePostModal
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          postTitle={title || mainText.substring(0, 50) + "..."}
          postId={postId}
          // friendsList={placeholderUserChatsForFriendsList} // Passing imported data
        />
      )}
    </>
  );
}
