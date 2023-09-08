import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { ArrowCounterClockwise, TrashSimple, WarningCircle, X } from 'phosphor-react-native';
import { Button, Icon, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { ThemeTypes } from 'styles/themes';
import ActionHeader from 'components/design-system-ui/modal/ActionHeader';

interface Props {
  modalVisible: boolean;
  onCloseModalVisible?: () => void;
  onReset: (resetAll: boolean) => () => void;
  resetAccLoading: boolean;
  eraseAllLoading: boolean;
}

const renderLeftBtnIcon = (color: string) => (
  <Icon phosphorIcon={ArrowCounterClockwise} size={'lg'} iconColor={color} />
);

const renderRightBtnIcon = (color: string) => <Icon phosphorIcon={TrashSimple} weight={'fill'} iconColor={color} />;

export const ForgotPasswordModal = ({
  modalVisible,
  onCloseModalVisible,
  onReset,
  resetAccLoading,
  eraseAllLoading,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  return (
    <SwModal
      setVisible={onReset}
      onChangeModalVisible={onCloseModalVisible}
      modalVisible={modalVisible}
      isUseForceHidden={false}
      titleTextAlign={'center'}
      renderHeader={
        <ActionHeader
          title={i18n.common.forgotPassword}
          renderLeftAction={<Icon phosphorIcon={X} size="md" />}
          onPressLeft={onCloseModalVisible}
        />
      }>
      <View style={styles.contentWrapper}>
        <PageIcon icon={WarningCircle} color={theme.colorError} />
        <Typography.Text style={styles.forgotMessage}>{i18n.message.forgotPasswordMessage}</Typography.Text>
        <View style={styles.buttonWrapper}>
          <Button
            style={{ flex: 1 }}
            type={'secondary'}
            onPress={onReset(false)}
            loading={resetAccLoading}
            disabled={resetAccLoading || eraseAllLoading}
            icon={renderLeftBtnIcon}>
            {i18n.common.resetAccount}
          </Button>
          <Button
            disabled={resetAccLoading || eraseAllLoading}
            loading={eraseAllLoading}
            style={{ flex: 1 }}
            onPress={onReset(true)}
            type={'danger'}
            icon={renderRightBtnIcon}>
            {i18n.common.eraseAll}
          </Button>
        </View>
      </View>
    </SwModal>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    contentWrapper: { width: '100%', alignItems: 'center', paddingTop: theme.padding },
    forgotMessage: {
      ...FontMedium,
      color: theme.colorTextTertiary,
      textAlign: 'center',
      paddingTop: theme.paddingMD,
      paddingHorizontal: theme.padding,
    },
    buttonWrapper: { flexDirection: 'row', width: '100%', gap: theme.paddingSM, paddingTop: theme.paddingSM },
  });
}
