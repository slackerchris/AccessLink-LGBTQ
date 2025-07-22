import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmailAndPassword = async (email: string, pass: string) => {
    // This is a mock implementation
    console.log(email, pass);
    return { user: { email } };
  };

  const signOut = async () => {
    // This is a mock implementation
    setUser(null);
  };

  return { user, isLoading, signInWithEmailAndPassword, signOut };
};
