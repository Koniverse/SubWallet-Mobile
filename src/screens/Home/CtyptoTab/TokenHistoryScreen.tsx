import React, { useContext, useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { getNetworkLogo } from 'utils/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { AccountInfoByNetwork } from 'types/ui-types';
import { HistoryTab } from 'screens/Home/CtyptoTab/shared/HistoryTab';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';
import { BalanceInfo } from '../../../types';
import BigN from 'bignumber.js';
import { WebViewContext } from 'providers/contexts';

interface Props {
  onPressBack: () => void;
  selectedTokenName: string;
  selectedTokenSymbol: string;
  networkBalanceMaps: Record<string, BalanceInfo>;
  selectedNetworkInfo: AccountInfoByNetwork;
}

const containerStyle: StyleProp<any> = {
  paddingBottom: 0,
};

const tokenHistoryHeader: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const tokenHistoryHeaderTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 4,
  maxWidth: 150,
};

const actionButtonContainerStyle: StyleProp<any> = {
  paddingTop: 25,
};

// value, converted value
function getTokenBalanceValue(
  networkKey: string,
  token: string,
  networkBalanceMaps: Record<string, BalanceInfo>,
): [BigN, BigN] {
  if (networkBalanceMaps[networkKey]) {
    const balanceInfo = networkBalanceMaps[networkKey];
    if (balanceInfo.symbol === token) {
      return [balanceInfo.balanceValue, balanceInfo.convertedBalanceValue];
    }

    if (balanceInfo.childrenBalances) {
      const childrenBalanceInfo = balanceInfo.childrenBalances.find(i => i.symbol === token);

      if (childrenBalanceInfo) {
        return [childrenBalanceInfo.balanceValue, childrenBalanceInfo.convertedBalanceValue];
      }
    }
  }

  return [new BigN(0), new BigN(0)];
}

export const TokenHistoryScreen = ({
  onPressBack,
  selectedTokenName,
  selectedTokenSymbol,
  selectedNetworkInfo,
  networkBalanceMaps,
}: Props) => {
  const [balanceValue, convertedBalanceValue] = getTokenBalanceValue(
    selectedNetworkInfo.networkKey,
    selectedTokenSymbol,
    networkBalanceMaps,
  );

  const [refreshing, setRefreshing] = useState(false);
  const { viewRef } = useContext(WebViewContext);

  const onRefresh = () => {
    setRefreshing(true);
    if (viewRef && viewRef.current) {
      viewRef.current.reload();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderHeaderContent = () => {
    return (
      <View style={tokenHistoryHeader}>
        {getNetworkLogo(selectedNetworkInfo.networkKey, 20)}
        <Text style={tokenHistoryHeaderTitle} numberOfLines={1}>
          {selectedNetworkInfo.networkDisplayName.replace(' Relay Chain', '')}
        </Text>
        <Text
          style={{
            ...sharedStyles.mediumText,
            ...FontSemiBold,
            color: ColorMap.light,
            paddingLeft: 4,
          }}>
          {`(${selectedTokenName})`}
        </Text>
      </View>
    );
  };

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      backgroundColor={ColorMap.dark2}
      title={''}
      statusBarColor={ColorMap.dark2}
      style={containerStyle}
      headerContent={renderHeaderContent}>
      <View style={{ flex: 1 }}>
        <BalanceBlock
          isShowBalanceToUsd
          startWithSymbol={false}
          actionButtonContainerStyle={actionButtonContainerStyle}
          symbol={selectedTokenName}
          balanceValue={balanceValue}
          amountToUsd={convertedBalanceValue}
          selectionProvider={{
            selectedNetworkKey: selectedNetworkInfo.networkKey,
            selectedToken: selectedTokenSymbol,
          }}
        />

        <View style={{ backgroundColor: ColorMap.dark1, flex: 1 }}>
          <HistoryTab networkKey={selectedNetworkInfo.networkKey} token={selectedTokenSymbol} />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
