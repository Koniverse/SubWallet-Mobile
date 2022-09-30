import React from 'react';
import { ListRenderItemInfo, RefreshControl, StyleProp, View } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';
import { BN_ZERO, getTokenDisplayName } from 'utils/chainBalances';
import { LeftIconButton } from 'components/LeftIconButton';
import { Coins, SlidersHorizontal } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  isShowZeroBalance?: boolean;
  networkKeys: string[];
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  networkBalanceMap: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
}

const alwaysShowedNetworkKeys = ['kusama', 'polkadot'];

const flatListContentContainerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  flexGrow: 1,
  justifyContent: 'center',
  position: 'relative',
};

const emptyListWrapperStyle: StyleProp<any> = {
  position: 'absolute',
  marginVertical: 'auto',
  alignItems: 'center',
  left: 0,
  right: 0,
  paddingTop: 48,
};

function getEmptyBalanceInfo(nativeToken?: string) {
  return {
    symbol: nativeToken || 'UNIT',
    displayedSymbol: (nativeToken && getTokenDisplayName(nativeToken)) || 'UNIT',
    balanceValue: BN_ZERO,
    convertedBalanceValue: BN_ZERO,
    detailBalances: [],
    childrenBalances: [],
    isReady: false,
  };
}

export const ChainsTab = ({
  networkKeys,
  onPressChainItem,
  networkBalanceMap,
  accountInfoByNetworkMap,
  isRefresh,
  refresh,
  refreshTabId,
  isShowZeroBalance,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const renderItem = ({ item: networkKey }: ListRenderItemInfo<string>) => {
    const info = accountInfoByNetworkMap[networkKey];
    const balanceInfo = networkBalanceMap[networkKey] || getEmptyBalanceInfo(info.nativeToken);

    if (!isShowZeroBalance && !alwaysShowedNetworkKeys.includes(networkKey) && balanceInfo.balanceValue.eq(BN_ZERO)) {
      return null;
    }

    return (
      <ChainBalance
        key={info.key}
        accountInfo={info}
        onPress={() => onPressChainItem(info, balanceInfo)}
        balanceInfo={balanceInfo}
      />
    );
  };

  const renderFooterComponent = () => {
    return (
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <LeftIconButton
          icon={SlidersHorizontal}
          title={i18n.common.customNetwork}
          onPress={() => navigation.navigate('NetworksSetting')}
        />
      </View>
    );
  };

  if (!networkKeys.length) {
    return (
      <Tabs.ScrollView
        accessibilityTraits
        accessibilityComponentType
        contentContainerStyle={flatListContentContainerStyle}>
        <View style={emptyListWrapperStyle}>
          <EmptyList icon={Coins} title={i18n.common.emptyChainListMessage} />
          {renderFooterComponent()}
        </View>
      </Tabs.ScrollView>
    );
  }

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
      style={{ ...CollapsibleFlatListStyle }}
      keyboardShouldPersistTaps={'handled'}
      data={networkKeys}
      renderItem={renderItem}
      ListFooterComponent={renderFooterComponent}
      refreshControl={
        <RefreshControl
          style={{ backgroundColor: ColorMap.dark2, opacity: refreshTabId === 'two' ? 1 : 0 }}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => refresh('two')}
        />
      }
    />
  );
};
