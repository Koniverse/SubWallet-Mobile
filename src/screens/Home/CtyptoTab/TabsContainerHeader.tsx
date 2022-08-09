import React from 'react';
import { BalanceBlockType, SelectionProviderType } from 'types/ui-types';
import { ActionButtonContainer } from 'screens/Home/CtyptoTab/ActionButtonContainer';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { BalanceBlock } from 'screens/Home/CtyptoTab/BalanceBlock';

export interface TabsContainerHeaderProps {
  balanceBlockProps: BalanceBlockType;
  selectionProvider?: SelectionProviderType;
  actionButtonContainerStyle?: StyleProp<any>;
}

const containerStyle: StyleProp<any> = {
  paddingHorizontal: 16,
  alignItems: 'center',
  backgroundColor: ColorMap.dark2,
  paddingTop: 21,
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
