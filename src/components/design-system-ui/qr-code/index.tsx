import React from 'react';
import { ImageSourcePropType, View } from 'react-native';
import QRCodeGenerator, { QRCodeProps } from 'react-native-qrcode-svg';
import { ActivityIndicator, Typography } from '..';
import QRCodeStyles from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface SWQRCodeProps extends QRCodeProps {
  icon?: ImageSourcePropType;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  status?: 'active' | 'expired' | 'loading';
  onRefresh?: () => void;
}

const QRCode: React.FC<SWQRCodeProps> = ({ icon, size = 250, status, errorLevel, ...restProps }) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = QRCodeStyles(theme);
  return (
    <View style={_style.container}>
      <QRCodeGenerator
        logo={require('./QrCodeIcon.png') || icon}
        logoSize={size * 0.32}
        logoMargin={3}
        logoBorderRadius={5}
        logoBackgroundColor="white"
        ecl={errorLevel}
        size={size}
        {...restProps}
      />
      {status === 'loading' && (
        <View style={_style.expired}>
          <ActivityIndicator size={12} indicatorColor="black" />
        </View>
      )}
      {status === 'expired' && (
        <View style={_style.expired}>
          <Typography.Text size="sm" style={_style.bold}>
            QR code expired
          </Typography.Text>
        </View>
      )}
    </View>
  );
};

export default QRCode;
