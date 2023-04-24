import React, { useContext, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { sharedStyles } from 'styles/sharedStyles';
import { WebRunnerContext } from 'providers/contexts';
import { Button } from 'components/Button';
import { MessageTypes } from '@subwallet/extension-base/background/types';
import { Textarea } from 'components/Textarea';
import { sendMessage } from 'messaging/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Dropdown } from 'components/Dropdown';

// @ts-ignore
const METHOD_MAP: Record<MessageTypes, { default_input: string; subscription?: boolean }> = {
  'pri(accounts.subscribeWithCurrentAddress)': {
    default_input: '{}',
    subscription: true,
  },
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
  'pri(accounts.create.external)': {
    default_input: '{"address": "address", "genesisHash": "", "name": "External Account 01"}',
  },
};

let unsub: (() => void) | undefined;

export const WebViewDebugger = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const { webState, reload } = useContext(WebRunnerContext);
  const [method, setMethod] = useState<MessageTypes>('pri(accounts.subscribeWithCurrentAddress)');
  const [input, setInput] = useState(METHOD_MAP['pri(accounts.subscribeWithCurrentAddress)'].default_input);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const themeColors = useSubWalletTheme().colors;

  const containerStyle = { marginBottom: 30 };
  const textStyle = { marginBottom: 10, color: themeColors.textColor };

  const onPressBack = () => {
    navigation.goBack();
  };

  const onPressReload = () => {
    reload && reload();
  };

  const onChangeMethod = (value: MessageTypes) => {
    setMethod(value);
    setInput(METHOD_MAP[value].default_input);
  };

  const onChangeInput = (value: string) => {
    setInput(value);
  };

  const showRs = (rs: unknown) => {
    setResult(JSON.stringify(rs, null, 2));
  };

  const onSendMessage = () => {
    const { subscription } = METHOD_MAP[method];
    let callback;
    if (subscription) {
      let action: ((rs: unknown) => void) | undefined = (rs: unknown) => {
        setResult(JSON.stringify(rs, null, 2));
      };
      callback = (rs: unknown) => {
        action && action(rs);
      };
      unsub = () => {
        console.log('Unsub');
        action = undefined;
      };
    } else {
      unsub = undefined;
    }

    // @ts-ignore
    sendMessage(method, JSON.parse(input), callback)
      .then(rs => {
        showRs(rs);
      })
      .catch(err => {
        setError(JSON.stringify(err));
      });
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.settings.webViewDebugger}>
      <ScrollView style={{ ...sharedStyles.layoutContainer }}>
        <View style={containerStyle}>
          <Text style={textStyle}>{`${i18n.common.status}${webState.status}`}</Text>
          <Text style={textStyle}>{`${i18n.common.url}${webState.url}`}</Text>
          <Text style={textStyle}>{`${i18n.common.version}${webState.version}`}</Text>
          <Button title={i18n.common.reloadBackground} onPress={onPressReload} />
        </View>
        <View style={containerStyle}>
          <Text style={textStyle}>{i18n.common.message}</Text>
          <Dropdown
            onValueChange={onChangeMethod}
            value={method}
            items={Object.keys(METHOD_MAP).map(k => ({ label: k, value: k }))}
          />
          <Text style={textStyle}>{i18n.common.input}</Text>
          <Textarea value={input} style={{ ...textStyle, height: 80 }} onChangeText={onChangeInput} />
          <Button style={{ marginBottom: 5 }} title={i18n.common.sendMessage} onPress={onSendMessage} />
          {unsub && <Text style={{ textAlign: 'center', ...textStyle }}>{i18n.common.subscribing}</Text>}
          <Text style={{ color: 'red' }}>{error}</Text>
          <Text style={textStyle}>{result}</Text>
        </View>
      </ScrollView>
    </ContainerWithSubHeader>
  );
};
