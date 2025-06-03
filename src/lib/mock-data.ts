
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
  homePageFeaturedGenre?: string | null;
}

export interface HomeLayoutConfig {
  selectedGenres: string[];
  showMoreNovelsSection: boolean;
}

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
  novelTitleAdmin?: string;
  chapterTitleAdmin?: string;
}

export const CURRENT_USER_ID = 'user_ke';
export const KRITIKA_EMAIL = "rajputkritika510@gmail.com";
export const KATHAVAULT_OWNER_EMAIL = "kathavault@gmail.com";
const KATHA_VAULT_IS_LOGGED_IN_KEY = 'kathaVaultIsLoggedIn';


export const SPECIAL_ACCOUNT_DETAILS: Record<string, { fixedName: string; fixedUsername: string; idInAllUsers: string }> = {
  [KRITIKA_EMAIL]: {
    fixedName: "Kritika ✨ (CEO)",
    fixedUsername: "Kritikasignh",
    idInAllUsers: 'user_kritika_ceo',
  },
  [KATHAVAULT_OWNER_EMAIL]: {
    fixedName: "Katha Vault Owner ✨",
    fixedUsername: "kathavault",
    idInAllUsers: 'user_katha_owner',
  }
};


const KATHA_EXPLORER_FOLLOWING_IDS_KEY = 'kathaExplorerFollowingIds';
const KATHA_VAULT_MANAGED_NOVELS_KEY = 'kathaVaultManagedNovels';
export const KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY = 'kathaVaultHomeSectionsConfig';
export const SOCIAL_FEED_POSTS_STORAGE_KEY = 'kathaVaultSocialFeedPosts';
export const USER_POSTS_STORAGE_KEY = 'currentUserKathaVaultPosts';
export const KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY = 'kathaVaultStoredChapterComments';
export const KATHA_VAULT_BLOCKED_USER_IDS_KEY = 'kathaVaultBlockedUserIds';
const KATHA_VAULT_CURRENT_USER_PROFILE_KEY = 'kathaVaultCurrentUserProfile';

const defaultKathaExplorerUser: MockUser = {
  id: CURRENT_USER_ID,
  name: 'Katha Explorer',
  username: 'katha_explorer',
  avatarUrl: 'https://placehold.co/128x128.png',
  avatarFallback: 'KE',
  dataAiHint: 'person explorer',
  bio: 'Avid reader and aspiring writer. Exploring worlds one story at a time.',
  email: 'katha.explorer@example.com', // Default non-logged-in email
  emailVisible: true,
  gender: 'Prefer not to say',
  isActive: true,
};

export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  const loggedInStatus = localStorage.getItem(KATHA_VAULT_IS_LOGGED_IN_KEY);
  return loggedInStatus === 'true';
};

export const setLoggedInStatus = (status: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KATHA_VAULT_IS_LOGGED_IN_KEY, String(status));
    if (!status) {
      // If logging out, reset current user profile to default to prevent previous user's data lingering
      localStorage.setItem(KATHA_VAULT_CURRENT_USER_PROFILE_KEY, JSON.stringify(defaultKathaExplorerUser));
    }
  }
};

export const isUserAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!isUserLoggedIn()) return false;
  const currentUser = getKathaExplorerUser();
  return currentUser.email === KRITIKA_EMAIL || currentUser.email === KATHAVAULT_OWNER_EMAIL;
};


