import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ScrollView, View } from 'react-native';
import { Account } from 'components/Account';
import { Button } from 'components/Button';

export const AccountList = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View>
        <View style={{ marginBottom: 20 }}>
          {accounts.map(acc => (
            <Account key={acc.address} name={acc.name || ''} address={acc.address} />
          ))}
        </View>
        <Button
          title="Create Account"
          onPress={() => {
            navigation.navigate('CreateAccount');
          }}
        />
      </View>
    </ScrollView>
  );
};
