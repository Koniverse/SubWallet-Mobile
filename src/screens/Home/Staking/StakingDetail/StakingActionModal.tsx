import { useNavigation } from '@react-navigation/native';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { StakingDataType } from 'hooks/types';
import moment from 'moment';
import { Gift, IconProps, Intersect, Money, SelectionSlash } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { noop } from 'utils/function';
import i18n from 'utils/i18n/i18n';

interface Props {
  visible: boolean;
  closeModal: () => void;
  data: StakingDataType;
}

interface SortItem {
  icon: (iconProps: IconProps) => JSX.Element;
  key: string;
  label: string;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
}

const TitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginBottom: 26,
};

const ItemContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  width: '100%',
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const getLabelTextStyle = (disabled?: boolean): StyleProp<any> => {
  return {
    ...sharedStyles.mediumText,
    ...FontSemiBold,
    color: disabled ? ColorMap.disabled : ColorMap.light,
    marginLeft: 16,
  };
};

const MANUAL_CLAIM_CHAINS = ['astar', 'shibuya', 'shiden'];

const MANUAL_COMPOUND_CHAINS = ['turing', 'turingStaging'];

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;

const StakingActionModal = ({ closeModal, visible, data }: Props) => {
  const {
    staking: { chain: networkKey, activeBalance, unlockingInfo, unlockingBalance, type: stakingType },
    reward,
  } = data;
  const toastRef = useRef<ToastContainer>(null);
  const navigation = useNavigation<RootNavigationProps>();

  const isPool = stakingType === StakingType.POOLED;

  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const networkJson = useGetNetworkJson(networkKey);

  const bondedAmount = useMemo((): number => parseFloat(activeBalance || '0'), [activeBalance]);
  const redeemable = useMemo((): number => unlockingInfo?.redeemable || 0, [unlockingInfo?.redeemable]);
  const nextWithdrawalAmount = useMemo(
    (): number => unlockingInfo?.nextWithdrawalAmount || 0,
    [unlockingInfo?.nextWithdrawalAmount],
  );
  const nextWithdrawal = useMemo((): number => unlockingInfo?.nextWithdrawal || 0, [unlockingInfo?.nextWithdrawal]);
  const nextWithdrawalAction = useMemo(
    (): string => unlockingInfo?.nextWithdrawalAction || '',
    [unlockingInfo?.nextWithdrawalAction],
  );
  const validatorAddress = useMemo(
    (): string => unlockingInfo?.validatorAddress || '',
    [unlockingInfo?.validatorAddress],
  );

  const showClaimButton = useMemo((): boolean => MANUAL_CLAIM_CHAINS.includes(networkKey), [networkKey]);
  const showCompoundButton = useMemo((): boolean => MANUAL_COMPOUND_CHAINS.includes(networkKey), [networkKey]);

  const withdrawNote = useMemo((): string => {
    if (nextWithdrawalAmount < 0) {
      return 'Loading...';
    }

    if (redeemable > 0) {
      return `${redeemable} ${networkJson.nativeToken as string} can be withdrawn now`;
    } else {
      if (nextWithdrawal === 0 || nextWithdrawalAmount === 0) {
        return `${nextWithdrawalAmount} ${networkJson.nativeToken as string} can be withdrawn soon`;
      }

      return `${nextWithdrawalAmount} ${networkJson.nativeToken as string} can be withdrawn in ${moment
        .duration(nextWithdrawal, 'hours')
        .humanize()}`;
    }
  }, [networkJson.nativeToken, nextWithdrawal, nextWithdrawalAmount, redeemable]);

  const unStakeAction = useCallback(() => {
    closeModal();
    navigation.navigate('UnStakeAction', {
      screen: 'UnStakeConfirm',
      params: {
        selectedAccount: currentAccountAddress,
        networkKey: networkKey,
        bondedAmount: parseFloat(activeBalance || '0'),
      },
    });
  }, [activeBalance, closeModal, currentAccountAddress, networkKey, navigation]);

  const withdrawAction = useCallback(() => {
    if (redeemable > 0) {
      closeModal();
      navigation.navigate('WithdrawStakeAction', {
        screen: 'WithdrawAuth',
        params: {
          selectedAccount: currentAccountAddress,
          networkKey: networkKey,
          nextWithdrawalAction: nextWithdrawalAction,
          withdrawAmount: redeemable,
          targetValidator: validatorAddress,
        },
      });
    } else if (unlockingBalance && parseFloat(unlockingBalance) !== 0) {
      if (toastRef.current) {
        toastRef.current.hideAll();
        toastRef.current.show(withdrawNote);
      }
    }
  }, [
    redeemable,
    unlockingBalance,
    closeModal,
    navigation,
    currentAccountAddress,
    networkKey,
    nextWithdrawalAction,
    validatorAddress,
    withdrawNote,
  ]);

  const claimAction = useCallback(() => {
    closeModal();
    navigation.navigate('ClaimStakeAction', {
      screen: 'ClaimAuth',
      params: {
        networkKey: networkKey,
        selectedAccount: currentAccountAddress,
        stakingType: stakingType,
      },
    });
  }, [closeModal, navigation, networkKey, currentAccountAddress, stakingType]);

  const compoundAction = useCallback(() => {
    if (bondedAmount > 0) {
      closeModal();
      navigation.navigate('CompoundStakeAction', {
        screen: 'CompoundConfirm',
        params: {
          selectedAccount: currentAccountAddress,
          networkKey: networkKey,
        },
      });
    }
  }, [closeModal, currentAccountAddress, navigation, networkKey, bondedAmount]);

  const items = useMemo((): SortItem[] => {
    const result: SortItem[] = [];
    if (!isPool) {
      result.push(
        ...[
          {
            label: i18n.stakingScreen.stakingDetail.actions.unStake,
            key: 'unStake',
            icon: SelectionSlash,
            onPress: bondedAmount > 0 ? unStakeAction : noop,
          },
          {
            label: i18n.stakingScreen.stakingDetail.actions.withdraw,
            key: 'withdraw',
            icon: Money,
            onPress: withdrawAction,
            color: nextWithdrawal > 0 && parseFloat(unlockingBalance || '0') > 0 ? ColorMap.primary : ColorMap.disabled,
          },
        ],
      );
    }

    if (showClaimButton || isPool) {
      result.push({
        label: i18n.stakingScreen.stakingDetail.actions.claim,
        key: 'claim',
        icon: Gift,
        onPress: bondedAmount > 0 ? claimAction : undefined,
        disabled: reward?.unclaimedReward === '0',
      });
    }

    if (showCompoundButton && !isPool) {
      result.push({
        label: i18n.stakingScreen.stakingDetail.actions.compound,
        key: 'compound',
        icon: Intersect,
        onPress: compoundAction,
      });
    }

    return result;
  }, [
    bondedAmount,
    claimAction,
    compoundAction,
    isPool,
    nextWithdrawal,
    reward?.unclaimedReward,
    showClaimButton,
    showCompoundButton,
    unStakeAction,
    unlockingBalance,
    withdrawAction,
  ]);

  return (
    <SubWalletModal modalVisible={visible} onChangeModalVisible={closeModal}>
      <Text style={TitleTextStyle}>{i18n.common.chooseAction}</Text>
      {items.map(({ icon: Icon, onPress, key, label, color, disabled }) => {
        return (
          <TouchableOpacity
            style={ItemContainerStyle}
            key={key}
            activeOpacity={0.5}
            onPress={onPress}
            disabled={disabled}>
            <Icon size={20} color={color || ColorMap.disabled} />
            <Text style={getLabelTextStyle(disabled)}>{label}</Text>
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
      />
    </SubWalletModal>
  );
};

export default React.memo(StakingActionModal);
