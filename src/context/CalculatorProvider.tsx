
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CalculatorContextType {
  isCalculatorOpen: boolean;
  setCalculatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCalculator: () => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [isCalculatorOpen, setCalculatorOpen] = useState(false);

  const toggleCalculator = () => {
    setCalculatorOpen(prev => !prev);
  };

  return (
    <CalculatorContext.Provider value={{ isCalculatorOpen, setCalculatorOpen, toggleCalculator }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
