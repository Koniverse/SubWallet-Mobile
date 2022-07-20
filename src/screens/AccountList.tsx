import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ScrollView, View } from 'react-native';
import { Account } from 'components/Account';
import { Button } from 'components/Button';
import { SpaceStyle } from 'styles/space';

export const AccountList = () => {
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={SpaceStyle.oneContainer}>
        <View style={{ marginBottom: 20 }}>
          {accounts.map(acc => (
            <Account key={acc.address} name={acc.name || ''} address={acc.address} />
          ))}
        </View>
        <Button title="Create Account" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};
