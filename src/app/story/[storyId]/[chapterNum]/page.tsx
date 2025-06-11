
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getNovelsFromStorage, 
  type Novel, 
  type Chapter, 
  getStoredChapterComments, 
  saveStoredChapterComments, 
  type StoredChapterComment, 
  getKathaExplorerUser,
  isUserActive,
  isUserLoggedIn, 
  KRITIKA_USER_ID, 
  KATHAVAULT_OWNER_USER_ID,
  type MockUser
} from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, Send, CornerDownRight, MoreVertical, Trash2, Loader2, LogIn, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChapterReadingPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const storyId = typeof params.storyId === 'string' ? params.storyId : '';
  const chapterNumParam = typeof params.chapterNum === 'string' ? params.chapterNum : '';
  const currentChapterIndex = parseInt(chapterNumParam, 10) - 1; 

  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [chapterComments, setChapterComments] = useState<StoredChapterComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userIsLoggedIn = isUserLoggedIn();
      setLoggedIn(userIsLoggedIn);
      if (!userIsLoggedIn) {
        const currentPath = `/story/${storyId}/${chapterNumParam}`;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      setCurrentUser(getKathaExplorerUser());
    }

    if (storyId) {
      const allNovels = getNovelsFromStorage();
      const foundNovel = allNovels.find(n => n.id === storyId);
      setNovel(foundNovel || null);
      if (foundNovel && !isNaN(currentChapterIndex) && currentChapterIndex >= 0 && currentChapterIndex < foundNovel.chapters.length) {
        const chapter = foundNovel.chapters[currentChapterIndex];
        setCurrentChapter(chapter);
        if (loggedIn) loadChapterComments(storyId, chapter.id); 
      } else {
        setCurrentChapter(null);
        setChapterComments([]);
      }
    }
    setIsLoading(false);
  }, [storyId, currentChapterIndex, router, chapterNumParam, loggedIn]); 

  const currentUserIsActive = currentUser ? isUserActive(currentUser.id) : false;

  const loadChapterComments = (novelId: string, chapterId: string) => {
    const allComments = getStoredChapterComments();
    const filtered = allComments.filter(c => c.novelId === novelId && c.chapterId === chapterId);
    setChapterComments(filtered);
  };

  const updateAndSaveComments = (updatedComments: StoredChapterComment[]) => {
    const allStoredComments = getStoredChapterComments();
    const otherChaptersComments = allStoredComments.filter(c => !(c.novelId === storyId && c.chapterId === currentChapter?.id));
    const newMasterList = [...otherChaptersComments, ...updatedComments];
    saveStoredChapterComments(newMasterList);
    setChapterComments(updatedComments); 
  };

  const handlePostNewComment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please login to post comments.", variant: "destructive" });
      router.push(`/login?redirect=/story/${storyId}/${chapterNumParam}`);
      return;
    }
    if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    if (!newCommentText.trim() || !currentChapter) return;

    const newComment: StoredChapterComment = {
      id: `chapcomment-${Date.now()}`,
      novelId: storyId,
      chapterId: currentChapter.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatarUrl: currentUser.avatarUrl,
      authorInitials: currentUser.avatarFallback,
      text: newCommentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentLikes: 0,
      isCommentLikedByUser: false,
      replies: [],
    };
    updateAndSaveComments([...chapterComments, newComment]);
    setNewCommentText("");
    toast({ title: "Comment Posted!", description: "Your comment has been added." });
  };

  const handleCommentLike = (targetCommentId: string) => {
     if (!loggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please login to like comments.", variant: "destructive" });
      router.push(`/login?redirect=/story/${storyId}/${chapterNumParam}`);
      return;
    }
    if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    const updateLikesRecursively = (comments: StoredChapterComment[]): StoredChapterComment[] => {
      return comments.map(comment => {
        if (comment.id === targetCommentId) {
          return {
            ...comment,
            isCommentLikedByUser: !comment.isCommentLikedByUser,
            commentLikes: comment.isCommentLikedByUser ? comment.commentLikes - 1 : comment.commentLikes + 1,
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: updateLikesRecursively(comment.replies) };
        }
        return comment;
      });
    };
    updateAndSaveComments(updateLikesRecursively(chapterComments));
  };
  
  const handleToggleReplyInput = (commentId: string) => {
     if (!loggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please login to reply.", variant: "destructive" });
      router.push(`/login?redirect=/story/${storyId}/${chapterNumParam}`);
      return;
    }
    if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    setReplyingToCommentId(prevId => (prevId === commentId ? null : commentId));
    setReplyText("");
  };

  const handlePostReply = (e: FormEvent<HTMLFormElement>, parentCommentId: string) => {
    e.preventDefault();
    if (!loggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please login to post replies.", variant: "destructive" });
      router.push(`/login?redirect=/story/${storyId}/${chapterNumParam}`);
      return;
    }
    if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    if (!replyText.trim() || !currentChapter) return;

    const newReply: StoredChapterComment = {
      id: `chapreply-${Date.now()}`,
      novelId: storyId,
      chapterId: currentChapter.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatarUrl: currentUser.avatarUrl,
      authorInitials: currentUser.avatarFallback,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentLikes: 0,
      isCommentLikedByUser: false,
      replies: [],
    };

    const addReplyRecursively = (comments: StoredChapterComment[]): StoredChapterComment[] => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return { ...comment, replies: [newReply, ...(comment.replies || [])] }; 
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: addReplyRecursively(comment.replies) };
        }
        return comment;
      });
    };
    updateAndSaveComments(addReplyRecursively(chapterComments));
    setReplyText("");
    setReplyingToCommentId(null);
    toast({ title: "Reply Posted", description: "Your reply has been added." });
  };

  const handleDeleteComment = (targetCommentId: string) => {
    if (!loggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please login to delete comments.", variant: "destructive" });
      router.push(`/login?redirect=/story/${storyId}/${chapterNumParam}`);
      return;
    }
    if (!currentUserIsActive) {
        toast({ title: "Action Denied", description: "Your account is deactivated.", variant: "destructive"});
        return;
    }

    let commentToDelete: StoredChapterComment | undefined;
    const findComment = (comments: StoredChapterComment[]): StoredChapterComment | undefined => {
        for (const comment of comments) {
            if (comment.id === targetCommentId) return comment;
            if (comment.replies) {
                const foundInReply = findComment(comment.replies);
                if (foundInReply) return foundInReply;
            }
        }
        return undefined;
    };
    commentToDelete = findComment(chapterComments);

    const canDelete = commentToDelete && currentUser &&
                      (commentToDelete.authorId === currentUser.id || 
                       currentUser.id === KRITIKA_USER_ID || 
                       currentUser.id === KATHAVAULT_OWNER_USER_ID);

    if (canDelete) {
        const deleteCommentRecursively = (comments: StoredChapterComment[]): StoredChapterComment[] => {
            return comments
                .filter(comment => comment.id !== targetCommentId)
                .map(comment => ({
                    ...comment,
                    replies: comment.replies ? deleteCommentRecursively(comment.replies) : [],
                }));
        };
        updateAndSaveComments(deleteCommentRecursively(chapterComments)); 
        toast({ title: "Comment Deleted", description: "The comment has been removed." });
    } else {
        toast({ title: "Deletion Failed", description: "You do not have permission to delete this comment or it was not found.", variant: "destructive" });
    }
  };


  if (isLoading || !loggedIn) { 
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Loading chapter or redirecting...</div>;
  }

  if (!novel || !currentChapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">Chapter Not Found</h1>
        <p className="text-muted-foreground mb-6">This chapter does not exist or is unavailable.</p>
        <Button onClick={() => router.push(storyId ? `/story/${storyId}` : '/library')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Story Details
        </Button>
      </div>
    );
  }

  const totalChapters = novel.chapters.length;
  const currentChapterNumberForDisplay = currentChapterIndex + 1;

  const CommentItem = ({ comment, depth = 0 }: { comment: StoredChapterComment; depth?: number }) => {
    const isCommentByCurrentUser = currentUser && comment.authorId === currentUser.id;
    const canCurrentUserDeleteThisComment = loggedIn && currentUserIsActive && currentUser && 
                                        (isCommentByCurrentUser || 
                                         currentUser.id === KRITIKA_USER_ID || 
                                         currentUser.id === KATHAVAULT_OWNER_USER_ID);
    const isCommentAuthorSpecialAdmin = comment.authorId === KRITIKA_USER_ID || comment.authorId === KATHAVAULT_OWNER_USER_ID;

    return (
      <div className={`flex space-x-3 mt-4 ${depth > 0 ? 'ml-4 sm:ml-6' : ''}`}>
        <Link href={currentUser && comment.authorId ? `/profile/${comment.authorId}`: '#'} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} data-ai-hint="person avatar" />
            <AvatarFallback>{comment.authorInitials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap">
              <Link href={currentUser && comment.authorId ? `/profile/${comment.authorId}`: '#'} className="hover:underline">
                <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
              </Link>
              {isCommentAuthorSpecialAdmin && (
                  <CheckCircle className="ml-1 h-3.5 w-3.5 text-blue-500 flex-shrink-0" title="Verified Admin" />
              )}
              <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
            </div>
            {canCurrentUserDeleteThisComment && (
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
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleCommentLike(comment.id)} disabled={!loggedIn || !currentUserIsActive}>
              <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isCommentLikedByUser ? 'fill-primary text-primary' : ''}`} />
              {comment.commentLikes > 0 ? comment.commentLikes : 'Like'}
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleToggleReplyInput(comment.id)} disabled={!loggedIn || !currentUserIsActive}>
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
                disabled={!loggedIn || !currentUserIsActive}
              />
              <Button type="submit" size="sm" variant="ghost" className="h-8 px-2" disabled={!loggedIn || !currentUserIsActive || !replyText.trim()}>
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
    <div className="container mx-auto px-2 sm:px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => router.push(`/story/${storyId}`)} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Story Details
        </Button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline text-primary text-center truncate max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex-grow">
          {novel.title} - {currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}
        </h1>
        <div className="w-full sm:w-auto sm:min-w-[180px] flex-shrink-0 hidden sm:block"> </div> {/* Spacer for balance */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-body text-2xl text-foreground">{currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none font-body text-foreground/90 leading-relaxed whitespace-pre-line">
            {currentChapter.content || "No content available for this chapter."}
          </article>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        {currentChapterIndex > 0 ? (
          <Button asChild variant="outline">
            <Link href={`/story/${storyId}/${currentChapterIndex}`}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous Chapter
            </Link>
          </Button>
        ) : <div className="w-[150px] hidden sm:block" />} {/* Spacer for alignment */}
        {currentChapterIndex < totalChapters - 1 ? (
          <Button asChild>
            <Link href={`/story/${storyId}/${currentChapterIndex + 2}`}>
              Next Chapter <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : <div className="w-[150px] hidden sm:block" />} {/* Spacer for alignment */}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <MessageSquare className="mr-3 h-6 w-6"/> Chapter Comments ({chapterComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
          </CardTitle>
          <CardDescription>Share your thoughts on {currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loggedIn && currentUser ? (
            <>
              <div className="space-y-3">
                {chapterComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet for this chapter. Be the first!</p>}
                {chapterComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
              <form onSubmit={handlePostNewComment} className="w-full mt-6 pt-4 border-t border-border/50 flex items-start space-x-2">
                <Avatar className="h-10 w-10 mt-1 flex-shrink-0">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="person avatar" />
                  <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-2">
                  <Textarea
                    placeholder={currentUserIsActive ? `Write a comment for ${currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}...` : "Your account is deactivated. You cannot comment."}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows={3}
                    className="font-body"
                    disabled={!currentUserIsActive}
                  />
                  <Button type="submit" disabled={!currentUserIsActive || !newCommentText.trim()}>
                    <Send className="mr-2 h-4 w-4" /> Post Comment
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Please log in to view and post comments.</p>
              <Button asChild>
                <Link href={`/login?redirect=${encodeURIComponent(`/story/${storyId}/${chapterNumParam}`)}`}>
                  <LogIn className="mr-2 h-4 w-4" /> Login to Comment
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ChapterReadingPage;
