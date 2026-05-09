import React, { createContext, useContext, ReactNode } from 'react';

interface ShieldedContextType {
  // TODO: add context properties
}

const ShieldedContext = createContext<ShieldedContextType | undefined>(undefined);

export function ShieldedProvider({ children }: { children: ReactNode }) {
  return (
    <ShieldedContext.Provider value={{}}>
      {children}
    </ShieldedContext.Provider>
  );
}

export const useShielded = () => {
  const context = useContext(ShieldedContext);
  if (context === undefined) {
    throw new Error('useShielded must be used within a ShieldedProvider');
  }
  return context;
};
