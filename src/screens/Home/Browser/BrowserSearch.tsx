import React, { useEffect, useState } from 'react';
import { ColorMap } from 'styles/color';
import { ScreenContainer } from 'components/ScreenContainer';
import { FlatList, ListRenderItemInfo, StyleProp, Text, View } from 'react-native';
import { Search } from 'components/Search';
import i18n from 'utils/i18n/i18n';
import { Button } from 'components/Button';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BrowserItem } from 'components/BrowserItem';
import { dAppSites } from '../../../predefined/dAppSites';
import { GlobeHemisphereEast } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { nativeAndClearCurrentScreenHistory } from 'utils/navigation';
import { SiteInfo } from 'stores/types';
import { isValidURL } from 'utils/browser';
import { getHostName } from 'utils/browser';

function doFilter(searchString: string) {
  return dAppSites.filter(item => item.url.toLowerCase().includes(searchString.toLowerCase()));
}

type SearchItemType = {
  displayUrl?: string;
} & SiteInfo;

function getFirstSearchItem(searchString: string): SearchItemType {
  if (isValidURL(searchString)) {
    const url =
      searchString.startsWith('http://') || searchString.startsWith('https://')
        ? searchString
        : `https://${searchString}`;

    const hostname = getHostName(url);

    return {
      url,
      name: hostname,
    };
  } else {
    return {
      url: `https://duckduckgo.com/?q=${encodeURIComponent(searchString)}`,
      displayUrl: `${searchString} - ${i18n.common.searchAtDuckDuckGo}`,
      name: 'duckduckgo.com',
    };
  }
}

const searchResultStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
  paddingVertical: 24,
  ...ContainerHorizontalPadding,
};

export const BrowserSearch = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const [filteredList, setFilteredList] = useState<SearchItemType[]>(dAppSites);

  useEffect(() => {
    if (searchString) {
      setFilteredList([getFirstSearchItem(searchString), ...doFilter(searchString)]);
    } else {
      setFilteredList(dAppSites);
    }
  }, [searchString]);

  const onPressItem = (item: SearchItemType) => {
    nativeAndClearCurrentScreenHistory(navigation, 'BrowserSearch', 'BrowserTab', { url: item.url, name: item.name });
  };

  const renderItem = ({ item }: ListRenderItemInfo<SearchItemType>) => {
    return (
      <BrowserItem
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.displayUrl || item.url}
        onPress={() => onPressItem(item)}
      />
    );
  };

  return (
    <ScreenContainer>
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', ...ContainerHorizontalPadding }}>
          <Search
            style={{ flex: 1, marginRight: 8 }}
            autoFocus={true}
            autoCapitalize={'none'}
            searchText={searchString}
            onSearch={setSearchString}
            onClearSearchString={() => setSearchString('')}
            placeholder={i18n.common.searchPlaceholder}
          />

          <Button title={i18n.common.cancel} onPress={() => navigation.canGoBack() && navigation.goBack()} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={searchResultStyle}>{i18n.common.searchResult}</Text>
          <FlatList data={filteredList} renderItem={renderItem} />
        </View>
      </>
    </ScreenContainer>
  );
};
