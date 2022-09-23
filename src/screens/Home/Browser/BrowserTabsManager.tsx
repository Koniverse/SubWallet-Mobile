import React, { useCallback, useEffect, useState } from 'react';
import { BrowserTabsManagerProps, RootNavigationProps } from 'routes/index';
import { BrowserTab } from 'screens/Home/Browser/BrowserTab';
import { useNavigation } from '@react-navigation/native';
import useConfirmations from 'hooks/useConfirmations';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StyleProp, View } from 'react-native';
import { BrowserTabs } from 'screens/Home/Browser/BrowserTabs';

const viewContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
};

const hidingStyle: StyleProp<any> = {
  flex: 0,
  width: 0,
  height: 0,
  display: 'none',
};

function getBrowserTabsWrapperStyle(isTabsShowed: boolean): StyleProp<any> {
  if (isTabsShowed) {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  }

  return hidingStyle;
}

function getTabItemWrapperStyle(isTabActive: boolean): StyleProp<any> {
  if (isTabActive) {
    return {
      flex: 1,
    };
  }

  return hidingStyle;
}

function ConfirmationTrigger() {
  const navigation = useNavigation<RootNavigationProps>();
  const { isEmptyRequests, isDisplayConfirmation } = useConfirmations();

  useEffect(() => {
    if (isDisplayConfirmation && !isEmptyRequests) {
      navigation.navigate('ConfirmationPopup');
    }
  }, [isDisplayConfirmation, isEmptyRequests, navigation]);

  return <></>;
}

//todo: prevent reload tab when changing tab
export const BrowserTabsManager = ({ route: { params } }: BrowserTabsManagerProps) => {
  const { name: propsSiteName, url: propsSiteUrl } = params;
  const propsIsOpenTabs = !!params.isOpenTabs;
  const activeTab = useSelector((state: RootState) => state.browser.activeTab);
  const tabs = useSelector((state: RootState) => state.browser.tabs);
  const [isTabsShowed, setIsTabsShowed] = useState<boolean>(propsIsOpenTabs);
  const navigation = useNavigation<RootNavigationProps>();

  useEffect(() => {
    setIsTabsShowed(propsIsOpenTabs);
  }, [propsIsOpenTabs]);

  useEffect(() => {
    if (!tabs.length) {
      navigation.navigate('Home', { tab: 'Browser' });
    }
  }, [tabs.length, navigation]);

  const onOpenBrowserTabs = useCallback(() => {
    setIsTabsShowed(true);
  }, []);

  const onCloseBrowserTabs = useCallback(() => {
    setIsTabsShowed(false);
  }, []);

  return (
    <View style={viewContainerStyle}>
      {tabs.map(t => {
        const isTabActive = t.id === activeTab;

        return (
          <View key={t.id} style={getTabItemWrapperStyle(isTabActive)}>
            <BrowserTab
              url={isTabActive && propsSiteUrl ? propsSiteUrl : t.url}
              name={isTabActive && propsSiteName ? propsSiteName : undefined}
              tabId={t.id}
              tabsLength={tabs.length}
              onOpenBrowserTabs={onOpenBrowserTabs}
            />
          </View>
        );
      })}

      <ConfirmationTrigger />

      <View style={getBrowserTabsWrapperStyle(isTabsShowed)}>
        <BrowserTabs activeTab={activeTab} tabs={tabs} navigation={navigation} onClose={onCloseBrowserTabs} />
      </View>
    </View>
  );
};
