import React, { useMemo, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import reformatAddress, { getNetworkLogo, toShort } from 'utils/index';
import { CopySimple, GlobeHemisphereWest, Share as ShareIcon } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import { _getChainSubstrateAddressPrefix } from '@subwallet/extension-base/services/chain-service/utils';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { Button, Icon, QRCode, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { VoidFunction } from 'types/index';
import Svg from 'react-native-svg';
import { TonWalletContractSelectorModal } from 'components/Modal/TonWalletContractSelectorModal';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountActions } from '@subwallet/extension-base/types';

interface Props {
  modalVisible: boolean;
  address?: string;
  selectedNetwork?: string;
  setModalVisible: (arg: boolean) => void;
  onBack?: VoidFunction;
  isUseModalV2?: boolean;
  level?: number;
  isOpenFromTokenDetailScreen?: boolean;
}

const receiveModalContentWrapper: StyleProp<any> = {
  alignItems: 'center',
  width: '100%',
};

export const ReceiveModal = ({
  address,
  selectedNetwork,
  modalVisible,
  setModalVisible,
  onBack,
  isUseModalV2,
  level,
  isOpenFromTokenDetailScreen,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const toastRef = useRef<ToastContainer>(null);
  let svg: Svg | null | undefined;
  const chainInfo = useFetchChainInfo(selectedNetwork || '');
  const modalRef = useRef<SWModalRefProps>(null);
  const insets = useSafeAreaInsets();
  const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - insets.bottom - insets.top - 50;
  const accountInfo = useGetAccountByAddress(address);
  const [tonWalletContractVisible, setTonWalletContractVisible] = useState<boolean>(false);

  const isRelatedToTon = useMemo(() => {
    return accountInfo?.accountActions.includes(AccountActions.TON_CHANGE_WALLET_CONTRACT_VERSION);
  }, [accountInfo]);

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
    return getExplorerLink(chainInfo, formattedAddress, 'account');
  }, [formattedAddress, chainInfo]);

  const onShareImg = () => {
    if (!chainInfo?.slug) {
      return;
    }

    svg?.toDataURL(data => {
      const shareImageBase64 = {
        title: 'QR',
        message: `My Public Address to Receive ${chainInfo?.slug.toUpperCase()}: ${formattedAddress}`,
        url: `data:image/png;base64,${data}`,
      };
      Share.share(shareImageBase64);
    });
  };

  const _onCancel = () => {
    onBack ? onBack() : modalRef?.current?.close();
  };

  const onCloseTonWalletContactModal = () => {
    setTonWalletContractVisible(false);
  };

  const onOpenTonWalletContactModal = () => {
    setTonWalletContractVisible(true);
  };

  return (
    <SwModal
      modalBaseV2Ref={modalRef}
      setVisible={setModalVisible}
      onBackdropPress={_onCancel}
      disabledOnPressBackDrop={Platform.OS === 'android'}
      modalVisible={modalVisible}
      isUseModalV2={isUseModalV2}
      level={level}
      modalTitle={i18n.header.yourAddress}
      isShowRightBtn={isRelatedToTon}
      onPressRightBtn={onOpenTonWalletContactModal}
      titleTextAlign={'center'}
      onBackButtonPress={_onCancel}>
      <View style={receiveModalContentWrapper}>
        <View style={{ paddingTop: 38 }}>
          {formattedAddress && <QRCode qrRef={(ref?) => (svg = ref)} value={formattedAddress} />}
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
        {isRelatedToTon && tonWalletContractVisible && (
          <TonWalletContractSelectorModal
            isOpenFromTokenDetailScreen={isOpenFromTokenDetailScreen}
            address={address || ''}
            modalVisible={tonWalletContractVisible}
            setModalVisible={setTonWalletContractVisible}
            chainSlug={selectedNetwork || ''}
            onCancel={onCloseTonWalletContactModal}
          />
        )}
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
    </SwModal>
  );
};
