import React, { useCallback } from 'react';
import { Image, ScrollView, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'components/IconButton';
import { Plus, X } from 'phosphor-react-native';
import { closeAllTab, closeTab } from 'stores/updater';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { getHostName } from 'utils/browser';
import { RootStackParamList } from 'routes/index';
import { BrowserSlice, BrowserSliceTab } from 'stores/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'components/Button';
import i18n from 'utils/i18n/i18n';
import { BrowserHeader } from 'screens/Home/Browser/Shared/BrowserHeader';
import { ScreenContainer } from 'components/ScreenContainer';
import { DEVICE } from '../../../constant';

interface Props {
  activeTab: BrowserSlice['activeTab'];
  tabs: BrowserSlice['tabs'];
  onClose: () => void;
  onPressTabItem: (tab: BrowserSliceTab) => void;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const tabItemStyle: StyleProp<any> = {
  marginBottom: 20,
  position: 'relative',
};

const tabItemHeaderStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: ColorMap.dark2,
  height: 32,
  paddingHorizontal: 14,
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
};

const tabItemBodyStyle: StyleProp<any> = {
  height: 128,
  backgroundColor: ColorMap.light,
  borderBottomLeftRadius: 5,
  borderBottomRightRadius: 5,
  position: 'relative',
  overflow: 'hidden',
};

const tabScreenshotStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  resizeMode: 'cover',
  paddingTop: DEVICE.height - 242,
};

const tabItemTitleStyle: StyleProp<any> = {
  paddingLeft: 8,
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const bottomTabBarWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  borderTopWidth: 1,
  borderTopColor: ColorMap.dark2,
  paddingHorizontal: 16,
  paddingVertical: 4,
};

const cancelButtonStyle: StyleProp<any> = { width: 40, height: 40, position: 'absolute', right: -4, top: -4 };

function getTabItemOverlayStyle(isActive: boolean): StyleProp<any> {
  const style: StyleProp<any> = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    borderRadius: 5,
  };

  if (isActive) {
    style.borderWidth = 1;
    style.borderColor = ColorMap.secondary;
  }

  return style;
}

const renderBrowserTabItem = (
  item: BrowserSliceTab,
  activeTab: string | null,
  onPressItem: (tab: BrowserSliceTab) => void,
) => {
  return (
    <View key={item.id} style={tabItemStyle}>
      <View style={tabItemHeaderStyle}>
        <Image
          source={{ uri: `https://icons.duckduckgo.com/ip2/${getHostName(item.url)}.ico`, width: 16, height: 16 }}
        />
        <Text style={tabItemTitleStyle}>{getHostName(item.url)}</Text>
      </View>
      <View style={tabItemBodyStyle}>
        {!!item.screenshot && <Image source={{ uri: item.screenshot }} style={tabScreenshotStyle} />}
      </View>
      <TouchableOpacity style={getTabItemOverlayStyle(item.id === activeTab)} onPress={() => onPressItem(item)} />
      <IconButton
        icon={X}
        size={16}
        color={ColorMap.disabled}
        style={cancelButtonStyle}
        onPress={() => closeTab(item.id)}
      />
    </View>
  );
};

//todo: take screenshot of site to make tab thumbnail
export const BrowserTabs = ({ activeTab, tabs, navigation, onClose, onPressTabItem }: Props) => {
  const onPressSearchBar = useCallback(() => {
    navigation.navigate('BrowserSearch');
  }, [navigation]);

  const onCreateNewTab = useCallback(() => {
    navigation.navigate('BrowserSearch', { isOpenNewTab: true });
  }, [navigation]);

  return (
    <ScreenContainer>
      <>
        <BrowserHeader onPressSearchBar={onPressSearchBar} isShowTabNumber={false} />
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 20 }}>
          {tabs.map(t => renderBrowserTabItem(t, activeTab, onPressTabItem))}
        </ScrollView>
        <View style={bottomTabBarWrapperStyle}>
          <Button
            title={i18n.common.closeAll}
            onPress={() => closeAllTab()}
            color={ColorMap.light}
            textStyle={{ ...FontMedium }}
          />

          <IconButton icon={Plus} size={24} onPress={onCreateNewTab} />

          <Button title={i18n.common.done} onPress={onClose} color={ColorMap.light} textStyle={{ ...FontMedium }} />
        </View>
      </>
    </ScreenContainer>
  );
};
