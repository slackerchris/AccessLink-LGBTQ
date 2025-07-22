# AccessLink LGBTQ+ Website

A modern, accessible website showcasing the AccessLink LGBTQ+ mobile app - connecting disabled LGBTQ+ individuals with inclusive, accessible businesses and community events.

## 🌈 About

This website serves as the web presence for the AccessLink LGBTQ+ mobile application, providing information about the app's features, accessibility commitments, and download links. Built with accessibility-first principles and WCAG 2.2 AA compliance.

## ✨ Features

- **Accessibility-First Design**: WCAG 2.2 AA compliant with comprehensive screen reader support
- **Responsive Layout**: Mobile-first design that works on all devices
- **High Contrast Mode**: Built-in high contrast toggle for better visibility
- **Font Size Controls**: User-controlled text scaling (75% - 150%)
- **Reduced Motion Support**: Respects user motion preferences
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 🛠️ Technical Stack

- **HTML5**: Semantic markup with proper ARIA labels
- **CSS3**: Modern CSS with custom properties and responsive design
- **Vanilla JavaScript**: Lightweight, accessible interactions
- **No Dependencies**: Fast loading with no external frameworks

## 📁 Project Structure

```
website/
├── index.html              # Main landing page
├── css/
│   └── styles.css          # Main stylesheet with design system
├── js/
│   └── scripts.js          # Accessibility-focused JavaScript
├── assets/
│   ├── logo.svg            # Main logo
│   ├── favicon.svg         # Website favicon
│   └── README.md           # Asset documentation
└── README.md               # This file
```

## 🎨 Design System

### Colors
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #EC4899 (Pink)
- **Accent**: #10B981 (Emerald)
- **Pride Colors**: Full rainbow spectrum

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale from 0.75rem to 3rem
- **Weights**: 300, 400, 500, 600, 700

### Accessibility Features
- Minimum 4.5:1 contrast ratio (WCAG AA)
- Focus indicators on all interactive elements
- Screen reader optimized content
- Voice control compatible
- High contrast mode support

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/slackerchris/handipride.git
   cd handipride/website
   ```

2. **Serve locally**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`

### Deployment

The website is designed to work with any static hosting service:

- **GitHub Pages**: ✅ Automated deployment configured via GitHub Actions
- **Netlify**: Connect repository for automatic deployment
- **Vercel**: Import project for instant deployment
- **Domain**: Configured for accesslinklgbtq.app

#### GitHub Pages Deployment

This repository includes automated GitHub Pages deployment:

1. **Automatic**: Deploys on every push to `main` branch
2. **Custom Domain**: Pre-configured for accesslinklgbtq.app
3. **SEO Ready**: Includes sitemap.xml and robots.txt
4. **404 Handling**: Proper error page setup

To enable GitHub Pages:
1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as the source
4. The workflow will automatically deploy your site

The site will be available at:
- **Temporary**: https://slackerchris.github.io/handipride
- **Custom Domain**: https://accesslinklgbtq.app (after DNS setup)

#### DNS Configuration for Custom Domain

To point `accesslinklgbtq.app` to GitHub Pages, add these DNS records at your domain registrar:

**A Records (for apex domain):**
```
Type: A    Name: @    Value: 185.199.108.153
Type: A    Name: @    Value: 185.199.109.153
Type: A    Name: @    Value: 185.199.110.153
Type: A    Name: @    Value: 185.199.111.153
```

**CNAME Record (for www subdomain):**
```
Type: CNAME    Name: www    Value: slackerchris.github.io
```

**GitHub's Name Servers (if using GitHub DNS):**
```
ns-1.github.com
ns-2.github.com
ns-3.github.com
ns-4.github.com
```

**Note**: Most domain registrars allow you to just add the A and CNAME records without changing name servers. Only change NS records if you want GitHub to fully manage your domain's DNS.

## ♿ Accessibility Features

### Built-in Controls
- **High Contrast Toggle**: Enhances visual contrast
- **Font Size Controls**: A-, A, A+ buttons
- **Keyboard Navigation**: Tab/Shift+Tab through all elements
- **Skip Links**: Quick navigation to main sections

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels and descriptions
- Live region announcements
- Alternative text for images

### Testing
Tested with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)
- Keyboard-only navigation
- Various zoom levels (up to 200%)

## 📱 Mobile App Integration

This website promotes the AccessLink LGBTQ+ mobile app:

- **App Features**: Detailed feature descriptions
- **Screenshots**: App preview mockups
- **Download Links**: App Store and Google Play badges
- **Accessibility Info**: App's accessibility features

## 🤝 Contributing

We welcome contributions from the community! Please:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/improvement`
3. **Test accessibility**: Use screen readers and keyboard navigation
4. **Submit a pull request**: Include accessibility testing notes

### Accessibility Guidelines
- Maintain WCAG 2.2 AA compliance
- Test with screen readers
- Ensure keyboard navigation works
- Verify color contrast ratios
- Test with users who have disabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🌐 Live Website

Visit the live website: [https://accesslinklgbtq.app](https://accesslinklgbtq.app)

## 📞 Contact

- **Project**: AccessLink LGBTQ+
- **Repository**: [GitHub](https://github.com/slackerchris/handipride)
- **Issues**: [GitHub Issues](https://github.com/slackerchris/handipride/issues)

## 🏳️‍🌈 Mission

Built by and for the disabled LGBTQ+ community. We believe accessibility and inclusivity should never be an afterthought. This website and the mobile app it represents are committed to creating spaces where everyone belongs, exactly as they are.

---

*"Nothing about us, without us." - Built with ❤️ for the disabled LGBTQ+ community.*
