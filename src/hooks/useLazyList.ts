import { useEffect, useState } from 'react';

export function useLazyList<T>(items: T[], doFilterOptions: (items: T[], searchString: string) => T[]) {
  const [filteredOptions, setFilteredOption] = useState<T[]>(items);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<T[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchString, setSearchString] = useState('');

  const sliceArray = (array: T[], curPageNumber: number) => {
    return array.slice(0, 15 * curPageNumber);
  };

  useEffect(() => {
    if (searchString) {
      setFilteredOption(doFilterOptions(items, searchString));
    } else {
      setFilteredOption(items);
    }
  }, [doFilterOptions, items, searchString]);

  useEffect(() => {
    const a = sliceArray(filteredOptions, pageNumber);
    setLazyList(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filteredOptions), pageNumber]);

  const onLoadMore = () => {
    if (lazyList.length === filteredOptions.length) {
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

  return {
    isLoading,
    lazyList,
    searchString,
    onSearchOption,
    onLoadMore,
  };
}
