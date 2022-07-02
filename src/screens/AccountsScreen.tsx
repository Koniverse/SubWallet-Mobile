import React from 'react';
import { FlatList, StyleProp, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Account } from 'components/Account';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { IconButton } from 'components/IconButton';
import { DotsThree, Plus } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Warning } from 'components/Warning';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import i18n from 'utils/i18n/i18n';

const accountsWrapper: StyleProp<any> = {
  flex: 1,
};
const accountItemContainer: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 11,
};

const accountItemSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  borderBottomStyle: 'solid',
  marginLeft: 50,
};

export const AccountsScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;
  const theme = useSubWalletTheme().colors;

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={i18n.warningMessage.noAccountText} isDanger={false} />;
  };

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <View style={accountItemContainer}>
        <Account key={item.address} name={item.name || ''} address={item.address} showCopyBtn={false} />

        {!isAccountAll(item.address) && (
          <IconButton
            icon={DotsThree}
            onPress={() => {
              navigation.navigate('EditAccount', { address: item.address, name: item.name });
            }}
          />
        )}
      </View>
    );
  };

  const renderSeparator = () => {
    return <View style={accountItemSeparator} />;
  };

  const onCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };

  const renderFooterComponent = () => {
    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <SubmitButton
          backgroundColor={theme.background2}
          title={i18n.common.addOrConnectAccount}
          onPress={onCreateAccount}
        />
      </View>
    );
  };

  return (
    <SubScreenContainer
      navigation={navigation}
      title={i18n.settings.accounts}
      rightIcon={Plus}
      onPressRightIcon={onCreateAccount}>
      <View style={accountsWrapper}>
        <FlatList
          style={{ paddingHorizontal: 16, flex: 1 }}
          keyboardShouldPersistTaps={'handled'}
          data={accounts}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.address}
        />
        {renderFooterComponent()}
      </View>
    </SubScreenContainer>
  );
};
