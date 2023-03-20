import { useNavigation } from '@react-navigation/native';
import { Images, Logo } from 'assets/index';
import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { SCAN_TYPE } from 'constants/qr';
import useModalScanner from 'hooks/qr/useModalScanner';
import {
  DeviceTabletCamera,
  Eye,
  FileArrowDown,
  FileJs,
  Leaf,
  PlusCircle,
  QrCode,
  ShareNetwork,
  Swatches,
  Wallet,
} from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Platform, SafeAreaView, StatusBar, StyleProp, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import ToastContainer from 'react-native-toast-notifications';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { QrAccount } from 'types/qr/attach';
import i18n from 'utils/i18n/i18n';
import { requestCameraPermission } from 'utils/permission/camera';
import Text from 'components/Text';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import AccountActionSelectModal from 'components/Modal/AccountActionSelectModal';
import AccountActionButton from 'components/common/AccountActionButton';

const imageBackgroundStyle: StyleProp<any> = {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: Platform.OS === 'ios' ? 56 : 20,
  position: 'relative',
};

const logoStyle: StyleProp<any> = {
  width: '100%',
  flex: 1,
  justifyContent: 'flex-end',
  position: 'relative',
  alignItems: 'center',
  paddingBottom: 22,
};

const logoTextStyle: StyleProp<any> = {
  fontSize: 38,
  lineHeight: 46,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingTop: 9,
};

const logoSubTextStyle: StyleProp<any> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontMedium,
  color: 'rgba(255, 255, 255, 0.65)',
  paddingTop: 12,
};

const firstScreenNotificationStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  color: 'rgba(255, 255, 255, 0.45)',
  textAlign: 'center',
  paddingHorizontal: 16,
  paddingTop: 0,
  ...FontMedium,
};

export const FirstScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [importSelectModalVisible, setImportSelectModalVisible] = useState<boolean>(false);
  const [attachAccountModalVisible, setAttachAccountModalVisible] = useState<boolean>(false);
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState<boolean>(false);
  const [scanType, setScanType] = useState<SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET>(SCAN_TYPE.SECRET);
  const theme = useSubWalletTheme().swThemes;
  const toastRef = useRef<ToastContainer>(null);
  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text);
    }
  }, []);
  const onSuccess = useCallback(
    (data: QrAccount) => {
      switch (scanType) {
        case SCAN_TYPE.QR_SIGNER:
          navigation.navigate('AttachAccount', {
            screen: 'AttachQrSignerConfirm',
            params: data,
          });
          break;
        case SCAN_TYPE.SECRET:
          navigation.navigate('AttachAccount', {
            screen: 'ImportAccountQrConfirm',
            params: data,
          });
          break;
        default:
          break;
      }
    },
    [navigation, scanType],
  );
  const { onOpenModal, onScan, isScanning, onHideModal } = useModalScanner(onSuccess);

  const actionList = [
    {
      key: 'create',
      icon: PlusCircle,
      title: 'Create a new account',
      subTitle: 'Create a new account with SubWallet',
      onPress: () => {
        setCreateAccountModalVisible(true);
      },
    },
    {
      key: 'import',
      icon: FileArrowDown,
      title: 'Import an account',
      subTitle: 'Import an existing account',
      onPress: () => {
        setImportSelectModalVisible(true);
      },
    },
    {
      key: 'attach',
      icon: Swatches,
      title: 'Attach an account',
      subTitle: 'Attach an account from external wallet',
      onPress: () => {
        setAttachAccountModalVisible(true);
      },
    },
  ];

  const createAccountAction = useMemo(() => {
    return [
      {
        backgroundColor: '#51BC5E',
        icon: PlusCircle,
        label: 'Create with new Seed Phrase',
        onClickBtn: () => {
          setCreateAccountModalVisible(false);
          navigation.navigate('CreateAccount', {});
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: ShareNetwork,
        label: 'Derive from another account',
        onClickBtn: () => {
          setCreateAccountModalVisible(false);
          navigation.navigate('CreateAccount', {});
        },
      },
    ];
  }, [navigation]);

  const importAccountActions = useMemo(
    () => [
      {
        backgroundColor: '#51BC5E',
        icon: Leaf,
        label: 'Import from Seed Phrase',
        onClickBtn: () => {
          setImportSelectModalVisible(false);
          navigation.navigate('ImportSecretPhrase');
        },
      },
      {
        backgroundColor: '#E68F25',
        icon: FileJs,
        label: 'Restore from Polkadot {.js}',
        onClickBtn: () => {
          setImportSelectModalVisible(false);
          navigation.navigate('RestoreJson');
        },
      },
      {
        backgroundColor: '#4D4D4D',
        icon: Wallet,
        label: 'Import from MetaMask',
        onClickBtn: () => {
          setImportSelectModalVisible(false);
          navigation.navigate('ImportPrivateKey');
        },
      },
      {
        backgroundColor: '#2565E6',
        icon: QrCode,
        label: 'Import by QR Code',
        onClickBtn: async () => {
          const result = await requestCameraPermission();

          if (result === RESULTS.GRANTED) {
            setScanType(SCAN_TYPE.SECRET);
            setImportSelectModalVisible(false);
            setTimeout(() => {
              onOpenModal();
            }, HIDE_MODAL_DURATION);
          }
        },
      },
    ],
    [navigation, onOpenModal],
  );

  const attachAccountActions = useMemo(
    () => [
      {
        backgroundColor: '#E68F25',
        icon: Swatches,
        label: 'Connect Ledger device',
        onClickBtn: () => {
          show(i18n.common.comingSoon);
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: QrCode,
        label: 'Attach QR-Signer account',
        onClickBtn: async () => {
          const result = await requestCameraPermission();

          if (result === RESULTS.GRANTED) {
            setScanType(SCAN_TYPE.QR_SIGNER);
            setAttachAccountModalVisible(false);
            setTimeout(() => {
              onOpenModal();
            }, HIDE_MODAL_DURATION);
          }
        },
      },
      {
        backgroundColor: '#E6478E',
        icon: DeviceTabletCamera,
        label: 'Attach Keystone account',
        onClickBtn: () => {
          show(i18n.common.comingSoon);
        },
      },
      {
        backgroundColor: '#2DA73F',
        icon: Eye,
        label: 'Attach read-only account',
        onClickBtn: () => {
          setAttachAccountModalVisible(false);
          navigation.navigate('AttachAccount', {
            screen: 'AttachReadOnly',
          });
        },
      },
    ],
    [navigation, onOpenModal, show],
  );

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={imageBackgroundStyle}>
        <SafeAreaView />
        <View style={logoStyle}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginBottom: 16,
              paddingTop: 40,
              alignItems: 'center',
            }}>
            <Image source={Logo.SubWallet} />
            <Text style={logoTextStyle}>SubWallet</Text>
            <Text style={logoSubTextStyle}>Polkadot, Substrate & Ethereum wallet</Text>
          </View>

          <View style={{ width: '100%' }}>
            {actionList.map(item => (
              <AccountActionButton key={item.key} item={item} />
            ))}
          </View>
        </View>

        {/*//TODO: add hyperlink for T&C and Privacy Policy*/}
        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenMessagePart1}</Text>
        <Text style={firstScreenNotificationStyle}>
          <Text style={{ color: theme.colorTextLight1 }}>{i18n.common.termAndConditions}</Text>
          <Text>{i18n.common.and}</Text>
          <Text style={{ color: theme.colorTextLight1 }}>{i18n.common.privacyPolicy}</Text>
        </Text>

        <AccountActionSelectModal
          modalTitle={'Create new account'}
          modalVisible={createAccountModalVisible}
          onChangeModalVisible={() => setCreateAccountModalVisible(false)}
          items={createAccountAction}
        />

        <AccountActionSelectModal
          modalTitle={'Import account'}
          modalVisible={importSelectModalVisible}
          onChangeModalVisible={() => setImportSelectModalVisible(false)}
          items={importAccountActions}
        />

        <AccountActionSelectModal
          modalTitle={'Attach account'}
          modalVisible={attachAccountModalVisible}
          onChangeModalVisible={() => setAttachAccountModalVisible(false)}
          items={attachAccountActions}
          toastRef={toastRef}
        />

        <QrAddressScanner visible={isScanning} onHideModal={onHideModal} onSuccess={onScan} type={scanType} />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
