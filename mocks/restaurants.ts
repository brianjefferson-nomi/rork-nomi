import { Restaurant, Collection, RestaurantContributor, RestaurantVote, RestaurantDiscussion } from '@/types/restaurant';

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Le Bernardin',
    cuisine: 'French Seafood',
    priceRange: '$$$$',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    images: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
    ],
    address: '155 West 51st Street',
    neighborhood: 'Midtown',
    hours: 'Mon-Sat 5:30-10:30pm',
    vibe: ['Fine Dining', 'Special Occasion', 'Romantic'],
    description: 'Exquisite French seafood in an elegant setting. Perfect for celebrations.',
    aiDescription: 'A temple to seafood excellence where Chef Eric Ripert transforms the ocean\'s bounty into transcendent culinary art. The serene blue-toned dining room creates an underwater ambiance that perfectly complements the pristine fish preparations.',
    aiVibes: ['Luxurious', 'Sophisticated', 'Intimate', 'Prestigious'],
    aiTopPicks: ['Thinly Pounded Yellowfin Tuna', 'Wild Striped Bass Ceviche', 'Chocolate Soufflé'],
    menuHighlights: ['Tuna Carpaccio', 'Lobster Tail', 'Black Bass'],
    rating: 4.9,
    userNotes: 'Book at least 2 weeks ahead. Ask for the wine pairing!',
    bookingUrl: 'https://www.opentable.com/r/le-bernardin-new-york',
    contributors: [
      {
        id: 'c1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        thumbsUp: 24,
        contributions: ['Review', 'Photos']
      },
      {
        id: 'c2',
        name: 'Marcus Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        thumbsUp: 18,
        contributions: ['Review', 'Menu Tips']
      }
    ]
  },
  {
    id: '2',
    name: "Joe's Pizza",
    cuisine: 'Italian',
    priceRange: '$',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800'
    ],
    address: '7 Carmine Street',
    neighborhood: 'Greenwich Village',
    hours: 'Daily 10am-4am',
    vibe: ['Casual', 'Late Night', 'Quick Bite'],
    description: 'NYC institution serving classic New York slices since 1975.',
    aiDescription: 'The quintessential New York pizza experience where thin-crust perfection meets no-nonsense service. A Greenwich Village landmark that has fed generations of New Yorkers with consistently excellent slices.',
    aiVibes: ['Authentic', 'No-frills', 'Iconic', 'Bustling'],
    aiTopPicks: ['Plain Cheese Slice', 'Pepperoni', 'Fresh Mozzarella'],
    menuHighlights: ['Classic Cheese', 'Pepperoni', 'Sicilian Square'],
    rating: 4.7,
    bookingUrl: 'https://www.joespizzanyc.com/',
    contributors: [
      {
        id: 'c3',
        name: 'Tony Ricci',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        thumbsUp: 31,
        contributions: ['Review', 'Local Tips']
      }
    ]
  },
  {
    id: '3',
    name: 'Gramercy Tavern',
    cuisine: 'American',
    priceRange: '$$$',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '42 E 20th Street',
    neighborhood: 'Gramercy',
    hours: 'Daily 12pm-10pm',
    vibe: ['Upscale Casual', 'Business Lunch', 'Date Night'],
    description: 'Seasonal American cuisine in a landmark tavern setting.',
    aiDescription: 'A warm and welcoming tavern that epitomizes American hospitality with seasonal ingredients and rustic elegance. The amber-lit dining room buzzes with the energy of New Yorkers celebrating life\'s moments.',
    aiVibes: ['Warm', 'Welcoming', 'Seasonal', 'Rustic-elegant'],
    aiTopPicks: ['Roasted Chicken for Two', 'Seasonal Tart', 'Greenmarket Salad'],
    menuHighlights: ['Roasted Chicken', 'Mushroom Tart', 'Seasonal Vegetables'],
    rating: 4.8,
    userNotes: 'The bar area is great for walk-ins!',
    contributors: [
      {
        id: 'c7',
        name: 'Jennifer Walsh',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100',
        thumbsUp: 19,
        contributions: ['Review', 'Walk-in Tips']
      }
    ]
  },
  {
    id: '4',
    name: "Xi'an Famous Foods",
    cuisine: 'Chinese',
    priceRange: '$',
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800',
    images: [
      'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
      'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=800'
    ],
    address: '45 Bayard Street',
    neighborhood: 'Chinatown',
    hours: 'Daily 11am-9pm',
    vibe: ['Casual', 'Quick Bite', 'Authentic'],
    description: "Hand-pulled noodles and authentic Xi'an street food.",
    aiDescription: 'A no-frills noodle shop that brings the bold, spicy flavors of Xi\'an street food to New York. Watch noodle masters hand-pull fresh noodles while you wait for your fiery bowl of comfort.',
    aiVibes: ['Spicy', 'Authentic', 'Fast-casual', 'Bold'],
    aiTopPicks: ['Biang Biang Noodles', 'Spicy Cumin Lamb Noodles', 'Pork & Chive Dumplings'],
    menuHighlights: ['Biang Biang Noodles', 'Lamb Burger', 'Spicy Cumin Lamb'],
    rating: 4.6,
    contributors: [
      {
        id: 'c8',
        name: 'Michael Chang',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        thumbsUp: 35,
        contributions: ['Review', 'Spice Level Guide']
      }
    ]
  },
  {
    id: '5',
    name: 'Carbone',
    cuisine: 'Italian-American',
    priceRange: '$$$$',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'
    ],
    address: '181 Thompson Street',
    neighborhood: 'Greenwich Village',
    hours: 'Mon-Sun 5:30pm-11pm',
    vibe: ['Scene', 'Special Occasion', 'Classic'],
    description: 'Glamorous Italian-American with tableside Caesar and spicy rigatoni.',
    aiDescription: 'A theatrical celebration of mid-century Italian-American dining where every meal feels like a performance. The energy is electric, the service is choreographed, and the food delivers on both nostalgia and innovation.',
    aiVibes: ['Glamorous', 'Energetic', 'Theatrical', 'Exclusive'],
    aiTopPicks: ['Spicy Rigatoni Vodka', 'Lobster Fra Diavolo', 'Tableside Caesar'],
    menuHighlights: ['Spicy Rigatoni', 'Veal Parmesan', 'Caesar Salad'],
    rating: 4.8,
    userNotes: 'Impossible to get a reservation - try calling for bar seats!',
    bookingUrl: 'https://resy.com/cities/ny/carbone-new-york?date=today',
    contributors: [
      {
        id: 'c4',
        name: 'Isabella Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        thumbsUp: 42,
        contributions: ['Review', 'Photos', 'Reservation Tips']
      },
      {
        id: 'c5',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        thumbsUp: 15,
        contributions: ['Review']
      }
    ]
  },
  {
    id: '6',
    name: 'Levain Bakery',
    cuisine: 'Bakery',
    priceRange: '$',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800'
    ],
    address: '167 W 74th Street',
    neighborhood: 'Upper West Side',
    hours: 'Daily 8am-10pm',
    vibe: ['Casual', 'Sweet Treat', 'Iconic'],
    description: 'Famous for 6oz cookies that are crispy outside, gooey inside.',
    aiDescription: 'A cookie lover\'s paradise where massive, warm cookies emerge from the oven with crispy edges and molten centers. The aroma alone draws crowds to this Upper West Side institution.',
    aiVibes: ['Indulgent', 'Comforting', 'Sweet', 'Iconic'],
    aiTopPicks: ['Chocolate Chip Walnut Cookie', 'Dark Chocolate Peanut Butter', 'Two Chip Chocolate Chip'],
    menuHighlights: ['Chocolate Chip Walnut', 'Dark Chocolate Peanut Butter', 'Oatmeal Raisin'],
    rating: 4.9,
    contributors: [
      {
        id: 'c9',
        name: 'Amy Foster',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        thumbsUp: 22,
        contributions: ['Review', 'Cookie Guide']
      }
    ]
  },
  {
    id: '7',
    name: "Katz's Delicatessen",
    cuisine: 'Deli',
    priceRange: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
    images: [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    ],
    address: '205 E Houston Street',
    neighborhood: 'Lower East Side',
    hours: 'Daily 8am-10:45pm',
    vibe: ['Historic', 'Tourist Spot', 'Casual'],
    description: 'Since 1888. Home of the legendary pastrami on rye.',
    aiDescription: 'A living piece of New York history where the art of Jewish deli cuisine has been perfected over 130+ years. The bustling atmosphere and towering sandwiches create an authentic Lower East Side experience.',
    aiVibes: ['Historic', 'Bustling', 'Authentic', 'Legendary'],
    aiTopPicks: ['Pastrami on Rye', 'Corned Beef Sandwich', 'Matzo Ball Soup'],
    menuHighlights: ['Pastrami Sandwich', 'Matzo Ball Soup', 'Reuben'],
    rating: 4.5,
    userNotes: "Get a ticket when you enter and don't lose it!",
    contributors: [
      {
        id: 'c10',
        name: 'Robert Goldman',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        thumbsUp: 27,
        contributions: ['Review', 'Historical Context']
      }
    ]
  },
  {
    id: '8',
    name: 'The Spotted Pig',
    cuisine: 'Gastropub',
    priceRange: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800'
    ],
    address: '314 W 11th Street',
    neighborhood: 'West Village',
    hours: 'Daily 12pm-2am',
    vibe: ['Lively', 'Late Night', 'Groups'],
    description: 'Bustling gastropub with a Michelin star and amazing burger.',
    aiDescription: 'A cozy yet buzzing gastropub that elevated pub food to Michelin-starred heights. The intimate space fills with laughter and conversation as diners enjoy elevated comfort food in a genuinely welcoming atmosphere.',
    aiVibes: ['Cozy', 'Buzzing', 'Unpretentious', 'Warm'],
    aiTopPicks: ['Chargrilled Burger with Roquefort', 'Gnudi with Brown Butter', 'Bone Marrow'],
    menuHighlights: ['Chargrilled Burger', 'Deviled Eggs', 'Bone Marrow'],
    rating: 4.4,
    contributors: [
      {
        id: 'c6',
        name: 'Emma Thompson',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        thumbsUp: 28,
        contributions: ['Review', 'Photos']
      }
    ]
  }
];

