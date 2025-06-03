
export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  dataAiHint?: string;
}

export const CURRENT_USER_ID = 'user_ke'; // Katha Explorer's ID

export const kathaExplorerUser: MockUser = {
  id: CURRENT_USER_ID,
  name: 'Katha Explorer',
  username: 'katha_explorer',
  avatarUrl: 'https://placehold.co/128x128.png',
  avatarFallback: 'KE',
  dataAiHint: 'person explorer',
};

export const allMockUsers: MockUser[] = [
  kathaExplorerUser,
  { id: 'user_er', name: 'Elara Reads', username: 'elara_reads', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ER', dataAiHint: 'person reading' },
  { id: 'user_mw', name: 'Marcus Writes', username: 'marcus_writes', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'MW', dataAiHint: 'person writing' },
  { id: 'user_sf', name: 'SciFi Guru', username: 'scifi_guru', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'SG', dataAiHint: 'person space' },
  { id: 'user_ff', name: 'Fantasy Fan', username: 'fantasy_fan', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'FF', dataAiHint: 'person fantasy' },
  { id: 'user_ml', name: 'Mystery Lover', username: 'mystery_lover', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'ML', dataAiHint: 'person detective' },
  { id: 'user_aa', name: 'Adventure Alex', username: 'adventure_alex', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'AA', dataAiHint: 'person adventure' },
  { id: 'user_rh', name: 'Romance Hannah', username: 'romance_hannah', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'RH', dataAiHint: 'person romance' },
  { id: 'user_th', name: 'Thriller Tom', username: 'thriller_tom', avatarUrl: 'https://placehold.co/40x40.png', avatarFallback: 'TT', dataAiHint: 'person thriller' },
];

export const kathaExplorerFollowingIds: string[] = ['user_er', 'user_mw', 'user_ff']; // Elara, Marcus, Fantasy Fan

export const getKathaExplorerFollowingList = (): MockUser[] => {
  return allMockUsers.filter(user => kathaExplorerFollowingIds.includes(user.id));
};
