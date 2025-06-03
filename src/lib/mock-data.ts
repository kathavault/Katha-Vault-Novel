
export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  dataAiHint?: string;
  bio?: string; // Added for public profiles
  email?: string; // Added for public profiles
  emailVisible?: boolean; // Added
  gender?: string; // Added
}

export const CURRENT_USER_ID = 'user_ke'; // Katha Explorer's ID
export const CURRENT_USER_NAME = 'Katha Explorer'; // Consistent name

const KATHA_EXPLORER_FOLLOWING_IDS_KEY = 'kathaExplorerFollowingIds';

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

// Function to get initial following IDs, defaulting if localStorage is empty
export const getInitialFollowingIds = (): string[] => {
  if (typeof window !== 'undefined') {
    const storedFollowing = localStorage.getItem(KATHA_EXPLORER_FOLLOWING_IDS_KEY);
    if (storedFollowing) {
      try {
        return JSON.parse(storedFollowing);
      } catch (e) {
        console.error("Error parsing following IDs from localStorage", e);
        return ['user_er', 'user_mw', 'user_ff']; // Default on error
      }
    }
  }
  return ['user_er', 'user_mw', 'user_ff']; // Default if no localStorage or server-side
};

// Function to update following IDs in localStorage
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
  // Simulate followers: users who are not the current user and not followed by the current user.
  const followingIds = getInitialFollowingIds();
  return allMockUsers.filter(user => user.id !== CURRENT_USER_ID && !followingIds.includes(user.id)).slice(0, count);
}
