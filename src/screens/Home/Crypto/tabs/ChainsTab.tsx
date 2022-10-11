import React from 'react';
import { ListRenderItem, RefreshControl, StyleProp, View } from 'react-native';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';
import { LeftIconButton } from 'components/LeftIconButton';
import { Coins, SlidersHorizontal } from 'phosphor-react-native';
import { EmptyList } from 'components/EmptyList';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';

interface Props {
  networkKeys: string[];
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
  renderItem: ListRenderItem<string> | null | undefined;
  isEmptyList: boolean;
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

export const ChainsTab = ({ networkKeys, isRefresh, refresh, refreshTabId, renderItem, isEmptyList }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();

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

  if (isEmptyList) {
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
