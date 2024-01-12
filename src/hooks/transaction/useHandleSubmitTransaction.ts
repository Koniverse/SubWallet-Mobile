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
              // customIcon: { icon: WifiX, color: '#D9D9D9', weight: 'bold' },
              onCancelModal: () => {
                appModalContext.hideConfirmModal();
              },
              onCompleteModal: () => {
                navigation.navigate('NetworksSetting', { chainName: errors[0].message.split('"')[1] });
                appModalContext.hideConfirmModal();
              },
            });
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
                '12', // ED + 2 for Vara Network
              ) as string,
              [
                {
                  text: 'I understand',
                },
              ],
            );
          } else if (handleDataForClaimRewardAlert && estimateFee) {
            const unclaimedReward = handleDataForClaimRewardAlert();
            if (Number(unclaimedReward) <= Number(estimateFee.value)) {
              Alert.alert(
                'Pay attention!',
                'The rewards you are about to claim are smaller than/equal to the transaction fee. This means that you won’t receive any rewards after claiming. Do you wish to continue?',
                [
                  {
                    text: 'Go back',
                  },
                ],
              );
            }
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
