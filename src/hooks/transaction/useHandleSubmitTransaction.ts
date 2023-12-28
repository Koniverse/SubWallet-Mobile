import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useCallback, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { Alert } from 'react-native';
import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';

export const insufficientMessages = ['残高不足', 'Недостаточный баланс', 'Insufficient balance'];

const useHandleSubmitTransaction = (
  onDone: (id: string) => void,
  setTransactionDone: (value: boolean) => void,
  triggerOnChangeValue?: () => void,
  setIgnoreWarnings?: (value: boolean) => void,
  handleDataForInsufficientAlert?: (estimateFee: AmountData) => Record<string, string>,
) => {
  const { show, hideAll } = useToast();

  const onSuccess = useCallback(
    (rs: SWTransactionResponse) => {
      const { errors, id, warnings, estimateFee } = rs;
      if (errors.length || warnings.length) {
        if (errors[0]?.message !== 'Rejected by user') {
          if (
            handleDataForInsufficientAlert &&
            insufficientMessages.some(v => errors[0]?.message.includes(v)) &&
            estimateFee
          ) {
            const _data = handleDataForInsufficientAlert(estimateFee);
            Alert.alert(
              i18n.warningTitle.insufficientBalance,
              i18n.formatString(
                i18n.warningMessage.insufficientBalanceMessage,
                _data.availableBalance,
                _data.symbol,
                _data.existentialDeposit,
                '12', // ED + 2 for Vara Network
              ) as string,
              [
                {
                  text: 'I understand',
                },
              ],
            );
          } else {
            hideAll();
            show(errors[0]?.message || warnings[0]?.message, { type: 'danger' });
          }
        }
        triggerOnChangeValue && triggerOnChangeValue();
        setTransactionDone(false);
        warnings[0] && setIgnoreWarnings?.(true);
      } else if (id) {
        setTransactionDone(true);
        onDone(id);
      }
    },
    [
      handleDataForInsufficientAlert,
      hideAll,
      onDone,
      setIgnoreWarnings,
      setTransactionDone,
      show,
      triggerOnChangeValue,
    ],
  );

  const onError = useCallback(
    (error: Error) => {
      setTransactionDone(false);
      hideAll();
      show(error.message, { type: 'danger', duration: 8000 });
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
