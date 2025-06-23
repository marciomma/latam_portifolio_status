/**
 * Script to set up the .env.local file with Redis credentials
 * Run with: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Redis Configuration (Required)
# These are the credentials that were previously hardcoded
UPSTASH_REDIS_REST_URL=https://united-mammal-20071.upstash.io
UPSTASH_REDIS_REST_TOKEN=AU5nAAIjcDFmM2ZiZjU3NjMxZDQ0YWY1OTIyMmZlMzgxMDgzMTkzYXAxMA

# Node Environment
NODE_ENV=development
`;

const envPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('If you want to reset it, delete the file first and run this script again.');
  process.exit(0);
}

// Create .env.local
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with Redis credentials');
  console.log('🔒 Security Note: These credentials should be replaced with your own in production!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. The Redis errors should be gone');
  console.log('3. For production, create your own Redis instance at https://upstash.com');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n🔧 Manual fix:');
  console.log('Create a file named .env.local in your project root with this content:\n');
  console.log(envContent);
} 