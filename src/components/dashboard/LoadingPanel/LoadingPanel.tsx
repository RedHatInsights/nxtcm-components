import { Spinner } from '@patternfly/react-core';
import { useEffect, useState } from 'react';

type LoadingPanelProps<T> = {
  callback: () => Promise<T>;
  children: (props: { data: T | null; error: Error | null }) => React.ReactNode;
};
export function LoadingPanel<T>({ callback, children }: LoadingPanelProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    callback()
      .then(setData)
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [callback]);

  if (isLoading) {
    return <Spinner size="lg" aria-label="Loading..." className="pf-v6-u-ma-md" />;
  }

  return children({ data, error });
}
