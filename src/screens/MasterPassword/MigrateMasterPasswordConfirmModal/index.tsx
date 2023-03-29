import React, { useState } from 'react';
import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { View } from 'react-native';
import { ShieldPlus } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  visible: boolean;
}

const MigrateMasterPasswordConfirmModal = ({ visible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const _style = ModalStyle(theme);
  const [modalVisible, setModalVisible] = useState<boolean>(visible);

  const onPressButton = () => {
    setModalVisible(false);
    navigation.navigate('CreatePassword', { pathName: 'MigratePassword' });
  };

  return (
    <SwModal modalVisible={modalVisible} modalTitle={'Create master password'}>
      <View style={{ width: '100%' }}>
        <Typography.Text style={_style.textStyle}>
          {
            'Your master password is the password that allows access to multiple accounts. Once a master password is confirmed, you will not need to manually type your password with every transaction.'
          }
        </Typography.Text>

        <View style={_style.footerAreaStyle}>
          <Button icon={<Icon phosphorIcon={ShieldPlus} size={'lg'} weight={'fill'} />} onPress={onPressButton}>
            {'Create master password'}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

export default MigrateMasterPasswordConfirmModal;
