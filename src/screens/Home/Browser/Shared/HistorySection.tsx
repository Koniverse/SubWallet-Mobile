import React, { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import SectionHeader from './SectionHeader';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { browserHomeItemIconOnly, browserHomeItemWidth } from 'constants/itemHeight';
import { DAppInfo } from 'types/browser';
import { StoredSiteInfo } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import IconItem from './IconItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from '../styles/BrowserHome';

const ICON_ITEM_HEIGHT = browserHomeItemIconOnly;
const ITEM_WIDTH = browserHomeItemWidth;
interface HistorySectionProps {
  dApps: DAppInfo[] | undefined;
  renderItemSeparator: React.ComponentType<any> | null | undefined;
}
const HistorySection: React.FC<HistorySectionProps> = ({ dApps, renderItemSeparator }) => {
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet();

  const renderRecentItem: ListRenderItem<StoredSiteInfo> = useCallback(
    ({ item }) => {
      return <IconItem data={dApps} itemData={item} />;
    },
    [dApps],
  );

  const getItemLayout = (data: StoredSiteInfo[] | null | undefined, index: number) => ({
    index,
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
  });

  if (!historyItems || historyItems?.length === 0) {
    return null;
  }

  return (
    <>
      <SectionHeader
        title={i18n.browser.recent}
        actionTitle={i18n.browser.seeAll}
        onPress={() => navigation.navigate('BrowserSearch')}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: ICON_ITEM_HEIGHT, marginBottom: theme.marginSM }}
        contentContainerStyle={stylesheet.flatListContentContainer}
        data={historyItems}
        renderItem={renderRecentItem}
        ItemSeparatorComponent={renderItemSeparator}
        getItemLayout={getItemLayout}
        horizontal
      />
    </>
  );
};

export default HistorySection;
