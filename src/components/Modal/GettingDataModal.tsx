import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React from 'react';
import ModalBase from 'components/design-system-ui/modal/ModalBase';
import { View } from 'react-native';
import { ActivityIndicator, Typography } from 'components/design-system-ui';
import { deviceWidth } from 'constants/index';
import { FontMedium } from 'styles/sharedStyles';

interface Props {
  isLoading: boolean;
}

export const GettingDataModal = ({ isLoading }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <ModalBase
      isVisible={isLoading}
      style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      backdropColor={'#1A1A1A'}
      backdropOpacity={0.8}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      hideModalContentWhileAnimating>
      <View
        style={{
          width: deviceWidth * 0.6,
          height: 100,
          backgroundColor: theme.colorBgDefault,
          borderRadius: theme.borderRadiusXL,
          padding: theme.padding,
          gap: theme.padding,
          alignItems: 'center',
        }}>
        <>
          <ActivityIndicator size={32} />
          <Typography.Text style={{ color: theme.colorTextLight1, ...FontMedium }}>Getting data</Typography.Text>
        </>
      </View>
    </ModalBase>
  );
};
