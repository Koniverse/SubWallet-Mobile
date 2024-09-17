import React from 'react';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { Linking, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';
import { USER_GUIDE_URL } from 'constants/index';
import { mmkvStore } from 'utils/storage';

interface Props {
  modalVisible: boolean;
  setVisible: (value: boolean) => void;
}

export const NoticeModal = ({ modalVisible, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const onCloseModal = () => {
    mmkvStore.set('isOpenedNoticeModal', true);
    setVisible(false);
  };

  const onPressConfirm = () => {
    mmkvStore.set('isOpenedNoticeModal', true);
    setVisible(false);
    Linking.openSettings();
  };

  return (
    <SwModal
      isUseModalV2
      modalVisible={modalVisible}
      setVisible={setVisible}
      disabledOnPressBackDrop={true}
      isAllowSwipeDown={false}
      titleTextAlign={'center'}
      hideWhenCloseApp={false}
      modalTitle={'Update your iOS now!'}>
      <View style={{ position: 'relative' }}>
        <View style={{ alignItems: 'center' }}>
          <PageIcon icon={Warning} color={theme.colorWarning} weight={'regular'} />

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
                'v1.1.80 is the last version available for devices running iOS 16.4 or older. Update iOS now to continue using SubWallet mobile app, or switch to browser extension by following'
              }
            </Typography.Text>
            <Typography.Text
              onPress={() => Linking.openURL(USER_GUIDE_URL)}
              style={{ color: theme.colorLink, textDecorationLine: 'underline' }}>
              {' this guide'}
            </Typography.Text>
          </Typography.Text>
        </View>
        <View style={{ flexDirection: 'row', gap: theme.paddingSM, marginTop: theme.margin }}>
          <Button style={{ flex: 1 }} type={'secondary'} onPress={onCloseModal}>
            Dismiss
          </Button>

          <Button style={{ flex: 1 }} onPress={onPressConfirm}>
            Update now
          </Button>
        </View>
      </View>
    </SwModal>
  );
};
