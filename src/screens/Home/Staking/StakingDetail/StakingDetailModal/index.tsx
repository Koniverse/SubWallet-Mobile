import React, { useCallback, useState } from 'react';
import {
  ChainStakingMetadata,
  NominationInfo,
  NominatorMetadata,
  StakingItem,
  StakingRewardItem,
  StakingStatus,
  StakingType,
  UnstakingInfo,
  UnstakingStatus,
} from '@subwallet/extension-base/background/KoniTypes';
import { isShowNominationByValidator } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { _STAKING_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import usePreCheckReadOnly from 'hooks/usePreCheckReadOnly';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import {
  _getChainNativeTokenBasicInfo,
  _getChainSubstrateAddressPrefix,
} from '@subwallet/extension-base/services/chain-service/utils';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { ALL_KEY, deviceHeight, HIDE_MODAL_DURATION } from 'constants/index';
import { useNavigation } from '@react-navigation/native';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import MetaInfo from 'components/MetaInfo';
import { toShort } from 'utils/index';
import { getUnstakingPeriod, getWaitingTime } from 'screens/Transaction/helper/staking';
import { ScrollView, TouchableHighlight, View } from 'react-native';
import { Avatar, Button, Icon, Number, SwModal, Typography } from 'components/design-system-ui';
import { ArrowCircleUpRight, DotsThree } from 'phosphor-react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { FontMedium } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { isAccountAll } from 'utils/accountAll';
import { RootNavigationProps } from 'routes/index';

interface Props {
  nominatorMetadata: NominatorMetadata;
  chainStakingMetadata: ChainStakingMetadata;
  staking: StakingItem;
  rewardItem?: StakingRewardItem;
  onCloseDetailModal?: () => void;
  onOpenMoreActionModal?: () => void;
  modalVisible: boolean;
}

export const getUnstakingInfo = (unstakings: UnstakingInfo[], address: string) => {
  return unstakings.find(item => item.validatorAddress === address);
};

const renderAccountItemLabel = (theme: ThemeTypes, address: string, name?: string) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}>
      <View style={{ flexDirection: 'row' }}>
        <Avatar value={address} size={24} />
        <Typography.Text
          ellipsis
          style={{
            fontSize: theme.fontSize,
            lineHeight: theme.fontSize * theme.lineHeight,
            color: theme.colorWhite,
            ...FontMedium,
            marginLeft: 8,
          }}>
          {name || toShort(address)}
        </Typography.Text>
      </View>
    </View>
  );
};

