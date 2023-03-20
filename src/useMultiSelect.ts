import { useCallback, useState } from 'react';

export function useMultiSelect(modalId: string, onCloseModal: () => void) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectionMap, setFilterSelectionMap] = useState<Record<string, boolean>>({});

  const onChangeOption = useCallback((value: string, isCheck: boolean) => {
    setFilterSelectionMap(prev => ({
      ...prev,
      [value]: isCheck,
    }));
  }, []);

  const onApply = useCallback(() => {
    onCloseModal();
    setSelectedItems(Object.keys(selectionMap).filter(o => selectionMap[o]));
  }, [onCloseModal, selectionMap]);

  return {
    onChangeOption,
    onApply,
    selectionMap,
    selectedItems,
  };
}
