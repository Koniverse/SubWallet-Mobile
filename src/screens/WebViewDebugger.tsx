import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { sharedStyles } from 'styles/sharedStyles';
import { WebRunnerContext } from 'providers/contexts';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { devMode, getDevMode, mmkvStore } from 'utils/storage';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { Button } from 'components/design-system-ui';
import env from 'react-native-config';
import { ToggleItem } from 'components/ToggleItem';
import { Bug } from 'phosphor-react-native';
import {
  updateBannerHistoryData,
  updateConfirmationHistoryData,
  updatePopupHistoryData,
} from 'stores/base/StaticContent';
import { useDispatch } from 'react-redux';

const BUNDLE_ENV = env.BUNDLE_ENV;
export const WebViewDebugger = () => {
  const isDevMode = getDevMode();
  const navigation = useNavigation<RootNavigationProps>();
  const { webState, reload } = useContext(WebRunnerContext);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [notification, setNotification] = useState('');
  const themeColors = useSubWalletTheme().colors;
  const [lastBackup, setLastBackup] = useState('');
  const [lastRestore, setLastRestore] = useState('');
  const [lastMigration, setLastMigration] = useState('');
  const [devModeStatus, setDevModeStatus] = useState(false);

  const [showQr, setShowQr] = useState(false);
  const containerStyle = { marginBottom: 30 };
  const textStyle = { marginBottom: 10, color: themeColors.textColor };

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressReload = useCallback(() => {
    reload && reload();
  }, [reload]);

  const openQr = useCallback(async () => {
    setShowQr(true);
  }, []);

  const updateWebRunnerUrl = () => {
    let url = input?.trim();
    if (url) {
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }

      mmkvStore.set('__development_web_runner_url__', url);

      setNotification("OK, Let's restart app!");
    }
  };

  const useDefaultWebRunner = () => {
    setInput('');
    mmkvStore.delete('__development_web_runner_url__');

    setNotification("OK, Let's restart app!");
  };

  useEffect(() => {
    setDevModeStatus(isDevMode);

    const fetchData = () => {
      setLastBackup(mmkvStore.getString('webRunnerLastBackupTime') || '');
      setLastRestore(mmkvStore.getString('webRunnerLastRestoreTime') || '');
      setLastMigration(mmkvStore.getString('webRunnerLastMigrationTime') || '');
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onValueChange = (isOn: boolean) => {
    setDevModeStatus(prevState => !prevState);
    devMode(isOn);
    setNotification("OK, Let's restart app!");
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.settings.webViewDebugger}>
      <ScrollView style={{ ...sharedStyles.layoutContainer }}>
        <View style={containerStyle}>
          <Text style={textStyle}>{`${i18n.common.status}${webState.status}`}</Text>
          <Text style={textStyle}>{`${i18n.common.url}${webState.url}`}</Text>
          <Text style={textStyle}>{`${i18n.common.version}${webState.version}`}</Text>
          <Text style={textStyle}>{`${i18n.common.lastBackup}${lastBackup}`}</Text>
          <Text style={textStyle}>{`${i18n.common.lastRestore}${lastRestore}`}</Text>
          <Text style={textStyle}>{`${i18n.common.lastMigration}${lastMigration}`}</Text>
          <Text style={textStyle}>{`${i18n.common.bundleENV}${BUNDLE_ENV}`}</Text>
          <Button onPress={onPressReload}>{i18n.common.reloadBackground}</Button>
        </View>
        <View style={containerStyle}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={[textStyle, { backgroundColor: '#252525', height: 40, borderRadius: 8, paddingLeft: 12 }]}
          />
          <AddressScanner
            qrModalVisible={showQr}
            onPressCancel={() => setShowQr(false)}
            onChangeAddress={setInput}
            setQrModalVisible={setShowQr}
          />
          <Button style={{ marginBottom: 5 }} onPress={openQr}>
            Scan
          </Button>
          <Button style={{ marginBottom: 5 }} onPress={updateWebRunnerUrl}>
            Update Web Runner URL
          </Button>
          <Button style={{ marginBottom: 5 }} onPress={useDefaultWebRunner}>
            Use Default
          </Button>
          <ToggleItem
            isEnabled={devModeStatus}
            label={i18n.common.devMode}
            onValueChange={onValueChange}
            backgroundIcon={Bug}
          />
          <Button
            style={{ marginBottom: 5 }}
            onPress={() => {
              mmkvStore.set('storedLiveMissionPools', '[]');
              mmkvStore.set('isOpenedWarningPopup', false);
              mmkvStore.set('isOpenedNoticeModal', false);
              dispatch(updatePopupHistoryData({}));
              dispatch(updateBannerHistoryData({}));
              dispatch(updateConfirmationHistoryData({}));
              setNotification("OK, Let's restart app!");
            }}>
            Reset static content
          </Button>
          <Text style={textStyle}>{notification}</Text>
        </View>
      </ScrollView>
    </ContainerWithSubHeader>
  );
};
