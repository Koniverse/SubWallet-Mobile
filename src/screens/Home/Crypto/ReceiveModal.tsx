import React, { useMemo, useRef } from 'react';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { Linking, Share, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import reformatAddress, { getNetworkLogo, getScanExplorerAddressInfoUrl, toShort } from 'utils/index';
import { CopySimple, GlobeHemisphereWest, Share as ShareIcon } from 'phosphor-react-native';
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
import { Button, Icon, QRCode, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

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

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;
export const ReceiveModal = ({ address, selectedNetwork, modalVisible, onCancel }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const toastRef = useRef<ToastContainer>(null);
  let svg: { toDataURL: (arg0: (data: any) => void) => void };
  const chainInfo = useFetchChainInfo(selectedNetwork || '');

  const copyToClipboard = (text: string) => {
    return () => {
      Clipboard.setString(text);
      if (toastRef.current) {
        // @ts-ignore
        toastRef.current.hideAll();
        // @ts-ignore
        toastRef.current.show(i18n.common.copiedToClipboard);
      }
    };
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
        <Typography.Text
          size={'lg'}
          style={{
            color: theme.colorWhite,
            ...FontSemiBold,
          }}>
          {i18n.header.yourAddress}
        </Typography.Text>
        <View style={{ paddingTop: 38 }}>
          <QRCode qrRef={(ref?) => (svg = ref)} value={formattedAddress} errorLevel={'Q'} />
        </View>

        <View
          style={{
            height: 48,
            flexDirection: 'row',
            backgroundColor: theme.colorBgSecondary,
            padding: theme.paddingXXS,
            paddingLeft: theme.paddingSM,
            alignItems: 'center',
            gap: theme.paddingXS,
            borderRadius: theme.borderRadiusLG,
            marginVertical: theme.margin,
          }}>
          {getNetworkLogo(chainInfo?.slug || '', 24)}

          <Typography.Text
            style={{
              color: theme.colorTextLight4,
              ...FontMedium,
            }}>
            {toShort(formattedAddress, 7, 7)}
          </Typography.Text>

          <Button
            icon={<Icon phosphorIcon={CopySimple} weight={'bold'} size={'sm'} iconColor={theme.colorTextLight4} />}
            type={'ghost'}
            size={'xs'}
            onPress={copyToClipboard(formattedAddress)}
          />
        </View>

        <View
          style={{
            marginHorizontal: -theme.size,
            paddingHorizontal: theme.size,
            gap: theme.size,
            flexDirection: 'row',
            paddingTop: theme.size,
            borderTopColor: theme.colorBgSecondary,
            borderTopWidth: 2,
            borderStyle: 'solid',
          }}>
          <Button
            style={{ flex: 1 }}
            disabled={!scanExplorerAddressUrl}
            icon={(iconColor: string) => (
              <Icon phosphorIcon={GlobeHemisphereWest} weight={'fill'} size={'lg'} iconColor={iconColor} />
            )}
            type={'secondary'}
            onPress={() => {
              !!scanExplorerAddressUrl && Linking.openURL(scanExplorerAddressUrl);
            }}>
            {i18n.common.explorer}
          </Button>

          <Button
            style={{ flex: 1 }}
            disabled={!chainInfo?.slug}
            icon={<Icon phosphorIcon={ShareIcon} weight={'fill'} size={'lg'} />}
            onPress={onShareImg}>
            {i18n.common.share}
          </Button>
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
