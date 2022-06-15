import React from 'react';
import {SafeAreaView, StatusBar, View} from 'react-native';
import { SubHeader } from 'components/SubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import {ColorMap} from "styles/color";
import {STATUS_BAR_LIGHT_CONTENT} from "styles/sharedStyles";

interface Props {
  children: JSX.Element;
  navigation: any;
  title: string;
}

export const SubScreenContainer = ({ children, navigation, title }: Props) => {
  const theme = useSubWalletTheme().colors;
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView
        style={{
          backgroundColor: ColorMap.dark1,
        }}>
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} />
      </SafeAreaView>
      <SubHeader navigation={navigation} title={title} />
      {children}
    </View>
  );
};
