# 📱 AccessLink LGBTQ+ Application Visualization

*Last Updated: July 29, 2025 - Navigation System Overhaul*

This document provides a visual representation of the application structure, navigation flow, and user interface design.

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AccessLink LGBTQ+ App                        │
│         React Native + Expo SDK 52 + Universal Navigation      │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Authentication      │
                    │    State Manager      │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
         ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
         │  Admin  │       │Business │       │  User   │
         │Dashboard│       │ Owner   │       │ Portal  │
         │(✅ Nav) │       │ Portal  │       │(✅ Nav) │
         └─────────┘       └─────────┘       └─────────┘
```

## 🧭 Navigation Structure

### Bottom Tab Navigation (User Role)
```
┌──────────────────────────────────────────────────────────────┐
│                     Bottom Tab Bar                           │
├─────────┬─────────┬─────────┬─────────┬────────────────────┤
│  Home   │Directory│ Saved   │ Events  │      Portal        │
│   🏠    │   🏢    │   📖    │   📅    │        ⚏          │
│         │         │         │         │                    │
│ User    │Business │Saved    │Community│   User Portal      │
│Dashboard│Listings │Places   │Events   │ (✅ Full Nav)     │
└─────────┴─────────┴─────────┴─────────┴────────────────────┘
```

### Portal Stack Navigation (✅ Complete Back Navigation)
```
Portal Tab
│
├── Portal Main Screen (Hub)
│   ┌─────────────────────────────────────────────────────────┐
│   │                Portal Dashboard                         │
│   │  ┌─────────┬─────────┬─────────┬─────────┬─────────┐   │
│   │  │👤 My    │📍Saved │⭐ My    │♿Access-│🏳️‍🌈Ident│   │
│   │  │Profile  │Places  │Reviews  │ibility │ity     │   │
│   │  └─────────┴─────────┴─────────┴─────────┴─────────┘   │
│   │  ┌─────────────────────────────────────────────────┐   │
│   │  │              🚪 Sign Out                        │   │
│   │  └─────────────────────────────────────────────────┘   │
│   └─────────────────────────────────────────────────────────┘
│   
├── EditProfile Screen (✅ Back Button)
│   └── Personal information editing
│   
├── SavedPlaces Screen (✅ Context-Aware Back Button)
│   └── Bookmarked businesses management
│   
├── ReviewHistory Screen (✅ Back Button)
│   └── Review management with statistics
│   
├── AccessibilityPreferences Screen (✅ Back Button)
│   └── 6-category accessibility settings
│   
└── LGBTQIdentity Screen (✅ Back Button)
    └── Identity management with privacy controls
```

### 🔙 Navigation Flow Examples

#### Portal Navigation with Back Buttons
```
Portal Main → My Profile → ← Back to Portal
           → Saved Places → ← Back to Portal  
           → My Reviews → ← Back to Portal
           → Accessibility → ← Back to Portal
           → Identity → ← Back to Portal
```

#### Context-Aware Navigation (SavedPlacesScreen)
```
Saved Tab (Direct) → No Back Button ✅
Portal → Saved Places → ← Back Button ✅
```

## 🎨 User Interface Design

### Portal Main Screen Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 🔵 Header Section (Blue Gradient)                          │
│    Portal                                                   │
│    Welcome back, [Name]! Manage your account...           │
└─────────────────────────────────────────────────────────────┘
│ Portal Feature Cards (2x3 Grid)                           │
│                                                            │
│ ┌─────────────┐  ┌─────────────┐                         │
│ │  👤 Person  │  │ 📍 Bookmark │                         │
│ │ My Profile  │  │Saved Places │                         │
│ │Edit details │  │ X businesses│                         │
│ └─────────────┘  └─────────────┘                         │
│                                                            │
│ ┌─────────────┐  ┌─────────────┐                         │
│ │  ⭐ Star    │  │♿Accessibility│                         │
│ │ My Reviews  │  │Preferences  │                         │
│ │ X reviews   │  │Customize... │                         │
│ └─────────────┘  └─────────────┘                         │
│                                                            │
│ ┌─────────────┐  ┌─────────────┐                         │
│ │🏳️‍🌈 Heart   │  │ 🚪 Log-out  │                         │
│ │Identity     │  │  Sign Out   │                         │
│ │Settings     │  │Logout app   │                         │
│ └─────────────┘  └─────────────┘                         │
│                                                            │
│ Account Information Section                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Account Information                                  │ │
│ │ Email: user@example.com                                │ │  
│ │ Type: Community Member                                 │ │
│ │ Since: January 15, 2025                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Feature Screen Layouts

#### Accessibility Preferences Screen
```
┌─────────────────────────────────────────────────────────────┐
│ ♿ Accessibility Preferences                                │
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🦽 Wheelchair Access              [Toggle: OFF] ◯      │ │
│ │ 👁️ Visual Impairment Support       [Toggle: OFF] ◯      │ │
│ │ 👂 Hearing Impairment Support      [Toggle: OFF] ◯      │ │
│ │ 🧠 Cognitive Support              [Toggle: OFF] ◯      │ │
│ │ 🦾 Mobility Support               [Toggle: OFF] ◯      │ │
│ │ 🎯 Sensory Friendly               [Toggle: OFF] ◯      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Save Preferences Button]                                 │
└─────────────────────────────────────────────────────────────┘
```

#### LGBTQ+ Identity Screen
```
┌─────────────────────────────────────────────────────────────┐
│ 🏳️‍🌈 LGBTQ+ Identity Settings                               │
│                                                            │
│ Profile Visibility                                         │
│ ◯ Private Profile  ⚫ Public Profile                      │
│                                                            │
│ Pronouns: [Text Input Field]                              │
│                                                            │
│ Preferred Name: [Text Input Field]                        │
│                                                            │
│ Identity Labels:                                           │
│ ☑️ Gay        ☑️ Lesbian      ☐ Bisexual                   │
│ ☐ Trans      ☐ Non-binary    ☐ Queer                     │
│ ☐ Asexual    ☐ Pansexual     ☐ Other                     │
│                                                            │
│ [Save Settings Button]                                     │
└─────────────────────────────────────────────────────────────┘
```

#### Review History Screen
```
┌─────────────────────────────────────────────────────────────┐
│ ⭐ My Reviews                                               │
│                                                            │
│ Statistics:                                                │
│ Total Reviews: 3 | Average Rating: 4.7 ⭐                 │
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌈 Rainbow Cafe                          ⭐⭐⭐⭐⭐      │ │
│ │ "Amazing coffee and welcoming space..."                │ │
│ │ January 15, 2025                        [Edit] [Delete]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏥 Pride Health Center                   ⭐⭐⭐⭐☆      │ │
│ │ "Great healthcare experience..."                       │ │
│ │ January 10, 2025                        [Edit] [Delete]│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Role-Based Navigation

