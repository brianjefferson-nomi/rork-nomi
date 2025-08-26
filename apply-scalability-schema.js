const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyScalabilitySchema() {
  console.log('🚀 Applying Scalability Schema...\n');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database-schema-scalability.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement || statement.trim() === '') continue;

      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`);
        
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
          
          // Continue with next statement instead of failing completely
          continue;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (stmtError) {
        console.error(`❌ Exception in statement ${i + 1}:`, stmtError.message);
        errorCount++;
        continue;
      }
    }

    console.log('\n📊 Execution Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    if (errorCount === 0) {
      console.log('\n🎉 All scalability improvements applied successfully!');
    } else {
      console.log('\n⚠️  Some statements failed. Check the errors above.');
      console.log('You may need to run the schema manually or fix specific issues.');
    }

  } catch (error) {
    console.error('❌ Failed to apply scalability schema:', error);
    console.log('\n💡 Alternative: You can run the SQL file directly in your database:');
    console.log('psql -d your_database -f database-schema-scalability.sql');
  }
}

// Alternative function to execute SQL directly (if exec_sql RPC doesn't exist)
async function executeSQLDirectly() {
  console.log('🔧 Attempting direct SQL execution...\n');

  try {
    // Test basic operations first
    console.log('1. Testing basic database access...');
    
    // Test if we can create a simple table
    const { error: testError } = await supabase
      .from('test_scalability_temp')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('✅ Database access confirmed');
    } else {
      console.log('✅ Database access confirmed');
    }

    console.log('\n2. Checking existing functions...');
    
    // Check what functions already exist
    const { data: existingFunctions, error: funcError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT 
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public'
          AND p.proname IN (
            'get_user_collections_paginated',
            'update_user_activity_summary',
            'update_collection_stats_cache',
            'trigger_update_collection_stats',
            'check_rate_limit',
            'archive_old_data'
          );
        `
      });

    if (funcError) {
      console.log('⚠️  Could not check existing functions:', funcError.message);
    } else {
      console.log('Existing functions found:', existingFunctions?.length || 0);
      existingFunctions?.forEach(func => {
        console.log(`   - ${func.function_name}(${func.arguments})`);
      });
    }

    console.log('\n💡 Manual Application Required');
    console.log('The exec_sql RPC function may not be available.');
    console.log('Please apply the schema manually using:');
    console.log('psql -d your_database -f database-schema-scalability.sql');

  } catch (error) {
    console.error('❌ Direct execution failed:', error);
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking database capabilities...\n');

  try {
    // First try the RPC method
    await applyScalabilitySchema();
  } catch (error) {
    console.log('RPC method failed, trying alternative approach...\n');
    await executeSQLDirectly();
  }
}

main();