export const StakingDetailModal = ({
  modalVisible,
  chainStakingMetadata,
  nominatorMetadata,
  rewardItem,
  staking,
  onCloseDetailModal,
  onOpenMoreActionModal,
}: Props) => {
  const { expectedReturn, minPoolBonding, minStake, unstakingPeriod } = chainStakingMetadata;
  const { activeStake, address, chain, nominations, type, unstakings } = nominatorMetadata;
  const showingOption = isShowNominationByValidator(chain);
  const isRelayChain = _STAKING_CHAIN_GROUP.relay.includes(chain);
  const modalTitle = type === StakingType.NOMINATED.valueOf() ? 'Nomination details' : 'Pooled details';
  const theme = useSubWalletTheme().swThemes;
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);
  const onClickFooterButton = usePreCheckReadOnly(currentAccount?.address);
  const chainInfo = useFetchChainInfo(staking.chain);
  const { decimals } = _getChainNativeTokenBasicInfo(chainInfo);
  const networkPrefix = _getChainSubstrateAddressPrefix(chainInfo);
  const account = useGetAccountByAddress(staking.address);
  const navigation = useNavigation<RootNavigationProps>();
  const stakingTypeNameMap: Record<string, string> = {
    nominated: 'Nominated',
    pooled: 'Pooled',
  };

  const onClickStakeMoreBtn = useCallback(() => {
    onCloseDetailModal && onCloseDetailModal();
    setTimeout(() => {
      navigation.navigate('TransactionAction', {
        screen: 'Stake',
        params: {
          type: chainStakingMetadata?.type || ALL_KEY,
          chain: nominatorMetadata?.chain || ALL_KEY,
        },
      });
    }, 300);
  }, [chainStakingMetadata?.type, navigation, nominatorMetadata?.chain, onCloseDetailModal]);

  const onClickUnstakeBtn = useCallback(() => {
    onCloseDetailModal && onCloseDetailModal();
    setTimeout(
      () =>
        navigation.navigate('TransactionAction', {
          screen: 'Unbond',
          params: {
            type: chainStakingMetadata?.type || ALL_KEY,
            chain: chainStakingMetadata?.chain || ALL_KEY,
          },
        }),
      300,
    );
  }, [chainStakingMetadata?.chain, chainStakingMetadata?.type, navigation, onCloseDetailModal]);

  const onClickMoreAction = useCallback(() => {
    onCloseDetailModal && onCloseDetailModal();
    setTimeout(() => {
      onOpenMoreActionModal && onOpenMoreActionModal();
    }, HIDE_MODAL_DURATION);
  }, [onCloseDetailModal, onOpenMoreActionModal]);

  const onClickSeeMoreBtn = useCallback(() => {
    setSeeMore(true);
  }, []);

  const getStakingStatus = useCallback((status: StakingStatus) => {
    if (status === StakingStatus.EARNING_REWARD) {
      return StakingStatusUi.active;
    }

    if (status === StakingStatus.PARTIALLY_EARNING) {
      return StakingStatusUi.partialEarning;
    }

    if (status === StakingStatus.WAITING) {
      return StakingStatusUi.waiting;
    }

    return StakingStatusUi.inactive;
  }, []);

  const _onCloseDetailModal = useCallback(() => {
    setSeeMore(false);
    onCloseDetailModal && onCloseDetailModal();
  }, [onCloseDetailModal]);

  const renderUnstakingInfo = useCallback(
    (item: NominationInfo, index: number) => {
      const unstakingData = getUnstakingInfo(unstakings, item.validatorAddress);

      return (
        <MetaInfo style={{ marginTop: 8 }} hasBackgroundWrapper spaceSize={'sm'}>
          <MetaInfo.Account
            address={item.validatorAddress}
            label={'Validator'}
            name={item.validatorIdentity || toShort(item.validatorAddress)}
            networkPrefix={networkPrefix}
          />

          <MetaInfo.Number
            decimals={decimals}
            key={`${item.validatorAddress}-${item.activeStake}-${
              item.validatorIdentity || item.validatorMinStake || item.chain
            }-${index}-active-stake`}
            label={'Active staked'}
            suffix={staking.nativeToken}
            value={item.activeStake || ''}
            valueColorSchema={'gray'}
          />

          <MetaInfo.Number
            decimals={decimals}
            key={`${item.validatorAddress}-${item.activeStake}-${
              item.validatorIdentity || item.validatorMinStake || item.chain
            }-${index}-min-stake`}
            label={'Min stake'}
            suffix={staking.nativeToken}
            value={item.validatorMinStake || '0'}
            valueColorSchema={'gray'}
          />

          {!!unstakingData && showingOption === 'showByValidator' && (
            <MetaInfo.Default
              label={'Unstaked'}
              labelAlign={unstakingData.status === UnstakingStatus.UNLOCKING.valueOf() ? 'top' : 'center'}>
              {() => (
                <View>
                  <Number decimal={decimals} suffix={staking.nativeToken} value={unstakingData.claimable} />

                  {unstakingData.status === UnstakingStatus.UNLOCKING.valueOf() && (
                    <Typography.Text>{getWaitingTime(unstakingData.waitingTime)}</Typography.Text>
                  )}
                </View>
              )}
            </MetaInfo.Default>
          )}

          <MetaInfo.Status
            label={'Staking status'}
            statusIcon={getStakingStatus(item.status).icon}
            statusName={getStakingStatus(item.status).name}
            valueColorSchema={getStakingStatus(item.status).schema}
          />
        </MetaInfo>
      );
    },
    [decimals, getStakingStatus, networkPrefix, showingOption, staking.nativeToken, unstakings],
  );

  const footer = () => {
    return (
      <View style={{ flexDirection: 'row', paddingTop: 16, paddingHorizontal: 16 }}>
        <Button
          style={{ marginRight: 6 }}
          type={'secondary'}
          onPress={onClickMoreAction}
          icon={<Icon phosphorIcon={DotsThree} size={'lg'} iconColor={theme.colorWhite} />}
        />
        <Button
          style={{ flex: 1, marginHorizontal: 6 }}
          type={'secondary'}
          onPress={onClickFooterButton(onClickUnstakeBtn)}>
          {'Unstake'}
        </Button>
        <Button style={{ flex: 1, marginLeft: 6 }} type={'primary'} onPress={onClickFooterButton(onClickStakeMoreBtn)}>
          {'Stake more'}
        </Button>
      </View>
    );
  };

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={modalTitle}
      onChangeModalVisible={_onCloseDetailModal}
      footer={footer()}
      modalStyle={{ maxHeight: '90%' }}>
      <View style={{ width: '100%' }}>
        <ScrollView style={{ maxHeight: deviceHeight * 0.6 }}>
          <TouchableHighlight style={{ width: '100%' }}>
            <>
              <MetaInfo>
                {isAccountAll(address) ? (
                  <MetaInfo.AccountGroup
                    label={'Account'}
                    content={address}
                    addresses={accounts.map(acc => acc.address)}
                  />
                ) : (
                  <MetaInfo.Account address={address} label={'Account'} name={account?.name} />
                )}

                <MetaInfo.DisplayType label={'Staking type'} typeName={stakingTypeNameMap[staking.type]} />

                <MetaInfo.Status
                  label={type === StakingType.NOMINATED ? 'Nomination status' : 'Pooled status'}
                  statusIcon={getStakingStatus(nominatorMetadata.status).icon}
                  statusName={getStakingStatus(nominatorMetadata.status).name}
                  valueColorSchema={getStakingStatus(nominatorMetadata.status).schema}
                />

                {!!rewardItem?.totalReward && parseFloat(rewardItem?.totalReward) > 0 && (
                  <MetaInfo.Number
                    decimals={decimals}
                    label={'Total reward'}
                    suffix={staking.nativeToken}
                    value={rewardItem?.totalReward || '0'}
                  />
                )}

                {!!rewardItem?.unclaimedReward && parseFloat(rewardItem?.unclaimedReward) > 0 && (
                  <MetaInfo.Number
                    decimals={decimals}
                    label={'Unclaimed reward'}
                    suffix={staking.nativeToken}
                    value={rewardItem?.unclaimedReward || '0'}
                  />
                )}

                <MetaInfo.Number
                  decimals={decimals}
                  label={'Total staked'}
                  suffix={staking.nativeToken}
                  value={String(parseFloat(activeStake) + parseFloat(staking.unlockingBalance || '0'))}
                />

                {
                  <MetaInfo.Number
                    decimals={decimals}
                    label={'Active staked'}
                    suffix={staking.nativeToken}
                    value={activeStake}
                  />
                }

                {
                  <MetaInfo.Number
                    decimals={decimals}
                    label={'Unstaked'}
                    suffix={staking.nativeToken}
                    value={staking.unlockingBalance || '0'}
                  />
                }

                <MetaInfo.Chain chain={staking.chain} label={'Network'} />
              </MetaInfo>

              {!seeMore && (
                <Button
                  block
                  icon={<Icon iconColor={theme.colorTextLight4} phosphorIcon={ArrowCircleUpRight} size={'sm'} />}
                  onPress={onClickSeeMoreBtn}
                  size={'xs'}
                  type={'ghost'}>
                  {'See more'}
                </Button>
              )}

              {seeMore && (
                <>
                  <MetaInfo style={{ marginTop: 8 }} hasBackgroundWrapper spaceSize={'xs'} valueColorScheme={'light'}>
                    {!!expectedReturn && (
                      <MetaInfo.Number
                        label={'Estimated earning'}
                        suffix={'%'}
                        value={expectedReturn}
                        valueColorSchema={'even-odd'}
                      />
                    )}

                    <MetaInfo.Number
                      decimals={decimals}
                      label={'Minimum active'}
                      suffix={staking.nativeToken}
                      value={nominatorMetadata.type === StakingType.NOMINATED ? minStake : minPoolBonding || '0'}
                      valueColorSchema={'gray'}
                    />

                    {!!unstakingPeriod && (
                      <MetaInfo.Default label={'Unstaking period'} valueColorSchema={'gray'}>
                        {getUnstakingPeriod(unstakingPeriod)}
                      </MetaInfo.Default>
                    )}
                  </MetaInfo>

                  {showingOption === 'showByValue' &&
                    nominations &&
                    nominations.length > 0 &&
                    currentAccount?.address !== ALL_ACCOUNT_KEY && (
                      <>
                        <MetaInfo style={{ marginTop: 8 }} valueColorScheme={'light'}>
                          <MetaInfo.Number
                            decimals={decimals}
                            label={'Active staked'}
                            suffix={staking.nativeToken}
                            value={activeStake}
                          />
                        </MetaInfo>
                        <MetaInfo
                          style={{ marginTop: 8 }}
                          hasBackgroundWrapper
                          spaceSize={'xs'}
                          valueColorScheme={'light'}>
                          <>
                            {nominations.map(item => {
                              if (isRelayChain && type === StakingType.NOMINATED) {
                                return (
                                  <MetaInfo.Default
                                    valueAlign={'left'}
                                    key={`${item.validatorAddress}-${item.activeStake}-${
                                      item.validatorIdentity || item.validatorMinStake || item.chain
                                    }`}
                                    label={() =>
                                      renderAccountItemLabel(theme, item.validatorAddress, item.validatorIdentity)
                                    }
                                  />
                                );
                              }

                              return (
                                <MetaInfo.Number
                                  decimals={decimals}
                                  key={`${item.validatorAddress}-${item.activeStake}-${
                                    item.validatorIdentity || item.validatorMinStake || item.chain
                                  }`}
                                  label={() =>
                                    renderAccountItemLabel(theme, item.validatorAddress, item.validatorIdentity)
                                  }
                                  suffix={staking.nativeToken}
                                  value={item.activeStake || ''}
                                  valueColorSchema={'gray'}
                                />
                              );
                            })}
                          </>
                        </MetaInfo>
                      </>
                    )}

                  {(showingOption === 'showByValue' || showingOption === 'mixed') &&
                    unstakings &&
                    unstakings.length > 0 &&
                    currentAccount?.address !== ALL_ACCOUNT_KEY && (
                      <>
                        <MetaInfo style={{ marginTop: 8 }} valueColorScheme={'light'}>
                          <MetaInfo.Number
                            decimals={decimals}
                            label={'Unstaked'}
                            suffix={staking.nativeToken}
                            value={staking.unlockingBalance || '0'}
                          />
                        </MetaInfo>
                        <MetaInfo
                          style={{ marginTop: 8 }}
                          hasBackgroundWrapper
                          spaceSize={'xs'}
                          valueColorScheme={'light'}>
                          <>
                            {unstakings.map((item, index) => (
                              <MetaInfo.Number
                                decimals={decimals}
                                key={`${item.validatorAddress || item.chain}-${item.status}-${item.claimable}-${index}`}
                                label={getWaitingTime(item.waitingTime) ? getWaitingTime(item.waitingTime) : 'Withdraw'}
                                suffix={staking.nativeToken}
                                value={item.claimable || ''}
                                valueColorSchema={'gray'}
                              />
                            ))}
                          </>
                        </MetaInfo>
                      </>
                    )}

                  {(showingOption === 'showByValidator' || showingOption === 'mixed') &&
                    nominations &&
                    nominations.length > 0 &&
                    currentAccount?.address !== ALL_ACCOUNT_KEY && (
                      <>
                        {nominations &&
                          nominations.length &&
                          nominations.map((item, index) => renderUnstakingInfo(item, index))}
                      </>
                    )}
                </>
              )}
            </>
          </TouchableHighlight>
        </ScrollView>
      </View>
    </SwModal>
  );
};
