import { useState, useEffect, useCallback, useRef } from 'react';

// TONAPI.io endpoint for live TON/USD rate
const TONAPI_RATES_URL = 'https://tonapi.io/v2/rates?tokens=ton&currencies=usd';

// Fallback rate if API fails
const FALLBACK_TON_USD_RATE = 1.6;

// Refresh interval in milliseconds (10 seconds)
const REFRESH_INTERVAL_MS = 10000;

// LocalStorage key for caching last known price
const CACHE_KEY = 'tonUsdPrice';

interface TonApiResponse {
  rates: {
    TON: {
      prices: {
        USD: number;
      };
    };
  };
}

// Get cached price from localStorage
const getCachedPrice = (): number => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { price, timestamp } = JSON.parse(cached);
      // Use cache if less than 1 minute old
      if (Date.now() - timestamp < 60000 && price > 0) {
        return price;
      }
    }
  } catch { }
  return FALLBACK_TON_USD_RATE;
};

// Save price to localStorage
const setCachedPrice = (price: number) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ price, timestamp: Date.now() }));
  } catch { }
};

/**
 * Hook to fetch live TON/USD exchange rate from TONAPI.io
 * Updates every 10 seconds automatically
 * Uses localStorage cache for faster initial load
 */
export function useTonPrice() {
  const [tonUsdPrice, setTonUsdPrice] = useState<number>(getCachedPrice);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchTonPrice = useCallback(async () => {
    // Debounce: skip if fetched less than 5 seconds ago
    if (Date.now() - lastFetchRef.current < 5000) return;
    lastFetchRef.current = Date.now();

    try {
      const response = await fetch(TONAPI_RATES_URL);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: TonApiResponse = await response.json();
      const price = data?.rates?.TON?.prices?.USD;

      if (typeof price === 'number' && price > 0) {
        setTonUsdPrice(price);
        setCachedPrice(price);
        setError(null);
      } else {
        throw new Error('Invalid price data');
      }
    } catch (err) {
      console.warn('Failed to fetch TON price:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep current price, don't reset to fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTonPrice();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchTonPrice, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchTonPrice]);

  // Memoized conversion function - stable reference
  const usdToTon = useCallback((usdAmount: number): number => {
    return Math.ceil(usdAmount / tonUsdPrice);
  }, [tonUsdPrice]);

  return {
    tonUsdPrice,
    loading,
    error,
    usdToTon,
  };
}

export default useTonPrice;
