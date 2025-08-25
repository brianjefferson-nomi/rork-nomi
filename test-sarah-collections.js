// Test script to debug Sarah Johnson's collections issue
// Run this in your browser console or Node.js environment

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSarahCollections() {
  const sarahUserId = '11111111-1111-1111-1111-111111111111';
  
  console.log('=== DEBUGGING SARAH JOHNSON COLLECTIONS ===');
  
  try {
    // 1. Check if Sarah exists
    console.log('\n1. Checking if Sarah Johnson exists...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', sarahUserId)
      .single();
    
    if (userError) {
      console.error('❌ User error:', userError);
      return;
    }
    console.log('✅ Sarah found:', user);
    
    // 2. Check collections where Sarah is creator
    console.log('\n2. Checking collections Sarah created...');
    const { data: creatorCollections, error: creatorError } = await supabase
      .from('collections')
      .select('*')
      .or(`created_by.eq.${sarahUserId},creator_id.eq.${sarahUserId}`);
    
    if (creatorError) {
      console.error('❌ Creator collections error:', creatorError);
    } else {
      console.log('✅ Creator collections:', creatorCollections?.length || 0);
      creatorCollections?.forEach(c => console.log(`   - ${c.name} (${c.id})`));
    }
    
    // 3. Check collections where Sarah is a member
    console.log('\n3. Checking collections Sarah is a member of...');
    const { data: memberIds, error: memberIdsError } = await supabase
      .from('collection_members')
      .select('collection_id')
      .eq('user_id', sarahUserId);
    
    if (memberIdsError) {
      console.error('❌ Member IDs error:', memberIdsError);
    } else {
      console.log('✅ Member collection IDs:', memberIds?.length || 0);
      memberIds?.forEach(m => console.log(`   - ${m.collection_id}`));
      
      if (memberIds && memberIds.length > 0) {
        const collectionIds = memberIds.map(m => m.collection_id);
        
        const { data: memberCollections, error: memberCollsError } = await supabase
          .from('collections')
          .select('*')
          .in('id', collectionIds);
        
        if (memberCollsError) {
          console.error('❌ Member collections error:', memberCollsError);
        } else {
          console.log('✅ Member collections:', memberCollections?.length || 0);
          memberCollections?.forEach(c => console.log(`   - ${c.name} (${c.id})`));
        }
      }
    }
    
    // 4. Check all collections (to see if they exist)
    console.log('\n4. Checking all collections...');
    const { data: allCollections, error: allError } = await supabase
      .from('collections')
      .select('id, name, created_by, is_public')
      .limit(20);
    
    if (allError) {
      console.error('❌ All collections error:', allError);
    } else {
      console.log('✅ All collections:', allCollections?.length || 0);
      allCollections?.forEach(c => console.log(`   - ${c.name} (${c.id}) - Public: ${c.is_public}`));
    }
    
    // 5. Check collection_members table
    console.log('\n5. Checking collection_members table...');
    const { data: allMembers, error: membersError } = await supabase
      .from('collection_members')
      .select('*')
      .limit(20);
    
    if (membersError) {
      console.error('❌ Collection members error:', membersError);
    } else {
      console.log('✅ Collection members:', allMembers?.length || 0);
      allMembers?.forEach(m => console.log(`   - User ${m.user_id} in collection ${m.collection_id} (${m.role})`));
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

// Run the debug function
debugSarahCollections();
