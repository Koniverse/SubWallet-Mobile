import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransactionV2';
import { ScrollView, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import {
  AmountData,
  NominatorMetadata,
  RequestStakeWithdrawal,
  StakingType,
  UnstakingInfo,
  UnstakingStatus,
} from '@subwallet/extension-base/background/KoniTypes';
import { accountFilterFunc } from 'screens/Transaction/helper/staking';
import { _ChainInfo } from '@subwallet/chain-list/types';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import MetaInfo from 'components/MetaInfo';
import { isAccountAll } from 'utils/accountAll';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { isActionFromValidator } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { submitStakeWithdrawal } from 'messaging/index';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { WithdrawProps } from 'routes/transaction/transactionAction';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { getAstarWithdrawable } from '@subwallet/extension-base/koni/api/staking/bonding/astar';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { useWatch } from 'react-hook-form';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { useGetBalance } from 'hooks/balance';
import { getInputValuesFromString } from 'components/Input/InputAmountV2';

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allNominatorInfo: NominatorMetadata[],
  stakingType: StakingType,
  stakingChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nomination = allNominatorInfo.find(data => isSameAddress(data.address, account.address));

    return (
      (nomination
        ? nomination.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE).length > 0
        : false) && accountFilterFunc(chainInfoMap, stakingType, stakingChain)(account)
    );
  };
};

export const Withdraw = ({
  route: {
    params: { chain: stakingChain, type: _stakingType },
  },
}: WithdrawProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const stakingType = _stakingType as StakingType;
  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const {
    title,
    onTransactionDone: onDone,
    onChangeFromValue: setFrom,
    onChangeChainValue: setChain,
    form: {
      control,
      getValues,
      formState: { errors },
    },
    transactionDoneInfo,
  } = useTransaction('withdraw', {
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { chain: chainValue, from: fromValue } = {
    ...useWatch<TransactionFormValues>({ control }),
    ...getValues(),
  };
  const allNominatorInfo = useGetNominatorInfo(stakingChain, stakingType);
  const nominatorInfo = useGetNominatorInfo(stakingChain, stakingType, fromValue);
  const nominatorMetadata = nominatorInfo[0];
  const accountInfo = useGetAccountByAddress(fromValue);

  const accountSelectorRef = useRef<ModalRef>();
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { nativeTokenBalance } = useGetBalance(chainValue, fromValue);
  const existentialDeposit = useMemo(() => {
    const assetInfo = Object.values(assetRegistry).find(v => v.originChain === chainValue);
    if (assetInfo) {
      return assetInfo.minAmount || '0';
    }

    return '0';
  }, [assetRegistry, chainValue]);
  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        existentialDeposit: getInputValuesFromString(existentialDeposit, estimateFee.decimals),
        availableBalance: getInputValuesFromString(nativeTokenBalance.value, estimateFee.decimals),
        symbol: estimateFee.symbol,
      };
    },
    [existentialDeposit, nativeTokenBalance.value],
  );
  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    chainValue === 'vara_network' && stakingType === StakingType.POOLED ? handleDataForInsufficientAlert : undefined,
  );

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (fromValue || !errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [errors.from, fromValue]);

  useEffect(() => {
    setChain(stakingChain || '');
  }, [setChain, stakingChain]);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allNominatorInfo, stakingType));
  }, [accounts, allNominatorInfo, chainInfoMap, stakingType]);

  const unstakingInfo = useMemo((): UnstakingInfo | undefined => {
    if (fromValue && !isAccountAll(fromValue) && !!nominatorMetadata) {
      if (_STAKING_CHAIN_GROUP.astar.includes(nominatorMetadata.chain)) {
        return getAstarWithdrawable(nominatorMetadata);
      }
      return nominatorMetadata.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE)[0];
    }

    return undefined;
  }, [fromValue, nominatorMetadata]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainValue);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, fromValue);

  const onSubmit = useCallback(() => {
    setLoading(true);

    if (!unstakingInfo) {
      setLoading(false);

      return;
    }

    const params: RequestStakeWithdrawal = {
      unstakingInfo: unstakingInfo,
      chain: nominatorMetadata.chain,
      nominatorMetadata,
    };

    if (isActionFromValidator(stakingType, chainValue)) {
      params.validatorAddress = unstakingInfo.validatorAddress;
    }

    setTimeout(() => {
      submitStakeWithdrawal(params)
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [chainValue, nominatorMetadata, onError, onSuccess, stakingType, unstakingInfo]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
              {isAllAccount && (
                <AccountSelector
                  items={accountList}
                  selectedValueMap={{ [fromValue]: true }}
                  renderSelected={() => (
                    <AccountSelectField accountName={accountInfo?.name || ''} value={fromValue} showIcon />
                  )}
                  onSelectItem={item => {
                    setFrom(item.address);
                    accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                  }}
                  accountSelectorRef={accountSelectorRef}
                  disabled={loading}
                />
              )}

              <FreeBalance label={`${i18n.inputLabel.availableBalance}:`} address={fromValue} chain={chainValue} />

              <MetaInfo hasBackgroundWrapper>
                <MetaInfo.Chain chain={chainValue} label={i18n.inputLabel.network} />

                {unstakingInfo && (
                  <MetaInfo.Number
                    decimals={decimals}
                    label={i18n.inputLabel.amount}
                    suffix={symbol}
                    value={unstakingInfo.claimable}
                  />
                )}
              </MetaInfo>
            </ScrollView>

            <View
              style={{ paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', ...MarginBottomForSubmitButton }}>
              <Button
                disabled={loading}
                style={{ flex: 1, marginRight: 4 }}
                type={'secondary'}
                onPress={() => navigation.goBack()}
                icon={
                  <Icon
                    phosphorIcon={XCircle}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={loading ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }>
                {i18n.buttonTitles.cancel}
              </Button>
              <Button
                style={{ flex: 1, marginLeft: 4 }}
                disabled={isDisabled || loading}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={ArrowCircleRight}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={isDisabled ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }
                onPress={onPreCheckReadOnly(onSubmit)}>
                {i18n.buttonTitles.continue}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};
