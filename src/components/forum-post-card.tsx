
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, ThumbsUp, Eye, Send, CornerDownRight, Share2, Users, Trash2, MoreVertical, Globe, Lock, UserCheck, UserCog } from 'lucide-react';
import { useState, type FormEvent, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { SharePostModal } from '@/components/share-post-modal';
import { allMockUsers, CURRENT_USER_ID, getInitialFollowingIds, getKathaExplorerUser, isUserActive } from '@/lib/mock-data';

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
  currentUserName: string; // This should be the name of the LOGGED IN user
  currentUserId: string;   // This should be the ID of the LOGGED IN user
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
  currentUserName, // Logged in user's name
  currentUserId,   // Logged in user's ID
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

  // Note: currentUserName and currentUserId are passed as props and represent the logged-in user
  // authorId is the ID of the post's author
  const isAuthorViewingPost = authorId === currentUserId;
  const isCurrentUserAdmin = currentUserId === CURRENT_USER_ID; // Assuming CURRENT_USER_ID is admin
  const loggedInUserIsActive = isUserActive(currentUserId); // Check if logged-in user is active

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
    if (!loggedInUserIsActive) {
      toast({ title: "Action Denied", description: "Your account is deactivated. Please contact an admin.", variant: "destructive"});
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
    if (!loggedInUserIsActive) {
      toast({ title: "Action Denied", description: "Your account is deactivated. Please contact an admin.", variant: "destructive"});
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
    if (!loggedInUserIsActive) {
      toast({ title: "Action Denied", description: "Your account is deactivated. Please contact an admin.", variant: "destructive"});
      return;
    }
    setReplyingToCommentId(prevId => (prevId === commentId ? null : commentId));
    setReplyText("");
  };

  const handlePostReply = (e: FormEvent<HTMLFormElement>, targetParentCommentId: string) => {
    e.preventDefault();
    if (!loggedInUserIsActive) {
      toast({ title: "Action Denied", description: "Your account is deactivated. Please contact an admin.", variant: "destructive"});
      return;
    }
    if (!replyText.trim()) {
      toast({ title: "Empty Reply", description: "Cannot submit an empty reply.", variant: "destructive" });
      return;
    }
    
    const loggedInUserDetails = getKathaExplorerUser(); // Get fresh data for logged in user

    const newReply: FeedItemComment = {
      id: `reply-${targetParentCommentId}-${Date.now()}`,
      authorName: loggedInUserDetails.name, // Use loggedInUserDetails.name
      authorInitials: loggedInUserDetails.avatarFallback, // Use loggedInUserDetails.avatarFallback
      authorAvatarUrl: loggedInUserDetails.avatarUrl, // Use loggedInUserDetails.avatarUrl
      authorId: currentUserId, // currentUserId is the ID of the logged-in user
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
            replies: [newReply, ...(comment.replies || [])], // Ensure replies is an array
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
    const deleteCommentRecursively = (comments: FeedItemComment[]): FeedItemComment[] => {
      return comments.filter(comment => {
          if (comment.id === targetCommentId) {
              // Permission check: logged-in user is comment author OR admin
              return !(comment.authorId === currentUserId || isCurrentUserAdmin);
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = deleteCommentRecursively(comment.replies);
          }
          return true; // Keep the comment if it's not the target or if no permission
      }).map(comment => { // Ensure the mapping for replies is correct
          if (comment.replies) {
              comment.replies = deleteCommentRecursively(comment.replies);
          }
          return comment;
      });
    };
    
    // Check if comment exists and if user has permission before attempting to update state
    let commentExists = false;
    let hasPermission = false;
    const findComment = (comments: FeedItemComment[]): FeedItemComment | undefined => {
        for (const comment of comments) {
            if (comment.id === targetCommentId) {
                commentExists = true;
                if (comment.authorId === currentUserId || isCurrentUserAdmin) {
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

    if (commentExists && hasPermission && loggedInUserIsActive) {
        updateCommentsStateAndNotifyParent(deleteCommentRecursively(postComments).filter(c => c.id !== targetCommentId));
        toast({ title: "Comment Deleted", description: "The comment has been removed." });
    } else if (!loggedInUserIsActive) {
        toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive" });
    } else if (!hasPermission) {
        toast({ title: "Deletion Failed", description: "You do not have permission to delete this comment.", variant: "destructive" });
    }
  };

  const commentsToDisplay = showAllComments || !isFullView ? postComments : postComments.slice(0, 2);
  const totalTopLevelComments = postComments.length;

  const handleOpenShareModal = () => setIsShareModalOpen(true);

  const handleJoinDiscussion = () => {
    if (!loggedInUserIsActive) {
      toast({ title: "Action Denied", description: "Your account is deactivated. Please contact an admin.", variant: "destructive"});
      return;
    }
    const groupNameDisplay = currentDiscussionGroupName || title || `Discussion for post ${postId}`;
    try {
      const storedDiscussionsRaw = localStorage.getItem(JOINED_DISCUSSIONS_STORAGE_KEY);
      let joinedDiscussions: { id: string; name: string; postId: string }[] = storedDiscussionsRaw ? JSON.parse(storedDiscussionsRaw) : [];

      const discussionExists = joinedDiscussions.some(d => d.postId === postId);
      if (!discussionExists) {
        joinedDiscussions.push({
          id: `discussion-${postId}`, // Ensure discussion group ID is unique and related to post
          name: groupNameDisplay,
          postId: postId,
        });
        localStorage.setItem(JOINED_DISCUSSIONS_STORAGE_KEY, JSON.stringify(joinedDiscussions));
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
    const groupNameDisplay = currentDiscussionGroupName || title || `Discussion for post ${postId}`;
    setIsDiscussionGroupIncluded(false);
    // Optionally, also remove from localStorage if the user is leaving their own group
    // For now, this just visually hides it on the card
    toast({
        title: "Discussion Group Removed (Visual)",
        description: `The discussion group '${groupNameDisplay}' for this post is now visually hidden from this card.`,
    });
  };

  const handleInternalDeletePost = () => {
    if (onDeletePost && (isAuthorViewingPost || isCurrentUserAdmin) && loggedInUserIsActive) {
      onDeletePost(postId);
    } else if (!loggedInUserIsActive) {
      toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
    } else {
      toast({ title: "Action Denied", description: "You cannot delete this post.", variant: "destructive"});
    }
  }

  const PrivacyIcon = () => {
    if (!isAuthorViewingPost && !isCurrentUserAdmin) return null; // Show privacy only to author or admin
    if (privacy === 'public') return <Globe className="h-3.5 w-3.5 text-blue-500 ml-1.5" title="Public Post"/>;
    if (privacy === 'private') return <Lock className="h-3.5 w-3.5 text-orange-500 ml-1.5" title="Private Post (Only visible to you)"/>;
    if (privacy === 'custom') return <UserCog className="h-3.5 w-3.5 text-teal-500 ml-1.5" title={`Custom Audience (${customAudienceUserIds?.length || 0} specific users)`}/>;
    return null;
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: FeedItemComment, depth?: number }) => {
    const isCommentByLoggedInUser = comment.authorId === currentUserId;
    const canLoggedInUserDeleteThisComment = loggedInUserIsActive && (isCommentByLoggedInUser || isCurrentUserAdmin); 

    return (
      <div className={`flex space-x-3 mt-4 ${depth > 0 ? 'ml-6 sm:ml-8' : ''}`}>
        <Link href={`/profile/${comment.authorId || ''}`} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} data-ai-hint="person avatar" />
            <AvatarFallback>{comment.authorInitials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/profile/${comment.authorId || ''}`} className="hover:underline">
                <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
              </Link>
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
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleCommentLike(comment.id)} disabled={!loggedInUserIsActive}>
              <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isCommentLikedByUser ? 'fill-primary text-primary' : ''}`} />
              {comment.commentLikes > 0 ? comment.commentLikes : 'Like'}
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleToggleReplyInput(comment.id)} disabled={!loggedInUserIsActive}>
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
                disabled={!loggedInUserIsActive}
              />
              <Button type="submit" size="sm" variant="ghost" className="h-8 px-2" disabled={!loggedInUserIsActive || !replyText.trim()}>
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
              <Link href={`/profile/${authorId}`} className="hover:underline">
                <p className="text-sm font-semibold text-foreground">{authorName}</p>
              </Link>
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
              {(isAuthorViewingPost || isCurrentUserAdmin) && onDeletePost && isFullView && (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" disabled={!loggedInUserIsActive}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={handleInternalDeletePost}
                      className="text-destructive hover:!text-destructive focus:!text-destructive focus:!bg-destructive/10"
                      disabled={!loggedInUserIsActive}
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
          <div className="w-full flex justify-between items-center mb-3">
              <div className="flex space-x-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto" onClick={handlePostLike} disabled={!loggedInUserIsActive}>
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
                    <Button variant="outline" size="sm" onClick={handleJoinDiscussion} disabled={!loggedInUserIsActive}>
                        <Users className="mr-2 h-4 w-4" />
                        Join {currentDiscussionGroupName ? `"${currentDiscussionGroupName}"` : "Discussion"}
                    </Button>
                )}
                { (isAuthorViewingPost || isCurrentUserAdmin) && isDiscussionGroupIncluded && isFullView && (
                     <Button variant="outline" size="sm" onClick={handleDeleteDiscussionGroup} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive" disabled={!loggedInUserIsActive}>
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
            <form onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                const loggedInUserDetails = getKathaExplorerUser();
                if (!isUserActive(loggedInUserDetails.id)) {
                    toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
                    return;
                }
                if (!replyText.trim()) {
                    toast({ title: "Empty Comment", description: "Cannot submit an empty comment.", variant: "destructive" });
                    return;
                }
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
                setReplyText(""); // Clear input after posting
                toast({ title: "Comment Posted", description: "Your comment has been added to the post." });
            }} className="w-full mt-4 pt-3 border-t border-border/50 flex items-center space-x-2">
                <Input
                    type="text"
                    placeholder={loggedInUserIsActive ? "Write a comment..." : "Your account is deactivated."}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="h-9 text-sm flex-grow"
                    disabled={!loggedInUserIsActive}
                />
                <Button type="submit" size="sm" className="h-9 px-3" disabled={!loggedInUserIsActive || !replyText.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
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
