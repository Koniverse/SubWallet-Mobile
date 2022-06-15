import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, Text, View } from 'react-native';
import { ActionItem } from 'components/ActionItem';
import {
  BellRinging,
  Coin,
  DiscordLogo,
  FileText,
  GitFork,
  Globe,
  GlobeHemisphereWest,
  ShieldCheck,
  SignOut,
  TelegramLogo,
  TwitterLogo,
} from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

const SETTINGS_LIST = [
  [
    {
      icon: ShieldCheck,
      title: 'Security',
      hasRightArrow: true,
    },
    {
      icon: GlobeHemisphereWest,
      title: 'Languages',
      hasRightArrow: true,
    },
    {
      icon: BellRinging,
      title: 'Notifications',
      hasRightArrow: true,
    },
  ],
  [
    {
      icon: GitFork,
      title: 'Networks',
      hasRightArrow: true,
    },
    {
      icon: Coin,
      title: 'Manage EVM Tokens',
      hasRightArrow: true,
    },
  ],
  [
    {
      icon: TelegramLogo,
      title: 'Telegram',
      hasRightArrow: true,
    },
    {
      icon: TwitterLogo,
      title: 'Twitter',
      hasRightArrow: true,
    },
    {
      icon: DiscordLogo,
      title: 'Discord',
      hasRightArrow: true,
    },
  ],
  [
    {
      icon: Globe,
      title: 'Website',
      hasRightArrow: true,
    },
    {
      icon: FileText,
      title: 'Documentation',
      hasRightArrow: true,
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      hasRightArrow: true,
    },
    {
      icon: FileText,
      title: 'Privacy Policy',
      hasRightArrow: true,
    },
  ],
  [
    {
      icon: SignOut,
      title: 'Logout',
      hasRightArrow: true,
    },
  ],
];

export const Settings = () => {
  const navigation = useNavigation();

  return (
    <SubScreenContainer title={'Settings'} navigation={navigation}>
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 16, flex: 1, marginBottom: 45 }}>
        <ActionItem
          icon={ShieldCheck}
          showIcon={false}
          title={'Account'}
          subTitle={'SubWallet 01'}
          hasRightArrow
          paddingLeft={16}
          style={{ marginBottom: 16 }}
        />

        {SETTINGS_LIST[0].map(setting => (
          <ActionItem
            style={{ marginBottom: 4 }}
            icon={setting.icon}
            title={setting.title}
            hasRightArrow={setting.hasRightArrow}
          />
        ))}

        <Text style={{ ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium, paddingVertical: 12 }}>
          Network & Assets
        </Text>

        {SETTINGS_LIST[1].map(setting => (
          <ActionItem
            style={{ marginBottom: 4 }}
            icon={setting.icon}
            title={setting.title}
            hasRightArrow={setting.hasRightArrow}
          />
        ))}

        <Text style={{ ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium, paddingVertical: 12 }}>
          Community & Support
        </Text>

        {SETTINGS_LIST[2].map(setting => (
          <ActionItem
            style={{ marginBottom: 4 }}
            icon={setting.icon}
            title={setting.title}
            hasRightArrow={setting.hasRightArrow}
          />
        ))}

        <Text style={{ ...sharedStyles.mainText, color: ColorMap.disabled, ...FontMedium, paddingVertical: 12 }}>
          About
        </Text>

        {SETTINGS_LIST[3].map(setting => (
          <ActionItem
            style={{ marginBottom: 4 }}
            icon={setting.icon}
            title={setting.title}
            hasRightArrow={setting.hasRightArrow}
          />
        ))}

        {SETTINGS_LIST[4].map(setting => (
          <ActionItem
            style={{ marginTop: 23, marginBottom: 44 }}
            icon={setting.icon}
            title={setting.title}
            hasRightArrow={setting.hasRightArrow}
          />
        ))}
      </ScrollView>
    </SubScreenContainer>
  );
};
