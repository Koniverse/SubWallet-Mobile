// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { canDerive } from '@subwallet/extension-base/utils';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { UnlockModal } from 'components/common/Modal/UnlockModal';
import { ActivityIndicator, SwModal } from 'components/design-system-ui';
import { LazyFlatList } from 'components/LazyFlatList';
import { Search } from 'components/Search';
import { Warning } from 'components/Warning';
import { deviceHeight, EVM_ACCOUNT_TYPE, TOAST_DURATION } from 'constants/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { deriveAccountV3 } from 'messaging/index';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ListRenderItemInfo, TextInput, View } from 'react-native';
import ToastContainer from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { VoidFunction } from 'types/index';
import i18n from 'utils/i18n/i18n';
import createStyles from './styles';

type Props = {
  modalVisible: boolean;
  onChangeModalVisible: VoidFunction;
};

const renderListEmptyComponent = () => {
  return <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noAccountText} isDanger={false} />;
};

const filteredAccounts = (_items: AccountJson[], searchString: string) => {
  return _items.filter(
    acc =>
      acc.address.toLowerCase().includes(searchString.toLowerCase()) ||
      acc.name?.toLowerCase().includes(searchString.toLowerCase()),
  );
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
  const { modalVisible, onChangeModalVisible } = props;
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const toastRef = useRef<ToastContainer>(null);
  const searchRef = useRef<TextInput>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selected, setSelected] = useState('');
  const [searchString, setSearchString] = useState<string>('');

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
              onChangeModalVisible();
              goHome();
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
    [goHome, onChangeModalVisible, toastError],
  );

  const { visible, onPasswordComplete, onPress: onPressSubmit, onHideModal } = useUnlockModal();

  const renderItem = useCallback(
    ({ item: account }: ListRenderItemInfo<AccountJson>): JSX.Element => {
      const disabled = !!selected;
      const isSelected = account.address === selected;

      return (
        <AccountItemWithName
          key={account.address}
          accountName={account.name}
          address={account.address}
          avatarSize={theme.sizeLG}
          onPress={disabled || isSelected ? undefined : onPressSubmit(onSelectAccount(account))}
          renderRightItem={isSelected ? renderLoaderIcon : undefined}
          customStyle={{
            container: [styles.accountItem, disabled && !isSelected && styles.accountDisable],
          }}
        />
      );
    },
    [onPressSubmit, onSelectAccount, selected, styles.accountDisable, styles.accountItem, theme.sizeLG],
  );

  return (
    <>
      <SwModal
        modalVisible={modalVisible}
        onChangeModalVisible={selected ? undefined : onChangeModalVisible}
        isFullHeight={true}
        modalTitle={'Select account'}
        modalStyle={styles.modal}>
        <View style={styles.wrapper}>
          <View style={styles.container}>
            <Search
              autoFocus={false}
              placeholder={i18n.common.accountName}
              onClearSearchString={() => setSearchString('')}
              onSearch={setSearchString}
              searchText={searchString}
              style={styles.search}
              searchRef={searchRef}
            />
            <LazyFlatList
              items={filtered}
              renderItem={renderItem}
              renderListEmptyComponent={renderListEmptyComponent}
              searchFunction={filteredAccounts}
              searchString={searchString}
              flatListStyle={styles.list}
            />
          </View>
        </View>
        <Toast
          duration={TOAST_DURATION}
          normalColor={ColorMap.notification}
          ref={toastRef}
          placement={'bottom'}
          offsetBottom={deviceHeight - STATUS_BAR_HEIGHT - 80}
        />
        <UnlockModal onPasswordComplete={onPasswordComplete} visible={visible} onHideModal={onHideModal} />
      </SwModal>
    </>
  );
};

export default DeriveAccountModal;
