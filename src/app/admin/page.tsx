
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  getSimulatedChapterCommentsFromStorage, saveSimulatedChapterCommentsToStorage, type SimulatedChapterComment
} from '@/lib/mock-data';
import { PlusCircle, Edit, Trash2, ShieldCheck, Eye, BookOpen, LayoutGrid, Badge, UserCog, UserX, UserCheck as UserCheckIcon, Search, MessageSquareText, ListFilter, BookText, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

interface FlatPostComment extends FeedItemComment {
  postId: string;
  postTitleOrContent: string; // Title for forum, mainText for social
  originalPostType: 'forum' | 'social';
}

export default function AdminPage() {
  const { toast } = useToast();
  
  // Novels state
  const [novels, setNovels] = useState<Novel[]>([]);
  const [novelSearchTerm, setNovelSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Users state
  const [users, setUsers] = useState<MockUser[]>(allMockUsers);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Post Comments state
  const [allSocialPosts, setAllSocialPosts] = useState<FeedItemCardProps[]>([]);
  const [flatPostComments, setFlatPostComments] = useState<FlatPostComment[]>([]);
  const [postCommentSearchTerm, setPostCommentSearchTerm] = useState("");
  const [postCommentToDelete, setPostCommentToDelete] = useState<FlatPostComment | null>(null);
  const [isDeletePostCommentDialogOpen, setIsDeletePostCommentDialogOpen] = useState(false);

  // Chapter Comments state
  const [simulatedChapterComments, setSimulatedChapterComments] = useState<SimulatedChapterComment[]>([]);
  const [chapterCommentSearchTerm, setChapterCommentSearchTerm] = useState("");
  const [chapterCommentToDelete, setChapterCommentToDelete] = useState<SimulatedChapterComment | null>(null);
  const [isDeleteChapterCommentDialogOpen, setIsDeleteChapterCommentDialogOpen] = useState(false);


  useEffect(() => {
    setNovels(getNovelsFromStorage());
    loadPostComments();
    setSimulatedChapterComments(getSimulatedChapterCommentsFromStorage());
  }, []);

  const loadPostComments = () => {
    const posts = getSocialFeedPostsFromStorage();
    setAllSocialPosts(posts);
    const flattened: FlatPostComment[] = [];
    posts.forEach(post => {
      function extractComments(comments: FeedItemComment[], postId: string, postContext: string, postType: 'forum' | 'social') {
        comments.forEach(comment => {
          flattened.push({ ...comment, postId, postTitleOrContent: postContext, originalPostType: postType });
          if (comment.replies && comment.replies.length > 0) {
            extractComments(comment.replies, postId, postContext, postType); // Recursively add replies, they'll share the same top-level post context
          }
        });
      }
      extractComments(post.comments, post.id, post.title || post.mainText.substring(0, 50) + "...", post.postType);
    });
    setFlatPostComments(flattened);
  };
  

  // Novels Management
  const filteredNovels = useMemo(() => {
    if (!novelSearchTerm.trim()) return novels;
    const lowerSearchTerm = novelSearchTerm.toLowerCase();
    return novels.filter(novel => 
      novel.title.toLowerCase().includes(lowerSearchTerm) ||
      novel.author.toLowerCase().includes(lowerSearchTerm)
    );
  }, [novels, novelSearchTerm]);

  const handleOpenAddForm = () => { setEditingNovel(null); setIsFormModalOpen(true); };
  const handleOpenEditForm = (novel: Novel) => { setEditingNovel(novel); setIsFormModalOpen(true); };

  const handleNovelFormSubmit = (data: Omit<Novel, 'chapters' | 'id' | 'views' | 'rating' | 'isTrending'> & { chapters?: Novel['chapters'] }) => {
    let updatedNovels;
    if (editingNovel) {
      updatedNovels = novels.map(n => (n.id === editingNovel.id ? { 
        ...n, ...data, chapters: editingNovel.chapters, 
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
  };

  const promptDeleteNovel = (novel: Novel) => { setNovelToDelete(novel); setIsDeleteDialogOpen(true); };
  const confirmDeleteNovel = () => {
    if (novelToDelete) {
      const updatedNovels = novels.filter(n => n.id !== novelToDelete.id);
      setNovels(updatedNovels);
      saveNovelsToStorage(updatedNovels);
      toast({ title: "Novel Deleted", description: `"${novelToDelete.title}" removed.`, variant: "destructive" });
      setNovelToDelete(null); setIsDeleteDialogOpen(false);
    }
  };

  // Users Management
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return users;
    const lowerSearchTerm = userSearchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerSearchTerm) ||
      user.username.toLowerCase().includes(lowerSearchTerm)
    );
  }, [users, userSearchTerm]);

  const handleToggleUserStatus = (userId: string) => {
    if (userId === CURRENT_USER_ID) {
      toast({ title: "Action Denied", description: "Admin cannot change own status.", variant: "destructive" }); return;
    }
    const updatedUsers = users.map(user => user.id === userId ? { ...user, isActive: !user.isActive } : user);
    setUsers(updatedUsers); 
    const targetUser = updatedUsers.find(u => u.id === userId);
    toast({ title: "User Status Updated", description: `${targetUser?.name} is now ${targetUser?.isActive ? "Active" : "Deactivated"}. (Change is for current session only)` });
  };

  // Post Comments Management
   const filteredPostComments = useMemo(() => {
    if (!postCommentSearchTerm.trim()) return flatPostComments;
    const lowerSearchTerm = postCommentSearchTerm.toLowerCase();
    return flatPostComments.filter(comment =>
      comment.text.toLowerCase().includes(lowerSearchTerm) ||
      comment.authorName.toLowerCase().includes(lowerSearchTerm) ||
      comment.postTitleOrContent.toLowerCase().includes(lowerSearchTerm)
    );
  }, [flatPostComments, postCommentSearchTerm]);

  const promptDeletePostComment = (comment: FlatPostComment) => {
    setPostCommentToDelete(comment);
    setIsDeletePostCommentDialogOpen(true);
  };

  const confirmDeletePostComment = () => {
    if (!postCommentToDelete) return;

    // 1. Update allSocialPosts
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

    // 2. Update USER_POSTS_STORAGE_KEY if necessary
    const postAuthorId = allSocialPosts.find(p => p.id === postCommentToDelete.postId)?.authorId;
    if (postAuthorId === CURRENT_USER_ID) { // Assuming current user is kathaExplorerUser for USER_POSTS_STORAGE_KEY
        const userPostsRaw = typeof window !== 'undefined' ? localStorage.getItem(USER_POSTS_STORAGE_KEY) : null;
        if (userPostsRaw) {
            let userPosts: FeedItemCardProps[] = JSON.parse(userPostsRaw);
            userPosts = userPosts.map(post => {
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
           if(typeof window !== 'undefined') localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(userPosts));
        }
    }
    
    loadPostComments(); // Refresh flatPostComments list
    toast({ title: "Post Comment Deleted", description: `Comment by ${postCommentToDelete.authorName} removed.`, variant: "destructive" });
    setPostCommentToDelete(null);
    setIsDeletePostCommentDialogOpen(false);
  };


  // Chapter Comments Management
  const filteredChapterComments = useMemo(() => {
    if (!chapterCommentSearchTerm.trim()) return simulatedChapterComments;
    const lowerSearchTerm = chapterCommentSearchTerm.toLowerCase();
    return simulatedChapterComments.filter(comment => 
      comment.text.toLowerCase().includes(lowerSearchTerm) ||
      comment.userName.toLowerCase().includes(lowerSearchTerm) ||
      comment.novelTitle.toLowerCase().includes(lowerSearchTerm) ||
      comment.chapterTitle.toLowerCase().includes(lowerSearchTerm)
    );
  }, [simulatedChapterComments, chapterCommentSearchTerm]);
  
  const promptDeleteChapterComment = (comment: SimulatedChapterComment) => {
    setChapterCommentToDelete(comment);
    setIsDeleteChapterCommentDialogOpen(true);
  };

  const confirmDeleteChapterComment = () => {
    if (chapterCommentToDelete) {
      const updatedComments = simulatedChapterComments.filter(c => c.id !== chapterCommentToDelete.id);
      setSimulatedChapterComments(updatedComments);
      saveSimulatedChapterCommentsToStorage(updatedComments);
      toast({ title: "Chapter Comment Deleted", description: `Comment by ${chapterCommentToDelete.userName} removed.`, variant: "destructive" });
      setChapterCommentToDelete(null);
      setIsDeleteChapterCommentDialogOpen(false);
    }
  };


  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <ShieldCheck className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Admin Panel</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Manage site content and users.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Manage Novels */}
        <Card className="lg:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <BookOpen className="mr-3 h-6 w-6" /> Manage Novels
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
            {filteredNovels.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No novels found matching your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right w-[180px]">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredNovels.map((novel) => (
                      <TableRow key={novel.id}>
                        <TableCell className="font-medium max-w-[150px] truncate" title={novel.title}>{novel.title}</TableCell>
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
          </CardContent>
          <CardFooter className="mt-auto border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <Button onClick={handleOpenAddForm} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-5 w-5" /> Add New Novel</Button>
            <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/admin/home-layout"><LayoutGrid className="mr-2 h-5 w-5" /> Configure Home</Link></Button>
          </CardFooter>
        </Card>

        {/* Column 2: Manage Comments */}
        <Card className="lg:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><MessageSquareText className="mr-3 h-6 w-6" /> Manage Comments</CardTitle>
            <CardDescription>Review and moderate comments from posts and chapters.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <Tabs defaultValue="post-comments" className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="post-comments">Post Comments</TabsTrigger><TabsTrigger value="chapter-comments">Chapter Comments</TabsTrigger></TabsList>
              
              <TabsContent value="post-comments" className="flex-grow overflow-y-auto mt-0">
                <div className="pt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search post comments..." value={postCommentSearchTerm} onChange={(e) => setPostCommentSearchTerm(e.target.value)} className="pl-9" />
                  </div>
                  {filteredPostComments.length === 0 ? <p className="text-muted-foreground text-center py-6">No post comments match.</p> : (
                    <Table><TableHeader><TableRow><TableHead>Author</TableHead><TableHead>Comment</TableHead><TableHead>Post Context</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredPostComments.map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell className="max-w-[100px] truncate" title={comment.authorName}>{comment.authorName}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={comment.text}>{comment.text}</TableCell>
                            <TableCell className="max-w-[120px] truncate" title={comment.postTitleOrContent}>{comment.postTitleOrContent}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => promptDeletePostComment(comment)} title="Delete Comment"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chapter-comments" className="flex-grow overflow-y-auto mt-0">
                 <div className="pt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search chapter comments..." value={chapterCommentSearchTerm} onChange={(e) => setChapterCommentSearchTerm(e.target.value)} className="pl-9"/>
                  </div>
                  {filteredChapterComments.length === 0 ? <p className="text-muted-foreground text-center py-6">No chapter comments match. (Simulated)</p> : (
                    <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Comment</TableHead><TableHead>Chapter</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredChapterComments.map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell className="max-w-[80px] truncate" title={comment.userName}>{comment.userName}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={comment.text}>{comment.text}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={`${comment.novelTitle} - ${comment.chapterTitle}`}>{`${comment.novelTitle.substring(0,15)}... - ${comment.chapterTitle.substring(0,15)}...`}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => promptDeleteChapterComment(comment)} title="Delete Comment"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Column 3: Manage Users */}
        <Card className="lg:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><UserCog className="mr-3 h-6 w-6" /> Manage Users</CardTitle>
            <CardDescription>Activate or deactivate user accounts. (Status changes for current session only)</CardDescription>
             <div className="pt-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users by name/username..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            {filteredUsers.length === 0 ? <p className="text-muted-foreground text-center py-8">No users found matching your search.</p> : (
              <div className="overflow-x-auto">
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right w-[140px]">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium max-w-[150px] truncate" title={user.name}>{user.name} {user.id === CURRENT_USER_ID && "(Admin)"}</TableCell>
                      <TableCell><Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? 'Active' : 'Deactivated'}</Badge></TableCell>
                      <TableCell className="text-right">
                        {user.id !== CURRENT_USER_ID ? (
                          <Button variant={user.isActive ? "destructive" : "default"} size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                            {user.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheckIcon className="mr-2 h-4 w-4" />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        ) : <span className="text-xs text-muted-foreground">N/A</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Novel Form Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => { setIsFormModalOpen(isOpen); if (!isOpen) setEditingNovel(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-headline text-2xl text-primary">{editingNovel ? 'Edit Novel Details' : 'Add New Novel'}</DialogTitle><DialogDescription>{editingNovel ? `Modify details for "${editingNovel.title}".` : 'Fill in details. Chapters after creation.'}</DialogDescription></DialogHeader><div className="py-4"><NovelForm initialData={editingNovel} onSubmitForm={handleNovelFormSubmit} submitButtonText={editingNovel ? 'Save Changes' : 'Add Novel'} onCancel={() => { setIsFormModalOpen(false); setEditingNovel(null); }} /></div></DialogContent>
      </Dialog>

      {/* Delete Novel Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>Delete novel "{novelToDelete?.title}"? This also deletes chapters and cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeleteNovel}>Delete</Button></DialogFooter></DialogContent></Dialog>
    
      {/* Delete Post Comment Confirmation */}
      <Dialog open={isDeletePostCommentDialogOpen} onOpenChange={setIsDeletePostCommentDialogOpen}><DialogContent><DialogHeader><DialogTitle>Confirm Post Comment Deletion</DialogTitle><DialogDescription>Delete comment by "{postCommentToDelete?.authorName}": "{postCommentToDelete?.text.substring(0,50)}..."? Cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeletePostCommentDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeletePostComment}>Delete</Button></DialogFooter></DialogContent></Dialog>

      {/* Delete Chapter Comment Confirmation */}
      <Dialog open={isDeleteChapterCommentDialogOpen} onOpenChange={setIsDeleteChapterCommentDialogOpen}><DialogContent><DialogHeader><DialogTitle>Confirm Chapter Comment Deletion</DialogTitle><DialogDescription>Delete chapter comment by "{chapterCommentToDelete?.userName}": "{chapterCommentToDelete?.text.substring(0,50)}..."? Cannot be undone (simulated).</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteChapterCommentDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={confirmDeleteChapterComment}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
