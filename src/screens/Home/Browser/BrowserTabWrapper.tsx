import React, { useEffect } from 'react';
import { BrowserTabProps, RootNavigationProps } from 'routes/index';
import { BrowserTab } from 'screens/Home/Browser/BrowserTab';
import { useNavigation } from '@react-navigation/native';
import useConfirmations from 'hooks/useConfirmations';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StyleProp, View } from 'react-native';

function getTabItemWrapperStyle(isTabActive: boolean): StyleProp<any> {
  if (isTabActive) {
    return {
      flex: 1,
    };
  }

  return {
    flex: 0,
    width: 0,
    height: 0,
    display: 'none',
  };
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
export const BrowserTabWrapper = ({ route: { params } }: BrowserTabProps) => {
  const activeTab = useSelector((state: RootState) => state.browser.activeTab);
  const tabs = useSelector((state: RootState) => state.browser.tabs);

  return (
    <>
      {tabs.map(t => {
        const isTabActive = t.id === activeTab;

        return (
          <View key={t.id} style={getTabItemWrapperStyle(isTabActive)}>
            <BrowserTab
              url={isTabActive && params.url ? params.url : t.url}
              name={isTabActive && params.name ? params.name : undefined}
              tabId={t.id}
              tabsLength={tabs.length}
            />
          </View>
        );
      })}
      <ConfirmationTrigger />
    </>
  );
};