export const getKathaExplorerUser = (): MockUser => {
  let profileToReturn = { ...defaultKathaExplorerUser };
  if (typeof window !== 'undefined') {
    const storedProfile = localStorage.getItem(KATHA_VAULT_CURRENT_USER_PROFILE_KEY);
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile) as MockUser;
        profileToReturn = {
          ...defaultKathaExplorerUser, // Start with defaults
          ...parsedProfile,            // Override with stored values
          id: CURRENT_USER_ID,         // Ensure ID is always CURRENT_USER_ID
          isActive: parsedProfile.isActive !== undefined ? parsedProfile.isActive : defaultKathaExplorerUser.isActive,
        };
      } catch (e) {
        console.error("Error parsing current user profile from localStorage", e);
        // If parsing fails, reset to default and save it
        localStorage.setItem(KATHA_VAULT_CURRENT_USER_PROFILE_KEY, JSON.stringify(defaultKathaExplorerUser));
        profileToReturn = { ...defaultKathaExplorerUser };
      }
    } else {
      // No profile stored, use default and save it
      localStorage.setItem(KATHA_VAULT_CURRENT_USER_PROFILE_KEY, JSON.stringify(defaultKathaExplorerUser));
      profileToReturn = { ...defaultKathaExplorerUser };
    }
  }

  // Ensure special admin accounts are always active, but allow their names/usernames to be editable
  if (profileToReturn.email === KRITIKA_EMAIL || profileToReturn.email === KATHAVAULT_OWNER_EMAIL) {
    profileToReturn.isActive = true;
  }
  return profileToReturn;
};


export const saveKathaExplorerUser = (userData: MockUser): void => {
  if (typeof window !== 'undefined') {
    let dataToSave = { ...userData, id: CURRENT_USER_ID }; // Ensure ID is always CURRENT_USER_ID
    // Ensure special admin accounts remain active if they are being saved
    if (dataToSave.email === KRITIKA_EMAIL || dataToSave.email === KATHAVAULT_OWNER_EMAIL) {
        dataToSave.isActive = true;
    }
    localStorage.setItem(KATHA_VAULT_CURRENT_USER_PROFILE_KEY, JSON.stringify(dataToSave));
  }
};


export const updateCurrentLoggedInUser = (loggedInEmail: string): void => {
  let currentUser = getKathaExplorerUser(); // Get potentially existing profile
  const lowerCaseLoggedInEmail = loggedInEmail.toLowerCase();

  let newName = currentUser.name;
  let newUsername = currentUser.username;
  let newIsActive = true; // Users become active upon login by default unless it's a special account

  const specialAccountInfo = SPECIAL_ACCOUNT_DETAILS[lowerCaseLoggedInEmail];

  if (specialAccountInfo) {
    // If current name is default, update to special name. Otherwise, keep custom name.
    if (currentUser.name === defaultKathaExplorerUser.name || currentUser.name === "Katha User") {
      newName = specialAccountInfo.fixedName;
    }
    // If current username is default, update to special username. Otherwise, keep custom username.
    if (currentUser.username === defaultKathaExplorerUser.username || currentUser.username === "katha_user" || currentUser.username === loggedInEmail.split('@')[0]) {
      newUsername = specialAccountInfo.fixedUsername;
    }
    newIsActive = true; // Special accounts are always active
  } else {
    // If logging in with a regular email, but current profile name is a special admin name, reset it.
    const isCurrentlySpecialName = Object.values(SPECIAL_ACCOUNT_DETAILS).some(details => details.fixedName === currentUser.name);
    if (isCurrentlySpecialName) {
       newName = "Katha User"; // Generic name for regular users
       newUsername = loggedInEmail.split('@')[0] || "katha_user";
    }
    // For regular users, isActive will be true on login. Deactivation is handled elsewhere.
  }

  const updatedUser: MockUser = {
    ...currentUser, // Preserve other fields like bio, avatar etc. if they exist
    email: loggedInEmail,
    name: newName,
    username: newUsername,
    isActive: newIsActive,
  };
  saveKathaExplorerUser(updatedUser);
  setLoggedInStatus(true); // Set login status
};

export const CURRENT_USER_NAME = () => getKathaExplorerUser().name;


