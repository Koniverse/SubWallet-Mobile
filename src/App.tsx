// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import WebView from 'react-native-webview';
import { WebViewMessage } from 'react-native-webview/lib/WebViewTypes';
import { createAccountSuri, createSeed, listenMessage, setViewRef, subscribeAccounts } from './web/messaging';
import { AccountJson } from '@polkadot/extension-base/background/types';

// const baseUrl = Platform.OS === 'android' ? 'file:///android_asset/web' : 'web';
const baseUrl = 'http://192.168.10.189:9000';

const ERROR_HANDLE_SCRIPT = `
    window.onerror = function(message, sourcefile, lineno, colno, error) {
      alert("Message: " + message + " - Source: " + sourcefile + " Line: " + lineno + ":" + colno);
      return true;
    };
    true;
`;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const webviewRef = useRef<WebView>();
  const [accountList, setAccountList] = useState<AccountJson[]>([]);
  const [webViewStatus, setWebViewStatus] = useState('Init');
  const [seedPhase, setSeedPhase] = useState('[seed phase]');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setViewRef(webviewRef);
  }, [webviewRef]);

  function onMessage (data: NativeSyntheticEvent<WebViewMessage>) {
    listenMessage(JSON.parse(data.nativeEvent.data));
  }

  function onWebViewLoadEnd () {
    setWebViewStatus('Ready')
    subcribeAccountList()
  }

  function subcribeAccountList () {
    subscribeAccounts((accounts) => {
      setAccountList(accounts);
    })
  }

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const createSeedPhase = () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    createSeed().then(({ address, seed }) => {
      setAddress(address);
      setSeedPhase(seed);
    });
  };

  const createAccount = () => {
    const name = 'Account' + Math.round(Math.random() * 1000);
    setSeedPhase('[seed phase]');
    createAccountSuri(name, '123456', seedPhase, 'sr25519').then((created) => {
      console.log('OK');
    })
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <WebView
        // @ts-ignore
        ref={webviewRef}
        injectedJavaScriptBeforeContentLoaded={ERROR_HANDLE_SCRIPT}
        onMessage={onMessage}
        onLoadEnd={onWebViewLoadEnd}
        source={{ uri: `${baseUrl}/index.html`, baseUrl }}
        javaScriptEnabled={true}
      />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'}/>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>Webview Status: {webViewStatus}</Text>
          <View style={{marginBottom: 20}}>
            <Text>Account List: </Text>
            {accountList.map((acc) => (<Text style={{fontSize: 10, fontFamily: 'monospace'}} key={acc.address}>{acc.name} : {acc.address} </Text>))}
          </View>
          <Button title="Create Seed Phase" onPress={createSeedPhase}/>
          <Text>{seedPhase}</Text>
          <TextInput
            placeholder="Address"
            defaultValue={address}
            style={{fontSize: 12, fontFamily: 'monospace'}}
            onChange={e => {
              setAddress(e.nativeEvent.text);
            }}
          />
          <Button title="Create Account" disabled={seedPhase === '[seed phase]'} onPress={createAccount}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
