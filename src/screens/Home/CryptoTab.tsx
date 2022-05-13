import React, { useContext } from 'react';
import { Button, Image, ScrollView, Text, View } from 'react-native';
import { WebViewContext } from '../../providers/contexts';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../App';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores';
import { forgetAccount } from '../../messaging';
import { Account } from '../../components/Account';

export const CryptoTab = () => {
  const webView = useContext(WebViewContext);
  const navigation = useNavigation<NavigationProps>();
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;
  const removeAccount = () => {
    forgetAccount(accounts[accounts.length - 1].address)
      .then(console.log)
      .catch(console.error);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View>
        {/*<Text>Webview Status: {webViewStatus}</Text>*/}
        <View style={{marginBottom: 20}}>
          <Text style={{fontSize: 10}}>Web view Status: {webView.status}</Text>
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
          title="Remove Account"
          disabled={accounts.length === 0}
          onPress={removeAccount}
        />
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
