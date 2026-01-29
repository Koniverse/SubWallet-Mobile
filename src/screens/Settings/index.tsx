import React, { useCallback, useMemo, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { DeviceEventEmitter, Linking, Platform, ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import {
  ArrowSquareOutIcon,
  BookIcon,
  BookBookmarkIcon,
  CaretRightIcon,
  ChatCircleTextIcon,
  ClockIcon,
  CoinIcon,
  EnvelopeSimpleIcon,
  GlobeIcon,
  GlobeHemisphereWestIcon,
  IconProps,
  LockIcon,
  RocketIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  UserCircleGearIcon,
  XIcon,
} from 'phosphor-react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { WIKI_URL } from 'constants/index';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import useAppLock from 'hooks/useAppLock';
import { BackgroundIcon, Button, Icon, SelectItem } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SVGImages } from 'assets/index';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import packageJSON from '../../../package.json';
import env from 'react-native-config';

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
  const [hiddenCount, setHiddenCount] = useState(0);

  const onPressContactSupport = useCallback(() => {
    Linking.openURL('subwallet://browser?url=https://support.subwallet.app/');
  }, []);

  const settingList: settingItemType[][] = useMemo(
    () => [
      [
        {
          icon: GlobeHemisphereWestIcon,
          title: i18n.settings.generalSettings,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('GeneralSettings'),
          backgroundColor: '#D92079',
        },
        {
          icon: ShieldCheckIcon,
          title: i18n.settings.securitySettings,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('Security'),
          backgroundColor: '#2DA73F',
        },
        {
          icon: UserCircleGearIcon,
          title: i18n.settings.accountSettings,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('AccountSettings'),
          backgroundColor: '#B44EF2',
        },
        {
          icon: ClockIcon,
          title: i18n.title.history,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('History', {}),
          backgroundColor: '#2595E6',
        },
        {
          icon: RocketIcon,
          title: i18n.tabName.crowdloans,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('Crowdloans'),
          backgroundColor: '#15B776',
        },
      ],
      [
        {
          icon: GlobeIcon,
          title: i18n.settings.manageWebsiteAccess,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => {
            navigation.navigate('DAppAccess');
          },
          backgroundColor: '#0078d9',
        },
        {
          icon: ClockIcon,
          title: i18n.header.walletConnect,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => {
            DeviceEventEmitter.emit('isDeleteWc', false);
            navigation.navigate('ConnectList', { isDelete: false });
          },
          backgroundColor: '#004BFF',
        },
      ],
      [
        {
          icon: ShareNetworkIcon,
          title: i18n.settings.manageNetworks,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('NetworksSetting', {}),
          backgroundColor: '#9224E1',
        },
        {
          icon: CoinIcon,
          title: i18n.settings.manageTokens,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('CustomTokenSetting'),
          backgroundColor: '#D9A33E',
        },
        {
          icon: BookBookmarkIcon,
          title: i18n.settings.manageAddressBook,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('ManageAddressBook'),
          backgroundColor: '#0078D9',
        },
      ],
      [
        {
          icon: EnvelopeSimpleIcon,
          title: i18n.settings.contactSupport,
          rightIcon: <Icon phosphorIcon={ArrowSquareOutIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: onPressContactSupport,
          backgroundColor: '#004BFF',
        },
        {
          icon: BookIcon,
          title: i18n.settings.userGuide,
          rightIcon: <Icon phosphorIcon={ArrowSquareOutIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => Linking.openURL(WIKI_URL),
          backgroundColor: '#2DA73F',
        },
        {
          icon: ChatCircleTextIcon,
          title: i18n.settings.requestAFeature,
          rightIcon: <Icon phosphorIcon={ArrowSquareOutIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => Linking.openURL('mailto:agent@subwallet.app?subject=%5BSubWallet%20In-app%20Feedback%5D'),
          backgroundColor: '#E6478E',
        },
        {
          icon: ClockIcon,
          title: i18n.settings.aboutSubwallet,
          rightIcon: <Icon phosphorIcon={CaretRightIcon} size={'sm'} iconColor={theme['gray-5']} />,
          onPress: () => navigation.navigate('AboutSubWallet'),
          backgroundColor: '#E6478E',
        },
      ],
    ],
    [navigation, onPressContactSupport, theme],
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
      rightIcon={XIcon}
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
            icon={<Icon phosphorIcon={LockIcon} size={'lg'} weight={'fill'} iconColor={theme.colorWhite} />}>
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
