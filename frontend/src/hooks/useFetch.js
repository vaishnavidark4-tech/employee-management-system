import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Small helper hook to load data from the API with loading / error states.
 * fetchFn must be wrapped in useCallback by the caller, the data is loaded again when it changes.
 *
 * const { data, loading, error, reload } = useFetch(useCallback(() => getTaskById(id), [id]));
 */
const useFetch = (fetchFn) => {
  const [reloadCount, setReloadCount] = useState(0);
  // doneFor = the request this result belongs to
  const [result, setResult] = useState({ data: null, error: null, doneFor: null });

  // a new object every time we need to fetch (new fetchFn or reload clicked)
  const request = useMemo(() => ({ fetchFn, reloadCount }), [fetchFn, reloadCount]);

  useEffect(() => {
    let ignore = false; // ignore old responses if the user changes the filters quickly

    request
      .fetchFn()
      .then((data) => {
        if (!ignore) setResult({ data, error: null, doneFor: request });
      })
      .catch((error) => {
        if (!ignore) setResult((prev) => ({ data: prev.data, error, doneFor: request }));
      });

    return () => {
      ignore = true;
    };
  }, [request]);

  // still loading while the latest result is not for the current request
  const loading = result.doneFor !== request;

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // lets a page update the data directly (e.g. after changing the task status)
  const setData = useCallback((newData) => setResult((prev) => ({ ...prev, data: newData })), []);

  return { data: result.data, setData, loading, error: loading ? null : result.error, reload };
};

export default useFetch;
