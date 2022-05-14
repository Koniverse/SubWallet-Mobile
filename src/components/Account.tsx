import {Button, Text, View} from 'react-native';
import {AccountJson} from '@subwallet/extension-base/background/types';
import Identicon from '@polkadot/reactnative-identicon';
import React from 'react';
import {forgetAccount, saveCurrentAccountAddress} from '../messaging';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../App';
import {useDispatch} from 'react-redux';
import {updateCurrentAccount} from '../stores/Accounts';

export interface AccountProps extends AccountJson {
  name: string;
}

export const Account = ({name, address}: AccountProps) => {
  const toast = useToast();
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();

  const selectAccount = (accAddress: string) => {
    saveCurrentAccountAddress({address: accAddress}, rs => {
      toast.show(`Account changed to ${rs.address}`);
      dispatch(updateCurrentAccount(rs.address));
      navigation.navigate('Home');
    })
      .then(console.log)
      .catch(console.error);
  };

  const removeAccount = (accAddress: string) => {
    forgetAccount(accAddress).then(console.log).catch(console.error);
  };

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', padding: 4}}>
      <Identicon value={address} size={48} theme={'polkadot'} />
      <View style={{marginLeft: 8}}>
        <Text style={{fontSize: 12, marginBottom: 8}}>{name}</Text>
        <Text style={{fontSize: 10, fontFamily: 'monospace', marginBottom: 8}}>
          {address}
        </Text>
        <View style={{flexDirection: 'row'}}>
          <Button
            title="Select Account"
            onPress={() => {
              selectAccount(address);
            }}
          />
          <Button
            title="Remove Account"
            color={'red'}
            onPress={() => {
              removeAccount(address);
            }}
          />
        </View>
      </View>
    </View>
  );
};
