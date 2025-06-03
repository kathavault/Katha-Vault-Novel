
export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  dataAiHint?: string;
  bio?: string;
  email?: string;
  emailVisible?: boolean;
  gender?: string;
  isActive: boolean;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  genres: string[];
  snippet: string;
  status: 'draft' | 'published';
  coverImageUrl?: string;
  aiHint?: string;
  views?: number;
  chapters: Chapter[];
  rating?: number;
  isTrending?: boolean;
  homePageFeaturedGenre?: string | null; // New field
}

export interface HomeLayoutConfig {
  selectedGenres: string[];
  showMoreNovelsSection: boolean;
}

// For Forum/Post Comments (from FeedItemCardProps)
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
}


// New StoredChapterComment interface
export interface StoredChapterComment {
  id: string;
  novelId: string;
  chapterId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials: string;
  text: string;
  timestamp: string;
  commentLikes: number;
  isCommentLikedByUser: boolean;
  replies: StoredChapterComment[];
  // For admin page display if needed, not part of core structure
  novelTitleAdmin?: string;
  chapterTitleAdmin?: string;
}


export const CURRENT_USER_ID = 'user_ke';
export const CURRENT_USER_NAME = 'Katha Explorer';

const KATHA_EXPLORER_FOLLOWING_IDS_KEY = 'kathaExplorerFollowingIds';
const KATHA_VAULT_MANAGED_NOVELS_KEY = 'kathaVaultManagedNovels';
export const KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY = 'kathaVaultHomeSectionsConfig';
export const SOCIAL_FEED_POSTS_STORAGE_KEY = 'kathaVaultSocialFeedPosts';
export const USER_POSTS_STORAGE_KEY = 'currentUserKathaVaultPosts';
export const KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY = 'kathaVaultStoredChapterComments';


export const kathaExplorerUser: MockUser = {
  id: CURRENT_USER_ID,
  name: CURRENT_USER_NAME,
  username: 'katha_explorer',
  avatarUrl: 'https://placehold.co/128x128.png',
  avatarFallback: 'KE',
  dataAiHint: 'person explorer',
  bio: 'Avid reader and aspiring writer. Exploring worlds one story at a time.',
  email: 'katha.explorer@example.com',
  emailVisible: true,
  gender: 'Prefer not to say',
  isActive: true,
};

export const allMockUsers: MockUser[] = [
  kathaExplorerUser,
  { id: 'user_er', name: 'Elara Reads', username: 'elara_reads', avatarUrl: 'https://placehold.co/128x128.png?text=ER', avatarFallback: 'ER', dataAiHint: 'person reading', bio: 'Lover of all things fantasy and sci-fi. Always looking for the next great adventure.', email: 'elara@example.com', emailVisible: false, gender: 'Female', isActive: true },
  { id: 'user_mw', name: 'Marcus Writes', username: 'marcus_writes', avatarUrl: 'https://placehold.co/128x128.png?text=MW', avatarFallback: 'MW', dataAiHint: 'person writing', bio: 'Aspiring novelist, currently working on a historical fiction piece. Coffee enthusiast.', email: 'marcus@example.com', emailVisible: true, gender: 'Male', isActive: true },
  { id: 'user_sf', name: 'SciFi Guru', username: 'scifi_guru', avatarUrl: 'https://placehold.co/128x128.png?text=SG', avatarFallback: 'SG', dataAiHint: 'person space', bio: 'Exploring the final frontier, one book at a time. Beam me up!', email: 'scifi@example.com', emailVisible: true, gender: 'Prefer not to say', isActive: true },
  { id: 'user_ff', name: 'Fantasy Fan', username: 'fantasy_fan', avatarUrl: 'https://placehold.co/128x128.png?text=FF', avatarFallback: 'FF', dataAiHint: 'person fantasy', bio: 'Dragons, magic, and epic quests are my jam.', email: 'fantasy@example.com', emailVisible: false, gender: 'Non-binary', isActive: true },
  { id: 'user_ml', name: 'Mystery Lover', username: 'mystery_lover', avatarUrl: 'https://placehold.co/128x128.png?text=ML', avatarFallback: 'ML', dataAiHint: 'person detective', bio: 'Unraveling plots and solving crimes from my armchair.', email: 'mystery@example.com', emailVisible: true, gender: 'Female', isActive: true },
  { id: 'user_aa', name: 'Adventure Alex', username: 'adventure_alex', avatarUrl: 'https://placehold.co/128x128.png?text=AA', avatarFallback: 'AA', dataAiHint: 'person adventure', bio: 'Seeking thrills in stories and in life!', email: 'alex@example.com', emailVisible: false, gender: 'Male', isActive: true },
  { id: 'user_rh', name: 'Romance Hannah', username: 'romance_hannah', avatarUrl: 'https://placehold.co/128x128.png?text=RH', avatarFallback: 'RH', dataAiHint: 'person romance', bio: 'Hopeless romantic, give me all the happy endings.', email: 'hannah@example.com', emailVisible: true, gender: 'Female', isActive: true },
  { id: 'user_th', name: 'Thriller Tom', username: 'thriller_tom', avatarUrl: 'https://placehold.co/128x128.png?text=TT', avatarFallback: 'TT', dataAiHint: 'person thriller', bio: 'Always on the edge of my seat. The more suspense, the better!', email: 'tom@example.com', emailVisible: false, gender: 'Male', isActive: true },
];

