import { useState, useEffect } from 'react';

const useQueryState = (initialState = {}) => {
  const [queryState, setQueryState] = useState(initialState);

  useEffect(() => {
    const handleQueryChange = () => {
      const params = new URLSearchParams(window.location.search);
      const newState = {};
      params.forEach((value, key) => {
        newState[key] = value;
      });
      setQueryState(newState);
    };

    window.addEventListener('popstate', handleQueryChange);
    handleQueryChange(); // Initialize state on mount

    return () => {
      window.removeEventListener('popstate', handleQueryChange);
    };
  }, []);

  const updateQueryState = (newState) => {
    const params = new URLSearchParams(window.location.search);
    Object.keys(newState).forEach((key) => {
      if (newState[key] === undefined) {
        params.delete(key);
      } else {
        params.set(key, newState[key]);
      }
    });
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    setQueryState(newState);
  };

  return [queryState, updateQueryState];
};

export default useQueryState;