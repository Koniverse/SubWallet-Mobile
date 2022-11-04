import React from 'react';
import { ListRenderItem, RefreshControl, RefreshControlProps, StyleProp, View } from 'react-native';
import { TokenBalanceItemType } from 'types/ui-types';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { LeftIconButton } from 'components/LeftIconButton';
import { Coins, SlidersHorizontal } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  items: TokenBalanceItemType[];
  renderItem: ListRenderItem<TokenBalanceItemType> | null | undefined;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
  isEmptyList?: boolean;
}

const flatListContentContainerStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
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

export const TokensTab = ({
  items: tokenBalanceItems,
  renderItem,
  isRefresh,
  refresh,
  refreshTabId,
  isEmptyList,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const renderFooterComponent = () => {
    return (
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 16 }}>
        <LeftIconButton
          icon={SlidersHorizontal}
          title={i18n.common.manageTokenList}
          onPress={() => navigation.navigate('CustomTokenSetting')}
        />
      </View>
    );
  };

  const renderRefreshControl = ():
    | React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>
    | undefined => {
    return (
      <RefreshControl
        style={{ backgroundColor: ColorMap.dark2, opacity: refreshTabId === 'one' ? 1 : 0 }}
        tintColor={ColorMap.light}
        refreshing={isRefresh}
        onRefresh={() => refresh('one')}
      />
    );
  };

  if (isEmptyList) {
    return (
      <Tabs.ScrollView
        showsVerticalScrollIndicator={false}
        accessibilityTraits
        accessibilityComponentType
        contentContainerStyle={flatListContentContainerStyle}
        refreshControl={renderRefreshControl()}>
        <View style={emptyListWrapperStyle}>
          <EmptyList icon={Coins} title={i18n.common.emptyTokenListMessage} />
          {renderFooterComponent()}
        </View>
      </Tabs.ScrollView>
    );
  }

  return (
    <Tabs.FlatList
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: ColorMap.dark2 }}
      keyboardShouldPersistTaps={'handled'}
      data={tokenBalanceItems}
      renderItem={renderItem}
      ListFooterComponent={renderFooterComponent}
      refreshControl={renderRefreshControl()}
    />
  );
};
