import React, { useEffect, useState } from 'react';
import { ColorMap } from 'styles/color';
import { ScreenContainer } from 'components/ScreenContainer';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { Search } from 'components/Search';
import i18n from 'utils/i18n/i18n';
import { Button } from 'components/Button';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { BrowserItem } from 'components/BrowserItem';
import { DAppSite, dAppSites } from '../../../predefined/dAppSites';
import { GlobeHemisphereEast } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { nativeAndClearCurrentScreenHistory } from 'utils/navigation';

function doFilter(searchString: string) {
  return dAppSites.filter(item => item.name.includes(searchString.toLowerCase()));
}

export const BrowserSearch = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const [filteredList, setFilteredList] = useState<DAppSite[]>(dAppSites);

  useEffect(() => {
    if (searchString) {
      setFilteredList(doFilter(searchString));
    } else {
      setFilteredList(dAppSites);
    }
  }, [searchString]);

  const onPressItem = (item: DAppSite) => {
    nativeAndClearCurrentScreenHistory(navigation, 'BrowserSearch', 'BrowserTab', { url: item.url, name: item.name });
  };

  const renderItem = ({ item }: ListRenderItemInfo<DAppSite>) => {
    return (
      <BrowserItem
        leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
        text={item.url}
        onPress={() => onPressItem(item)}
      />
    );
  };

  return (
    <ScreenContainer placeholderBgc={ColorMap.dark1}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.light, paddingVertical: 24 }}>
            Search Result
          </Text>
          {!!searchString && (
            <BrowserItem
              leftIcon={<GlobeHemisphereEast color={ColorMap.light} weight={'bold'} size={20} />}
              text={searchString}
              onPress={() => {}}
            />
          )}
          <FlatList data={filteredList} renderItem={renderItem} />
        </View>
      </View>
    </ScreenContainer>
  );
};
