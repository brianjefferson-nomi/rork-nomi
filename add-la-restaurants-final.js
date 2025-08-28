const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const laRestaurants = [
  {
    name: 'Nobu Los Angeles',
    cuisine: 'Japanese',
    price_range: '$$$$',
    image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    images: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
    ],
    address: '903 N La Cienega Blvd',
    neighborhood: 'West Hollywood',
    hours: 'Daily 6pm-11pm',
    vibe: ['Luxury', 'Celebrity Spot', 'Fine Dining'],
    description: 'Celebrity-favorite Japanese restaurant with innovative sushi and sashimi.',
    ai_description: 'A Hollywood institution where the art of Japanese cuisine meets celebrity culture. The sleek, modern space serves as a backdrop for innovative sushi and sashimi that has made Nobu a global phenomenon.',
    ai_vibes: ['Luxurious', 'Celebrity', 'Innovative', 'Sophisticated'],
    ai_top_picks: ['Black Cod Miso', 'Yellowtail Jalapeño', 'Rock Shrimp Tempura'],
    menu_highlights: ['Black Cod Miso', 'Yellowtail Jalapeño', 'Rock Shrimp Tempura'],
    rating: 4.8,
    restaurant_code: 'LA001'
  },
  {
    name: 'In-N-Out Burger',
    cuisine: 'American',
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '7009 Sunset Blvd',
    neighborhood: 'Hollywood',
    hours: 'Daily 10:30am-1am',
    vibe: ['Casual', 'Fast Food', 'Iconic'],
    description: 'California\'s beloved burger chain with fresh ingredients.',
    ai_description: 'A California institution where simple, fresh ingredients create the perfect burger experience. The secret menu and fresh-cut fries have made this a must-visit for locals and tourists alike.',
    ai_vibes: ['Casual', 'Fresh', 'Iconic', 'Quick'],
    ai_top_picks: ['Double-Double', 'Animal Style Fries', 'Neapolitan Shake'],
    menu_highlights: ['Double-Double', 'Animal Style Fries', 'Neapolitan Shake'],
    rating: 4.6,
    restaurant_code: 'LA002'
  },
  {
    name: 'The Ivy',
    cuisine: 'American',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
    ],
    address: '113 N Robertson Blvd',
    neighborhood: 'Beverly Hills',
    hours: 'Daily 11am-10pm',
    vibe: ['Upscale', 'Celebrity Spot', 'Garden Setting'],
    description: 'Charming garden restaurant frequented by celebrities.',
    ai_description: 'A Beverly Hills institution where power lunches and celebrity sightings are as common as the beautiful garden setting. The ivy-covered patio creates a magical atmosphere for California cuisine.',
    ai_vibes: ['Charming', 'Celebrity', 'Garden', 'Upscale'],
    ai_top_picks: ['Lobster Pasta', 'Truffle Fries', 'Chocolate Soufflé'],
    menu_highlights: ['Lobster Pasta', 'Truffle Fries', 'Chocolate Soufflé'],
    rating: 4.4,
    restaurant_code: 'LA003'
  },
  {
    name: 'Pink\'s Hot Dogs',
    cuisine: 'American',
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '709 N La Brea Ave',
    neighborhood: 'Hollywood',
    hours: 'Daily 9:30am-2am',
    vibe: ['Casual', 'Late Night', 'Iconic'],
    description: 'Hollywood\'s legendary hot dog stand since 1939.',
    ai_description: 'A Hollywood landmark where hot dogs have been served since 1939. The neon sign and late-night hours make this a perfect spot for post-club cravings and celebrity sightings.',
    ai_vibes: ['Iconic', 'Late Night', 'Casual', 'Historic'],
    ai_top_picks: ['Martha Stewart Dog', 'Bacon Chili Cheese Dog', 'Pastrami Reuben Dog'],
    menu_highlights: ['Martha Stewart Dog', 'Bacon Chili Cheese Dog', 'Pastrami Reuben Dog'],
    rating: 4.3,
    restaurant_code: 'LA004'
  },
  {
    name: 'Providence',
    cuisine: 'Seafood',
    price_range: '$$$$',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    address: '5955 Melrose Ave',
    neighborhood: 'Hollywood',
    hours: 'Tue-Sat 6pm-10pm',
    vibe: ['Fine Dining', 'Romantic', 'Seafood'],
    description: 'Two-Michelin-starred seafood restaurant with tasting menus.',
    ai_description: 'A culinary temple where Chef Michael Cimarusti transforms the ocean\'s bounty into transcendent art. The intimate dining room and impeccable service create an unforgettable fine dining experience.',
    ai_vibes: ['Sophisticated', 'Intimate', 'Artistic', 'Luxurious'],
    ai_top_picks: ['Santa Barbara Sea Urchin', 'Maine Lobster', 'Chocolate Soufflé'],
    menu_highlights: ['Santa Barbara Sea Urchin', 'Maine Lobster', 'Chocolate Soufflé'],
    rating: 4.9,
    restaurant_code: 'LA005'
  }
];

async function addLARestaurants() {
  try {
    console.log('Adding LA restaurants to database...');
    
    for (const restaurant of laRestaurants) {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurant]);
      
      if (error) {
        console.error(`Error adding ${restaurant.name}:`, error);
      } else {
        console.log(`✅ Added: ${restaurant.name}`);
      }
    }
    
    console.log('🎉 LA restaurants added successfully!');
  } catch (error) {
    console.error('Error adding LA restaurants:', error);
  }
}

addLARestaurants();
