import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useCallback, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';

const useHandleSubmitTransaction = (onDone: (id: string) => void, setIgnoreWarnings?: (value: boolean) => void) => {
  const { show, hideAll } = useToast();

  const onSuccess = useCallback(
    (rs: SWTransactionResponse) => {
      const { errors, id, warnings } = rs;
      if (errors.length || warnings.length) {
        if (errors[0]?.message !== 'User reject request') {
          hideAll();
          show(errors[0]?.message || warnings[0]?.message, { type: 'danger' });
        }

        warnings[0] && setIgnoreWarnings?.(true);
      } else if (id) {
        onDone(id);
      }
    },
    [hideAll, onDone, setIgnoreWarnings, show],
  );

  const onError = useCallback(
    (error: Error) => {
      hideAll();
      show(error.message, { type: 'danger' });
    },
    [hideAll, show],
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
