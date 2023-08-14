import { useCallback, useContext, useMemo } from 'react';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { TRANSACTION_TITLE_MAP } from 'constants/transaction';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAccountAll } from 'utils/accountAll';
import { ExtraExtrinsicType, ExtrinsicTypeMobile } from 'types/transaction';
import useChainChecker from 'hooks/chain/useChainChecker';
import { AppModalContext } from 'providers/AppModalContext';
import { FieldValues, UseFormProps } from 'react-hook-form/dist/types';
import { FieldPath, useForm } from 'react-hook-form';
import { FieldPathValue } from 'react-hook-form/dist/types/path';
import i18n from 'utils/i18n/i18n';

export interface TransactionFormValues extends FieldValues {
  from: string;
  chain: string;
  asset: string;
  value: string;
}

export const useTransaction = <T extends TransactionFormValues = TransactionFormValues, TContext = any>(
  action: string,
  formOptions: UseFormProps<T, TContext> = {},
) => {
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const navigation = useNavigation<RootNavigationProps>();
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
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

  const form = useForm<T, TContext>({
    mode: 'onChange',
    ...formOptions,
    defaultValues: {
      from: (!isAccountAll(currentAccount?.address as string) && currentAccount?.address) || '',
      chain: '',
      asset: '',
      value: '',
      ...formOptions.defaultValues,
    } as UseFormProps<T, TContext>['defaultValues'],
  });

  const { getValues, setValue } = form;

  const onTransactionDone = useCallback(
    (id: string) => {
      const { from, chain } = getValues();
      const chainType = isEthereumAddress(from) ? 'ethereum' : 'substrate';

      navigation.navigate('TransactionDone', { chainType, chain, id, path: homePath });
    },
    [getValues, homePath, navigation],
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
              turnOnChain(chain);
              setTimeout(() => appModalContext.hideConfirmModal(), 300);
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
      setValue('from' as FieldPath<T>, value as FieldPathValue<T, FieldPath<T>>);
    },
    [setValue],
  );

  const onChangeAssetValue = useCallback(
    (value: string) => {
      const chain = assetRegistry[value].originChain;
      setValue('asset' as FieldPath<T>, value as FieldPathValue<T, FieldPath<T>>);
      setValue('chain' as FieldPath<T>, chain as FieldPathValue<T, FieldPath<T>>);
      showPopupEnableChain(chain);
    },
    [assetRegistry, setValue, showPopupEnableChain],
  );

  const onChangeChainValue = useCallback(
    (value: string) => {
      setValue('chain' as FieldPath<T>, value as FieldPathValue<T, FieldPath<T>>);
      showPopupEnableChain(value);
    },
    [setValue, showPopupEnableChain],
  );

  const onChangeAmountValue = useCallback(
    (value: string) => {
      setValue('value' as FieldPath<T>, value as FieldPathValue<T, FieldPath<T>>);
    },
    [setValue],
  );

  return {
    title,
    transactionType,
    form,
    onChangeFromValue,
    onChangeAssetValue,
    onChangeChainValue,
    onChangeAmountValue,
    onTransactionDone,
    showPopupEnableChain,
    checkChainConnected,
  };
};
