import React from 'react';
import { ListRenderItem, RefreshControl, StyleProp, View } from 'react-native';
import { TokenBalanceItemType } from 'types/ui-types';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';
import { LeftIconButton } from 'components/LeftIconButton';
import { Coins, SlidersHorizontal } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isEthereumAddress } from '@polkadot/util-crypto';

interface Props {
  items: TokenBalanceItemType[];
  renderItem: ListRenderItem<TokenBalanceItemType> | null | undefined;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
}

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

export const TokensTab = ({ items: tokenBalanceItems, renderItem, isRefresh, refresh, refreshTabId }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const renderFooterComponent = () => {
    if (!tokenBalanceItems.length || !isEthereumAddress(currentAccountAddress)) {
      return null;
    }

    return (
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <LeftIconButton
          icon={SlidersHorizontal}
          title={'Manage Token List'}
          onPress={() => navigation.navigate('EvmTokens')}
        />
      </View>
    );
  };

  if (!tokenBalanceItems.length) {
    return (
      <Tabs.ScrollView
        accessibilityTraits
        accessibilityComponentType
        contentContainerStyle={flatListContentContainerStyle}>
        <View style={emptyListWrapperStyle}>
          <EmptyList icon={Coins} title={'Your token will appear here'} />
        </View>
      </Tabs.ScrollView>
    );
  }

  return (
    <Tabs.FlatList
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
      style={{ ...CollapsibleFlatListStyle }}
      keyboardShouldPersistTaps={'handled'}
      data={tokenBalanceItems}
      renderItem={renderItem}
      ListFooterComponent={renderFooterComponent}
      refreshControl={
        <RefreshControl
          style={{ backgroundColor: ColorMap.dark2, opacity: refreshTabId === 'one' ? 1 : 0 }}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => refresh('one')}
        />
      }
    />
  );
};
