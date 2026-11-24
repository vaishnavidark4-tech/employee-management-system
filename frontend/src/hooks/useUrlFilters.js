import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Keeps search, filters, sorting and page number in the URL query string.
 * Example: /tasks?status=In%20Progress&priority=High&page=2
 * So refreshing the page or opening a copied URL shows the same view.
 *
 * @param {object} defaults default value for every filter key, e.g. { search: '', page: '1' }
 *                 (define it outside the component so it does not change on every render)
 */
const useUrlFilters = (defaults) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // current filter values = URL value or the default
  const filters = useMemo(() => {
    const values = {};
    Object.keys(defaults).forEach((key) => {
      values[key] = searchParams.get(key) ?? defaults[key];
    });
    return values;
  }, [searchParams, defaults]);

  // Update one or more filters. Any change other than the page number takes the user back to page 1.
  const updateFilters = useCallback(
    (changes) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          // keep the URL short: don't store empty or default values
          if (value === '' || value === null || value === undefined || String(value) === String(defaults[key])) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });
        const onlyPaging = Object.keys(changes).every((key) => key === 'page');
        if (!onlyPaging) next.delete('page');
        return next;
      });
    },
    [setSearchParams, defaults]
  );

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  // params to send to the API (empty values removed)
  const apiParams = useMemo(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params[key] = value;
    });
    return params;
  }, [filters]);

  const hasActiveFilters = Object.keys(defaults).some(
    (key) => !['page', 'limit', 'sortBy', 'order'].includes(key) && filters[key] !== defaults[key]
  );

  return { filters, apiParams, updateFilters, clearFilters, hasActiveFilters };
};

export default useUrlFilters;
