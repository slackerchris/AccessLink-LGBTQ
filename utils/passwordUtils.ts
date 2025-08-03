/**
 * Password Utility
 * Simple password hashing and validation for web platform
 */

/**
 * Simple password hashing using Web Crypto API
 * In production, you'd want to use a more robust solution like bcrypt
 */
export class PasswordUtils {
  /**
   * Hash a password using SHA-256 with salt
   */
  static async hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Combine password and salt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Hash the password
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return salt + hash
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    return saltHex + ':' + hashHex;
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [saltHex, expectedHash] = hash.split(':');
      if (!saltHex || !expectedHash) {
        return false;
      }

      // Convert salt back to bytes
      const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Hash the provided password with the same salt
      const encoder = new TextEncoder();
      const data = encoder.encode(password + Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''));
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return computedHash === expectedHash;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Generate a default password hash for demo purposes
   */
  static async getDefaultPasswordHash(): Promise<string> {
    return await this.hashPassword('password123');
  }
}