export const mockCollections: Collection[] = [
  {
    id: 'c1',
    name: 'Birthday Dinner Spots 🎂',
    description: 'Perfect places to celebrate with a group',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    restaurants: ['1', '3', '5'],
    createdBy: 'user1',
    collaborators: [
      {
        userId: 'user1',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        role: 'admin',
        joinedAt: new Date('2024-01-15'),
        voteWeight: 1,
        isVerified: true,
        expertise: ['Fine Dining', 'Wine Pairing']
      },
      {
        userId: 'user2',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        role: 'member',
        joinedAt: new Date('2024-01-16'),
        voteWeight: 1,
        isVerified: false
      },
      {
        userId: 'user3',
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        role: 'member',
        joinedAt: new Date('2024-01-17'),
        voteWeight: 1,
        isVerified: true,
        expertise: ['Local Expert']
      }
    ],
    createdAt: new Date('2024-01-15'),
    occasion: 'Birthday',
    isPublic: true,
    likes: 24,
    votingRules: {
      equalVoting: true,
      adminWeighted: false,
      expertiseWeighted: false,
      minimumParticipation: 2,
      allowVoteChanges: true,
      anonymousVoting: false
    },
    settings: {
      voteVisibility: 'public',
      discussionEnabled: true,
      autoRankingEnabled: true,
      consensusThreshold: 0.7
    },
    analytics: {
      totalVotes: 12,
      participationRate: 0.85,
      consensusScore: 0.73,
      topInfluencers: ['user1', 'user3'],
      votingPatterns: { 'user1': 8, 'user2': 6, 'user3': 9 },
      decisionTimeline: []
    }
  },
  {
    id: 'c2',
    name: 'Best Late Night Eats 🌙',
    description: 'When you need food after midnight',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    restaurants: ['2', '8'],
    createdBy: 'user1',
    collaborators: [
      {
        userId: 'user1',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        role: 'admin',
        joinedAt: new Date('2024-01-20'),
        voteWeight: 1,
        isVerified: true
      }
    ],
    createdAt: new Date('2024-01-20'),
    occasion: 'Late Night',
    isPublic: true,
    likes: 18,
    votingRules: {
      equalVoting: true,
      adminWeighted: false,
      expertiseWeighted: false,
      minimumParticipation: 1,
      allowVoteChanges: true,
      anonymousVoting: false
    },
    settings: {
      voteVisibility: 'public',
      discussionEnabled: true,
      autoRankingEnabled: true,
      consensusThreshold: 0.7
    }
  },
  {
    id: 'c3',
    name: 'Cheap & Cheerful 💰',
    description: "Great food that won't break the bank",
    coverImage: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800',
    restaurants: ['2', '4', '6'],
    createdBy: 'user2',
    collaborators: [
      {
        userId: 'user2',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        role: 'admin',
        joinedAt: new Date('2024-01-25'),
        voteWeight: 1,
        isVerified: false
      },
      {
        userId: 'user1',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        role: 'member',
        joinedAt: new Date('2024-01-26'),
        voteWeight: 1,
        isVerified: true
      }
    ],
    createdAt: new Date('2024-01-25'),
    isPublic: true,
    likes: 32,
    votingRules: {
      equalVoting: true,
      adminWeighted: false,
      expertiseWeighted: false,
      minimumParticipation: 1,
      allowVoteChanges: true,
      anonymousVoting: false
    },
    settings: {
      voteVisibility: 'public',
      discussionEnabled: true,
      autoRankingEnabled: true,
      consensusThreshold: 0.6
    }
  },
  {
    id: 'c4',
    name: 'Date Night Winners 💕',
    description: 'Romantic spots that never disappoint',
    coverImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    restaurants: ['1', '3', '5'],
    createdBy: 'user3',
    collaborators: [
      {
        userId: 'user3',
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        role: 'admin',
        joinedAt: new Date('2024-02-01'),
        voteWeight: 1,
        isVerified: true,
        expertise: ['Romantic Dining']
      }
    ],
    createdAt: new Date('2024-02-01'),
    occasion: 'Date Night',
    isPublic: true,
    likes: 45,
    votingRules: {
      equalVoting: false,
      adminWeighted: true,
      expertiseWeighted: true,
      minimumParticipation: 1,
      allowVoteChanges: true,
      anonymousVoting: false
    },
    settings: {
      voteVisibility: 'public',
      discussionEnabled: true,
      autoRankingEnabled: true,
      consensusThreshold: 0.8
    }
  }
];

