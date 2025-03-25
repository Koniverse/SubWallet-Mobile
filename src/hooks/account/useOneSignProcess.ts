import { AccountSignMode } from '@subwallet/extension-base/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetAccountSignModeByAddress from 'hooks/screen/useGetAccountSignModeByAddress';

const useOneSignProcess = (address: string): boolean => {
  const signMode = useGetAccountSignModeByAddress(address);

  const allowOneSign = useSelector((state: RootState) => state.settings.allowOneSign);

  return signMode === AccountSignMode.PASSWORD && allowOneSign;
};

export default useOneSignProcess;
