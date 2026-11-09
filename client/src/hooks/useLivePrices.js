import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Singleton Socket.io hook — connects once, shared across the app.
 * Returns { prices, newsEvents, connected }
 */
const useLivePrices = () => {
  const [prices, setPrices] = useState({});       // { stockId: { currentPrice, priceChange, percentageChange } }
  const [newsEvents, setNewsEvents] = useState([]); // [{ headline, symbol, impact }]
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      });
    }

    const socket = socketInstance;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onPriceUpdate = (data) => {
      setPrices(prev => ({
        ...prev,
        [data._id]: {
          currentPrice: data.currentPrice,
          priceChange: data.priceChange,
          percentageChange: data.percentageChange,
          previousPrice: data.previousPrice,
          symbol: data.symbol
        }
      }));
    };

    const onNewsEvent = (data) => {
      setNewsEvents(prev => [data, ...prev].slice(0, 10));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('priceUpdate', onPriceUpdate);
    socket.on('newsEvent', onNewsEvent);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('priceUpdate', onPriceUpdate);
      socket.off('newsEvent', onNewsEvent);
    };
  }, []);

  return { prices, newsEvents, connected };
};

export default useLivePrices;
