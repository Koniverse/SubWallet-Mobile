import React, { ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EarningScreen from 'screens/Home/Earning';

import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Aperture, Globe, Parachute, Vault, Wallet } from 'phosphor-react-native';
import { CryptoScreen } from 'screens/Home/Crypto';
import { FontMedium } from 'styles/sharedStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT, deviceWidth } from 'constants/index';
import { ColorMap } from 'styles/color';
import useCheckEmptyAccounts from 'hooks/useCheckEmptyAccounts';
import { FirstScreen } from 'screens/Home/FirstScreen';
import { BrowserScreen } from 'screens/Home/Browser';
import { HomeStackParamList } from 'routes/home';
import NFTStackScreen from 'screens/Home/NFT/NFTStackScreen';
import RequestCreateMasterPasswordModal from 'screens/MasterPassword/RequestCreateMasterPasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { WrapperParamList } from 'routes/wrapper';
import { Settings } from 'screens/Settings';
import i18n from 'utils/i18n/i18n';
import { RootStackParamList } from 'routes/index';
import { handleTriggerDeeplinkAfterLogin } from 'utils/deeplink';
import { isHandleDeeplinkPromise, setIsHandleDeeplinkPromise } from '../../App';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import { mmkvStore } from 'utils/storage';
import { GeneralTermModal } from 'components/Modal/GeneralTermModal';
import { TermAndCondition } from 'constants/termAndCondition';
import { RemindBackupModal } from 'components/Modal/RemindBackupModal';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { useIsFocused } from '@react-navigation/native';
import { updateMktCampaignStatus } from 'stores/AppState';
import { MissionPoolsByTabview } from 'screens/Home/Browser/MissionPool';
import { computeStatus } from 'utils/missionPools';
import { MissionPoolType } from 'screens/Home/Browser/MissionPool/predefined';
import withPageWrapper from 'components/pageWrapper';
import { NoticeModal } from 'components/Modal/NoticeModal';

interface tabbarIconColor {
  color: string;
}
const tokenTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Wallet size={24} color={color} weight={'fill'} />;
};
const nftTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Aperture size={24} color={color} weight={'fill'} />;
};
const missionPoolTabBarIcon = ({ color }: tabbarIconColor) => {
  return <Parachute size={24} color={color} weight={'fill'} />;
};
const stakingTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Vault size={24} color={color} weight={'fill'} />;
};
const browserTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Globe size={24} color={color} weight={'fill'} />;
};
const getSettingsContent = (props: DrawerContentComponentProps) => {
  return <Settings {...props} />;
};

const MissionPoolScreen = (props: JSX.IntrinsicAttributes) => {
  return withPageWrapper(MissionPoolsByTabview as ComponentType, ['missionPool'])(props);
};

