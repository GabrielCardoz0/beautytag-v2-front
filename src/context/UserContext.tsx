"use client"

import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface Metadata {
  genero: string;
  data_nascimento: string;
  cep: string;
  empresa: string;
}

interface Plano {
  id: number;
  documentId: string;
  is_pago: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cpf_cnpj: string;
  telefone: string;
  metadata: Metadata;
  name: string;
  role: Role;
  servicos: any[]; // Ajuste conforme necessário
  plano: Plano;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  loadUserFromLocalStorage: () => void;
  saveUserToLocalStorage: (user: User, token: string) => void;
  clearUserFromLocalStorage: () => void;
  getUserFromLocalStorage: () => User;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const currentPath = usePathname();

  const loadUserFromLocalStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const isPublicPage = typeof window !== 'undefined' && currentPath.startsWith('/public');

    if(storedToken){
      setToken(storedToken);
    }

    if(storedUser){
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));  
    } else if (!isPublicPage) {
      clearUserFromLocalStorage();
      router.push('/login');
    }
  };

  const saveUserToLocalStorage = (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setUser(user);
    setToken(token);
  };

  const clearUserFromLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const getUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    return parsedUser;
  }
  
  useEffect(() => loadUserFromLocalStorage(), [currentPath, router]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        loadUserFromLocalStorage,
        saveUserToLocalStorage,
        clearUserFromLocalStorage,
        getUserFromLocalStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};