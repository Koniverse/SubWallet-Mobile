import React, { useCallback, useMemo, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { DeviceEventEmitter, Linking, Platform, ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import {
  ArrowSquareOut,
  Book,
  BookBookmark,
  CaretRight,
  ChatCircleText,
  Clock,
  Coin,
  EnvelopeSimple,
  Globe,
  GlobeHemisphereWest,
  IconProps,
  Lock,
  Parachute,
  ShareNetwork,
  ShieldCheck,
  X,
} from 'phosphor-react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { WIKI_URL } from 'constants/index';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import useAppLock from 'hooks/useAppLock';
import { BackgroundIcon, Badge, Button, Icon, SelectItem } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SVGImages } from 'assets/index';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import packageJSON from '../../../package.json';
import env from 'react-native-config';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { MissionCategoryType } from 'screens/Home/Browser/MissionPool/predefined';
import { computeStatus } from 'utils/missionPools';

const settingTitleStyle: StyleProp<any> = {
  fontSize: 12,
  lineHeight: 20,
  ...FontSemiBold,
  color: 'rgba(255, 255, 255, 0.65)',
  paddingTop: 16,
  paddingBottom: 8,
};

const versionAppStyle: StyleProp<any> = {
  textAlign: 'center',
  color: ColorMap.light,
  ...FontMedium,
  ...sharedStyles.mainText,
  paddingBottom: 16,
};

type settingItemType = {
  icon: React.ElementType<IconProps>;
  title: string;
  rightIcon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  backgroundColor: string;
};
const BUNDLE_ENV = env.BUNDLE_ENV;
const bundleData =
  BUNDLE_ENV === 'PRODUCTION' ? packageJSON.bundleVersion.split('-') : packageJSON.bundleVersionStaging.split('-');
const bundleVersion =
  Platform.OS === 'android' ? bundleData[0].split('(')[1].slice(0, -1) : bundleData[1].split('(')[1].slice(0, -1);
export const Settings = ({ navigation: drawerNavigation }: DrawerContentComponentProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { lock } = useAppLock();
  const { missions } = useSelector((state: RootState) => state.missionPool);
  const activeMissionPoolNumb = useMemo(() => {
    const computedMission = missions.map(item => {
      return {
        ...item,
        status: computeStatus(item),
      };
    });

    return computedMission.filter(item => item.status === MissionCategoryType.LIVE).length;
  }, [missions]);
  const [hiddenCount, setHiddenCount] = useState(0);

  const onPressContactSupport = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('mailto:support@subwallet.app?subject=%5BMobile%20-%20In-app%20support%5D');
    } else {
      Linking.openURL('mailto:agent@subwallet.app?subject=%5BMobile%20-%20In-app%20support%5D');
    }
  }, []);

  const settingList: settingItemType[][] = useMemo(
    () => [
      [
        {
          icon: GlobeHemisphereWest,
          title: i18n.settings.generalSettings,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('GeneralSettings'),
          backgroundColor: '#D92079',
        },
        {
          icon: ShieldCheck,
          title: i18n.settings.securitySettings,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('Security'),
          backgroundColor: '#2DA73F',
        },
        {
          icon: Clock,
          title: i18n.title.history,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('History', {}),
          backgroundColor: '#2595E6',
        },
        {
          icon: Parachute,
          title: i18n.header.missionPools,
          rightIcon: (
            <View style={{ flexDirection: 'row', gap: theme.paddingSM + 2, alignItems: 'center' }}>
              {!!activeMissionPoolNumb && <Badge value={activeMissionPoolNumb} />}
              <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />
            </View>
          ),
          onPress: () => navigation.navigate('MissionPoolsByTabview', { type: 'all' }),
          backgroundColor: '#108959',
        },
      ],
      [
        {
          icon: Globe,
          title: i18n.settings.manageWebsiteAccess,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => {
            navigation.navigate('DAppAccess');
          },
          backgroundColor: '#0078d9',
        },
        {
          icon: Clock,
          title: i18n.header.walletConnect,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => {
            DeviceEventEmitter.emit('isDeleteWc', false);
            navigation.navigate('ConnectList', { isDelete: false });
          },
          backgroundColor: '#004BFF',
        },
      ],
      [
        {
          icon: ShareNetwork,
          title: i18n.settings.manageNetworks,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('NetworksSetting', {}),
          backgroundColor: '#9224E1',
        },
        {
          icon: Coin,
          title: i18n.settings.manageTokens,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('CustomTokenSetting'),
          backgroundColor: '#D9A33E',
        },
        {
          icon: BookBookmark,
          title: i18n.settings.manageAddressBook,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('ManageAddressBook'),
          backgroundColor: '#0078D9',
        },
      ],
      [
        {
          icon: EnvelopeSimple,
          title: i18n.settings.contactSupport,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: onPressContactSupport,
          backgroundColor: '#004BFF',
        },
        {
          icon: Book,
          title: i18n.settings.userGuide,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(WIKI_URL),
          backgroundColor: '#2DA73F',
        },
        {
          icon: ChatCircleText,
          title: i18n.settings.requestAFeature,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL('mailto:agent@subwallet.app?subject=%5BSubWallet%20In-app%20Feedback%5D'),
          backgroundColor: '#E6478E',
        },
        {
          icon: Clock,
          title: i18n.settings.aboutSubwallet,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('AboutSubWallet'),
          backgroundColor: '#E6478E',
        },
      ],
    ],
    [activeMissionPoolNumb, navigation, onPressContactSupport, theme.colorTextLight3, theme.paddingSM],
  );

  const onPressVersionNumber = () => {
    if (hiddenCount > 9) {
      navigation.navigate('WebViewDebugger');
    }
    setHiddenCount(hiddenCount + 1);
  };

  return (
    <SubScreenContainer
      title={i18n.header.settings}
      navigation={navigation}
      icon={<SVGImages.Logo width={24} height={24} />}
      rightIcon={X}
      onPressLeftBtn={() => (drawerNavigation ? drawerNavigation.closeDrawer() : navigation.goBack())}
      onPressRightIcon={() => (drawerNavigation ? drawerNavigation.closeDrawer() : navigation.goBack())}>
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 16, flex: 1, marginBottom: 16 }}
          contentContainerStyle={{ paddingTop: 16 }}>
          <View style={{ gap: theme.paddingXS }}>
            {settingList[0].map(setting => (
              <SelectItem
                rightIcon={setting.rightIcon}
                key={setting.title}
                label={setting.title}
                icon={setting.icon}
                backgroundColor={setting.backgroundColor}
                onPress={setting.onPress}
              />
            ))}
          </View>
          <Text style={settingTitleStyle}>{'WEBSITE ACCESS'}</Text>

          <View style={{ gap: theme.paddingXS }}>
            {settingList[1].map(setting => (
              <SelectItem
                rightIcon={setting.rightIcon}
                key={setting.title}
                label={setting.title}
                leftItemIcon={
                  setting.title === i18n.header.walletConnect ? (
                    <BackgroundIcon
                      shape={'circle'}
                      backgroundColor={setting.backgroundColor}
                      customIcon={<SVGImages.WalletConnect width={16} height={16} color={theme.colorWhite} />}
                    />
                  ) : undefined
                }
                icon={setting.icon}
                backgroundColor={setting.backgroundColor}
                onPress={setting.onPress}
              />
            ))}
          </View>

          <Text style={settingTitleStyle}>{'ASSETS & ADDRESSES'}</Text>

          <View style={{ gap: theme.paddingXS }}>
            {settingList[2].map(setting => (
              <SelectItem
                rightIcon={setting.rightIcon}
                key={setting.title}
                label={setting.title}
                icon={setting.icon}
                backgroundColor={setting.backgroundColor}
                onPress={setting.onPress}
              />
            ))}
          </View>

          <Text style={settingTitleStyle}>{i18n.settings.communityAndSupport.toUpperCase()}</Text>

          <View style={{ gap: theme.paddingXS }}>
            {settingList[3].map(setting => (
              <SelectItem
                leftItemIcon={
                  setting.title === 'About SubWallet' ? (
                    <SVGImages.SubWalletCircleLogo width={24} height={24} color={theme.colorWhite} />
                  ) : undefined
                }
                rightIcon={setting.rightIcon}
                key={setting.title}
                label={setting.title}
                icon={setting.icon}
                backgroundColor={setting.backgroundColor}
                onPress={setting.onPress}
              />
            ))}
          </View>

          <Button
            style={{ marginTop: 16 }}
            onPress={lock}
            type={'secondary'}
            block
            icon={<Icon phosphorIcon={Lock} size={'lg'} weight={'fill'} iconColor={theme.colorWhite} />}>
            {i18n.settings.lock}
          </Button>
        </ScrollView>
        <Text
          onPress={onPressVersionNumber}
          style={versionAppStyle}>{`SubWallet v${getVersion()} (${getBuildNumber()}) b-${bundleVersion}`}</Text>
      </>
    </SubScreenContainer>
  );
};
