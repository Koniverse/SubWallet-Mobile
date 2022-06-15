import React, { useCallback } from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontBold, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import QRCode from 'react-native-qrcode-svg';
import { getNetworkLogo, toShort } from 'utils/index';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import { SubmitButton } from 'components/SubmitButton';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';

interface Props {
  receiveModalVisible: boolean;
  onChangeVisible: () => void;
  currentAccountAddress: string;
}

const receiveModalContainer: StyleProp<any> = {
  height: 496,
  backgroundColor: ColorMap.dark2,
  marginTop: 'auto',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  alignItems: 'center',
  paddingTop: 8,
  paddingHorizontal: 16,
};

const receiveModalSeparator: StyleProp<any> = {
  width: 56,
  height: 4,
  borderRadius: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: 19,
};

const receiveModalTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 24,
};

const receiveModalGuide: StyleProp<any> = {
  color: ColorMap.disabled,
  ...sharedStyles.mainText,
  ...FontSemiBold,
  paddingVertical: 16,
};

const receiveModalAddressWrapper: StyleProp<any> = {
  paddingHorizontal: 16,
  backgroundColor: ColorMap.dark1,
  borderRadius: 5,
  height: 48,
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
};

const receiveModalAddressText: StyleProp<any> = {
  color: ColorMap.disabled,
  ...sharedStyles.mainText,
  ...FontSemiBold,
  paddingLeft: 16,
};

const receiveModalCopyBtn: StyleProp<any> = {
  width: 48,
  height: '100%',
  position: 'absolute',
  right: 0,
  borderTopRightRadius: 5,
  borderBottomRightRadius: 5,
};

const receiveModalExplorerBtn: StyleProp<any> = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: ColorMap.light,
  flex: 1,
  marginRight: 8,
};

export const ReceiveModal = ({ receiveModalVisible, onChangeVisible, currentAccountAddress }: Props) => {
  const toast = useToast();
  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.show('Copied to clipboard');
    },
    [toast],
  );

  return (
    <SubWalletModal modalVisible={receiveModalVisible} onChangeModalVisible={onChangeVisible}>
      <View style={receiveModalContainer}>
        <View style={receiveModalSeparator} />
        <Text style={receiveModalTitle}>Receive Asset</Text>
        <QRCode value={currentAccountAddress} size={180} />
        <Text style={receiveModalGuide}>Scan address to receive payment</Text>

        <View style={receiveModalAddressWrapper}>
          {getNetworkLogo('polkadot', 20)}
          <Text style={receiveModalAddressText}>{toShort(currentAccountAddress, 12, 12)}</Text>
          <IconButton
            iconButtonStyle={receiveModalCopyBtn}
            icon={CopySimple}
            color={ColorMap.disabled}
            onPress={() => copyToClipboard(currentAccountAddress)}
          />
        </View>

        <View style={{ flexDirection: 'row', paddingTop: 27 }}>
          <SubmitButton title={'Explorer'} backgroundColor={ColorMap.dark2} style={receiveModalExplorerBtn} />
          <SubmitButton style={{ flex: 1, marginLeft: 8 }} title={'Share'} />
        </View>
      </View>
    </SubWalletModal>
  );
};
