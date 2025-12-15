/**
 * useDebounce Hook
 *
 * Debounces a value by delaying updates until after a specified period of inactivity.
 * Useful for search inputs to avoid excessive API calls.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // Only fires 300ms after user stops typing
 *   if (debouncedSearch) {
 *     searchPlayers(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value by a specified delay
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 *
 * @param callback - The callback to debounce
 * @param delay - Delay in milliseconds
 * @returns A debounced version of the callback
 *
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   searchPlayers(term);
 * }, 300);
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): T {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }) as T;

  return debouncedCallback;
}

export default useDebounce;
