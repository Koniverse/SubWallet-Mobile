import SelectAttachAccountModal from 'components/Modal/SelectAttachAccountModal';
import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import { SCAN_TYPE } from 'constants/qr';
import useModalScanner from 'hooks/scanner/useModalScanner';
import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { ImageBackground, Platform, SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { Images, SVGImages } from 'assets/index';
import { RESULTS } from 'react-native-permissions';
import { QrAccount } from 'types/account/qr';
import { requestCameraPermission } from 'utils/validators';
import Text from '../../components/Text';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { ArchiveTray, Article, Download, FileArrowUp, LockKey, QrCode, UserCirclePlus } from 'phosphor-react-native';
import { SelectImportAccountModal } from 'components/Modal/SelectImportAccountModal';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, RootStackParamList } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { AccountActionType } from 'types/ui-types';
import { EVM_ACCOUNT_TYPE, HIDE_MODAL_DURATION, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { SelectAccountTypeModal } from 'components/Modal/SelectAccountTypeModal';

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
  ...sharedStyles.mainText,
  color: ColorMap.light,
  textAlign: 'center',
  paddingHorizontal: 42,
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
  const [attachModalVisible, setAttachModalVisible] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<keyof RootStackParamList | null>(null);

  const onSuccess = useCallback(
    (qrAccount: QrAccount) => {
      navigation.navigate('AttachAccount', { screen: 'ImportAccountQrConfirm', params: qrAccount });
    },
    [navigation],
  );

  const { onOpenModal, onScan, isScanning, onHideModal } = useModalScanner(onSuccess);

  const SECRET_TYPE = useMemo(
    (): AccountActionType[] => [
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
    [navigation, onOpenModal],
  );

  const onSelectSubstrateAccount = useCallback(() => {
    setSelectTypeModalVisible(false);
    !!selectedAction && navigation.navigate(selectedAction, { keyTypes: SUBSTRATE_ACCOUNT_TYPE });
  }, [navigation, selectedAction]);

  const onSelectEvmAccount = useCallback(() => {
    setSelectTypeModalVisible(false);
    !!selectedAction && navigation.navigate(selectedAction, { keyTypes: EVM_ACCOUNT_TYPE });
  }, [navigation, selectedAction]);

  const onHideAttachModal = useCallback(() => {
    setAttachModalVisible(false);
  }, []);

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

          <SubmitButton
            leftIcon={Download}
            title={i18n.common.attachAccount}
            style={buttonStyle}
            backgroundColor={ColorMap.dark2}
            onPress={() => {
              setAttachModalVisible(true);
            }}
          />
        </View>
        {/*//TODO: add hyperlink for T&C and Privacy Policy*/}
        <Text style={firstScreenNotificationStyle}>{i18n.common.firstScreenMessage}</Text>
        <SelectImportAccountModal
          modalTitle={i18n.common.selectYourImport}
          secretTypeList={SECRET_TYPE}
          modalVisible={importSelectModalVisible}
          onChangeModalVisible={() => setSelectModalVisible(false)}
        />

        <SelectAccountTypeModal
          modalVisible={selectTypeModalVisible}
          onChangeModalVisible={() => setSelectTypeModalVisible(false)}
          onSelectSubstrateAccount={onSelectSubstrateAccount}
          onSelectEvmAccount={onSelectEvmAccount}
        />

        <SelectAttachAccountModal
          modalVisible={attachModalVisible}
          setModalVisible={setAttachModalVisible}
          onModalHide={onHideAttachModal}
        />

        <QrAddressScanner visible={isScanning} onHideModal={onHideModal} onSuccess={onScan} type={SCAN_TYPE.SECRET} />
        <SafeAreaView />
      </ImageBackground>
    </View>
  );
};
