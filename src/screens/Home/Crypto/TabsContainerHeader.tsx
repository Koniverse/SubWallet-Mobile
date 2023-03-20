import React from 'react';
import { BalanceBlockType, SelectionProviderType } from 'types/ui-types';
import { ActionButtonContainer } from 'screens/Home/Crypto/ActionButtonContainer';
import { StyleProp, View } from 'react-native';
import { BalanceBlock } from 'screens/Home/Crypto/BalanceBlock';

export interface TabsContainerHeaderProps {
  balanceBlockProps: BalanceBlockType;
  selectionProvider?: SelectionProviderType;
  actionButtonContainerStyle?: StyleProp<any>;
}

const containerStyle: StyleProp<any> = {
  height: 220,
  paddingHorizontal: 16,
  alignItems: 'center',
  marginTop: -2,
  paddingBottom: 2,
  marginBottom: -2,
};

const TabsContainerHeader = ({
  balanceBlockProps,
  selectionProvider,
  actionButtonContainerStyle,
}: TabsContainerHeaderProps) => {
  return (
    <View style={containerStyle} pointerEvents="box-none">
      <BalanceBlock {...balanceBlockProps} />
      <ActionButtonContainer style={actionButtonContainerStyle} selectionProvider={selectionProvider} />
    </View>
  );
};

export default TabsContainerHeader;
