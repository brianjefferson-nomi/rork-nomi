#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
  console.error('❌ Missing OpenAI API key. Please add your actual OpenAI API key to EXPO_PUBLIC_OPENAI_API_KEY in your .env file.');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Restaurant enrichment function
async function enrichRestaurant(restaurant) {
  try {
    console.log(`\n🍽️  Processing: ${restaurant.name} (${restaurant.cuisine})`);
    
    // Generate description
    const descriptionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Generate a compelling, restaurant-specific description based on the provided data. Follow these rules:

- Length: 50-200 characters
- Be SPECIFIC to this restaurant's location, cuisine, and unique characteristics
- Include: specific neighborhood, cuisine specialties, and distinctive atmosphere
- Mention unique features: if it's family-owned, has a specific cooking method, unique decor, etc.
- Avoid: generic phrases like 'amazing', 'incredible', 'perfect', 'delicious', 'wonderful'
- Use the restaurant's actual name and neighborhood in the description
- Make it feel like you've actually been there and know what makes it special`
        },
        {
          role: 'user',
          content: `Restaurant: ${restaurant.name}
Cuisine: ${restaurant.cuisine}
Rating: ${restaurant.rating || 'No rating'}
Neighborhood: ${restaurant.neighborhood || 'Unknown'}
Price Range: ${restaurant.price_range || 'Unknown'}
Address: ${restaurant.address || 'Unknown'}
City: ${restaurant.city || 'Unknown'}
Existing Description: ${restaurant.description || 'None'}

Generate a description that captures what makes THIS specific restaurant unique in THIS specific neighborhood.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const aiDescription = descriptionResponse.choices[0].message.content.trim();
    console.log(`📝 AI Description: ${aiDescription}`);

    // Generate vibe tags
    const vibeResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Generate exactly 3 unique, restaurant-specific vibe tags. Return only the tags separated by commas.

Choose the 3 MOST RELEVANT tags that best describe this specific restaurant:

1. **Atmosphere/Experience** (choose one):
   - Cozy, Intimate, Lively, Bustling, Serene, Casual, Upscale

2. **Style/Character** (choose one):
   - Family-Owned, Artisanal, Traditional, Modern, Rustic, Authentic

3. **Unique Feature** (choose one):
   - Local-Hangout, Date-Night, Business-Friendly, Neighborhood Gem, Hidden Spot

Be SPECIFIC to this restaurant's location, cuisine, and unique characteristics.
Avoid generic words. Each tag should feel like it was chosen specifically for THIS restaurant.`
        },
        {
          role: 'user',
          content: `Restaurant: ${restaurant.name}
Cuisine: ${restaurant.cuisine}
Rating: ${restaurant.rating || 'No rating'}
Neighborhood: ${restaurant.neighborhood || 'Unknown'}
Price Range: ${restaurant.price_range || 'Unknown'}
Address: ${restaurant.address || 'Unknown'}
City: ${restaurant.city || 'Unknown'}

Generate vibe tags that are specific to THIS restaurant's unique characteristics and location.`
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    });

    const aiVibes = vibeResponse.choices[0].message.content.trim();
    console.log(`🏷️  AI Vibes: ${aiVibes}`);

    // Process vibe tags
    const vibeArray = aiVibes.split(',').map(v => v.trim()).filter(Boolean);
    
    // Ensure we have exactly 3 focused vibe tags
    let enrichedVibes = [...vibeArray];
    
    // If we have more than 3 tags, prioritize the most relevant ones
    if (enrichedVibes.length > 3) {
      // Keep the first 3 tags (they're usually the most relevant from AI)
      enrichedVibes = enrichedVibes.slice(0, 3);
    }
    
    // If we have fewer than 3 tags, add the most relevant missing category
    if (enrichedVibes.length < 3) {
      // Add neighborhood if distinctive and not already present
      const distinctiveNeighborhoods = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
      if (restaurant.neighborhood && 
          !enrichedVibes.includes(restaurant.neighborhood) && 
          !distinctiveNeighborhoods.includes(restaurant.neighborhood) &&
          enrichedVibes.length < 3) {
        enrichedVibes.push(restaurant.neighborhood);
      }
      
      // Add cuisine if not already covered and we still need more tags
      if (restaurant.cuisine && 
          !enrichedVibes.includes(restaurant.cuisine) && 
          !enrichedVibes.some(tag => tag.toLowerCase().includes(restaurant.cuisine.toLowerCase())) &&
          enrichedVibes.length < 3) {
        enrichedVibes.push(restaurant.cuisine);
      }
    }

    // Remove duplicates and ensure exactly 3 vibe tags
    const finalVibes = [...new Set(enrichedVibes)].slice(0, 3);

    return {
      id: restaurant.id,
      description: aiDescription,
      vibe_tags: finalVibes,
      last_enhanced: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error processing ${restaurant.name}:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Restaurant Content Generation...\n');

    // Fetch restaurants to enrich (we'll replace all descriptions with better ones)
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id,name,cuisine,rating,price_range,address,neighborhood,latitude,longitude,city,state,description,vibe_tags,menu_highlights,images')
      .limit(100); // Process 100 at a time for maximum efficiency

    if (error) {
      console.error('❌ Error fetching restaurants:', error);
      return;
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('✅ No restaurants need enrichment!');
      return;
    }

    console.log(`📊 Found ${restaurants.length} restaurants to enrich\n`);
    
    // Check total restaurants for progress tracking
    const { count: totalRestaurants } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🎯 Total restaurants in database: ${totalRestaurants}\n`);
    
    // Calculate estimated time (100 restaurants per batch, ~0.5s per restaurant)
    const estimatedBatches = Math.ceil(totalRestaurants / 100);
    const estimatedTimeMinutes = Math.round((totalRestaurants * 0.5) / 60);
    console.log(`⏱️  Estimated time: ${estimatedTimeMinutes} minutes (${estimatedBatches} batches)\n`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process restaurants with rate limiting
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`\n🔄 Processing ${i + 1}/${restaurants.length} (${Math.round(((i + 1) / restaurants.length) * 100)}%)`);
      const enriched = await enrichRestaurant(restaurant);
      
      if (enriched) {
        results.push(enriched);
        successCount++;
      } else {
        errorCount++;
      }

      // Rate limiting delay (0.5 seconds between requests for efficiency)
      if (i < restaurants.length - 1) {
        console.log('⏳ Waiting 0.5 seconds for rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Update database with enriched content
    if (results.length > 0) {
      console.log(`\n💾 Updating ${results.length} restaurants in database...`);
      
      for (const result of results) {
        console.log(`🔍 Updating restaurant ${result.id}:`);
        console.log(`   Description: ${result.description ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Vibe Tags: ${result.vibe_tags ? `✅ ${result.vibe_tags.length} tags` : '❌ Missing'}`);
        
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({
            description: result.description,
            vibe_tags: result.vibe_tags
          })
          .eq('id', result.id);

        if (updateError) {
          console.error(`❌ Error updating restaurant ${result.id}:`, updateError);
        } else {
          console.log(`✅ Successfully updated restaurant ${result.id}`);
        }
      }
    }

    // Summary
    console.log('\n🎉 Content Generation Complete!');
    console.log(`📊 Summary:`);
    console.log(`   • Restaurants Processed: ${restaurants.length}`);
    console.log(`   • Successfully Enriched: ${successCount}`);
    console.log(`   • Errors: ${errorCount}`);
    console.log(`   • Enhanced with Descriptions: ${results.filter(r => r.description).length}`);
    console.log(`   • Enhanced with Vibes: ${results.filter(r => r.vibe_tags && r.vibe_tags.length > 0).length}`);
    
    // Show remaining restaurants to process
    const remainingToProcess = totalRestaurants - (restaurants.length * Math.floor(totalRestaurants / 100));
    console.log(`   • Remaining to Process: ${remainingToProcess}`);
    if (remainingToProcess > 0) {
      console.log(`\n💡 Run the script again to process the remaining ${remainingToProcess} restaurants!`);
    }

    if (results.length > 0) {
      console.log('\n🏆 Top Enhanced Restaurants:');
      results.filter(r => r.description && r.vibe_tags && r.vibe_tags.length > 0).slice(0, 3).forEach((result, index) => {
        const restaurant = restaurants.find(r => r.id === result.id);
        console.log(`   ${index + 1}. ${restaurant.name} (${restaurant.cuisine})`);
        console.log(`      Description: ${result.description}`);
        console.log(`      Vibes: ${result.vibe_tags.join(', ')}`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { enrichRestaurant, main };
