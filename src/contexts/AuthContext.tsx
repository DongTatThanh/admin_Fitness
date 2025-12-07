import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { adminAuthService, type AdminProfile } from '../services/admin-auth.service';

interface AuthContextType {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra token và load profile khi component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (adminAuthService.isAuthenticated()) {
          const savedAdmin = adminAuthService.getAdmin();
          if (savedAdmin) {
            setAdmin(savedAdmin);
          } else {
            // Nếu có token nhưng chưa có profile, fetch lại
            await refreshProfile();
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
        adminAuthService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await adminAuthService.login({ email, password });
    if (response.admin) {
      setAdmin(response.admin);
    } else {
      // Nếu response không có admin, fetch profile
      await refreshProfile();
    }
  };

  const logout = async () => {
    await adminAuthService.logout();
    setAdmin(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await adminAuthService.getMe();
      setAdmin(profile);
    } catch (error) {
      console.error('Refresh profile error:', error);
      adminAuthService.removeToken();
      setAdmin(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