// Mock vote data for collaborative features
export const mockVotes = [
  // Birthday collection votes
  { restaurantId: '1', userId: 'user1', collectionId: 'c1', vote: 'like', timestamp: '2024-01-16T10:00:00Z', reason: 'Perfect for special occasions' },
  { restaurantId: '1', userId: 'user2', collectionId: 'c1', vote: 'like', timestamp: '2024-01-16T11:00:00Z', reason: 'Amazing food quality' },
  { restaurantId: '1', userId: 'user3', collectionId: 'c1', vote: 'dislike', timestamp: '2024-01-16T12:00:00Z', reason: 'Too expensive for our group' },
  
  { restaurantId: '3', userId: 'user1', collectionId: 'c1', vote: 'like', timestamp: '2024-01-17T10:00:00Z', reason: 'Great atmosphere' },
  { restaurantId: '3', userId: 'user2', collectionId: 'c1', vote: 'like', timestamp: '2024-01-17T11:00:00Z', reason: 'Good for groups' },
  { restaurantId: '3', userId: 'user3', collectionId: 'c1', vote: 'like', timestamp: '2024-01-17T12:00:00Z', reason: 'Reliable choice' },
  
  { restaurantId: '5', userId: 'user1', collectionId: 'c1', vote: 'like', timestamp: '2024-01-18T10:00:00Z', reason: 'Impressive for celebrations' },
  { restaurantId: '5', userId: 'user2', collectionId: 'c1', vote: 'dislike', timestamp: '2024-01-18T11:00:00Z', reason: 'Hard to get reservations' },
  { restaurantId: '5', userId: 'user3', collectionId: 'c1', vote: 'like', timestamp: '2024-01-18T12:00:00Z', reason: 'Worth the splurge' },
  
  // Cheap & Cheerful collection votes
  { restaurantId: '2', userId: 'user1', collectionId: 'c3', vote: 'like', timestamp: '2024-01-26T10:00:00Z', reason: 'Classic NYC experience' },
  { restaurantId: '2', userId: 'user2', collectionId: 'c3', vote: 'like', timestamp: '2024-01-26T11:00:00Z', reason: 'Great value' },
  
  { restaurantId: '4', userId: 'user1', collectionId: 'c3', vote: 'like', timestamp: '2024-01-27T10:00:00Z', reason: 'Authentic and affordable' },
  { restaurantId: '4', userId: 'user2', collectionId: 'c3', vote: 'dislike', timestamp: '2024-01-27T11:00:00Z', reason: 'Too spicy for me' },
  
  { restaurantId: '6', userId: 'user1', collectionId: 'c3', vote: 'like', timestamp: '2024-01-28T10:00:00Z', reason: 'Best cookies in the city' },
  { restaurantId: '6', userId: 'user2', collectionId: 'c3', vote: 'like', timestamp: '2024-01-28T11:00:00Z', reason: 'Perfect sweet treat' }
];

// Mock discussion data
export const mockDiscussions = [
  {
    id: 'd1',
    restaurantId: '1',
    collectionId: 'c1',
    userId: 'user2',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    message: 'Has anyone been here recently? I heard they changed their menu.',
    timestamp: new Date('2024-01-16T15:00:00Z'),
    likes: 2,
    replies: [
      {
        id: 'd1r1',
        restaurantId: '1',
        collectionId: 'c1',
        userId: 'user1',
        userName: 'Alex Chen',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        message: 'Yes! The tasting menu is even better now. Definitely worth it for a birthday.',
        timestamp: new Date('2024-01-16T16:00:00Z'),
        likes: 1
      }
    ]
  },
  {
    id: 'd2',
    restaurantId: '5',
    collectionId: 'c1',
    userId: 'user3',
    userName: 'Mike Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    message: 'I can help with getting a reservation here if needed. I know someone who works there.',
    timestamp: new Date('2024-01-18T14:00:00Z'),
    likes: 3
  }
];