export const allMockUsers: MockUser[] = [
  { ...defaultKathaExplorerUser }, // This will be the base for the logged-in user
  { id: 'user_kritika_ceo', name: 'Kritika', username: 'Kritikasignh', avatarUrl: 'https://placehold.co/128x128.png?text=KR', avatarFallback: 'KR', dataAiHint: 'person ceo', bio: 'CEO of Katha Vault. Passionate about stories and innovation.', email: KRITIKA_EMAIL, emailVisible: true, gender: 'Female', isActive: true },
  { id: 'user_katha_owner', name: 'Katha Vault Team', username: 'kathavault', avatarUrl: 'https://placehold.co/128x128.png?text=KV', avatarFallback: 'KV', dataAiHint: 'team logo', bio: 'The official account for Katha Vault.', email: KATHAVAULT_OWNER_EMAIL, emailVisible: true, gender: 'Prefer not to say', isActive: true },
  { id: 'user_er', name: 'Elara Reads', username: 'elara_reads', avatarUrl: 'https://placehold.co/128x128.png?text=ER', avatarFallback: 'ER', dataAiHint: 'person reading', bio: 'Lover of all things fantasy and sci-fi. Always looking for the next great adventure.', email: 'elara@example.com', emailVisible: false, gender: 'Female', isActive: true },
  { id: 'user_mw', name: 'Marcus Writes', username: 'marcus_writes', avatarUrl: 'https://placehold.co/128x128.png?text=MW', avatarFallback: 'MW', dataAiHint: 'person writing', bio: 'Aspiring novelist, currently working on a historical fiction piece. Coffee enthusiast.', email: 'marcus@example.com', emailVisible: true, gender: 'Male', isActive: true },
  { id: 'user_sg', name: 'SciFi Guru', username: 'scifi_guru', avatarUrl: 'https://placehold.co/128x128.png?text=SG', avatarFallback: 'SG', dataAiHint: 'person space', bio: 'Exploring the final frontier, one book at a time. Beam me up!', email: 'scifi@example.com', emailVisible: true, gender: 'Prefer not to say', isActive: true },
  { id: 'user_ff', name: 'Fantasy Fan', username: 'fantasy_fan', avatarUrl: 'https://placehold.co/128x128.png?text=FF', avatarFallback: 'FF', dataAiHint: 'person fantasy', bio: 'Dragons, magic, and epic quests are my jam.', email: 'fantasy@example.com', emailVisible: false, gender: 'Non-binary', isActive: true },
  { id: 'user_ml', name: 'Mystery Lover', username: 'mystery_lover', avatarUrl: 'https://placehold.co/128x128.png?text=ML', avatarFallback: 'ML', dataAiHint: 'person detective', bio: 'Unraveling plots and solving crimes from my armchair.', email: 'mystery@example.com', emailVisible: true, gender: 'Female', isActive: false },
  { id: 'user_aa', name: 'Adventure Alex', username: 'adventure_alex', avatarUrl: 'https://placehold.co/128x128.png?text=AA', avatarFallback: 'AA', dataAiHint: 'person adventure', bio: 'Seeking thrills in stories and in life!', email: 'alex@example.com', emailVisible: false, gender: 'Male', isActive: true },
  { id: 'user_rh', name: 'Romance Hannah', username: 'romance_hannah', avatarUrl: 'https://placehold.co/128x128.png?text=RH', avatarFallback: 'RH', dataAiHint: 'person romance', bio: 'Hopeless romantic, give me all the happy endings.', email: 'hannah@example.com', emailVisible: true, gender: 'Female', isActive: true },
  { id: 'user_th', name: 'Thriller Tom', username: 'thriller_tom', avatarUrl: 'https://placehold.co/128x128.png?text=TT', avatarFallback: 'TT', dataAiHint: 'person thriller', bio: 'Always on the edge of my seat. The more suspense, the better!', email: 'tom@example.com', emailVisible: false, gender: 'Male', isActive: true },
].filter((user, index, self) => index === self.findIndex(u => u.id === user.id)); // Ensure unique IDs


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
  // Simulate: users who are not the current user and not followed by the current user
  return allMockUsers.filter(user => user.id !== CURRENT_USER_ID && !followingIds.includes(user.id)).slice(0, count);
};

