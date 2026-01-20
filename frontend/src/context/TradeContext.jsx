import React, { createContext, useContext, useState } from 'react';

const TradeContext = createContext();

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};

// Alias for compatibility with components using singular naming
export const useTrade = useTrades;

export const TradeProvider = ({ children }) => {
  const [trades, setTrades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeParams, setTradeParams] = useState(null);

  const openTradeModal = (params) => {
    setTradeParams(params);
    setIsModalOpen(true);
  };

  const closeTradeModal = () => {
    setIsModalOpen(false);
    setTradeParams(null);
  };

  return (
    <TradeContext.Provider value={{ trades, setTrades, isModalOpen, openTradeModal, closeTradeModal, tradeParams }}>
      {children}
    </TradeContext.Provider>
  );
};

export default TradeContext;