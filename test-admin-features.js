/**
 * Admin Feature Diagnostic Test
 * Quick test to verify admin functionality works
 */

import { webAuthService as authService } from '../services/webAuthService';
import { businessService } from '../services/mockBusinessService';
import { adminService } from '../services/adminService';

async function testAdminFeatures() {
  console.log('🔍 Testing Admin Features...\n');

  try {
    // Initialize auth service
    await authService.initialize();
    
    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const adminUser = await authService.signInWithEmailAndPassword('admin@accesslinklgbtq.app', 'password123');
    console.log('✅ Admin login successful:', adminUser.email, '- Type:', adminUser.userType);
    
    // Test 2: Get All Businesses (Admin method)
    console.log('\n2️⃣ Testing Business Management - Get All Businesses...');
    const allBusinesses = await authService.getAllBusinesses();
    console.log('✅ Retrieved', allBusinesses.length, 'businesses');
    
    // Test 4: Platform Stats
    console.log('\n4️⃣ Testing Platform Stats...');
    const stats = await adminService.getPlatformStats();
    console.log('✅ Platform stats:', {
      totalUsers: stats.totalUsers,
      totalBusinesses: stats.totalBusinesses,
      totalReviews: stats.totalReviews
    });
    
    // Test 5: Business Creation
    console.log('\n5️⃣ Testing Business Creation...');
    const testBusiness = {
      name: 'Test Admin Business',
      description: 'A test business created by admin',
      category: 'other',
      location: {
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
      },
      contact: {
        phone: '555-1234',
        email: 'test@business.com',
      },
      accessibility: {
        wheelchairAccessible: true,
        visuallyImpairedFriendly: false,
        hearingImpairedFriendly: false,
      },
      lgbtqInfo: {
        safeSpaceCertified: true,
        lgbtqOwned: false,
        supportsPrideEvents: false,
        lgbtqStaffTraining: false,
        genderNeutralBathrooms: false,
      },
      hours: {},
      tags: [],
      images: [],
      services: [],
      mediaGallery: [],
      events: [],
      ownerId: adminUser.uid,
      approved: true,
      featured: false,
      reviews: [],
    };
    
    const businessId = await businessService.createBusiness(testBusiness);
    console.log('✅ Business created with ID:', businessId);
    
    // Test 6: Feature/Unfeature Business
    console.log('\n6️⃣ Testing Feature Toggle...');
    await businessService.toggleBusinessFeature(businessId, true);
    console.log('✅ Business featured successfully');
    
    await businessService.toggleBusinessFeature(businessId, false);
    console.log('✅ Business unfeatured successfully');
    
    // Test 7: Delete Business
    console.log('\n7️⃣ Testing Business Deletion...');
    await businessService.deleteBusiness(businessId);
    console.log('✅ Business deleted successfully');
    
    console.log('\n🎉 All admin features working correctly!');
    
  } catch (error) {
    console.error('❌ Admin feature test failed:');
    console.error('Error:', error.message || error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAdminFeatures();
