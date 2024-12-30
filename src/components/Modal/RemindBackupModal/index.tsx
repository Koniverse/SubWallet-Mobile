import React, { useRef } from 'react';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { Linking, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ShieldCheck } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';
import { mmkvStore } from 'utils/storage';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ModalRef } from 'types/modalRef';
import { isShowRemindBackupModal, setIsShowRemindBackupModal } from 'screens/Home';
import { BACKUP_SEED_PHRASE_CODE_URL } from 'constants/index';
import { AccountProxySelector } from '../common/AccountSelectorNew';
import { AccountProxyItem } from 'screens/Account/AccountsScreen';
import { AccountProxyType } from '@subwallet/extension-base/types';

interface Props {
  modalVisible: boolean;
  setVisible: (value: boolean) => void;
}

export const RemindBackupModal = ({ modalVisible, setVisible }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { accountProxies, currentAccountProxy } = useSelector((state: RootState) => state.accountState);
  const accountSelectorRef = useRef<ModalRef>();
  const onSetCurrentRemindBackupTimeout = () => {
    mmkvStore.set('lastTimeLogin', Date.now());
    mmkvStore.set('remindBackupTimeout', Date.now());
  };
  const onSelectItem = (item: AccountProxyItem) => {
    navigation.navigate('AccountExport', { address: item?.id || '' });
  };

  const onBackUpAccount = () => {
    if (currentAccountProxy) {
      if ([AccountProxyType.SOLO, AccountProxyType.UNIFIED].includes(currentAccountProxy.accountType)) {
        navigation.navigate('AccountExport', { address: currentAccountProxy?.id || '' });
      } else {
        accountSelectorRef.current?.onOpenModal();
      }
    } else {
      accountSelectorRef.current?.onOpenModal();
    }
  };

  return (
    <>
      {!isShowRemindBackupModal.current && (
        <SwModal
          isUseModalV2
          modalVisible={modalVisible}
          setVisible={setVisible}
          disabledOnPressBackDrop={true}
          isAllowSwipeDown={false}
          titleTextAlign={'center'}
          hideWhenCloseApp={false}
          modalTitle={'Back up your seed phrase!'}>
          <View style={{ position: 'relative' }}>
            <View style={{ alignItems: 'center' }}>
              <PageIcon icon={ShieldCheck} color={theme.colorPrimary} />

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
                    'Once your seed phrase is lost, there is no way to recover your account. Back up now to secure your funds or learn how to with our'
                  }
                </Typography.Text>
                <Typography.Text
                  onPress={() => Linking.openURL(BACKUP_SEED_PHRASE_CODE_URL)}
                  style={{ color: theme.colorLink, textDecorationLine: 'underline' }}>
                  {' user guide.'}
                </Typography.Text>
              </Typography.Text>
            </View>
            <View style={{ flexDirection: 'row', gap: theme.paddingSM, marginTop: theme.margin }}>
              <Button
                style={{ flex: 1 }}
                type={'secondary'}
                onPress={() => {
                  onSetCurrentRemindBackupTimeout();
                  mmkvStore.set('isOpenGeneralTermFirstTime', true);
                  setVisible(false);
                  setIsShowRemindBackupModal(true);
                }}>
                I've backed up
              </Button>

              <Button
                style={{ flex: 1 }}
                onPress={() => {
                  onSetCurrentRemindBackupTimeout();
                  mmkvStore.set('isOpenGeneralTermFirstTime', true);
                  setVisible(false);
                  setIsShowRemindBackupModal(true);
                  onBackUpAccount();
                }}>
                Back up now
              </Button>
            </View>
          </View>
        </SwModal>
      )}

      <AccountProxySelector
        items={accountProxies.filter(item => item.id !== 'ALL')}
        selectedValueMap={{}}
        onSelectItem={onSelectItem}
        accountSelectorRef={accountSelectorRef}
      />
    </>
  );
};
