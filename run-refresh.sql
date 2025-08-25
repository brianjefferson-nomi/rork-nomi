-- Quick Restaurant Data Refresh
-- Run this in your Supabase SQL editor to refresh restaurant data

-- Update restaurant images with high-quality Unsplash photos
UPDATE restaurants 
SET 
  image_url = CASE 
    WHEN cuisine ILIKE '%italian%' THEN 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' THEN 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%mexican%' THEN 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%chinese%' THEN 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%french%' THEN 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%thai%' THEN 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%indian%' THEN 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%american%' THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%mediterranean%' THEN 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop'
    WHEN cuisine ILIKE '%korean%' THEN 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
  END,
  images = CASE 
    WHEN cuisine ILIKE '%italian%' THEN ARRAY[
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' THEN ARRAY[
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%mexican%' THEN ARRAY[
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%chinese%' THEN ARRAY[
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%french%' THEN ARRAY[
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%thai%' THEN ARRAY[
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%indian%' THEN ARRAY[
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%american%' THEN ARRAY[
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%mediterranean%' THEN ARRAY[
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
    WHEN cuisine ILIKE '%korean%' THEN ARRAY[
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
    ELSE ARRAY[
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ]
  END,
  updated_at = NOW();

-- Update AI descriptions and vibe tags
UPDATE restaurants 
SET 
  ai_description = CASE 
    WHEN cuisine ILIKE '%italian%' THEN 'Authentic Italian cuisine featuring handmade pasta, wood-fired pizzas, and traditional recipes passed down through generations. Experience the warmth of Italian hospitality in an elegant setting.'
    WHEN cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' THEN 'Masterfully crafted sushi and traditional Japanese dishes prepared with the finest ingredients. Experience the artistry of Japanese cuisine in a serene, minimalist atmosphere.'
    WHEN cuisine ILIKE '%mexican%' THEN 'Vibrant Mexican flavors featuring fresh ingredients, bold spices, and traditional cooking techniques. Enjoy authentic tacos, enchiladas, and margaritas in a festive atmosphere.'
    WHEN cuisine ILIKE '%chinese%' THEN 'Classic Chinese dishes prepared with authentic techniques and premium ingredients. From dim sum to Peking duck, experience the rich flavors and traditions of Chinese cuisine.'
    WHEN cuisine ILIKE '%french%' THEN 'Sophisticated French cuisine with classic techniques and contemporary flair. Enjoy expertly prepared dishes in an elegant, romantic setting perfect for special occasions.'
    WHEN cuisine ILIKE '%thai%' THEN 'Authentic Thai cuisine featuring the perfect balance of sweet, sour, spicy, and savory flavors. Fresh herbs, aromatic spices, and traditional recipes create an unforgettable dining experience.'
    WHEN cuisine ILIKE '%indian%' THEN 'Rich and aromatic Indian cuisine with complex spices and traditional cooking methods. From creamy curries to tandoori specialties, experience the diverse flavors of India.'
    WHEN cuisine ILIKE '%american%' THEN 'Classic American comfort food with a modern twist. From juicy burgers to fresh salads, enjoy familiar favorites prepared with quality ingredients and creative flair.'
    WHEN cuisine ILIKE '%mediterranean%' THEN 'Fresh Mediterranean cuisine featuring olive oil, herbs, and wholesome ingredients. Enjoy healthy, flavorful dishes inspired by the coastal regions of the Mediterranean.'
    WHEN cuisine ILIKE '%korean%' THEN 'Authentic Korean cuisine featuring bold flavors, fermented ingredients, and traditional barbecue. Experience the rich culinary heritage of Korea in every dish.'
    ELSE 'A delightful dining experience featuring fresh ingredients and creative culinary techniques. Perfect for any occasion, from casual meals to special celebrations.'
  END,
  ai_vibes = CASE 
    WHEN cuisine ILIKE '%italian%' THEN ARRAY['romantic', 'authentic', 'cozy', 'elegant', 'family-friendly']
    WHEN cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' THEN ARRAY['sophisticated', 'minimalist', 'authentic', 'peaceful', 'upscale']
    WHEN cuisine ILIKE '%mexican%' THEN ARRAY['vibrant', 'festive', 'casual', 'lively', 'authentic']
    WHEN cuisine ILIKE '%chinese%' THEN ARRAY['traditional', 'authentic', 'bustling', 'family-friendly', 'cultural']
    WHEN cuisine ILIKE '%french%' THEN ARRAY['romantic', 'elegant', 'sophisticated', 'upscale', 'intimate']
    WHEN cuisine ILIKE '%thai%' THEN ARRAY['authentic', 'spicy', 'fresh', 'casual', 'flavorful']
    WHEN cuisine ILIKE '%indian%' THEN ARRAY['aromatic', 'spicy', 'authentic', 'warm', 'cultural']
    WHEN cuisine ILIKE '%american%' THEN ARRAY['casual', 'comfortable', 'friendly', 'relaxed', 'familiar']
    WHEN cuisine ILIKE '%mediterranean%' THEN ARRAY['healthy', 'fresh', 'light', 'casual', 'authentic']
    WHEN cuisine ILIKE '%korean%' THEN ARRAY['bold', 'authentic', 'social', 'traditional', 'flavorful']
    ELSE ARRAY['welcoming', 'comfortable', 'friendly', 'casual', 'enjoyable']
  END,
  ai_top_picks = CASE 
    WHEN cuisine ILIKE '%italian%' THEN ARRAY['Handmade Pasta', 'Wood-Fired Pizza', 'Tiramisu', 'Bruschetta', 'Osso Buco']
    WHEN cuisine ILIKE '%japanese%' OR cuisine ILIKE '%sushi%' THEN ARRAY['Fresh Sushi', 'Miso Soup', 'Tempura', 'Sashimi', 'Green Tea']
    WHEN cuisine ILIKE '%mexican%' THEN ARRAY['Street Tacos', 'Guacamole', 'Enchiladas', 'Margaritas', 'Churros']
    WHEN cuisine ILIKE '%chinese%' THEN ARRAY['Dim Sum', 'Peking Duck', 'Kung Pao Chicken', 'Hot & Sour Soup', 'Fortune Cookies']
    WHEN cuisine ILIKE '%french%' THEN ARRAY['Coq au Vin', 'Escargot', 'Beef Bourguignon', 'Crème Brûlée', 'French Onion Soup']
    WHEN cuisine ILIKE '%thai%' THEN ARRAY['Pad Thai', 'Tom Yum Soup', 'Green Curry', 'Mango Sticky Rice', 'Thai Iced Tea']
    WHEN cuisine ILIKE '%indian%' THEN ARRAY['Butter Chicken', 'Naan Bread', 'Biryani', 'Tandoori Chicken', 'Gulab Jamun']
    WHEN cuisine ILIKE '%american%' THEN ARRAY['Classic Burger', 'Mac & Cheese', 'BBQ Ribs', 'Apple Pie', 'Milkshake']
    WHEN cuisine ILIKE '%mediterranean%' THEN ARRAY['Hummus', 'Falafel', 'Greek Salad', 'Baklava', 'Lamb Kebabs']
    WHEN cuisine ILIKE '%korean%' THEN ARRAY['Bibimbap', 'Korean BBQ', 'Kimchi', 'Bulgogi', 'Tteokbokki']
    ELSE ARRAY['Grilled Salmon', 'Caesar Salad', 'Chocolate Cake', 'House Wine', 'Fresh Bread']
  END,
  vibe_tags = ai_vibes,
  menu_highlights = ai_top_picks,
  updated_at = NOW()
WHERE ai_description IS NULL OR ai_description = '';

-- Update ratings and add realistic reviews
UPDATE restaurants 
SET 
  rating = CASE 
    WHEN rating = 0 OR rating IS NULL THEN (3.5 + (random() * 1.5))::DECIMAL(3,2)
    ELSE rating
  END,
  reviews = ARRAY[
    'Amazing food and great service!',
    'Highly recommend this place.',
    'Perfect for a date night.',
    'Fresh ingredients and delicious flavors.',
    'Will definitely come back!'
  ],
  updated_at = NOW()
WHERE rating = 0 OR rating IS NULL OR reviews IS NULL;

-- Show updated summary
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN image_url != '' THEN 1 END) as restaurants_with_images,
  COUNT(CASE WHEN ai_description IS NOT NULL AND ai_description != '' THEN 1 END) as restaurants_with_ai_descriptions,
  COUNT(CASE WHEN rating > 0 THEN 1 END) as restaurants_with_ratings,
  AVG(rating) as average_rating,
  MAX(updated_at) as latest_update
FROM restaurants;