export const getInitialFollowingIds = (): string[] => {
  if (typeof window !== 'undefined') {
    const storedFollowing = localStorage.getItem(KATHA_EXPLORER_FOLLOWING_IDS_KEY);
    if (storedFollowing) {
      try {
        return JSON.parse(storedFollowing);
      } catch (e) {
        console.error("Error parsing following IDs from localStorage", e);
        return ['user_er', 'user_mw', 'user_ff'];
      }
    }
  }
  return ['user_er', 'user_mw', 'user_ff'];
};

export const updateFollowingIds = (newFollowingIds: string[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KATHA_EXPLORER_FOLLOWING_IDS_KEY, JSON.stringify(newFollowingIds));
  }
};

export const getKathaExplorerFollowingList = (): MockUser[] => {
  const followingIds = getInitialFollowingIds();
  return allMockUsers.filter(user => followingIds.includes(user.id) && user.id !== CURRENT_USER_ID);
};

export const getKathaExplorerFollowersList = (count: number = 3): MockUser[] => {
  const followingIds = getInitialFollowingIds();
  return allMockUsers.filter(user => user.id !== CURRENT_USER_ID && !followingIds.includes(user.id)).slice(0, count);
};

const defaultChapterContent = (novelTitle: string, chapterNum: number, chapterTitle: string) => `
Placeholder content for ${chapterTitle} (Chapter ${chapterNum}) of "${novelTitle}".

This chapter continues the enthralling saga.
Readers will find themselves captivated by the unfolding events and the rich character development.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

The narrative builds, adding new layers of intrigue and excitement...
`;

