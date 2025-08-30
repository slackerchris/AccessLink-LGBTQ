/**
 * Performance Optimization Utilities
 * Tools to reduce navigation lag and improve app responsiveness
 */

import React from 'react';
import { Platform } from 'react-native';

/**
 * Lightweight React.memo with shallow comparison for better performance
 */
export const optimizedMemo = <T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: any, nextProps: any) => boolean
) => {
  return React.memo(Component, propsAreEqual || shallowCompare);
};

/**
 * Shallow comparison for props to prevent unnecessary re-renders
 */
export const shallowCompare = (prevProps: any, nextProps: any): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (let key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Debounced function wrapper to prevent rapid-fire calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttled function wrapper for performance-critical operations
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Optimized FlatList props for better performance
 */
export const getOptimizedFlatListProps = (itemHeight?: number) => ({
  removeClippedSubviews: Platform.OS === 'android',
  initialNumToRender: 10,
  maxToRenderPerBatch: 5,
  updateCellsBatchingPeriod: 50,
  windowSize: 10,
  getItemLayout: itemHeight ? (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }) : undefined,
});

/**
 * Memory cleanup helper for useEffect hooks
 */
export const createCleanupTracker = () => {
  const cleanupFunctions: Array<() => void> = [];
  
  const addCleanup = (cleanupFn: () => void) => {
    cleanupFunctions.push(cleanupFn);
  };
  
  const cleanup = () => {
    cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function error:', error);
      }
    });
    cleanupFunctions.length = 0;
  };
  
  return { addCleanup, cleanup };
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  startTimer: (label: string) => {
    const start = Date.now();
    return {
      end: () => {
        const duration = Date.now() - start;
        console.log(`⏱️ ${label}: ${duration}ms`);
        return duration;
      }
    };
  },
  
  measureRender: <T extends React.ComponentType<any>>(
    Component: T,
    componentName: string
  ): T => {
    return React.forwardRef((props: any, ref: any) => {
      const timer = performanceMonitor.startTimer(`${componentName} render`);
      
      React.useEffect(() => {
        timer.end();
      });
      
      return React.createElement(Component, { ...props, ref });
    }) as any;
  }
};

/**
 * Intersection Observer for lazy loading (web platforms)
 */
export const createIntersectionObserver = (callback: (entries: any[]) => void) => {
  if (Platform.OS === 'web' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1
    });
  }
  return null;
};

/**
 * Optimized state updater that batches updates
 */
export const createBatchedStateUpdater = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  batchTime: number = 16 // One frame at 60fps
) => {
  let pendingUpdate: Partial<T> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (update: Partial<T>) => {
    pendingUpdate = { ...pendingUpdate, ...update };
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (pendingUpdate) {
        setState(current => ({ ...current, ...pendingUpdate }));
        pendingUpdate = null;
      }
    }, batchTime);
  };
};

export default {
  optimizedMemo,
  shallowCompare,
  debounce,
  throttle,
  getOptimizedFlatListProps,
  createCleanupTracker,
  performanceMonitor,
  createIntersectionObserver,
  createBatchedStateUpdater
};
