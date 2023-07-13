import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SectionListRenderItemInfo, SectionList, View } from 'react-native';
import { DAppTitleMap, predefinedDApps } from '../../../predefined/dAppSites';
import { useNavigation } from '@react-navigation/native';
import { BrowserSearchProps, RootNavigationProps } from 'routes/index';
import { navigateAndClearCurrentScreenHistory } from 'utils/navigation';
import { StoredSiteInfo } from 'stores/types';
import { getHostName, getValidURL } from 'utils/browser';
import { clearHistory, createNewTab } from 'stores/updater';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/BrowserSearch';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import Typography from '../../../components/design-system-ui/typography';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { addLazy } from '@subwallet/extension-base/utils';
import { BrowserSearchItem } from 'components/Browser/BrowserSearchItem';
import { Button } from 'components/design-system-ui';
import i18n from 'utils/i18n/i18n';

type SearchItemType = {
  logo?: string;
  tags?: string[];
  isSearch?: boolean;
  subtitle: string;
} & StoredSiteInfo;

type SectionItem = { title: string; data: SearchItemType[]; type: string };

const recommendItems: SearchItemType[] = predefinedDApps.dapps.map(i => ({
  id: i.id,
  logo: i.icon,
  tags: i.categories,
  url: i.url,
  name: i.name,
  subtitle: getHostName(i.url),
}));

function getFirstSearchItem(searchString: string): SearchItemType {
  const url = getValidURL(searchString);

  if (url.startsWith('https://duckduckgo.com')) {
    return {
      id: 'search',
      url,
      name: `${searchString}`,
      subtitle: i18n.browser.searchWithDuckduckgo,
      isSearch: true,
    };
  } else {
    return {
      id: 'search',
      url,
      name: url,
      subtitle: getHostName(url),
      isSearch: true,
    };
  }
}

export const BrowserSearch = ({ route: { params } }: BrowserSearchProps) => {
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const searchStringRef = useRef('');
  const [sectionItems, setSectionItems] = useState<SectionItem[]>([]);
  const isOpenNewTab = params && params.isOpenNewTab;

  const onPressItem = (item: SearchItemType) => {
    if (isOpenNewTab) {
      createNewTab(item.url);
    }

    navigateAndClearCurrentScreenHistory(navigation, 'BrowserSearch', 'BrowserTabsManager', {
      url: item.url,
      name: item.name,
    });
  };

  const renderItem = ({ item, section }: SectionListRenderItemInfo<SearchItemType>) => {
    if (item.isSearch) {
      return (
        <BrowserSearchItem key={item.id} title={item.name} subtitle={item.subtitle} onPress={() => onPressItem(item)} />
      );
    }

    return (
      <BrowserItem
        key={item.id}
        logo={item.logo}
        title={item.name}
        tags={item.tags}
        url={item.url}
        subtitle={section.type === 'history' ? item.url : item.subtitle}
        onPress={() => onPressItem(item)}
      />
    );
  };

  const renderSectionHeader: (info: { section: SectionListData<SearchItemType> }) => React.ReactElement | null =
    useCallback(
      (info: { section: SectionListData<SearchItemType> }) => {
        return (
          <View style={stylesheet.sectionHeaderContainer}>
            <Typography.Text size={'md'} style={stylesheet.sectionHeaderTitle}>
              {`${info.section.title}`}
            </Typography.Text>

            {info.section.type === 'history' && (
              <Button
                style={stylesheet.clearButton}
                size={'xs'}
                type={'ghost'}
                onPress={clearHistory}
                externalTextStyle={{ color: theme.colorPrimary }}>
                Clear history
              </Button>
            )}
          </View>
        );
      },
      [stylesheet.clearButton, stylesheet.sectionHeaderContainer, stylesheet.sectionHeaderTitle, theme.colorPrimary],
    );

  const getSectionItems = useCallback((): SectionItem[] => {
    const _historyItems = (
      !searchStringRef.current
        ? historyItems
        : historyItems.filter(i => i.name.toLowerCase().includes(searchStringRef.current.toLowerCase()))
    ).map(i => {
      const dapp = predefinedDApps.dapps.find(a => i.url.includes(a.id));

      const hostName = getHostName(i.url);

      return {
        id: i.id,
        logo: dapp?.icon,
        tags: dapp?.categories,
        url: i.url,
        name: DAppTitleMap[hostName] || i.name,
        subtitle: hostName,
      };
    });
    const result: SectionItem[] = [];

    if (searchStringRef.current) {
      result.push({
        title: i18n.common.search,
        data: [getFirstSearchItem(searchStringRef.current)],
        type: 'search',
      });
    }

    if (_historyItems.length) {
      result.push({
        title: i18n.common.history,
        data: _historyItems,
        type: 'history',
      });
    }

    const _recommendItems = !searchStringRef.current
      ? recommendItems
      : recommendItems.filter(i => i.name.toLowerCase().includes(searchStringRef.current.toLowerCase()));

    if (_recommendItems.length) {
      result.push({
        title: i18n.common.recommend,
        data: !searchStringRef.current
          ? recommendItems
          : recommendItems.filter(i => i.name.toLowerCase().includes(searchStringRef.current.toLowerCase())),
        type: 'recommend',
      });
    }

    return result;
  }, [historyItems]);

  useEffect(() => {
    const newItem = getSectionItems();
    setSectionItems(newItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyItems]);
  const onSearch = (value: string) => {
    searchStringRef.current = value;
    const newItem = getSectionItems();
    setSearchString(value);
    addLazy('searchBrowser', () => {
      setSectionItems(newItem);
    });
  };
  const onClearSearch = () => {
    onSearch('');
  };

  return (
    <ContainerWithSubHeader
      title={i18n.header.search}
      showLeftBtn
      onPressBack={() => {
        navigation.canGoBack() && navigation.goBack();
      }}>
      <View style={stylesheet.listContainer}>
        <Search
          style={stylesheet.search}
          autoFocus
          placeholder={i18n.placeholder.searchWebsite}
          onClearSearchString={onClearSearch}
          onSearch={onSearch}
          searchText={searchString}
        />
        <SectionList
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          renderItem={renderItem}
          stickySectionHeadersEnabled
          renderSectionHeader={renderSectionHeader}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={12}
          initialNumToRender={12}
          contentContainerStyle={stylesheet.listStyle}
          sections={sectionItems}
        />
      </View>
    </ContainerWithSubHeader>
  );
};
