
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, ThumbsUp, Eye, Send, CornerDownRight, Share2, Users, Trash2, MoreVertical, Globe, Lock, UserCheck, UserCog, LogIn, CheckCircle } from 'lucide-react';
import { useState, type FormEvent, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { SharePostModal } from '@/components/share-post-modal';
import { allMockUsers, CURRENT_USER_ID, getInitialFollowingIds, getKathaExplorerUser, isUserActive, isUserLoggedIn, isUserAdmin as checkIsUserAdmin, KRITIKA_USER_ID, KATHAVAULT_OWNER_USER_ID } from '@/lib/mock-data';

const JOINED_DISCUSSIONS_STORAGE_KEY = 'joinedKathaVaultDiscussions';


export interface FeedItemComment {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  authorId?: string; 
  text: string;
  timestamp: string;
  commentLikes: number;
  isCommentLikedByUser: boolean;
  replies: FeedItemComment[];
}

export interface FeedItemCardProps {
  id: string;
  postType: 'forum' | 'social';
  title?: string;
  mainText: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  authorId: string;
  timestamp: string;
  likesCount: number;
  viewsCount?: number;
  imageUrl?: string;
  aiHint?: string;
  comments: FeedItemComment[];
  includeDiscussionGroup?: boolean;
  discussionGroupName?: string;
  privacy: 'public' | 'private' | 'custom';
  customAudienceUserIds?: string[];
  onDeletePost?: (postId: string) => void;
  onUpdateComments?: (postId: string, updatedComments: FeedItemComment[]) => void;
  isFullView?: boolean;
  currentUserName: string; 
  currentUserId: string;   
}

export function FeedItemCard({
  id: postId,
  postType,
  title,
  mainText,
  authorName,
  authorAvatarUrl,
  authorInitials,
  authorId,
  timestamp,
  likesCount: initialLikesCount,
  viewsCount,
  imageUrl,
  aiHint = "feed image",
  comments: initialComments,
  includeDiscussionGroup = false,
  discussionGroupName: initialDiscussionGroupName,
  privacy,
  customAudienceUserIds,
  onDeletePost,
  onUpdateComments,
  isFullView = true,
  currentUserName, 
  currentUserId,   
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
  const [currentDiscussionGroupName, setCurrentDiscussionGroupName] = useState(initialDiscussionGroupName);
  const [isDiscussionGroupIncluded, setIsDiscussionGroupIncluded] = useState(includeDiscussionGroup);
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [activeUser, setActiveUser] = useState(false);

  const isPostAuthorSpecialAdmin = authorId === KRITIKA_USER_ID || authorId === KATHAVAULT_OWNER_USER_ID;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const userLoggedIn = isUserLoggedIn();
        setLoggedIn(userLoggedIn);
        if(userLoggedIn) {
            const user = getKathaExplorerUser();
            setUserIsAdmin(checkIsUserAdmin());
            setActiveUser(isUserActive(user.id));
        } else {
            setUserIsAdmin(false);
            setActiveUser(false);
        }
    }
  }, []);


  const isAuthorViewingPost = authorId === currentUserId;

  useEffect(() => {
    setPostComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    setCurrentPostLikes(initialLikesCount);
  } , [initialLikesCount]);

  useEffect(() => {
    setCurrentDiscussionGroupName(initialDiscussionGroupName);
  }, [initialDiscussionGroupName]);

  useEffect(() => {
    setIsDiscussionGroupIncluded(includeDiscussionGroup);
  }, [includeDiscussionGroup]);


  const handlePostLike = () => {
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to like posts.", variant: "destructive" });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!activeUser) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
      return;
    }
    setIsPostLiked(prev => !prev);
    setCurrentPostLikes(prev => isPostLiked ? prev - 1 : prev + 1);
  };

  const updateCommentsStateAndNotifyParent = (updatedComments: FeedItemComment[]) => {
    setPostComments(updatedComments);
    if (onUpdateComments) {
      onUpdateComments(postId, updatedComments);
    }
  };

  const handleCommentLike = (targetCommentId: string) => {
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to like comments.", variant: "destructive" });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!activeUser) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
      return;
    }
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
    updateCommentsStateAndNotifyParent(updateLikesRecursively(postComments));
  };

  const handleToggleReplyInput = (commentId: string) => {
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to reply.", variant: "destructive" });
       router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!activeUser) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
      return;
    }
    setReplyingToCommentId(prevId => (prevId === commentId ? null : commentId));
    setReplyText("");
  };

  const handlePostReply = (e: FormEvent<HTMLFormElement>, targetParentCommentId: string) => {
    e.preventDefault();
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to post replies.", variant: "destructive" });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!activeUser) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
      return;
    }
    if (!replyText.trim()) {
      toast({ title: "Empty Reply", description: "Cannot submit an empty reply.", variant: "destructive" });
      return;
    }
    
    const loggedInUserDetails = getKathaExplorerUser(); 

    const newReply: FeedItemComment = {
      id: `reply-${targetParentCommentId}-${Date.now()}`,
      authorName: loggedInUserDetails.name, 
      authorInitials: loggedInUserDetails.avatarFallback, 
      authorAvatarUrl: loggedInUserDetails.avatarUrl, 
      authorId: currentUserId, 
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
            replies: [newReply, ...(comment.replies || [])], 
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

    updateCommentsStateAndNotifyParent(addReplyRecursively(postComments));
    setReplyText("");
    setReplyingToCommentId(null);
    toast({ title: "Reply Posted", description: "Your reply has been added." });
  };

  const handleDeleteComment = (targetCommentId: string) => {
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to delete comments.", variant: "destructive" });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    const deleteCommentRecursively = (comments: FeedItemComment[]): FeedItemComment[] => {
      return comments.filter(comment => {
          if (comment.id === targetCommentId) {
              return !(comment.authorId === currentUserId || userIsAdmin);
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = deleteCommentRecursively(comment.replies);
          }
          return true; 
      }).map(comment => { 
          if (comment.replies) {
              comment.replies = deleteCommentRecursively(comment.replies);
          }
          return comment;
      });
    };
    
    let commentExists = false;
    let hasPermission = false;
    const findComment = (comments: FeedItemComment[]): FeedItemComment | undefined => {
        for (const comment of comments) {
            if (comment.id === targetCommentId) {
                commentExists = true;
                if (comment.authorId === currentUserId || userIsAdmin) {
                    hasPermission = true;
                }
                return comment;
            }
            if (comment.replies) {
                const foundInReply = findComment(comment.replies);
                if (foundInReply) return foundInReply;
            }
        }
        return undefined;
    };
    findComment(postComments);

    if (commentExists && hasPermission && activeUser) {
        updateCommentsStateAndNotifyParent(deleteCommentRecursively(postComments).filter(c => c.id !== targetCommentId));
        toast({ title: "Comment Deleted", description: "The comment has been removed." });
    } else if (!activeUser) {
        toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive" });
    } else if (!hasPermission) {
        toast({ title: "Deletion Failed", description: "You do not have permission to delete this comment.", variant: "destructive" });
    }
  };

  const commentsToDisplay = showAllComments || !isFullView ? postComments : postComments.slice(0, 2);
  const totalTopLevelComments = postComments.length;

  const handleOpenShareModal = () => {
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to share posts.", variant: "destructive" });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    setIsShareModalOpen(true)
  };

  const handleJoinDiscussion = () => {
    if (!loggedIn) {
      toast({ title: "Login Required", description: "Please login to join discussions.", variant: "destructive" });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!activeUser) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
      return;
    }
    const groupNameDisplay = currentDiscussionGroupName || title || `Discussion for post ${postId}`;
    try {
      const storedDiscussionsRaw = typeof window !== 'undefined' ? localStorage.getItem(JOINED_DISCUSSIONS_STORAGE_KEY) : null;
      let joinedDiscussions: { id: string; name: string; postId: string }[] = storedDiscussionsRaw ? JSON.parse(storedDiscussionsRaw) : [];

      const discussionExists = joinedDiscussions.some(d => d.postId === postId);
      if (!discussionExists) {
        joinedDiscussions.push({
          id: `discussion-${postId}`, 
          name: groupNameDisplay,
          postId: postId,
        });
        if (typeof window !== 'undefined') localStorage.setItem(JOINED_DISCUSSIONS_STORAGE_KEY, JSON.stringify(joinedDiscussions));
        toast({
          title: `Added to "Joined Discussions"!`,
          description: `You can find "${groupNameDisplay}" in the Chat section. Post ID: ${postId}`,
          duration: 6000,
        });
         router.push(`/chat?section=discussions&discussionId=discussion-${postId}`);
      } else {
         toast({
          title: `Already Joined`,
          description: `"${groupNameDisplay}" is already in your "Joined Discussions". Post ID: ${postId}`,
          duration: 6000,
        });
        router.push(`/chat?section=discussions&discussionId=discussion-${postId}`);
      }
    } catch (error) {
      console.error("Error saving joined discussion to localStorage:", error);
      toast({
        title: "Error Joining Discussion",
        description: "Could not save this discussion to your list.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDiscussionGroup = () => {
    if (!loggedIn || !activeUser) {
        toast({ title: "Action Denied", description: "Login required or account deactivated.", variant: "destructive"});
        return;
    }
    const groupNameDisplay = currentDiscussionGroupName || title || `Discussion for post ${postId}`;
    setIsDiscussionGroupIncluded(false);
    toast({
        title: "Discussion Group Removed (Visual)",
        description: `The discussion group '${groupNameDisplay}' for this post is now visually hidden from this card.`,
    });
  };

  const handleInternalDeletePost = () => {
    if (onDeletePost && (isAuthorViewingPost || userIsAdmin) && loggedIn && activeUser) {
      onDeletePost(postId);
    } else if (!loggedIn) {
        toast({ title: "Login Required", description: "Please login to delete posts.", variant: "destructive"});
        router.push(`/login?redirect=${window.location.pathname}`);
    } else if (!activeUser) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
    } else {
      toast({ title: "Action Denied", description: "You cannot delete this post.", variant: "destructive"});
    }
  }

  const PrivacyIcon = () => {
    if (!isAuthorViewingPost && !userIsAdmin) return null; 
    if (privacy === 'public') return <Globe className="h-3.5 w-3.5 text-blue-500 ml-1.5" title="Public Post"/>;
    if (privacy === 'private') return <Lock className="h-3.5 w-3.5 text-orange-500 ml-1.5" title="Private Post (Only visible to you)"/>;
    if (privacy === 'custom') return <UserCog className="h-3.5 w-3.5 text-teal-500 ml-1.5" title={`Custom Audience (${customAudienceUserIds?.length || 0} specific users)`}/>;
    return null;
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: FeedItemComment, depth?: number }) => {
    const isCommentByLoggedInUser = loggedIn && comment.authorId === currentUserId;
    const canLoggedInUserDeleteThisComment = loggedIn && activeUser && (isCommentByLoggedInUser || userIsAdmin); 
    const isCommentAuthorSpecialAdmin = comment.authorId === KRITIKA_USER_ID || comment.authorId === KATHAVAULT_OWNER_USER_ID;


    return (
      <div className={`flex space-x-3 mt-4 ${depth > 0 ? 'ml-4 sm:ml-6' : ''}`}>
        <Link href={comment.authorId ? `/profile/${comment.authorId}` : '#'} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} data-ai-hint="person avatar" />
            <AvatarFallback>{comment.authorInitials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href={comment.authorId ? `/profile/${comment.authorId}` : '#'} className="hover:underline">
                <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
              </Link>
              {isCommentAuthorSpecialAdmin && (
                <CheckCircle className="ml-1 h-3.5 w-3.5 text-blue-500 flex-shrink-0" title="Verified Admin" />
              )}
              <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
            </div>
            {canLoggedInUserDeleteThisComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => handleDeleteComment(comment.id)}
                    className="text-destructive hover:!text-destructive focus:!text-destructive focus:!bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Comment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
          <div className="flex items-center space-x-2 text-xs">
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleCommentLike(comment.id)} disabled={!loggedIn || !activeUser}>
              <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isCommentLikedByUser ? 'fill-primary text-primary' : ''}`} />
              {comment.commentLikes > 0 ? comment.commentLikes : 'Like'}
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleToggleReplyInput(comment.id)} disabled={!loggedIn || !activeUser}>
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
                disabled={!loggedIn || !activeUser}
              />
              <Button type="submit" size="sm" variant="ghost" className="h-8 px-2" disabled={!loggedIn || !activeUser || !replyText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
          {comment.replies?.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3 mb-2">
            <Link href={`/profile/${authorId}`} className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={authorAvatarUrl} alt={authorName} data-ai-hint="person avatar" />
                <AvatarFallback>{authorInitials}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-grow">
              <div className="flex items-center">
                <Link href={`/profile/${authorId}`} className="hover:underline">
                  <p className="text-sm font-semibold text-foreground">{authorName}</p>
                </Link>
                {isPostAuthorSpecialAdmin && (
                  <CheckCircle className="ml-1 h-4 w-4 text-blue-500 flex-shrink-0" title="Verified Admin" />
                )}
              </div>
              <CardDescription className="font-body text-xs text-muted-foreground flex items-center">
                {timestamp}
                <PrivacyIcon />
              </CardDescription>
            </div>
            <div className="flex items-center">
              {isFullView && (
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" onClick={handleOpenShareModal}>
                    <Share2 className="h-4 w-4" />
                 </Button>
              )}
              {(isAuthorViewingPost || userIsAdmin) && onDeletePost && isFullView && (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" disabled={!loggedIn || !activeUser}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={handleInternalDeletePost}
                      className="text-destructive hover:!text-destructive focus:!text-destructive focus:!bg-destructive/10"
                      disabled={!loggedIn || !activeUser}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {postType === 'forum' && title && (
             <Link href={`/forum/post/${postId}`} className="hover:text-primary transition-colors">
                <CardTitle className="font-headline text-xl mt-1">{title}</CardTitle>
            </Link>
          )}
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <p className={`font-body text-foreground/90 ${postType === 'forum' && !isFullView ? 'line-clamp-4' : 'whitespace-pre-wrap'}`}>
            {mainText}
          </p>
          {postType === 'social' && imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <div className="relative aspect-video w-full">
                <Image
                  src={imageUrl}
                  alt={title || "Post image"}
                  fill
                  style={{objectFit: "cover"}}
                  data-ai-hint={aiHint}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start text-muted-foreground text-sm pt-2">
          <div className="w-full flex flex-wrap justify-between items-center mb-3 gap-2">
              <div className="flex space-x-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={handlePostLike} disabled={!loggedIn || !activeUser}>
                  <ThumbsUp className={`h-4 w-4 mr-1 ${isPostLiked ? 'fill-primary text-primary' : ''}`} /> {currentPostLikes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={() => {if (isFullView) setShowAllComments(prev => !prev)}}>
                  <MessageSquare className="h-4 w-4 mr-1" /> {totalTopLevelComments}
                </Button>
                {postType === 'forum' && viewsCount !== undefined && (
                  <span className="flex items-center p-1">
                    <Eye className="h-4 w-4 mr-1" /> {viewsCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                { isDiscussionGroupIncluded && isFullView && (
                    <Button variant="outline" size="sm" onClick={handleJoinDiscussion} disabled={!loggedIn || !activeUser}>
                        <Users className="mr-2 h-4 w-4" />
                        Join {currentDiscussionGroupName ? `"${currentDiscussionGroupName}"` : "Discussion"}
                    </Button>
                )}
                { (isAuthorViewingPost || userIsAdmin) && isDiscussionGroupIncluded && isFullView && (
                     <Button variant="outline" size="sm" onClick={handleDeleteDiscussionGroup} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive" disabled={!loggedIn || !activeUser}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Group
                    </Button>
                )}
              </div>
          </div>

          {(showAllComments || !isFullView) && postComments.length > 0 && (
            <div className="w-full pt-3 mt-2 border-t border-border/50">
              {commentsToDisplay.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
              {isFullView && !showAllComments && totalTopLevelComments > 2 && (
                <Button variant="link" size="sm" className="text-primary hover:text-primary/80 mt-3 p-0 h-auto" onClick={() => setShowAllComments(true)}>
                  View all {totalTopLevelComments} comments
                </Button>
              )}
               {isFullView && showAllComments && totalTopLevelComments > 2 && (
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary/80 mt-3 p-0 h-auto" onClick={() => setShowAllComments(false)}>
                  Show fewer comments
                </Button>
              )}
            </div>
          )}
          {isFullView && ( 
            loggedIn ? (
                <form onSubmit={(e) => {
                    e.preventDefault(); 
                    if (!activeUser) {
                        toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
                        return;
                    }
                    if (!replyText.trim()) {
                        toast({ title: "Empty Comment", description: "Cannot submit an empty comment.", variant: "destructive" });
                        return;
                    }
                    const loggedInUserDetails = getKathaExplorerUser();
                    const newTopLevelComment: FeedItemComment = {
                        id: `comment-${postId}-${Date.now()}`,
                        authorName: loggedInUserDetails.name,
                        authorInitials: loggedInUserDetails.avatarFallback,
                        authorAvatarUrl: loggedInUserDetails.avatarUrl,
                        authorId: loggedInUserDetails.id,
                        text: replyText,
                        timestamp: 'Just now',
                        commentLikes: 0,
                        isCommentLikedByUser: false,
                        replies: [],
                    };
                    updateCommentsStateAndNotifyParent([newTopLevelComment, ...postComments]);
                    setReplyText(""); 
                    toast({ title: "Comment Posted", description: "Your comment has been added to the post." });
                }} className="w-full mt-4 pt-3 border-t border-border/50 flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder={activeUser ? "Write a comment..." : "Your account is deactivated."}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="h-9 text-sm flex-grow"
                        disabled={!activeUser}
                    />
                    <Button type="submit" size="sm" className="h-9 px-3" disabled={!activeUser || !replyText.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            ) : (
                <div className="w-full mt-4 pt-3 border-t border-border/50 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Login to like, comment, and join discussions.</p>
                    <Button asChild variant="default" size="sm">
                        <Link href={`/login?redirect=${typeof window !== 'undefined' ? window.location.pathname : '/'}`}>
                            <LogIn className="mr-2 h-4 w-4" /> Login
                        </Link>
                    </Button>
                </div>
            )
        )}
        </CardFooter>
      </Card>
      {isShareModalOpen && (
        <SharePostModal
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          postTitle={title || mainText.substring(0, 50) + "..."}
          postId={postId}
        />
      )}
    </>
  );
}

    