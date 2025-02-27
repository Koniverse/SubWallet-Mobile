import React, { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Icon, Typography } from '../../design-system-ui';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Share } from 'phosphor-react-native';
import ErrorStyles from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Images } from 'assets/index';
import axios from 'axios';
import { FallbackComponentProps } from 'react-native-error-boundary';
import { Toast } from 'react-native-toast-notifications';
import { getBrand, getBuildNumber, getSystemVersion, getVersion } from 'react-native-device-info';
import packageJSON from '../../../../package.json';
import env from 'react-native-config';
import { useNavigation } from '@react-navigation/native';
import { SubHeader } from 'components/SubHeader';

const BUNDLE_ENV = env.BUNDLE_ENV;
const bundleData =
  BUNDLE_ENV === 'PRODUCTION' ? packageJSON.bundleVersion.split('-') : packageJSON.bundleVersionStaging.split('-');
const bundleVersion =
  Platform.OS === 'android' ? bundleData[0].split('(')[1].slice(0, -1) : bundleData[1].split('(')[1].slice(0, -1);

const ErrorFallbackScreen: React.FC<FallbackComponentProps> = ({ error, resetError }) => {
  const theme = useSubWalletTheme().swThemes;
  const insets = useSafeAreaInsets();
  const styles = ErrorStyles(theme, insets);
  const [isUploading, setIsUploading] = useState(false);
  const navigation = useNavigation();
  const routes = navigation?.getState()?.routes;
  const currentRoutes = useRef(routes);
  if (routes) {
    currentRoutes.current = routes.map(item => item.name);
  }

  const uploadCrashLog = () => {
    setIsUploading(true);
    const body = {
      content: JSON.stringify(error),
      short_message: error.message,
      platform: Platform.OS,
      device_version: `${getSystemVersion()} ${getBrand()}`,
      app_version: `${getVersion()}-(${getBuildNumber()}) b-${bundleVersion}`,
      current_routes: JSON.stringify(currentRoutes.current),
    };
    axios
      .post('https://mobile-feedback.subwallet.app/gelf', body)
      .then(() => {
        resetError();
      })
      .catch(() => Toast.show('Failed to send report', { type: 'error', duration: 5000 }))
      .finally(() => setIsUploading(false));
  };

  return (
    <LinearGradient
      locations={[0, 0.5]}
      colors={['rgba(234, 76, 76, 0.15)', 'rgba(217, 217, 217, 0)']}
      style={styles.gradientContainer}>
      <View style={styles.container}>
        <SubHeader title="Unknown error" showLeftBtn={false} backgroundColor="transparent" />
        <View style={styles.content}>
          <FastImage source={Images.circleRobot} style={styles.logo} />
          <Typography.Title style={styles.title} level={3}>
            Oops, an error occurred!
          </Typography.Title>
          <Typography.Text size="lg" style={styles.textContent}>
            Something went wrong. Help us fix the problem by sending a report anonymously!
          </Typography.Text>
        </View>
        <Button
          loading={isUploading}
          onPress={uploadCrashLog}
          icon={<Icon phosphorIcon={Share} size="md" weight="fill" />}>
          Send report
        </Button>
        <Button
          type="secondary"
          disabled={isUploading}
          style={styles.buttonSubmit}
          onPress={() => resetError()}
          icon={<Icon phosphorIcon={House} size="md" weight="fill" />}>
          Back to home
        </Button>
      </View>
    </LinearGradient>
  );
};

export default ErrorFallbackScreen;
