import React, { Ref } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { ActivityIndicator, Typography } from '..';
import QRCodeStyles from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import QRCodeStyled, { GradientProps, QRCodeMessage } from 'react-native-qrcode-styled';
import Svg from 'react-native-svg';

const logo = require('./sw-logo.png');
const gradient: GradientProps = {
  type: 'radial',
  options: {
    center: [0, 0.5],
    radius: [1, 0.9],
    colors: ['#000', '#000'],
    locations: [0, 1],
  },
};

export interface SWQRCodeProps {
  icon?: ImageSourcePropType;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  status?: 'active' | 'expired' | 'loading';
  value: QRCodeMessage;
  QRSize?: number;
  pieceBorderRadius?: number;
  outerEyesRadius?: number;
  innerEyesRadius?: number;
  onRefresh?: () => void;
  qrRef?: Ref<Svg> | undefined;
}

const QRCode: React.FC<SWQRCodeProps> = ({
  icon = logo,
  QRSize = 7,
  status,
  errorLevel = 'Q',
  value,
  pieceBorderRadius = 3,
  outerEyesRadius = 20,
  innerEyesRadius = 9,
  qrRef,
}) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = QRCodeStyles(theme);
  const outerEyesOptions = {
    topLeft: {
      borderRadius: [outerEyesRadius, outerEyesRadius, 0, outerEyesRadius],
    },
    topRight: {
      borderRadius: [outerEyesRadius, outerEyesRadius, outerEyesRadius],
    },
    bottomLeft: {
      borderRadius: [outerEyesRadius, 0, outerEyesRadius, outerEyesRadius],
    },
  };
  const innerEyesOptions = {
    borderRadius: innerEyesRadius,
    scale: 0.85,
  };

  return (
    <View style={_style.container}>
      <QRCodeStyled
        ref={qrRef}
        data={value}
        pieceSize={QRSize}
        pieceBorderRadius={pieceBorderRadius}
        logo={{
          href: icon,
          padding: 6,
        }}
        gradient={gradient}
        errorCorrectionLevel={errorLevel}
        outerEyesOptions={outerEyesOptions}
        innerEyesOptions={innerEyesOptions}
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
