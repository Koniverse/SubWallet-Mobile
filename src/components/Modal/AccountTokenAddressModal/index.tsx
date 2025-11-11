import React, { useCallback, useContext, useRef } from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AccountTokenAddress } from 'types/account';
import ToastContainer from 'react-native-toast-notifications';
import useCopyClipboard from 'hooks/common/useCopyClipboard';
import { AppModalContext } from 'providers/AppModalContext';
import { AccountTokenAddressItem } from 'components/AccountProxy/AccountTokenAddressItem';
import { SwModal, Typography } from 'components/design-system-ui';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import { ColorMap } from 'styles/color';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  items: AccountTokenAddress[];
  onCancel: () => void;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
}

const LEARN_MORE_DOCS_URL =
  'https://docs.subwallet.app/main/extension-user-guide/receive-and-transfer-assets/receive-tokens-and-nfts#select-your-preferred-bitcoin-address';

export const AccountTokenAddressModal = ({ items, onCancel, modalVisible, setModalVisible, navigation }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const toastRef = useRef<ToastContainer>(null);
  const { addressQrModal } = useContext(AppModalContext);
  const { copyToClipboard } = useCopyClipboard(toastRef);
  const insets = useSafeAreaInsets();
  const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - insets.bottom - insets.top;
  const styles = createStyle(theme);

  const onShowQr = useCallback(
    (item: AccountTokenAddress) => {
      return () => {
        const processFunction = () => {
          addressQrModal.setAddressQrModal({
            accountTokenAddresses: items,
            address: item.accountInfo.address,
            visible: true,
            selectNetwork: item.chainSlug,
            onBack: () => {
              onCancel();
              addressQrModal.hideAddressQrModal();
            },
            navigation: navigation,
          });
        };
        processFunction();
      };
    },
    [addressQrModal, items, navigation, onCancel],
  );

  const onCopyAddress = useCallback(
    (item: AccountTokenAddress) => {
      return () => {
        copyToClipboard(item.accountInfo.address || '');
        if (toastRef.current) {
          // @ts-ignore
          toastRef.current.hideAll();
          // @ts-ignore
          toastRef.current.show(i18n.common.copiedToClipboard);
        }
      };
    },
    [copyToClipboard],
  );

  const renderItem = useCallback(
    (item: AccountTokenAddress) => (
      <AccountTokenAddressItem
        item={item}
        key={`${item.accountInfo.type}_${item.accountInfo.address}`}
        onPress={onShowQr(item)}
        onPressCopyButton={onCopyAddress(item)}
        onPressQrButton={onShowQr(item)}
      />
    ),
    [onCopyAddress, onShowQr],
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    ),
    [],
  );

  return (
    <SwModal
      setVisible={setModalVisible}
      disabledOnPressBackDrop={Platform.OS === 'android'}
      modalVisible={modalVisible}
      modalTitle={'Select address type'}
      titleTextAlign={'center'}
      onBackButtonPress={onCancel}
      onChangeModalVisible={onCancel}
      level={3}
      isUseModalV2
      onBackdropPress={onCancel}>
      <>
        <Typography.Text style={{ paddingBottom: 16 }}>
          <Typography.Text style={styles.description}>
            {
              'SubWallet supports three Bitcoin address types for receiving and transferring assets. Make sure you choose the correct address type to avoid risks of fund loss. '
            }
          </Typography.Text>
          <Typography.Text style={styles.link} onPress={() => Linking.openURL(LEARN_MORE_DOCS_URL)}>
            Learn more
          </Typography.Text>
        </Typography.Text>

        <View style={{ gap: theme.sizeXS, width: '100%' }}>
          {items.length > 0 ? items.map(item => renderItem(item)) : renderEmpty()}
        </View>

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
      </>
    </SwModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    description: {
      fontSize: theme.fontSizeSM,
      fontWeight: theme.bodyFontWeight,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      textAlign: 'center',
      color: theme.colorTextTertiary,
    },
    link: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
  });
}
