# 🧪 Submit Review Testing Instructions

## 📱 **How to Test the Submit Review Functionality**

### **Step 1: Navigate to Business Directory**
1. Open the app at http://localhost:8084
2. Log in with test credentials:
   - **User**: `user@example.com` / `password123`
3. Navigate to the **Directory** tab at the bottom

### **Step 2: Select a Business**
1. Tap on any business from the list
2. This opens the BusinessDetailsScreen
3. Look for a "Write Review" or "Add Review" button
4. Tap it to navigate to CreateReviewScreen

### **Step 3: Fill Out Review Form**
1. **Select a Rating**: Tap on the stars (1-5 stars)
   - Watch browser console for: `🔍 DEBUG: Rating selected = X`
2. **Write a Comment**: Type in the review text area
   - Must have at least some text (not empty)
3. **Optional**: Add photos or accessibility tags

### **Step 4: Submit Review**
1. Tap the "📝 Submit Review" button
2. **Watch Browser Console** for debug messages:
   ```
   🔍 DEBUG: Submit button pressed!
   🔍 DEBUG: handleSubmitReview called
   🔍 DEBUG: rating = X
   🔍 DEBUG: comment = [your comment]
   ```

## 🔍 **Expected Debug Output**

### **If Button Press Works:**
```
🔍 DEBUG: Submit button pressed!
🔍 DEBUG: Button disabled state = false
🔍 DEBUG: handleSubmitReview called
🔍 DEBUG: rating = 4
🔍 DEBUG: comment = Great place!
🔍 DEBUG: businessId = business-123
🔍 DEBUG: businessName = Sample Business
```

### **If Validation Fails (No Rating):**
```
🔍 DEBUG: Submit button pressed!
🔍 DEBUG: handleSubmitReview called
🔍 DEBUG: rating = 0
⚠️ DEBUG: Validation failed - no rating selected
```

### **If Validation Fails (No Comment):**
```
🔍 DEBUG: Submit button pressed!
🔍 DEBUG: handleSubmitReview called
🔍 DEBUG: rating = 4
🔍 DEBUG: comment = 
⚠️ DEBUG: Validation failed - no comment entered
```

### **If Submission Succeeds:**
```
✅ DEBUG: Validation passed, starting submission
🔍 DEBUG: Calling addReview service with: {businessId, rating, comment...}
✅ DEBUG: addReview completed successfully
🔍 DEBUG: Navigating back to previous screen
```

## 🚨 **Common Issues to Check**

### **Issue 1: Button Not Responding**
- **Check**: No console messages when button is pressed
- **Cause**: Button might be disabled or not properly wired
- **Look for**: `🔍 DEBUG: Submit button pressed!`

### **Issue 2: Validation Failing**
- **Check**: Alert shows "Rating Required" or "Review Required"
- **Cause**: User hasn't selected rating or entered comment
- **Look for**: `⚠️ DEBUG: Validation failed`

### **Issue 3: Service Call Failing**
- **Check**: Error alert shows "Submission Error"
- **Cause**: `addReview` service throwing error
- **Look for**: `❌ DEBUG: addReview failed:`

### **Issue 4: Navigation Problems**
- **Check**: No `businessId` or `businessName` in debug output
- **Cause**: Route parameters not passed correctly
- **Look for**: `🔍 DEBUG: route.params =` when component loads

## 🛠️ **Troubleshooting Steps**

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Follow test steps above**
4. **Look for debug messages**
5. **Identify where the flow stops**

## 📍 **Quick Navigation Path**
```
App Launch → Login → Directory Tab → Select Business → Write Review Button → CreateReviewScreen
```

---

**NOTE**: Debug logs will appear in the browser console when using the web version at http://localhost:8084
