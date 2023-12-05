import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { WarningCircle } from 'phosphor-react-native';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

interface Props {
  modalVisible: boolean;
  onCloseModalVisible?: () => void;
  setVisible: (value: boolean) => void;
  onPressDownloadBtn: () => void;
}

export const DownloadSeedPhraseModal = ({
  modalVisible,
  onCloseModalVisible,
  setVisible,
  onPressDownloadBtn,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  return (
    <SwModal
      setVisible={setVisible}
      onChangeModalVisible={onCloseModalVisible}
      modalVisible={modalVisible}
      isUseModalV2
      titleTextAlign={'center'}
      modalTitle={'Download your seed phrase?'}>
      <View style={styles.contentWrapper}>
        <PageIcon icon={WarningCircle} color={theme.colorWarning} />
        <Typography.Text style={styles.forgotMessage}>
          {'You can download your seed phrase and store locally in this device. However, this is NOT recommended.'}
        </Typography.Text>
        <View style={styles.buttonWrapper}>
          <Button style={{ flex: 1 }} type={'secondary'} onPress={() => setVisible(false)}>
            {'Cancel'}
          </Button>
          <Button style={{ flex: 1 }} type={'warning'} onPress={onPressDownloadBtn}>
            {'Download'}
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
