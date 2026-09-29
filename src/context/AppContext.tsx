/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  [key: string]: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  // Hash-based navigation synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setCurrentPage(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const value: AppContextType = {
    currentPage,
    setCurrentPage: (page: string) => {
      setCurrentPage(page);
      window.location.hash = page;
    },
    isAuthenticated,
    setIsAuthenticated,
    selectedProductId,
    setSelectedProductId,
    cart,
    setCart
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    // Fallback safe context if used outside provider
    return {
      currentPage: 'home',
      setCurrentPage: (page: string) => {
        window.location.hash = page;
      },
      isAuthenticated: false,
      setIsAuthenticated: () => {},
      selectedProductId: null,
      setSelectedProductId: () => {},
      cart: [],
      setCart: () => {}
    };
  }
  return context;
};

export default AppContext;
