import React from 'react';
import { Text, View } from 'react-native';
import SwModal from './SwModal';
import Button from '../button';
import { Icon } from 'components/design-system-ui';
import { XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';

interface DeleteModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmation: string;
  onDelete: () => void;
  onChangeModalVisible?: () => void;
  loading?: boolean;
}

const DeleteModal = ({
  visible,
  title,
  message,
  confirmation,
  onDelete,
  onChangeModalVisible,
  loading,
}: DeleteModalProps) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);
  const renderFooter = () => (
    <View style={_style.footerModalStyle}>
      <Button
        disabled={loading}
        loading={loading}
        icon={<Icon phosphorIcon={XCircle} size={'lg'} weight={'fill'} />}
        type="danger"
        onPress={onDelete}>
        {'Delete'}
      </Button>
    </View>
  );
  return (
    <SwModal
      modalVisible={visible}
      modalTitle={title}
      onChangeModalVisible={onChangeModalVisible}
      footer={renderFooter()}>
      <View style={{ width: '100%' }}>
        <Text style={_style.deleteModalConfirmationStyle}>{confirmation}</Text>
        <Text style={_style.deleteModalMessageTextStyle}>{message}</Text>
      </View>
    </SwModal>
  );
};

export default DeleteModal;
