const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const laRestaurants = [
  {
    id: 'la-1',
    name: 'Nobu Los Angeles',
    cuisine: 'Japanese',
    priceRange: '$$$$',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    address: '903 N La Cienega Blvd',
    neighborhood: 'West Hollywood',
    hours: 'Daily 6pm-11pm',
    vibe: ['Luxury', 'Celebrity Spot', 'Fine Dining'],
    description: 'Celebrity-favorite Japanese restaurant with innovative sushi and sashimi.',
    menuHighlights: ['Black Cod Miso', 'Yellowtail Jalapeño', 'Rock Shrimp Tempura'],
    rating: 4.8
  },
  {
    id: 'la-2',
    name: 'In-N-Out Burger',
    cuisine: 'American',
    priceRange: '$',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    address: '7009 Sunset Blvd',
    neighborhood: 'Hollywood',
    hours: 'Daily 10:30am-1am',
    vibe: ['Casual', 'Fast Food', 'Iconic'],
    description: 'California\'s beloved burger chain with fresh ingredients.',
    menuHighlights: ['Double-Double', 'Animal Style Fries', 'Neapolitan Shake'],
    rating: 4.6
  },
  {
    id: 'la-3',
    name: 'The Ivy',
    cuisine: 'American',
    priceRange: '$$$',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    address: '113 N Robertson Blvd',
    neighborhood: 'Beverly Hills',
    hours: 'Daily 11am-10pm',
    vibe: ['Upscale', 'Celebrity Spot', 'Garden Setting'],
    description: 'Charming garden restaurant frequented by celebrities.',
    menuHighlights: ['Lobster Pasta', 'Truffle Fries', 'Chocolate Soufflé'],
    rating: 4.4
  },
  {
    id: 'la-4',
    name: 'Pink\'s Hot Dogs',
    cuisine: 'American',
    priceRange: '$',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    address: '709 N La Brea Ave',
    neighborhood: 'Hollywood',
    hours: 'Daily 9:30am-2am',
    vibe: ['Casual', 'Late Night', 'Iconic'],
    description: 'Hollywood\'s legendary hot dog stand since 1939.',
    menuHighlights: ['Martha Stewart Dog', 'Bacon Chili Cheese Dog', 'Pastrami Reuben Dog'],
    rating: 4.3
  },
  {
    id: 'la-5',
    name: 'Providence',
    cuisine: 'Seafood',
    priceRange: '$$$$',
    imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    address: '5955 Melrose Ave',
    neighborhood: 'Hollywood',
    hours: 'Tue-Sat 6pm-10pm',
    vibe: ['Fine Dining', 'Romantic', 'Seafood'],
    description: 'Two-Michelin-starred seafood restaurant with tasting menus.',
    menuHighlights: ['Santa Barbara Sea Urchin', 'Maine Lobster', 'Chocolate Soufflé'],
    rating: 4.9
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
