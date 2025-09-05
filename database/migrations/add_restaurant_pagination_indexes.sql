-- Add indexes for restaurant pagination and search performance
-- These indexes will significantly improve query performance for large datasets (14k+ restaurants)

-- 1. Composite index for name-based pagination (most common use case)
CREATE INDEX IF NOT EXISTS idx_restaurants_name_id 
ON restaurants (name, id);

-- 2. Composite index for cuisine-based filtering and pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_name_id 
ON restaurants (cuisine, name, id);

-- 3. Composite index for neighborhood-based filtering and pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_neighborhood_name_id 
ON restaurants (neighborhood, name, id);

-- 4. Composite index for rating-based sorting and pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_name_id 
ON restaurants (rating DESC, name, id);

-- 5. Composite index for city-based filtering and pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_city_name_id 
ON restaurants (city, name, id);

-- 6. Composite index for price range filtering and pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range_name_id 
ON restaurants (price_range, name, id);

-- 7. Full-text search index for restaurant names and descriptions
CREATE INDEX IF NOT EXISTS idx_restaurants_name_fts 
ON restaurants USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 8. Index for created_at for time-based pagination
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at_id 
ON restaurants (created_at DESC, id);

-- 9. Composite index for complex filtering (cuisine + neighborhood + rating)
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_neighborhood_rating 
ON restaurants (cuisine, neighborhood, rating DESC, name, id);

-- 10. Index for restaurant_code for quick lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_restaurant_code 
ON restaurants (restaurant_code);

-- 11. Partial index for restaurants with coordinates (for distance-based filtering)
CREATE INDEX IF NOT EXISTS idx_restaurants_with_coordinates 
ON restaurants (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 12. Index for restaurants with images (for filtering restaurants with photos)
CREATE INDEX IF NOT EXISTS idx_restaurants_with_images 
ON restaurants (id) 
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- 13. Index for restaurants with high ratings (for filtering top-rated restaurants)
CREATE INDEX IF NOT EXISTS idx_restaurants_high_rated 
ON restaurants (rating DESC, name, id) 
WHERE rating >= 4.0;

-- 14. Index for restaurants with TripAdvisor data
CREATE INDEX IF NOT EXISTS idx_restaurants_tripadvisor 
ON restaurants (tripadvisor_rating DESC, name, id) 
WHERE tripadvisor_location_id IS NOT NULL;

-- 15. Index for restaurants with Google Places data
CREATE INDEX IF NOT EXISTS idx_restaurants_google_places 
ON restaurants (google_rating DESC, name, id) 
WHERE google_place_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_restaurants_name_id IS 'Primary index for name-based pagination and sorting';
COMMENT ON INDEX idx_restaurants_cuisine_name_id IS 'Index for cuisine filtering with pagination';
COMMENT ON INDEX idx_restaurants_neighborhood_name_id IS 'Index for neighborhood filtering with pagination';
COMMENT ON INDEX idx_restaurants_rating_name_id IS 'Index for rating-based sorting with pagination';
COMMENT ON INDEX idx_restaurants_city_name_id IS 'Index for city-based filtering with pagination';
COMMENT ON INDEX idx_restaurants_price_range_name_id IS 'Index for price range filtering with pagination';
COMMENT ON INDEX idx_restaurants_name_fts IS 'Full-text search index for restaurant names and descriptions';
COMMENT ON INDEX idx_restaurants_created_at_id IS 'Index for time-based pagination';
COMMENT ON INDEX idx_restaurants_cuisine_neighborhood_rating IS 'Composite index for complex filtering scenarios';
COMMENT ON INDEX idx_restaurants_restaurant_code IS 'Index for quick restaurant code lookups';
COMMENT ON INDEX idx_restaurants_with_coordinates IS 'Index for restaurants with location data';
COMMENT ON INDEX idx_restaurants_with_images IS 'Index for restaurants with photos';
COMMENT ON INDEX idx_restaurants_high_rated IS 'Index for high-rated restaurants';
COMMENT ON INDEX idx_restaurants_tripadvisor IS 'Index for restaurants with TripAdvisor data';
COMMENT ON INDEX idx_restaurants_google_places IS 'Index for restaurants with Google Places data';
