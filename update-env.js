#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating .env file with correct credentials...\n');

const envPath = path.join(__dirname, '.env');
const n8nEnvPath = path.join(__dirname, 'n8n.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Your actual Supabase credentials
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c';

// Update the anon key
envContent = envContent.replace(
  'SUPABASE_ANON_KEY=your_anon_key_here',
  `SUPABASE_ANON_KEY=${supabaseAnonKey}`
);

// Write updated content back
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated SUPABASE_ANON_KEY in .env file');
console.log('\n⚠️  IMPORTANT: You still need to add your SUPABASE_SERVICE_ROLE_KEY');
console.log('\n📝 To get your service role key:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project: qlnllnqrdxjiigmzyhlu');
console.log('3. Go to Settings → API');
console.log('4. Copy the "service_role" key (starts with eyJ...)');
console.log('5. Edit .env file and replace:');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('   with your actual service role key');
console.log('\n💡 After adding the service role key, run:');
console.log('   node complete-n8n-setup.js');
console.log('\n🚀 Then you can start n8n with:');
console.log('   ./start-n8n.sh');
