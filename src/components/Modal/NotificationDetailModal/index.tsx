import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useMemo, useState } from 'react';
import { NotificationInfoItem } from 'screens/Settings/Notifications/Notification';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { Checks, Coins, DownloadSimple, Eye, Gift, IconProps, X } from 'phosphor-react-native';
import { switchReadNotificationStatus } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { SwModal } from 'components/design-system-ui';
import { ActionSelectItem } from 'components/common/SelectModal/parts/ActionSelectItem';
import { View } from 'react-native';

interface Props {
  onCancel?: () => void;
  notificationItem: NotificationInfoItem;
  isTrigger: boolean;
  setTrigger: (value: boolean) => void;
  onPressAction: () => void;
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
}

export interface ActionInfo {
  title: string;
  extrinsicType: ExtrinsicType;
  backgroundColor: string;
  leftIcon?: React.ElementType<IconProps>;
  disabled?: boolean;
  isRead?: boolean;
}

export interface BriefActionInfo {
  icon: ActionInfo['leftIcon'];
  title: ActionInfo['title'];
  backgroundColor?: ActionInfo['backgroundColor'];
}

export const NotificationDetailModal = ({
  onCancel,
  notificationItem,
  isTrigger,
  setTrigger,
  onPressAction,
  modalVisible,
  setModalVisible,
}: Props) => {
  const [readNotification, setReadNotification] = useState<boolean>(notificationItem.isRead);
  const theme = useSubWalletTheme().swThemes;

  const _onCancel = useCallback(() => {
    setModalVisible(false);
    onCancel && onCancel();
  }, [onCancel, setModalVisible]);

  const getNotificationAction = (type: ExtrinsicType): BriefActionInfo => {
    switch (type) {
      case ExtrinsicType.STAKING_WITHDRAW:
        return {
          title: 'Withdraw tokens',
          icon: DownloadSimple,
        };
      case ExtrinsicType.STAKING_CLAIM_REWARD:
        return {
          title: 'Claim tokens',
          icon: Gift,
        };
      case ExtrinsicType.CLAIM_BRIDGE:
        return {
          title: 'Claim tokens',
          icon: Coins,
        };
      default:
        return {
          title: 'View details',
          icon: Eye,
        };
    }
  };

  const handleNotificationInfo = useMemo(() => {
    const { icon, title } = getNotificationAction(notificationItem.extrinsicType);
    const sampleData: ActionInfo = {
      title,
      extrinsicType: ExtrinsicType.TRANSFER_TOKEN, // todo: recheck to remove this
      backgroundColor: theme.geekblue,
      leftIcon: icon,
    };

    return sampleData;
  }, [notificationItem.extrinsicType, theme.geekblue]);

  const onPressReadButton = useCallback(() => {
    setReadNotification(!readNotification);
    switchReadNotificationStatus({
      id: notificationItem.id,
      isRead: notificationItem.isRead,
    })
      .catch(console.error)
      .finally(() => {
        _onCancel();
        setTrigger(!isTrigger);
      });
  }, [_onCancel, isTrigger, notificationItem, readNotification, setTrigger]);

  const _onPressAction = useCallback(() => {
    onPressAction();
    _onCancel();
  }, [_onCancel, onPressAction]);

  const items = useMemo(() => {
    return [
      {
        key: '1',
        backgroundColor: handleNotificationInfo.backgroundColor,
        icon: handleNotificationInfo.leftIcon,
        label: handleNotificationInfo.title,
        onPress: _onPressAction,
      },
      {
        key: '2',
        backgroundColor: readNotification ? theme['gray-3'] : theme['green-6'],
        icon: readNotification ? Checks : X,
        label: readNotification ? i18n.notification.markAsUnread : i18n.notification.markAsRead,
        onPress: onPressReadButton,
      },
    ];
  }, [
    _onPressAction,
    handleNotificationInfo.backgroundColor,
    handleNotificationInfo.leftIcon,
    handleNotificationInfo.title,
    onPressReadButton,
    readNotification,
    theme,
  ]);

  return (
    <SwModal
      modalVisible={modalVisible}
      setVisible={setModalVisible}
      isUseModalV2
      modalTitle={'Actions'}
      onChangeModalVisible={_onCancel}
      titleTextAlign={'center'}
      onBackdropPress={_onCancel}>
      <View style={{ gap: theme.sizeXS }}>
        {items.map((item, index) => (
          <ActionSelectItem key={index} item={item} onSelectItem={item.onPress} selectedValueMap={{}} />
        ))}
      </View>
    </SwModal>
  );
};
