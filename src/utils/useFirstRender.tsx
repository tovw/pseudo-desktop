import { useEffect, useState } from 'react';

export const useFirstRender = () => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    setTimeout(() => setIsFirstRender(false), 0);
  }, []);
  return isFirstRender;
};
