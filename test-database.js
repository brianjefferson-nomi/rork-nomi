// Test script to verify Supabase database setup
// Run this with: node test-database.js

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://qlnllnqrdxjiigmzyhlu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetUserPlans() {
  try {
    // Test with a known user ID from the test data
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    
    console.log('Testing getUserPlans with userId:', userId);
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .or(`created_by.eq.${userId},is_public.eq.true`);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Success! Found collections:', data);
    console.log('Number of collections:', data.length);
    
    // Also test getting all collections
    const { data: allData, error: allError } = await supabase
      .from('collections')
      .select('*');
    
    if (allError) {
      console.error('Error getting all collections:', allError);
      return;
    }
    
    console.log('All collections:', allData);
    console.log('Total collections in database:', allData.length);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGetUserPlans();
