import { useNavigation } from '@react-navigation/native';
import { _AssetType } from '@subwallet/chain-list/types';
import { ConfirmationsQueue } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationItem } from 'hooks/types';
import useCheckEmptyAccounts from 'hooks/useCheckEmptyAccounts';
import useConfirmations from 'hooks/useConfirmations';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, View } from 'react-native';
import { useSelector } from 'react-redux';
import { BrowserTabsManagerProps, RootNavigationProps } from 'routes/index';
import { BrowserTab, BrowserTabRef } from 'screens/Home/Browser/BrowserTab';
import { BrowserTabs } from 'screens/Home/Browser/BrowserTabs';
import { RootState } from 'stores/index';
import { BrowserSliceTab, SiteInfo } from 'stores/types';
import { clearAllTabScreenshots, createNewTabIfEmpty, updateActiveTab } from 'stores/updater';
import { Plug, Plugs, PlugsConnected } from 'phosphor-react-native';
import { useGetCurrentAuth } from 'hooks/auth/useGetCurrentAuth';
import { ConnectWebsiteModal } from 'components/Modal/ConnectWebsiteModal';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { funcSortByName } from 'utils/account';
import { isAccountAll } from 'utils/accountAll';
import { BackgroundIcon, Button } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

enum ConnectionStatement {
  NOT_CONNECTED = 'not-connected',
  CONNECTED = 'connected',
  PARTIAL_CONNECTED = 'partial-connected',
  DISCONNECTED = 'disconnected',
  BLOCKED = 'blocked',
}

const iconMap = {
  [ConnectionStatement.NOT_CONNECTED]: { icon: Plug, themeKey: 'gray-3' },
  [ConnectionStatement.CONNECTED]: { icon: PlugsConnected, themeKey: 'green-6' },
  [ConnectionStatement.PARTIAL_CONNECTED]: { icon: PlugsConnected, themeKey: 'colorWarning' },
  [ConnectionStatement.DISCONNECTED]: { icon: Plugs, themeKey: 'gray-3' },
  [ConnectionStatement.BLOCKED]: { icon: Plugs, themeKey: 'colorError' },
};

// todo: move to style.
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
  const isLocked = useSelector((state: RootState) => state.appState.isLocked);
  const { confirmationItems } = useConfirmations();

  useEffect(() => {
    const addTokenRequest = confirmationItems.find(item => item.type === 'addTokenRequest') as
      | undefined
      | ConfirmationItem;

    const addNetworkRequest = confirmationItems.find(item => item.type === 'addNetworkRequest') as
      | undefined
      | ConfirmationItem;

    if (addNetworkRequest) {
      return;
    }

    if (addTokenRequest) {
      const addTokenPayload = addTokenRequest.payload as ConfirmationsQueue['addTokenRequest'][0];
      if (addTokenRequest.payload) {
        navigation.navigate('ImportToken', { payload: addTokenPayload });
      } else if (addTokenPayload.payload.type === _AssetType.ERC721) {
        navigation.navigate('ImportNft', { payload: addTokenPayload });
      }

      return;
    }
  }, [navigation, isLocked, confirmationItems]);

  return <></>;
}

