import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoredSiteInfo } from 'stores/types';
import { BrowserItem } from 'components/BrowserItem';
import { GlobeHemisphereEast } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ListRenderItemInfo } from 'react-native';

const filterFunction = (items: StoredSiteInfo[], searchString: string) => {
  return items.filter(info => info.url.toLowerCase().includes(searchString.toLowerCase()));
};

export const HistoryDetail = () => {
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const navigation = useNavigation<RootNavigationProps>();

  const onPressItem = (item: StoredSiteInfo) => {
    navigation.navigate('BrowserTab', { url: item.url, name: item.name });
  };

  const renderSiteItem = ({ item }: ListRenderItemInfo<StoredSiteInfo>) => {
    return (
      <BrowserItem
        key={item.id}
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.url}
        onPress={() => onPressItem(item)}
      />
    );
  };
  return (
    <FlatListScreen
      title={i18n.common.history}
      items={historyItems}
      autoFocus={false}
      filterFunction={filterFunction}
      renderItem={renderSiteItem}
      renderListEmptyComponent={() => {
        return <></>;
      }}
    />
  );
};
