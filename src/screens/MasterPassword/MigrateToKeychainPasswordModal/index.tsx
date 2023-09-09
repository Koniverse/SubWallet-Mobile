/** This is a popup notice user use master password to unlock app, instead of PIN code */
import React from 'react';
import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { View } from 'react-native';
import { ArrowCircleRight, ShieldStar } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  setModalVisible: (arg: boolean) => void;
  isBiometricV1Enabled: boolean;
  onPress: () => void;
}

const MigrateToKeychainPasswordModal = ({ modalVisible, setModalVisible, isBiometricV1Enabled, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);

  const onPressButton = () => {
    setModalVisible(false);
    !!onPress && onPress();
  };

  return (
    <SwModal
      isUseForceHidden={false}
      setVisible={setModalVisible}
      modalVisible={modalVisible}
      titleTextAlign="center"
      modalTitle={i18n.header.applyMasterPassword}>
      <View style={_style.modalWrapper}>
        <PageIcon icon={ShieldStar} color={theme.colorSuccess} />
        <Typography.Text style={_style.textStyle}>
          {isBiometricV1Enabled ? i18n.message.migrateMasterPasswordForBiometric : i18n.message.noticeForNewLoginMethod}
        </Typography.Text>

        <Button
          icon={<Icon phosphorIcon={ArrowCircleRight} iconColor="white" size="md" weight="fill" />}
          style={_style.footerAreaStyle}
          onPress={onPressButton}>
          {i18n.buttonTitles.enterMasterPassword}
        </Button>
      </View>
    </SwModal>
  );
};

export default MigrateToKeychainPasswordModal;
