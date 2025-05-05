'use client';

import React, { createContext, useContext, useState } from 'react';

type AlertType = 'success' | 'error' | null;

interface AlertContextType {
  message: string | null;
  type: AlertType;
  showAlert: (type: AlertType, message: string) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<AlertType>(null);

  const showAlert = (type: AlertType, message: string) => {
    setType(type);
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
      setType(null);
    }, 3000); // hide after 3 seconds
  };

  const hideAlert = () => {
    setMessage(null);
    setType(null);
  };

  return (
    <AlertContext.Provider value={{ message, type, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider');
  return context;
};
