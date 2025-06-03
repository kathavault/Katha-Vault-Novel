
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getNovelsFromStorage, type Novel, type Chapter, getStoredChapterComments, saveStoredChapterComments, type StoredChapterComment, CURRENT_USER_ID, CURRENT_USER_NAME, kathaExplorerUser, allMockUsers, isUserActive } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, Send, CornerDownRight, MoreVertical, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChapterReadingPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const storyId = typeof params.storyId === 'string' ? params.storyId : '';
  const chapterNumParam = typeof params.chapterNum === 'string' ? params.chapterNum : '';
  const currentChapterIndex = parseInt(chapterNumParam, 10) - 1; // 0-indexed

  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [chapterComments, setChapterComments] = useState<StoredChapterComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const currentUserIsActive = isUserActive(CURRENT_USER_ID);

  useEffect(() => {
    if (storyId) {
      const allNovels = getNovelsFromStorage();
      const foundNovel = allNovels.find(n => n.id === storyId);
      setNovel(foundNovel || null);
      if (foundNovel && !isNaN(currentChapterIndex) && currentChapterIndex >= 0 && currentChapterIndex < foundNovel.chapters.length) {
        const chapter = foundNovel.chapters[currentChapterIndex];
        setCurrentChapter(chapter);
        loadChapterComments(storyId, chapter.id);
      } else {
        setCurrentChapter(null);
        setChapterComments([]);
      }
    }
    setIsLoading(false);
  }, [storyId, currentChapterIndex]);

  const loadChapterComments = (novelId: string, chapterId: string) => {
    const allComments = getStoredChapterComments();
    const filtered = allComments.filter(c => c.novelId === novelId && c.chapterId === chapterId);
    setChapterComments(filtered);
  };

  const updateAndSaveComments = (updatedComments: StoredChapterComment[]) => {
    const allStoredComments = getStoredChapterComments();
    // Remove old comments for this chapter
    const otherChaptersComments = allStoredComments.filter(c => !(c.novelId === storyId && c.chapterId === currentChapter?.id));
    // Add updated comments for this chapter
    const newMasterList = [...otherChaptersComments, ...updatedComments];
    saveStoredChapterComments(newMasterList);
    setChapterComments(updatedComments); // Update local state for UI
  };

  const handlePostNewComment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    if (!newCommentText.trim() || !currentChapter) return;

    const newComment: StoredChapterComment = {
      id: `chapcomment-${Date.now()}`,
      novelId: storyId,
      chapterId: currentChapter.id,
      authorId: CURRENT_USER_ID,
      authorName: CURRENT_USER_NAME,
      authorAvatarUrl: kathaExplorerUser.avatarUrl,
      authorInitials: kathaExplorerUser.avatarFallback,
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
    if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    setReplyingToCommentId(prevId => (prevId === commentId ? null : commentId));
    setReplyText("");
  };

  const handlePostReply = (e: FormEvent<HTMLFormElement>, parentCommentId: string) => {
    e.preventDefault();
     if (!currentUserIsActive) {
      toast({ title: "Account Deactivated", description: "Your account is currently deactivated.", variant: "destructive"});
      return;
    }
    if (!replyText.trim() || !currentChapter) return;

    const newReply: StoredChapterComment = {
      id: `chapreply-${Date.now()}`,
      novelId: storyId,
      chapterId: currentChapter.id,
      authorId: CURRENT_USER_ID,
      authorName: CURRENT_USER_NAME,
      authorAvatarUrl: kathaExplorerUser.avatarUrl,
      authorInitials: kathaExplorerUser.avatarFallback,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentLikes: 0,
      isCommentLikedByUser: false,
      replies: [],
    };

    const addReplyRecursively = (comments: StoredChapterComment[]): StoredChapterComment[] => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return { ...comment, replies: [newReply, ...comment.replies] };
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
    const deleteCommentRecursively = (comments: StoredChapterComment[]): StoredChapterComment[] => {
      return comments.filter(comment => comment.id !== targetCommentId).map(comment => {
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: deleteCommentRecursively(comment.replies) };
        }
        return comment;
      });
    };
    updateAndSaveComments(deleteCommentRecursively(chapterComments));
    toast({ title: "Comment Deleted", description: "The comment has been removed." });
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading chapter...</p></div>;
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
    const isCommentByCurrentUser = comment.authorId === CURRENT_USER_ID;
    const canCurrentUserDeleteThisComment = isCommentByCurrentUser || CURRENT_USER_ID === kathaExplorerUser.id; // Admin can delete

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
                    disabled={!currentUserIsActive && !isCommentByCurrentUser} // Non-authors cannot delete if deactivated, admin still can
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Comment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
          <div className="flex items-center space-x-2 text-xs">
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleCommentLike(comment.id)} disabled={!currentUserIsActive}>
              <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isCommentLikedByUser ? 'fill-primary text-primary' : ''}`} />
              {comment.commentLikes > 0 ? comment.commentLikes : 'Like'}
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-auto text-muted-foreground hover:text-primary" onClick={() => handleToggleReplyInput(comment.id)} disabled={!currentUserIsActive}>
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
                disabled={!currentUserIsActive}
              />
              <Button type="submit" size="sm" variant="ghost" className="h-8 px-2" disabled={!currentUserIsActive || !replyText.trim()}>
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
    <div className="container mx-auto px-2 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push(`/story/${storyId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Story Details
        </Button>
        <h1 className="text-3xl md:text-4xl font-headline text-primary text-center truncate max-w-xl">
          {novel.title} - {currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}
        </h1>
        <div className="w-[180px] sm:w-[200px] flex-shrink-0"> </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-body text-2xl text-foreground">{currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <article className="prose prose-lg dark:prose-invert max-w-none font-body text-foreground/90 leading-relaxed whitespace-pre-line">
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
        ) : <div className="w-[150px]" />}
        {currentChapterIndex < totalChapters - 1 ? (
          <Button asChild>
            <Link href={`/story/${storyId}/${currentChapterIndex + 2}`}>
              Next Chapter <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : <div className="w-[150px]" />}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center">
            <MessageSquare className="mr-3 h-6 w-6"/> Chapter Comments ({chapterComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
          </CardTitle>
          <CardDescription>Share your thoughts on {currentChapter.title || `Chapter ${currentChapterNumberForDisplay}`}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {chapterComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet for this chapter. Be the first!</p>}
            {chapterComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
          <form onSubmit={handlePostNewComment} className="w-full mt-6 pt-4 border-t border-border/50 flex items-start space-x-2">
            <Avatar className="h-10 w-10 mt-1">
              <AvatarImage src={kathaExplorerUser.avatarUrl} alt={CURRENT_USER_NAME} data-ai-hint="person avatar" />
              <AvatarFallback>{kathaExplorerUser.avatarFallback}</AvatarFallback>
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
        </CardContent>
      </Card>

    </div>
  );
};

export default ChapterReadingPage;
