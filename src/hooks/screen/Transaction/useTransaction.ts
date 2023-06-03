import { useCallback, useContext, useEffect, useMemo } from 'react';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { TRANSACTION_TITLE_MAP } from 'constants/transaction';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getOriginChainOfAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import useChainChecker from 'hooks/chain/useChainChecker';
import { AppModalContext } from 'providers/AppModalContext';

export const useTransaction = (action: string, extraFormConfig: FormControlConfig) => {
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const navigation = useNavigation<RootNavigationProps>();
  const transactionType = useMemo((): ExtrinsicType => {
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
    return TRANSACTION_TITLE_MAP[transactionType];
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

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(transactionFormConfig, {});
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { turnOnChain, checkChainConnected } = useChainChecker();
  const appModalContext = useContext(AppModalContext);

  const onDone = useCallback(
    (id: string) => {
      const chainType = isEthereumAddress(formState.data.from) ? 'ethereum' : 'substrate';

      navigation.navigate('TransactionDone', { chainType, chain: formState.data.chain, id, path: homePath });
    },
    [formState.data.chain, formState.data.from, homePath, navigation],
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
    },
    [appModalContext, chainInfoMap, checkChainConnected, onChangeValue, turnOnChain],
  );

  const onChangeChainValue = useCallback(
    (value: string) => {
      onChangeValue('chain')(value);
    },
    [onChangeValue],
  );

  const onChangeAmountValue = useCallback(
    (value: string) => {
      onChangeValue('value')(value);
    },
    [onChangeValue],
  );

  useEffect(() => {
    const chain = formState.data.chain;
    const isConnected = checkChainConnected(chain);
    let timeout: NodeJS.Timeout;
    if (!isConnected) {
      timeout = setTimeout(
        () =>
          appModalContext.setConfirmModal({
            visible: true,
            message: `Your selected chain (${chainInfoMap[chain].name}) is currently disabled, you need to turn it on`,
            title: 'Enable chain?',
            onCancelModal: () => {
              appModalContext.hideConfirmModal();
            },
            onCompleteModal: () => {
              appModalContext.hideConfirmModal();
              setTimeout(() => turnOnChain(chain), 200);
            },
            messageIcon: chain,
          }),
        700,
      );
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [appModalContext, chainInfoMap, checkChainConnected, formState.data.chain, turnOnChain]);

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
  };
};
