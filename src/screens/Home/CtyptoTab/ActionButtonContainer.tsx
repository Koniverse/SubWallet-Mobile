import React from 'react';
import { StyleProp, View } from 'react-native';
import ActionButton from 'components/ActionButton';
import i18n from 'utils/i18n/i18n';

interface Props {
  openReceiveModal: () => void;
  onPressSendFundBtn: () => void;
  style?: object;
}

const actionButtonWrapper: StyleProp<any> = {
  paddingTop: 36,
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  paddingBottom: 25,
};

export const ActionButtonContainer = ({ openReceiveModal, style, onPressSendFundBtn }: Props) => {
  return (
    <View style={[actionButtonWrapper, style]}>
      <ActionButton label={i18n.cryptoTab.receive} iconSize={24} iconName={'ReceiveIcon'} onPress={openReceiveModal} />
      <ActionButton label={i18n.cryptoTab.send} iconSize={24} iconName={'SendIcon'} onPress={onPressSendFundBtn} />
      <ActionButton label={i18n.cryptoTab.swap} iconSize={24} iconName={'SwapIcon'} />
    </View>
  );
};
