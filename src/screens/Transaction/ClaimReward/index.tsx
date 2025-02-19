import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/earning-service/constants';
import { AccountProxy, EarningRewardItem, YieldPoolType, YieldPositionInfo } from '@subwallet/extension-base/types';
import { useYieldPositionDetail } from 'hooks/earning';
import { yieldSubmitStakingClaimReward } from 'messaging/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { ScrollView, View } from 'react-native';
import { AmountData, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { isAccountAll } from 'utils/accountAll';
import { isEthereumAddress } from '@polkadot/util-crypto';
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
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { AccountAddressItemType } from 'types/account';
import { findAccountByAddress, getReformatedAddressRelatedToChain } from 'utils/account';
import { isSameAddress } from '@subwallet/extension-base/utils';

interface ClaimRewardFormValues extends TransactionFormValues {
  bondReward: string;
}

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  yieldPositions: YieldPositionInfo[],
  rewardList: EarningRewardItem[],
  poolType: YieldPoolType,
  poolChain?: string,
): ((account: AccountProxy) => boolean) => {
  const _poolChain = poolChain || '';
  const chain = chainInfoMap[_poolChain];

  return (account: AccountProxy): boolean => {
    if (!chain) {
      return false;
    }

    if (account.specialChain && _poolChain !== account.specialChain) {
      return false;
    }

    if (isAccountAll(account.id)) {
      return false;
    }

    const isEvmChain = _isChainEvmCompatible(chain);

    if (isEvmChain !== isEthereumAddress(account.id)) {
      return false;
    }

    const nominatorMetadata = yieldPositions.find(value =>
      account.accounts.some(ac => isSameAddress(value.address, ac.address)),
    );

    if (!nominatorMetadata) {
      return false;
    }

    const reward = rewardList.find(value => account.accounts.some(ac => isSameAddress(value.address, ac.address)));

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
  const { isAllAccount, accountProxies, accounts } = useSelector((state: RootState) => state.accountState);
  const { earningRewards, poolInfoMap } = useSelector((state: RootState) => state.earning);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

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
  const poolType = poolInfo?.type;
  const poolChain = poolInfo?.chain;
  const accountInfo = useGetAccountByAddress(fromValue);

  const reward = useMemo((): EarningRewardItem | undefined => {
    const chainInfo = poolChain ? chainInfoMap[poolChain] : undefined;
    return earningRewards.find(item => {
      const rewardAccountInfo = findAccountByAddress(accounts, item.address);
      let rewardAddress: string | undefined = item.address;
      if (chainInfo && rewardAccountInfo) {
        rewardAddress = getReformatedAddressRelatedToChain(rewardAccountInfo, chainInfo);
      }
      return rewardAddress && item.slug === slug && rewardAddress === fromValue;
    });
  }, [accounts, chainInfoMap, earningRewards, fromValue, poolChain, slug]);

  const { list: allPositions } = useYieldPositionDetail(slug);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chainValue);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState<boolean>(true);
  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        chainName: chainInfoMap[chainValue]?.name || '',
        symbol: estimateFee.symbol,
      };
    },
    [chainInfoMap, chainValue],
  );

  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    handleDataForInsufficientAlert,
  );

  const rewardList = useMemo((): EarningRewardItem[] => {
    return earningRewards.filter(item => item.slug === slug);
  }, [earningRewards, slug]);

  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
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
  const onPreCheck = usePreCheckAction(fromValue);

  useEffect(() => {
    setChain(poolInfo?.chain);
  }, [poolInfo?.chain, setChain]);

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (fromValue || !errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [errors.from, fromValue]);

  const accountList = useMemo(() => {
    const chainInfo = poolChain ? chainInfoMap[poolChain] : undefined;

    if (!chainInfo) {
      return [];
    }
    const filteredAccountProxyList = accountProxies.filter(
      filterAccount(chainInfoMap, allPositions, rewardList, poolType, poolChain),
    );
    const result: AccountAddressItemType[] = [];

    filteredAccountProxyList.forEach(ap => {
      ap.accounts.forEach(a => {
        const address = getReformatedAddressRelatedToChain(a, chainInfo);

        if (address) {
          result.push({
            accountName: ap.name,
            accountProxyId: ap.id,
            accountProxyType: ap.accountType,
            accountType: a.type,
            address,
          });
        }
      });
    });

    return result;
  }, [accountProxies, allPositions, chainInfoMap, rewardList, poolChain, poolType]);

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

              <GeneralFreeBalance address={fromValue} chain={chainValue} onBalanceReady={setIsBalanceReady} />

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
                disabled={!fromValue || isDisabled || loading || !isBalanceReady}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={ArrowCircleRight}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={
                      !fromValue || isDisabled || loading || !isBalanceReady ? theme.colorTextLight5 : theme.colorWhite
                    }
                  />
                }
                onPress={onPreCheck(onSubmit, ExtrinsicType.STAKING_CLAIM_REWARD)}>
                {i18n.buttonTitles.continue}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.STAKING_CLAIM_REWARD} />
      )}
    </>
  );
};

export default ClaimReward;
