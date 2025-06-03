
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ThumbsUp, Eye, Send, CornerDownRight, Repeat } from 'lucide-react';
import { useState, type FormEvent } from 'react';

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
  repliesOrCommentsCount: number; // This can be derived from comments.length if always provided
  likesCount: number;
  viewsCount?: number;
  imageUrl?: string;
  aiHint?: string;
  comments: FeedItemComment[]; // Added comments prop
}

export function FeedItemCard({
  id: postId, // Renamed to avoid conflict with comment id
  postType,
  title,
  mainText,
  authorName,
  authorAvatarUrl,
  authorInitials,
  timestamp,
  // repliesOrCommentsCount, // We can derive this from comments.length
  likesCount: initialLikesCount,
  viewsCount,
  imageUrl,
  aiHint = "feed image",
  comments: initialComments
}: FeedItemCardProps) {
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [currentPostLikes, setCurrentPostLikes] = useState(initialLikesCount);
  const [postComments, setPostComments] = useState<FeedItemComment[]>(initialComments);
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handlePostLike = () => {
    setIsPostLiked(!isPostLiked);
    setCurrentPostLikes(prev => isPostLiked ? prev - 1 : prev + 1);
  };

  const handleCommentLike = (commentId: string, isReply: boolean, parentCommentId?: string) => {
    setPostComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === (isReply ? parentCommentId : commentId)) {
          const updateLike = (c: FeedItemComment): FeedItemComment => {
            if (c.id === commentId) {
              return {
                ...c,
                isCommentLikedByUser: !c.isCommentLikedByUser,
                commentLikes: c.isCommentLikedByUser ? c.commentLikes - 1 : c.commentLikes + 1,
              };
            }
            return c;
          };

          if (isReply && parentCommentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => updateLike(reply)),
            };
          }
          return updateLike(comment);
        }
        return comment;
      })
    );
  };
  
  const handleToggleReplyInput = (commentId: string) => {
    setReplyingToCommentId(prevId => (prevId === commentId ? null : commentId));
    setReplyText("");
  };

  const handlePostReply = (e: FormEvent<HTMLFormElement>, parentCommentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply: FeedItemComment = {
      id: `reply-${parentCommentId}-${Date.now()}`,
      authorName: 'CurrentUser', // Placeholder
      authorInitials: 'CU',
      text: replyText,
      timestamp: 'Just now',
      commentLikes: 0,
      isCommentLikedByUser: false,
      replies: [],
    };

    setPostComments(prevComments =>
      prevComments.map(comment =>
        comment.id === parentCommentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );
    setReplyText("");
    setReplyingToCommentId(null);
  };


  const commentsToDisplay = showAllComments ? postComments : postComments.slice(0, 2);

  const CommentItem = ({ comment, isReply = false, parentCommentId }: { comment: FeedItemComment; isReply?: boolean; parentCommentId?: string }) => (
    <div className={`flex space-x-3 ${isReply ? 'ml-8 mt-3' : 'mt-4'}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} data-ai-hint="person avatar" />
        <AvatarFallback>{comment.authorInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div>
          <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
        </div>
        <p className="text-sm text-foreground/90">{comment.text}</p>
        <div className="flex items-center space-x-2 text-xs">
          <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleCommentLike(comment.id, isReply, parentCommentId)}>
            <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isCommentLikedByUser ? 'fill-primary text-primary' : ''}`} /> 
            {comment.commentLikes > 0 ? comment.commentLikes : ''}
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
            />
            <Button type="submit" size="sm" variant="ghost" className="h-8 px-2">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply={true} parentCommentId={comment.id} />
        ))}
      </div>
    </div>
  );


  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={authorAvatarUrl} alt={authorName} data-ai-hint="person avatar" />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{authorName}</p>
            <CardDescription className="font-body text-xs text-muted-foreground">{timestamp}</CardDescription>
          </div>
        </div>
        {postType === 'forum' && title && (
          <Link href={`/forum/${postId}`} className="hover:text-primary transition-colors">
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
          </Link>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <p className={`font-body text-foreground/90 ${postType === 'forum' ? 'line-clamp-3' : 'whitespace-pre-wrap'}`}>
          {mainText}
        </p>
        {postType === 'social' && imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            <Image src={imageUrl} alt="Post image" layout="fill" objectFit="cover" data-ai-hint={aiHint} className="aspect-video w-full" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start text-muted-foreground text-sm pt-2">
        <div className="w-full flex justify-between items-center mb-2">
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={handlePostLike}>
                <ThumbsUp className={`h-4 w-4 mr-1 ${isPostLiked ? 'fill-primary text-primary' : ''}`} /> {currentPostLikes}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={() => setShowAllComments(true)}>
                <MessageSquare className="h-4 w-4 mr-1" /> {postComments.length}
              </Button>
              {postType === 'forum' && viewsCount !== undefined && (
                <span className="flex items-center p-1">
                  <Eye className="h-4 w-4 mr-1" /> {viewsCount}
                </span>
              )}
            </div>
             {postType === 'forum' ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/forum/${postId}`}>Join Discussion</Link>
              </Button>
            ) : (
               <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
                 <Send className="h-4 w-4 mr-1" /> Share
               </Button>
            )}
        </div>
        
        {/* Comments Section */}
        {postComments.length > 0 && (
          <div className="w-full pt-3 mt-3 border-t border-border/50">
            {commentsToDisplay.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            {!showAllComments && postComments.length > 2 && (
              <Button variant="link" size="sm" className="text-primary hover:text-primary/80 mt-2 p-0 h-auto" onClick={() => setShowAllComments(true)}>
                View all {postComments.length} comments
              </Button>
            )}
             {showAllComments && postComments.length > 2 && (
              <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary/80 mt-2 p-0 h-auto" onClick={() => setShowAllComments(false)}>
                Show fewer comments
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
