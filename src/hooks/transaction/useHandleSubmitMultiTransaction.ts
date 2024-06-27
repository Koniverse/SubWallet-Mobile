import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useCallback, useMemo } from 'react';
import { CommonActionType, CommonProcessAction } from 'reducers/transaction-process';
import { useToast } from 'react-native-toast-notifications';

const useHandleSubmitMultiTransaction = (
  onDone: (id: string) => void,
  setTransactionDone: (value: boolean) => void,
  dispatchProcessState: (value: CommonProcessAction) => void,
  triggerOnChangeValue?: () => void,
  setIgnoreWarnings?: (value: boolean) => void,
) => {
  const { hideAll, show } = useToast();
  const onError = useCallback(
    (error: Error) => {
      console.log('error 2 2 2', error);
      hideAll();
      show(error.message, {
        type: 'danger',
        duration: 8000,
      });

      dispatchProcessState({
        type: CommonActionType.STEP_ERROR_ROLLBACK,
        payload: error,
      });
    },
    [dispatchProcessState, hideAll, show],
  );

  const onSuccess = useCallback(
    (lastStep: boolean, needRollback: boolean): ((rs: SWTransactionResponse) => boolean) => {
      return (rs: SWTransactionResponse): boolean => {
        const { errors: _errors, id, warnings } = rs;
        if (_errors.length || warnings.length) {
          if (_errors[0]?.message !== 'Rejected by user') {
            if (
              _errors[0]?.message.startsWith('UnknownError Connection to Indexed DataBase server lost') ||
              _errors[0]?.message.startsWith('Provided address is invalid, the capitalization checksum test failed') ||
              _errors[0]?.message.startsWith('connection not open on send()')
            ) {
              hideAll();
              show(
                'Your selected network has lost connection. Update it by re-enabling it or changing network provider',
                { type: 'danger', duration: 8000 },
              );

              return false;
            } else {
              if (!warnings[0] || warnings[0].warningType !== 'notEnoughExistentialDeposit' || !setIgnoreWarnings) {
                hideAll();
                console.log('_errors', _errors);
                show(_errors[0]?.message || warnings[0]?.message, {
                  type: _errors.length ? 'danger' : 'warning',
                  duration: 8000,
                });
              }
            }

            if (!_errors.length) {
              warnings[0] && setIgnoreWarnings?.(true);
            }

            return false;
          } else {
            dispatchProcessState({
              type: needRollback ? CommonActionType.STEP_ERROR_ROLLBACK : CommonActionType.STEP_ERROR,
              payload: _errors[0],
            });
            triggerOnChangeValue && triggerOnChangeValue();
            setTransactionDone(false);
            return false;
          }
        } else if (id) {
          warnings[0] && setIgnoreWarnings?.(true);

          dispatchProcessState({
            type: CommonActionType.STEP_COMPLETE,
            payload: rs,
          });

          if (lastStep) {
            setTransactionDone(true);
            onDone(id);

            return false;
          }

          return true;
        } else {
          warnings[0] && setIgnoreWarnings?.(true);

          return false;
        }
      };
    },
    [dispatchProcessState, hideAll, onDone, setIgnoreWarnings, setTransactionDone, show, triggerOnChangeValue],
  );

  return useMemo(
    () => ({
      onSuccess,
      onError,
    }),
    [onError, onSuccess],
  );
};

export default useHandleSubmitMultiTransaction;
