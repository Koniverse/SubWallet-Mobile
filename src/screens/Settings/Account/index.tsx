import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { BackgroundIcon, Icon, SelectItem } from 'components/design-system-ui';
import { CaretRight, CornersOut, Icon as IconType, Strategy } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { RootNavigationProps } from 'routes/index';
import { useNavigation } from '@react-navigation/native';
import { SVGImages } from 'assets/index';
import { useToast } from 'react-native-toast-notifications';

type SettingItemType = {
  key: string;
  leftIcon: IconType;
  leftIconBgColor: string;
  rightIcon: React.ReactNode;
  title: string;
  onPress?: () => void;
  isHidden?: boolean;
};

const AccountSettings = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const { show, hideAll } = useToast();

  const onPressMigrate = () => navigation.navigate('MigrateAccount', {});

  const onPressSplit = () => {
    hideAll();
    show(i18n.notificationMessage.comingSoon);
  };

  const accountSettingList: SettingItemType[] = [
    {
      key: 'migrate-account',
      leftIcon: Strategy,
      title: 'Migrate to unified account',
      rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme['gray-5']} />,
      onPress: onPressMigrate,
      leftIconBgColor: '#004BFF',
    },
    {
      key: 'split-account',
      leftIcon: CornersOut,
      title: 'Split unified account',
      rightIcon: <Icon phosphorIcon={CaretRight} size={'sm'} iconColor={theme['gray-5']} />,
      onPress: onPressSplit,
      leftIconBgColor: '#d84a1b',
    },
  ];

  return (
    <ContainerWithSubHeader title={'Account settings'} onPressBack={() => navigation.goBack()}>
      <ScrollView style={{ paddingHorizontal: 16, flex: 1, marginVertical: 16 }}>
        {/*<Typography.Text style={styles.settingTitle}>{'WEBSITE ACCESS'}</Typography.Text>*/}

        <View style={{ gap: theme.paddingXS }}>
          {accountSettingList.map(setting => (
            <SelectItem
              rightIcon={setting.rightIcon}
              key={setting.title}
              label={setting.title}
              leftItemIcon={
                setting.title === i18n.header.walletConnect ? (
                  <BackgroundIcon
                    shape={'circle'}
                    backgroundColor={setting.leftIconBgColor}
                    customIcon={<SVGImages.WalletConnect width={16} height={16} color={theme.colorWhite} />}
                  />
                ) : undefined
              }
              icon={setting.leftIcon}
              backgroundColor={setting.leftIconBgColor}
              onPress={setting.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </ContainerWithSubHeader>
  );
};

export default AccountSettings;
