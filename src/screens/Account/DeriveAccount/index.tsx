import React, { useCallback, useMemo, useState } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStyles from './styles';
import { canDerive } from '@subwallet/extension-base/utils';
import { EVM_ACCOUNT_TYPE } from 'constants/index';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { deriveAccountV3 } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useToast } from 'react-native-toast-notifications';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { DeviceEventEmitter, ListRenderItemInfo, Platform, View } from 'react-native';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { ActivityIndicator } from 'components/design-system-ui';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { OPEN_UNLOCK_FROM_MODAL } from 'components/common/Modal/UnlockModal';

const renderLoaderIcon = (x: React.ReactNode): React.ReactNode => {
  return (
    <>
      {x}
      <ActivityIndicator size={20} />
    </>
  );
};

export const DeriveAccount = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { show } = useToast();
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

  const renderListEmptyComponent = () => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
      />
    );
  };

  const { onPress: onPressSubmit } = useUnlockModal(navigation);

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
              show(e.message);
            })
            .finally(() => {
              setSelected('');
            });
        }, 500);
      };
    },
    [navigation, show],
  );

  const onSelectItem = (account: AccountJson) => {
    onPressSubmit(onSelectAccount(account))();
    Platform.OS === 'android' && setTimeout(() => DeviceEventEmitter.emit(OPEN_UNLOCK_FROM_MODAL), 250);
  };

  const renderItem = ({ item }: ListRenderItemInfo<AccountJson>) => {
    const disabled = !!selected;
    const isSelected = item.address === selected;
    return (
      <View style={{ marginBottom: 8, paddingHorizontal: 16 }}>
        <AccountItemWithName
          key={item.address}
          accountName={item.name}
          address={item.address}
          avatarSize={theme.sizeLG}
          onPress={() => {
            if (!disabled && !isSelected) {
              onSelectItem(item);
            }
          }}
          renderRightItem={isSelected ? renderLoaderIcon : undefined}
          customStyle={{
            container: [styles.accountItem, disabled && !isSelected && styles.accountDisable],
          }}
        />
      </View>
    );
  };

  const searchFunction = useCallback((items: AccountJson[], searchString: string) => {
    return items.filter(
      acc =>
        (acc.name && acc.name.toLowerCase().includes(searchString.toLowerCase())) ||
        acc.address.toLowerCase().includes(searchString.toLowerCase()),
    );
  }, []);

  return (
    <FlatListScreen
      items={filtered}
      renderListEmptyComponent={renderListEmptyComponent}
      title={i18n.header.selectAccount}
      renderItem={renderItem}
      onPressBack={() => navigation.goBack()}
      placeholder={i18n.placeholder.accountName}
      searchFunction={searchFunction}
    />
  );
};
