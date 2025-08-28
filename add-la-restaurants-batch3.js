const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const laRestaurants = [
  {
    name: 'Philippe The Original',
    cuisine: 'American',
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '1001 N Alameda St',
    neighborhood: 'Chinatown',
    hours: 'Daily 6am-10pm',
    vibe: ['Historic', 'Deli', 'Downtown'],
    description: 'Home of the French dip sandwich since 1908.',
    ai_description: 'A downtown landmark that claims to have invented the French dip sandwich in 1908. The sawdust floors and historic atmosphere make this a step back in time to old Los Angeles.',
    ai_vibes: ['Historic', 'Downtown', 'Traditional', 'Authentic'],
    ai_top_picks: ['French Dip Sandwich', 'Cole Slaw', 'Pickled Eggs'],
    menu_highlights: ['French Dip Sandwich', 'Cole Slaw', 'Pickled Eggs'],
    rating: 4.5,
    restaurant_code: 'LA016'
  },
  {
    name: 'Catch LA',
    cuisine: 'Seafood',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    address: '8715 Melrose Ave',
    neighborhood: 'West Hollywood',
    hours: 'Daily 11am-12am',
    vibe: ['Rooftop', 'Seafood', 'Trendy'],
    description: 'Rooftop seafood restaurant with celebrity sightings.',
    ai_description: 'A stunning rooftop destination where fresh seafood meets Hollywood glamour. The beautiful outdoor setting and celebrity clientele make this a perfect spot for special occasions.',
    ai_vibes: ['Rooftop', 'Glamorous', 'Seafood', 'Celebrity'],
    ai_top_picks: ['Lobster Roll', 'Truffle Fries', 'Cocktails'],
    menu_highlights: ['Lobster Roll', 'Truffle Fries', 'Cocktails'],
    rating: 4.3,
    restaurant_code: 'LA017'
  },
  {
    name: 'Tacos 1986',
    cuisine: 'Mexican',
    price_range: '$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '609 S Spring St',
    neighborhood: 'Downtown',
    hours: 'Daily 11am-10pm',
    vibe: ['Street Food', 'Authentic', 'Downtown'],
    description: 'Authentic Tijuana-style tacos in downtown LA.',
    ai_description: 'Bringing the authentic flavors of Tijuana to downtown Los Angeles. The adobada and carne asada tacos showcase the best of Baja California street food.',
    ai_vibes: ['Authentic', 'Street Food', 'Baja', 'Casual'],
    ai_top_picks: ['Adobada Taco', 'Carne Asada Taco', 'Horchata'],
    menu_highlights: ['Adobada Taco', 'Carne Asada Taco', 'Horchata'],
    rating: 4.6,
    restaurant_code: 'LA018'
  },
  {
    name: 'Bavel',
    cuisine: 'Middle Eastern',
    price_range: '$$$',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
    ],
    address: '500 Mateo St',
    neighborhood: 'Arts District',
    hours: 'Tue-Sun 5pm-11pm',
    vibe: ['Middle Eastern', 'Arts District', 'Sophisticated'],
    description: 'Modern Middle Eastern cuisine in the Arts District.',
    ai_description: 'A sophisticated take on Middle Eastern cuisine in the heart of the Arts District. The hummus and lamb neck shawarma showcase the restaurant\'s commitment to bold flavors and modern techniques.',
    ai_vibes: ['Sophisticated', 'Middle Eastern', 'Modern', 'Arts District'],
    ai_top_picks: ['Hummus', 'Lamb Neck Shawarma', 'Pita'],
    menu_highlights: ['Hummus', 'Lamb Neck Shawarma', 'Pita'],
    rating: 4.7,
    restaurant_code: 'LA019'
  },
  {
    name: 'Jon & Vinny\'s',
    cuisine: 'Italian',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    address: '412 N Fairfax Ave',
    neighborhood: 'Fairfax',
    hours: 'Daily 8am-11pm',
    vibe: ['Italian', 'Casual', 'Fairfax'],
    description: 'Casual Italian restaurant with great pizza and pasta.',
    ai_description: 'A casual Italian spot that has become a neighborhood favorite. The thin-crust pizzas and house-made pasta showcase the restaurant\'s commitment to authentic Italian flavors.',
    ai_vibes: ['Casual', 'Italian', 'Neighborhood', 'Authentic'],
    ai_top_picks: ['Margherita Pizza', 'Spaghetti', 'Garlic Bread'],
    menu_highlights: ['Margherita Pizza', 'Spaghetti', 'Garlic Bread'],
    rating: 4.5,
    restaurant_code: 'LA020'
  },
  {
    name: 'Milk Bar',
    cuisine: 'Dessert',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '7150 Melrose Ave',
    neighborhood: 'Fairfax',
    hours: 'Daily 9am-10pm',
    vibe: ['Dessert', 'Sweet', 'Trendy'],
    description: 'Christina Tosi\'s dessert empire with cereal milk soft serve.',
    ai_description: 'Chef Christina Tosi\'s dessert empire brings innovative sweet treats to Los Angeles. The cereal milk soft serve and crack pie have become cult favorites among dessert lovers.',
    ai_vibes: ['Sweet', 'Innovative', 'Trendy', 'Dessert'],
    ai_top_picks: ['Cereal Milk Soft Serve', 'Crack Pie', 'Compost Cookies'],
    menu_highlights: ['Cereal Milk Soft Serve', 'Crack Pie', 'Compost Cookies'],
    rating: 4.4,
    restaurant_code: 'LA021'
  },
  {
    name: 'Luv2Eat Thai Bistro',
    cuisine: 'Thai',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '6660 Sunset Blvd',
    neighborhood: 'Hollywood',
    hours: 'Tue-Sun 11am-10pm',
    vibe: ['Thai', 'Authentic', 'Hollywood'],
    description: 'Authentic Thai cuisine with bold flavors.',
    ai_description: 'A family-owned Thai restaurant that brings the authentic flavors of Thailand to Hollywood. The bold, spicy dishes showcase the complexity and depth of Thai cuisine.',
    ai_vibes: ['Authentic', 'Spicy', 'Thai', 'Family'],
    ai_top_picks: ['Pad Thai', 'Green Curry', 'Mango Sticky Rice'],
    menu_highlights: ['Pad Thai', 'Green Curry', 'Mango Sticky Rice'],
    rating: 4.6,
    restaurant_code: 'LA022'
  },
  {
    name: 'Night + Market Song',
    cuisine: 'Thai',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '3322 Sunset Blvd',
    neighborhood: 'Silver Lake',
    hours: 'Tue-Sun 6pm-11pm',
    vibe: ['Thai', 'Trendy', 'Silver Lake'],
    description: 'Modern Thai cuisine with bold flavors and cocktails.',
    ai_description: 'A modern take on Thai cuisine that brings bold flavors and innovative cocktails to Silver Lake. The vibrant atmosphere and creative dishes showcase the evolution of Thai food in Los Angeles.',
    ai_vibes: ['Modern', 'Bold', 'Thai', 'Trendy'],
    ai_top_picks: ['Pad Thai', 'Green Curry', 'Thai Cocktails'],
    menu_highlights: ['Pad Thai', 'Green Curry', 'Thai Cocktails'],
    rating: 4.4,
    restaurant_code: 'LA023'
  },
  {
    name: 'Sushi Zo',
    cuisine: 'Japanese',
    price_range: '$$$$',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    address: '9824 National Blvd',
    neighborhood: 'Palms',
    hours: 'Tue-Sat 6pm-10pm',
    vibe: ['Sushi', 'Omakase', 'Intimate'],
    description: 'Intimate omakase experience with master sushi chef.',
    ai_description: 'An intimate omakase experience where Chef Keizo Seki creates a personalized journey through the finest sushi. The small counter seating allows for a truly interactive dining experience.',
    ai_vibes: ['Intimate', 'Omakase', 'Master', 'Personalized'],
    ai_top_picks: ['Omakase', 'Toro', 'Uni'],
    menu_highlights: ['Omakase', 'Toro', 'Uni'],
    rating: 4.9,
    restaurant_code: 'LA024'
  },
  {
    name: 'Courage Bagels',
    cuisine: 'Bagels',
    price_range: '$$',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'
    ],
    address: '777 N Virgil Ave',
    neighborhood: 'Silver Lake',
    hours: 'Wed-Sun 7am-3pm',
    vibe: ['Bagels', 'Hipster', 'Silver Lake'],
    description: 'Artisanal bagels with creative toppings.',
    ai_description: 'A Silver Lake gem that has redefined the bagel experience in Los Angeles. The artisanal bagels and creative toppings showcase the restaurant\'s commitment to quality and innovation.',
    ai_vibes: ['Artisanal', 'Creative', 'Hipster', 'Quality'],
    ai_top_picks: ['Everything Bagel', 'Lox', 'Cream Cheese'],
    menu_highlights: ['Everything Bagel', 'Lox', 'Cream Cheese'],
    rating: 4.5,
    restaurant_code: 'LA025'
  }
];

async function addLARestaurants() {
  try {
    console.log('Adding LA restaurants batch 3 to database...');
    
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
    
    console.log('🎉 LA restaurants batch 3 added successfully!');
  } catch (error) {
    console.error('Error adding LA restaurants:', error);
  }
}

addLARestaurants();
