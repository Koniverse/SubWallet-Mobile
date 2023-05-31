import React, { useCallback, useRef, useState } from 'react';
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
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import {
  _getChainNativeTokenBasicInfo,
  _getChainSubstrateAddressPrefix,
} from '@subwallet/extension-base/services/chain-service/utils';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { ALL_KEY, deviceHeight, HIDE_MODAL_DURATION, TOAST_DURATION } from 'constants/index';
import { useNavigation } from '@react-navigation/native';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import MetaInfo from 'components/MetaInfo';
import { toShort } from 'utils/index';
import { getUnstakingPeriod, getWaitingTime } from 'screens/Transaction/helper/staking';
import { ScrollView, TouchableHighlight, View } from 'react-native';
import { Avatar, Button, Icon, Number, SwModal, Typography } from 'components/design-system-ui';
import { ArrowCircleUpRight, DotsThree } from 'phosphor-react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { FontMedium, MarginBottomForSubmitButton, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { isAccountAll } from 'utils/accountAll';
import { RootNavigationProps } from 'routes/index';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';

interface Props {
  nominatorMetadata?: NominatorMetadata;
  chainStakingMetadata?: ChainStakingMetadata;
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
            maxWidth: 180,
          }}>
          {name || toShort(address, 8, 8)}
        </Typography.Text>
      </View>
    </View>
  );
};

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 220;

