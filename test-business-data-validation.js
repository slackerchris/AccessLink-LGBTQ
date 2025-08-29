// Test script to validate AddBusinessScreen data structure
// Run this to check if the business data object is properly formatted

const testBusinessData = () => {
  // Sample form data (simulating empty optional fields)
  const name = "Test Business";
  const description = "A test business description";
  const category = "restaurant";
  const address = "123 Main St";
  const city = "Test City";
  const state = "CA";
  const zipCode = "12345";
  const phone = ""; // Empty phone
  const email = "test@example.com";
  const website = ""; // Empty website
  const lgbtqVerified = true;
  const wheelchairAccessible = true;
  const brailleMenus = false;
  const signLanguageSupport = false;
  const quietSpaces = true;
  const accessibilityNotes = "Some accessibility notes";
  const userProfileUid = "test-user-123";

  // Build contact object without undefined values (same logic as fixed code)
  const contactData = {};
  if (phone.trim()) contactData.phone = phone.trim();
  if (email.trim()) contactData.email = email.trim();
  if (website.trim()) contactData.website = website.trim();

  const businessData = {
    name: name.trim(),
    description: description.trim(),
    category,
    location: {
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
    },
    contact: contactData,
    accessibility: {
      wheelchairAccessible,
      brailleMenus,
      signLanguageSupport,
      quietSpaces,
      accessibilityNotes: accessibilityNotes.trim(),
    },
    lgbtqFriendly: {
      verified: lgbtqVerified,
      certifications: [],
      inclusivityFeatures: [],
    },
    hours: {},
    tags: [],
    images: [],
    featured: false,
    ownerId: userProfileUid,
    status: 'pending',
  };

  console.log('Business Data Structure:');
  console.log(JSON.stringify(businessData, null, 2));
  
  // Check for undefined values
  const checkForUndefined = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (value === undefined) {
        console.error(`❌ Found undefined value at: ${currentPath}`);
        return false;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (!checkForUndefined(value, currentPath)) {
          return false;
        }
      }
    }
    return true;
  };

  if (checkForUndefined(businessData)) {
    console.log('✅ No undefined values found - safe for Firestore');
  }

  return businessData;
};

// Run the test
testBusinessData();
