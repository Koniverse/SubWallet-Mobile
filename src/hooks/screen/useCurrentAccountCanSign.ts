import useGetCurrentAccountSignMode from 'hooks/screen/useGetCurrentAccountSignMode';
import { accountCanSign } from 'utils/account';
import { useMemo } from 'react';

const useCurrentAccountCanSign = () => {
  const accountSignMode = useGetCurrentAccountSignMode();

  return useMemo((): boolean => {
    return accountCanSign(accountSignMode);
  }, [accountSignMode]);
};

export default useCurrentAccountCanSign;
