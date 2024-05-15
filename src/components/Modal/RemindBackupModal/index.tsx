import React, { useRef } from 'react';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import { View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ShieldCheck } from 'phosphor-react-native';
import { FontMedium } from 'styles/sharedStyles';
import { mmkvStore } from 'utils/storage';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { AccountSelector } from 'components/Modal/common/AccountSelectorNew';
import { ModalRef } from 'types/modalRef';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { isShowRemindBackupModal, setIsShowRemindBackupModal } from 'screens/Home';

interface Props {
  modalVisible: boolean;
  setVisible: (value: boolean) => void;
}

export const RemindBackupModal = ({ modalVisible, setVisible }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { isAllAccount, currentAccount, accounts } = useSelector((state: RootState) => state.accountState);
  const accountSelectorRef = useRef<ModalRef>();
  const onSetCurrentRemindBackupTimeout = () => {
    mmkvStore.set('lastTimeLogin', Date.now());
    mmkvStore.set('remindBackupTimeout', Date.now());
  };
  const onSelectItem = (item: AccountJson) => {
    navigation.navigate('AccountExport', { address: item?.address || '' });
  };

  const onBackUpAccount = () => {
    if (isAllAccount) {
      accountSelectorRef.current?.onOpenModal();
    } else {
      navigation.navigate('AccountExport', { address: currentAccount?.address || '' });
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
                  color: theme.colorTextLight4,
                  textAlign: 'center',
                  ...FontMedium,
                  paddingTop: theme.paddingMD,
                }}>
                {
                  'Once your seed phrase is lost, there is no way to recover your account. Back up now to secure your funds.'
                }
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

      <AccountSelector
        items={accounts.filter(item => item.address !== 'ALL')}
        selectedValueMap={{}}
        onSelectItem={onSelectItem}
        accountSelectorRef={accountSelectorRef}
      />
    </>
  );
};
