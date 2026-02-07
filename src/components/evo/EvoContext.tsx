import React, { createContext, useContext, useState } from 'react';
import EvoModal from './EvoModal';

interface EvoContextType {
  isOpen: boolean;
  openEvo: () => void;
  closeEvo: () => void;
}

const EvoContext = createContext<EvoContextType | undefined>(undefined);

export const EvoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openEvo = () => setIsOpen(true);
  const closeEvo = () => setIsOpen(false);

  return (
    <EvoContext.Provider value={{ isOpen, openEvo, closeEvo }}>
      {children}
      <EvoModal isOpen={isOpen} onClose={closeEvo} />
    </EvoContext.Provider>
  );
};

export const useEvo = () => {
  const context = useContext(EvoContext);
  if (!context) {
    throw new Error('useEvo must be used within an EvoProvider');
  }
  return context;
};
