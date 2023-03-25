import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoredSiteInfo } from 'stores/types';
import { BrowserItem } from 'components/BrowserItem';
import { ClockCounterClockwise, GlobeHemisphereEast, Trash } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Alert, ListRenderItemInfo } from 'react-native';
import { clearHistory } from 'stores/updater';
import { EmptyList } from 'components/EmptyList';

const filterFunction = (items: StoredSiteInfo[], searchString: string) => {
  return items.filter(info => info.url.toLowerCase().includes(searchString.toLowerCase()));
};

export const HistoryDetail = () => {
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const navigation = useNavigation<RootNavigationProps>();

  const _clearHistory = () => {
    Alert.alert(i18n.warningTitle.clearHistory, i18n.warningMessage.clearHistoryWarningMessage, [
      {
        text: i18n.common.cancel,
      },
      {
        text: i18n.common.ok,
        onPress: () => clearHistory(),
      },
    ]);
  };

  const renderSiteItem = ({ item }: ListRenderItemInfo<StoredSiteInfo>) => {
    return (
      <BrowserItem
        key={item.id}
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.url}
        onPress={() => navigation.navigate('BrowserTabsManager', { url: item.url, name: item.name })}
      />
    );
  };
  return (
    <FlatListScreen
      title={i18n.common.history}
      items={historyItems}
      autoFocus={false}
      searchFunction={filterFunction}
      renderItem={renderSiteItem}
      rightIconOption={{
        icon: Trash,
        onPress: () => _clearHistory(),
        disabled: !(historyItems && historyItems.length),
      }}
      flatListStyle={{ paddingBottom: 12 }}
      renderListEmptyComponent={() => {
        return <EmptyList icon={ClockCounterClockwise} title={i18n.common.historyEmptyListPlaceholder} />;
      }}
    />
  );
};
