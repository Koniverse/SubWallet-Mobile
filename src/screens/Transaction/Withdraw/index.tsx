import { getAstarWithdrawable } from '@subwallet/extension-base/services/earning-service/handlers/native-staking/astar';
import {
  RequestYieldWithdrawal,
  UnstakingInfo,
  UnstakingStatus,
  YieldPoolType,
  YieldPositionInfo,
} from '@subwallet/extension-base/types';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { ScrollView, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import { useSelector } from 'react-redux';
import { accountFilterFunc } from 'screens/Transaction/helper/earning';
import { RootState } from 'stores/index';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { AmountData, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { _ChainInfo } from '@subwallet/chain-list/types';
import MetaInfo from 'components/MetaInfo';
import { isAccountAll } from 'utils/accountAll';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { WithdrawProps } from 'routes/transaction/transactionAction';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { useWatch } from 'react-hook-form';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { useGetBalance } from 'hooks/balance';
import { getInputValuesFromString } from 'components/Input/InputAmount';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import useYieldPositionDetail from '../../../hooks/earning/useYieldPositionDetail';
import { yieldSubmitStakingWithdrawal } from 'messaging/index';

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allPositionInfos: YieldPositionInfo[],
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountJson) => boolean) => {
  return (account: AccountJson): boolean => {
    const nomination = allPositionInfos.find(data => isSameAddress(data.address, account.address));

    return (
      (nomination
        ? nomination.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE).length > 0
        : false) && accountFilterFunc(chainInfoMap, poolType, poolChain)(account)
    );
  };
};

export const Withdraw = ({
  route: {
    params: { slug },
  },
}: WithdrawProps) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<StakingScreenNavigationProps>();

  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { poolInfoMap } = useSelector((state: RootState) => state.earning);

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
      formState: { errors },
    },
    transactionDoneInfo,
  } = useTransaction('withdraw', {
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const chainValue = useWatch<TransactionFormValues>({ name: 'chain', control });
  const fromValue = useWatch<TransactionFormValues>({ name: 'from', control });

  const { list: allPositionInfos } = useYieldPositionDetail(slug);
  const { list: yieldPositions } = useYieldPositionDetail(slug, fromValue);
  const yieldPosition = yieldPositions[0];

  const accountInfo = useGetAccountByAddress(fromValue);
  const poolInfo = useMemo(() => poolInfoMap[slug], [poolInfoMap, slug]);
  const stakingChain = useMemo(() => poolInfo?.chain || '', [poolInfo?.chain]);

  const inputAsset = useGetChainAssetInfo(poolInfo.metadata.inputAsset);
  const decimals = inputAsset?.decimals || 0;
  const symbol = inputAsset?.symbol || '';

  const accountSelectorRef = useRef<ModalRef>();
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
        maintainBalance: getInputValuesFromString(poolInfo.metadata.maintainBalance || '0', estimateFee.decimals),
        symbol: estimateFee.symbol,
      };
    },
    [existentialDeposit, nativeTokenBalance.value, poolInfo.metadata.maintainBalance],
  );
  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    handleDataForInsufficientAlert,
  );

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allPositionInfos, poolInfo.type));
  }, [accounts, allPositionInfos, chainInfoMap, poolInfo.type]);

  const unstakingInfo = useMemo((): UnstakingInfo | undefined => {
    if (fromValue && !isAccountAll(fromValue) && !!yieldPosition) {
      if (_STAKING_CHAIN_GROUP.astar.includes(yieldPosition.chain)) {
        return getAstarWithdrawable(yieldPosition);
      }
      return yieldPosition.unstakings.filter(data => data.status === UnstakingStatus.CLAIMABLE)[0];
    }

    return undefined;
  }, [fromValue, yieldPosition]);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, fromValue);

  const onSubmit = useCallback(() => {
    setLoading(true);

    if (!unstakingInfo) {
      setLoading(false);

      return;
    }

    const params: RequestYieldWithdrawal = {
      address: fromValue,
      slug: slug,
      unstakingInfo: unstakingInfo,
    };

    setTimeout(() => {
      yieldSubmitStakingWithdrawal(params)
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [unstakingInfo, fromValue, slug, onSuccess, onError]);

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

  useEffect(() => {
    if (!fromValue && accountList.length === 1) {
      setFrom(accountList[0].address);
    }
  }, [accountList, fromValue, setFrom]);

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
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
                disabled={loading || !isAllAccount}
              />

              <GeneralFreeBalance address={fromValue} chain={chainValue} />

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
                disabled={!fromValue || isDisabled || loading}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={ArrowCircleRight}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={!fromValue || isDisabled ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }
                onPress={onPreCheckReadOnly(onSubmit)}>
                {i18n.buttonTitles.continue}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.STAKING_WITHDRAW} />
      )}
    </>
  );
};
