
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, doc, onSnapshot } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface UserContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData({ isApproved: false, role: 'user' });
        }
        setLoading(false);
      }, (error) => {
        console.error("UserContext Firestore error:", error);
        setLoading(false);
      });

      return () => unsubscribeDoc();
    }
  }, [user]);

  const isAdmin = userData?.role === 'admin' || user?.email === 'aahdan298@gmail.com';
  const isApproved = userData?.isApproved === true || isAdmin;

  return (
    <UserContext.Provider value={{ user, userData, loading, isAdmin, isApproved }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
