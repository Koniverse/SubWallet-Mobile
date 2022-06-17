import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { SubHeader, SubHeaderProps } from 'components/SubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';

export interface ContainerWithSubHeaderProps extends SubHeaderProps {
  children: JSX.Element;
}

export const ContainerWithSubHeader = ({ children, ...subHeaderProps }: ContainerWithSubHeaderProps) => {
  const theme = useSubWalletTheme().colors;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView
        style={{
          backgroundColor: ColorMap.dark1,
        }}>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} />
      </SafeAreaView>
      <SubHeader {...subHeaderProps} />
      {children}
    </View>
  );
};
