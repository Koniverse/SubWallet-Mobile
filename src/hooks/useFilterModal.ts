import { useCallback, useRef, useState } from 'react';
import { ModalRef } from 'types/modalRef';
import { Keyboard } from 'react-native';

export function useFilterModal() {
  const filterModalRef = useRef<ModalRef>();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterSelectionMap, setFilterSelectionMap] = useState<Record<string, boolean>>({});

  const openFilterModal = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => filterModalRef && filterModalRef.current?.onOpenModal(), 100);
  }, []);

  const onCloseFilterModal = useCallback(() => {
    setFilterSelectionMap(
      selectedFilters.reduce((acc, curr) => {
        acc[curr] = true;

        return acc;
      }, {} as Record<string, boolean>),
    );

    filterModalRef && filterModalRef.current?.onCloseModal();
  }, [selectedFilters]);

  const onChangeFilterOption = useCallback((value: string, isCheck: boolean) => {
    setFilterSelectionMap(prev => ({
      ...prev,
      [value]: isCheck,
    }));
  }, []);

  const onApplyFilter = useCallback(() => {
    filterModalRef && filterModalRef.current?.onCloseModal();
    setSelectedFilters(Object.keys(filterSelectionMap).filter(o => filterSelectionMap[o]));
  }, [filterSelectionMap]);

  return {
    openFilterModal,
    onChangeFilterOption,
    onApplyFilter,
    onCloseFilterModal,
    filterSelectionMap,
    selectedFilters,
    filterModalRef,
  };
}
