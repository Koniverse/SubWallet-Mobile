import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Linking, ScrollView, StyleProp } from 'react-native';
import Text from 'components/Text';
import { ActionItem } from 'components/ActionItem';
import {
  BellRinging,
  Coin,
  DiscordLogo,
  FileText,
  GitFork,
  Globe,
  GlobeHemisphereWest,
  IconProps,
  ShieldCheck,
  SignOut,
  TelegramLogo,
  TwitterLogo,
} from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';
import {
  DISCORD_URL,
  PRIVACY_AND_POLICY_URL,
  TELEGRAM_URL,
  TERMS_OF_SERVICE_URL,
  TWITTER_URL,
  WEBSITE_URL,
  WIKI_URL,
} from '../../constant';
import { useToast } from 'react-native-toast-notifications';
import VersionNumber from 'react-native-version-number';

const settingTitleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  ...FontMedium,
  paddingVertical: 12,
};

const versionAppStyle: StyleProp<any> = {
  textAlign: 'center',
  color: ColorMap.light,
  ...FontMedium,
  ...sharedStyles.mainText,
};

type settingItemType = {
  icon: ({ weight, color, size, style, mirrored }: IconProps) => JSX.Element;
  title: string;
  hasRightArrow: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export const Settings = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();
  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);
  const pinCodeEnabled = useSelector((state: RootState) => state.mobileSettings.pinCodeEnabled);
  const onPressComingSoonFeature = () => {
    toast.hideAll();
    toast.show('Coming Soon');
  };

  const settingList: settingItemType[][] = [
    [
      {
        icon: ShieldCheck,
        title: i18n.settings.security,
        hasRightArrow: true,
        onPress: () => navigation.navigate('Security'),
      },
      {
        icon: GlobeHemisphereWest,
        title: i18n.settings.language,
        hasRightArrow: true,
        onPress: onPressComingSoonFeature,
      },
      {
        icon: BellRinging,
        title: i18n.settings.notifications,
        hasRightArrow: true,
        onPress: onPressComingSoonFeature,
      },
    ],
    [
      {
        icon: GitFork,
        title: i18n.settings.networks,
        hasRightArrow: true,
        onPress: onPressComingSoonFeature,
      },
      {
        icon: Coin,
        title: i18n.settings.tokens,
        hasRightArrow: true,
        onPress: onPressComingSoonFeature,
      },
    ],
    [
      {
        icon: TelegramLogo,
        title: i18n.settings.telegram,
        hasRightArrow: true,
        onPress: () => Linking.openURL(TELEGRAM_URL),
      },
      {
        icon: TwitterLogo,
        title: i18n.settings.twitter,
        hasRightArrow: true,
        onPress: () => Linking.openURL(TWITTER_URL),
      },
      {
        icon: DiscordLogo,
        title: i18n.settings.discord,
        hasRightArrow: true,
        onPress: () => Linking.openURL(DISCORD_URL),
      },
    ],
    [
      {
        icon: Globe,
        title: i18n.settings.website,
        hasRightArrow: true,
        onPress: () => Linking.openURL(WEBSITE_URL),
      },
      {
        icon: FileText,
        title: i18n.settings.documentation,
        hasRightArrow: true,
        onPress: () => Linking.openURL(WIKI_URL),
      },
      {
        icon: FileText,
        title: i18n.settings.termOfService,
        hasRightArrow: true,
        onPress: () => Linking.openURL(TERMS_OF_SERVICE_URL),
      },
      {
        icon: FileText,
        title: i18n.settings.privacyPolicy,
        hasRightArrow: true,
        onPress: () => Linking.openURL(PRIVACY_AND_POLICY_URL),
      },
    ],
    [
      {
        icon: SignOut,
        title: i18n.settings.logout,
        hasRightArrow: true,
        onPress: () => navigation.navigate('LockScreen'),
        disabled: !pinCodeEnabled,
      },
    ],
  ];

  return (
    <SubScreenContainer title={i18n.settings.settings} navigation={navigation}>
      <>
        <ScrollView style={{ paddingHorizontal: 16, marginTop: 16, flex: 1, marginBottom: 24 }}>
          <ActionItem
            icon={ShieldCheck}
            showIcon={false}
            title={'Accounts'}
            subTitle={currentAccount ? currentAccount.name : ''}
            hasRightArrow
            paddingLeft={16}
            style={{ marginBottom: 16 }}
            onPress={() => navigation.navigate('AccountsScreen')}
          />

          {settingList[0].map(setting => (
            <ActionItem
              key={setting.title}
              style={{ marginBottom: 4 }}
              icon={setting.icon}
              title={setting.title}
              hasRightArrow={setting.hasRightArrow}
              onPress={setting.onPress}
              disabled={setting.disabled}
              color={setting.disabled ? ColorMap.disabledTextColor : ColorMap.light}
            />
          ))}

          <Text style={settingTitleStyle}>Networks & Assets</Text>

          {settingList[1].map(setting => (
            <ActionItem
              key={setting.title}
              style={{ marginBottom: 4 }}
              icon={setting.icon}
              title={setting.title}
              hasRightArrow={setting.hasRightArrow}
              onPress={setting?.onPress}
            />
          ))}

          <Text style={settingTitleStyle}>Community & Support</Text>

          {settingList[2].map(setting => (
            <ActionItem
              key={setting.title}
              style={{ marginBottom: 4 }}
              icon={setting.icon}
              title={setting.title}
              hasRightArrow={setting.hasRightArrow}
              onPress={setting.onPress}
            />
          ))}

          <Text style={settingTitleStyle}>About</Text>

          {settingList[3].map(setting => (
            <ActionItem
              key={setting.title}
              style={{ marginBottom: 4 }}
              icon={setting.icon}
              title={setting.title}
              hasRightArrow={setting.hasRightArrow}
              onPress={setting.onPress}
            />
          ))}

          {settingList[4].map(setting => (
            <ActionItem
              key={setting.title}
              style={{ marginTop: 23 }}
              icon={setting.icon}
              title={setting.title}
              hasRightArrow={setting.hasRightArrow}
              onPress={setting.onPress}
              disabled={setting.disabled}
              color={setting.disabled ? ColorMap.disabledTextColor : ColorMap.light}
            />
          ))}
        </ScrollView>
        <Text style={versionAppStyle}>{`SubWallet v${VersionNumber.appVersion}(${VersionNumber.buildVersion})`}</Text>
      </>
    </SubScreenContainer>
  );
};
