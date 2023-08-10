import React, { useCallback, useRef, useState } from 'react';
import {
  APIItemState,
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
import { ALL_KEY, deviceHeight, TOAST_DURATION } from 'constants/index';
import { useNavigation } from '@react-navigation/native';
import { StakingStatusUi } from 'constants/stakingStatusUi';
import MetaInfo from 'components/MetaInfo';
import { toShort } from 'utils/index';
import { getUnstakingPeriod, getWaitingTime } from 'screens/Transaction/helper/staking';
import { ScrollView, TouchableHighlight, View } from 'react-native';
import { Avatar, Button, Icon, Number, SwModal, Typography } from 'components/design-system-ui';
import { ArrowCircleUpRight, DotsThree } from 'phosphor-react-native';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { isAccountAll } from 'utils/accountAll';
import { RootNavigationProps } from 'routes/index';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { CustomToast } from 'components/design-system-ui/toast';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import StakingActionModal from 'screens/Home/Staking/StakingDetail/StakingActionModal';

interface Props {
  nominatorMetadata?: NominatorMetadata;
  chainStakingMetadata?: ChainStakingMetadata;
  staking: StakingItem;
  rewardItem?: StakingRewardItem;
  modalVisible: boolean;
  setDetailModalVisible: (arg: boolean) => void;
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
  setDetailModalVisible,
}: Props) => {
  const [moreActionModalVisible, setMoreActionModalVisible] = useState<boolean>(false);
  const showingOption = isShowNominationByValidator(nominatorMetadata?.chain || '');
  const isRelayChain = _STAKING_CHAIN_GROUP.relay.includes(nominatorMetadata?.chain || '');
  const modalTitle =
    nominatorMetadata?.type === StakingType.NOMINATED.valueOf()
      ? i18n.header.nominationDetails
      : i18n.header.poolDetails;
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
    nominated: i18n.filterOptions.nominated,
    pooled: i18n.filterOptions.pooled,
  };
  const modalRef = useRef<SWModalRefProps>(null);

  const onCloseDetailModal = useCallback(() => modalRef?.current?.close(), []);

  const onClickStakeMoreBtn = useCallback(() => {
    onCloseDetailModal && onCloseDetailModal();
    setTimeout(() => {
      navigation.navigate('Drawer', {
        screen: 'TransactionAction',
        params: {
          screen: 'Stake',
          params: {
            type: chainStakingMetadata?.type || ALL_KEY,
            chain: nominatorMetadata?.chain || ALL_KEY,
          },
        },
      });
    }, 300);
  }, [chainStakingMetadata?.type, navigation, nominatorMetadata?.chain, onCloseDetailModal]);

  const onClickUnstakeBtn = useCallback(() => {
    onCloseDetailModal && onCloseDetailModal();
    setTimeout(
      () =>
        navigation.navigate('Drawer', {
          screen: 'TransactionAction',
          params: {
            screen: 'Unbond',
            params: {
              type: chainStakingMetadata?.type || ALL_KEY,
              chain: chainStakingMetadata?.chain || ALL_KEY,
            },
          },
        }),
      300,
    );
  }, [chainStakingMetadata?.chain, chainStakingMetadata?.type, navigation, onCloseDetailModal]);

  const onClickMoreAction = useCallback(() => {
    setMoreActionModalVisible(true);
  }, []);

  const onClickSeeMoreBtn = useCallback(() => {
    setSeeMore(true);
  }, []);

  const getStakingStatus = useCallback((status: StakingStatus) => {
    const stakingStatusUi = StakingStatusUi();
    if (status === StakingStatus.EARNING_REWARD) {
      return stakingStatusUi.active;
    }

    if (status === StakingStatus.PARTIALLY_EARNING) {
      return stakingStatusUi.partialEarning;
    }

    if (status === StakingStatus.WAITING) {
      return stakingStatusUi.waiting;
    }

    return stakingStatusUi.inactive;
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
            label={i18n.inputLabel.validator}
            name={item.validatorIdentity || toShort(item.validatorAddress)}
            networkPrefix={networkPrefix}
          />

          <MetaInfo.Number
            decimals={decimals}
            key={`${item.validatorAddress}-${item.activeStake}-${
              item.validatorIdentity || item.validatorMinStake || item.chain
            }-${index}-active-stake`}
            label={i18n.inputLabel.activeStaked}
            suffix={staking.nativeToken}
            value={item.activeStake || ''}
            valueColorSchema={'gray'}
          />

          <MetaInfo.Number
            decimals={decimals}
            key={`${item.validatorAddress}-${item.activeStake}-${
              item.validatorIdentity || item.validatorMinStake || item.chain
            }-${index}-min-stake`}
            label={i18n.inputLabel.minimumStaked}
            suffix={staking.nativeToken}
            value={item.validatorMinStake || '0'}
            valueColorSchema={'gray'}
          />

          {!!unstakingData && showingOption === 'showByValidator' && (
            <MetaInfo.Default
              label={i18n.inputLabel.unstaked}
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
                      {getWaitingTime(unstakingData.waitingTime, unstakingData.status)}
                    </Typography.Text>
                  )}
                </View>
              )}
            </MetaInfo.Default>
          )}

          <MetaInfo.Status
            label={i18n.inputLabel.stakingStatus}
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
      <View style={{ flexDirection: 'row', marginTop: theme.margin }}>
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
          {i18n.buttonTitles.unstake}
        </Button>
        <Button style={{ flex: 1, marginLeft: 6 }} type={'primary'} onPress={onClickFooterButton(onClickStakeMoreBtn)}>
          {i18n.buttonTitles.stakeMore}
        </Button>
      </View>
    );
  };

  return (
    <>
      <SwModal
        isUseModalV2
        setVisible={setDetailModalVisible}
        modalBaseV2Ref={modalRef}
        modalVisible={modalVisible}
        modalTitle={modalTitle}
        onChangeModalVisible={() => setSeeMore(false)}
        onBackButtonPress={_onCloseDetailModal}
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
                      label={i18n.inputLabel.account}
                      content={nominatorMetadata?.address === 'ALL' ? i18n.common.allAccounts : ''}
                      addresses={accounts.map(acc => acc.address)}
                    />
                  ) : (
                    <MetaInfo.Account
                      address={nominatorMetadata?.address || ''}
                      label={i18n.inputLabel.account}
                      name={account?.name}
                    />
                  )}

                  <MetaInfo.DisplayType
                    label={i18n.inputLabel.stakingType}
                    typeName={stakingTypeNameMap[staking.type]}
                  />

                  <MetaInfo.Status
                    label={i18n.inputLabel.stakingStatus}
                    loading={!nominatorMetadata}
                    statusIcon={nominatorMetadata && getStakingStatus(nominatorMetadata.status).icon}
                    statusName={nominatorMetadata && getStakingStatus(nominatorMetadata.status).name}
                    valueColorSchema={nominatorMetadata ? getStakingStatus(nominatorMetadata.status).schema : 'light'}
                  />

                  {!!rewardItem?.totalReward && parseFloat(rewardItem?.totalReward) > 0 && (
                    <MetaInfo.Number
                      decimals={decimals}
                      label={i18n.inputLabel.totalReward}
                      suffix={staking.nativeToken}
                      value={rewardItem?.totalReward || '0'}
                    />
                  )}

                  {staking.type === StakingType.POOLED && (
                    <MetaInfo.Number
                      decimals={decimals}
                      loading={!rewardItem || rewardItem.state !== APIItemState.READY}
                      label={i18n.inputLabel.unclaimedRewards}
                      suffix={staking.nativeToken}
                      value={rewardItem?.unclaimedReward || '0'}
                    />
                  )}

                  <MetaInfo.Number
                    decimals={decimals}
                    label={i18n.inputLabel.totalStaked}
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
                      label={i18n.inputLabel.activeStaked}
                      suffix={staking.nativeToken}
                      value={nominatorMetadata?.activeStake || ''}
                    />
                  }

                  {
                    <MetaInfo.Number
                      decimals={decimals}
                      label={i18n.inputLabel.unstaked}
                      suffix={staking.nativeToken}
                      value={staking.unlockingBalance || '0'}
                    />
                  }

                  <MetaInfo.Chain chain={staking.chain} label={i18n.inputLabel.network} />
                </MetaInfo>

                {!seeMore && (
                  <Button
                    block
                    icon={<Icon iconColor={theme.colorTextLight4} phosphorIcon={ArrowCircleUpRight} size={'sm'} />}
                    onPress={onClickSeeMoreBtn}
                    size={'xs'}
                    type={'ghost'}>
                    {i18n.buttonTitles.seeMore}
                  </Button>
                )}

                {seeMore && (
                  <>
                    <MetaInfo style={{ marginTop: 8 }} hasBackgroundWrapper spaceSize={'xs'} valueColorScheme={'light'}>
                      {chainStakingMetadata?.expectedReturn && (
                        <MetaInfo.Number
                          label={i18n.inputLabel.estimatedAnnualEarnings}
                          suffix={'%'}
                          value={chainStakingMetadata?.expectedReturn || ''}
                          valueColorSchema={'even-odd'}
                        />
                      )}

                      <MetaInfo.Number
                        decimals={decimals}
                        loading={!nominatorMetadata || !chainStakingMetadata}
                        label={i18n.inputLabel.minimumActive}
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
                          label={i18n.inputLabel.unstakingPeriod}
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
                              label={i18n.inputLabel.activeStaked}
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
                              label={i18n.inputLabel.unstaked}
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
                                  key={`${item.validatorAddress || item.chain}-${item.status}-${
                                    item.claimable
                                  }-${index}`}
                                  label={
                                    getWaitingTime(item.waitingTime, item.status)
                                      ? getWaitingTime(item.waitingTime, item.status)
                                      : 'Withdraw'
                                  }
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
            renderToast={toast => <CustomToast toast={toast} />}
          />
        </View>
      </SwModal>

      <StakingActionModal
        stakingDetailModalRef={modalRef}
        setModalVisible={setMoreActionModalVisible}
        openModal={() => setMoreActionModalVisible(true)}
        visible={moreActionModalVisible}
        chainStakingMetadata={chainStakingMetadata}
        nominatorMetadata={nominatorMetadata}
        staking={staking}
        reward={rewardItem}
      />
    </>
  );
};
