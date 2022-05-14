import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../App';
import {useSelector} from 'react-redux';
import {RootState} from '../stores';
import {Button, ScrollView, Text, View} from 'react-native';
import {Account} from '../components/Account';

export function AccountList() {
  const navigation = useNavigation<NavigationProps>();
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View>
        <View style={{marginBottom: 20}}>
          <Text style={{marginBottom: 12, marginTop: 10}}>Account List</Text>
          {accounts.map(acc => (
            <Account
              key={acc.address}
              name={acc.name || ''}
              address={acc.address}
            />
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
}
