import React from 'react';
import { ScrollView, View } from 'react-native';
import SectionHeader from './SectionHeader';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { useCallback, useMemo } from 'react';
import { DAppInfo } from 'types/browser';
import { BrowserItem } from 'components/Browser/BrowserItem';
import createStylesheet from '../styles/BrowserHome';
import { getHostName } from 'utils/browser';

interface SectionListProps {
  data: RecommendedListType[];
  renderItem: (item: DAppInfo) => JSX.Element;
}

type RecommendedListType = {
  data: DAppInfo[];
};
const SectionList: React.FC<SectionListProps> = ({ data, renderItem }): JSX.Element => {
  const stylesheet = createStylesheet();
  return (
    <ScrollView
      horizontal
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={stylesheet.recommendListContentContainer}>
      {data.map(item => (
        <View key={Math.random()} style={stylesheet.recommendListSeparator}>
          {item.data.map(item2 => renderItem(item2))}
        </View>
      ))}
    </ScrollView>
  );
};
interface RecommendSectionProps {
  dApps: DAppInfo[] | undefined;
  onPressSectionItem: (item: DAppInfo) => void;
}
const RecommendSection: React.FC<RecommendSectionProps> = ({ dApps, onPressSectionItem }) => {
  const navigation = useNavigation<RootNavigationProps>();
  const stylesheet = createStylesheet();

  const renderSectionItem = useCallback(
    (item: DAppInfo) => {
      return (
        <BrowserItem
          key={item.id}
          style={stylesheet.browserItem}
          title={item.title}
          subtitle={getHostName(item.url)}
          url={item.url}
          logo={item.icon}
          tags={item.categories}
          onPress={() => onPressSectionItem(item)}
        />
      );
    },
    [onPressSectionItem, stylesheet.browserItem],
  );

  const recommendedList = useMemo((): RecommendedListType[] | [] => {
    if (!dApps) {
      return [];
    }
    const sectionData = [];
    for (let i = 0; i < 20; i += 5) {
      const section = {
        data: dApps.slice(i, i + 5),
      };
      sectionData.push(section);
    }
    return sectionData;
  }, [dApps]);

  return (
    <>
      <SectionHeader
        title={i18n.browser.recommended}
        actionTitle={i18n.browser.seeAll}
        onPress={() => navigation.navigate('BrowserListByTabview', { type: 'RECOMMENDED' })}
      />
      <SectionList data={recommendedList} renderItem={renderSectionItem} />
    </>
  );
};

export default RecommendSection;
