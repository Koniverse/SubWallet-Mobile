import React, { useCallback } from 'react';
import { browserHomeItem, browserHomeItemWidth } from 'constants/itemHeight';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FlatList, ListRenderItem } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { StoredSiteInfo } from 'stores/types';
import IconItem from './IconItem';
import createStylesheet from '../styles/BrowserHome';
import SectionHeader from './SectionHeader';
import { DAppInfo } from 'types/browser';

const ITEM_HEIGHT = browserHomeItem;
const ITEM_WIDTH = browserHomeItemWidth;
interface BookmarkSectionProps {
  dApps: DAppInfo[] | undefined;
  renderItemSeparator: React.ComponentType<any> | null | undefined;
}
const BookmarkSection: React.FC<BookmarkSectionProps> = ({ dApps, renderItemSeparator }) => {
  const stylesheet = createStylesheet();
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);

  const renderBookmarkItem: ListRenderItem<StoredSiteInfo> = useCallback(
    ({ item }) => {
      return <IconItem data={dApps} itemData={item} isWithText />;
    },
    [dApps],
  );

  const getItemLayout = (data: StoredSiteInfo[] | null | undefined, index: number) => ({
    index,
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
  });

  if (!bookmarkItems || bookmarkItems?.length === 0) {
    return null;
  }

  return (
    <>
      <SectionHeader
        title={i18n.browser.favorite}
        actionTitle={i18n.browser.seeAll}
        onPress={() => navigation.navigate('BrowserListByTabview', { type: 'BOOKMARK' })}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: ITEM_HEIGHT, marginBottom: theme.marginSM }}
        contentContainerStyle={stylesheet.flatListContentContainer}
        data={bookmarkItems}
        renderItem={renderBookmarkItem}
        ItemSeparatorComponent={renderItemSeparator}
        getItemLayout={getItemLayout}
        horizontal
      />
    </>
  );
};

export default BookmarkSection;
