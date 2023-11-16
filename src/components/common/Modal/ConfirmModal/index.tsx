import { Button, Icon, Logo, PageIcon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle, IconProps, IconWeight, PlugsConnected } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';
import { noop } from 'utils/function';

interface Props {
  message: string;
  messageIcon?: string;
  customIcon?: { icon: React.ElementType<IconProps>; color: string; weight?: IconWeight };
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
  customIcon = { icon: PlugsConnected, color: '#d9c500' },
  completeBtnTitle,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  const renderModalIcon = useCallback(() => {
    if (messageIcon) {
      return <Logo network={messageIcon} size={100} />;
    } else {
      return <PageIcon icon={customIcon?.icon} color={customIcon?.color} weight={customIcon?.weight} />;
    }
  }, [customIcon, messageIcon]);

  return (
    <SwModal
      setVisible={noop}
      isUseForceHidden={false}
      modalVisible={visible}
      modalTitle={title}
      titleTextAlign="center"
      isUseModalV2
      footer={
        <>
          <View style={styles.footerModalStyle}>
            <Button type="secondary" style={{ flex: 1, marginRight: 12 }} onPress={onCancelModal}>
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
        <View style={{ paddingBottom: 20 }}>{renderModalIcon()}</View>
        <Text style={styles.confirmModalMessageTextStyle}>{message}</Text>
      </View>
    </SwModal>
  );
};

export default ConfirmModal;
