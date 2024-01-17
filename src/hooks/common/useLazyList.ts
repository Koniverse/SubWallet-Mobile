import { useCallback, useEffect, useState } from 'react';

export interface useLazyListOptions<T> {
  itemPerPage?: number;
  lazyTime?: number;
  onAfterSetLazyList?: (items: T[]) => void;
}

export function useLazyList<T>(items: T[], options: useLazyListOptions<T> = {}) {
  const { itemPerPage = 12, lazyTime = 300, onAfterSetLazyList } = options;
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<T[]>(items.slice(0, itemPerPage));
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    const currentLazyList = items.slice(0, itemPerPage * pageNumber);
    setLazyList(currentLazyList);
    onAfterSetLazyList?.(currentLazyList);
    setLoading(false);
  }, [items, itemPerPage, pageNumber, onAfterSetLazyList]);

  const onLoadMore = useCallback(() => {
    if (lazyList.length === items.length) {
      return;
    }

    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setPageNumber(currentPageNumber);
    }, lazyTime);
  }, [items.length, lazyList.length, lazyTime, pageNumber]);

  return {
    isLoading,
    lazyList,
    onLoadMore,
    setPageNumber,
  };
}
