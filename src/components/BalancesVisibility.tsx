import React, { useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { BalanceVal } from 'components/BalanceVal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { toggleBalancesVisibility } from '../messaging';
import { sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';

type Props = {
  value: BigN;
  symbol: string;
};

export const BalancesVisibility = ({ value, symbol }: Props) => {
  const {
    settings: { isShowBalance },
  } = useSelector((state: RootState) => state);

  const _toggleBalances = useCallback(() => {
    toggleBalancesVisibility(v => {
      console.log('Balances visible:', v.isShowBalance);
    }).catch(e => {
      console.error('There is a problem when set Current Account', e);
    });
  }, []);

  return (
    <TouchableOpacity onPress={() => _toggleBalances()}>
      {isShowBalance ? (
        <BalanceVal value={value} startWithSymbol symbol={symbol} />
      ) : (
        <Text style={{ color: '#FFF', ...sharedStyles.largeText }}>******</Text>
      )}
    </TouchableOpacity>
  );
};
