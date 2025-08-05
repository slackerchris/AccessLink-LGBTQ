import React, { ReactNode } from 'react';
import AuthProviderInternal from './useFirebaseAuth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthProviderInternal>{children}</AuthProviderInternal>;
};
