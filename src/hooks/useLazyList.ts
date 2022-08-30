import { useEffect, useState } from 'react';

export function useLazyList<T>(items: T[], itemPerPage = 15) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<T[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const sliceArray = (array: T[], curPageNumber: number) => {
    return array.slice(0, itemPerPage * curPageNumber);
  };

  useEffect(() => {
    const currentLazyList = sliceArray(items, pageNumber);
    setLazyList(currentLazyList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items), pageNumber]);

  const onLoadMore = () => {
    if (lazyList.length === items.length) {
      return;
    }

    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setLoading(false);
      setPageNumber(currentPageNumber);
    }, 300);
  };

  return {
    isLoading,
    lazyList,
    onLoadMore,
  };
}
