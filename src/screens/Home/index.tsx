import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EarningScreen from 'screens/Home/Earning';

import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Aperture, Database, Globe, Rocket, Wallet } from 'phosphor-react-native';
import { CryptoScreen } from 'screens/Home/Crypto';
import { FontMedium } from 'styles/sharedStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT, deviceWidth } from 'constants/index';
import { ColorMap } from 'styles/color';
import useCheckEmptyAccounts from 'hooks/useCheckEmptyAccounts';
import { FirstScreen } from 'screens/Home/FirstScreen';
import { CrowdloansScreen } from 'screens/Home/Crowdloans';
import { BrowserScreen } from 'screens/Home/Browser';
import { HomeStackParamList } from 'routes/home';
import NFTStackScreen from 'screens/Home/NFT/NFTStackScreen';
import withPageWrapper from 'components/pageWrapper';
import RequestCreateMasterPasswordModal from 'screens/MasterPassword/RequestCreateMasterPasswordModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { WrapperParamList } from 'routes/wrapper';
import { Settings } from 'screens/Settings';
import i18n from 'utils/i18n/i18n';
import { RootStackParamList } from 'routes/index';
import { handleTriggerDeeplinkAfterLogin } from 'utils/deeplink';
import { isFirstOpen, setIsFirstOpen } from '../../App';
import CampaignBannerModal from 'screens/Home/Crowdloans/CampaignBannerModal';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import { mmkvStore } from 'utils/storage';
import { GeneralTermModal } from 'components/Modal/GeneralTermModal';
import IntroducingModal from 'components/Modal/IntroducingModal';
import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import WarningModal from 'components/Modal/WarningModal';
import { TermAndCondition } from 'constants/termAndCondition';

interface tabbarIconColor {
  color: string;
}
const tokenTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Wallet size={24} color={color} weight={'fill'} />;
};
const nftTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Aperture size={24} color={color} weight={'fill'} />;
};
const crowdloanTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Rocket size={24} color={color} weight={'fill'} />;
};
const stakingTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Database size={24} color={color} weight={'fill'} />;
};
const browserTabbarIcon = ({ color }: tabbarIconColor) => {
  return <Globe size={24} color={color} weight={'fill'} />;
};
const getSettingsContent = (props: DrawerContentComponentProps) => {
  return <Settings {...props} />;
};
const MainScreen = ({ navigation }: NativeStackScreenProps<{}>) => {
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
        name={'Crowdloans'}
        component={withPageWrapper(CrowdloansScreen, ['crowdloan', 'price', 'chainStore', 'logoMaps'])}
        options={{
          tabBarLabel: i18n.tabName.crowdloans,
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: crowdloanTabbarIcon,
        }}
      />
      <Tab.Screen
        name={'Earning'}
        component={EarningScreen}
        listeners={{
          tabPress: () => {
            navigation.canGoBack() && navigation.popToTop();
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
      {isEmptyAccounts && <Drawer.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />}
      <Drawer.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
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
let isShowDAppWarningModal = false;

export const Home = ({ navigation }: Props) => {
  const isEmptyAccounts = useCheckEmptyAccounts();
  const { hasMasterPassword, isReady, isLocked } = useSelector((state: RootState) => state.accountState);
  const [isLoading, setLoading] = useState(true);
  const [generalTermVisible, setGeneralTermVisible] = useState<boolean>(false);
  const appNavigatorDeepLinkStatus = useRef<AppNavigatorDeepLinkStatus>(AppNavigatorDeepLinkStatus.AVAILABLE);
  const banners = useGetBannerByScreen('home');
  const firstBanner = useMemo((): CampaignBanner | undefined => banners[0], [banners]);
  const [campaignModalVisible, setCampaignModalVisible] = useState<boolean>(false);
  const [introducingModalVisible, setIntroducingModalVisible] = useState<boolean>(false);
  const [dAppStakingWarningModalVisible, setDAppStakingWarningModalVisible] = useState<boolean>(false);
  const isOpenGeneralTermFirstTime = mmkvStore.getBoolean('isOpenGeneralTermFirstTime');
  const isOpenIntroductionFirstTime = mmkvStore.getBoolean('isOpenIntroductionFirstTime');
  const isOpenDAppWarningFirstTime = mmkvStore.getBoolean('isOpenDAppWarningFirstTime');
  const language = useSelector((state: RootState) => state.settings.language);
  mmkvStore.set('generalTermContent', TermAndCondition[language as 'en' | 'vi' | 'zh' | 'ru' | 'ja']);
  useEffect(() => {
    if (isReady && isLoading) {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [isReady, isLoading]);

  useEffect(() => {
    if (isReady && !isLoading && !isLocked && isFirstOpen.current && hasMasterPassword && !isEmptyAccounts) {
      setIsFirstOpen(false);
      handleTriggerDeeplinkAfterLogin(appNavigatorDeepLinkStatus, navigation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isLoading, isLocked]);

  useEffect(() => {
    if (isShowCampaignModal) {
      return;
    }
    if (!isOpenIntroductionFirstTime) {
      return;
    }
    if (!isOpenDAppWarningFirstTime) {
      return;
    }
    if (firstBanner) {
      isShowCampaignModal = true;
      setCampaignModalVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstBanner]);

  useEffect(() => {
    if (isShowDAppWarningModal) {
      return;
    }
    if (!isOpenDAppWarningFirstTime) {
      isShowDAppWarningModal = true;
      setDAppStakingWarningModalVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpenGeneralTermFirstTime) {
      isShowCampaignModal = false;
      isShowDAppWarningModal = false;
      setGeneralTermVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpenIntroductionFirstTime) {
      isShowDAppWarningModal = false;
      setIntroducingModalVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {!isLocked && !isEmptyAccounts && !isOpenIntroductionFirstTime && (
        <IntroducingModal visible={introducingModalVisible} setVisible={setIntroducingModalVisible} />
      )}
      {!isLocked && firstBanner && isShowCampaignModal && !isEmptyAccounts && isOpenIntroductionFirstTime && (
        <CampaignBannerModal visible={campaignModalVisible} banner={firstBanner} setVisible={setCampaignModalVisible} />
      )}
      {!isLocked && !isOpenGeneralTermFirstTime && (
        <GeneralTermModal
          modalVisible={generalTermVisible}
          setVisible={setGeneralTermVisible}
          onPressAcceptBtn={onPressAcceptBtn}
          disabledOnPressBackDrop={true}
        />
      )}

      {!isLocked && !isEmptyAccounts && isShowDAppWarningModal && !isOpenDAppWarningFirstTime && (
        <WarningModal
          visible={dAppStakingWarningModalVisible}
          setVisible={setDAppStakingWarningModalVisible}
          onPressBtn={() => {
            mmkvStore.set('isOpenDAppWarningFirstTime', true);
            setDAppStakingWarningModalVisible(false);
          }}
        />
      )}
    </>
  );
};

// @ts-ignore
const styles = StyleSheet.create({
  indicatorWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
