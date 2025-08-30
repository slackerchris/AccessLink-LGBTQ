/**
 * Photo Upload Test Script
 * Quick test to verify Firebase Storage integration
 */

console.log('📸 Photo Upload Service Test');

// Test Firebase Storage configuration
try {
  const { storage } = require('../services/firebase');
  console.log('✅ Firebase Storage initialized successfully');
  console.log('📁 Storage app:', storage.app.name);
} catch (error) {
  console.error('❌ Firebase Storage initialization failed:', error.message);
}

// Test photo upload service imports
try {
  const { photoUploadService } = require('../services/photoUploadService');
  console.log('✅ Photo Upload Service imported successfully');
  console.log('🔧 Available methods:', Object.keys(photoUploadService));
} catch (error) {
  console.error('❌ Photo Upload Service import failed:', error.message);
}

// Test PhotoUploadComponent import
try {
  const PhotoUploadComponent = require('../components/common/PhotoUploadComponent');
  console.log('✅ PhotoUploadComponent imported successfully');
} catch (error) {
  console.error('❌ PhotoUploadComponent import failed:', error.message);
}

console.log('🎯 Photo upload system ready for testing!');
