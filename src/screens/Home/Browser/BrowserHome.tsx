import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { CaretRight } from 'phosphor-react-native';
import { BrowserSearchProps } from 'routes/index';
import browserHomeStyle from './styles/BrowserHome';
import FastImage from 'react-native-fast-image';
import { Images } from 'assets/index';
import { Typography, Image, Icon, Squircle } from 'components/design-system-ui';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppInfo, PredefinedDApps } from 'types/browser';
import { SvgUri } from 'react-native-svg';

interface HeaderProps {
  title: string;
  onPress: () => void;
}
type DappItem = {
  item: DAppInfo;
};
const styles = browserHomeStyle();
const ICON_ITEM_HEIGHT = 44;
const ITEM_HEIGHT = 72;
const SectionHeader: React.FC<HeaderProps> = ({ title, onPress }): JSX.Element => {
  return (
    <View style={styles.sectionContainer}>
      <Typography.Title style={styles.sectionTitle}>{title}</Typography.Title>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.sectionAction}>
          <Typography.Text style={styles.sectionActionTitle}>See all</Typography.Text>
          <Icon phosphorIcon={CaretRight} weight="bold" customSize={16} iconColor="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// TODO: ADD LW's item
const SectionList: React.FC<HeaderProps> = ({ data, onPress }): JSX.Element => {
  return (
    <ScrollView horizontal>
      {data.map(item => (
        <View>
          {item.data.map(item2 => (
            <Typography.Title style={styles.sectionTitle}>{item2.name}</Typography.Title>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const BrowserSearch = ({ route }: BrowserSearchProps) => {
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);
  const recommendedList = useMemo(() => {
    const sectionData = [];
    for (let i = 0; i < dApps.dapps.length; i += 4) {
      const section = {
        data: dApps.dapps.slice(i, i + 4),
      };
      sectionData.push(section);
    }
    return sectionData;
  }, [dApps.dapps]);

  const renderRecentItem = ({ item }: DappItem) => {
    const data = dApps.dapps.find(dAppItem => item.url.includes(dAppItem.id));
    if (data) {
      const iconFragment = data.icon.split('.');
      if (iconFragment[iconFragment.length - 1].toLowerCase() === 'svg') {
        return (
          <TouchableOpacity>
            <Squircle
              squircleStyle={styles.absolute}
              customStyle={styles.squircleWrapper}
              backgroundColor={'transparent'}
              customSize={44}>
              <SvgUri width={44} height={44} uri={data?.icon} />
            </Squircle>
          </TouchableOpacity>
        );
      }
    }
    return (
      <TouchableOpacity>
        <Image
          src={{ uri: data?.icon || assetLogoMap.default }}
          style={styles.imageItem}
          shape="squircle"
          squircleSize={44}
        />
      </TouchableOpacity>
    );
  };
  const renderBookmarkItem = ({ item }: DappItem) => {
    const data = dApps.dapps.find(dAppItem => item.url.includes(dAppItem.id));
    console.log(item);
    if (data) {
      const iconFragment = data.icon.split('.');
      if (iconFragment[iconFragment.length - 1].toLowerCase() === 'svg') {
        return (
          <TouchableOpacity>
            <Squircle
              squircleStyle={{ position: 'absolute' }}
              customStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              backgroundColor={'transparent'}
              customSize={44}>
              <SvgUri width={44} height={44} uri={data?.icon} />
            </Squircle>
          </TouchableOpacity>
        );
      }
    }
    return (
      <TouchableOpacity style={{ alignItems: 'center' }}>
        <Image
          src={{ uri: data?.icon || assetLogoMap.default }}
          style={{ width: 55, height: 55 }}
          shape="squircle"
          squircleSize={44}
        />
        <Typography.Text style={{ width: 40, color: 'white', fontSize: 10, fontWeight: '700' }} ellipsis>
          {data?.name}
        </Typography.Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FastImage style={styles.banner} resizeMode="cover" source={Images.browserBanner} />
      {historyItems && historyItems.length > 0 && (
        <>
          <SectionHeader title="Recent" onPress={() => console.log('press')} />
          <FlatList
            style={{ maxHeight: ICON_ITEM_HEIGHT + 11, marginBottom: 11 }}
            contentContainerStyle={{ alignItems: 'center' }}
            data={historyItems}
            renderItem={renderRecentItem}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            getItemLayout={(data, index) => ({ index, length: ICON_ITEM_HEIGHT, offset: ICON_ITEM_HEIGHT * index })}
            horizontal
          />
        </>
      )}
      <SectionHeader title="Favorite" onPress={() => console.log('press')} />
      <FlatList
        style={{ maxHeight: ITEM_HEIGHT + 11, marginBottom: 11 }}
        contentContainerStyle={{ alignItems: 'center' }}
        data={bookmarkItems}
        renderItem={renderBookmarkItem}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        getItemLayout={(data, index) => ({ index, length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index })}
        horizontal
      />
      <SectionHeader title="Recommended" onPress={() => console.log('press')} />
      <SectionList data={recommendedList} renderItem={renderBookmarkItem} />
    </View>
  );
};
export default BrowserSearch;
