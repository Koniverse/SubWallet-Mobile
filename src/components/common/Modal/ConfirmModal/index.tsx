import { Button, Icon, Logo, PageIcon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, PlugsConnected, XCircle } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';
import { noop } from 'utils/function';

interface Props {
  message: string;
  messageIcon?: string;
  customIcon?: React.ReactNode;
  title: string;
  visible: boolean;
  onCompleteModal?: VoidFunction;
  onCancelModal?: VoidFunction;
  completeBtnTitle?: string;
}

const ConfirmModal: React.FC<Props> = ({
  onCancelModal,
  onCompleteModal,
  visible,
  title,
  message,
  messageIcon,
  customIcon,
  completeBtnTitle,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <SwModal
      setVisible={noop}
      isUseForceHidden={false}
      modalVisible={visible}
      modalTitle={title}
      titleTextAlign="center"
      isUseModalV2
      level={5}
      footer={
        <>
          <View style={styles.footerModalStyle}>
            <Button
              type="secondary"
              style={{ flex: 1, marginRight: 12 }}
              onPress={onCancelModal}
              icon={<Icon phosphorIcon={XCircle} size={'lg'} weight={'fill'} />}>
              {i18n.common.cancel}
            </Button>
            <Button
              style={{ flex: 1 }}
              icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}
              type="primary"
              onPress={onCompleteModal}>
              {completeBtnTitle || i18n.common.connect}
            </Button>
          </View>
        </>
      }
      onBackButtonPress={onCancelModal}
      onChangeModalVisible={onCancelModal}>
      <View style={{ width: '100%', alignItems: 'center', paddingTop: 10 }}>
        <View style={{ paddingBottom: 20 }}>
          {messageIcon ? (
            <Logo network={messageIcon} size={100} />
          ) : customIcon ? (
            <>{customIcon}</>
          ) : (
            <PageIcon icon={PlugsConnected} color={theme.colorWarning} />
          )}
        </View>
        <Text style={styles.confirmModalMessageTextStyle}>{message}</Text>
      </View>
    </SwModal>
  );
};

export default ConfirmModal;
