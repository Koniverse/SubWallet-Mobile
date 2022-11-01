import { useNavigation } from '@react-navigation/native';
import QrAddressScanner from 'components/Scanner/QrAddressScanner';
import { Eye, HardDrives, QrCode } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import { StyleProp, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { RootNavigationProps } from 'routes/index';
import { QrAccount } from 'types/account/qr';
import i18n from 'utils/i18n/i18n';
import { requestCameraPermission } from 'utils/validators';
import Text from '../Text';
import { FontBold, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SecretTypeItem } from 'components/SecretTypeItem';
import { AccountActionType } from 'types/ui-types';
import { deviceHeight, HIDE_MODAL_DURATION } from 'constants/index';
import Toast from 'react-native-toast-notifications';
import ToastContainer from 'react-native-toast-notifications';

interface Props {
  modalVisible: boolean;
  setModalVisible: (val: boolean) => void;
  onModalHide?: () => void;
}

const modalTitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  color: ColorMap.light,
  paddingBottom: 16,
  textAlign: 'center',
};

const SelectAttachAccountModal = ({ modalVisible, setModalVisible, onModalHide }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();

  const toastRef = useRef<ToastContainer>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const show = useCallback((text: string) => {
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(text);
    }
  }, []);

  const secretTypeList = useMemo(
    (): AccountActionType[] => [
      {
        icon: Eye,
        title: i18n.title.attachReadonlyAccount,
        onCLickButton: () => {
          navigation.navigate('AttachAccount', {
            screen: 'AttachReadOnly',
          });
          setModalVisible(false);
        },
      },
      {
        icon: QrCode,
        title: i18n.title.attachQRSignerAccount,
        onCLickButton: async () => {
          const result = await requestCameraPermission();

          if (result === RESULTS.GRANTED) {
            setModalVisible(false);
            setTimeout(() => {
              setIsScanning(true);
            }, HIDE_MODAL_DURATION);
          }
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
    [navigation, setModalVisible, show],
  );

  const onChangeModalVisible = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const scanSuccess = useCallback(
    (data: QrAccount) => {
      navigation.navigate('AttachAccount', {
        screen: 'AttachQrSignerConfirm',
        params: data,
      });
      setIsScanning(false);
    },
    [navigation],
  );

  const cancelScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  return (
    <>
      <SubWalletModal modalVisible={modalVisible} onModalHide={onModalHide} onChangeModalVisible={onChangeModalVisible}>
        <View style={{ width: '100%' }}>
          <Text style={modalTitleStyle}>{i18n.title.attachAccount}</Text>
          {secretTypeList.map(item => (
            <SecretTypeItem key={item.title} title={item.title} icon={item.icon} onClickButton={item.onCLickButton} />
          ))}
        </View>

        <Toast
          duration={1500}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
        />
      </SubWalletModal>
      <QrAddressScanner visible={isScanning} onHideModal={cancelScanning} onSuccess={scanSuccess} />
    </>
  );
};

export default React.memo(SelectAttachAccountModal);
