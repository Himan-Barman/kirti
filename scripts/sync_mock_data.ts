import fs from 'fs';
import path from 'path';

const DATASET_PATH = path.resolve('data/pandals_master.json');
const MOCK_DATA_PATH = path.resolve('src/lib/mockData.ts');

const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
const data = JSON.parse(raw);

const IMAGES = [
  'https://images.unsplash.com/photo-1601056641838-8c1173663673?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80'
];

const mappedPandals = data.pandals.map((p: any, idx: number) => {
  let zone: string = 'South Kolkata';
  const z = (p.zone || '').toLowerCase();
  if (z.includes('north')) zone = 'North Kolkata';
  else if (z.includes('central')) zone = 'Central Kolkata';
  else if (z.includes('east') || z.includes('salt')) zone = 'Salt Lake & East';
  else if (z.includes('west') || z.includes('howrah')) zone = 'Howrah';

  return {
    id: p.id || `pandal_${idx + 1}`,
    name: p.name,
    slug: p.slug || p.id,
    description: p.description || `${p.name} is one of Kolkata's most celebrated Durga Puja celebrations.`,
    address: p.address || `${p.name}, Kolkata`,
    zone: zone,
    city: 'Kolkata',
    latitude: Number(p.latitude) || 22.5726,
    longitude: Number(p.longitude) || 88.3639,
    image_url: IMAGES[idx % IMAGES.length],
    theme_year: p.theme || 'Durga Puja 2026 Masterwork'
  };
});

let mockFileContent = `import type { Pandal, Profile, Rating, FriendActivity } from '../types/database.types';

export const INITIAL_USER: Profile = {
  id: 'user_me',
  username: 'himan_b',
  display_name: 'Himan Barman',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Exploring Kolkata Puja pandals one by one • South & North enthusiast',
  created_at: '2026-08-01T10:00:00Z',
};

export const MOCK_FRIENDS: Profile[] = [
  {
    id: 'user_ananya',
    username: 'ananya_r',
    display_name: 'Ananya Roy',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Photographer & Puja hopper. Tracking every pandal in South Kolkata.',
    created_at: '2026-08-10T10:00:00Z',
  },
  {
    id: 'user_rahul',
    username: 'rahul_m',
    display_name: 'Rahul Mukherjee',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Traditional Bonedi Bari and North Kolkata pandal fan.',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'user_priya',
    username: 'priya_sen',
    display_name: 'Priya Sen',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'All-night pandal hopper. Coffee, dhak, and architecture.',
    created_at: '2026-08-15T10:00:00Z',
  },
  {
    id: 'user_sourav',
    username: 'sourav_d',
    display_name: 'Sourav Das',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Salt Lake & East Kolkata local guide.',
    created_at: '2026-08-18T10:00:00Z',
  },
  {
    id: 'user_debolina',
    username: 'debolina_d',
    display_name: 'Debolina Dutta',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    bio: 'Minimalist idol appreciator • Art curator in Kolkata',
    created_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'user_rittik',
    username: 'rittik_b',
    display_name: 'Rittik Bhattacharya',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    bio: 'Dhak beats & street food enthusiast.',
    created_at: '2026-08-22T10:00:00Z',
  }
];

export const OTHER_USERS: Profile[] = [
  {
    id: 'user_tanmay',
    username: 'tanmay_k',
    display_name: 'Tanmay Karmakar',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    bio: 'Lighting design reviewer. Chandannagar fan.',
    created_at: '2026-08-25T10:00:00Z',
  },
  {
    id: 'user_swagata',
    username: 'swagata_b',
    display_name: 'Swagata Banerjee',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Bonedi Bari heritage walk organizer.',
    created_at: '2026-08-26T10:00:00Z',
  }
];

export const MOCK_PANDALS: Pandal[] = ${JSON.stringify(mappedPandals, null, 2)};

export const INITIAL_VISITS = [
  { userId: 'user_me', pandalId: '${mappedPandals[0]?.id}', visitedAt: '2026-08-28T18:30:00Z' },
  { userId: 'user_me', pandalId: '${mappedPandals[1]?.id}', visitedAt: '2026-08-28T20:15:00Z' },
  { userId: 'user_me', pandalId: '${mappedPandals[2]?.id}', visitedAt: '2026-08-29T17:45:00Z' },
  { userId: 'user_me', pandalId: '${mappedPandals[3]?.id}', visitedAt: '2026-08-29T21:10:00Z' },
  { userId: 'user_ananya', pandalId: '${mappedPandals[0]?.id}', visitedAt: '2026-08-28T19:00:00Z' },
  { userId: 'user_ananya', pandalId: '${mappedPandals[1]?.id}', visitedAt: '2026-08-28T21:00:00Z' },
  { userId: 'user_ananya', pandalId: '${mappedPandals[4]?.id}', visitedAt: '2026-08-29T18:00:00Z' },
  { userId: 'user_rahul', pandalId: '${mappedPandals[0]?.id}', visitedAt: '2026-08-28T19:30:00Z' },
  { userId: 'user_rahul', pandalId: '${mappedPandals[2]?.id}', visitedAt: '2026-08-29T18:30:00Z' },
  { userId: 'user_priya', pandalId: '${mappedPandals[1]?.id}', visitedAt: '2026-08-28T20:30:00Z' },
];

export const INITIAL_RATINGS: Rating[] = [
  {
    id: 'r_1',
    user_id: 'user_me',
    pandal_id: '${mappedPandals[0]?.id}',
    rating: 5,
    review: 'Extraordinary clay craftsmanship and dignified atmosphere. The lighting accentuates every fine curve of the idol.',
    created_at: '2026-08-28T19:00:00Z',
    user: INITIAL_USER
  },
  {
    id: 'r_2',
    user_id: 'user_ananya',
    pandal_id: '${mappedPandals[0]?.id}',
    rating: 5,
    review: 'Masterclass in theme execution. One of the top 3 pandals in Kolkata this year without question.',
    created_at: '2026-08-28T19:30:00Z',
    user: MOCK_FRIENDS[0]
  },
  {
    id: 'r_3',
    user_id: 'user_rahul',
    pandal_id: '${mappedPandals[1]?.id}',
    rating: 5,
    review: 'Unmatched scale and magnificent lighting. Highly recommended visiting late night to avoid peak queue.',
    created_at: '2026-08-28T21:30:00Z',
    user: MOCK_FRIENDS[1]
  }
];

export const INITIAL_ACTIVITIES: FriendActivity[] = [
  {
    id: 'act_1',
    type: 'visit',
    user: MOCK_FRIENDS[0],
    pandalName: '${mappedPandals[0]?.name}',
    pandalId: '${mappedPandals[0]?.id}',
    timestamp: '15 mins ago'
  },
  {
    id: 'act_2',
    type: 'rating',
    user: MOCK_FRIENDS[1],
    pandalName: '${mappedPandals[1]?.name}',
    pandalId: '${mappedPandals[1]?.id}',
    rating: 5,
    review: 'Grand architectural marvel. Absolutely spellbinding lighting display.',
    timestamp: '42 mins ago'
  }
];
`;

fs.writeFileSync(MOCK_DATA_PATH, mockFileContent, 'utf-8');
console.log(`Updated mockData.ts with ${mappedPandals.length} pandals!`);
