import React, { useCallback } from 'react';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { Linking, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';
import { BACKUP_SEED_PHRASE_CODE_URL } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { UPGRADE_DUPLICATE_ACCOUNT_NAME } from '@subwallet/extension-base/constants';
import { noop } from 'utils/function';
import { setValueLocalStorageWS } from 'messaging/database';
interface Props {
  modalVisible: boolean;
  setVisible: (value: boolean) => void;
}

export const RemindDuplicateAccountNameModal = ({ modalVisible, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const onCancel = useCallback(() => {
    setVisible(false);
    setValueLocalStorageWS({ key: UPGRADE_DUPLICATE_ACCOUNT_NAME, value: 'false' }).catch(noop);
  }, [setVisible]);

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setVisible}
      disabledOnPressBackDrop={true}
      isAllowSwipeDown={false}
      titleTextAlign={'center'}
      hideWhenCloseApp={false}
      modalTitle={'Duplicate account name'}>
      <View style={{ position: 'relative' }}>
        <View style={{ alignItems: 'center' }}>
          <PageIcon icon={Warning} color={theme['colorWarning-5']} />

          <Typography.Text
            style={{
              fontSize: theme.fontSizeHeading6,
              lineHeight: theme.fontSizeHeading6 * theme.lineHeightHeading6,
              color: theme.colorTextLight4,
              textAlign: 'center',
              ...FontMedium,
              marginTop: theme.paddingMD,
            }}>
            <Typography.Text>
              {
                'You have accounts with the same name. We have added characters to these account names to differentiate them. You can change account names later using '
              }
            </Typography.Text>
            <Typography.Text
              onPress={() => Linking.openURL(BACKUP_SEED_PHRASE_CODE_URL)}
              style={{ color: theme.colorLink, textDecorationLine: 'underline' }}>
              {'this guide'}
            </Typography.Text>
          </Typography.Text>
        </View>
        <Button style={{ marginTop: theme.margin }} onPress={onCancel}>
          {i18n.buttonTitles.iUnderstand}
        </Button>
      </View>
    </SwModal>
  );
};
