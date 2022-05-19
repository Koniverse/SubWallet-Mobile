import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { AccountJson } from '@subwallet/extension-base/background/types';
import React from 'react';
import { saveCurrentAccountAddress } from '../messaging';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateCurrentAccount } from 'stores/Accounts';
import { RootNavigationProps } from 'types/routes';
import { Avatar } from 'components/Avatar';

export interface AccountProps extends AccountJson {
  name: string;
}

export const Account = ({ name, address }: AccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const dispatch = useDispatch();
  // const accountStore = useSelector((state: RootState) => state.accounts);

  const selectAccount = (accAddress: string) => {
    saveCurrentAccountAddress({ address: accAddress }, rs => {
      dispatch(updateCurrentAccount(rs.address));
      navigation.navigate('Home');
    })
      .then(console.log)
      .catch(console.error);
  };

  // const removeAccount = (accAddress: string) => {
  //   forgetAccount(accAddress).then(console.log).catch(console.error);
  // };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        selectAccount(address);
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
        <Avatar address={address} size={42} />
        <View style={{ marginLeft: 8 }}>
          <Text style={{ fontSize: 12, marginBottom: 8 }}>{name}</Text>
          <Text style={{ fontSize: 9, fontFamily: 'monospace', marginBottom: 8 }}>{address}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
