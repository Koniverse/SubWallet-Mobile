import React from 'react';
import { View } from 'react-native';
import { Button, Icon, Typography } from '../../design-system-ui';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { House } from 'phosphor-react-native';
import ErrorStyles from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Images } from 'assets/index';

interface ErrorFallbackProps {
  resetError: () => void;
}

const ErrorFallbackScreen: React.FC<ErrorFallbackProps> = ({ resetError }) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = ErrorStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        locations={[0, 0.5]}
        colors={['rgba(234, 76, 76, 0.15)', 'rgba(217, 217, 217, 0)']}
        style={styles.gradientContainer}>
        <View style={styles.content}>
          <FastImage source={Images.circleRobot} style={styles.logo} />
          <Typography.Title style={styles.title} level={3}>
            Opps! An Error Occurred
          </Typography.Title>
          <Typography.Text size="lg" style={styles.textContent}>
            Sorry, something went wrong. Please try again later.
          </Typography.Text>
        </View>
        <Button onPress={() => resetError()} icon={<Icon phosphorIcon={House} size="md" weight="fill" />}>
          Back to home
        </Button>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ErrorFallbackScreen;
