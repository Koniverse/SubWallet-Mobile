import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';
import { ColorMap } from 'styles/color';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../types';
import { BalanceVal } from 'components/BalanceVal';
import { getTotalConvertedBalanceValue, hasAnyChildTokenBalance } from 'screens/Home/CtyptoTab/utils';
import { BN_ZERO } from 'utils/chainBalances';

interface Props extends TouchableOpacityProps {
  isLoading: boolean;
  accountInfo: AccountInfoByNetwork;
  isToken?: boolean;
  balanceInfo: BalanceInfo;
}

const chainBalanceMainArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingTop: 16,
  paddingBottom: 16,
};
const chainBalancePart1: StyleProp<any> = {
  flexDirection: 'row',
  paddingLeft: 16,
};
const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
  paddingBottom: 4,
};
const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};
const chainBalanceMetaWrapper: StyleProp<any> = {
  paddingLeft: 16,
};
const chainBalancePart2: StyleProp<any> = {
  alignItems: 'flex-end',
  paddingRight: 16,
};
const chainBalanceSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 72,
  marginRight: 16,
};

export const ChainBalance = ({ accountInfo, isLoading, isToken = false, onPress, balanceInfo }: Props) => {
  const renderTokenValue = (curBalanceInfo: BalanceInfo) => {
    if (!curBalanceInfo) {
      return;
    }

    if (!hasAnyChildTokenBalance(curBalanceInfo)) {
      return (
        <BalanceVal balanceValTextStyle={textStyle} symbol={curBalanceInfo.symbol} value={balanceInfo.balanceValue} />
      );
    }

    const showedTokens = [];

    if (balanceInfo.balanceValue.gt(BN_ZERO)) {
      showedTokens.push(balanceInfo.symbol);
    }

    for (const item of balanceInfo.childrenBalances) {
      if (showedTokens.length > 1) {
        showedTokens.push('...');

        break;
      }

      if (item.balanceValue.gt(BN_ZERO)) {
        showedTokens.push(item.symbol);
      }
    }

    return <Text>{showedTokens.join(', ')}</Text>;
  };

  console.log('balanceInfo', balanceInfo);

  return (
    <TouchableOpacity style={{ width: '100%' }} onPress={onPress}>
      <View style={chainBalanceMainArea}>
        <View style={chainBalancePart1}>
          {getNetworkLogo(accountInfo.networkLogo, 40)}
          <View style={chainBalanceMetaWrapper}>
            <Text style={textStyle}>{accountInfo.networkDisplayName}</Text>
            {isToken ? (
              <Text style={[subTextStyle, { color: ColorMap.primary }]}>{'$1.29'}</Text>
            ) : (
              <Text style={subTextStyle}>{toShort(accountInfo.formattedAddress)}</Text>
            )}
          </View>
        </View>

        {isLoading && (
          <View style={chainBalancePart2}>
            <Loading width={40} height={40} />
          </View>
        )}

        {!isLoading && (
          <View style={chainBalancePart2}>
            {renderTokenValue(balanceInfo)}
            <BalanceVal
              balanceValTextStyle={subTextStyle}
              startWithSymbol
              symbol={'$'}
              value={getTotalConvertedBalanceValue(balanceInfo)}
            />
          </View>
        )}
      </View>

      <View style={chainBalanceSeparator} />
    </TouchableOpacity>
  );
};
