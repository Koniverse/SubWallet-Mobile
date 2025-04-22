import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { VoidFunction } from 'types/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { AppModalContext } from 'providers/AppModalContext';
import { SwModal, Typography } from 'components/design-system-ui';
import AccountChainAddressWithStatusItem from 'components/AccountProxy/AccountChainAddressWithStatusItem';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import Clipboard from '@react-native-clipboard/clipboard';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, TOAST_DURATION } from 'constants/index';
import { ColorMap } from 'styles/color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
export interface SelectAddressFormatModalProps {
  address: string;
  chainSlug: string;
  name: string;
}

type Props = SelectAddressFormatModalProps & {
  visible: boolean;
  setVisible: (value: boolean) => void;
  onCancel: VoidFunction;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
};

export type AddressFormatInfo = {
  name: string;
  slug: string;
  address: string;
  isNewFormat: boolean;
};

const LEARN_MORE_DOCS_URL =
  'https://address-format-guide.notion.site/Unified-address-format-integration-guide-12dffd09c4a280c0a1ebc475657dd6f6';

const SelectAddressFormatModal: React.FC<Props> = ({
  address,
  chainSlug,
  name,
  visible,
  setVisible,
  onCancel,
  navigation,
}: Props) => {
  const modalRef = useRef<SWModalRefProps>(null);
  const toastRef = useRef<ToastContainer>(null);
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const chainOldPrefixMap = useSelector((state: RootState) => state.chainStore.chainOldPrefixMap);
  const { addressQrModal } = useContext(AppModalContext);
  const insets = useSafeAreaInsets();
  const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - insets.bottom - insets.top;

  const copyToClipboard = useCallback((text: string) => {
    return () => {
      Clipboard.setString(text);
      if (toastRef.current) {
        // @ts-ignore
        toastRef.current.hideAll();
        // @ts-ignore
        toastRef.current.show(i18n.common.copiedToClipboard);
      }
    };
  }, []);

  const oldPrefixAddress = useMemo(() => {
    return chainOldPrefixMap[chainSlug];
  }, [chainOldPrefixMap, chainSlug]);
  const listItem: AddressFormatInfo[] = useMemo(() => {
    const legacyAccInfoItem: AddressFormatInfo = {
      address: reformatAddress(address, oldPrefixAddress),
      name: name,
      slug: chainSlug,
      isNewFormat: false,
    };

    const newAccInfoInfo: AddressFormatInfo = {
      ...legacyAccInfoItem,
      isNewFormat: true,
      address: address,
    };

    return [legacyAccInfoItem, newAccInfoInfo];
  }, [address, oldPrefixAddress, name, chainSlug]);

  const onShowQr = useCallback(
    (item: AddressFormatInfo) => {
      return () => {
        const processFunction = () => {
          addressQrModal.setAddressQrModal({
            address: item.address,
            visible: true,
            selectNetwork: item.slug,
            isNewFormat: item.isNewFormat,
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
    [addressQrModal, navigation, onCancel],
  );

  const onCopyAddress = useCallback(
    (item: AddressFormatInfo) => {
      return () => {
        const processFunc = () => {
          copyToClipboard(item.address || '')();
        };

        processFunc();
      };
    },
    [copyToClipboard],
  );

  const renderEmptyList = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

  return (
    <SwModal
      modalBaseV2Ref={modalRef}
      setVisible={setVisible}
      onBackdropPress={onCancel}
      disabledOnPressBackDrop={Platform.OS === 'android'}
      modalVisible={visible}
      onBackButtonPress={onCancel}
      titleTextAlign={'center'}
      isUseModalV2
      level={3}
      onChangeModalVisible={onCancel}
      modalTitle={'Select address format'}>
      <>
        <Typography.Text style={{ alignItems: 'center', textAlign: 'center', paddingBottom: theme.padding }}>
          <Typography.Text size={'sm'} style={{ color: theme.colorTextTertiary }}>
            {
              'Some exchanges are still using legacy format for token deposit and withdrawal. Make sure you choose the correct address format to avoid risks of fund loss. '
            }
          </Typography.Text>
          <Typography.Text size={'sm'} style={styles.highlight} onPress={() => Linking.openURL(LEARN_MORE_DOCS_URL)}>
            {'Learn more'}
          </Typography.Text>
        </Typography.Text>
        {listItem.length ? (
          <View style={{ gap: theme.sizeXS }}>
            {listItem.map(item => (
              <AccountChainAddressWithStatusItem
                address={item.address}
                chainName={item.name}
                isNewFormat={item.isNewFormat}
                key={`${item.address}-${item.slug}`}
                onPressCopyButton={onCopyAddress(item)}
                onPressQrButton={onShowQr(item)}
                tokenSlug={item.slug}
              />
            ))}
          </View>
        ) : (
          renderEmptyList()
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
      </>
    </SwModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    highlight: {
      color: theme.colorPrimary,
      textDecorationLine: 'underline',
    },
  });
}

export default SelectAddressFormatModal;
