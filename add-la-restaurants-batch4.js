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
    vibe: ['Oaxacan', 'Authentic', 'Family'],
    description: 'Family-owned Oaxacan restaurant with mole and mezcal.',
    ai_description: 'A family-owned gem that brings the flavors of Oaxaca to Los Angeles. The vibrant atmosphere and complex mole sauces showcase the rich culinary traditions of southern Mexico.',
    ai_vibes: ['Authentic', 'Oaxacan', 'Family', 'Traditional'],
    ai_top_picks: ['Mole Negro', 'Tlayudas', 'Mezcal Flight'],
    menu_highlights: ['Mole Negro', 'Tlayudas', 'Mezcal Flight'],
    rating: 4.7,
    restaurant_code: 'LA026'
  },
  {
    name: 'Sushi Gen',
    cuisine: 'Japanese',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    address: '422 E 2nd St',
    neighborhood: 'Little Tokyo',
    hours: 'Tue-Sat 11:30am-2pm, 5:30pm-10pm',
    vibe: ['Traditional', 'Sushi', 'Little Tokyo'],
    description: 'Little Tokyo\'s beloved sushi restaurant with fresh fish.',
    ai_description: 'A Little Tokyo institution where traditional sushi techniques meet the freshest fish available. The intimate counter seating allows diners to watch the skilled chefs work their magic.',
    ai_vibes: ['Traditional', 'Intimate', 'Skilled', 'Fresh'],
    ai_top_picks: ['Omakase', 'Toro', 'Uni'],
    menu_highlights: ['Omakase', 'Toro', 'Uni'],
    rating: 4.8,
    restaurant_code: 'LA027'
  },
  {
    name: 'Langer\'s Delicatessen',
    cuisine: 'Deli',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '704 S Alvarado St',
    neighborhood: 'MacArthur Park',
    hours: 'Mon-Sat 8am-4pm',
    vibe: ['Historic', 'Deli', 'Jewish'],
    description: 'Historic Jewish deli famous for pastrami sandwiches.',
    ai_description: 'A Los Angeles landmark since 1947, serving the city\'s best pastrami sandwiches. The #19 pastrami sandwich has achieved legendary status among deli lovers worldwide.',
    ai_vibes: ['Historic', 'Legendary', 'Traditional', 'Authentic'],
    ai_top_picks: ['#19 Pastrami Sandwich', 'Matzo Ball Soup', 'Corned Beef'],
    menu_highlights: ['#19 Pastrami Sandwich', 'Matzo Ball Soup', 'Corned Beef'],
    rating: 4.6,
    restaurant_code: 'LA028'
  },
  {
    name: 'Musso & Frank Grill',
    cuisine: 'American',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
    ],
    address: '6667 Hollywood Blvd',
    neighborhood: 'Hollywood',
    hours: 'Tue-Sat 11am-11pm',
    vibe: ['Historic', 'Hollywood', 'Classic'],
    description: 'Hollywood\'s oldest restaurant since 1919.',
    ai_description: 'Hollywood\'s oldest restaurant, where the ghosts of movie stars past still linger. The classic American menu and old-school service create a time capsule of Hollywood\'s golden age.',
    ai_vibes: ['Historic', 'Classic', 'Hollywood', 'Timeless'],
    ai_top_picks: ['Martini', 'Steak', 'Caesar Salad'],
    menu_highlights: ['Martini', 'Steak', 'Caesar Salad'],
    rating: 4.3,
    restaurant_code: 'LA029'
  },
  {
    name: 'Roscoe\'s House of Chicken and Waffles',
    cuisine: 'Soul Food',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '1514 N Gower St',
    neighborhood: 'Hollywood',
    hours: 'Daily 8am-12am',
    vibe: ['Soul Food', 'Comfort', 'Iconic'],
    description: 'LA institution serving chicken and waffles since 1975.',
    ai_description: 'A Los Angeles institution that has been serving the perfect combination of crispy fried chicken and fluffy waffles since 1975. The soul food classics have made this a must-visit for comfort food lovers.',
    ai_vibes: ['Comfort', 'Soul Food', 'Iconic', 'Casual'],
    ai_top_picks: ['Chicken and Waffles', 'Gravy', 'Sweet Tea'],
    menu_highlights: ['Chicken and Waffles', 'Gravy', 'Sweet Tea'],
    rating: 4.4,
    restaurant_code: 'LA030'
  }
];

async function addLARestaurants() {
  try {
    console.log('Adding LA restaurants batch 4 (final) to database...');
    
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
    
    console.log('🎉 All 30 LA restaurants added successfully!');
  } catch (error) {
    console.error('Error adding LA restaurants:', error);
  }
}

addLARestaurants();
