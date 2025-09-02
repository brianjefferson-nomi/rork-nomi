#!/usr/bin/env node

/**
 * Script to run the pexels_images table migration
 * This creates the necessary table for storing Pexels image data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY is required in your .env file');
  console.error('Please add your Supabase service role key to run migrations');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Pexels images table migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'create_pexels_images_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded successfully');
    console.log('🔧 Executing migration...\n');

    // Split the SQL into individual statements (by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Skip comments
        if (statement.startsWith('--')) {
          continue;
        }

        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        }).single();

        if (error) {
          // Try direct execution as an alternative
          const { error: directError } = await supabase
            .from('_sql')
            .insert({ query: statement + ';' });

          if (directError) {
            console.error(`❌ Error executing statement: ${directError.message}`);
            errorCount++;
          } else {
            console.log('✅ Statement executed successfully');
            successCount++;
          }
        } else {
          console.log('✅ Statement executed successfully');
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    // Verify the table was created
    console.log('\n🔍 Verifying table creation...');
    const { data, error: verifyError } = await supabase
      .from('pexels_images')
      .select('*')
      .limit(1);

    if (verifyError) {
      if (verifyError.code === 'PGRST205') {
        console.error('❌ Table creation failed - pexels_images table not found');
        console.error('\n⚠️  Manual Action Required:');
        console.error('1. Go to your Supabase dashboard: https://app.supabase.com');
        console.error('2. Navigate to the SQL Editor');
        console.error('3. Copy and paste the contents of database/migrations/create_pexels_images_table.sql');
        console.error('4. Execute the SQL manually');
      } else {
        console.error(`❌ Verification error: ${verifyError.message}`);
      }
    } else {
      console.log('✅ Table pexels_images created successfully!');
      console.log('🎉 Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n⚠️  Manual Action Required:');
    console.error('1. Go to your Supabase dashboard: https://app.supabase.com');
    console.error('2. Navigate to the SQL Editor');
    console.error('3. Copy and paste the contents of database/migrations/create_pexels_images_table.sql');
    console.error('4. Execute the SQL manually');
  }
}

// Run the migration
runMigration();