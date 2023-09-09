// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { canDerive } from '@subwallet/extension-base/utils';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ActivityIndicator } from 'components/design-system-ui';
import { deviceHeight, EVM_ACCOUNT_TYPE, TOAST_DURATION } from 'constants/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { deriveAccountV3 } from 'messaging/index';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, ListRenderItemInfo, Platform, View } from 'react-native';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import createStyles from './styles';
import { ModalRef } from 'types/modalRef';
import { AccountSelector } from 'components/Modal/common/AccountSelector';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { OPEN_UNLOCK_FROM_MODAL } from '../UnlockModal';

type Props = {
  deriveAccModalRef: React.MutableRefObject<ModalRef | undefined>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const renderLoaderIcon = (x: React.ReactNode): React.ReactNode => {
  return (
    <>
      {x}
      <ActivityIndicator size={20} />
    </>
  );
};

const DeriveAccountModal: React.FC<Props> = (props: Props) => {
  const { deriveAccModalRef, navigation } = props;
  const theme = useSubWalletTheme().swThemes;

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const toastRef = useRef<ToastContainer>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selected, setSelected] = useState('');

  const filtered = useMemo(
    () =>
      accounts
        .filter(({ isExternal }) => !isExternal)
        .filter(
          ({ isMasterAccount, type }) =>
            canDerive(type) && (type !== EVM_ACCOUNT_TYPE || (isMasterAccount && type === EVM_ACCOUNT_TYPE)),
        ),
    [accounts],
  );

  const toastError = useCallback((message: string) => {
    toastRef.current?.hideAll();
    toastRef.current?.show(message, { type: 'danger' });
  }, []);

  const onSelectAccount = useCallback(
    (account: AccountJson): (() => void) => {
      return () => {
        setSelected(account.address);

        setTimeout(() => {
          deriveAccountV3({
            address: account.address,
          })
            .then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            })
            .catch((e: Error) => {
              toastError(e.message);
            })
            .finally(() => {
              setSelected('');
            });
        }, 500);
      };
    },
    [navigation, toastError],
  );

  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  function onSelectItem(account: AccountJson) {
    onPressSubmit(onSelectAccount(account))();
    Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
  }

  const renderItem = useCallback(
    ({ item: account }: ListRenderItemInfo<AccountJson>): JSX.Element => {
      const disabled = !!selected;
      const isSelected = account.address === selected;

      return (
        <View style={{ marginBottom: 8, paddingHorizontal: 16 }}>
          <AccountItemWithName
            key={account.address}
            accountName={account.name}
            address={account.address}
            avatarSize={theme.sizeLG}
            onPress={() => {
              if (!disabled && !isSelected) {
                onSelectItem(account);
              }
            }}
            renderRightItem={isSelected ? renderLoaderIcon : undefined}
            customStyle={{
              container: [styles.accountItem, disabled && !isSelected && styles.accountDisable],
            }}
          />
        </View>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, styles.accountDisable, styles.accountItem, theme.sizeLG],
  );

  return (
    <>
      <AccountSelector
        items={filtered}
        selectedValueMap={{}}
        accountSelectorRef={deriveAccModalRef}
        isShowInput={false}
        renderCustomItem={renderItem}
        closeModalAfterSelect={true}>
        <Toast
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - (Platform.OS === 'android' ? 120 : 80)}
        />
      </AccountSelector>
    </>
  );
};

export default DeriveAccountModal;
