import { useState, useEffect } from 'react';

interface UsePageLoadingReturn {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const usePageLoading = (initialLoading: boolean = false): UsePageLoadingReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);

  const setLoading = (loading: boolean): void => {
    setIsLoading(loading);
  };

  useEffect(() => {
    // Auto-hide loading after a short delay if not manually controlled
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return {
    isLoading,
    setLoading
  };
};

export default usePageLoading;
