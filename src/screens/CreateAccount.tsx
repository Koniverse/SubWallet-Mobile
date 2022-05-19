import React, { useCallback, useEffect, useState } from 'react';
import { Button, ScrollView, Text, TextInput } from 'react-native';
import { createAccountSuriV2, createSeedV2 } from '../messaging';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export const CreateAccount = () => {
  const accountStore = useSelector((state: RootState) => state.accounts);
  const accounts = accountStore.accounts;
  const [seedPhase, setSeedPhase] = useState('');
  const [name, setName] = useState('Account ' + accounts.length);
  const [password, setPassword] = useState('');
  const navigation = useNavigation<RootNavigationProps>();

  useEffect(() => {
    createSeedV2()
      .then(({ seed }) => {
        // setAddress(address);
        setSeedPhase(seed);
      })
      .catch(console.error);
  }, []);

  const createAccount = useCallback(() => {
    createAccountSuriV2(name, password, seedPhase, true, ['sr25519'])
      .then(created => {
        console.log(created);
        navigation.navigate('Home');
      })
      .catch(console.error);
  }, [name, navigation, password, seedPhase]);

  return (
    <ScrollView>
      <Text>Seed Phase: </Text>
      <Text>{seedPhase}</Text>
      <TextInput
        placeholder="Name"
        defaultValue={name}
        onChange={e => {
          setName(e.nativeEvent.text);
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        textContentType="password"
        defaultValue={password}
        onChange={e => {
          setPassword(e.nativeEvent.text);
        }}
      />
      <Button title="Create Account" disabled={seedPhase === '[seed phase]'} onPress={createAccount} />
    </ScrollView>
  );
};
