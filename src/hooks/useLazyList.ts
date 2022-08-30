import { useCallback, useEffect, useState } from 'react';

export function useLazyList<T>(items: T[], options = { itemPerPage: 20, lazyTime: 300 }) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<T[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const sliceArray = (array: T[], curPageNumber: number) => {
    return array.slice(0, options.itemPerPage * curPageNumber);
  };

  useEffect(() => {
    const currentLazyList = sliceArray(items, pageNumber);
    setLazyList(currentLazyList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items), pageNumber]);

  const onLoadMore = useCallback(() => {
    if (lazyList.length === items.length) {
      return;
    }

    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setLoading(false);
      setPageNumber(currentPageNumber);
    }, options.lazyTime);
  }, [items.length, lazyList.length, options.lazyTime, pageNumber]);

  return {
    isLoading,
    lazyList,
    onLoadMore,
    setPageNumber,
  };
}
