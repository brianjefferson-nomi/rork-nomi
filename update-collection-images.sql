-- Update Collection Cover Images
-- This script updates existing collections with unique cover images based on their occasion or name

-- Update collections with unique cover images based on their occasion or name
UPDATE collections 
SET cover_image = CASE 
  -- Date Night collections
  WHEN name ILIKE '%date night%' OR name ILIKE '%romantic%' OR occasion ILIKE '%date night%' THEN 
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80'
  
  -- Birthday collections
  WHEN name ILIKE '%birthday%' OR occasion ILIKE '%birthday%' THEN 
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80'
  
  -- Brunch collections
  WHEN name ILIKE '%brunch%' OR occasion ILIKE '%brunch%' THEN 
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80'
  
  -- Italian collections
  WHEN name ILIKE '%italian%' OR name ILIKE '%pizza%' OR name ILIKE '%pasta%' OR occasion ILIKE '%italian%' THEN 
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80'
  
  -- Japanese/Sushi collections
  WHEN name ILIKE '%japanese%' OR name ILIKE '%sushi%' OR occasion ILIKE '%japanese%' THEN 
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80'
  
  -- Fine Dining collections
  WHEN name ILIKE '%fine dining%' OR name ILIKE '%upscale%' OR occasion ILIKE '%fine dining%' THEN 
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80'
  
  -- Business collections
  WHEN name ILIKE '%business%' OR occasion ILIKE '%business%' THEN 
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80'
  
  -- Casual collections
  WHEN name ILIKE '%casual%' OR occasion ILIKE '%casual%' THEN 
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80'
  
  -- Late Night collections
  WHEN name ILIKE '%late night%' OR name ILIKE '%night%' OR occasion ILIKE '%late night%' THEN 
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80'
  
  -- Special Occasion collections
  WHEN name ILIKE '%special%' OR occasion ILIKE '%special%' THEN 
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80'
  
  -- Mexican collections
  WHEN name ILIKE '%mexican%' OR occasion ILIKE '%mexican%' THEN 
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop&q=80'
  
  -- Thai collections
  WHEN name ILIKE '%thai%' OR occasion ILIKE '%thai%' THEN 
    'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop&q=80'
  
  -- Indian collections
  WHEN name ILIKE '%indian%' OR occasion ILIKE '%indian%' THEN 
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80'
  
  -- American collections
  WHEN name ILIKE '%american%' OR occasion ILIKE '%american%' THEN 
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&q=80'
  
  -- Chinese collections
  WHEN name ILIKE '%chinese%' OR occasion ILIKE '%chinese%' THEN 
    'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop&q=80'
  
  -- Mediterranean collections
  WHEN name ILIKE '%mediterranean%' OR occasion ILIKE '%mediterranean%' THEN 
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80'
  
  -- Korean collections
  WHEN name ILIKE '%korean%' OR occasion ILIKE '%korean%' THEN 
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop&q=80'
  
  -- Steakhouse collections
  WHEN name ILIKE '%steak%' OR name ILIKE '%steakhouse%' THEN 
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&q=80'
  
  -- Cafe collections
  WHEN name ILIKE '%cafe%' OR name ILIKE '%coffee%' THEN 
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80'
  
  -- Bar collections
  WHEN name ILIKE '%bar%' OR name ILIKE '%pub%' THEN 
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80'
  
  -- Seafood collections
  WHEN name ILIKE '%seafood%' OR name ILIKE '%fish%' THEN 
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop&q=80'
  
  -- Vegetarian/Vegan collections
  WHEN name ILIKE '%vegetarian%' OR name ILIKE '%vegan%' THEN 
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80'
  
  -- Dessert collections
  WHEN name ILIKE '%dessert%' OR name ILIKE '%sweet%' THEN 
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&q=80'
  
  -- Breakfast collections
  WHEN name ILIKE '%breakfast%' OR name ILIKE '%morning%' THEN 
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80'
  
  -- Lunch collections
  WHEN name ILIKE '%lunch%' OR name ILIKE '%midday%' THEN 
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80'
  
  -- Dinner collections
  WHEN name ILIKE '%dinner%' OR name ILIKE '%evening%' THEN 
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80'
  
  -- Default to a random high-quality restaurant image
  ELSE 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80'
END
WHERE cover_image IS NULL OR cover_image = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';

-- Verify the updates
SELECT 
  id,
  name,
  occasion,
  cover_image,
  CASE 
    WHEN cover_image LIKE '%date%' THEN 'Date Night'
    WHEN cover_image LIKE '%birthday%' THEN 'Birthday'
    WHEN cover_image LIKE '%brunch%' THEN 'Brunch'
    WHEN cover_image LIKE '%italian%' THEN 'Italian'
    WHEN cover_image LIKE '%sushi%' THEN 'Japanese/Sushi'
    WHEN cover_image LIKE '%fine%' THEN 'Fine Dining'
    WHEN cover_image LIKE '%business%' THEN 'Business'
    WHEN cover_image LIKE '%casual%' THEN 'Casual'
    WHEN cover_image LIKE '%night%' THEN 'Late Night'
    WHEN cover_image LIKE '%special%' THEN 'Special Occasion'
    ELSE 'Default'
  END as image_category
FROM collections 
ORDER BY name;
