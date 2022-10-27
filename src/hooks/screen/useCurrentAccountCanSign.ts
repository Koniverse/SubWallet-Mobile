import useGetCurrentAccountSignType from 'hooks/screen/useGetCurrentAccountSignType';
import { accountCanSign } from 'utils/account';
import { useMemo } from 'react';

const useCurrentAccountCanSign = () => {
  const accountSignType = useGetCurrentAccountSignType();

  return useMemo((): boolean => {
    return accountCanSign(accountSignType);
  }, [accountSignType]);
};

export default useCurrentAccountCanSign;
