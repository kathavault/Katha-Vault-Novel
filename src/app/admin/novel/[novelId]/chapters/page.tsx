
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ChapterForm } from '@/components/chapter-form'; 
import { getNovelsFromStorage, saveNovelsToStorage, type Novel, type Chapter } from '@/lib/mock-data';
import { PlusCircle, Edit, Trash2, ChevronLeft, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function ManageNovelChaptersPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const novelId = typeof params.novelId === 'string' ? params.novelId : '';

  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isChapterFormOpen, setIsChapterFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeleteChapterDialogOpen, setIsDeleteChapterDialogOpen] = useState(false);

  useEffect(() => {
    if (novelId) {
      const allNovels = getNovelsFromStorage();
      const foundNovel = allNovels.find(n => n.id === novelId);
      setNovel(foundNovel || null);
    }
    setIsLoading(false);
  }, [novelId]);

  const handleOpenAddChapterForm = () => {
    setEditingChapter(null);
    setIsChapterFormOpen(true);
  };

  const handleOpenEditChapterForm = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsChapterFormOpen(true);
  };

  const handleChapterFormSubmit = (data: { title: string; content: string }) => {
    if (!novel) return;

    let updatedChapters: Chapter[];
    if (editingChapter) { // Editing existing chapter
      updatedChapters = novel.chapters.map(ch => 
        ch.id === editingChapter.id ? { ...ch, ...data } : ch
      );
    } else { // Adding new chapter
      const newChapter: Chapter = {
        id: `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        content: data.content,
      };
      updatedChapters = [...novel.chapters, newChapter];
    }

    const updatedNovel = { ...novel, chapters: updatedChapters };
    setNovel(updatedNovel); 

    const allNovels = getNovelsFromStorage();
    const updatedAllNovels = allNovels.map(n => n.id === novel.id ? updatedNovel : n);
    saveNovelsToStorage(updatedAllNovels);

    setIsChapterFormOpen(false);
    setEditingChapter(null);
    toast({
      title: editingChapter ? "Chapter Updated!" : "Chapter Added!",
      description: `"${data.title}" has been saved for ${novel.title}.`,
    });
  };
  
  const promptDeleteChapter = (chapter: Chapter) => {
    setChapterToDelete(chapter);
    setIsDeleteChapterDialogOpen(true);
  };

  const confirmDeleteChapter = () => {
    if (!novel || !chapterToDelete) return;

    const updatedChapters = novel.chapters.filter(ch => ch.id !== chapterToDelete.id);
    const updatedNovel = { ...novel, chapters: updatedChapters };
    setNovel(updatedNovel);

    const allNovels = getNovelsFromStorage();
    const updatedAllNovels = allNovels.map(n => n.id === novel.id ? updatedNovel : n);
    saveNovelsToStorage(updatedAllNovels);

    toast({
      title: "Chapter Deleted",
      description: `"${chapterToDelete.title}" has been removed from ${novel.title}.`,
      variant: "destructive"
    });
    setChapterToDelete(null);
    setIsDeleteChapterDialogOpen(false);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading novel chapters...</div>;
  }

  if (!novel) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Novel Not Found</h1>
        <p>The novel you are trying to manage chapters for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/admin"><ChevronLeft className="mr-2 h-4 w-4" />Back to Admin Panel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="outline" className="mb-6 self-start">
        <Link href="/admin"><ChevronLeft className="mr-2 h-4 w-4" />Back to Novels List</Link>
      </Button>
      <header className="text-center space-y-2">
        <BookOpen className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl font-headline tracking-tight text-primary">Manage Chapters</h1>
        <p className="text-2xl text-foreground font-body font-semibold">
          For Novel: <span className="text-primary">{novel.title}</span>
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl text-primary">Chapters List</CardTitle>
            <CardDescription>View, add, edit, or delete chapters for this novel.</CardDescription>
          </div>
          <Button onClick={handleOpenAddChapterForm} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Chapter
          </Button>
        </CardHeader>
        <CardContent>
          {novel.chapters.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No chapters found. Add one to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {novel.chapters.map((chapter, index) => (
                    <TableRow key={chapter.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{chapter.title}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditChapterForm(chapter)} title="Edit Chapter">
                          <Edit className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => promptDeleteChapter(chapter)} title="Delete Chapter">
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

      {/* Add/Edit Chapter Form Modal */}
      <Dialog open={isChapterFormOpen} onOpenChange={(isOpen) => {
          setIsChapterFormOpen(isOpen);
          if (!isOpen) setEditingChapter(null); 
      }}>
        <DialogContent className="sm:max-w-xl md:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
            </DialogTitle>
            <DialogDescription>
              {editingChapter ? `Modify details for "${editingChapter.title}".` : 'Fill in the details for the new chapter.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex-grow overflow-y-auto">
            <ChapterForm
              initialData={editingChapter}
              onSubmitForm={handleChapterFormSubmit}
              onCancel={() => {
                setIsChapterFormOpen(false);
                setEditingChapter(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Chapter Confirmation Dialog */}
      <Dialog open={isDeleteChapterDialogOpen} onOpenChange={setIsDeleteChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Chapter Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the chapter "{chapterToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteChapterDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteChapter}>Delete Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    