import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useNavigation } from '@react-navigation/native';
import { StakingScreenNavigationProps } from 'routes/staking/stakingScreen';
import { ScrollView, View } from 'react-native';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { NominatorMetadata, StakingRewardItem, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import useGetNominatorInfo from 'hooks/screen/Staking/useGetNominatorInfo';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { submitStakeClaimReward } from 'messaging/index';
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
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
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

const filterAccount = (
  chainInfoMap: Record<string, _ChainInfo>,
  allNominatorInfo: NominatorMetadata[],
  rewardList: StakingRewardItem[],
  stakingType: StakingType,
  stakingChain?: string,
): ((account: AccountJson) => boolean) => {
  const _stakingChain = stakingChain || '';
  const chain = chainInfoMap[_stakingChain];

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

    const nominatorMetadata = allNominatorInfo.find(value => isSameAddress(value.address, account.address));

    if (!nominatorMetadata) {
      return false;
    }

    const reward = rewardList.find(value => isSameAddress(value.address, account.address));

    const isAstarNetwork = _STAKING_CHAIN_GROUP.astar.includes(_stakingChain);
    const isAmplitudeNetwork = _STAKING_CHAIN_GROUP.amplitude.includes(_stakingChain);
    const bnUnclaimedReward = new BigN(reward?.unclaimedReward || '0');

    return (
      ((stakingType === StakingType.POOLED || isAmplitudeNetwork) && bnUnclaimedReward.gt(BN_ZERO)) || isAstarNetwork
    );
  };
};

const ClaimReward = ({
  route: {
    params: { chain: stakingChain, type: _stakingType },
  },
}: ClaimRewardProps) => {
  const accountSelectorRef = useRef<ModalRef>();
  const stakingType = _stakingType as StakingType;
  const navigation = useNavigation<StakingScreenNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { isAllAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const { stakingRewardMap } = useSelector((state: RootState) => state.staking);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const claimRewardFormConfig = {
    bondReward: {
      name: 'Bond reward',
      value: '1',
    },
  };

  const { title, formState, onDone, onChangeValue, onChangeFromValue } = useTransaction(
    'claim-reward',
    claimRewardFormConfig,
  );
  const { from, chain, bondReward } = formState.data;
  const allNominatorInfo = useGetNominatorInfo(stakingChain, stakingType);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const reward = useMemo((): StakingRewardItem | undefined => {
    return stakingRewardMap.find(item => item.chain === chain && item.address === from && item.type === stakingType);
  }, [chain, from, stakingRewardMap, stakingType]);

  const rewardList = useMemo((): StakingRewardItem[] => {
    return stakingRewardMap.filter(item => item.chain === chain && item.type === stakingType);
  }, [chain, stakingRewardMap, stakingType]);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone);
  const accountInfo = useGetAccountByAddress(from);
  const onSubmit = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      submitStakeClaimReward({
        address: from,
        chain: chain,
        bondReward: !!bondReward,
        stakingType: stakingType,
        unclaimedReward: reward?.unclaimedReward,
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [bondReward, chain, from, onError, onSuccess, reward?.unclaimedReward, stakingType]);

  const onPreCheckReadOnly = usePreCheckReadOnly(undefined, from);

  useEffect(() => {
    onChangeValue('chain')(stakingChain || '');
  }, [onChangeValue, stakingChain]);

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (from || !formState.errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [formState.errors.from, from]);

  const accountList = useMemo(() => {
    return accounts.filter(filterAccount(chainInfoMap, allNominatorInfo, rewardList, stakingType, stakingChain));
  }, [accounts, allNominatorInfo, chainInfoMap, rewardList, stakingChain, stakingType]);

  return (
    <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
      <>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          {isAllAccount && (
            <AccountSelector
              items={accountList}
              selectedValueMap={{ [from]: true }}
              onSelectItem={item => {
                onChangeFromValue(item.address);
                accountSelectorRef && accountSelectorRef.current?.onCloseModal();
              }}
              disabled={loading}
              renderSelected={() => <AccountSelectField accountName={accountInfo?.name || ''} value={from} showIcon />}
              accountSelectorRef={accountSelectorRef}
            />
          )}

          <FreeBalance label={`${i18n.inputLabel.availableBalance}:`} address={from} chain={chain} />

          <MetaInfo hasBackgroundWrapper>
            <MetaInfo.Chain chain={chain} label={i18n.inputLabel.network} />

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
                onChangeValue('bondReward')('1');
              } else {
                onChangeValue('bondReward')('');
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
  );
};

export default ClaimReward;
