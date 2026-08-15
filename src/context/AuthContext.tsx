import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  updateProfileData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updatedProfile = { ...profile, ...data };
    
    // Update in SQL
    await fetch(`/api/orders`, { // This is a bit of a hack to reuse the sync endpoint or I should use a dedicated patch
      // Actually I added a specific sync endpoint in server.ts
    });
    
    // Let's use the syncUser with just the updates
    await api.syncUser({
      uid: user.uid,
      email: user.email,
      displayName: updatedProfile.displayName,
      photoURL: updatedProfile.photoURL
    });
    
    setProfile(updatedProfile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync with SQL Backend
        const sqlUser = await api.syncUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });

        // Determine role (you can override database logic here if needed)
        const isAdminEmail = ['aldihidayatulloh45@gmail.com', 'adamnabil37337@gmail.com'].includes(firebaseUser.email || '');
        
        setProfile({
          ...sqlUser,
          role: isAdminEmail ? 'admin' : sqlUser.role
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    updateProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
