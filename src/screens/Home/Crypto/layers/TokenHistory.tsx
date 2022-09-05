import { ScreenContainer } from 'components/ScreenContainer';
import React, { useState } from 'react';
import * as Tabs from 'react-native-collapsible-tab-view';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { HistoryTab } from 'screens/Home/Crypto/tabs/HistoryTab';
import { SubHeader } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { StyleProp, View } from 'react-native';
import { getNetworkLogo, getTokenBalanceKey } from 'utils/index';
import Text from 'components/Text';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import TabsContainerHeader from 'screens/Home/Crypto/TabsContainerHeader';
import BigN from 'bignumber.js';
import { BN_ZERO } from 'utils/chainBalances';
import { useRefresh } from 'hooks/useRefresh';
import i18n from 'utils/i18n/i18n';

interface Prop {
  onPressBack: () => void;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
  selectedTokenSymbol: string;
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedTokenDisplayName: string;
}

const tokenHistoryHeaderStyle: StyleProp<any> = {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const tokenHistoryHeaderTitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingLeft: 4,
  maxWidth: 150,
};

const renderTokenHistoryHeaderContent = (
  selectedNetworkInfo: AccountInfoByNetwork,
  selectedTokenDisplayName: string,
  selectedTokenSymbol: string,
) => {
  const logoKey =
    selectedTokenSymbol === selectedNetworkInfo.nativeToken ? selectedNetworkInfo.networkKey : selectedTokenSymbol;
  return () => {
    return (
      <View style={tokenHistoryHeaderStyle}>
        {getNetworkLogo(logoKey, 20, selectedNetworkInfo.networkKey)}
        <Text style={tokenHistoryHeaderTitleStyle} numberOfLines={1}>
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
};

// value, converted value
function getBalanceValue(
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  selectedTokenSymbol: string,
  selectedNetworkInfo: AccountInfoByNetwork,
): [BigN, BigN] {
  if (selectedNetworkInfo && selectedTokenSymbol) {
    const tbKey = getTokenBalanceKey(
      selectedNetworkInfo.networkKey,
      selectedTokenSymbol,
      selectedNetworkInfo.isTestnet,
    );

    if (tokenBalanceMap[tbKey]) {
      return [tokenBalanceMap[tbKey].balanceValue, tokenBalanceMap[tbKey].convertedBalanceValue];
    }
  }

  return [BN_ZERO, BN_ZERO];
}

const TokenHistoryLayer = ({
  onPressBack,
  tokenBalanceMap,
  selectedNetworkInfo,
  selectedTokenSymbol,
  selectedTokenDisplayName,
}: Prop) => {
  const [isRefresh, refresh] = useRefresh();
  const [refreshTabId, setRefreshTabId] = useState<string>('');

  const _onRefresh = (tabId: string) => {
    setRefreshTabId(tabId);
    refresh();
  };
  const renderTabContainerHeader = () => {
    const [balanceValue, amountToUsd] = getBalanceValue(tokenBalanceMap, selectedTokenSymbol, selectedNetworkInfo);

    return (
      <TabsContainerHeader
        balanceBlockProps={{
          balanceValue,
          amountToUsd,
          isShowBalanceToUsd: true,
          startWithSymbol: false,
          symbol: selectedTokenDisplayName,
        }}
        selectionProvider={{ selectedNetworkKey: selectedNetworkInfo.networkKey, selectedToken: selectedTokenSymbol }}
        actionButtonContainerStyle={{
          paddingTop: 25,
        }}
      />
    );
  };

  return (
    <ScreenContainer>
      <>
        <SubHeader
          showRightBtn
          backgroundColor={ColorMap.dark2}
          onPressBack={onPressBack}
          headerContent={renderTokenHistoryHeaderContent(
            selectedNetworkInfo,
            selectedTokenDisplayName,
            selectedTokenSymbol,
          )}
          title={''}
        />
        <Tabs.Container
          lazy
          allowHeaderOverscroll={true}
          renderTabBar={() => <></>}
          renderHeader={renderTabContainerHeader}>
          <Tabs.Tab name={'one'} label={i18n.title.history}>
            <HistoryTab
              networkKey={selectedNetworkInfo.networkKey}
              token={selectedTokenSymbol}
              isRefresh={isRefresh}
              refresh={_onRefresh}
              refreshTabId={refreshTabId}
            />
          </Tabs.Tab>
        </Tabs.Container>
      </>
    </ScreenContainer>
  );
};

export default TokenHistoryLayer;
