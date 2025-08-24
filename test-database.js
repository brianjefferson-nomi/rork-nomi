// Test script to verify Supabase database setup
// Run this with: node test-database.js

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🧪 Testing Supabase Database Setup...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing connection...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.log('❌ Connection failed:', tablesError.message);
      return;
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Check if tables exist
    console.log('2. Checking tables...');
    const { data: tableList, error: tableError } = await supabase
      .rpc('get_tables');
    
    if (tableError) {
      console.log('⚠️  Could not get table list, but continuing...');
    } else {
      console.log('✅ Tables found:', tableList.length);
    }

    // Test 3: Insert a test user
    console.log('\n3. Testing user creation...');
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: 'https://via.placeholder.com/150'
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (userError) {
      console.log('❌ User creation failed:', userError.message);
    } else {
      console.log('✅ Test user created:', user.id);
    }

    // Test 4: Insert a test restaurant
    console.log('\n4. Testing restaurant creation...');
    const testRestaurant = {
      name: 'Test Restaurant',
      cuisine: 'Italian',
      price_range: '$$',
      image_url: 'https://via.placeholder.com/300x200',
      address: '123 Test St',
      neighborhood: 'Test Neighborhood'
    };

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert(testRestaurant)
      .select()
      .single();

    if (restaurantError) {
      console.log('❌ Restaurant creation failed:', restaurantError.message);
    } else {
      console.log('✅ Test restaurant created:', restaurant.id);
    }

    // Test 5: Create a test collection
    if (user && restaurant) {
      console.log('\n5. Testing collection creation...');
      const testCollection = {
        name: 'Test Collection',
        description: 'A test collection',
        created_by: user.id,
        is_public: true
      };

      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert(testCollection)
        .select()
        .single();

      if (collectionError) {
        console.log('❌ Collection creation failed:', collectionError.message);
      } else {
        console.log('✅ Test collection created:', collection.id);
      }

      // Test 6: Add restaurant to collection
      if (collection) {
        console.log('\n6. Testing collection-restaurant relationship...');
        const { data: collectionRestaurant, error: crError } = await supabase
          .from('collection_restaurants')
          .insert({
            collection_id: collection.id,
            restaurant_id: restaurant.id,
            added_by: user.id
          })
          .select()
          .single();

        if (crError) {
          console.log('❌ Collection-restaurant relationship failed:', crError.message);
        } else {
          console.log('✅ Restaurant added to collection');
        }

        // Test 7: Add a vote
        console.log('\n7. Testing voting system...');
        const { data: vote, error: voteError } = await supabase
          .from('restaurant_votes')
          .insert({
            restaurant_id: restaurant.id,
            user_id: user.id,
            collection_id: collection.id,
            vote: 'like',
            reason: 'Great food!'
          })
          .select()
          .single();

        if (voteError) {
          console.log('❌ Vote creation failed:', voteError.message);
        } else {
          console.log('✅ Vote created successfully');
        }
      }
    }

    // Test 8: Query data
    console.log('\n8. Testing data queries...');
    const { data: allUsers, error: queryError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (queryError) {
      console.log('❌ Query failed:', queryError.message);
    } else {
      console.log('✅ Query successful, found', allUsers.length, 'users');
    }

    console.log('\n🎉 Database test completed successfully!');
    console.log('\nYour Supabase database is ready to use with your restaurant app.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Check if credentials are provided
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('❌ Please update the Supabase credentials in this file before running the test.');
  console.log('1. Replace YOUR_SUPABASE_URL with your actual Supabase project URL');
  console.log('2. Replace YOUR_SUPABASE_ANON_KEY with your actual anon key');
  console.log('3. Run: node test-database.js');
} else {
  testDatabase();
}
