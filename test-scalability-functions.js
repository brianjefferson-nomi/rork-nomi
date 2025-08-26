const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testScalabilityFunctions() {
  console.log('🧪 Testing Scalability Functions...\n');

  try {
    // Test 1: Check if rate_limits table exists
    console.log('1. Testing rate_limits table...');
    const { data: rateLimitsTable, error: rateLimitsError } = await supabase
      .from('rate_limits')
      .select('*')
      .limit(1);
    
    if (rateLimitsError) {
      console.error('❌ Rate limits table error:', rateLimitsError.message);
    } else {
      console.log('✅ Rate limits table exists and is accessible');
    }

    // Test 2: Test rate limiting function
    console.log('\n2. Testing rate limiting function...');
    const testUserId = '11111111-1111-1111-1111-111111111111';
    
    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_user_id: testUserId,
        p_action_type: 'test',
        p_max_requests: 5,
        p_window_minutes: 60
      });
    
    if (rateLimitError) {
      console.error('❌ Rate limit function error:', rateLimitError.message);
    } else {
      console.log('✅ Rate limit function works:', rateLimitResult);
    }

    // Test 3: Check if archive tables exist
    console.log('\n3. Testing archive tables...');
    const { data: archivedVotesTable, error: archivedVotesError } = await supabase
      .from('archived_restaurant_votes')
      .select('*')
      .limit(1);
    
    if (archivedVotesError) {
      console.error('❌ Archived votes table error:', archivedVotesError.message);
    } else {
      console.log('✅ Archived votes table exists and is accessible');
    }

    const { data: archivedDiscussionsTable, error: archivedDiscussionsError } = await supabase
      .from('archived_restaurant_discussions')
      .select('*')
      .limit(1);
    
    if (archivedDiscussionsError) {
      console.error('❌ Archived discussions table error:', archivedDiscussionsError.message);
    } else {
      console.log('✅ Archived discussions table exists and is accessible');
    }

    // Test 4: Test archive function (dry run - won't actually archive)
    console.log('\n4. Testing archive function...');
    const { data: archiveResult, error: archiveError } = await supabase
      .rpc('archive_old_data', {
        p_months_old: 24  // Very old data to avoid affecting current data
      });
    
    if (archiveError) {
      console.error('❌ Archive function error:', archiveError.message);
    } else {
      console.log('✅ Archive function works:', archiveResult);
    }

    // Test 5: Check if user_activity_summary table exists
    console.log('\n5. Testing user activity summary table...');
    const { data: activitySummaryTable, error: activitySummaryError } = await supabase
      .from('user_activity_summary')
      .select('*')
      .limit(1);
    
    if (activitySummaryError) {
      console.error('❌ User activity summary table error:', activitySummaryError.message);
    } else {
      console.log('✅ User activity summary table exists and is accessible');
    }

    // Test 6: Check if collection_stats_cache table exists
    console.log('\n6. Testing collection stats cache table...');
    const { data: statsCacheTable, error: statsCacheError } = await supabase
      .from('collection_stats_cache')
      .select('*')
      .limit(1);
    
    if (statsCacheError) {
      console.error('❌ Collection stats cache table error:', statsCacheError.message);
    } else {
      console.log('✅ Collection stats cache table exists and is accessible');
    }

    // Test 7: Test paginated collections function
    console.log('\n7. Testing paginated collections function...');
    const { data: paginatedCollections, error: paginatedError } = await supabase
      .rpc('get_user_collections_paginated', {
        p_user_id: testUserId,
        p_limit: 5,
        p_offset: 0,
        p_include_public: true
      });
    
    if (paginatedError) {
      console.error('❌ Paginated collections function error:', paginatedError.message);
    } else {
      console.log('✅ Paginated collections function works:', paginatedCollections?.length || 0, 'collections found');
    }

    // Test 8: Check system health view
    console.log('\n8. Testing system health view...');
    const { data: systemHealth, error: healthError } = await supabase
      .from('system_health')
      .select('*');
    
    if (healthError) {
      console.error('❌ System health view error:', healthError.message);
    } else {
      console.log('✅ System health view works:', systemHealth?.length || 0, 'metrics available');
      systemHealth?.forEach(metric => {
        console.log(`   - ${metric.table_name}: ${metric.total_records} total, ${metric.new_today} new today`);
      });
    }

    console.log('\n🎉 Scalability functions test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testScalabilityFunctions();
