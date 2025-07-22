import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../../types/auth';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { 
    signOut: firebaseSignOut,
    sendEmailVerification,
    getCurrentUser
  } = useFirebaseAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            role: 'user',
            emailVerified: currentUser.emailVerified
          });
          setIsEmailVerified(currentUser.emailVerified);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError('Failed to check authentication state');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [getCurrentUser]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, you would use these credentials to sign in
      console.log('Sign in:', email, 'with password length:', password.length);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const { user: newUser } = await createUser(email, password);
      
      // Update the user's display name
      if (newUser) {
        await updateProfile(newUser, { displayName });
        
        // Send verification email
        await sendEmailVerification(newUser);
        
        // Update local state
        setUser({
          uid: newUser.uid,
          email: newUser.email || '',
          displayName,
          role: 'user',
          emailVerified: false
        });
        setIsEmailVerified(false);
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('Failed to create account. Please try again.');
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Use Firebase sign out when properly configured
      await firebaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      // TODO: Implement profile update
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    const currentUser = getCurrentUser();
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser);
      } catch (err) {
        console.error('Error sending verification email:', err);
        setError('Failed to send verification email');
      }
    }
  };

  const resendVerificationEmail = async () => {
    await sendVerificationEmail();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmailVerified,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    sendVerificationEmail,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
