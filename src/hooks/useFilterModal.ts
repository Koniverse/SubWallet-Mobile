import { useCallback, useState } from 'react';

export function useFilterModal() {
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterSelectionMap, setFilterSelectionMap] = useState<Record<string, boolean>>({});

  const openFilterModal = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const onCloseFilterModal = useCallback(() => {
    setFilterSelectionMap(
      selectedFilters.reduce((acc, curr) => {
        acc[curr] = true;

        return acc;
      }, {} as Record<string, boolean>),
    );

    setFilterModalVisible(false);
  }, [selectedFilters]);

  const onChangeFilterOption = useCallback((value: string, isCheck: boolean) => {
    setFilterSelectionMap(prev => ({
      ...prev,
      [value]: isCheck,
    }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterModalVisible(false);
    setSelectedFilters(Object.keys(filterSelectionMap).filter(o => filterSelectionMap[o]));
  }, [filterSelectionMap]);

  return {
    openFilterModal,
    filterModalVisible,
    onChangeFilterOption,
    onApplyFilter,
    onCloseFilterModal,
    filterSelectionMap,
    selectedFilters,
  };
}
