import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleProp, StyleSheet, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontBold, FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { getNetworkLogo, toShort } from 'utils/index';
import {
  CaretLeft,
  CaretRight,
  CopySimple,
  GlobeHemisphereWest,
  House,
  Share as ShareIcon,
} from 'phosphor-react-native';
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
import { AccountTokenAddress } from 'types/account';
import { getKeypairTypeByAddress, isBitcoinAddress } from '@subwallet/keyring';
import { getBitcoinKeypairAttributes } from 'utils/account/account';
import { ThemeTypes } from 'styles/themes';

interface Props {
  modalVisible: boolean;
  address: string;
  accountTokenAddresses?: AccountTokenAddress[];
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
  accountTokenAddresses = [],
  address: initialAddress,
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
  const accountInfo = useGetAccountByAddress(initialAddress);
  const [tonWalletContractVisible, setTonWalletContractVisible] = useState<boolean>(false);

  const showNavigationButtons = useMemo(() => {
    return accountTokenAddresses.length > 1;
  }, [accountTokenAddresses]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!showNavigationButtons) {
      return 0;
    }

    const index = accountTokenAddresses?.findIndex(item => item.accountInfo.address === initialAddress);

    return index !== -1 ? index : 0;
  });

  const currentAddress = showNavigationButtons
    ? accountTokenAddresses[currentIndex]?.accountInfo.address || initialAddress
    : initialAddress;

  const isRelayChainToMigrate = useMemo(
    () => !!selectedNetwork && RELAY_CHAINS_TO_MIGRATE.includes(selectedNetwork),
    [selectedNetwork],
  );

  const styles = createStyle(theme, isRelayChainToMigrate);

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
    return getExplorerLink(chainInfo, currentAddress, 'account');
  }, [currentAddress, chainInfo]);

  const bitcoinAttributes = useMemo(() => {
    if (isBitcoinAddress(currentAddress)) {
      const keyPairType = getKeypairTypeByAddress(currentAddress);

      return getBitcoinKeypairAttributes(keyPairType);
    }

    return undefined;
  }, [currentAddress]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (accountTokenAddresses) {
      setCurrentIndex(prev => Math.min(accountTokenAddresses.length - 1, prev + 1));
    }
  }, [accountTokenAddresses]);

  const onShareImg = () => {
    if (!chainInfo?.slug) {
      return;
    }

    svg?.toDataURL(data => {
      const shareImageBase64 = {
        title: 'QR',
        message: `My Public Address to Receive ${chainInfo?.slug.toUpperCase()}: ${currentAddress}`,
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

  const qrSize = useMemo(() => {
    if (isEthereumAddress(currentAddress)) {
      return 232 / 37;
    } else {
      if (!!bitcoinAttributes && !!bitcoinAttributes.label) {
        switch (bitcoinAttributes.label) {
          case 'Legacy':
            return 232 / 33;
          case 'Taproot':
            return 232 / 45;
          case 'Native SegWit':
            return 232 / 37;
        }
      } else {
        return 232 / 41;
      }
    }
  }, [bitcoinAttributes, currentAddress]);

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
        <View style={styles.qrWrapper}>
          {showNavigationButtons && (
            <Button
              disabled={currentIndex === 0}
              icon={
                <Icon
                  phosphorIcon={CaretLeft}
                  size={'md'}
                  iconColor={currentIndex === 0 ? theme['gray-3'] : theme['gray-5']}
                />
              }
              onPress={handlePrevious}
              type={'ghost'}
            />
          )}

          <View>
            {!isRelayChainToMigrate ? (
              <QRCode width={232} height={232} QRSize={qrSize} qrRef={(ref?) => (svg = ref)} value={currentAddress} />
            ) : (
              <Image src={Images.blurredQr} style={{ width: 288, height: 288 }} />
            )}
          </View>

          {showNavigationButtons && (
            <Button
              disabled={currentIndex === (accountTokenAddresses?.length ?? 0) - 1}
              icon={
                <Icon
                  phosphorIcon={CaretRight}
                  size={'md'}
                  iconColor={
                    currentIndex === (accountTokenAddresses?.length ?? 0) - 1 ? theme['gray-3'] : theme['gray-5']
                  }
                />
              }
              onPress={handleNext}
              type={'ghost'}
            />
          )}
        </View>

        {!!bitcoinAttributes && !!bitcoinAttributes.label ? (
          <Typography.Text style={styles.bitcoinAttributesLabel}>{bitcoinAttributes.label}</Typography.Text>
        ) : null}

        <View style={styles.addressBox}>
          {getNetworkLogo(chainInfo?.slug || '', 24)}

          <Typography.Text style={styles.addressBoxText}>{toShort(currentAddress || '', 7, 7)}</Typography.Text>

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
              onPress={copyToClipboard(currentAddress || '')}
            />
          )}
        </View>

        <View style={styles.buttonArea}>
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
            address={currentAddress || ''}
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

function createStyle(theme: ThemeTypes, isRelayChainToMigrate: boolean) {
  return StyleSheet.create({
    qrWrapper: { paddingVertical: theme.padding, flexDirection: 'row', alignItems: 'center' },
    bitcoinAttributesLabel: {
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      color: theme.colorTextLight2,
      ...FontBold,
    },
    addressBox: {
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
    },
    addressBoxText: {
      color: theme.colorTextLight4,
      ...FontMedium,
    },
    buttonArea: {
      marginHorizontal: -theme.size,
      paddingHorizontal: theme.size,
      gap: theme.size,
      flexDirection: 'row',
      paddingTop: theme.size,
      borderTopColor: theme.colorBgSecondary,
      borderTopWidth: 2,
      borderStyle: 'solid',
    },
  });
}
