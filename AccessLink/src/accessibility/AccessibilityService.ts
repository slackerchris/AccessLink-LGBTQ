import { AccessibilityInfo, Platform } from 'react-native';

export class AccessibilityService {
  private static instance: AccessibilityService;
  private screenReaderEnabled = false;
  private reduceMotionEnabled = false;

  static initialize(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      throw new Error('AccessibilityService must be initialized first');
    }
    return AccessibilityService.instance;
  }

  constructor() {
    this.checkInitialSettings();
  }

  private async checkInitialSettings() {
    try {
      this.screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.warn('Error checking accessibility settings:', error);
    }
  }

  /**
   * Announces a message for screen readers
   */
  announce(message: string): void {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  /**
   * Focus on a specific element for accessibility
   */
  focusOn(reactTag: number): void {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }

  /**
   * Check if screen reader is currently enabled
   */
  isScreenReaderEnabled(): boolean {
    return this.screenReaderEnabled;
  }

  /**
   * Check if reduce motion is enabled
   */
  isReduceMotionEnabled(): boolean {
    return this.reduceMotionEnabled;
  }

  /**
   * Get accessibility props for buttons with proper labeling
   */
  getButtonProps(label: string, hint?: string) {
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: { disabled: false },
    };
  }

  /**
   * Get accessibility props for text input fields
   */
  getTextInputProps(label: string, value?: string, required?: boolean) {
    return {
      accessible: true,
      accessibilityRole: 'text' as const,
      accessibilityLabel: label,
      accessibilityValue: value ? { text: value } : undefined,
      accessibilityState: { disabled: false },
      accessibilityHint: required ? 'Required field' : undefined,
    };
  }

  /**
   * Get accessibility props for images
   */
  getImageProps(alt: string, decorative: boolean = false) {
    if (decorative) {
      return {
        accessible: false,
        accessibilityElementsHidden: true,
      };
    }
    
    return {
      accessible: true,
      accessibilityRole: 'image' as const,
      accessibilityLabel: alt,
    };
  }

  /**
   * Get accessibility props for links
   */
  getLinkProps(label: string, hint?: string) {
    return {
      accessible: true,
      accessibilityRole: 'link' as const,
      accessibilityLabel: label,
      accessibilityHint: hint || 'Opens in new screen',
    };
  }

  /**
   * Get accessibility props for headers
   */
  getHeaderProps(level: number, text: string) {
    return {
      accessible: true,
      accessibilityRole: 'header' as const,
      accessibilityLabel: text,
      accessibilityLevel: level,
    };
  }

  /**
   * Validate if touch target meets minimum size requirements (44x44 dp)
   */
  validateTouchTarget(width: number, height: number): boolean {
    const MINIMUM_SIZE = 44;
    return width >= MINIMUM_SIZE && height >= MINIMUM_SIZE;
  }

  /**
   * Get recommended touch target size
   */
  getMinimumTouchTarget(): { width: number; height: number } {
    return { width: 44, height: 44 };
  }

  /**
   * Generate accessibility announcement for navigation
   */
  announceNavigation(screenName: string): void {
    this.announce(`Navigated to ${screenName} screen`);
  }

  /**
   * Generate accessibility announcement for successful actions
   */
  announceSuccess(action: string): void {
    this.announce(`${action} completed successfully`);
  }

  /**
   * Generate accessibility announcement for errors
   */
  announceError(error: string): void {
    this.announce(`Error: ${error}`);
  }
}
