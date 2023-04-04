import React, { useMemo, useRef } from 'react';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { Linking, Share, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontBold, FontSemiBold, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import QRCode from 'react-native-qrcode-svg';
import reformatAddress, { getNetworkLogo, getScanExplorerAddressInfoUrl, toShort } from 'utils/index';
import { IconButton } from 'components/IconButton';
import { CopySimple } from 'phosphor-react-native';
import { SubmitButton } from 'components/SubmitButton';
import Clipboard from '@react-native-clipboard/clipboard';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import {
  _getBlockExplorerFromChain,
  _getChainSubstrateAddressPrefix,
} from '@subwallet/extension-base/services/chain-service/utils';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';

interface Props {
  modalVisible: boolean;
  address?: string;
  selectedNetwork?: string;
  onCancel: () => void;
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
export const ReceiveModal = ({ address, selectedNetwork, modalVisible, onCancel }: Props) => {
  const toastRef = useRef<ToastContainer>(null);
  let svg: { toDataURL: (arg0: (data: any) => void) => void };
  const chainInfo = useFetchChainInfo(selectedNetwork || '');

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
    if (chainInfo) {
      const isEvmChain = !!chainInfo.evmInfo;
      const networkPrefix = _getChainSubstrateAddressPrefix(chainInfo);

      return reformatAddress(address || '', networkPrefix, isEvmChain);
    } else {
      return address || '';
    }
  }, [address, chainInfo]);

  const scanExplorerAddressUrl = useMemo(() => {
    let route = '';
    const blockExplorer = selectedNetwork && _getBlockExplorerFromChain(chainInfo);

    if (blockExplorer && blockExplorer.includes('subscan.io')) {
      route = 'account';
    } else {
      route = 'address';
    }

    if (blockExplorer) {
      return `${blockExplorer}${route}/${formattedAddress}`;
    } else {
      return getScanExplorerAddressInfoUrl(selectedNetwork || '', formattedAddress);
    }
  }, [selectedNetwork, formattedAddress, chainInfo]);

  const onShareImg = () => {
    if (!chainInfo?.slug) {
      return;
    }

    svg.toDataURL(data => {
      const shareImageBase64 = {
        title: 'QR',
        message: `My Public Address to Receive ${chainInfo?.slug.toUpperCase()}: ${formattedAddress}`,
        url: `data:image/png;base64,${data}`,
      };
      Share.share(shareImageBase64);
    });
  };

  return (
    <SubWalletModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <View style={receiveModalContentWrapper}>
        <Text style={receiveModalTitle}>{i18n.title.receiveAsset}</Text>
        <View style={{ borderWidth: 2, borderColor: ColorMap.light }}>
          <QRCode value={formattedAddress} size={180} getRef={(ref?) => (svg = ref)} />
        </View>

        <Text style={receiveModalGuide}>{i18n.common.receiveModalText}</Text>

        <View style={receiveModalAddressWrapper}>
          {getNetworkLogo(chainInfo?.slug || '', 20)}

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
            disabled={!scanExplorerAddressUrl}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            title={i18n.common.explorer}
            backgroundColor={ColorMap.dark2}
            style={receiveModalExplorerBtnStyle(!scanExplorerAddressUrl ? 'rgba(255, 255, 255, 0.5)' : ColorMap.light)}
            onPress={() => {
              !!scanExplorerAddressUrl && Linking.openURL(scanExplorerAddressUrl);
            }}
          />
          <SubmitButton
            disabled={!chainInfo?.slug}
            style={{ flex: 1, marginLeft: 8 }}
            title={i18n.common.share}
            onPress={onShareImg}
          />
        </View>
        {
          <Toast
            duration={TOAST_DURATION}
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
