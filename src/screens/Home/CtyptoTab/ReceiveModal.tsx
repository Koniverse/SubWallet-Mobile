import React, { useCallback } from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontBold, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import QRCode from 'react-native-qrcode-svg';
import reformatAddress, { getNetworkLogo, toShort } from 'utils/index';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import { SubmitButton } from 'components/SubmitButton';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

interface Props {
  receiveModalVisible: boolean;
  onChangeVisible: () => void;
}

const receiveModalContentWrapper: StyleProp<any> = {
  alignItems: 'center',
  width: '100%',
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

export const ReceiveModal = ({ receiveModalVisible, onChangeVisible }: Props) => {
  const toast = useToast();
  const {
    accounts: { currentAccountAddress },
    currentNetwork: { networkKey, networkPrefix },
  } = useSelector((state: RootState) => state);
  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.show('Copied to clipboard');
    },
    [toast],
  );
  const formattedAddress = reformatAddress(currentAccountAddress, networkPrefix);

  return (
    <SubWalletModal
      modalStyle={{ height: 496 }}
      modalVisible={receiveModalVisible}
      onChangeModalVisible={onChangeVisible}>
      <View style={receiveModalContentWrapper}>
        <Text style={receiveModalTitle}>Receive Asset</Text>
        <QRCode value={formattedAddress} size={180} />
        <Text style={receiveModalGuide}>Scan address to receive payment</Text>

        <View style={receiveModalAddressWrapper}>
          {getNetworkLogo(networkKey, 20)}
          <Text style={receiveModalAddressText}>{toShort(formattedAddress, 12, 12)}</Text>
          <IconButton
            style={receiveModalCopyBtn}
            icon={CopySimple}
            color={ColorMap.disabled}
            onPress={() => copyToClipboard(formattedAddress)}
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
