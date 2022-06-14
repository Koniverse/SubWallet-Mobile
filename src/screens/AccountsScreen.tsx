import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { useNavigation } from '@react-navigation/native';
import { Account } from 'components/Account';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { IconButton } from 'components/IconButton';
import { DotsThree } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n';
import { SubmitButton } from 'components/SubmitButton';

export const AccountsScreen = () => {
  const navigation: NativeStackScreenProps<RootStackParamList> = useNavigation();
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;
  const theme = useSubWalletTheme().colors;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        accountsWrapper: {
          flex: 1,
        },
        accountItemContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 11,
        },

        accountItemSeparator: {
          borderBottomWidth: 1,
          borderBottomColor: theme.background2,
          borderBottomStyle: 'solid',
          marginLeft: 50,
        },
      }),
    [theme],
  );

  const renderListEmptyComponent = () => {
    return <Warning warningMessage={i18n.noAccountText} isDanger={false} />;
  };

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <View style={styles.accountItemContainer}>
        <Account key={item.address} name={item.name || ''} address={item.address} showCopyBtn={false} />

        <IconButton icon={DotsThree} />
      </View>
    );
  };

  const renderSeparator = () => {
    return <View style={styles.accountItemSeparator} />;
  };

  const renderFooterComponent = () => {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 42 }}>
        <SubmitButton title={'Add / Connect Account'} />
      </View>
    );
  };

  return (
    <SubScreenContainer navigation={navigation} title={'Accounts'}>
      <View style={styles.accountsWrapper}>
        <FlatList
          style={{ paddingHorizontal: 16, flex: 1 }}
          keyboardShouldPersistTaps={'handled'}
          data={accounts}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.address}
        />
        {/*{accounts.map(acc => (*/}
        {/*))}*/}
        {renderFooterComponent()}
      </View>
    </SubScreenContainer>
  );
};
