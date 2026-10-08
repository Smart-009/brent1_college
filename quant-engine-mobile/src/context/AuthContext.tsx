import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, ServerPingResult } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSandbox: boolean;
  serverUrl: string;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginSandbox: (name?: string, email?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateServerUrl: (url: string) => void;
  testServer: (url?: string) => Promise<ServerPingResult>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSandbox, setIsSandbox] = useState<boolean>(api.isSandbox());
  const [serverUrl, setServerUrl] = useState<string>(api.getBaseUrl());

  const refreshUser = async () => {
    try {
      if (api.isSandbox()) {
        const sandboxUser = api.getSandboxUser();
        if (sandboxUser) {
          setUser(sandboxUser);
          setIsSandbox(true);
        } else {
          setUser(null);
          setIsSandbox(false);
        }
      } else if (api.getToken()) {
        const me = await api.getMe();
        setUser(me);
        setIsSandbox(false);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setIsSandbox(api.isSandbox());
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    setIsSandbox(api.isSandbox());
  };

  const loginSandbox = (name?: string, email?: string) => {
    const { user } = api.enableSandbox({ name, email });
    setUser(user);
    setIsSandbox(true);
  };

  const logout = () => {
    api.setToken(null);
    api.setSandboxMode(false);
    localStorage.removeItem('volt_sandbox_user');
    setUser(null);
    setIsSandbox(false);
  };

  const updateServerUrl = (url: string) => {
    api.setBaseUrl(url);
    setServerUrl(api.getBaseUrl());
  };

  const testServer = async (url?: string) => {
    return api.checkHealth(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSandbox,
        serverUrl,
        login,
        register,
        loginSandbox,
        logout,
        refreshUser,
        updateServerUrl,
        testServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
