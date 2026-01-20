import React, { createContext, useContext, useState } from 'react';

const TradeContext = createContext();

export const useTrade = () => useContext(TradeContext);

export const TradeProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <TradeContext.Provider value={{ isModalOpen, setIsModalOpen }}>
      {children}
    </TradeContext.Provider>
  );
};