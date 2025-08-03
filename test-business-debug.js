/**
 * Business Account Debug Script
 * Test the business account association for business@example.com
 */

const { databaseService } = require('./services/webDatabaseService');

async function testBusinessAccount() {
  console.log('🔍 Testing Business Account Association...\n');

  try {
    // Initialize services
    await databaseService.initialize();

    // Test 1: Check if user exists
    console.log('1️⃣ Looking up user: business@example.com');
    const user = await databaseService.getUserByEmail('business@example.com');
    console.log('User found:', user ? `${user.displayName} (ID: ${user.id})` : 'NOT FOUND');

    if (user) {
      // Test 2: Check businesses owned by this user
      console.log('\n2️⃣ Looking up businesses owned by this user...');
      const businesses = await databaseService.getBusinessesByOwner(user.id);
      console.log(`Found ${businesses.length} businesses:`);
      businesses.forEach((business, index) => {
        console.log(`  ${index + 1}. ${business.name} (ID: ${business.id})`);
        console.log(`     Category: ${business.category}`);
        console.log(`     Address: ${business.address}`);
      });

      // Test 3: Check all businesses and their owners
      console.log('\n3️⃣ All businesses in database:');
      const allBusinesses = await databaseService.getAllBusinesses();
      allBusinesses.forEach((business, index) => {
        console.log(`  ${index + 1}. ${business.name} - Owner ID: ${business.ownerId}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBusinessAccount();