### User Dashboard Flow
```
Login → User Home → Bottom Tabs → Portal Features
  │                     │              │
  │                     ├── Directory  ├── My Profile
  │                     ├── Saved      ├── Saved Places  
  │                     ├── Events     ├── My Reviews
  │                     └── Portal ────├── Accessibility
  │                                     ├── Identity
  │                                     └── Sign Out
  └── Authentication State Management
```

### Business Owner Flow
```
Login → Business Dashboard → Management Tools
  │            │                  │
  │            ├── Profile Edit   ├── Business Info
  │            ├── Directory      ├── Contact Details
  │            └── Analytics      └── Accessibility Features
  │
  └── Business Authentication & Data
```

### Admin Flow
```
Login → Admin Dashboard → Management Interface
  │           │                    │
  │           ├── Business Review  ├── Approve/Reject
  │           ├── User Management  ├── Account Control
  │           └── System Settings  └── Platform Config
  │
  └── Administrative Privileges
```

## 📊 Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Actions  │───▶│  State Manager  │───▶│  UI Components  │
│                 │    │                 │    │                 │
│ • Button Taps   │    │ • Auth State    │    │ • Screen Render │
│ • Form Inputs   │    │ • User Profile  │    │ • Data Display  │
│ • Navigation    │    │ • App State     │    │ • Interactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Data Services  │
                    │                 │
                    │ • mockAuthSvc   │
                    │ • businessSvc   │
                    │ • Async Storage │
                    └─────────────────┘
```

## 🎨 Design System

### Color Palette
```
Primary Blue:    #6366f1  (Headers, active states)
Purple Accent:   #8b5cf6  (Profile features)
Indigo:          #6366f1  (Bookmarks)
Amber:           #f59e0b  (Reviews/ratings)
Emerald:         #10b981  (Accessibility)
Pink:            #ec4899  (Identity/LGBTQ+)
Red:             #ef4444  (Sign out/delete)
Gray Scale:      #1f2937, #6b7280, #f8fafc
```

### Typography Scale
```
Header Title:    28px, Bold, #fff
Header Subtitle: 16px, Regular, #e0e7ff
Card Title:      16px, SemiBold, #1f2937
Card Subtitle:   13px, Regular, #6b7280
Account Title:   20px, SemiBold, #1f2937
Account Label:   14px, Medium, #6b7280
Account Value:   14px, SemiBold, #1f2937
```

### Component Spacing
```
Card Padding:    20px
Grid Gap:        16px
Icon Size:       28px (portal cards)
Icon Container:  64x64px, 32px border radius
Card Border:     16px border radius
Shadow:          0,2,0.1,8 (elevation: 4)
```

## 📱 Responsive Design

### Screen Breakpoints
- **Small Mobile**: < 375px width
- **Mobile**: 375px - 414px width  
- **Large Mobile**: > 414px width
- **Tablet**: > 768px width (future consideration)

### Layout Adaptations
- **Portal Cards**: 2 columns on mobile, flexible width
- **Text Scaling**: Responsive font sizes
- **Touch Targets**: Minimum 44px touch area
- **Safe Areas**: Proper SafeAreaView usage

---

**Last Updated**: July 26, 2025  
**Version**: Portal System v1.2.0
