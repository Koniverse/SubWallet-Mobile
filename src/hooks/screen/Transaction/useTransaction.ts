import { useCallback, useContext, useMemo } from 'react';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { TRANSACTION_TITLE_MAP } from 'constants/transaction';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useFormControl, { FormControlConfig, FormControlOption } from 'hooks/screen/useFormControl';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getOriginChainOfAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import { ExtraExtrinsicType, ExtrinsicTypeMobile } from 'types/transaction';
import useChainChecker from 'hooks/chain/useChainChecker';
import { AppModalContext } from 'providers/AppModalContext';
import i18n from 'utils/i18n/i18n';

export const useTransaction = (
  action: string,
  extraFormConfig: FormControlConfig,
  formControlOption?: FormControlOption,
) => {
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { turnOnChain, checkChainConnected } = useChainChecker();
  const appModalContext = useContext(AppModalContext);
  const transactionType = useMemo((): ExtrinsicTypeMobile => {
    switch (action) {
      case 'stake':
        return ExtrinsicType.STAKING_JOIN_POOL;
      case 'unstake':
        return ExtrinsicType.STAKING_LEAVE_POOL;
      case 'cancel-unstake':
        return ExtrinsicType.STAKING_CANCEL_UNSTAKE;
      case 'claim-reward':
        return ExtrinsicType.STAKING_CLAIM_REWARD;
      case 'withdraw':
        return ExtrinsicType.STAKING_WITHDRAW;
      case 'compound':
        return ExtrinsicType.STAKING_COMPOUNDING;
      case 'import-nft':
        return ExtraExtrinsicType.IMPORT_NFT;
      case 'import-token':
        return ExtraExtrinsicType.IMPORT_TOKEN;
      case 'send-nft':
        return ExtrinsicType.SEND_NFT;
      case 'send-fund':
      default:
        return ExtrinsicType.TRANSFER_BALANCE;
    }
  }, [action]);

  const homePath = useMemo((): string => {
    switch (action) {
      case 'stake':
      case 'unstake':
      case 'cancel-unstake':
      case 'claim-reward':
      case 'compound':
        return 'Staking';
      case 'send-nft':
        return 'NFT';
      case 'send-fund':
      default:
        return 'Token';
    }
  }, [action]);

  const title = useMemo(() => {
    return TRANSACTION_TITLE_MAP()[transactionType];
  }, [transactionType]);

  const transactionFormConfig: FormControlConfig = {
    from: {
      name: 'From',
      value: (!isAccountAll(currentAccount?.address as string) && currentAccount?.address) || '',
    },
    chain: {
      name: 'Chain',
      value: '',
    },
    asset: {
      name: 'Asset',
      value: '',
    },
    value: {
      name: 'Value',
      value: '',
      require: true,
    },
    ...extraFormConfig,
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(
    transactionFormConfig,
    formControlOption || {},
  );

  const onDone = useCallback(
    (id: string) => {
      const chainType = isEthereumAddress(formState.data.from) ? 'ethereum' : 'substrate';

      navigation.navigate('TransactionDone', { chainType, chain: formState.data.chain, id, path: homePath });
    },
    [formState.data.chain, formState.data.from, homePath, navigation],
  );

  const showPopupEnableChain = useCallback(
    (chain: string) => {
      if (!chainInfoMap[chain]) {
        return;
      }
      const isConnected = checkChainConnected(chain);
      if (!isConnected) {
        setTimeout(() => {
          appModalContext.setConfirmModal({
            visible: true,
            message: i18n.common.enableChainMessage(chainInfoMap[chain].name),
            title: i18n.common.enableChain,
            onCancelModal: () => {
              appModalContext.hideConfirmModal();
            },
            onCompleteModal: () => {
              appModalContext.hideConfirmModal();
              setTimeout(() => turnOnChain(chain), 200);
            },
            messageIcon: chain,
          });
        }, 700);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appModalContext, chainInfoMap],
  );

  const onChangeFromValue = useCallback(
    (value: string) => {
      onChangeValue('from')(value);
    },
    [onChangeValue],
  );

  const onChangeAssetValue = useCallback(
    (value: string) => {
      const chain = _getOriginChainOfAsset(value);
      onChangeValue('asset')(value);
      onChangeValue('chain')(chain);
      showPopupEnableChain(chain);
    },
    [onChangeValue, showPopupEnableChain],
  );

  const onChangeChainValue = useCallback(
    (value: string) => {
      onChangeValue('chain')(value);
      showPopupEnableChain(value);
    },
    [onChangeValue, showPopupEnableChain],
  );

  const onChangeAmountValue = useCallback(
    (value: string) => {
      onChangeValue('value')(value);
    },
    [onChangeValue],
  );

  return {
    title,
    transactionType,
    formState,
    onSubmitField,
    focus,
    onChangeFromValue,
    onChangeAssetValue,
    onChangeChainValue,
    onChangeAmountValue,
    onChangeValue,
    onDone,
    onUpdateErrors,
    showPopupEnableChain,
    checkChainConnected,
  };
};
