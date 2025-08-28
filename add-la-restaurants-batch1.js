const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const laRestaurants = [
  {
    name: 'Guelaguetza',
    cuisine: 'Mexican',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '3014 W Olympic Blvd',
    neighborhood: 'Koreatown',
    hours: 'Daily 9am-10pm',
    vibe: ['Authentic', 'Family', 'Oaxacan'],
    description: 'Authentic Oaxacan cuisine with mole and mezcal.',
    ai_description: 'A family-owned gem that brings the flavors of Oaxaca to Los Angeles. The vibrant atmosphere and complex mole sauces showcase the rich culinary traditions of southern Mexico.',
    ai_vibes: ['Authentic', 'Vibrant', 'Family', 'Traditional'],
    ai_top_picks: ['Mole Negro', 'Tlayudas', 'Mezcal Flight'],
    menu_highlights: ['Mole Negro', 'Tlayudas', 'Mezcal Flight'],
    rating: 4.7,
    restaurant_code: 'LA006'
  },
  {
    name: 'République',
    cuisine: 'French',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
    ],
    address: '624 S La Brea Ave',
    neighborhood: 'Mid-City',
    hours: 'Daily 8am-3pm, 6pm-10pm',
    vibe: ['Sophisticated', 'French', 'Bakery'],
    description: 'French bistro with exceptional pastries and wine list.',
    ai_description: 'A stunning space that combines the elegance of a French bistro with the casual sophistication of Los Angeles. The morning pastries and evening wine list make this a destination for any time of day.',
    ai_vibes: ['Elegant', 'French', 'Sophisticated', 'Casual'],
    ai_top_picks: ['Croissant', 'Steak Frites', 'Wine Selection'],
    menu_highlights: ['Croissant', 'Steak Frites', 'Wine Selection'],
    rating: 4.6,
    restaurant_code: 'LA007'
  },
  {
    name: 'Kogi BBQ',
    cuisine: 'Korean-Mexican',
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: 'Various Locations',
    neighborhood: 'Multiple',
    hours: 'Varies by location',
    vibe: ['Food Truck', 'Fusion', 'Innovative'],
    description: 'Revolutionary Korean-Mexican fusion food truck.',
    ai_description: 'The food truck that started a culinary revolution, combining Korean BBQ flavors with Mexican street food. Chef Roy Choi\'s innovative approach created a new category of fusion cuisine.',
    ai_vibes: ['Innovative', 'Fusion', 'Street Food', 'Revolutionary'],
    ai_top_picks: ['Short Rib Tacos', 'Kimchi Quesadilla', 'Blackjack Quesadilla'],
    menu_highlights: ['Short Rib Tacos', 'Kimchi Quesadilla', 'Blackjack Quesadilla'],
    rating: 4.5,
    restaurant_code: 'LA008'
  },
  {
    name: 'Bestia',
    cuisine: 'Italian',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    address: '2121 E 7th Pl',
    neighborhood: 'Arts District',
    hours: 'Tue-Sat 5pm-11pm',
    vibe: ['Industrial', 'Trendy', 'Italian'],
    description: 'Industrial-chic Italian restaurant with house-made pasta.',
    ai_description: 'An industrial-chic space where Chef Ori Menashe creates bold, flavorful Italian dishes. The house-made pasta and wood-fired pizzas showcase the restaurant\'s commitment to authentic techniques.',
    ai_vibes: ['Industrial', 'Bold', 'Authentic', 'Trendy'],
    ai_top_picks: ['Cavatelli alla Norcina', 'Margherita Pizza', 'Bone Marrow'],
    menu_highlights: ['Cavatelli alla Norcina', 'Margherita Pizza', 'Bone Marrow'],
    rating: 4.7,
    restaurant_code: 'LA009'
  },
  {
    name: 'Sqirl',
    cuisine: 'American',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '720 N Virgil Ave',
    neighborhood: 'Silver Lake',
    hours: 'Daily 6:30am-4pm',
    vibe: ['Hipster', 'Breakfast', 'Local'],
    description: 'Trendy breakfast spot with famous ricotta toast.',
    ai_description: 'A Silver Lake institution that redefined breakfast in Los Angeles. Chef Jessica Koslow\'s creative approach to morning food has made this a destination for food lovers from around the world.',
    ai_vibes: ['Creative', 'Hipster', 'Breakfast', 'Local'],
    ai_top_picks: ['Ricotta Toast', 'Sorrel Pesto Rice Bowl', 'Kombucha'],
    menu_highlights: ['Ricotta Toast', 'Sorrel Pesto Rice Bowl', 'Kombucha'],
    rating: 4.4,
    restaurant_code: 'LA010'
  }
];

async function addLARestaurants() {
  try {
    console.log('Adding LA restaurants batch 1 to database...');
    
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
    
    console.log('🎉 LA restaurants batch 1 added successfully!');
  } catch (error) {
    console.error('Error adding LA restaurants:', error);
  }
}

addLARestaurants();
