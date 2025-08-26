const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NzQ5NjAwLCJleHAiOjIwNTAzMjU2MDB9.x3BEcNGNReHeyPV';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCollectionTypeMigration() {
  console.log('Running collection type migration...\n');

  try {
    // Step 1: Add the collection_type column
    console.log('1. Adding collection_type column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE collections 
        ADD COLUMN IF NOT EXISTS collection_type TEXT CHECK (collection_type IN ('public', 'private', 'shared')) DEFAULT 'public';
      `
    });

    if (alterError) {
      console.error('Error adding collection_type column:', alterError);
      return;
    }
    console.log('✅ collection_type column added successfully');

    // Step 2: Update existing collections based on is_public
    console.log('\n2. Updating existing collections...');
    
    // Get all collections
    const { data: collections, error: fetchError } = await supabase
      .from('collections')
      .select('*');

    if (fetchError) {
      console.error('Error fetching collections:', fetchError);
      return;
    }

    console.log(`Found ${collections.length} collections to update`);

    for (const collection of collections) {
      let newType = 'public'; // default
      
      if (collection.is_public === false) {
        // Check if this collection has members (shared)
        const { data: members, error: memberError } = await supabase
          .from('collection_members')
          .select('user_id')
          .eq('collection_id', collection.id);
        
        if (!memberError && members && members.length > 0) {
          newType = 'shared';
        } else {
          newType = 'private';
        }
      }

      // Update the collection type
      const { error: updateError } = await supabase
        .from('collections')
        .update({ collection_type: newType })
        .eq('id', collection.id);

      if (updateError) {
        console.error(`Error updating collection ${collection.name}:`, updateError);
      } else {
        console.log(`✅ Updated collection "${collection.name}" to type: ${newType}`);
      }
    }

    // Step 3: Create index for performance
    console.log('\n3. Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_collections_collection_type ON collections(collection_type);'
    });

    if (indexError) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('✅ Index created successfully');
    }

    console.log('\n🎉 Collection type migration completed successfully!');
    
    // Step 4: Verify the migration
    console.log('\n4. Verifying migration...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('collections')
      .select('name, collection_type, is_public')
      .limit(5);

    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
    } else {
      console.log('Sample collections after migration:');
      verifyData.forEach(collection => {
        console.log(`  - ${collection.name}: ${collection.collection_type} (is_public: ${collection.is_public})`);
      });
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runCollectionTypeMigration();