export const initialMockNovels: Novel[] = [
  { id: 'trend-1', title: 'The Whispers of Chronos', author: 'Eleanor Vance', genres: ['Time Travel', 'Sci-Fi'], status: 'published', snippet: "A time-traveling journey through the eras in search of a missing chronomancer.", coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'time machine', views: 26000, chapters: Array.from({ length: 3 }, (_, i) => ({ id: `chronos-ch-${i+1}`, title: `Chapter ${i+1}: Epoch's Echo`, content: defaultChapterContent("The Whispers of Chronos", i+1, `Chapter ${i+1}: Epoch's Echo`) })), rating: 4.8, homePageFeaturedGenre: 'Sci-Fi' },
  { id: 'trend-2', title: 'Beneath the Emerald Canopy', author: 'Marcus Stone', genres: ['Fantasy', 'Adventure'], status: 'published', snippet: 'Fantasy exploration into ancient rainforest magic.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'jungle temple', views: 18000, chapters: Array.from({ length: 2 }, (_, i) => ({ id: `canopy-ch-${i+1}`, title: `Chapter ${i+1}: Root and Ritual`, content: defaultChapterContent("Beneath the Emerald Canopy", i+1, `Chapter ${i+1}: Root and Ritual`) })), rating: 4.6, homePageFeaturedGenre: 'Fantasy' },
  { id: 'novel-1', title: 'The Alchemist of Moonhaven', author: 'Seraphina Gold', genres: ['Steampunk', 'Mystery'], status: 'published', snippet: 'In a city powered by moonlight, a young alchemist seeks to break tradition.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'steampunk city moon', views: 12000, chapters: Array.from({ length: 1 }, (_, i) => ({ id: `moonhaven-ch-${i+1}`, title: `Chapter ${i+1}: Lunar Brews`, content: defaultChapterContent("The Alchemist of Moonhaven", i+1, `Chapter ${i+1}: Lunar Brews`) })), rating: 4.2, homePageFeaturedGenre: null },
  { id: 'short-1', title: 'A Stitch in Time', author: 'Penelope Weave', genres: ['Short Story', 'Urban Fantasy'], status: 'published', snippet: 'A short story about a magical tailor who can alter time.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'magic tailor', views: 9600, chapters: [{id: 'stitch-ch-1', title: 'The Golden Thread', content: defaultChapterContent("A Stitch in Time", 1, 'The Golden Thread')}], rating: 4.3, homePageFeaturedGenre: null },
  { id: 'draft-1', title: 'The Crimson Comet (Draft)', author: 'Jax Orion', genres: ['Sci-Fi', 'Mystery'], status: 'draft', snippet: 'A rogue comet appears, and with it, a series of strange disappearances. (This is a DRAFT novel)', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'comet space mystery', views: 100, chapters: [{id: 'comet-draft-ch-1', title: 'First Sighting', content: defaultChapterContent("The Crimson Comet (Draft)", 1, 'First Sighting')}], rating: 0, homePageFeaturedGenre: null },
  { id: 'romance-1', title: 'Hearts Entwined by Starlight', author: 'Luna Lovegood', genres: ['Romance', 'Contemporary'], status: 'published', snippet: 'Two astronomers find love while searching for a new constellation.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'couple stars', views: 15000, chapters: Array.from({ length: 20 }, (_, i) => ({ id: `romance1-ch-${i+1}`, title: `Chapter ${i+1}: Celestial Meeting`, content: defaultChapterContent("Hearts Entwined by Starlight", i+1, `Chapter ${i+1}: Celestial Meeting`) })), rating: 4.7, homePageFeaturedGenre: 'Romance' },
];

export const getNovelsFromStorage = (): Novel[] => {
  let novelsFromStorage: Novel[] = [];
  if (typeof window !== 'undefined') {
    const storedNovels = localStorage.getItem(KATHA_VAULT_MANAGED_NOVELS_KEY);
    if (storedNovels) {
      try {
        novelsFromStorage = JSON.parse(storedNovels);
      } catch (e) {
        console.error("Error parsing novels from localStorage", e);
        novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels));
        localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novelsFromStorage));
      }
    } else {
      novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels));
      localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novelsFromStorage));
    }
  } else {
    novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels));
  }

  const processedNovels = novelsFromStorage.map(novel => ({
    ...novel,
    status: novel.status || 'draft',
    views: novel.views ?? 0,
    rating: novel.rating ?? 0,
    homePageFeaturedGenre: novel.homePageFeaturedGenre === undefined ? null : novel.homePageFeaturedGenre, // Ensure it's null if not present
    chapters: Array.isArray(novel.chapters) && novel.chapters.length > 0 ? novel.chapters.map(ch => ({
        id: ch.id || `ch-random-${Math.random().toString(36).substring(2, 9)}`,
        title: ch.title || 'Untitled Chapter',
        content: ch.content || 'No content available.'
    })) : [{id: `fallback-ch-${novel.id}`, title: 'Chapter 1', content: defaultChapterContent(novel.title, 1, 'Chapter 1')}],
  }));

  const publishedNovels = processedNovels.filter(n => n.status === 'published');
  const sortedByViews = [...publishedNovels].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const TRENDING_COUNT = 3;

  return processedNovels.map(novel => {
    const isTopTrending = novel.status === 'published' && sortedByViews.slice(0, TRENDING_COUNT).some(trendingNovel => trendingNovel.id === novel.id);
    return {
      ...novel,
      isTrending: isTopTrending,
    };
  });
};


export const saveNovelsToStorage = (novels: Novel[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novels));
  }
};

const defaultHomeConfig: HomeLayoutConfig = {
  selectedGenres: ['Sci-Fi', 'Fantasy', 'Romance'],
  showMoreNovelsSection: true,
};

export const getHomeSectionsConfig = (): HomeLayoutConfig => {
  if (typeof window !== 'undefined') {
    const storedConfig = localStorage.getItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.selectedGenres) && typeof parsed.showMoreNovelsSection === 'boolean') {
          return parsed as HomeLayoutConfig;
        }
        console.warn("Home sections config in localStorage is malformed. Reverting to default.");
        localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(defaultHomeConfig));
        return defaultHomeConfig;
      } catch (e) {
        console.error("Error parsing home sections config from localStorage", e);
        localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(defaultHomeConfig));
        return defaultHomeConfig;
      }
    }
    localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(defaultHomeConfig));
    return defaultHomeConfig;
  }
  return defaultHomeConfig;
};

