
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovelForm } from '@/components/novel-form';
import { getNovelsFromStorage, saveNovelsToStorage, type Novel } from '@/lib/mock-data';
import { PlusCircle, Edit, Trash2, ShieldCheck, Eye, BookOpen } from 'lucide-react'; // Added BookOpen
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function AdminPage() {
  const { toast } = useToast();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setNovels(getNovelsFromStorage());
  }, []);

  const handleOpenAddForm = () => {
    setEditingNovel(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (novel: Novel) => {
    setEditingNovel(novel);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: Novel) => {
    let updatedNovels;
    if (editingNovel) {
      updatedNovels = novels.map(n => (n.id === editingNovel.id ? { ...data, id: editingNovel.id, views: n.views, rating: n.rating, chapters: n.chapters } : n));
    } else {
      const newNovelWithDefaults = { ...data, id: `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, views: 0, rating: 0, chapters: data.chapters || [] }; // Ensure chapters is an array
      updatedNovels = [...novels, newNovelWithDefaults];
    }
    setNovels(updatedNovels);
    saveNovelsToStorage(updatedNovels);
    setIsFormModalOpen(false);
    setEditingNovel(null);
    setNovels(getNovelsFromStorage()); // Refresh to reflect dynamic trending status
  };

  const promptDeleteNovel = (novel: Novel) => {
    setNovelToDelete(novel);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNovel = () => {
    if (novelToDelete) {
      const updatedNovels = novels.filter(n => n.id !== novelToDelete.id);
      setNovels(updatedNovels);
      saveNovelsToStorage(updatedNovels);
      toast({
        title: "Novel Deleted",
        description: `"${novelToDelete.title}" has been removed.`,
        variant: "destructive"
      });
      setNovelToDelete(null);
      setIsDeleteDialogOpen(false);
      setNovels(getNovelsFromStorage());
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <ShieldCheck className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Admin Panel</h1>
        <p className="text-xl text-foreground font-body font-semibold">
          Manage novels and website content.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl text-primary">Manage Novels</CardTitle>
            <CardDescription>View, add, edit, or delete novels.</CardDescription>
          </div>
          <Button onClick={handleOpenAddForm}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Novel
          </Button>
        </CardHeader>
        <CardContent>
          {novels.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No novels found. Add one to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genres</TableHead>
                    <TableHead className="text-center">No. of Chapters</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Trending</TableHead>
                    <TableHead className="text-right w-[250px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {novels.map((novel) => (
                    <TableRow key={novel.id}>
                      <TableCell className="font-medium">{novel.title}</TableCell>
                      <TableCell>{novel.author}</TableCell>
                      <TableCell>{novel.genres.join(", ")}</TableCell>
                      <TableCell className="text-center">{novel.chapters.length}</TableCell>
                      <TableCell className="text-center">{novel.views?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-center">{novel.rating?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell className="text-center">{novel.isTrending ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                           <Link href={`/story/${novel.id}`} target="_blank" rel="noopener noreferrer" title="View Novel">
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Link>
                        </Button>
                         <Button variant="ghost" size="icon" asChild title="Manage Chapters">
                           <Link href={`/admin/novel/${novel.id}/chapters`}>
                            <BookOpen className="h-4 w-4 text-green-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditForm(novel)} title="Edit Novel">
                          <Edit className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => promptDeleteNovel(novel)} title="Delete Novel">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => {
          setIsFormModalOpen(isOpen);
          if (!isOpen) setEditingNovel(null);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {editingNovel ? 'Edit Novel Details' : 'Add New Novel'}
            </DialogTitle>
            <DialogDescription>
              {editingNovel ? `Modify the core details for "${editingNovel.title}". Manage chapters separately.` : 'Fill in the details for the new novel. Chapters can be added after creation.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <NovelForm
              initialData={editingNovel}
              onSubmitForm={handleFormSubmit}
              submitButtonText={editingNovel ? 'Save Changes' : 'Add Novel'}
              onCancel={() => {
                setIsFormModalOpen(false);
                setEditingNovel(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the novel "{novelToDelete?.title}"? This action will also delete all its chapters and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteNovel}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    