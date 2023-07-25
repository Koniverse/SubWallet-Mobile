import { Button, Icon, PageIcon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { IconProps, Trash, XCircle } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  message: string;
  onCancelModal?: VoidFunction;
  onCompleteModal: VoidFunction;
  title: string;
  visible: boolean;
  buttonTitle?: string;
  buttonIcon?: (iconProps: IconProps) => JSX.Element;
  loading?: boolean;
  setVisible: (arg: boolean) => void;
}

const DeleteModal: React.FC<Props> = (props: Props) => {
  const {
    onCompleteModal,
    visible,
    title,
    message,
    buttonTitle,
    buttonIcon: ButtonIcon,
    loading,
    setVisible,
    onCancelModal,
  } = props;
  const deleteModalRef = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const closeModal = useCallback(() => {
    onCancelModal && onCancelModal();
    deleteModalRef?.current?.close();
  }, [onCancelModal]);

  return (
    <SwModal
      isUseModalV2
      modalBaseV2Ref={deleteModalRef}
      setVisible={setVisible}
      modalVisible={visible}
      modalTitle={title}
      titleTextAlign={'center'}
      footer={
        <View style={styles.footerModalStyle}>
          <Button
            disabled={loading}
            loading={loading}
            icon={<Icon phosphorIcon={ButtonIcon || XCircle} size={'lg'} weight={'fill'} />}
            type="danger"
            onPress={onCompleteModal}>
            {buttonTitle || i18n.buttonTitles.delete}
          </Button>
        </View>
      }
      onBackButtonPress={closeModal}
      onChangeModalVisible={onCancelModal}>
      <View style={{ width: '100%', alignItems: 'center', paddingTop: 10 }}>
        <View style={{ paddingBottom: 20 }}>
          <PageIcon icon={Trash} color={theme.colorError} />
        </View>
        <Text style={styles.deleteModalMessageTextStyle}>{message}</Text>
      </View>
    </SwModal>
  );
};

export default DeleteModal;
