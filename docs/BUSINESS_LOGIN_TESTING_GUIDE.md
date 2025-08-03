# 🔐 Business Login Testing Guide

*Updated: August 2, 2025*

## 📋 **Available Business Login Accounts**

All business accounts use the password: **`password123`**

### **☕ Rainbow Café**
- **Email**: `business@example.com`
- **Business ID**: `rainbow-cafe-001`
- **Category**: Restaurant
- **Location**: San Francisco, CA
- **Features**: Organic coffee, pastries, community events
- **Owner**: Rainbow Cafe Owner

### **🏥 Pride Health Center**
- **Email**: `owner@pridehealth.com`
- **Business ID**: `pride-health-center-002`
- **Category**: Healthcare
- **Location**: Portland, OR
- **Features**: LGBTQ+ healthcare, hormone therapy, mental health
- **Owner**: Pride Health

### **💪 Pride Fitness Studio**
- **Email**: `owner@pridefitness.com`
- **Business ID**: `mock-business-3`
- **Category**: Fitness
- **Location**: Austin, TX
- **Features**: Body-positive fitness, group classes, personal training
- **Owner**: Fitness Studio

### **📚 Inclusive Bookstore**
- **Email**: `hello@inclusivebooks.com`
- **Business ID**: `inclusive-bookstore-003`
- **Category**: Retail
- **Location**: Seattle, WA
- **Features**: LGBTQ+ literature, community events, safe space
- **Owner**: Inclusive Books

---

## 🚀 **Quick Login from Sign-In Screen**

The login screen now includes dedicated business login buttons:

1. **Open the app** and navigate to the login screen
2. **Scroll down** to see "Business Login Options" section
3. **Tap any business button** to auto-fill credentials
4. **Tap "Sign In"** to access the business dashboard

---

## 🏢 **Business Dashboard Features**

Once logged in as a business owner, you can test:

### **📊 Business Management**
- View business profile and details
- Manage business information
- Update contact details and hours

### **📅 Events Management**
- Create and manage business events
- Set event categories and accessibility features
- View upcoming and past events

### **🖼️ Media Gallery**
- View uploaded business photos
- Organize media by categories
- *Note: Photo upload feature is placeholder (coming soon)*

### **🛠️ Services Management**
- Add and edit business services
- Set pricing and availability
- Manage service categories

### **📈 Analytics (Basic)**
- View business statistics
- Monitor follower count
- *Note: Advanced analytics in development*

---

## 🔧 **Testing Scenarios**

### **Scenario 1: Business Profile Management**
1. Login as **Rainbow Café** (`business@example.com`)
2. Navigate to **Business Profile**
3. Test editing business information
4. Verify changes persist after logout/login

### **Scenario 2: Event Creation**
1. Login as **Pride Health Center** (`owner@pridehealth.com`)
2. Go to **Events Management**
3. Create a new health workshop event
4. Set accessibility features
5. Verify event appears in business events list

### **Scenario 3: Services Management**
1. Login as **Pride Fitness Studio** (`owner@pridefitness.com`)
2. Navigate to **Services Management**
3. Add new fitness classes or training sessions
4. Set pricing and availability
5. Test service editing and deletion

### **Scenario 4: Media Gallery**
1. Login as **Inclusive Bookstore** (`hello@inclusivebooks.com`)
2. Go to **Media Gallery**
3. View existing placeholder media
4. Test media organization features
5. *Note: Upload functionality is placeholder*

---

## 👥 **Other Account Types for Testing**

### **👑 Admin Account**
- **Username**: `admin`
- **Password**: `accesslink1234`
- **Features**: User management, business approval, debug dashboard

### **👤 Regular User Account**
- **Email**: `user@example.com`
- **Password**: `password123`
- **Features**: Browse businesses, write reviews, save places

---

## ⚠️ **Known Limitations**

### **Placeholder Features**
These features show "coming soon" alerts:
- **Media Upload**: Photo/video upload functionality
- **Advanced Analytics**: Detailed business metrics
- **Community Updates**: Business announcement posting

### **Mock Data**
- All data is stored locally in browser storage
- No real external API connections
- Data resets on app restart in development mode

---

## 🐛 **Testing Tips**

### **Browser Storage**
- Use browser developer tools to inspect localStorage/IndexedDB
- Clear storage to reset all data if needed
- Check console for debug logs during testing

### **Authentication Flow**
- Password is hashed with SHA-256 + salt
- Account status (active/suspended) is checked during login
- Session persists until manual logout

### **Navigation Testing**
- Test back button functionality on all screens
- Verify navigation between business management screens
- Check theme consistency across all views

---

## 📞 **Support & Debugging**

### **Debug Dashboard Access**
1. Login as admin (`admin` / `accesslink1234`)
2. Navigate to **Debug Dashboard**
3. View system logs, performance metrics, and user data
4. Use for troubleshooting authentication or business data issues

### **Console Logging**
- Open browser developer console
- Look for detailed authentication logs
- Business service operations are logged with timestamps

---

*Last Updated: August 2, 2025 - AccessLink LGBTQ+ Development Team*
