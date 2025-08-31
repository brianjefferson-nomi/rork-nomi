const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateCollectionLikesTable() {
  try {
    console.log('🔍 Checking if collection_likes table exists...');
    
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('collection_likes')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ collection_likes table does not exist. Creating it...');
        
        // Create the table using SQL
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS collection_likes (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
              user_id UUID NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(collection_id, user_id)
            );
            
            -- Create index for better performance
            CREATE INDEX IF NOT EXISTS idx_collection_likes_collection_id ON collection_likes(collection_id);
            CREATE INDEX IF NOT EXISTS idx_collection_likes_user_id ON collection_likes(user_id);
          `
        });
        
        if (createError) {
          console.error('❌ Failed to create collection_likes table:', createError);
          console.log('📝 You may need to create the table manually in Supabase dashboard:');
          console.log(`
            CREATE TABLE collection_likes (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
              user_id UUID NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(collection_id, user_id)
            );
          `);
        } else {
          console.log('✅ collection_likes table created successfully!');
        }
      } else {
        console.error('❌ Error checking collection_likes table:', error);
      }
    } else {
      console.log('✅ collection_likes table already exists');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkAndCreateCollectionLikesTable(); 