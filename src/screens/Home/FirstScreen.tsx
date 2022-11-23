import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import { SCAN_TYPE } from 'constants/qr';
import useModalScanner from 'hooks/scanner/useModalScanner';
import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { Images, SVGImages } from 'assets/index';
import { RESULTS } from 'react-native-permissions';
import { QrAccount } from 'types/account/qr';
import { requestCameraPermission } from 'utils/validators';
import Text from '../../components/Text';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import {
  ArchiveTray,
  Article,
  Eye,
  FileArrowUp,
  HardDrives,
  LockKey,
  QrCode,
  UserCirclePlus,
} from 'phosphor-react-native';
import { SelectImportAccountModal } from 'components/Modal/SelectImportAccountModal';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, RootStackParamList } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { EVM_ACCOUNT_TYPE, HIDE_MODAL_DURATION, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { SelectAccountTypeModal } from 'components/Modal/SelectAccountTypeModal';
import ToastContainer from 'react-native-toast-notifications';

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
};

const firstScreenNotificationStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  color: ColorMap.light,
  textAlign: 'center',
  paddingHorizontal: 16,
  paddingTop: 0,
  ...FontMedium,
};

const buttonStyle: StyleProp<ViewStyle> = {
  marginBottom: 16,
  width: '100%',
};

export const FirstScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [importSelectModalVisible, setSelectModalVisible] = useState<boolean>(false);
  const [selectTypeModalVisible, setSelectTypeModalVisible] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<keyof RootStackParamList | null>(null);

  const onSuccess = useCallback(
    (qrAccount: QrAccount) => {
      navigation.navigate('AttachAccount', { screen: 'ImportAccountQrConfirm', params: qrAccount });
    },
    [navigation],
  );

  const { onOpenModal, onScan, isScanning, onHideModal } = useModalScanner(onSuccess);
  const toastRef = useRef<ToastContainer>(null);
  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text);
    }
  }, []);
  const SECRET_TYPE = useMemo(
    () => [
      {
        title: 'Import Account',
        data: [
          {
            icon: Article,
            title: i18n.title.importBySecretPhrase,
            onCLickButton: () => {
              setSelectedAction('ImportSecretPhrase');
              setSelectModalVisible(false);
              setTimeout(() => {
                setSelectTypeModalVisible(true);
              }, HIDE_MODAL_DURATION);
            },
          },
          {
            icon: LockKey,
            title: i18n.title.importByPrivateKey,
            onCLickButton: () => {
              navigation.navigate('ImportPrivateKey');
              setSelectModalVisible(false);
            },
          },
          {
            icon: FileArrowUp,
            title: i18n.title.importFromJson,
            onCLickButton: () => {
              navigation.navigate('RestoreJson');
              setSelectModalVisible(false);
            },
          },
          {
            icon: QrCode,
            title: i18n.title.importByQrCode,
            onCLickButton: async () => {
              const result = await requestCameraPermission();

              if (result === RESULTS.GRANTED) {
                setSelectModalVisible(false);
                setTimeout(() => {
                  onOpenModal();
                }, HIDE_MODAL_DURATION);
              }
            },
          },
        ],
      },
      {
        title: 'Attach Account',
        data: [
          {
            icon: Eye,
            title: i18n.title.attachReadonlyAccount,
            onCLickButton: () => {
              navigation.navigate('AttachAccount', {
                screen: 'AttachReadOnly',
              });
              setSelectModalVisible(false);
            },
          },
          {
            icon: QrCode,
            title: i18n.title.attachQRSignerAccount,
            onCLickButton: async () => {
              show(i18n.common.comingSoon);
            },
          },
          {
            icon: HardDrives,
            title: i18n.title.connectLedgerDevice,
            onCLickButton: () => {
              show(i18n.common.comingSoon);
            },
          },
        ],
      },
    ],
    [navigation, onOpenModal, show],
  );

  const onSelectSubstrateAccount = useCallback(() => {
    setSelectTypeModalVisible(false);
    !!selectedAction && navigation.navigate(selectedAction, { keyTypes: SUBSTRATE_ACCOUNT_TYPE });
  }, [navigation, selectedAction]);

  const onSelectEvmAccount = useCallback(() => {
    setSelectTypeModalVisible(false);
    !!selectedAction && navigation.navigate(selectedAction, { keyTypes: EVM_ACCOUNT_TYPE });
  }, [navigation, selectedAction]);

  return (
    <View style={{ width: '100%', flex: 1 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={Images.loadingScreen} resizeMode={'cover'} style={imageBackgroundStyle}>
        <SafeAreaView />
        <View style={logoStyle}>
          <View style={{ flex: 1, justifyContent: 'center', marginBottom: 16, paddingTop: 40 }}>
            <Suspense fallback={<View style={{ width: 230, height: 230 }} />}>
              <SVGImages.SubWallet2 width={230} height={230} />
            </Suspense>
          </View>

          <SubmitButton
            leftIcon={UserCirclePlus}
            title={i18n.common.createNewWalletAccount}
            style={{ ...buttonStyle, marginTop: 48 }}
            onPress={() => {
              setSelectedAction('CreateAccount');
              setSelectTypeModalVisible(true);
            }}
          />

          <SubmitButton
            leftIcon={ArchiveTray}
            title={i18n.common.importAlreadyAccount}
            style={buttonStyle}
            backgroundColor={ColorMap.dark2}
            onPress={() => {
              setSelectModalVisible(true);
            }}
          />
        </View>
        {/*//TODO: add hyperlink for T&C and Privacy Policy*/}
        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenMessagePart1}</Text>
        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenMessagePart2}</Text>

        <SelectImportAccountModal
          modalTitle={i18n.common.selectYourImport}
          secretTypeList={SECRET_TYPE}
          modalVisible={importSelectModalVisible}
          toastRef={toastRef}
          onChangeModalVisible={() => setSelectModalVisible(false)}
        />

        <SelectAccountTypeModal
          modalVisible={selectTypeModalVisible}
          onChangeModalVisible={() => setSelectTypeModalVisible(false)}
          onSelectSubstrateAccount={onSelectSubstrateAccount}
          onSelectEvmAccount={onSelectEvmAccount}
        />

        <QrAddressScanner visible={isScanning} onHideModal={onHideModal} onSuccess={onScan} type={SCAN_TYPE.SECRET} />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
