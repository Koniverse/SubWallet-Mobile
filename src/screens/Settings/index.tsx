import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleProp, Text } from 'react-native';
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
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { RootNavigationProps } from 'types/routes';
import i18n from "utils/i18n/i18n";

const settingTitleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  ...FontMedium,
  paddingVertical: 12,
};

export const Settings = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    accounts: { currentAccount },
  } = useSelector((state: RootState) => state);

  const settingList = [
    [
      {
        icon: ShieldCheck,
        title: 'Security',
        hasRightArrow: true,
        onPress: () => navigation.navigate('Security'),
      },
      {
        icon: GlobeHemisphereWest,
        title: 'Languages',
        hasRightArrow: true,
        onPress: () => navigation.navigate('Languages'),
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

  return (
    <SubScreenContainer title={i18n.settings} navigation={navigation}>
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 16, flex: 1, marginBottom: 45 }}>
        <ActionItem
          icon={ShieldCheck}
          showIcon={false}
          title={'Account'}
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
          />
        ))}

        <Text style={settingTitleStyle}>Network & Assets</Text>

        {settingList[1].map(setting => (
          <ActionItem
            key={setting.title}
            style={{ marginBottom: 4 }}
            icon={setting.icon}
            title={setting.title}
            hasRightArrow={setting.hasRightArrow}
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
          />
        ))}

        {settingList[4].map(setting => (
          <ActionItem
            key={setting.title}
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