export const getBlockedUserIds = (): string[] => {
  if (typeof window !== 'undefined') {
    const storedBlocked = localStorage.getItem(KATHA_VAULT_BLOCKED_USER_IDS_KEY);
    if (storedBlocked) {
      try {
        return JSON.parse(storedBlocked);
      } catch (e) {
        console.error("Error parsing blocked user IDs from localStorage", e);
        const defaultBlocked = ['user_th']; // Default: Thriller Tom is blocked
        localStorage.setItem(KATHA_VAULT_BLOCKED_USER_IDS_KEY, JSON.stringify(defaultBlocked));
        return defaultBlocked;
      }
    } else { // No stored data, set default
      const defaultBlocked = ['user_th'];
      localStorage.setItem(KATHA_VAULT_BLOCKED_USER_IDS_KEY, JSON.stringify(defaultBlocked));
      return defaultBlocked;
    }
  }
  return ['user_th']; // Default for SSR or if window is undefined
};

export const addBlockedUserId = (userId: string): void => {
  if (typeof window !== 'undefined') {
    const currentBlocked = getBlockedUserIds();
    if (!currentBlocked.includes(userId)) {
      const newBlocked = [...currentBlocked, userId];
      localStorage.setItem(KATHA_VAULT_BLOCKED_USER_IDS_KEY, JSON.stringify(newBlocked));
    }
  }
};

export const removeBlockedUserId = (userId: string): void => {
  if (typeof window !== 'undefined') {
    const currentBlocked = getBlockedUserIds();
    const newBlocked = currentBlocked.filter(id => id !== userId);
    localStorage.setItem(KATHA_VAULT_BLOCKED_USER_IDS_KEY, JSON.stringify(newBlocked));
  }
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
        novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels)); // Deep copy
        localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novelsFromStorage));
      }
    } else {
      novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels)); // Deep copy
      localStorage.setItem(KATHA_VAULT_MANAGED_NOVELS_KEY, JSON.stringify(novelsFromStorage));
    }
  } else {
    // For SSR or non-browser environments, return a deep copy of initial mocks
    novelsFromStorage = JSON.parse(JSON.stringify(initialMockNovels));
  }

  // Ensure all novels have default values for potentially missing fields
  const processedNovels = novelsFromStorage.map(novel => ({
    ...novel,
    status: novel.status || 'draft', // Default to draft if status is missing
    views: novel.views ?? 0, // Default to 0 if views is missing
    rating: novel.rating ?? 0, // Default to 0 if rating is missing
    homePageFeaturedGenre: novel.homePageFeaturedGenre === undefined ? null : novel.homePageFeaturedGenre,
    chapters: Array.isArray(novel.chapters) && novel.chapters.length > 0 ? novel.chapters.map(ch => ({
        id: ch.id || `ch-random-${Math.random().toString(36).substring(2, 9)}`,
        title: ch.title || 'Untitled Chapter',
        content: ch.content || 'No content available.'
    })) : [{id: `fallback-ch-${novel.id}`, title: 'Chapter 1', content: defaultChapterContent(novel.title, 1, 'Chapter 1')}], // Ensure at least one chapter for structure
  }));

  // Determine trending novels based on views of PUBLISHED novels
  const publishedNovels = processedNovels.filter(n => n.status === 'published');
  const sortedByViews = [...publishedNovels].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const TRENDING_COUNT = 3; // Number of novels to mark as trending

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

// Default configuration for home page sections
const defaultHomeConfig: HomeLayoutConfig = {
  selectedGenres: ['Sci-Fi', 'Fantasy', 'Romance'], // Default genres to show sections for
  showMoreNovelsSection: true, // Default to show the "More Novels" section
};

