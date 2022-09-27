import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserTabsManagerProps, RootNavigationProps } from 'routes/index';
import { BrowserTab, BrowserTabRef } from 'screens/Home/Browser/BrowserTab';
import { useNavigation } from '@react-navigation/native';
import useConfirmations from 'hooks/useConfirmations';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StyleProp, View } from 'react-native';
import { BrowserTabs } from 'screens/Home/Browser/BrowserTabs';
import { BrowserSliceTab, SiteInfo } from 'stores/types';
import { clearAllTabScreenshots, updateActiveTab } from 'stores/updater';

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

export const BrowserTabsManager = ({ route: { params } }: BrowserTabsManagerProps) => {
  const [propSiteInfo, setPropSiteInfo] = useState<SiteInfo>({
    name: params.name || '',
    url: params.url || '',
  });
  const propsIsOpenTabs = !!params.isOpenTabs;
  const activeTab = useSelector((state: RootState) => state.browser.activeTab);
  const tabs = useSelector((state: RootState) => state.browser.tabs);
  const [isTabsShowed, setIsTabsShowed] = useState<boolean>(propsIsOpenTabs);
  const navigation = useNavigation<RootNavigationProps>();
  const currentActiveTabRef = useRef<BrowserTabRef>(null);

  useEffect(() => {
    return () => {
      // after component BrowserTabsManager is unmounted, clear all tab screenshots
      clearAllTabScreenshots();
    };
  }, []);

  useEffect(() => {
    if (params.url) {
      setPropSiteInfo({
        name: params.name || params.url,
        url: params.url,
      });
    }
  }, [params]);

  useEffect(() => {
    setIsTabsShowed(propsIsOpenTabs);
  }, [propsIsOpenTabs]);

  useEffect(() => {
    if (propSiteInfo.url) {
      currentActiveTabRef.current?.goToSite({
        url: propSiteInfo.url,
        name: propSiteInfo.name || propSiteInfo.url,
      });
      setIsTabsShowed(false);
    }
  }, [propSiteInfo]);

  const onOpenBrowserTabs = useCallback(() => {
    setIsTabsShowed(true);
  }, []);

  const onCloseBrowserTabs = useCallback(() => {
    setIsTabsShowed(false);

    const currentActiveTab = tabs.find(t => t.id === activeTab);

    if (currentActiveTab) {
      setPropSiteInfo(prev => {
        if (prev.url === currentActiveTab.url) {
          return prev;
        }

        return { name: currentActiveTab.url, url: currentActiveTab.url };
      });
    }
  }, [activeTab, tabs]);

  const onPressTabItem = useCallback(
    (tab: BrowserSliceTab) => {
      if (activeTab !== tab.id) {
        updateActiveTab(tab.id);
      }

      setPropSiteInfo(prev => {
        if (activeTab === tab.id && prev.url === tab.url) {
          return prev;
        }

        return { name: tab.url, url: tab.url };
      });

      setIsTabsShowed(false);
    },
    [activeTab],
  );

  return (
    <View style={viewContainerStyle}>
      {tabs.map(t => {
        const isTabActive = t.id === activeTab;

        return (
          <View key={t.id} style={getTabItemWrapperStyle(isTabActive)}>
            <BrowserTab
              ref={isTabActive ? currentActiveTabRef : undefined}
              tabId={t.id}
              tabsNumber={tabs.length}
              onOpenBrowserTabs={onOpenBrowserTabs}
            />
          </View>
        );
      })}

      <ConfirmationTrigger />

      <View style={getBrowserTabsWrapperStyle(isTabsShowed)}>
        <BrowserTabs
          activeTab={activeTab}
          tabs={tabs}
          navigation={navigation}
          onClose={onCloseBrowserTabs}
          onPressTabItem={onPressTabItem}
        />
      </View>
    </View>
  );
};
