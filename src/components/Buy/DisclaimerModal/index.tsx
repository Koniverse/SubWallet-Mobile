import React from 'react';
import { View } from 'react-native';
import { CheckCircleIcon, XCircleIcon } from 'phosphor-react-native';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';
import modalStyle from './styles';

interface Props {
  modalVisible: boolean;
  onCloseModalVisible?: () => void;
  onConfirm: (isConfirmed: boolean) => () => void;
  content: React.ReactElement;
  setVisible: (arg: boolean) => void;
}

const renderLeftBtnIcon = (color: string) => (
  <Icon phosphorIcon={XCircleIcon} size={'lg'} weight="fill" iconColor={color} />
);

const renderRightBtnIcon = (color: string) => <Icon phosphorIcon={CheckCircleIcon} weight={'fill'} iconColor={color} />;

export const DisclaimerModal = ({ modalVisible, onCloseModalVisible, onConfirm, content, setVisible }: Props) => {
  const styles = modalStyle();

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setVisible}
      onChangeModalVisible={onCloseModalVisible}
      isUseForceHidden={false}
      titleTextAlign={'center'}
      modalTitle="Disclaimer">
      <View style={styles.contentWrapper}>
        {content}
        <View style={styles.buttonWrapper}>
          <Button style={{ flex: 1 }} type={'secondary'} onPress={onConfirm(false)} icon={renderLeftBtnIcon}>
            {i18n.common.cancel}
          </Button>
          <Button style={{ flex: 1 }} onPress={onConfirm(true)} type={'primary'} icon={renderRightBtnIcon}>
            {i18n.buttonTitles.agree}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};
