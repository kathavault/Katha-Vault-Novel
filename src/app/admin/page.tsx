
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as DialogModalFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovelForm } from '@/components/novel-form';
import {
  getNovelsFromStorage, saveNovelsToStorage, type Novel,
  allMockUsers, type MockUser, CURRENT_USER_ID,
  getSocialFeedPostsFromStorage, type FeedItemCardProps, type FeedItemComment, SOCIAL_FEED_POSTS_STORAGE_KEY, USER_POSTS_STORAGE_KEY,
  getStoredChapterComments, saveStoredChapterComments, type StoredChapterComment,
  getKathaExplorerUser,
  isUserActive,
  KRITIKA_EMAIL, KATHAVAULT_OWNER_EMAIL,
  isUserLoggedIn, isUserAdmin // Import new auth functions
} from '@/lib/mock-data';
import { PlusCircle, Edit, Trash2, ShieldCheck, Eye, BookOpen, LayoutGrid, Badge, UserCog, UserX, UserCheck as UserCheckIcon, Search, MessageSquareText, BookText, Users, ListFilter, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

interface FlatPostComment extends FeedItemComment {
  postId: string;
  postTitleOrContent: string;
  originalPostType: 'forum' | 'social';
}

interface FlatChapterComment extends StoredChapterComment {
  novelTitleAdmin: string;
  chapterTitleAdmin: string;
}

const ITEMS_PER_PAGE_INITIAL = 10;

export default function AdminPage() {
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  const [adminUser, setAdminUser] = useState<MockUser | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial auth check

  const [novels, setNovels] = useState<Novel[]>([]);
  const [novelSearchTerm, setNovelSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showAllNovels, setShowAllNovels] = useState(false);

  const [users, setUsers] = useState<MockUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);

  const [allSocialPosts, setAllSocialPosts] = useState<FeedItemCardProps[]>([]);
  const [flatPostComments, setFlatPostComments] = useState<FlatPostComment[]>([]);
  const [postCommentSearchTerm, setPostCommentSearchTerm] = useState("");
  const [postCommentToDelete, setPostCommentToDelete] = useState<FlatPostComment | null>(null);
  const [isDeletePostCommentDialogOpen, setIsDeletePostCommentDialogOpen] = useState(false);
  const [showAllPostComments, setShowAllPostComments] = useState(false);

  const [allChapterComments, setAllChapterComments] = useState<StoredChapterComment[]>([]);
  const [flatChapterComments, setFlatChapterComments] = useState<FlatChapterComment[]>([]);
  const [chapterCommentSearchTerm, setChapterCommentSearchTerm] = useState("");
  const [chapterCommentToDelete, setChapterCommentToDelete] = useState<FlatChapterComment | null>(null);
  const [isDeleteChapterCommentDialogOpen, setIsDeleteChapterCommentDialogOpen] = useState(false);
  const [showAllChapterComments, setShowAllChapterComments] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure router and localStorage are available
      if (!isUserLoggedIn()) {
        router.replace('/login?redirect=/admin');
        return;
      } else if (!isUserAdmin()) {
        toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
        router.replace('/');
        return;
      }
      // User is logged in and is an admin
      const currentUser = getKathaExplorerUser();
      setAdminUser(currentUser);

      const loadedNovels = getNovelsFromStorage();
      setNovels(loadedNovels);
      loadPostComments();
      loadChapterComments(loadedNovels);

      let baseUsers = [...allMockUsers];
      const adminIndex = baseUsers.findIndex(u => u.id === currentUser.id);
      if (adminIndex !== -1) {
        baseUsers[adminIndex] = currentUser;
      } else {
        if (!baseUsers.find(u => u.id === currentUser.id)) {
           baseUsers.push(currentUser);
        }
      }
      setUsers(baseUsers.filter((user, index, self) => index === self.findIndex(u => u.id === user.id)));
      setIsLoadingPage(false); // Content can now be loaded
    }
  }, [router, toast]);


  const loadPostComments = () => {
    const posts = getSocialFeedPostsFromStorage();
    setAllSocialPosts(posts);
    const flattened: FlatPostComment[] = [];
    posts.forEach(post => {
      function extractComments(comments: FeedItemComment[], postId: string, postContext: string, postType: 'forum' | 'social') {
        comments.forEach(comment => {
          flattened.push({ ...comment, postId, postTitleOrContent: postContext, originalPostType: postType });
          if (comment.replies && comment.replies.length > 0) {
            extractComments(comment.replies, postId, postContext, postType);
          }
        });
      }
      extractComments(post.comments, post.id, post.title || post.mainText.substring(0, 50) + "...", post.postType);
    });
    setFlatPostComments(flattened.sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp) || 0));
  };

  const loadChapterComments = (currentNovels: Novel[]) => {
    const chapterCommentsData = getStoredChapterComments();
    setAllChapterComments(chapterCommentsData);
    const flattened: FlatChapterComment[] = [];

    const extractChapterCommentsRecursively = (comments: StoredChapterComment[], novel: globalThis.Novel, chapter: globalThis.Chapter) => {
        comments.forEach(comment => {
            flattened.push({
                ...comment,
                novelTitleAdmin: novel.title,
                chapterTitleAdmin: chapter.title,
            });
            if (comment.replies && comment.replies.length > 0) {
                 extractChapterCommentsRecursively(comment.replies, novel, chapter);
            }
        });
    };

    chapterCommentsData.forEach(topLevelComment => {
        const novel = currentNovels.find(n => n.id === topLevelComment.novelId);
        const chapter = novel?.chapters.find(ch => ch.id === topLevelComment.chapterId);
        if (novel && chapter) {
             flattened.push({
                ...topLevelComment,
                novelTitleAdmin: novel.title,
                chapterTitleAdmin: chapter.title,
            });
            if (topLevelComment.replies && topLevelComment.replies.length > 0) {
                 extractChapterCommentsRecursively(topLevelComment.replies, novel, chapter);
            }
        }
    });
    setFlatChapterComments(flattened.sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp) || 0));
  };

  const filteredNovels = useMemo(() => {
    let results = novels;
    if (novelSearchTerm.trim()) {
      const lowerSearchTerm = novelSearchTerm.toLowerCase();
      results = results.filter(novel =>
        novel.title.toLowerCase().includes(lowerSearchTerm) ||
        novel.author.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return results.sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [novels, novelSearchTerm]);
  const displayedNovels = showAllNovels ? filteredNovels : filteredNovels.slice(0, ITEMS_PER_PAGE_INITIAL);


  const handleOpenAddForm = () => { setEditingNovel(null); setIsFormModalOpen(true); };
  const handleOpenEditForm = (novel: Novel) => { setEditingNovel(novel); setIsFormModalOpen(true); };

  const handleNovelFormSubmit = (data: Omit<Novel, 'id' | 'views' | 'rating' | 'isTrending'> & { chapters?: Novel['chapters'] }) => {
    let updatedNovels;
    if (editingNovel) {
      updatedNovels = novels.map(n => (n.id === editingNovel.id ? {
        ...n, ...data,
        chapters: data.chapters || editingNovel.chapters || [],
        views: n.views || 0,
        rating: n.rating || 0,
        isTrending: n.isTrending || false
      } : n));
    } else {
      const newNovelWithDefaults: Novel = {
        ...data,
        id: `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        views: 0, rating: 0, chapters: data.chapters || [], isTrending: false,
      };
      updatedNovels = [...novels, newNovelWithDefaults];
    }
    setNovels(updatedNovels);
    saveNovelsToStorage(updatedNovels);
    setIsFormModalOpen(false);
    setEditingNovel(null);
    loadChapterComments(updatedNovels);
  };

  const promptDeleteNovel = (novel: Novel) => { setNovelToDelete(novel); setIsDeleteDialogOpen(true); };
  const confirmDeleteNovel = () => {
    if (novelToDelete) {
      const updatedNovels = novels.filter(n => n.id !== novelToDelete.id);
      setNovels(updatedNovels);
      saveNovelsToStorage(updatedNovels);
      toast({ title: "Novel Deleted", description: `"${novelToDelete.title}" removed.`, variant: "destructive" });
      setNovelToDelete(null); setIsDeleteDialogOpen(false);
      loadChapterComments(updatedNovels);
    }
  };

  const filteredUsers = useMemo(() => {
    let results = [...users]; // Use the state `users` which is set after adminUser

    if (adminUser) { // Ensure adminUser is populated from state
        const currentAdminInListIdx = results.findIndex(u => u.id === adminUser.id);
        if (currentAdminInListIdx !== -1) {
            results[currentAdminInListIdx] = adminUser; 
        } else {
             if (!results.find(u => u.id === adminUser.id)) {
                 results.push(adminUser);
             }
        }
    }
    // Ensure unique users by ID
    results = results.filter((user, index, self) => index === self.findIndex(u => u.id === user.id));


    if (userSearchTerm.trim()) {
      const lowerSearchTerm = userSearchTerm.toLowerCase();
      results = results.filter(user =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        (user.username && user.username.toLowerCase().includes(lowerSearchTerm)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return results;
  }, [userSearchTerm, adminUser, users]);
  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, ITEMS_PER_PAGE_INITIAL);


  const handleToggleUserStatus = (userIdToToggle: string) => {
    const targetUser = users.find(u => u.id === userIdToToggle);
    if (!targetUser) return;

    if (targetUser.email === KRITIKA_EMAIL || targetUser.email === KATHAVAULT_OWNER_EMAIL) {
        toast({ title: "Action Denied", description: "This special admin account cannot be deactivated.", variant: "destructive"});
        return;
    }
    if (targetUser.id === adminUser?.id) { // Use adminUser from state
      toast({ title: "Action Denied", description: "Admin cannot change own status directly here.", variant: "destructive" }); return;
    }

    const updatedUsers = users.map(user =>
        user.id === userIdToToggle ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
    
    const changedUser = updatedUsers.find(u => u.id === userIdToToggle);
    if (changedUser) {
        const mockUserToUpdateInAll = allMockUsers.find(u => u.id === userIdToToggle);
        if (mockUserToUpdateInAll) {
            mockUserToUpdateInAll.isActive = changedUser.isActive; 
            // This change to allMockUsers is for in-memory consistency for this session
            // A proper backend would handle global user state.
            toast({ title: "User Status Updated", description: `${changedUser.name} is now ${changedUser.isActive ? "Active" : "Deactivated"}.` });
        }
    }
  };

   const filteredPostComments = useMemo(() => {
    let results = flatPostComments;
    if (postCommentSearchTerm.trim()) {
      const lowerSearchTerm = postCommentSearchTerm.toLowerCase();
      results = results.filter(comment =>
        comment.text.toLowerCase().includes(lowerSearchTerm) ||
        comment.authorName.toLowerCase().includes(lowerSearchTerm) ||
        comment.postTitleOrContent.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return results;
  }, [flatPostComments, postCommentSearchTerm]);
  const displayedPostComments = showAllPostComments ? filteredPostComments : filteredPostComments.slice(0, ITEMS_PER_PAGE_INITIAL);


  const promptDeletePostComment = (comment: FlatPostComment) => {
    setPostCommentToDelete(comment);
    setIsDeletePostCommentDialogOpen(true);
  };

  const confirmDeletePostComment = () => {
    if (!postCommentToDelete) return;

    const updatedSocialPosts = allSocialPosts.map(post => {
      if (post.id === postCommentToDelete.postId) {
        const deleteCommentRecursively = (comments: FeedItemComment[], targetId: string): FeedItemComment[] => {
          return comments
            .filter(c => c.id !== targetId)
            .map(c => ({
              ...c,
              replies: c.replies ? deleteCommentRecursively(c.replies, targetId) : [],
            }));
        };
        return { ...post, comments: deleteCommentRecursively(post.comments, postCommentToDelete.id) };
      }
      return post;
    });
    setAllSocialPosts(updatedSocialPosts);
    if(typeof window !== 'undefined') localStorage.setItem(SOCIAL_FEED_POSTS_STORAGE_KEY, JSON.stringify(updatedSocialPosts));

    const postAuthorId = allSocialPosts.find(p => p.id === postCommentToDelete.postId)?.authorId;
    if (postAuthorId === CURRENT_USER_ID) { // Should be adminUser.id if admin deletes own post's comment
        const userPostsRaw = typeof window !== 'undefined' ? localStorage.getItem(USER_POSTS_STORAGE_KEY) : null;
        if (userPostsRaw) {
            let userPostsData: FeedItemCardProps[] = JSON.parse(userPostsRaw);
            userPostsData = userPostsData.map(post => {
                if (post.id === postCommentToDelete.postId) {
                     const deleteCommentRecursively = (comments: FeedItemComment[], targetId: string): FeedItemComment[] => {
                        return comments
                            .filter(c => c.id !== targetId)
                            .map(c => ({
                            ...c,
                            replies: c.replies ? deleteCommentRecursively(c.replies, targetId) : [],
                            }));
                    };
                    return { ...post, comments: deleteCommentRecursively(post.comments, postCommentToDelete.id) };
                }
                return post;
            });
           if(typeof window !== 'undefined') localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(userPostsData));
        }
    }

    loadPostComments();
    toast({ title: "Post Comment Deleted", description: `Comment by ${postCommentToDelete.authorName} removed.`, variant: "destructive" });
    setPostCommentToDelete(null);
    setIsDeletePostCommentDialogOpen(false);
  };

  const filteredChapterComments = useMemo(() => {
    let results = flatChapterComments;
    if (chapterCommentSearchTerm.trim()) {
      const lowerSearchTerm = chapterCommentSearchTerm.toLowerCase();
      results = results.filter(comment =>
        comment.text.toLowerCase().includes(lowerSearchTerm) ||
        comment.authorName.toLowerCase().includes(lowerSearchTerm) ||
        (comment.novelTitleAdmin && comment.novelTitleAdmin.toLowerCase().includes(lowerSearchTerm)) ||
        (comment.chapterTitleAdmin && comment.chapterTitleAdmin.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return results;
  }, [flatChapterComments, chapterCommentSearchTerm]);
  const displayedChapterComments = showAllChapterComments ? filteredChapterComments : filteredChapterComments.slice(0, ITEMS_PER_PAGE_INITIAL);


  const promptDeleteChapterComment = (comment: FlatChapterComment) => {
    setChapterCommentToDelete(comment);
    setIsDeleteChapterCommentDialogOpen(true);
  };

  const confirmDeleteChapterComment = () => {
    if (!chapterCommentToDelete) return;

    function filterRecursively(comments: StoredChapterComment[], targetId: string): StoredChapterComment[] {
      return comments
        .filter(comment => comment.id !== targetId)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? filterRecursively(comment.replies, targetId) : [],
        }));
    }

    const currentAllChapterComments = getStoredChapterComments();
    const updatedStoredChapterComments = filterRecursively(currentAllChapterComments, chapterCommentToDelete.id);

    saveStoredChapterComments(updatedStoredChapterComments);
    loadChapterComments(novels); // Reload with current novels
    toast({ title: "Chapter Comment Deleted", description: `Comment by ${chapterCommentToDelete.authorName} removed.`, variant: "destructive" });
    setChapterCommentToDelete(null);
    setIsDeleteChapterCommentDialogOpen(false);
  };


  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Verifying access...</div>;
  }

  if (!adminUser) { // Should not happen if isLoadingPage is false and checks pass
    return <div className="flex justify-center items-center h-screen">Error: Admin user data not available.</div>;
  }


  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <ShieldCheck className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Admin Panel</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Manage site content and users. Welcome, {adminUser ? adminUser.name : 'Admin'}!
        </p>
      </header>

      <Tabs defaultValue="novels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="novels"><BookText className="mr-2 h-5 w-5" />Manage Novels</TabsTrigger>
          <TabsTrigger value="comments"><MessageSquareText className="mr-2 h-5 w-5" />Manage Comments</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-5 w-5" />Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="novels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <BookOpen className="mr-3 h-6 w-6" /> Novels Overview
              </CardTitle>
              <CardDescription>View, add, edit, or delete novels. Configure Home Page layout.</CardDescription>
              <div className="pt-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search novels by title or author..."
                  value={novelSearchTerm}
                  onChange={(e) => setNovelSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {displayedNovels.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{novelSearchTerm ? "No novels found." : "No novels available."}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right w-[180px]">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {displayedNovels.map((novel) => (
                        <TableRow key={novel.id}>
                          <TableCell className="font-medium max-w-[200px] truncate" title={novel.title}>{novel.title}</TableCell>
                          <TableCell><Badge variant={novel.status === 'published' ? 'default' : 'secondary'} className="capitalize">{novel.status}</Badge></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" asChild title="View Novel"><Link href={`/story/${novel.id}`} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4 text-blue-500" /></Link></Button>
                            <Button variant="ghost" size="icon" asChild title="Manage Chapters"><Link href={`/admin/novel/${novel.id}/chapters`}><BookOpen className="h-4 w-4 text-green-500" /></Link></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditForm(novel)} title="Edit Novel"><Edit className="h-4 w-4 text-yellow-500" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => promptDeleteNovel(novel)} title="Delete Novel"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredNovels.length > ITEMS_PER_PAGE_INITIAL && (
                <div className="mt-4 text-center">
                  <Button variant="link" onClick={() => setShowAllNovels(!showAllNovels)}>
                    {showAllNovels ? "Show Less" : `Show All ${filteredNovels.length} Novels`}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <Button onClick={handleOpenAddForm} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-5 w-5" /> Add New Novel</Button>
              <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/admin/home-layout"><LayoutGrid className="mr-2 h-5 w-5" /> Configure Home</Link></Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><MessageSquareText className="mr-3 h-6 w-6" /> Comments Moderation</CardTitle>
                <CardDescription>Review and moderate comments from posts and chapters.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="post-comments" className="w-full">
                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="post-comments">Post Comments</TabsTrigger><TabsTrigger value="chapter-comments">Chapter Comments</TabsTrigger></TabsList>

                    <TabsContent value="post-comments" className="pt-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search post comments (text, author, post)..." value={postCommentSearchTerm} onChange={(e) => setPostCommentSearchTerm(e.target.value)} className="pl-9" />
                        </div>
                        {displayedPostComments.length === 0 ? <p className="text-muted-foreground text-center py-6">{postCommentSearchTerm ? "No post comments match search." : "No post comments."}</p> : (
                            <Table>
                                <TableHeader><TableRow><TableHead>Author</TableHead><TableHead className="max-w-md">Comment</TableHead><TableHead>Post Context</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                {displayedPostComments.map((comment) => (
                                    <TableRow key={`${comment.postId}-${comment.id}`}>
                                    <TableCell className="max-w-[100px] truncate" title={comment.authorName}>{comment.authorName}</TableCell>
                                    <TableCell className="max-w-md text-sm whitespace-normal break-words" title={comment.text}>{comment.text}</TableCell>
                                    <TableCell className="max-w-[150px] truncate" title={comment.postTitleOrContent}>{comment.postTitleOrContent}</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => promptDeletePostComment(comment)} title="Delete Comment"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        )}
                        {filteredPostComments.length > ITEMS_PER_PAGE_INITIAL && (
                            <div className="mt-4 text-center">
                            <Button variant="link" onClick={() => setShowAllPostComments(!showAllPostComments)}>
                                {showAllPostComments ? "Show Less" : `Show All ${filteredPostComments.length} Post Comments`}
                            </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="chapter-comments" className="pt-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search chapter comments (text, author, novel, chapter)..." value={chapterCommentSearchTerm} onChange={(e) => setChapterCommentSearchTerm(e.target.value)} className="pl-9"/>
                        </div>
                        {displayedChapterComments.length === 0 ? <p className="text-muted-foreground text-center py-6">{chapterCommentSearchTerm ? "No chapter comments match search." : "No chapter comments."}</p> : (
                            <Table>
                                <TableHeader><TableRow><TableHead>User</TableHead><TableHead className="max-w-md">Comment</TableHead><TableHead>Context (Novel - Chapter)</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                {displayedChapterComments.map((comment) => (
                                    <TableRow key={comment.id}>
                                    <TableCell className="max-w-[100px] truncate" title={comment.authorName}>{comment.authorName}</TableCell>
                                    <TableCell className="max-w-md text-sm whitespace-normal break-words" title={comment.text}>{comment.text}</TableCell>
                                    <TableCell className="max-w-[180px] truncate" title={`${comment.novelTitleAdmin} - ${comment.chapterTitleAdmin}`}>{`${comment.novelTitleAdmin?.substring(0,20)}... - ${comment.chapterTitleAdmin?.substring(0,20)}...`}</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => promptDeleteChapterComment(comment)} title="Delete Comment"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        )}
                         {filteredChapterComments.length > ITEMS_PER_PAGE_INITIAL && (
                            <div className="mt-4 text-center">
                            <Button variant="link" onClick={() => setShowAllChapterComments(!showAllChapterComments)}>
                                {showAllChapterComments ? "Show Less" : `Show All ${filteredChapterComments.length} Chapter Comments`}
                            </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><UserCog className="mr-3 h-6 w-6" /> User Management</CardTitle>
                <CardDescription>Activate or deactivate user accounts. Special admin accounts cannot be deactivated.</CardDescription>
                <div className="pt-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users by name, username or email..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="pl-9" />
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                {displayedUsers.length === 0 ? <p className="text-muted-foreground text-center py-8">{userSearchTerm ? "No users found." : "No users available."}</p> : (
                <div className="overflow-x-auto">
                <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right w-[140px]">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {displayedUsers.map((user) => {
                        const isSpecialAdmin = user.email === KRITIKA_EMAIL || user.email === KATHAVAULT_OWNER_EMAIL;
                        const cannotBeDeactivated = isSpecialAdmin || user.id === adminUser?.id;
                        return (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium max-w-[200px] truncate" title={`${user.name} (${user.username || 'N/A'})`}>
                            {user.name} {user.id === adminUser?.id && "(Current Admin)"}
                            {isSpecialAdmin && user.id !== adminUser?.id && " (Special Admin)"}
                        </TableCell>
                        <TableCell><Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? 'Active' : 'Deactivated'}</Badge></TableCell>
                        <TableCell className="text-right">
                            {!cannotBeDeactivated ? (
                            <Button variant={user.isActive ? "destructive" : "default"} size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                                {user.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheckIcon className="mr-2 h-4 w-4" />}
                                {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            ) : <Badge variant="outline" className="text-xs">Protected</Badge>}
                        </TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </div>
                )}
                {filteredUsers.length > ITEMS_PER_PAGE_INITIAL && (
                    <div className="mt-4 text-center">
                    <Button variant="link" onClick={() => setShowAllUsers(!showAllUsers)}>
                        {showAllUsers ? "Show Less" : `Show All ${filteredUsers.length} Users`}
                    </Button>
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Novel Form Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => { setIsFormModalOpen(isOpen); if (!isOpen) setEditingNovel(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-headline text-2xl text-primary">{editingNovel ? 'Edit Novel Details' : 'Add New Novel'}</DialogTitle><DialogDescription>{editingNovel ? `Modify details for "${editingNovel.title}".` : 'Fill in details. Chapters after creation.'}</DialogDescription></DialogHeader><div className="py-4"><NovelForm initialData={editingNovel} onSubmitForm={handleNovelFormSubmit} submitButtonText={editingNovel ? 'Save Changes' : 'Add Novel'} onCancel={() => { setIsFormModalOpen(false); setEditingNovel(null); }} /></div></DialogContent>
      </Dialog>

      {/* Delete Novel Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Delete novel "{novelToDelete?.title}"? This also deletes chapters and cannot be undone.</DialogDescription></DialogHeader><DialogModalFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeleteNovel}>Delete</Button></DialogModalFooter></DialogContent></Dialog>

      {/* Delete Post Comment Confirmation */}
      <Dialog open={isDeletePostCommentDialogOpen} onOpenChange={setIsDeletePostCommentDialogOpen}><DialogContent><DialogHeader><DialogTitle>Confirm Post Comment Deletion</DialogTitle><DialogDescription>Delete comment by "{postCommentToDelete?.authorName}": "{postCommentToDelete?.text.substring(0,50)}..."? Cannot be undone.</DialogDescription></DialogHeader><DialogModalFooter><Button variant="outline" onClick={() => setIsDeletePostCommentDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeletePostComment}>Delete</Button></DialogModalFooter></DialogContent></Dialog>

      {/* Delete Chapter Comment Confirmation */}
      <Dialog open={isDeleteChapterCommentDialogOpen} onOpenChange={setIsDeleteChapterCommentDialogOpen}><DialogContent><DialogHeader><DialogTitle>Confirm Chapter Comment Deletion</DialogTitle><DialogDescription>Delete chapter comment by "{chapterCommentToDelete?.authorName}": "{chapterCommentToDelete?.text.substring(0,50)}..."? Cannot be undone.</DialogDescription></DialogHeader><DialogModalFooter><Button variant="outline" onClick={() => setIsDeleteChapterCommentDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeleteChapterComment}>Delete</Button></DialogModalFooter></DialogContent></Dialog>
    </div>
  );
}
