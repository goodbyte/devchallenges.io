import { useState, useEffect } from 'react';

function useFetch<T>(url: string, timeout = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (url) {
      const abortCtrl = new AbortController();
      const { signal } = abortCtrl;

      const timeoutID = setTimeout(() => {
        cleanFn();
        setError(new Error('Timeout'));
      }, timeout);

      const cleanFn = () => {
        abortCtrl.abort();
        clearTimeout(timeoutID);
        setLoading(false);
      };
      
      setLoading(true);

      fetch(url, { signal })
        .then((req) => req.json())
        .then(setData)
        .catch((err) => {
          if (signal.aborted) return;
          console.error(err);
          setError(err);
        })
        .finally(() => {
          clearTimeout(timeoutID);
          setLoading(false)
        });

      return cleanFn;
    }
  }, [url]);

  return { error, data, isLoading };
}

export default useFetch;