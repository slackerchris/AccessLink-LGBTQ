# AccessLink LGBTQ+ Website

A complete website for hosting on Google Cloud Platform.

## Files Structure

```
web/
├── index.html              # Main landing page
├── auth-callback.html      # OAuth callback handler
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── app.yaml              # Google App Engine configuration
└── README.md             # This file
```

## Deployment Options

### Option 1: Google Cloud Storage (Static Hosting)
```bash
# 1. Create a bucket
gsutil mb gs://accesslinklgbtq-app

# 2. Copy all files
gsutil -m cp -r web/* gs://accesslinklgbtq-app/

# 3. Make bucket public
gsutil iam ch allUsers:objectViewer gs://accesslinklgbtq-app

# 4. Set up website configuration
gsutil web set -m index.html -e 404.html gs://accesslinklgbtq-app

# 5. Set up custom domain (requires domain verification)
# Follow: https://cloud.google.com/storage/docs/hosting-static-website
```

### Option 2: Google App Engine (Recommended)
```bash
# 1. Deploy to App Engine
gcloud app deploy web/app.yaml

# 2. Set up custom domain
gcloud app domain-mappings create accesslinklgbtq.app
```

### Option 3: Firebase Hosting
```bash
# 1. Initialize Firebase in web directory
cd web && firebase init hosting

# 2. Deploy
firebase deploy --only hosting

# 3. Set up custom domain in Firebase Console
```

## Features

- **Professional Landing Page**: Complete business website
- **OAuth Callback Handler**: Handles Google OAuth redirects
- **Mobile Responsive**: Works on all devices
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards
- **Accessible**: WCAG compliant design
- **Fast Loading**: Optimized CSS and minimal JavaScript

## Domain Configuration

Configure these redirect URIs in Google Cloud Console:
- `https://accesslinklgbtq.app/auth/callback`
- `https://www.accesslinklgbtq.app/auth/callback`

## Customization

The website uses your brand colors and messaging. Key sections:
- Hero section with app download CTAs
- Feature showcase
- App download section
- Contact information
- Footer with resources

All content is customizable for your business needs.
