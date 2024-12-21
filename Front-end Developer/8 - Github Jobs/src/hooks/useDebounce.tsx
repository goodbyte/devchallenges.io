import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay = 250) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeoutID = setTimeout(() => setDebounceValue(value), delay);
    return () => clearTimeout(timeoutID);
  }, [value, delay]);

  return debounceValue;
}

export default useDebounce;