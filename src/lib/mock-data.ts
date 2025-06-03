
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
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  genres: string[];
  snippet: string;
  coverImageUrl?: string;
  aiHint?: string;
  views?: number;
  chapters: Chapter[]; // Changed from number to Chapter[]
  rating?: number;
  isTrending?: boolean;
}

export const CURRENT_USER_ID = 'user_ke';
export const CURRENT_USER_NAME = 'Katha Explorer';

const KATHA_EXPLORER_FOLLOWING_IDS_KEY = 'kathaExplorerFollowingIds';
const KATHA_VAULT_MANAGED_NOVELS_KEY = 'kathaVaultManagedNovels';

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
};

export const allMockUsers: MockUser[] = [
  kathaExplorerUser,
  { id: 'user_er', name: 'Elara Reads', username: 'elara_reads', avatarUrl: 'https://placehold.co/128x128.png?text=ER', avatarFallback: 'ER', dataAiHint: 'person reading', bio: 'Lover of all things fantasy and sci-fi. Always looking for the next great adventure.', email: 'elara@example.com', emailVisible: false, gender: 'Female' },
  { id: 'user_mw', name: 'Marcus Writes', username: 'marcus_writes', avatarUrl: 'https://placehold.co/128x128.png?text=MW', avatarFallback: 'MW', dataAiHint: 'person writing', bio: 'Aspiring novelist, currently working on a historical fiction piece. Coffee enthusiast.', email: 'marcus@example.com', emailVisible: true, gender: 'Male' },
  { id: 'user_sf', name: 'SciFi Guru', username: 'scifi_guru', avatarUrl: 'https://placehold.co/128x128.png?text=SG', avatarFallback: 'SG', dataAiHint: 'person space', bio: 'Exploring the final frontier, one book at a time. Beam me up!', email: 'scifi@example.com', emailVisible: true, gender: 'Prefer not to say' },
  { id: 'user_ff', name: 'Fantasy Fan', username: 'fantasy_fan', avatarUrl: 'https://placehold.co/128x128.png?text=FF', avatarFallback: 'FF', dataAiHint: 'person fantasy', bio: 'Dragons, magic, and epic quests are my jam.', email: 'fantasy@example.com', emailVisible: false, gender: 'Non-binary' },
  { id: 'user_ml', name: 'Mystery Lover', username: 'mystery_lover', avatarUrl: 'https://placehold.co/128x128.png?text=ML', avatarFallback: 'ML', dataAiHint: 'person detective', bio: 'Unraveling plots and solving crimes from my armchair.', email: 'mystery@example.com', emailVisible: true, gender: 'Female' },
  { id: 'user_aa', name: 'Adventure Alex', username: 'adventure_alex', avatarUrl: 'https://placehold.co/128x128.png?text=AA', avatarFallback: 'AA', dataAiHint: 'person adventure', bio: 'Seeking thrills in stories and in life!', email: 'alex@example.com', emailVisible: false, gender: 'Male' },
  { id: 'user_rh', name: 'Romance Hannah', username: 'romance_hannah', avatarUrl: 'https://placehold.co/128x128.png?text=RH', avatarFallback: 'RH', dataAiHint: 'person romance', bio: 'Hopeless romantic, give me all the happy endings.', email: 'hannah@example.com', emailVisible: true, gender: 'Female' },
  { id: 'user_th', name: 'Thriller Tom', username: 'thriller_tom', avatarUrl: 'https://placehold.co/128x128.png?text=TT', avatarFallback: 'TT', dataAiHint: 'person thriller', bio: 'Always on the edge of my seat. The more suspense, the better!', email: 'tom@example.com', emailVisible: false, gender: 'Male' },
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

// --- Novel Data Management ---
const defaultChapterContent = (title: string, chapterNum: number) => `
Placeholder content for Chapter ${chapterNum} of "${title}".

This chapter, titled "${title} - Chapter ${chapterNum}", continues the enthralling saga.
Readers will find themselves captivated by the unfolding events and the rich character development.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

The narrative builds, adding new layers of intrigue and excitement...
`;

export const initialMockNovels: Novel[] = [
  { id: 'trend-1', title: 'The Whispers of Chronos', author: 'Eleanor Vance', genres: ['Time Travel', 'Science Fiction'], snippet: "A time-traveling journey through the eras in search of a missing chronomancer.", coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'time machine', views: 26000, chapters: Array.from({ length: 25 }, (_, i) => ({ id: `chronos-ch-${i+1}`, title: `Chapter ${i+1}: Epoch's Echo`, content: defaultChapterContent("The Whispers of Chronos", i+1) })), rating: 4.8, isTrending: true },
  { id: 'trend-2', title: 'Beneath the Emerald Canopy', author: 'Marcus Stone', genres: ['Fantasy', 'Exploration', 'Magic'], snippet: 'Fantasy exploration into ancient rainforest magic.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'jungle temple', views: 18000, chapters: Array.from({ length: 20 }, (_, i) => ({ id: `canopy-ch-${i+1}`, title: `Chapter ${i+1}: Root and Ritual`, content: defaultChapterContent("Beneath the Emerald Canopy", i+1) })), rating: 4.6, isTrending: true },
  { id: 'novel-1', title: 'The Alchemist of Moonhaven', author: 'Seraphina Gold', genres: ['Steampunk', 'Mystery', 'Alchemy'], snippet: 'In a city powered by moonlight, a young alchemist seeks to break tradition.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'steampunk city moon', views: 12000, chapters: Array.from({ length: 50 }, (_, i) => ({ id: `moonhaven-ch-${i+1}`, title: `Chapter ${i+1}: Lunar Brews`, content: defaultChapterContent("The Alchemist of Moonhaven", i+1) })), rating: 4.2 },
  { id: 'short-1', title: 'A Stitch in Time', author: 'Penelope Weave', genres: ['Short Story', 'Urban Fantasy', 'Magic'], snippet: 'A short story about a magical tailor who can alter time.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'magic tailor', views: 9600, chapters: [{id: 'stitch-ch-1', title: 'Chapter 1: The Golden Thread', content: defaultChapterContent("A Stitch in Time", 1)}], rating: 4.3 },
  { id: 'short-2', title: 'The Clockwork Heart', author: 'Cogsworth Throttleton', genres: ['Short Story', 'Steampunk', 'Romance'], snippet: 'A short tale of love and machinery in a steampunk universe.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'steampunk heart', views: 15000, chapters: [{id: 'clockwork-ch-1', title: 'Chapter 1: Gears of Affection', content: defaultChapterContent("The Clockwork Heart", 1)}], rating: 4.7 },
  { id: 'rom-1', title: 'Love in the Time of Stardust', author: 'Stella Astra', genres: ['Romance', 'Space Opera', 'Adventure'], snippet: 'Two starlit souls find their way toward each other across galaxies, their romance defying all odds.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'galaxy couple romance', views: 28000, chapters: Array.from({ length: 30 }, (_, i) => ({ id: `stardust-ch-${i+1}`, title: `Chapter ${i+1}: Cosmic Embrace`, content: defaultChapterContent("Love in the Time of Stardust", i+1) })), rating: 4.9 },
  { id: 'scifi-1', title: 'Echoes of the Void', author: 'Orion Nebula', genres: ['Space Opera', 'Horror', 'Existential'], snippet: 'A lone astronaut contemplates an ancient species, adrift at the edge of known space.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'astronaut void space', views: 36000, chapters: Array.from({ length: 22 }, (_, i) => ({ id: `void-ch-${i+1}`, title: `Chapter ${i+1}: Silent Signals`, content: defaultChapterContent("Echoes of the Void", i+1) })), rating: 4.9 },
  { id: 'scifi-2', title: 'The Last Cyberpunk', author: 'Nova Byte', genres: ['Cyberpunk', 'Dystopia', 'Action'], snippet: 'In a ruined electric city, one last hacker fights for freedom.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'cyberpunk hacker city', views: 22000, chapters: Array.from({ length: 18 }, (_, i) => ({ id: `cyberpunk-ch-${i+1}`, title: `Chapter ${i+1}: Neon Shadows`, content: defaultChapterContent("The Last Cyberpunk", i+1) })), rating: 4.6 },
  { id: 'more-1', title: 'General Thoughts on Reading', author: 'Marcus Stone', genres: ['General', 'Reading', 'Book'], snippet: 'A general story on the general complexity of books, the reader’s state of mind, and what defines a book.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'book thought', views: 10000, chapters: Array.from({ length: 5 }, (_, i) => ({ id: `reading-ch-${i+1}`, title: `Chapter ${i+1}: Perspectives`, content: defaultChapterContent("General Thoughts on Reading", i+1) })), rating: 4.0 },
  { id: 'lib-1', title: 'The Last Nebula (Library Copy)', author: 'Aria Vale', genres: ['Sci-Fi', 'Adventure'], snippet: 'In a dying galaxy, a lone explorer seeks the fabled Last Nebula, said to hold the key to cosmic rebirth.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'nebula space', views: 15000, chapters: Array.from({ length: 30 }, (_, i) => ({ id: `nebula-lib-ch-${i+1}`, title: `Chapter ${i+1}: Galactic Hope`, content: defaultChapterContent("The Last Nebula (Library Copy)", i+1) })), rating: 4.5 },
  { id: 'lib-4', title: 'Echoes in the Silence (Library Copy)', author: 'Lena Petrova', genres: ['Mystery', 'Thriller'], snippet: 'A detective haunted by her past must solve a murder in a remote, snowbound village where everyone has a secret.', coverImageUrl: 'https://placehold.co/480x680.png', aiHint: 'snowy village', views: 9000, chapters: Array.from({ length: 22 }, (_, i) => ({ id: `silence-lib-ch-${i+1}`, title: `Chapter ${i+1}: Frozen Clues`, content: defaultChapterContent("Echoes in the Silence (Library Copy)", i+1) })), rating: 4.2 },
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
        novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels)); // Deep copy
        localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novelsFromStorage));
      }
    } else {
      novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels)); // Deep copy
      localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novelsFromStorage));
    }
  } else {
    novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels)); // Deep copy for server-side
  }

  const processedNovels = novelsFromStorage.map(novel => ({
    ...novel,
    views: novel.views ?? 0,
    rating: novel.rating ?? 0,
    chapters: Array.isArray(novel.chapters) ? novel.chapters.map(ch => ({ // Ensure chapters have all fields
        id: ch.id || `ch-random-${Math.random().toString(36).substring(2, 9)}`,
        title: ch.title || 'Untitled Chapter',
        content: ch.content || 'No content available.'
    })) : [{id: 'ch-fallback-1', title: 'Chapter 1', content: 'Fallback chapter content.'}],
  }));

  const sortedByViews = [...processedNovels].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const TRENDING_COUNT = 3;

  return processedNovels.map(novel => {
    const isTopTrending = sortedByViews.slice(0, TRENDING_COUNT).some(trendingNovel => trendingNovel.id === novel.id);
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

    