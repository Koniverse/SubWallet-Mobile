import React, { useMemo, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { getNetworkLogo, toShort } from 'utils/index';
import { CopySimple, GlobeHemisphereWest, House, Share as ShareIcon } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { Button, Icon, Image, QRCode, SwModal, Tag, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { VoidFunction } from 'types/index';
import Svg from 'react-native-svg';
import { TonWalletContractSelectorModal } from 'components/Modal/TonWalletContractSelectorModal';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { AccountActions } from '@subwallet/extension-base/types';
import { RootStackParamList } from 'routes/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RELAY_CHAINS_TO_MIGRATE } from 'constants/chain';
import { Images } from 'assets/index';
import { isEthereumAddress } from '@polkadot/util-crypto';

interface Props {
  modalVisible: boolean;
  address?: string;
  selectedNetwork?: string;
  setModalVisible: (arg: boolean) => void;
  onBack?: VoidFunction;
  isUseModalV2?: boolean;
  level?: number;
  isOpenFromAccountDetailScreen?: boolean;
  isNewFormat?: boolean;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
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
  isOpenFromAccountDetailScreen,
  isNewFormat,
  navigation,
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

  const isRelayChainToMigrate = useMemo(
    () => selectedNetwork && RELAY_CHAINS_TO_MIGRATE.includes(selectedNetwork),
    [selectedNetwork],
  );

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

  const scanExplorerAddressUrl = useMemo(() => {
    return getExplorerLink(chainInfo, address || '', 'account');
  }, [address, chainInfo]);

  const onShareImg = () => {
    if (!chainInfo?.slug) {
      return;
    }

    svg?.toDataURL(data => {
      const shareImageBase64 = {
        title: 'QR',
        message: `My Public Address to Receive ${chainInfo?.slug.toUpperCase()}: ${address}`,
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

  // @ts-ignore
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
        <View style={{ paddingTop: 16 }}>
          {address && (
            <View>
              {!isRelayChainToMigrate ? (
                <QRCode
                  width={264}
                  height={264}
                  QRSize={isEthereumAddress(address) ? 264 / 37 : 264 / 41}
                  qrRef={(ref?) => (svg = ref)}
                  value={address}
                />
              ) : (
                <Image src={Images.blurredQr} style={{ width: 288, height: 288 }} />
              )}
            </View>
          )}
        </View>

        <View
          style={{
            height: 48,
            flexDirection: 'row',
            backgroundColor: theme.colorBgSecondary,
            padding: theme.paddingXXS,
            paddingLeft: theme.paddingSM,
            paddingRight: isRelayChainToMigrate ? theme.paddingSM : 0,
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
            {toShort(address || '', 7, 7)}
          </Typography.Text>

          {isNewFormat !== undefined && (
            <Tag bgType={'default'} color={isNewFormat ? 'success' : 'gold'}>
              {isNewFormat ? 'New' : 'Legacy'}
            </Tag>
          )}

          {!isRelayChainToMigrate && (
            <Button
              icon={<Icon phosphorIcon={CopySimple} weight={'bold'} size={'sm'} iconColor={theme.colorTextLight4} />}
              type={'ghost'}
              size={'xs'}
              onPress={copyToClipboard(address || '')}
            />
          )}
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
          {isNewFormat === undefined || isNewFormat ? (
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
          ) : (
            <Button
              style={{ flex: 1 }}
              disabled={!scanExplorerAddressUrl}
              icon={(iconColor: string) => (
                <Icon phosphorIcon={House} weight={'fill'} size={'lg'} iconColor={iconColor} />
              )}
              type={'secondary'}
              onPress={() => {
                onBack ? onBack() : modalRef?.current?.close();
                navigation &&
                  navigation.navigate('Home', {
                    screen: 'Main',
                    params: { screen: 'Tokens', params: { screen: 'TokenGroups' } },
                  });
              }}>
              {i18n.common.backToHome}
            </Button>
          )}

          {(isNewFormat === undefined || isNewFormat) && (
            <Button
              style={{ flex: 1 }}
              disabled={!chainInfo?.slug}
              icon={<Icon phosphorIcon={ShareIcon} weight={'fill'} size={'lg'} />}
              onPress={onShareImg}>
              {i18n.common.share}
            </Button>
          )}
        </View>
        {isRelatedToTon && tonWalletContractVisible && (
          <TonWalletContractSelectorModal
            isOpenFromAccountDetailScreen={isOpenFromAccountDetailScreen}
            address={address || ''}
            modalVisible={tonWalletContractVisible}
            setModalVisible={setTonWalletContractVisible}
            chainSlug={selectedNetwork || ''}
            onCancel={onCloseTonWalletContactModal}
            onChangeModalVisible={() => setTonWalletContractVisible(false)}
          />
        )}
        {
          <Toast
            duration={TOAST_DURATION}
            normalColor={ColorMap.notification}
            ref={toastRef}
            placement={'bottom'}
            offsetBottom={OFFSET_BOTTOM}
            textStyle={{ textAlign: 'center', ...FontMedium }}
            style={{ borderRadius: 8 }}
          />
        }
      </View>
    </SwModal>
  );
};