const MainScreen = ({ navigation }: NativeStackScreenProps<{}>) => {
  console.log('test');
  const Tab = createBottomTabNavigator<HomeStackParamList>();
  const insets = useSafeAreaInsets();
  const theme = useSubWalletTheme().swThemes;
  const { isShowBuyToken } = useShowBuyToken();
  const tabbarButtonStyle = (props: BottomTabBarButtonProps) => {
    let customStyle = {
      flexDirection: 'column',
      // opacity: !props.accessibilityState?.selected ? 0.2 : 1,
    };
    if (props.accessibilityState?.selected) {
      customStyle = {
        ...customStyle,
        // @ts-ignore
        borderTopWidth: 2,
        borderTopColor: 'transparent',
        marginTop: -2,
      };
    }
    // @ts-ignore
    props.style = [[...props.style], customStyle];
    return <TouchableOpacity {...props} activeOpacity={1} />;
  };
  const storedLiveMissionPools = useMemo(() => {
    try {
      const result = JSON.parse(mmkvStore.getString('storedLiveMissionPools') || '[]');
      return result;
    } catch (e) {
      return [];
    }
  }, []);
  const [missionPoolIds, setMissionPoolIds] = useState<number[]>(storedLiveMissionPools);

  const { missions } = useSelector((state: RootState) => state.missionPool);
  const activeMissionPool = useMemo(() => {
    const computedMission =
      missions && missions.length
        ? missions.map(item => {
            return {
              ...item,
              status: computeStatus(item),
            };
          })
        : [];

    return computedMission.filter(item => item.status === MissionPoolType.LIVE);
  }, [missions]);

  const activeMissionPoolNumb = useMemo(() => {
    return activeMissionPool.map(item => item.id).filter(i => !missionPoolIds.includes(i)).length;
  }, [activeMissionPool, missionPoolIds]);

  return (
    <Tab.Navigator
      initialRouteName={'Tokens'}
      screenOptions={{
        headerShown: false,
        tabBarButton: tabbarButtonStyle,
        tabBarIconStyle: {
          marginTop: 10,
        },
        tabBarLabelStyle: {
          paddingTop: 2,
          paddingBottom: insets.bottom ? insets.bottom - 12 : 8,
          fontSize: 10,
          lineHeight: 18,
          ...FontMedium,
        },
        tabBarStyle: {
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: theme.colorBgSecondary,
          borderTopWidth: 1,
          paddingLeft: 16,
          paddingRight: 16,
          borderTopColor: theme.colorBgBorder,
          height: BOTTOM_BAR_HEIGHT + (insets.bottom ? insets.bottom - 15 : insets.bottom),
        },
        tabBarActiveTintColor: ColorMap.light,
        tabBarInactiveTintColor: '#777777',
      }}>
      <Tab.Screen
        name={'Tokens'}
        component={CryptoScreen}
        options={{
          tabBarLabel: i18n.tabName.tokens,
          tabBarIcon: tokenTabbarIcon,
          freezeOnBlur: true,
        }}
      />
      <Tab.Screen
        name={'NFTs'}
        component={NFTStackScreen}
        options={{
          tabBarLabel: i18n.tabName.nfts,
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: nftTabbarIcon,
        }}
      />
      <Tab.Screen
        name={'Earning'}
        component={EarningScreen}
        listeners={{
          tabPress: () => {
            navigation.popToTop();
          },
        }}
        options={{
          tabBarLabel: i18n.tabName.earning,
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: stakingTabbarIcon,
        }}
      />
      {isShowBuyToken && (
        <Tab.Screen
          name={'Browser'}
          component={BrowserScreen}
          options={{
            tabBarLabel: i18n.tabName.browser,
            tabBarIcon: browserTabbarIcon,
          }}
        />
      )}
      <Tab.Screen
        name={'MissionPools'}
        initialParams={{ type: 'all' }}
        listeners={() => ({
          tabPress: () => {
            const missionPoolActiveIds = activeMissionPool.map(item => item.id);
            setMissionPoolIds(missionPoolActiveIds);
            mmkvStore.set('storedLiveMissionPools', JSON.stringify(missionPoolActiveIds));
          },
        })}
        component={MissionPoolScreen}
        options={{
          tabBarLabel: 'Missions',
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: missionPoolTabBarIcon,
          tabBarBadge: activeMissionPoolNumb === 0 ? undefined : activeMissionPoolNumb,
          tabBarBadgeStyle: {
            top: Platform.OS === 'ios' ? 0 : 9,
            minWidth: 14,
            maxHeight: 14,
            borderRadius: 7,
            fontSize: 10,
            lineHeight: 13,
            alignSelf: undefined,
            backgroundColor: theme.colorError,
          },
        }}
      />
    </Tab.Navigator>
  );
};

const Wrapper = () => {
  const isEmptyAccounts = useCheckEmptyAccounts();
  const Drawer = createDrawerNavigator<WrapperParamList>();
  return (
    <Drawer.Navigator
      drawerContent={getSettingsContent}
      screenOptions={{
        drawerStyle: {
          width: deviceWidth,
        },
        drawerType: 'front',
        swipeEnabled: false,
      }}>
      {isEmptyAccounts ? (
        <Drawer.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
      ) : (
        <Drawer.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
      )}
    </Drawer.Navigator>
  );
};
interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export enum AppNavigatorDeepLinkStatus {
  AVAILABLE = 'available',
  BLOCK = 'block',
  RESET = 'reset',
}

let isShowCampaignModal = false;
export const isShowRemindBackupModal = { current: false };

export function setIsShowRemindBackupModal(value: boolean) {
  isShowRemindBackupModal.current = value;
}