export const getHomeSectionsConfig = (): HomeLayoutConfig => {
  if (typeof window !== 'undefined') {
    const storedConfig = localStorage.getItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        // Basic validation to ensure the stored config has the expected shape
        if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.selectedGenres) && typeof parsed.showMoreNovelsSection === 'boolean') {
          return parsed as HomeLayoutConfig;
        }
        // If malformed, log warning, set default, and return default
        console.warn("Home sections config in localStorage is malformed. Reverting to default.");
        localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(defaultHomeConfig));
        return defaultHomeConfig;
      } catch (e) {
        console.error("Error parsing home sections config from localStorage", e);
        // On error, set default and return default
        localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(defaultHomeConfig));
        return defaultHomeConfig;
      }
    }
    // No config stored, set default and return it
    localStorage.setItem(KATHA_VAULT_HOME_SECTIONS_CONFIG_KEY, JSON.stringify(defaultHomeConfig));
    return defaultHomeConfig;
  }
  // For SSR or non-browser, return default
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


// Function to check if a user is active. Prioritizes logged-in user's status.
export const isUserActive = (userId: string): boolean => {
  if (typeof window === 'undefined') return true; // Assume active on server

  if (userId === CURRENT_USER_ID) {
    return getKathaExplorerUser().isActive;
  }
  const user = allMockUsers.find(u => u.id === userId);
  return user ? user.isActive : false; // Default to false if user not found, though ideally all interacting users should be in allMockUsers
};


// -- Chapter Comments --
const defaultStoredChapterComments: StoredChapterComment[] = [
  {
    id: 'chapcomment-1-1',
    novelId: 'trend-1', // Belongs to "The Whispers of Chronos"
    chapterId: 'chronos-ch-1', // Belongs to Chapter 1 of "The Whispers of Chronos"
    authorId: 'user_er', // Elara Reads
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
        authorId: 'user_mw', // Marcus Writes
        authorName: 'Marcus Writes',
        authorAvatarUrl: 'https://placehold.co/40x40.png?text=MW',
        authorInitials: 'MW',
        text: 'Agreed, Elara! The pacing is excellent and the mystery is already building.',
        timestamp: '1 day ago',
        commentLikes: 7,
        isCommentLikedByUser: true, // Example: Marcus liked his own reply or another user did
        replies: [],
      },
    ],
  },
  {
    id: 'chapcomment-1-2',
    novelId: 'trend-1', // Belongs to "The Whispers of Chronos"
    chapterId: 'chronos-ch-2', // Belongs to Chapter 2 of "The Whispers of Chronos"
    authorId: 'user_sg', // SciFi Guru
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
    novelId: 'trend-2', // Belongs to "Beneath the Emerald Canopy"
    chapterId: 'canopy-ch-1', // Belongs to Chapter 1 of "Beneath the Emerald Canopy"
    authorId: 'user_ff', // Fantasy Fan
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
        // Fallback to default if parsing fails
      }
    }
    // If no comments stored or parsing failed, set default and return
    localStorage.setItem(KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY, JSON.stringify(defaultStoredChapterComments));
    return defaultStoredChapterComments;
  }
  // For SSR or non-browser, return a deep copy of defaults
  return JSON.parse(JSON.stringify(defaultStoredChapterComments));
};

export const saveStoredChapterComments = (comments: StoredChapterComment[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KATHA_VAULT_STORED_CHAPTER_COMMENTS_KEY, JSON.stringify(comments));
  }
};

// Helper for social feed posts
export const getSocialFeedPostsFromStorage = (): FeedItemCardProps[] => {
    if (typeof window !== 'undefined') {
        const storedPosts = localStorage.getItem(SOCIAL_FEED_POSTS_STORAGE_KEY);
        if (storedPosts) {
            try {
                return JSON.parse(storedPosts) as FeedItemCardProps[];
            } catch (e) {
                console.error("Error parsing social feed posts from localStorage", e);
                // Optionally, set to default or empty array and save
            }
        }
        // If no posts stored, return empty array (or initialize with defaults if desired)
        // localStorage.setItem(SOCIAL_FEED_POSTS_STORAGE_KEY, JSON.stringify([])); // Example: init empty
    }
    return []; // Default empty if not in browser or no data
};
