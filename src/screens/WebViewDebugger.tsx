import React, { useContext, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';
import { sharedStyles } from 'styles/sharedStyles';
import { WebViewContext } from 'providers/contexts';
import { Button } from 'components/Button';
import { MessageTypes } from '@subwallet/extension-base/background/types';
import { Textarea } from 'components/Textarea';
import { sendMessage } from '../messaging';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Dropdown } from 'components/Dropdown';

// @ts-ignore
const METHOD_MAP: Record<MessageTypes, { default_input: string; subscription?: boolean }> = {
  'pri(price.getPrice)': {
    default_input: 'null',
  },
  'pri(price.getSubscription)': {
    default_input: 'null',
    subscription: true,
  },
  'pri(balance.getBalance)': {
    default_input: 'null',
  },
  'pri(balance.getSubscription)': {
    default_input: 'null',
    subscription: true,
  },
};

export const WebViewDebugger = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { status, viewRef, url, version } = useContext(WebViewContext);
  const [method, setMethod] = useState<MessageTypes>('pri(balance.getBalance)');
  const [input, setInput] = useState(METHOD_MAP['pri(balance.getBalance)'].default_input);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [unsub, setUnsub] = useState<(() => void) | undefined>(undefined);
  const themeColors = useSubWalletTheme().colors;

  const containerStyle = { marginBottom: 30 };
  const textStyle = { marginBottom: 10, color: themeColors.textColor };

  const onPressBack = () => {
    navigation.goBack();
  };

  const onPressReload = () => {
    viewRef?.current?.reload();
  };

  const onChangeMethod = (value: MessageTypes) => {
    setMethod(value);
    setInput(METHOD_MAP[value].default_input);
  };

  const onChangeInput = (value: string) => {
    setInput(value);
  };

  const onSendMessage = () => {
    // @ts-ignore
    unsub && unsub();
    const { subscription } = METHOD_MAP[method];
    let callback;
    let action: ((rs: unknown) => void) | undefined;
    if (subscription) {
      action = (rs: unknown) => {
        setResult(JSON.stringify(rs, null, 2));
      };
      callback = (rs: unknown) => {
        action && action(rs);
      };
      setUnsub(() => {
        action = undefined;
      });
    } else {
      setUnsub(undefined);
    }
    // @ts-ignore
    sendMessage(method, JSON.parse(input), callback)
      .then(rs => {
        setResult(JSON.stringify(rs, null, 2));
      })
      .catch(err => {
        setError(JSON.stringify(err));
      });
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.settings.webViewDebugger}>
      <ScrollView style={{ ...sharedStyles.layoutContainer }}>
        <View style={containerStyle}>
          <Text style={textStyle}>Status: {status}</Text>
          <Text style={textStyle}>URL: {url}</Text>
          <Text style={textStyle}>Version: {version}</Text>
          <Button title={'Reload Background'} onPress={onPressReload} />
        </View>
        <View style={containerStyle}>
          <Text style={textStyle}>Message</Text>
          <Dropdown
            onValueChange={onChangeMethod}
            value={method}
            items={Object.keys(METHOD_MAP).map(k => ({ label: k, value: k }))}
          />
          <Text style={textStyle}>Input</Text>
          <Textarea value={input} style={{ ...textStyle, height: 80 }} onChangeText={onChangeInput} />
          <Button style={{ marginBottom: 5 }} title={'Send Message'} onPress={onSendMessage} />
          {unsub && (
            <Text style={{ textAlign: 'center', ...textStyle }}>................... Subscribing .................</Text>
          )}
          <Text style={{ color: 'red' }}>{error}</Text>
          <Text style={textStyle}>{result}</Text>
        </View>
      </ScrollView>
    </ContainerWithSubHeader>
  );
};
