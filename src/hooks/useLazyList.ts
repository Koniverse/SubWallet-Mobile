import { useEffect, useState } from 'react';
import { FilterOptsType } from 'types/ui-types';

export function useLazyList<T>(
  items: T[],
  doFilterOptions: (items: T[], searchString: string, filterOpts: FilterOptsType) => T[],
) {
  const [filteredResult, setFilteredResult] = useState<T[]>(items);
  const [filterOpts, setFilterOpts] = useState<FilterOptsType>({});
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<T[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchString, setSearchString] = useState('');

  const sliceArray = (array: T[], curPageNumber: number) => {
    return array.slice(0, 15 * curPageNumber);
  };

  useEffect(() => {
    if (searchString) {
      setFilteredResult(doFilterOptions(items, searchString, filterOpts));
    } else {
      setFilteredResult(doFilterOptions(items, '', filterOpts));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFilterOptions, JSON.stringify(filterOpts), items, searchString]);

  useEffect(() => {
    const a = sliceArray(filteredResult, pageNumber);
    setLazyList(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filteredResult), pageNumber]);

  const onLoadMore = () => {
    if (lazyList.length === filteredResult.length) {
      return;
    }

    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setLoading(false);
      setPageNumber(currentPageNumber);
    }, 300);
  };

  const onSearchOption = (text: string) => {
    setPageNumber(1);
    setSearchString(text);
  };

  const onChangeFilterOptType = (currentValue: FilterOptsType) => {
    setFilterOpts(currentValue);
  };

  return {
    isLoading,
    filterOpts,
    lazyList,
    searchString,
    onSearchOption,
    onLoadMore,
    onChangeFilterOptType,
  };
}
