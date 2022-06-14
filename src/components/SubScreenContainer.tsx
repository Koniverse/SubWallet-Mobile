import React from 'react';
import { View } from 'react-native';
import { SubHeader } from 'components/SubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  children: JSX.Element;
  navigation: any;
  title: string;
}

export const SubScreenContainer = ({ children, navigation, title }: Props) => {
  const theme = useSubWalletTheme().colors;
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SubHeader navigation={navigation} title={title} />
      {children}
    </View>
  );
};
