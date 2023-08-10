import React from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { View } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { CaretRight, GlobeHemisphereWest, Image, BellSimpleRinging } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Icon, SelectItem } from 'components/design-system-ui';
import { useToast } from 'react-native-toast-notifications';

const containerStyle = { ...sharedStyles.layoutContainer, paddingTop: 16, gap: 8 };
export const GeneralSettings = () => {
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const navigation = useNavigation<RootNavigationProps>();

  const showComingSoon = () => {
    toast.hideAll();
    toast.show(i18n.notificationMessage.comingSoon);
  };

  const openLanguageModal = () => {
    navigation.navigate('Languages');
  };

  const onGoback = () => {
    navigation.dispatch(DrawerActions.openDrawer());
    navigation.goBack();
  };

  return (
    <SubScreenContainer navigation={navigation} title={i18n.header.generalSettings} onPressLeftBtn={onGoback}>
      <View style={containerStyle}>
        <SelectItem
          icon={Image}
          backgroundColor={theme['geekblue-6']}
          label={i18n.settings.walletTheme}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />

        <SelectItem
          icon={GlobeHemisphereWest}
          backgroundColor={theme['green-6']}
          label={i18n.settings.language}
          onPress={openLanguageModal}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />

        <SelectItem
          icon={BellSimpleRinging}
          backgroundColor={theme['volcano-6']}
          label={i18n.settings.notifications}
          onPress={showComingSoon}
          rightIcon={<Icon phosphorIcon={CaretRight} size={'sm'} />}
        />
      </View>
    </SubScreenContainer>
  );
};
