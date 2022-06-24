import React, { useState } from 'react';
import { SubmitButton } from 'components/SubmitButton';
import { checkTransfer, enableNetworkMap, makeTransfer } from '../../messaging';
import { RequestCheckTransfer } from '@subwallet/extension-base/background/KoniTypes';
import { Input } from 'components/Input';
import { sharedStyles } from 'styles/sharedStyles';

const requestPayload: RequestCheckTransfer = {
  networkKey: 'acala_testnet',
  from: '5EFLCgn8gFd1QTiGpzcSZwSnBdYk82nUpjd42vAUJQabETCL',
  to: '5HWA78W7x8qi2zbb9BbFhuvvV5jbS8v1c8Mt6E6Y7pvPopEv',
  transferAll: false,
  token: 'ACA',
  value: '20000000000',
};

const getInputStyle = (value: string) => {
  if (value.length > 10) {
    return {
      ...sharedStyles.textInput,
    };
  } else if (value.length > 5) {
    return {
      ...sharedStyles.textInput,
      height: 80,
      fontSize: 30,
    };
  }

  return {
    ...sharedStyles.textInput,
    height: 100,
    fontSize: 40,
  };
};

const password = 'ABC@123';

const InputBalance = () => {
  const [value, setValue] = useState<string>('');
  const onChangeText = (text: string) => {
    setValue(text);
  };

  console.log('value', value);

  return <Input defaultValue={value} onChangeText={onChangeText} style={getInputStyle(value)} />;
};

export const SendFund = () => {
  const enableNetwork = () => {
    enableNetworkMap('acala_testnet')
      .then(resp => {
        console.log('enableNetworkMap', resp);
      })
      .catch(console.error);
  };

  const onCheckTransfer = () => {
    checkTransfer({
      ...requestPayload,
    })
      .then(rs => {
        console.log('rs checkTransfer', rs);
      })
      .catch(e => {
        console.log('e', e);
      });
  };

  const onTestTransfer = () => {
    makeTransfer(
      {
        ...requestPayload,
        password,
      },
      rs => {
        console.log('rs makeTransfer', rs);
      },
    )
      .then(rs => {
        console.log('rs makeTransfer Tx Error', rs);
      })
      .catch(e => {
        console.log('rs makeTransfer G Error', e);
      });
  };

  return (
    <>
      <InputBalance />
      <SubmitButton title={'Enable Network'} onPress={enableNetwork} />
      <SubmitButton title={'Check Transfer'} onPress={onCheckTransfer} />
      <SubmitButton title={'Test Transfer'} onPress={onTestTransfer} />
    </>
  );
};
