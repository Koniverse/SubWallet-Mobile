import React, { useMemo, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import {
  ArrowSquareOut,
  Book,
  BookBookmark,
  BookOpen,
  CaretRight,
  Clock,
  Coin,
  DiscordLogo,
  Globe,
  GlobeHemisphereWest,
  IconProps,
  Lock,
  ShareNetwork,
  ShieldCheck,
  TelegramLogo,
  TwitterLogo,
  X,
} from 'phosphor-react-native';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import {
  DISCORD_URL,
  PRIVACY_AND_POLICY_URL,
  TELEGRAM_URL,
  TERMS_OF_SERVICE_URL,
  TWITTER_URL,
  WEBSITE_URL,
  WIKI_URL,
} from 'constants/index';
import VersionNumber from 'react-native-version-number';
import useAppLock from 'hooks/useAppLock';
import { BackgroundIcon, Button, Icon, SelectItem } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SVGImages } from 'assets/index';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

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

export const Settings = ({ navigation: drawerNavigation }: DrawerContentComponentProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const pinCodeEnabled = useSelector((state: RootState) => state.mobileSettings.pinCodeEnabled);
  const { lock } = useAppLock();
  const [hiddenCount, setHiddenCount] = useState(0);

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
          icon: BookBookmark,
          title: i18n.settings.manageAddressBook,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('ManageAddressBook'),
          backgroundColor: '#0078D9',
        },
        {
          icon: Clock,
          title: i18n.title.history,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('History', {}),
          backgroundColor: '#2595E6',
        },
        {
          icon: Clock,
          title: i18n.header.walletConnect,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('ConnectList', { isDelete: false }),
          backgroundColor: '#004BFF',
        },
      ],
      [
        {
          icon: ShareNetwork,
          title: i18n.settings.manageNetworks,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('NetworksSetting'),
          backgroundColor: '#9224E1',
        },
        {
          icon: Coin,
          title: i18n.settings.manageTokens,
          rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => navigation.navigate('CustomTokenSetting'),
          backgroundColor: '#D9A33E',
        },
      ],
      [
        {
          icon: TwitterLogo,
          title: i18n.settings.twitter,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(TWITTER_URL),
          backgroundColor: '#2595E6',
        },
        {
          icon: DiscordLogo,
          title: i18n.settings.discord,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(DISCORD_URL),
          backgroundColor: '#4E8AF2',
        },
        {
          icon: TelegramLogo,
          title: i18n.settings.telegram,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(TELEGRAM_URL),
          backgroundColor: '#005CA6',
        },
      ],
      [
        {
          icon: Globe,
          title: i18n.settings.website,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(WEBSITE_URL),
          backgroundColor: '#2595E6',
        },
        {
          icon: Book,
          title: i18n.settings.userGuide,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(WIKI_URL),
          backgroundColor: '#2DA73F',
        },
        {
          icon: BookOpen,
          title: i18n.settings.termOfService,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(TERMS_OF_SERVICE_URL),
          backgroundColor: '#D96F00',
        },
        {
          icon: BookBookmark,
          title: i18n.settings.privacyPolicy,
          rightIcon: <Icon phosphorIcon={ArrowSquareOut} size={'sm'} iconColor={theme.colorTextLight3} />,
          onPress: () => Linking.openURL(PRIVACY_AND_POLICY_URL),
          backgroundColor: '#004BFF',
        },
      ],
    ],
    [navigation, theme.colorTextLight3],
  );
  //
  // useEffect(() => {
  //   if (isEmptyAccounts) {
  //     drawerNavigation ? drawerNavigation.closeDrawer() : navigation.goBack();
  //   }
  // }, [drawerNavigation, isEmptyAccounts, navigation]);

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

          <Text style={settingTitleStyle}>{i18n.settings.networksAndTokens.toUpperCase()}</Text>

          <View style={{ gap: theme.paddingXS }}>
            {settingList[1].map(setting => (
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

          <Text style={settingTitleStyle}>{i18n.settings.aboutSubwallet.toUpperCase()}</Text>

          <View style={{ gap: theme.paddingXS }}>
            {settingList[3].map(setting => (
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

          <Button
            style={{ marginTop: 16 }}
            onPress={lock}
            disabled={!pinCodeEnabled}
            type={'secondary'}
            block
            icon={
              <Icon
                phosphorIcon={Lock}
                size={'lg'}
                weight={'fill'}
                iconColor={!pinCodeEnabled ? theme.colorTextLight5 : theme.colorWhite}
              />
            }>
            {i18n.settings.lock}
          </Button>
        </ScrollView>
        <Text
          onPress={onPressVersionNumber}
          style={versionAppStyle}>{`SubWallet v${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}</Text>
      </>
    </SubScreenContainer>
  );
};