export const StakingDetailModal = ({
  modalVisible,
  chainStakingMetadata,
  nominatorMetadata,
  rewardItem,
  staking,
  onCloseDetailModal,
  onOpenMoreActionModal,
}: Props) => {
  const showingOption = isShowNominationByValidator(nominatorMetadata?.chain || '');
  const isRelayChain = _STAKING_CHAIN_GROUP.relay.includes(nominatorMetadata?.chain || '');
  const modalTitle =
    nominatorMetadata?.type === StakingType.NOMINATED.valueOf() ? 'Nomination details' : 'Pooled details';
  const theme = useSubWalletTheme().swThemes;
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const { accounts, currentAccount } = useSelector((state: RootState) => state.accountState);
  const toastRef = useRef<ToastContainer>(null);
  const onClickFooterButton = usePreCheckReadOnly(toastRef, currentAccount?.address);
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
      const unstakingData = getUnstakingInfo(nominatorMetadata?.unstakings || [], item.validatorAddress);

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
                <View style={{ alignItems: 'flex-end' }}>
                  <Number
                    size={14}
                    intColor={theme.colorTextTertiary}
                    decimalColor={theme.colorTextTertiary}
                    unitColor={theme.colorTextTertiary}
                    decimal={decimals}
                    suffix={staking.nativeToken}
                    value={unstakingData.claimable}
                  />

                  {unstakingData.status === UnstakingStatus.UNLOCKING.valueOf() && (
                    <Typography.Text
                      style={{
                        fontSize: theme.fontSizeSM,
                        lineHeight: theme.fontSizeSM * theme.lineHeightSM,
                        color: theme.colorTextTertiary,
                        ...FontMedium,
                      }}>
                      {getWaitingTime(unstakingData.waitingTime)}
                    </Typography.Text>
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
    [
      decimals,
      getStakingStatus,
      networkPrefix,
      nominatorMetadata?.unstakings,
      showingOption,
      staking.nativeToken,
      theme.colorTextTertiary,
      theme.fontSizeSM,
      theme.lineHeightSM,
    ],
  );

  const footer = () => {
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
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
        <ScrollView
          style={{ maxHeight: deviceHeight * 0.6 }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <TouchableHighlight style={{ width: '100%' }}>
            <>
              <MetaInfo>
                {isAccountAll(nominatorMetadata?.address || '') ? (
                  <MetaInfo.AccountGroup
                    label={'Account'}
                    content={nominatorMetadata?.address || ''}
                    addresses={accounts.map(acc => acc.address)}
                  />
                ) : (
                  <MetaInfo.Account address={nominatorMetadata?.address || ''} label={'Account'} name={account?.name} />
                )}

                <MetaInfo.DisplayType label={'Staking type'} typeName={stakingTypeNameMap[staking.type]} />

                <MetaInfo.Status
                  label={nominatorMetadata?.type === StakingType.NOMINATED ? 'Nomination status' : 'Pooled status'}
                  loading={!nominatorMetadata}
                  statusIcon={nominatorMetadata && getStakingStatus(nominatorMetadata.status).icon}
                  statusName={nominatorMetadata && getStakingStatus(nominatorMetadata.status).name}
                  valueColorSchema={nominatorMetadata ? getStakingStatus(nominatorMetadata.status).schema : 'light'}
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
                  loading={!nominatorMetadata}
                  suffix={staking.nativeToken}
                  value={String(
                    parseFloat(nominatorMetadata?.activeStake || '') + parseFloat(staking.unlockingBalance || '0'),
                  )}
                />

                {
                  <MetaInfo.Number
                    decimals={decimals}
                    loading={!nominatorMetadata}
                    label={'Active staked'}
                    suffix={staking.nativeToken}
                    value={nominatorMetadata?.activeStake || ''}
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
                    {chainStakingMetadata?.expectedReturn && (
                      <MetaInfo.Number
                        label={'Estimated annual earnings'}
                        suffix={'%'}
                        value={chainStakingMetadata?.expectedReturn || ''}
                        valueColorSchema={'even-odd'}
                      />
                    )}

                    <MetaInfo.Number
                      decimals={decimals}
                      loading={!nominatorMetadata || !chainStakingMetadata}
                      label={'Minimum active'}
                      suffix={staking.nativeToken}
                      value={
                        (nominatorMetadata?.type === StakingType.NOMINATED
                          ? chainStakingMetadata?.minStake
                          : chainStakingMetadata?.minJoinNominationPool) || '0'
                      }
                      valueColorSchema={'gray'}
                    />

                    {!!chainStakingMetadata?.unstakingPeriod && (
                      <MetaInfo.Default
                        label={'Unstaking period'}
                        valueColorSchema={'gray'}
                        loading={!chainStakingMetadata}>
                        {getUnstakingPeriod(chainStakingMetadata?.unstakingPeriod)}
                      </MetaInfo.Default>
                    )}
                  </MetaInfo>

                  {showingOption === 'showByValue' &&
                    nominatorMetadata?.nominations &&
                    nominatorMetadata?.nominations.length > 0 &&
                    currentAccount?.address !== ALL_ACCOUNT_KEY && (
                      <>
                        <MetaInfo style={{ marginTop: 8 }} valueColorScheme={'light'}>
                          <MetaInfo.Number
                            decimals={decimals}
                            label={'Active staked'}
                            suffix={staking.nativeToken}
                            value={nominatorMetadata?.activeStake}
                          />
                        </MetaInfo>
                        <MetaInfo
                          style={{ marginTop: 8 }}
                          hasBackgroundWrapper
                          spaceSize={'xs'}
                          valueColorScheme={'light'}>
                          <>
                            {nominatorMetadata?.nominations.map(item => {
                              if (isRelayChain && nominatorMetadata?.type === StakingType.NOMINATED) {
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
                    nominatorMetadata?.unstakings &&
                    nominatorMetadata?.unstakings.length > 0 &&
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
                            {nominatorMetadata?.unstakings.map((item, index) => (
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
                    nominatorMetadata?.nominations &&
                    nominatorMetadata?.nominations.length > 0 &&
                    currentAccount?.address !== ALL_ACCOUNT_KEY && (
                      <>{nominatorMetadata.nominations.map((item, index) => renderUnstakingInfo(item, index))}</>
                    )}
                </>
              )}
            </>
          </TouchableHighlight>
        </ScrollView>

        <Toast
          textStyle={{ textAlign: 'center' }}
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={OFFSET_BOTTOM}
        />
      </View>
    </SwModal>
  );
};
