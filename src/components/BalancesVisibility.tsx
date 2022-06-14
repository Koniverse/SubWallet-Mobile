import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BalanceVal } from 'components/BalanceVal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import BigN from 'bignumber.js';
import { toggleBalancesVisibility } from '../messaging';
import {sharedStyles} from "styles/sharedStyles";

export const BalancesVisibility = () => {
  const {
    settings: { isShowBalance },
  } = useSelector((state: RootState) => state);

  const _toggleBalances = useCallback(() => {
    toggleBalancesVisibility(value => {
      console.log('Balances visible:', value.isShowBalance);
    }).catch(e => {
      console.error('There is a problem when set Current Account', e);
    });
  }, []);

  return (
    <TouchableOpacity onPress={() => _toggleBalances()}>
      {isShowBalance ? (
        <BalanceVal value={new BigN('10')} startWithSymbol symbol={'$'} />
      ) : (
        <Text style={{ color: '#FFF', ...sharedStyles.largeText }}>******</Text>
      )}
    </TouchableOpacity>
  );
};
