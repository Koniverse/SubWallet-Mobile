import { useNavigation } from '@react-navigation/native';
import {
  ChainStakingMetadata,
  NominatorMetadata,
  StakingItem,
  StakingRewardItem,
} from '@subwallet/extension-base/background/KoniTypes';
import { ALL_KEY, deviceHeight, TOAST_DURATION } from 'constants/index';
import { ArrowArcLeft, ArrowCircleDown, IconProps, MinusCircle, PlusCircle, Wallet } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';
import { FontSemiBold, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import {
  getStakingAvailableActionsByChain,
  getStakingAvailableActionsByNominator,
  StakingAction,
} from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import { RootNavigationProps } from 'routes/index';
import { ActivityIndicator, BackgroundIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import usePreCheckReadOnly from 'hooks/account/usePreCheckReadOnly';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';
import { CustomToast } from 'components/design-system-ui/toast';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  visible: boolean;
  openModal: () => void;
  staking?: StakingItem;
  reward?: StakingRewardItem;
  chainStakingMetadata?: ChainStakingMetadata;
  nominatorMetadata?: NominatorMetadata;
  setModalVisible: (arg: boolean) => void;
  stakingDetailModalRef: React.RefObject<SWModalRefProps>;
}

type ActionListType = {
  backgroundIconColor: string;
  icon: (iconProps: IconProps) => JSX.Element;
  label: string;
  action: StakingAction;
  onPress: () => void;
};

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;

const StakingActionModal = (props: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { chainStakingMetadata, nominatorMetadata, visible, reward, setModalVisible, stakingDetailModalRef } = props;
  const toastRef = useRef<ToastContainer>(null);
  const navigation = useNavigation<RootNavigationProps>();
  const [selected, setSelected] = useState<StakingAction | undefined>();
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const onClickButton = usePreCheckReadOnly(toastRef, currentAccount?.address);
  const modalRef = useRef<SWModalRefProps>(null);

  const closeModal = useCallback(() => modalRef?.current?.close(), []);
  const unStakeAction = useCallback(() => {
    stakingDetailModalRef?.current?.close();
    closeModal();
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'Unbond',
        params: {
          type: chainStakingMetadata?.type || ALL_KEY,
          chain: chainStakingMetadata?.chain || ALL_KEY,
        },
      },
    });
  }, [chainStakingMetadata?.chain, chainStakingMetadata?.type, closeModal, navigation, stakingDetailModalRef]);

  const stakeAction = useCallback(() => {
    stakingDetailModalRef?.current?.close();
    closeModal();
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
  }, [chainStakingMetadata?.type, closeModal, navigation, nominatorMetadata?.chain, stakingDetailModalRef]);

  const handleWithdrawalAction = useCallback(() => {
    if (!nominatorMetadata) {
      setSelected(undefined);

      return;
    }
    stakingDetailModalRef?.current?.close();
    closeModal();

    setSelected(undefined);
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'Withdraw',
        params: {
          type: chainStakingMetadata?.type || ALL_KEY,
          chain: chainStakingMetadata?.chain || ALL_KEY,
        },
      },
    });
  }, [
    nominatorMetadata,
    stakingDetailModalRef,
    closeModal,
    navigation,
    chainStakingMetadata?.type,
    chainStakingMetadata?.chain,
  ]);

  const cancelUnstakeAction = useCallback(() => {
    stakingDetailModalRef?.current?.close();
    closeModal();
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'CancelUnstake',
        params: {
          type: chainStakingMetadata?.type || ALL_KEY,
          chain: chainStakingMetadata?.chain || ALL_KEY,
        },
      },
    });
  }, [chainStakingMetadata?.chain, chainStakingMetadata?.type, closeModal, navigation, stakingDetailModalRef]);

  const handleClaimRewardAction = useCallback(() => {
    if (!nominatorMetadata) {
      setSelected(undefined);

      return;
    }

    setSelected(undefined);
    stakingDetailModalRef?.current?.close();
    closeModal();
    navigation.navigate('Drawer', {
      screen: 'TransactionAction',
      params: {
        screen: 'ClaimReward',
        params: {
          type: chainStakingMetadata?.type || ALL_KEY,
          chain: chainStakingMetadata?.chain || ALL_KEY,
        },
      },
    });
  }, [
    nominatorMetadata,
    stakingDetailModalRef,
    closeModal,
    navigation,
    chainStakingMetadata?.type,
    chainStakingMetadata?.chain,
  ]);

  const availableActions = useMemo(() => {
    if (!nominatorMetadata) {
      return [];
    }
    // @ts-ignore
    return getStakingAvailableActionsByNominator(nominatorMetadata, reward?.unclaimedReward);
  }, [nominatorMetadata, reward?.unclaimedReward]);

  const actionList: ActionListType[] = useMemo(() => {
    if (!chainStakingMetadata) {
      return [];
    }

    const actionListByChain = getStakingAvailableActionsByChain(chainStakingMetadata.chain, chainStakingMetadata.type);

    return actionListByChain.map(action => {
      if (action === StakingAction.UNSTAKE) {
        return {
          action: StakingAction.UNSTAKE,
          backgroundIconColor: 'magenta-6',
          icon: MinusCircle,
          label: i18n.buttonTitles.unstake,
          onPress: unStakeAction,
        };
      } else if (action === StakingAction.WITHDRAW) {
        return {
          action: StakingAction.WITHDRAW,
          backgroundIconColor: 'geekblue-6',
          icon: ArrowCircleDown,
          label: i18n.buttonTitles.withDrawUnstakedFunds,
          onPress: handleWithdrawalAction,
        };
      } else if (action === StakingAction.CLAIM_REWARD) {
        return {
          action: StakingAction.CLAIM_REWARD,
          backgroundIconColor: 'green-7',
          icon: Wallet,
          label: i18n.buttonTitles.claimRewards,
          onPress: handleClaimRewardAction,
        };
      } else if (action === StakingAction.CANCEL_UNSTAKE) {
        return {
          action: StakingAction.CANCEL_UNSTAKE,
          backgroundIconColor: 'purple-8',
          icon: ArrowArcLeft,
          label: i18n.buttonTitles.cancelUnstaking,
          onPress: cancelUnstakeAction,
        };
      }

      return {
        action: StakingAction.STAKE,
        backgroundIconColor: 'green-6',
        icon: PlusCircle,
        label: i18n.buttonTitles.stakeMore,
        onPress: stakeAction,
      };
    });
  }, [
    cancelUnstakeAction,
    chainStakingMetadata,
    handleClaimRewardAction,
    handleWithdrawalAction,
    stakeAction,
    unStakeAction,
  ]);

  return (
    <SwModal
      isUseModalV2
      level={2}
      modalBaseV2Ref={modalRef}
      setVisible={setModalVisible}
      modalVisible={visible}
      modalTitle={i18n.header.actions}
      onBackButtonPress={closeModal}>
      {actionList.map(item => {
        const actionDisable = !availableActions.includes(item.action);
        const hasAnAction = !!selected;
        const isSelected = item.action === selected;
        const anotherDisable = hasAnAction && !isSelected;
        const disabled = actionDisable || anotherDisable;
        return (
          <TouchableOpacity
            style={[
              {
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: theme.colorBgSecondary,
                borderRadius: theme.borderRadiusLG,
                marginBottom: 8,
              },
              disabled && { opacity: 0.4 },
            ]}
            key={item.label}
            activeOpacity={0.5}
            onPress={onClickButton(item.onPress)}
            disabled={disabled}>
            <BackgroundIcon
              shape={'circle'}
              phosphorIcon={item.icon}
              size={'sm'}
              weight={'fill'}
              backgroundColor={theme[item.backgroundIconColor]}
            />
            <Typography.Text
              style={{
                fontSize: theme.fontSizeLG,
                lineHeight: theme.fontSizeLG * theme.lineHeightLG,
                color: theme.colorWhite,
                paddingLeft: 12,
                ...FontSemiBold,
              }}>
              {item.label}
            </Typography.Text>
            {isSelected && <ActivityIndicator size={20} indicatorColor={theme.colorWhite} />}
          </TouchableOpacity>
        );
      })}
      <Toast
        textStyle={{ textAlign: 'center' }}
        duration={TOAST_DURATION}
        normalColor={ColorMap.notification}
        ref={toastRef}
        placement={'bottom'}
        offsetBottom={OFFSET_BOTTOM}
        renderToast={toast => <CustomToast toast={toast} />}
      />
    </SwModal>
  );
};

export default React.memo(StakingActionModal);
