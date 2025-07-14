import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from './AuthModal';

interface AuthContextType {
  showAuthModal: () => void;
  hideAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthModal() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const showAuthModal = () => setIsAuthModalOpen(true);
  const hideAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ showAuthModal, hideAuthModal, isAuthModalOpen }}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={hideAuthModal} />
    </AuthContext.Provider>
  );
}