import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { View } from 'react-native';
import { ToggleItem } from 'components/ToggleItem';
import { BellSimpleRinging } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { NotificationSetup } from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { saveNotificationSetup } from 'messaging/settings';
import { Button, Typography } from 'components/design-system-ui';
import InputCheckBox from 'components/Input/InputCheckBox';

interface ShowNoticeOption {
  label: string;
  value: keyof NotificationSetup['showNotice'];
}

const CAN_NOT_CHANGE_SETTING: Array<keyof NotificationSetup['showNotice']> = [
  'earningClaim',
  'earningWithdraw',
  'availBridgeClaim',
  'polygonBridgeClaim',
];

export const NotificationSetting = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { notificationSetup } = useSelector((state: RootState) => state.settings);
  const [currentNotificationSetting, setCurrentNotificationSetting] = useState<NotificationSetup>(notificationSetup);
  const [loadingNotification, setLoadingNotification] = useState(false);

  const notificationOptions = useMemo((): ShowNoticeOption[] => {
    return [
      {
        label: 'Claim tokens',
        value: 'earningClaim',
      },
      {
        label: 'Withdraw tokens',
        value: 'earningWithdraw',
      },
      {
        label: 'Claim AVAIL bridge',
        value: 'availBridgeClaim',
      },
      {
        label: 'Claim POLYGON bridge',
        value: 'polygonBridgeClaim',
      },
    ];
  }, []);

  const onSaveNotificationSetup = useCallback(
    (setup: NotificationSetup) => {
      return () => {
        setLoadingNotification(true);
        saveNotificationSetup(setup)
          .catch(console.error)
          .finally(() => {
            setLoadingNotification(false);
            navigation.goBack();
          });
      };
    },
    [navigation],
  );

  const onChangeNotificationDetailSetting = useCallback((currentOption: ShowNoticeOption) => {
    return () => {
      setCurrentNotificationSetting((old): NotificationSetup => {
        return {
          isEnabled: old.isEnabled,
          showNotice: {
            ...old.showNotice,
            [currentOption.value]: !old.showNotice[currentOption.value],
          },
        };
      });
    };
  }, []);

  useEffect(() => {
    setCurrentNotificationSetting(notificationSetup);
  }, [notificationSetup]);

  const onSwitchNotification = useCallback(() => {
    setCurrentNotificationSetting((old): NotificationSetup => {
      return {
        isEnabled: !old.isEnabled,
        showNotice: old.showNotice,
      };
    });
  }, []);

  return (
    <SubScreenContainer
      title={'Notification settings'}
      navigation={navigation}
      onPressLeftBtn={() => navigation.goBack()}>
      <View style={{ ...sharedStyles.layoutContainer, paddingVertical: 16 }}>
        <View style={{ flex: 1 }}>
          <ToggleItem
            backgroundIcon={BellSimpleRinging}
            backgroundIconColor={theme['magenta-7']}
            style={{ marginBottom: 16 }}
            label={'Enable notification'}
            isEnabled={currentNotificationSetting.isEnabled}
            onValueChange={onSwitchNotification}
          />

          {currentNotificationSetting.isEnabled && (
            <View>
              <Typography.Text style={{ color: theme.colorWhite, ...FontSemiBold }}>
                {'Show notifications about:'}
              </Typography.Text>
              {notificationOptions.map((option, index) => (
                <InputCheckBox
                  key={index}
                  checked={currentNotificationSetting.showNotice[option.value]}
                  disable={CAN_NOT_CHANGE_SETTING.includes(option.value)}
                  label={option.label}
                  onPress={onChangeNotificationDetailSetting(option)}
                />
              ))}
            </View>
          )}
        </View>
        <Button
          loading={loadingNotification}
          disabled={loadingNotification}
          onPress={onSaveNotificationSetup(currentNotificationSetting)}>
          {'Save settings'}
        </Button>
      </View>
    </SubScreenContainer>
  );
};
