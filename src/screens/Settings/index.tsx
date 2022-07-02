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
import i18n from 'utils/i18n/i18n';

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
        title: i18n.settings.security,
        hasRightArrow: true,
        onPress: () => navigation.navigate('Security'),
      },
      {
        icon: GlobeHemisphereWest,
        title: i18n.settings.languages,
        hasRightArrow: true,
        onPress: () => navigation.navigate('Languages'),
      },
      {
        icon: BellRinging,
        title: i18n.settings.notifications,
        hasRightArrow: true,
      },
    ],
    [
      {
        icon: GitFork,
        title: i18n.settings.networks,
        hasRightArrow: true,
      },
      {
        icon: Coin,
        title: i18n.settings.manageEvmTokens,
        hasRightArrow: true,
      },
    ],
    [
      {
        icon: TelegramLogo,
        title: i18n.settings.telegram,
        hasRightArrow: true,
      },
      {
        icon: TwitterLogo,
        title: i18n.settings.twitter,
        hasRightArrow: true,
      },
      {
        icon: DiscordLogo,
        title: i18n.settings.discord,
        hasRightArrow: true,
      },
    ],
    [
      {
        icon: Globe,
        title: i18n.settings.website,
        hasRightArrow: true,
      },
      {
        icon: FileText,
        title: i18n.settings.documentation,
        hasRightArrow: true,
      },
      {
        icon: FileText,
        title: i18n.settings.termOfService,
        hasRightArrow: true,
      },
      {
        icon: FileText,
        title: i18n.settings.privacyPolicy,
        hasRightArrow: true,
      },
    ],
    [
      {
        icon: SignOut,
        title: i18n.settings.logout,
        hasRightArrow: true,
      },
    ],
  ];

  return (
    <SubScreenContainer title={i18n.settings.settings} navigation={navigation}>
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
