export interface LoadingConfig {
  // Global app loading (initial load)
  appLoadingDuration: number;
  
  // Page transition loading
  pageTransitionDuration: number;
  
  // Whether to show loading on page transitions
  enablePageTransitionLoading: boolean;
  
  // Whether to skip loading on initial page load
  skipInitialPageLoad: boolean;
  
  // Minimum loading time to prevent flashing
  minimumLoadingTime: number;
}

export const defaultLoadingConfig: LoadingConfig = {
  appLoadingDuration: 1000,
  pageTransitionDuration: 500,
  enablePageTransitionLoading: false,
  skipInitialPageLoad: true,
  minimumLoadingTime: 200
};

// You can override these settings by importing and modifying this config
export const loadingConfig: LoadingConfig = {
  ...defaultLoadingConfig
};

export default loadingConfig;
