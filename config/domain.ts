/**
 * Domain Configuration for AccessLink LGBTQ+
 * https://accesslink.app/
 */

export const DOMAIN_CONFIG = {
  // Primary domain
  BASE_URL: 'https://accesslink.app',
  
  // API endpoints
  API_BASE_URL: 'https://api.accesslink.app',
  
  // Deep linking
  DEEP_LINK_SCHEME: 'accesslink',
  UNIVERSAL_LINK_DOMAIN: 'accesslink.app',
  
  // Social/sharing
  SOCIAL_TITLE: 'AccessLink LGBTQ+',
  SOCIAL_DESCRIPTION: 'Discover LGBTQ+ friendly businesses and build inclusive communities',
  
  // SEO/Meta
  META_KEYWORDS: 'LGBTQ+, accessibility, inclusive business, community, directory',
  
  // Contact/Support
  SUPPORT_EMAIL: 'support@accesslink.app',
  CONTACT_EMAIL: 'contact@accesslink.app',
  
  // Legal
  PRIVACY_POLICY_URL: 'https://accesslink.app/privacy',
  TERMS_OF_SERVICE_URL: 'https://accesslink.app/terms',
  
  // Analytics (placeholder for future use)
  GOOGLE_ANALYTICS_ID: '', // To be configured when ready
  
  // Feature flags
  FEATURES: {
    WEB_APP: true,
    MOBILE_APP: true,
    PWA_ENABLED: true,
    OFFLINE_SUPPORT: true,
  }
} as const;

export default DOMAIN_CONFIG;
