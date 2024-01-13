import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { useCallback, useContext, useMemo } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { Alert } from 'react-native';
import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';
import { AppModalContext } from 'providers/AppModalContext';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';

export const insufficientMessages = ['残高不足', 'Недостаточный баланс', 'Insufficient balance'];

const useHandleSubmitTransaction = (
  onDone: (id: string) => void,
  setTransactionDone: (value: boolean) => void,
  triggerOnChangeValue?: () => void,
  setIgnoreWarnings?: (value: boolean) => void,
  handleDataForInsufficientAlert?: (estimateFee: AmountData) => Record<string, string>,
  handleDataForClaimRewardAlert?: () => string,
) => {
  const navigation = useNavigation<RootNavigationProps>();
  const { show, hideAll } = useToast();
  const appModalContext = useContext(AppModalContext);

  const onSuccess = useCallback(
    (rs: SWTransactionResponse) => {
      const { errors, id, warnings, estimateFee } = rs;
      if (errors.length || warnings.length) {
        if (errors[0]?.message !== 'Rejected by user') {
          if (errors[0]?.message?.startsWith('Unable to fetch staking data.')) {
            appModalContext.setConfirmModal({
              visible: true,
              completeBtnTitle: i18n.buttonTitles.update,
              message: i18n.common.updateChainMessage,
              title: i18n.header.updateChain,
              onCancelModal: () => {
                appModalContext.hideConfirmModal();
              },
              onCompleteModal: () => {
                navigation.navigate('NetworksSetting', { chainName: errors[0].message.split('"')[1] });
                appModalContext.hideConfirmModal();
              },
            });
          } else if (
            errors[0]?.message.startsWith(
              'UnknownError Connection to Indexed DataBase server lost' ||
                'Provided address is invalid, the capitalization checksum test failed' ||
                'connection not open on send()',
            )
          ) {
            show(
              'Your selected network has lost connection. Update it by re-enabling it or changing network provider',
              { type: 'danger', duration: 8000 },
            );
          } else if (
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
                _data.maintainBalance || '12', // ED + 2 for Vara Network
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
        if (handleDataForClaimRewardAlert && estimateFee) {
          const unclaimedReward = handleDataForClaimRewardAlert();
          const isRewardLteFee = Number(unclaimedReward) <= Number(estimateFee.value);
          const isRewardLtFee = Number(unclaimedReward) < Number(estimateFee.value);
          if (isRewardLteFee) {
            Alert.alert(
              'Pay attention!',
              `The rewards you are about to claim are ${
                isRewardLtFee ? 'smaller than' : 'equal'
              } to the transaction fee. This means that you won’t receive any rewards after claiming. Do you wish to continue?`,
              [
                {
                  text: 'I understand',
                },
              ],
            );
          }
        }
        setTransactionDone(true);
        onDone(id);
      }
    },
    [
      appModalContext,
      handleDataForClaimRewardAlert,
      handleDataForInsufficientAlert,
      hideAll,
      navigation,
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