export const Home = ({ navigation }: Props) => {
  const isEmptyAccounts = useCheckEmptyAccounts();
  const { hasMasterPassword, isReady, isLocked, accounts } = useSelector((state: RootState) => state.accountState);
  const { currentRoute } = useSelector((state: RootState) => state.settings);
  const [isLoading, setLoading] = useState(true);
  const [generalTermVisible, setGeneralTermVisible] = useState<boolean>(false);
  const appNavigatorDeepLinkStatus = useRef<AppNavigatorDeepLinkStatus>(AppNavigatorDeepLinkStatus.AVAILABLE);
  const isOpenGeneralTermFirstTime = mmkvStore.getBoolean('isOpenGeneralTermFirstTime');
  const language = useSelector((state: RootState) => state.settings.language);
  mmkvStore.set('generalTermContent', TermAndCondition[language as 'en' | 'vi' | 'zh' | 'ru' | 'ja']);
  const storedRemindBackupTimeout = mmkvStore.getNumber('storedRemindBackupTimeout');
  const lastTimeLogin = mmkvStore.getNumber('lastTimeLogin');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [noticeModalVisible, setNoticeModalVisible] = useState<boolean>(false);
  const isOpenedNoticeModal = mmkvStore.getBoolean('isOpenedNoticeModal');
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const needMigrate = useMemo(
    () =>
      !!accounts
        .filter(acc => acc.address !== ALL_ACCOUNT_KEY && !acc.isExternal && !acc.isInjected && !acc.pendingMigrate)
        .filter(acc => !acc.isMasterPassword).length || currentRoute?.name === 'MigratePassword',
    [accounts, currentRoute?.name],
  );

  useEffect(() => {
    if (isReady && isLoading) {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [isReady, isLoading]);

  useEffect(() => {
    const readyHandleDeeplink =
      isReady && !isLoading && !isLocked && hasMasterPassword && !isEmptyAccounts && !needMigrate;
    if (readyHandleDeeplink && isHandleDeeplinkPromise.current) {
      handleTriggerDeeplinkAfterLogin(appNavigatorDeepLinkStatus, navigation);
      setIsHandleDeeplinkPromise(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isLoading, isLocked, needMigrate]);

  useEffect(() => {
    if (isShowCampaignModal) {
      return;
    }
  }, []);

  useEffect(() => {
    if (!isOpenGeneralTermFirstTime) {
      isShowCampaignModal = false;
      setGeneralTermVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isNeedShowNoticeModal = Platform.OS === 'ios' && parseFloat(Platform.Version) < 16.4;
    if (!isLocked && lastTimeLogin && storedRemindBackupTimeout) {
      if (Date.now() - lastTimeLogin > storedRemindBackupTimeout) {
        setModalVisible(true);
        dispatch(updateMktCampaignStatus(false));
      } else if (isNeedShowNoticeModal) {
        setNoticeModalVisible(true);
        dispatch(updateMktCampaignStatus(false));
      } else {
        dispatch(updateMktCampaignStatus(true));
      }
    }
  }, [dispatch, isLocked, lastTimeLogin, storedRemindBackupTimeout]);

  const onPressAcceptBtn = () => {
    mmkvStore.set('isOpenGeneralTermFirstTime', true);
    setGeneralTermVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator indicatorColor="white" size={30} />
      </View>
    );
  }

  return (
    <>
      <Wrapper />

      {!isLocked && <RequestCreateMasterPasswordModal visible={!hasMasterPassword && !isEmptyAccounts} />}
      {!isLocked && !isOpenGeneralTermFirstTime && !needMigrate && (
        <GeneralTermModal
          modalVisible={generalTermVisible}
          setVisible={setGeneralTermVisible}
          onPressAcceptBtn={onPressAcceptBtn}
          disabledOnPressBackDrop={true}
        />
      )}
      {!isEmptyAccounts && !needMigrate && isFocused && (
        <RemindBackupModal modalVisible={modalVisible} setVisible={setModalVisible} />
      )}

      {!isEmptyAccounts && !isOpenedNoticeModal && !needMigrate && isFocused && !isShowRemindBackupModal.current && (
        <NoticeModal modalVisible={noticeModalVisible} setVisible={setNoticeModalVisible} />
      )}
    </>
  );
};

// @ts-ignore
const styles = StyleSheet.create({
  indicatorWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
