import React, { useCallback, useMemo, useState } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { BrowserSearchProps, RootNavigationProps } from 'routes/index';
import { navigateAndClearCurrentScreenHistory } from 'utils/navigation';
import { SiteInfo } from 'stores/types';
import { getHostName, getValidURL } from 'utils/browser';
import { createNewTab } from 'stores/updater';
import { BrowserItem } from 'components/Browser/BrowserItem';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/BrowserSearch';
import { EmptyList } from 'components/EmptyList';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import Typography from '../../../components/design-system-ui/typography';
import { SectionItem } from 'components/LazySectionList';

function doFilter(searchString: string) {
  return predefinedDApps.dapps.filter(item => item.name.toLowerCase().includes(searchString.toLowerCase()));
}

type SearchItemType = {
  isSearch?: boolean;
} & SiteInfo;

// todo: i18n all text
function getFirstSearchItem(searchString: string): SearchItemType {
  const url = getValidURL(searchString);

  if (url.startsWith('https://duckduckgo.com')) {
    return {
      url,
      name: `${searchString}`,
      isSearch: true,
    };
  } else {
    return {
      url,
      name: getHostName(url),
      isSearch: true,
    };
  }
}

function searchFunction(items: SearchItemType[], searchString: string) {
  if (!searchString) {
    return items;
  }

  return [getFirstSearchItem(searchString), ...doFilter(searchString)];
}

const emptyList = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
    />
  );
};

const groupBy = (item: SearchItemType) => {
  if (item.isSearch) {
    return '1|' + 'Search';
  }

  return '0|' + 'Recommended';
};

const sortSection = (a: SectionItem<SearchItemType>, b: SectionItem<SearchItemType>) => {
  return b.title.localeCompare(a.title);
};

// todo: check the performance of search
export const BrowserSearch = ({ route: { params } }: BrowserSearchProps) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const [searchItems] = useState<SearchItemType[]>(predefinedDApps.dapps);
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

  const renderItem = ({ item }: ListRenderItemInfo<SearchItemType>) => {
    return <BrowserItem name={item.name} url={item.url} onPress={() => onPressItem(item)} />;
  };

  const renderSectionHeader: (info: { section: SectionListData<SearchItemType> }) => React.ReactElement | null =
    useCallback(
      (info: { section: SectionListData<SearchItemType> }) => {
        return (
          <View style={stylesheet.sectionHeaderContainer}>
            <Typography.Text size={'lg'} style={stylesheet.sectionHeaderTitle}>
              {`${info.section.title.split('|')[1]}`}
            </Typography.Text>
          </View>
        );
      },
      [stylesheet.sectionHeaderContainer, stylesheet.sectionHeaderTitle],
    );

  const grouping = useMemo(() => {
    return { groupBy, sortSection, renderSectionHeader };
  }, [renderSectionHeader]);

  const BeforeListItem = useMemo(() => <View style={stylesheet.beforeListBlock} />, [stylesheet.beforeListBlock]);

  return (
    <FlatListScreen
      autoFocus
      showLeftBtn={true}
      items={searchItems}
      beforeListItem={BeforeListItem}
      title={'Search'}
      placeholder={'Search or enter website'}
      renderItem={renderItem}
      searchFunction={searchFunction}
      renderListEmptyComponent={emptyList}
      grouping={grouping}
      isShowMainHeader={false}
      searchMarginBottom={theme.sizeXS}
      flatListStyle={stylesheet.flatListStyle}
    />
  );
};
