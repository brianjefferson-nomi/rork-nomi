#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking n8n setup completion...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('💡 Run: cp n8n.env .env');
  process.exit(1);
}

// Read and check .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'N8N_API_KEY',
  'N8N_ENCRYPTION_KEY'
];

console.log('📋 Environment Variables Status:');
let missingVars = [];

requiredVars.forEach(varName => {
  if (envContent.includes(varName + '=your_')) {
    console.log(`   ❌ ${varName}: Not configured`);
    missingVars.push(varName);
  } else if (envContent.includes(varName + '=')) {
    console.log(`   ✅ ${varName}: Configured`);
  } else {
    console.log(`   ❌ ${varName}: Missing`);
    missingVars.push(varName);
  }
});

console.log('');

if (missingVars.length === 0) {
  console.log('🎉 All required environment variables are configured!');
  console.log('\n🚀 You can now start n8n:');
  console.log('   ./start-n8n.sh');
  console.log('\n🌐 Then open: http://localhost:5678');
} else {
  console.log('⚠️  Some environment variables need to be configured:');
  missingVars.forEach(varName => {
    console.log(`   • ${varName}`);
  });
  
  console.log('\n📝 To complete setup:');
  console.log('1. Edit .env file with your actual values');
  console.log('2. Get Supabase service role key from dashboard');
  console.log('3. Configure AI service API key if needed');
  console.log('4. Run this script again to verify');
}

console.log('\n📚 Available workflows:');
const workflowsDir = path.join(__dirname, 'n8n-workflows');
if (fs.existsSync(workflowsDir)) {
  const workflows = fs.readdirSync(workflowsDir).filter(file => file.endsWith('.json'));
  workflows.forEach(workflow => {
    console.log(`   • ${workflow}`);
  });
}

console.log('\n💡 Next steps after starting n8n:');
console.log('1. Import workflows from n8n-workflows/ directory');
console.log('2. Configure Supabase credentials in n8n dashboard');
console.log('3. Test workflows manually before enabling automation');
console.log('4. Monitor execution logs and database changes');
