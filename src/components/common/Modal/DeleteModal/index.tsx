import { Button, Icon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { XCircle } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';

interface Props {
  confirmation: string;
  message: string;
  onCancelModal: VoidFunction;
  onCompleteModal: VoidFunction;
  title: string;
  visible: boolean;
}

const DeleteModal: React.FC<Props> = (props: Props) => {
  const { onCancelModal, onCompleteModal, visible, title, message, confirmation } = props;

  const theme = useSubWalletTheme().swThemes;

  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <SwModal
      modalVisible={visible}
      modalTitle={title}
      footer={
        <View style={styles.footerModalStyle}>
          <Button
            icon={<Icon phosphorIcon={XCircle} size={'lg'} weight={'fill'} />}
            type="danger"
            onPress={onCompleteModal}>
            {i18n.common.delete}
          </Button>
        </View>
      }
      onChangeModalVisible={onCancelModal}>
      <View style={{ width: '100%' }}>
        <Text style={styles.deleteModalConfirmationStyle}>{confirmation}</Text>
        <Text style={styles.deleteModalMessageTextStyle}>{message}</Text>
      </View>
    </SwModal>
  );
};

export default DeleteModal;
