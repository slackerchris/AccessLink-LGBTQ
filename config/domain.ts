/**
 * Domain Configuration for AccessLink LGBTQ+
 * https://accesslinklgbtq.app/
 */

export const DOMAIN_CONFIG = {
  // Primary domain
  BASE_URL: 'https://accesslinklgbtq.app',
  
  // API endpoints
  API_BASE_URL: 'https://api.accesslinklgbtq.app',
  
  // Deep linking
  DEEP_LINK_SCHEME: 'accesslink',
  UNIVERSAL_LINK_DOMAIN: 'accesslinklgbtq.app',
  
  // OAuth Configuration
  OAUTH_REDIRECT_URIS: {
    PRODUCTION: 'https://accesslinklgbtq.app/auth/callback',
    WWW_PRODUCTION: 'https://www.accesslinklgbtq.app/auth/callback',
    STAGING: 'https://accesslink-website-595597079040.us-east4.run.app/auth/callback', // Current deployed URL
    DEVELOPMENT: 'https://auth.expo.io/@chriseckman/accesslink-lgbtq', // For development only
  },
  
  // Social/sharing
  SOCIAL_TITLE: 'AccessLink LGBTQ+',
  SOCIAL_DESCRIPTION: 'Discover LGBTQ+ friendly businesses and build inclusive communities',
  
  // SEO/Meta
  META_KEYWORDS: 'LGBTQ+, accessibility, inclusive business, community, directory',
  
  // Contact/Support
  SUPPORT_EMAIL: 'support@accesslinklgbtq.app',
  CONTACT_EMAIL: 'contact@accesslinklgbtq.app',
  
  // Legal
  PRIVACY_POLICY_URL: 'https://accesslinklgbtq.app/privacy',
  TERMS_OF_SERVICE_URL: 'https://accesslinklgbtq.app/terms',
  
  // Analytics (placeholder for future use)
  GOOGLE_ANALYTICS_ID: '', // To be configured when ready
  
  // Feature flags
  FEATURES: {
    WEB_APP: true,
    MOBILE_APP: true,
    PWA_ENABLED: true,
    OFFLINE_SUPPORT: true,
  }
};

export default DOMAIN_CONFIG;
