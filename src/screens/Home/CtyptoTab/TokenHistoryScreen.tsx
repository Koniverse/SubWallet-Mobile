import React from 'react';
import { StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { getNetworkLogo } from 'utils/index';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { AccountInfoByNetwork } from 'types/ui-types';
import { HistoryTab } from 'screens/Home/CtyptoTab/shared/HistoryTab';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';
import { BalanceInfo } from '../../../types';
import BigN from 'bignumber.js';
import * as Tabs from 'react-native-collapsible-tab-view';

interface Props {
  onPressBack: () => void;
  selectedTokenDisplayName: string;
  selectedTokenSymbol: string;
  networkBalanceMap: Record<string, BalanceInfo>;
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
  networkBalanceMap: Record<string, BalanceInfo>,
): [BigN, BigN] {
  if (networkBalanceMap[networkKey]) {
    const balanceInfo = networkBalanceMap[networkKey];
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
  selectedTokenDisplayName,
  selectedTokenSymbol,
  selectedNetworkInfo,
  networkBalanceMap,
}: Props) => {
  const [balanceValue, convertedBalanceValue] = getTokenBalanceValue(
    selectedNetworkInfo.networkKey,
    selectedTokenSymbol,
    networkBalanceMap,
  );

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
          {`(${selectedTokenDisplayName})`}
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
      <Tabs.Container
        lazy
        allowHeaderOverscroll={true}
        renderTabBar={() => <></>}
        renderHeader={() => {
          return (
            <BalanceBlock
              isShowBalanceToUsd
              startWithSymbol={false}
              actionButtonContainerStyle={actionButtonContainerStyle}
              symbol={selectedTokenDisplayName}
              balanceValue={balanceValue}
              amountToUsd={convertedBalanceValue}
              selectionProvider={{
                selectedNetworkKey: selectedNetworkInfo.networkKey,
                selectedToken: selectedTokenSymbol,
              }}
            />
          );
        }}>
        <Tabs.Tab name="history">
          <HistoryTab networkKey={selectedNetworkInfo.networkKey} token={selectedTokenSymbol} isUseCollapsibleTabView />
        </Tabs.Tab>
      </Tabs.Container>
    </ContainerWithSubHeader>
  );
};
