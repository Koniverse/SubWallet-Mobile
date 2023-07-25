import React, { useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { View } from 'react-native';
import { ShieldPlus } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  visible: boolean;
}

const RequestCreateMasterPasswordModal = ({ visible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const _style = ModalStyle(theme);
  const [modalVisible, setModalVisible] = useState<boolean>(visible);

  const onPressButton = () => {
    setModalVisible(false);
    navigation.navigate('CreatePassword', { pathName: 'MigratePassword' });
  };

  return (
    <SwModal setVisible={setModalVisible} modalVisible={modalVisible} modalTitle={i18n.header.createMasterPassword}>
      <View style={{ width: '100%' }}>
        <Typography.Text style={_style.textStyle}>{i18n.message.requestCreateMasterPassword}</Typography.Text>

        <View style={_style.footerAreaStyle}>
          <Button icon={<Icon phosphorIcon={ShieldPlus} size={'lg'} weight={'fill'} />} onPress={onPressButton}>
            {i18n.buttonTitles.createMasterPassword}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

export default RequestCreateMasterPasswordModal;
