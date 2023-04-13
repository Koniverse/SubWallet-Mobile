import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useCallback, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';

const useHandleSubmitTransaction = (
  onDone: (extrinsicHash: string) => void,
  setIgnoreWarnings?: (value: boolean) => void,
) => {
  const { show } = useToast();

  const onSuccess = useCallback(
    (rs: SWTransactionResponse) => {
      const { errors, extrinsicHash, warnings } = rs;
      console.log('errors', errors);
      console.log('extrinsicHash', extrinsicHash);
      console.log('warnings', warnings);
      if (errors.length || warnings.length) {
        if (errors[0]?.message !== 'User reject request') {
          show(errors[0]?.message || warnings[0]?.message);
        }

        warnings[0] && setIgnoreWarnings?.(true);
      } else if (extrinsicHash) {
        onDone(extrinsicHash);
      }
    },
    [onDone, setIgnoreWarnings, show],
  );

  const onError = useCallback(
    (error: Error) => {
      console.log('error', error);
      show(error.message);
    },
    [show],
  );

  return useMemo(
    () => ({
      onSuccess,
      onError,
    }),
    [onError, onSuccess],
  );
};

export default useHandleSubmitTransaction;
