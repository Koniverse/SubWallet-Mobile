import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useCallback, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';

const useHandleSubmitTransaction = (
  onDone: (id: string) => void,
  setTransactionDone: (value: boolean) => void,
  triggerOnChangeValue?: () => void,
  setIgnoreWarnings?: (value: boolean) => void,
) => {
  const { show, hideAll } = useToast();

  const onSuccess = useCallback(
    (rs: SWTransactionResponse) => {
      const { errors, id, warnings } = rs;
      if (errors.length || warnings.length) {
        if (errors[0]?.message !== 'Rejected by user') {
          hideAll();
          show(errors[0]?.message || warnings[0]?.message, { type: 'danger' });
        }
        triggerOnChangeValue && triggerOnChangeValue();
        setTransactionDone(false);
        warnings[0] && setIgnoreWarnings?.(true);
      } else if (id) {
        setTransactionDone(true);
        onDone(id);
      }
    },
    [hideAll, onDone, setIgnoreWarnings, setTransactionDone, show, triggerOnChangeValue],
  );

  const onError = useCallback(
    (error: Error) => {
      setTransactionDone(false);
      hideAll();
      show(error.message, { type: 'danger' });
    },
    [hideAll, setTransactionDone, show],
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
