import React from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import i18n from 'utils/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoredSiteInfo } from 'stores/types';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ListRenderItemInfo } from 'react-native';
import { BrowserItem } from 'components/BrowserItem';
import { GlobeHemisphereEast, Star } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { EmptyList } from 'components/EmptyList';

const filterFunction = (items: StoredSiteInfo[], searchString: string) => {
  return items.filter(info => info.url.toLowerCase().includes(searchString.toLowerCase()));
};

export const FavouritesDetail = () => {
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const navigation = useNavigation<RootNavigationProps>();

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
      title={i18n.common.favorites}
      items={bookmarkItems}
      autoFocus={false}
      flatListStyle={{ paddingBottom: 12 }}
      renderItem={renderSiteItem}
      searchFunction={filterFunction}
      renderListEmptyComponent={() => {
        return <EmptyList icon={Star} title={i18n.common.favouritesEmptyListPlaceholder} />;
      }}
    />
  );
};
