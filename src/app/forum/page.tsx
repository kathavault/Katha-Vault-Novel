import { ForumPostCard } from '@/components/forum-post-card';
import { Button } from '@/components/ui/button';
import { Users, PlusCircle } from 'lucide-react';

const placeholderPosts = [
  { id: '1', title: 'Welcome to Katha Vault! Introduce Yourself!', authorName: 'Admin', authorInitials: 'AD', timestamp: '2 days ago', excerpt: 'Hello writers and readers! We\'re thrilled to have you here. Tell us a bit about yourself and what kind of stories you love.', repliesCount: 15, likesCount: 32, viewsCount: 120, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: '2', title: 'Discussion: Best Opening Lines in Fantasy', authorName: 'Elara Moonwhisper', authorInitials: 'EM', timestamp: '1 day ago', excerpt: 'What are some of your favorite opening lines from fantasy novels or stories? Let\'s share some inspiration!', repliesCount: 22, likesCount: 45, viewsCount: 250, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', title: 'Seeking Feedback on Sci-Fi Short Story Draft', authorName: 'Jax Orion', authorInitials: 'JO', timestamp: '15 hours ago', excerpt: 'I\'ve just finished a draft of my new sci-fi short story, "Cryosleep Dreamer". Would love to get some constructive criticism before I finalize it.', repliesCount: 8, likesCount: 18, viewsCount: 95, authorAvatarUrl: 'https://placehold.co/40x40.png' },
  { id: '4', title: 'Tips for Overcoming Writer\'s Block', authorName: 'CreativeSpark', authorInitials: 'CS', timestamp: '5 hours ago', excerpt: 'We all face it sometimes! What are your go-to strategies for breaking through writer\'s block and getting the words flowing again?', repliesCount: 30, likesCount: 55, viewsCount: 310, authorAvatarUrl: 'https://placehold.co/40x40.png' },
];

export default function ForumPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <Users className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline tracking-tight text-primary">Community Forum</h1>
        <p className="text-xl text-muted-foreground font-body">
          Connect with fellow readers and writers. Discuss stories, share ideas, and get feedback.
        </p>
      </header>

      <div className="flex justify-end mb-6">
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Start New Discussion
        </Button>
      </div>

      <div className="space-y-6">
        {placeholderPosts.map(post => (
          <ForumPostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