export const saveHomeSectionsConfig = (config: HomeLayoutConfig): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(config));
  }
};

export const getAllUniqueGenres = (novels: Novel[]): string[] => {
    const allGenres = new Set<string>();
    novels.forEach(novel => novel.genres.forEach(genre => allGenres.add(genre)));
    return Array.from(allGenres).sort();
};

export const isUserActive = (userId: string): boolean => {
  const user = allMockUsers.find(u => u.id === userId);
  return user ? user.isActive : false;
};


// Stored Chapter Comments - Refactored
const defaultStoredChapterComments: StoredChapterComment[] = [
  {
    id: 'chapcomment-1-1',
    novelId: 'trend-1',
    chapterId: 'chronos-ch-1',
    authorId: 'user_er',
    authorName: 'Elara Reads',
    authorAvatarUrl: 'https://placehold.co/40x40.png?text=ER',
    authorInitials: 'ER',
    text: 'What a fantastic start to "The Whispers of Chronos"! The concept of a missing chronomancer is so intriguing. Can\'t wait to see where this temporal journey leads!',
    timestamp: '2 days ago',
    commentLikes: 15,
    isCommentLikedByUser: false,
    replies: [
      {
        id: 'chapreply-1-1-1',
        novelId: 'trend-1',
        chapterId: 'chronos-ch-1',
        authorId: 'user_mw',
        authorName: 'Marcus Writes',
        authorAvatarUrl: 'https://placehold.co/40x40.png?text=MW',
        authorInitials: 'MW',
        text: 'Agreed, Elara! The pacing is excellent and the mystery is already building.',
        timestamp: '1 day ago',
        commentLikes: 7,
        isCommentLikedByUser: true,
        replies: [],
      },
    ],
  },
  {
    id: 'chapcomment-1-2',
    novelId: 'trend-1',
    chapterId: 'chronos-ch-2',
    authorId: 'user_sf',
    authorName: 'SciFi Guru',
    authorAvatarUrl: 'https://placehold.co/40x40.png?text=SG',
    authorInitials: 'SG',
    text: 'Chapter 2, "Paradox Alley", was mind-bending! The way Vance handles temporal mechanics is brilliant.',
    timestamp: '12 hours ago',
    commentLikes: 22,
    isCommentLikedByUser: false,
    replies: [],
  },
  {
    id: 'chapcomment-2-1',
    novelId: 'trend-2',
    chapterId: 'canopy-ch-1',
    authorId: 'user_ff',
    authorName: 'Fantasy Fan',
    authorAvatarUrl: 'https://placehold.co/40x40.png?text=FF',
    authorInitials: 'FF',
    text: 'The world-building in "Beneath the Emerald Canopy" is breathtaking. The description of the ancient rainforest magic is so vivid!',
    timestamp: '3 days ago',
    commentLikes: 18,
    isCommentLikedByUser: false,
    replies: [],
  },
];

export const getStoredChapterComments = (): StoredChapterComment[] => {
  if (typeof window !== 'undefined') {
    const storedComments = localStorage.getItem(KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY);
    if (storedComments) {
      try {
        return JSON.parse(storedComments);
      } catch (e) {
        console.error("Error parsing stored chapter comments from localStorage", e);
      }
    }
    localStorage.setItem(KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY, JSON.stringify(defaultStoredChapterComments));
    return defaultStoredChapterComments;
  }
  return JSON.parse(JSON.stringify(defaultStoredChapterComments)); // Return a copy for server-side or initial state
};

export const saveStoredChapterComments = (comments: StoredChapterComment[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY, JSON.stringify(comments));
  }
};


// Helper function to get all social feed posts (used by admin comment management)
export const getSocialFeedPostsFromStorage = (): FeedItemCardProps[] => {
    if (typeof window !== 'undefined') {
        const storedPosts = localStorage.getItem(SOCIAL_FEED_POSTS_STORAGE_KEY);
        if (storedPosts) {
            try {
                return JSON.parse(storedPosts) as FeedItemCardProps[];
            } catch (e) {
                console.error("Error parsing social feed posts from localStorage", e);
            }
        }
    }
    return []; // Return empty if not in browser or error
};
