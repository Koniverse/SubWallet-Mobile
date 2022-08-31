import React, { useMemo, useRef } from 'react';
import { SubWalletModal } from 'components/SubWalletModal';
import { Linking, Share, StyleProp, TouchableOpacity, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontBold, FontSemiBold, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import QRCode from 'react-native-qrcode-svg';
import reformatAddress, { getNetworkLogo, toShort } from 'utils/index';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import { SubmitButton } from 'components/SubmitButton';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BUTTON_ACTIVE_OPACITY, deviceHeight } from '../../../constant';
import Toast from 'react-native-toast-notifications';
import useScanExplorerAddressUrl from 'hooks/screen/useScanExplorerAddressUrl';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import ToastContainer from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

interface Props {
  selectedAddress?: string;
  receiveModalVisible: boolean;
  onChangeVisible: () => void;
  networkKey: string;
  networkPrefix: number;
  openChangeNetworkModal: () => void;
  disableReselectButton?: boolean;
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

function receiveModalExplorerBtnStyle(borderColor: string): StyleProp<any> {
  return {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: borderColor,
    flex: 1,
    marginRight: 8,
  };
}

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;
export const ReceiveModal = ({
  selectedAddress,
  receiveModalVisible,
  onChangeVisible,
  networkKey,
  networkPrefix,
  openChangeNetworkModal,
  disableReselectButton,
}: Props) => {
  const toastRef = useRef<ToastContainer>(null);
  let svg: { toDataURL: (arg0: (data: any) => void) => void };
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(i18n.common.copiedToClipboard);
    }
  };
  const formattedAddress = useMemo(() => {
    const networkInfo = networkMap[networkKey];

    return reformatAddress(selectedAddress || currentAccountAddress, networkPrefix, networkInfo?.isEthereum);
  }, [networkMap, networkKey, selectedAddress, currentAccountAddress, networkPrefix]);
  const isSupportScanExplorer = useSupportScanExplorer(networkKey);
  const scanExplorerAddressUrl = useScanExplorerAddressUrl(networkKey, formattedAddress);

  const onShareImg = () => {
    svg.toDataURL(data => {
      const shareImageBase64 = {
        title: 'QR',
        message: `My Public Address to Receive ${networkKey.toUpperCase()}: ${formattedAddress}`,
        url: `data:image/png;base64,${data}`,
      };
      Share.share(shareImageBase64);
    });
  };

  return (
    <SubWalletModal
      modalStyle={{ height: 496 }}
      modalVisible={receiveModalVisible}
      onChangeModalVisible={onChangeVisible}>
      <View style={receiveModalContentWrapper}>
        <Text style={receiveModalTitle}>{i18n.cryptoScreen.receive}</Text>
        <QRCode value={formattedAddress} size={180} getRef={(ref?) => (svg = ref)} />
        <Text style={receiveModalGuide}>{i18n.common.receiveModalText}</Text>

        <View style={receiveModalAddressWrapper}>
          <TouchableOpacity
            disabled={disableReselectButton}
            activeOpacity={BUTTON_ACTIVE_OPACITY}
            onPress={() => {
              onChangeVisible();
              openChangeNetworkModal();
            }}>
            {getNetworkLogo(networkKey, 20)}
          </TouchableOpacity>

          <Text style={receiveModalAddressText}>{toShort(formattedAddress, 12, 12)}</Text>
          <IconButton
            style={receiveModalCopyBtn}
            icon={CopySimple}
            color={ColorMap.disabled}
            onPress={() => copyToClipboard(formattedAddress)}
          />
        </View>

        <View style={{ flexDirection: 'row', paddingTop: 27 }}>
          <SubmitButton
            disabled={!isSupportScanExplorer}
            disabledColor={'rgba(34, 34, 34, 0.7)'}
            title={i18n.common.explorer}
            backgroundColor={ColorMap.dark2}
            style={receiveModalExplorerBtnStyle(!isSupportScanExplorer ? 'rgba(255, 255, 255, 0.5)' : ColorMap.light)}
            onPress={() => {
              isSupportScanExplorer && Linking.openURL(scanExplorerAddressUrl);
            }}
          />
          <SubmitButton style={{ flex: 1, marginLeft: 8 }} title={i18n.common.share} onPress={onShareImg} />
        </View>
        {
          <Toast
            duration={1500}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={OFFSET_BOTTOM}
          />
        }
      </View>
    </SubWalletModal>
  );
};
