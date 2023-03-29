import { useCallback, useState } from 'react';

export function useFilterModal() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterSelectionMap, setFilterSelectionMap] = useState<Record<string, boolean>>({});

  const onCloseFilterModal = useCallback(() => {
    setFilterSelectionMap(
      selectedFilters.reduce((acc, curr) => {
        acc[curr] = true;

        return acc;
      }, {} as Record<string, boolean>),
    );

    //close modal
  }, [selectedFilters]);

  const onChangeFilterOption = useCallback((value: string, isCheck: boolean) => {
    setFilterSelectionMap(prev => ({
      ...prev,
      [value]: isCheck,
    }));
  }, []);

  const onCancelFilter = () => {
    setSelectedFilters([]);
  };

  const onApplyFilter = useCallback(() => {
    // inactiveModal(modalId); close modal
    setSelectedFilters(Object.keys(filterSelectionMap).filter(o => filterSelectionMap[o]));
  }, [filterSelectionMap]);

  return {
    onChangeFilterOption,
    onApplyFilter,
    onCloseFilterModal,
    filterSelectionMap,
    selectedFilters,
  };
}
