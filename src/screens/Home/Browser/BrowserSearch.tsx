import React, { useEffect, useState } from 'react';
import { ColorMap } from 'styles/color';
import { ScreenContainer } from 'components/ScreenContainer';
import { FlatList, ListRenderItemInfo, StyleProp, Text, View } from 'react-native';
import { Search } from 'components/Search';
import i18n from 'utils/i18n/i18n';
import { Button } from 'components/Button';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BrowserItem } from 'components/BrowserItem';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { GlobeHemisphereEast } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { BrowserSearchProps, RootNavigationProps } from 'routes/index';
import { navigateAndClearCurrentScreenHistory } from 'utils/navigation';
import { SiteInfo } from 'stores/types';
import { getHostName, getValidURL } from 'utils/browser';
import { createNewTab } from 'stores/updater';

function doFilter(searchString: string) {
  return predefinedDApps.dapps.filter(item => item.url.toLowerCase().includes(searchString.toLowerCase()));
}

type SearchItemType = {
  displayUrl?: string;
} & SiteInfo;

function getFirstSearchItem(searchString: string): SearchItemType {
  const url = getValidURL(searchString);

  if (url.startsWith('https://duckduckgo.com')) {
    return {
      url,
      displayUrl: `${searchString} - ${i18n.common.searchAtDuckDuckGo}`,
      name: 'duckduckgo.com',
    };
  } else {
    return {
      url,
      name: getHostName(url),
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

export const BrowserSearch = ({ route: { params } }: BrowserSearchProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const [filteredList, setFilteredList] = useState<SearchItemType[]>(predefinedDApps.dapps);
  const isOpenNewTab = params && params.isOpenNewTab;

  useEffect(() => {
    if (searchString) {
      setFilteredList([getFirstSearchItem(searchString), ...doFilter(searchString)]);
    } else {
      setFilteredList(predefinedDApps.dapps);
    }
  }, [searchString]);

  const onPressItem = (item: SearchItemType) => {
    if (isOpenNewTab) {
      createNewTab(item.url);
    }

    navigateAndClearCurrentScreenHistory(navigation, 'BrowserSearch', 'BrowserTabsManager', {
      url: item.url,
      name: item.name,
    });
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
            onSubmitEditing={({ nativeEvent: { text } }) => {
              onPressItem(getFirstSearchItem(text));
            }}
          />

          <Button title={i18n.common.cancel} onPress={() => navigation.canGoBack() && navigation.goBack()} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={searchResultStyle}>{i18n.common.searchResult}</Text>
          <FlatList
            data={filteredList}
            renderItem={renderItem}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        </View>
      </>
    </ScreenContainer>
  );
};
