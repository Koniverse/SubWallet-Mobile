import { Logo, PageIcon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { PlugsConnected } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import createStyle from './styles';
import { noop } from 'utils/function';
import { OnlineButtonGroups } from 'components/StaticContent/OnlineButtonGroups';
import { AppContentButton } from 'types/staticContent';

interface Props {
  message: string;
  messageIcon?: string;
  title: string;
  visible: boolean;
  buttons: AppContentButton[];
  onPressButton?: (url?: string) => void;
  onCloseModal?: () => void;
}

const GlobalModal: React.FC<Props> = ({
  visible,
  title,
  message,
  messageIcon,
  buttons,
  onCloseModal,
  onPressButton,
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
      footer={
        <OnlineButtonGroups
          buttons={buttons}
          onPressButton={(url?: string) => {
            onPressButton && onPressButton(url);
            onCloseModal && onCloseModal();
          }}
        />
      }
      onBackButtonPress={onCloseModal}
      onChangeModalVisible={onCloseModal}>
      <View style={{ width: '100%', alignItems: 'center', paddingTop: 10 }}>
        <View style={{ paddingBottom: 20 }}>
          {messageIcon ? (
            <Logo network={messageIcon} size={100} />
          ) : (
            <PageIcon icon={PlugsConnected} color={theme.colorWarning} />
          )}
        </View>
        <Text style={styles.confirmModalMessageTextStyle}>{message}</Text>
      </View>
    </SwModal>
  );
};

export default GlobalModal;
