import { useLayoutEffect, useState, useCallback } from 'react';
import { Dimensions } from './types';

const getDimensions = (node: HTMLElement) => {
  const { width, height } = node.getBoundingClientRect();
  return { width, height };
};

export const useDimensions = (callback?: (dimensions: Dimensions) => void) => {
  const [dimensions, setDimensions] = useState<Dimensions | undefined>();
  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = useCallback(setNode, []);

  useLayoutEffect(() => {
    const updater = () => {
      if (node) {
        const dim = getDimensions(node);
        setDimensions(dim);

        if (callback && dim) {
          callback(dim);
        }
      }
    };

    if (!dimensions) updater();

    window.addEventListener('resize', updater);
    return () => window.removeEventListener('resize', updater);
  }, [node, callback]);

  return { ref, dimensions };
};
