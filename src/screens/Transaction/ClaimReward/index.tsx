import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { EarningRewardItem, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { useYieldPositionDetail } from 'hooks/earning';
import { yieldSubmitStakingClaimReward } from 'messaging/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { ScrollView, View } from 'react-native';
import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _ChainInfo } from '@subwallet/chain-list/types';
import {
  _getSubstrateGenesisHash,
  _isChainEvmCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { isAccountAll } from 'utils/accountAll';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isSameAddress } from '@subwallet/extension-base/utils';
import BigN from 'bignumber.js';
import { BN_ZERO } from 'utils/chainBalances';
import MetaInfo from 'components/MetaInfo';
import { Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import InputCheckBox from 'components/Input/InputCheckBox';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { ClaimRewardProps } from 'routes/transaction/transactionAction';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { useWatch } from 'react-hook-form';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { useGetBalance } from 'hooks/balance';
import { getInputValuesFromString } from 'components/Input/InputAmount';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';

interface ClaimRewardFormValues extends TransactionFormValues {
  bondReward: string;
}

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  yieldPositions: YieldPositionInfo[],
  rewardList: EarningRewardItem[],
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountJson) => boolean) => {
  const _poolChain = poolChain || '';
  const chain = chainInfoMap[_poolChain];

  return (account: AccountJson): boolean => {
    if (!chain) {
      return false;
    }

    if (account.originGenesisHash && _getSubstrateGenesisHash(chain) !== account.originGenesisHash) {
      return false;
    }

    if (isAccountAll(account.address)) {
      return false;
    }

    if (account.isReadOnly) {
      return false;
    }

    const isEvmChain = _isChainEvmCompatible(chain);

    if (isEvmChain !== isEthereumAddress(account.address)) {
      return false;
    }

    const nominatorMetadata = yieldPositions.find(value => isSameAddress(value.address, account.address));

    if (!nominatorMetadata) {
      return false;
    }

    const reward = rewardList.find(value => isSameAddress(value.address, account.address));

    const isAstarNetwork = _STAKING_CHAIN_GROUP.astar.includes(_poolChain);
    const isAmplitudeNetwork = _STAKING_CHAIN_GROUP.amplitude.includes(_poolChain);
    const bnUnclaimedReward = new BigN(reward?.unclaimedReward || '0');

    return (
      ((poolType === YieldPoolType.NOMINATION_POOL || isAmplitudeNetwork) && bnUnclaimedReward.gt(BN_ZERO)) ||
      isAstarNetwork
    );
  };
};

const ClaimReward = ({
  route: {
    params: { slug },
  },
}: ClaimRewardProps) => {
  const accountSelectorRef = useRef<ModalRef>();
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { earningRewards, poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  const {
    title,
    onTransactionDone: onDone,
    onChangeFromValue: setFrom,
    onChangeChainValue: setChain,
    form: {
      setValue,
      control,
      formState: { errors },
    },
    transactionDoneInfo,
  } = useTransaction<ClaimRewardFormValues>('claim-reward', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      bondReward: '',
    },
  });

  const chainValue = useWatch<ClaimRewardFormValues>({ name: 'chain', control });
  const fromValue = useWatch<ClaimRewardFormValues>({ name: 'from', control });
  const bondReward = useWatch<ClaimRewardFormValues>({ name: 'bondReward', control });

  const poolInfo = useMemo(() => poolInfoMap[slug], [poolInfoMap, slug]);
  const poolType = poolInfo.type;
  const poolChain = poolInfo.chain;

  const reward = useMemo((): EarningRewardItem | undefined => {
    return earningRewards.find(item => item.slug === slug && item.address === fromValue);
  }, [earningRewards, fromValue, slug]);

  const { list: allPositions } = useYieldPositionDetail(slug);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainValue);
  const [isTransactionDone, setTransactionDone] = useState(false);

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
    chainValue === 'vara_network' && poolType === YieldPoolType.NOMINATION_POOL
      ? handleDataForInsufficientAlert
      : undefined,
  );

  const rewardList = useMemo((): EarningRewardItem[] => {
    return earningRewards.filter(item => item.slug === slug);
  }, [earningRewards, slug]);

  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const accountInfo = useGetAccountByAddress(fromValue);
  const onSubmit = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      yieldSubmitStakingClaimReward({
        address: fromValue,
        bondReward: !!bondReward,
        slug: slug,
        unclaimedReward: reward?.unclaimedReward,
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [fromValue, bondReward, slug, reward?.unclaimedReward, onSuccess, onError]);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, fromValue);

  useEffect(() => {
    setChain(poolInfo.chain);
  }, [poolInfo.chain, setChain]);

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (fromValue || !errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [errors.from, fromValue]);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allPositions, rewardList, poolType, poolChain));
  }, [accounts, allPositions, chainInfoMap, rewardList, poolChain, poolType]);

  const onChangeBondReward = (value: string) => {
    setValue('bondReward', value);
  };

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
                onSelectItem={item => {
                  setFrom(item.address);
                  accountSelectorRef && accountSelectorRef.current?.onCloseModal();
                }}
                disabled={loading || !isAllAccount}
                renderSelected={() => (
                  <AccountSelectField accountName={accountInfo?.name || ''} value={fromValue} showIcon />
                )}
                accountSelectorRef={accountSelectorRef}
              />

              <GeneralFreeBalance address={fromValue} chain={chainValue} />

              <MetaInfo hasBackgroundWrapper>
                <MetaInfo.Chain chain={chainValue} label={i18n.inputLabel.network} />

                {reward?.unclaimedReward && (
                  <MetaInfo.Number
                    decimals={decimals}
                    label={i18n.inputLabel.rewardAmount}
                    suffix={symbol}
                    value={reward.unclaimedReward}
                  />
                )}
              </MetaInfo>

              <InputCheckBox
                checked={!!bondReward}
                label={i18n.inputLabel.bondRewardAfterClaim}
                disable={loading}
                onPress={() => {
                  if (!bondReward) {
                    onChangeBondReward('1');
                  } else {
                    onChangeBondReward('');
                  }
                }}
                checkBoxSize={20}
              />
            </ScrollView>

            <View style={{ padding: 16, flexDirection: 'row' }}>
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
        <TransactionDone transactionDoneInfo={transactionDoneInfo} />
      )}
    </>
  );
};

export default ClaimReward;
