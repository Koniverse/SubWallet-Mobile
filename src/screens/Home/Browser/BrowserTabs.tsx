import React, { useCallback } from 'react';
import { FlatList, Image, ListRenderItemInfo, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Browsers, House, Plus, X } from 'phosphor-react-native';
import { closeAllTab, closeTab } from 'stores/updater';
import { getHostName } from 'utils/browser';
import { RootStackParamList } from 'routes/index';
import { BrowserSlice, BrowserSliceTab } from 'stores/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import i18n from 'utils/i18n/i18n';
import { ScreenContainer } from 'components/ScreenContainer';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { EmptyList } from 'components/EmptyList';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/BrowserTabs';

interface Props {
  activeTab: BrowserSlice['activeTab'];
  tabs: BrowserSlice['tabs'];
  onClose: () => void;
  onPressTabItem: (tab: BrowserSliceTab) => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const BrowserTabs = ({ activeTab, tabs, navigation, onClose, onPressTabItem }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const isEmptyTabs = !tabs.length;

  const onPressSearchBar = useCallback(() => {
    if (isEmptyTabs) {
      navigation.navigate('BrowserSearch', { isOpenNewTab: true });
    } else {
      navigation.navigate('BrowserSearch');
    }
  }, [navigation, isEmptyTabs]);

  const onCreateNewTab = useCallback(() => {
    navigation.navigate('BrowserSearch', { isOpenNewTab: true });
  }, [navigation]);

  const goToBrowserHome = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate('Home', { screen: 'Browser' });
    } else {
      navigation.replace('Home', { screen: 'Browser' });
    }
  }, [navigation]);

  const renderBrowserTabItem = ({ item }: ListRenderItemInfo<BrowserSliceTab>) => {
    return (
      <View style={stylesheet.tabItemWrapper}>
        <View style={stylesheet.tabItem}>
          <View style={stylesheet.tabItemHeader}>
            <Typography.Text size={'sm'} style={{ color: theme.colorTextLight1 }}>
              {getHostName(item.url)}
            </Typography.Text>
          </View>
          <View style={stylesheet.tabItemBody}>
            <View style={stylesheet.tabItemBodySpaceHolder} />
            {!!item.screenshot && <Image source={{ uri: item.screenshot }} style={stylesheet.tabItemImage} />}
          </View>
          <TouchableOpacity
            style={[stylesheet.tabItemTouchableLayer, item.id === activeTab && stylesheet.tabItemTouchableLayerActive]}
            onPress={() => onPressTabItem(item)}
          />
          <Button
            type={'ghost'}
            size={'xs'}
            icon={<Icon phosphorIcon={X} weight={'bold'} iconColor={theme['gray-5']} size={'xs'} />}
            style={stylesheet.tabItemCloseButton}
            onPress={() => closeTab(item.id)}
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <View style={stylesheet.header}>
          <TouchableOpacity
            activeOpacity={BUTTON_ACTIVE_OPACITY}
            style={stylesheet.headerSearchButton}
            onPress={onPressSearchBar}>
            <Typography.Text style={stylesheet.headerSearchButtonText}>{i18n.common.searchPlaceholder}</Typography.Text>
          </TouchableOpacity>

          <Button
            size={'xs'}
            type={'ghost'}
            style={stylesheet.headerHomeButton}
            icon={<Icon phosphorIcon={House} weight={'bold'} iconColor={theme.colorTextLight1} size={'md'} />}
            onPress={goToBrowserHome}
          />
        </View>

        {!!tabs.length && (
          <FlatList
            data={tabs}
            renderItem={renderBrowserTabItem}
            keyExtractor={item => item.id}
            numColumns={2}
            style={stylesheet.tabListContainer}
            contentContainerStyle={stylesheet.tabListContentContainer}
          />
        )}
        {!tabs.length && <EmptyList title={i18n.common.emptyBrowserTabsMessage} icon={Browsers} />}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: theme.colorBgSecondary,
          }}>
          <Button
            size={'sm'}
            type={'ghost'}
            onPress={closeAllTab}
            style={stylesheet.footerLeftButton}
            externalTextStyle={stylesheet.footerButtonText}
            disabled={isEmptyTabs}>
            {i18n.common.closeAll}
          </Button>

          <Button
            type={'ghost'}
            size={'sm'}
            icon={<Icon phosphorIcon={Plus} weight={'bold'} iconColor={theme.colorTextLight1} size={'md'} />}
            onPress={onCreateNewTab}
          />

          <Button
            size={'sm'}
            type={'ghost'}
            onPress={onClose}
            style={stylesheet.footerRightButton}
            externalTextStyle={stylesheet.footerButtonText}
            disabled={isEmptyTabs}>
            {i18n.common.done}
          </Button>
        </View>
        <SafeAreaView style={{ backgroundColor: theme.colorBgSecondary }} />
      </>
    </ScreenContainer>
  );
};
