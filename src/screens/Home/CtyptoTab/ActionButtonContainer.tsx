import React from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';

interface Props {
  openReceiveModal: () => void;
}

const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 36,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  paddingBottom: 25,
};

export const ActionButtonContainer = ({ openReceiveModal }: Props) => {
  return (
    <View style={actionButtonWrapper}>
      <ActionButton label="Receive" iconSize={24} iconName={'ReceiveIcon'} onPress={openReceiveModal} />
      <ActionButton label="Send" iconSize={24} iconName={'SendIcon'} />
      <ActionButton label="Swap" iconSize={24} iconName={'SwapIcon'} />
    </View>
  );
};
