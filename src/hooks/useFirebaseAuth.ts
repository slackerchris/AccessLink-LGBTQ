import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';

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

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    const userCredential = await firebaseSignIn(auth, email, password);
    return userCredential;
  };

  const createUser = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const sendEmailVerification = async (user: User) => {
    await firebaseSendEmailVerification(user);
  };

  const updateProfile = async (user: User, updates: { displayName?: string; photoURL?: string }) => {
    await firebaseUpdateProfile(user, updates);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const getCurrentUser = () => auth.currentUser;

  return { 
    user, 
    isLoading, 
    signInWithEmailAndPassword, 
    createUser,
    sendEmailVerification,
    updateProfile,
    signOut,
    getCurrentUser
  };
};
