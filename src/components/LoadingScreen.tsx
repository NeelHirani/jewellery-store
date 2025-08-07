import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGem, FaDiamond } from 'react-icons/fa6';
import { GiDiamondRing, GiCrystalGrowth } from 'react-icons/gi';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentMessage, setCurrentMessage] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(true);

  const loadingMessages: string[] = [
    "Crafting Excellence...",
    "Curating Luxury...",
    "Polishing Perfection...",
    "Welcome to Jewel Mart"
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Message rotation
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev: number) => (prev + 1) % loadingMessages.length);
    }, 800);

    // Complete loading after 3 seconds
    const loadingTimer = setTimeout(() => {
      setShowContent(false);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 800); // Wait for fade out animation
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(loadingTimer);
    };
  }, [onLoadingComplete]);

  // Sparkle particles animation
  interface SparkleParticleProps {
    delay?: number;
    size?: 'small' | 'large';
  }

  const SparkleParticle: React.FC<SparkleParticleProps> = ({ delay = 0, size = 'small' }) => (
    <motion.div
      className={`absolute ${size === 'small' ? 'w-1 h-1' : 'w-2 h-2'} bg-gradient-to-r from-pink-300 to-rose-400 rounded-full`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1
      }}
    />
  );

  // Floating gems animation
  const FloatingGem = ({ icon: Icon, className, delay = 0 }) => (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
        y: [-10, 10, -10],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon className="text-2xl md:text-3xl text-pink-300/60" />
    </motion.div>
  );

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-pink-200 to-rose-300 flex items-center justify-center overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-pink-300 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-rose-300 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-1/4 left-1/3 w-40 h-40 border border-pink-400 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/3 right-1/3 w-28 h-28 border border-rose-400 rounded-full animate-pulse delay-700"></div>
          </div>

          {/* Floating Gems */}
          <FloatingGem icon={FaGem} className="top-20 left-20" delay={0} />
          <FloatingGem icon={FaDiamond} className="top-32 right-24" delay={0.5} />
          <FloatingGem icon={GiDiamondRing} className="bottom-24 left-32" delay={1} />
          <FloatingGem icon={GiCrystalGrowth} className="bottom-32 right-20" delay={1.5} />

          {/* Sparkle Particles */}
          <SparkleParticle delay={0} size="small" />
          <SparkleParticle delay={0.3} size="large" />
          <SparkleParticle delay={0.6} size="small" />
          <SparkleParticle delay={0.9} size="large" />
          <SparkleParticle delay={1.2} size="small" />

          {/* Main Content */}
          <div className="relative z-10 text-center px-6 max-w-md mx-auto">
            {/* Logo/Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              {/* Animated Diamond Icon */}
              <motion.div
                className="relative mx-auto w-20 h-20 mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-rose-300 to-pink-500 rounded-full opacity-25 animate-pulse"></div>
                <motion.div
                  className="absolute inset-2 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaGem className="text-2xl text-white" />
                </motion.div>
              </motion.div>

              {/* Brand Name */}
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-700 to-rose-700 bg-clip-text text-transparent mb-2"
                style={{ fontFamily: 'serif' }}
              >
                Jewel Mart
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="text-rose-700/80 text-sm md:text-base font-light tracking-wider"
              >
                Luxury • Elegance • Perfection
              </motion.p>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mb-6"
            >
              {/* Elegant Spinner */}
              <div className="relative mx-auto w-16 h-16 mb-6">
                <motion.div
                  className="absolute inset-0 border-2 border-pink-300/40 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-1 border-2 border-transparent border-t-pink-500 border-r-pink-500 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-3 border border-transparent border-t-rose-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Loading Message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-rose-700 text-lg font-medium mb-4"
                >
                  {loadingMessages[currentMessage]}
                </motion.p>
              </AnimatePresence>

              {/* Loading Dots */}
              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2].map((i: any) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-pink-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="mb-4"
            >
              <div className="w-full max-w-xs mx-auto">
                <div className="flex justify-between text-xs text-rose-600 mb-2">
                  <span>Loading</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-pink-200/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="text-rose-600/70 text-xs tracking-widest uppercase"
            >
              Where Dreams Meet Reality
            </motion.p>
          </div>

          {/* Corner Decorations */}
          <motion.div
            className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-pink-400/60"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.div
            className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-pink-400/60"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-pink-400/60"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-pink-400/60"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
