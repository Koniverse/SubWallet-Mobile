import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchCustomToken() {
  const { assetRegistry, assetSettingMap } = useSelector((state: RootState) => state.assetRegistry);
  const assetItems = useMemo(() => Object.values(assetRegistry), [assetRegistry]);
  return { assetItems, assetSettingMap, assetRegistry };
}