export const BrowserTabsManager = ({ route: { params } }: BrowserTabsManagerProps) => {
  const theme = useSubWalletTheme().swThemes;
  const [propSiteInfo, setPropSiteInfo] = useState<SiteInfo>({
    name: params?.name || '',
    url: params?.url || '',
  });
  const propsIsOpenTabs = !!params?.isOpenTabs;
  const activeTab = useSelector((state: RootState) => state.browser.activeTab);
  const tabs = useSelector((state: RootState) => state.browser.tabs);
  const [isTabsShowed, setIsTabsShowed] = useState<boolean>(propsIsOpenTabs);
  const [isConnectWebsiteModalVisible, setConnectWebsiteModalVisible] = useState<boolean>(false);
  const navigation = useNavigation<RootNavigationProps>();
  const currentActiveTabRef = useRef<BrowserTabRef>(null);
  const isEmptyAccounts = useCheckEmptyAccounts();
  const [connectionState, setConnectionState] = useState<ConnectionStatement>(ConnectionStatement.NOT_CONNECTED);
  const isAllAccount = useSelector((state: RootState) => state.accountState.isAllAccount);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const _accounts = useSelector((state: RootState) => state.accountState.accounts);

  const accounts = useMemo((): AccountJson[] => {
    const result = [..._accounts].sort(funcSortByName);
    const all = result.find(acc => isAccountAll(acc.address));

    if (all) {
      const index = result.indexOf(all);

      result.splice(index, 1);
      result.unshift(all);
    }

    return result;
  }, [_accounts]);

  const noAllAccounts = useMemo(() => {
    return accounts.filter(({ address }) => !isAccountAll(address));
  }, [accounts]);

  const currentUrl = (() => {
    if (!activeTab) {
      return undefined;
    }

    const currentTabs = tabs.find(t => t.id === activeTab);

    return currentTabs?.url;
  })();

  const currentAuth = useGetCurrentAuth(currentUrl);

  useEffect(() => {
    if (currentAuth) {
      if (!currentAuth.isAllowed) {
        setConnectionState(ConnectionStatement.BLOCKED);
      } else {
        const type = currentAuth.accountAuthType;
        const allowedMap = currentAuth.isAllowedMap;

        const filterType = (address: string) => {
          if (type === 'both') {
            return true;
          }

          const _type = type || 'substrate';

          return _type === 'substrate' ? !isEthereumAddress(address) : isEthereumAddress(address);
        };

        if (!isAllAccount) {
          const _allowedMap: Record<string, boolean> = {};

          Object.entries(allowedMap)
            .filter(([address]) => filterType(address))
            .forEach(([address, value]) => {
              _allowedMap[address] = value;
            });

          const isAllowed = _allowedMap[currentAccount?.address || ''];

          if (isAllowed === undefined) {
            setConnectionState(ConnectionStatement.NOT_CONNECTED);
          } else {
            const connectionStatus = isAllowed ? ConnectionStatement.CONNECTED : ConnectionStatement.DISCONNECTED;
            setConnectionState(connectionStatus);
          }
        } else {
          const numberAccounts = noAllAccounts.filter(({ address }) => filterType(address)).length;
          const numberAllowedAccounts = Object.entries(allowedMap)
            .filter(([address]) => filterType(address))
            .filter(([, value]) => value).length;

          if (numberAllowedAccounts === 0) {
            setConnectionState(ConnectionStatement.DISCONNECTED);
          } else {
            if (numberAllowedAccounts > 0 && numberAllowedAccounts < numberAccounts) {
              setConnectionState(ConnectionStatement.PARTIAL_CONNECTED);
            } else {
              setConnectionState(ConnectionStatement.CONNECTED);
            }
          }
        }
      }
    } else {
      setConnectionState(ConnectionStatement.NOT_CONNECTED);
    }
  }, [currentAccount?.address, currentAuth, isAllAccount, noAllAccounts]);

  useEffect(() => {
    return () => {
      // after component BrowserTabsManager is unmounted, clear all tab screenshots
      clearAllTabScreenshots();
    };
  }, []);

  useEffect(() => {
    if (isEmptyAccounts) {
      if (navigation.canGoBack()) {
        navigation.navigate('Home');
      } else {
        navigation.replace('Home');
      }
    }
  }, [navigation, isEmptyAccounts]);

  useEffect(() => {
    if (params?.url) {
      createNewTabIfEmpty(params.url);

      setPropSiteInfo({
        name: params?.name || params.url,
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
        name: propSiteInfo?.name || propSiteInfo.url,
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

  const ConnectionTrigger = (
    <Button
      type={'ghost'}
      size={'xs'}
      style={{ position: 'absolute', left: 0, top: 0 }}
      icon={
        <BackgroundIcon
          backgroundColor={theme[iconMap[connectionState].themeKey]}
          phosphorIcon={iconMap[connectionState].icon}
          shape="circle"
          size="sm"
          type="phosphor"
          weight={'fill'}
        />
      }
      onPress={() => {
        setConnectWebsiteModalVisible(true);
      }}
    />
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
              onOpenBrowserTabs={onOpenBrowserTabs}
              connectionTrigger={ConnectionTrigger}
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

      <ConnectWebsiteModal
        isBlocked={connectionState === ConnectionStatement.BLOCKED}
        isNotConnected={connectionState === ConnectionStatement.NOT_CONNECTED}
        modalVisible={isConnectWebsiteModalVisible}
        setVisible={setConnectWebsiteModalVisible}
        authInfo={currentAuth}
        url={currentUrl || ''}
      />
    </View>
  );
};
