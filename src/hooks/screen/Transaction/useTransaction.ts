import { useCallback, useMemo } from 'react';
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
        return 'StakingBalances';
      case 'send-nft':
        return '';
      case 'send-fund':
      default:
        return '';
    }
  }, [action]);

  const title = useMemo(() => {
    return TRANSACTION_TITLE_MAP[transactionType];
  }, [transactionType]);

  const goBack = useCallback(() => {
    // @ts-ignore
    navigation.navigate(homePath);
  }, [homePath, navigation]);

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

  const onDone = useCallback(
    (id: string) => {
      const chainType = isEthereumAddress(formState.data.from) ? 'ethereum' : 'substrate';

      navigation.navigate('TransactionDone', { chainType, chain: formState.data.chain, id });
    },
    [formState.data.chain, formState.data.from, navigation],
  );

  const onChangeFromValue = (value: string) => {
    onChangeValue('from')(value);
  };

  const onChangeAssetValue = (value: string) => {
    const chain = _getOriginChainOfAsset(value);
    onChangeValue('asset')(value);
    onChangeValue('chain')(chain);
  };

  const onChangeAmountValue = (value: string) => {
    onChangeValue('value')(value);
  };

  return {
    title,
    transactionType,
    formState,
    onSubmitField,
    focus,
    onChangeFromValue,
    onChangeAssetValue,
    onChangeAmountValue,
    onChangeValue,
    goBack,
    onDone,
    onUpdateErrors,
  };
};
