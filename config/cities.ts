import { Collection } from '@/types/restaurant';

export interface CityConfig {
  name: string;
  shortName: string;
  coordinates: { lat: number; lng: number };
  filterPattern: RegExp;
  greeting: string;
  subtitle: string;
  neighborhoodImages: Record<string, string>;
  mockCollections: Collection[];
  sectionOrder: 'localFirst' | 'trendingFirst';
}

export const NYC_CONFIG: CityConfig = {
  name: 'NYC',
  shortName: 'nyc',
  coordinates: { lat: 40.7128, lng: -74.0060 },
  filterPattern: /new york|manhattan|brooklyn|queens|bronx|soho|east village|upper east side|midtown|ny|nyc/i,
  greeting: 'Discover NYC',
  subtitle: 'The best of New York City dining',
  sectionOrder: 'localFirst',
  neighborhoodImages: {
    'Midtown': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'Greenwich Village': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'Gramercy': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'SoHo': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
    'East Village': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Upper East Side': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'Upper West Side': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'Brooklyn': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'Williamsburg': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'Bushwick': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Queens': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    'Long Island City': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'Manhattan': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'Chelsea': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'Chinatown': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Columbus Circle': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'Downtown': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    'Flatiron District': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'Lower East Side': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Murray Hill': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'West Village': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'default': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400'
  },
  mockCollections: [
    {
      id: 'nyc-mock-1',
      name: 'NYC Weekend Brunch Spots',
      description: 'The best places for a leisurely weekend brunch in NYC',
      cover_image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      created_by: 'NYC Food Lover',
      creator_id: 'mock-user-1',
      occasion: 'brunch',
      is_public: true,
      likes: 156,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.5,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.7,
      restaurant_ids: ['1', '2', '3'],
      collaborators: ['mock-user-1', 'mock-user-2'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nyc-mock-2',
      name: 'Manhattan Date Night Favorites',
      description: 'Romantic restaurants perfect for special occasions in Manhattan',
      cover_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      created_by: 'NYC Romance Expert',
      creator_id: 'mock-user-2',
      occasion: 'date_night',
      is_public: true,
      likes: 89,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.3,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.6,
      restaurant_ids: ['1', '5', '8'],
      collaborators: ['mock-user-2', 'mock-user-3'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'nyc-mock-3',
      name: 'Brooklyn Quick Lunch Options',
      description: 'Fast, delicious lunch spots for busy Brooklyn professionals',
      cover_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      created_by: 'Brooklyn Lunch Hunter',
      creator_id: 'mock-user-3',
      occasion: 'lunch',
      is_public: true,
      likes: 234,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.4,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.5,
      restaurant_ids: ['2', '4', '6'],
      collaborators: ['mock-user-3', 'mock-user-4'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

export const LA_CONFIG: CityConfig = {
  name: 'LA',
  shortName: 'la',
  coordinates: { lat: 34.0522, lng: -118.2437 },
  filterPattern: /los angeles|hollywood|beverly hills|santa monica|west hollywood|downtown|venice|koreatown|silver lake|arts district|fairfax|mid-city|little tokyo|macarthur park|chinatown|palms|la|california|ca/i,
  greeting: 'Discover LA',
  subtitle: 'The best of Los Angeles dining',
  sectionOrder: 'localFirst',
  neighborhoodImages: {
    'Los Angeles': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400',
    'Hollywood': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'Beverly Hills': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    'Santa Monica': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'West Hollywood': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'Downtown LA': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400',
    'Downtown': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'Venice': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'Koreatown': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'Silver Lake': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    'Arts District': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    'Fairfax': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'Mid-City': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    'Little Tokyo': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400',
    'MacArthur Park': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'Chinatown': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    'Palms': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400',
    'Multiple': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'default': 'https://images.unsplash.com/photo-1546412414-e1885d3d8d6a?w=400'
  },
  mockCollections: [
    {
      id: 'la-mock-1',
      name: 'LA Weekend Brunch Spots',
      description: 'The best places for a leisurely weekend brunch in Los Angeles',
      cover_image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      created_by: 'LA Food Lover',
      creator_id: 'mock-user-1',
      occasion: 'brunch',
      is_public: true,
      likes: 156,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.5,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.7,
      restaurant_ids: ['la-1', 'la-2', 'la-3'],
      collaborators: ['mock-user-1', 'mock-user-2'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'la-mock-2',
      name: 'Hollywood Date Night Favorites',
      description: 'Romantic restaurants perfect for special occasions in Hollywood',
      cover_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      created_by: 'LA Romance Expert',
      creator_id: 'mock-user-2',
      occasion: 'date_night',
      is_public: true,
      likes: 89,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.3,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.6,
      restaurant_ids: ['la-1', 'la-5', 'la-8'],
      collaborators: ['mock-user-2', 'mock-user-3'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'la-mock-3',
      name: 'Venice Beach Quick Lunch Options',
      description: 'Fast, delicious lunch spots for busy Venice Beach professionals',
      cover_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      created_by: 'Venice Lunch Hunter',
      creator_id: 'mock-user-3',
      occasion: 'lunch',
      is_public: true,
      likes: 234,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.4,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.5,
      restaurant_ids: ['la-2', 'la-4', 'la-6'],
      collaborators: ['mock-user-3', 'mock-user-4'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Example of how easy it is to add a new city
export const CHICAGO_CONFIG: CityConfig = {
  name: 'Chicago',
  shortName: 'chicago',
  coordinates: { lat: 41.8781, lng: -87.6298 },
  filterPattern: /chicago|loop|river north|gold coast|lincoln park|wicker park|bucktown|west loop|south loop|illinois|il/i,
  greeting: 'Discover Chicago',
  subtitle: 'The best of Chicago dining',
  sectionOrder: 'localFirst',
  neighborhoodImages: {
    'The Loop': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'River North': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'Gold Coast': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    'Lincoln Park': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
    'Wicker Park': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'West Loop': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'South Loop': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    'Bucktown': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    'default': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400'
  },
  mockCollections: [
    {
      id: 'chicago-mock-1',
      name: 'Chicago Deep Dish Spots',
      description: 'The best places for authentic Chicago deep dish pizza',
      cover_image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
      created_by: 'Chicago Pizza Lover',
      creator_id: 'mock-user-1',
      occasion: 'dinner',
      is_public: true,
      likes: 156,
      equal_voting: true,
      admin_weighted: false,
      expertise_weighted: false,
      minimum_participation: 0.5,
      voting_deadline: undefined,
      allow_vote_changes: true,
      anonymous_voting: false,
      vote_visibility: 'public',
      discussion_enabled: true,
      auto_ranking_enabled: true,
      consensus_threshold: 0.7,
      restaurant_ids: ['chicago-1', 'chicago-2', 'chicago-3'],
      collaborators: ['mock-user-1', 'mock-user-2'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Easy to extend for new cities
export const CITIES = {
  nyc: NYC_CONFIG,
  la: LA_CONFIG,
  // chicago: CHICAGO_CONFIG, // Uncomment to add Chicago
} as const;

export type CityKey = keyof typeof CITIES;

// Helper function to get city config by key
export const getCityConfig = (cityKey: CityKey): CityConfig => {
  return CITIES[cityKey];
};

// Helper function to get all available cities
export const getAvailableCities = (): CityKey[] => {
  return Object.keys(CITIES) as CityKey[];
};
